import { ArkErrors } from 'arktype'

import { Table } from '../../table.js'
import { DatabaseIntrospector } from '../../types/database-introspector.js'
import { getExcludeTables } from '../shared/get-exclude-tables.js'

const query = (excludeTables: string[]) => `
WITH primary_keys AS (
	SELECT
		kcu.table_name AS table_name,
		kcu.column_name AS column_name
	FROM
		information_schema.table_constraints tco
		JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tco.constraint_name
			AND kcu.constraint_schema = tco.constraint_schema
			AND kcu.constraint_name = tco.constraint_name
	WHERE
		tco.constraint_type = 'PRIMARY KEY'
	ORDER BY
		kcu.table_schema,
		kcu.table_name
),
foreign_key_relationships AS (
	SELECT
		tc.table_name AS "tableName",
		kcu.column_name AS "columnName",
		ccu.table_name AS "foreignTableName",
		ccu.column_name AS "foreignColumnName",
		rc.update_rule AS "onUpdate",
		rc.delete_rule AS "onDelete"
	FROM
		information_schema.table_constraints AS tc
		JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
			AND tc.table_schema = kcu.table_schema
		JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
			AND ccu.table_schema = tc.table_schema
		JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
			AND rc.constraint_schema = 'public'
	WHERE
		tc.constraint_type = 'FOREIGN KEY'
	ORDER BY
		tc.table_name ASC
),
cols AS (
	SELECT
		cols.table_name AS "tableName",
		UPPER(data_type) AS "dataType",
		cols.is_nullable = 'YES' AS "isNullable",
		cols.column_name AS "columnName",
		count(foreign_key_relationships.*) >= 1 AS "isForeignKey",
		cols.column_default AS "defaultValue",
		COALESCE(cols.column_default IS NOT NULL,
			FALSE) AS "hasDefaultValue",
		COALESCE(tc.constraint_type = 'UNIQUE',
			FALSE) AS "isUnique",
		COALESCE(cols.column_default LIKE 'nextval%',
			FALSE) AS "isAutoIncrementing",
		COALESCE(pk.column_name IS NOT NULL,
			FALSE) AS "isPrimaryKey"
	FROM
		information_schema.columns AS cols
	LEFT JOIN foreign_key_relationships ON cols.table_name = foreign_key_relationships. "tableName"
		AND cols.column_name = foreign_key_relationships. "columnName"
	LEFT JOIN information_schema.constraint_column_usage AS ccu ON cols.table_schema = ccu.table_schema
		AND cols.table_name = ccu.table_name
		AND cols.column_name = ccu.column_name
	LEFT JOIN information_schema.table_constraints AS tc ON ccu.constraint_schema = tc.constraint_schema
		AND ccu.constraint_name = tc.constraint_name
		AND tc.constraint_type = 'UNIQUE'
	LEFT JOIN primary_keys AS pk ON cols.table_name = pk.table_name
		AND cols.column_name = pk.column_name
WHERE
	cols.table_schema = 'public'
GROUP BY
	cols.table_name,
	cols.data_type,
	is_nullable,
	cols.column_name,
	cols.column_default,
	tc.constraint_type,
	pk.column_name
ORDER BY
	cols.table_name ASC,
	cols.column_name ASC
)
SELECT
	information_schema.columns.table_name AS "tableName",
	COALESCE(information_schema.views.table_name IS NOT NULL, FALSE) AS "isView",
	CASE WHEN COUNT(DISTINCT primary_keys.column_name) = 1 THEN
		JSON_AGG(DISTINCT primary_keys.column_name)::json -> 0
	WHEN COUNT(DISTINCT primary_keys.column_name) > 1 THEN
		JSON_AGG(DISTINCT primary_keys.column_name)
	ELSE
		NULL
	END AS "primaryKey",
	CASE WHEN JSON_AGG(DISTINCT cols)::text = '[null]' THEN
		'[]'::json
	ELSE
		JSON_AGG(DISTINCT cols)
	END AS "columns",
	CASE WHEN JSON_AGG(DISTINCT foreign_key_relationships)::text = '[null]' THEN
		'[]'::json
	ELSE
		JSON_AGG(DISTINCT foreign_key_relationships)
	END AS "relations"
FROM
	information_schema.columns
	LEFT JOIN foreign_key_relationships ON foreign_key_relationships. "tableName" = information_schema.columns.table_name
	LEFT JOIN cols ON cols. "tableName" = information_schema.columns.table_name
	LEFT JOIN primary_keys ON primary_keys.table_name = information_schema.columns.table_name
	LEFT JOIN information_schema.views ON information_schema.columns.table_name = information_schema.views.table_name
		AND information_schema.columns.table_schema = information_schema.views.table_schema
WHERE
	information_schema.columns.table_schema = 'public'
	AND information_schema.columns.table_name NOT IN('', ${excludeTables.map((t) => `'${t}'`).join(', ')})
GROUP BY
	information_schema.columns.table_name,
	information_schema.views.table_name
ORDER BY
	information_schema.columns.table_name ASC;
`

interface PostgresClient {
  query: (query: string) => Promise<{ rows: unknown[] }>
}

export const introspectPostgres: DatabaseIntrospector<PostgresClient> = async (
  client,
  options,
) => {
  const excludeTables = getExcludeTables(options)

  const queryResult = await client.query(query(excludeTables))

  const tables = Table.array()(queryResult.rows)

  if (tables instanceof ArkErrors) {
    return tables.throw()
  }

  return tables
}
