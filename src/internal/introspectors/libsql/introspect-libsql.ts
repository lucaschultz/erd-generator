import type { Client as LibSqlClient } from '@libsql/client'

import { type } from 'arktype'

import type { Table } from '../../table.js'
import type { DatabaseIntrospector } from '../../types/database-introspector.js'

import { getExcludeTables } from '../shared/get-exclude-tables.js'
import { executeQuery, result } from './execute-query.js'

const uniqueColumnsResult = result(
  ['"tableName"', '"columnName"'],
  ['string', 'string'],
)

const uniqueColumnsQuery = `
  SELECT
	"m"."name" AS "tableName",
	"i"."name" AS "columnName"
  FROM
	"sqlite_master" AS "m"
	INNER JOIN pragma_index_list (m.name) AS "l" ON "l"."unique" = ?
	INNER JOIN pragma_index_info (l.name) AS "i"
  ORDER BY
	"m"."name"
`

const getUniqueColumns = (client: LibSqlClient) => {
  return executeQuery(
    client,
    { args: [1], sql: uniqueColumnsQuery },
    uniqueColumnsResult,
  )
}

const primaryKeysResult = result(
  ['"tableName"', '"columnName"'],
  ['string', 'string'],
)

const primaryKeysQuery = `
  SELECT
	"m"."name" AS "tableName",
	"p"."name" AS "columnName"
  FROM
	"sqlite_master" AS "m"
	INNER JOIN pragma_table_info (m.name) AS "p" ON "p"."pk" = ?
  ORDER BY
	"m"."name"
`

const getPrimaryKeys = async (client: LibSqlClient) => {
  return await executeQuery(
    client,
    { args: [1], sql: primaryKeysQuery },
    primaryKeysResult,
  )
}

const action = type(
  '"CASCADE" | "NO ACTION" | "RESTRICT" | "SET NULL" | "SET DEFAULT"',
)

const relationsResult = result(
  [
    '"tableName"',
    '"columnName"',
    '"foreignTableName"',
    '"foreignColumnName"',
    '"onUpdate"',
    '"onDelete"',
  ],
  ['string', 'string', 'string', 'string', action, action],
)

const relationsQuery = `
  SELECT
	"m"."name" AS "tableName",
	"p"."from" AS "columnName",
	"p"."table" AS "foreignTableName",
	"p"."to" AS "foreignColumnName",
	"p"."on_update" AS "onUpdate",
	"p"."on_delete" AS "onDelete"
  FROM
	"sqlite_master" AS "m"
	INNER JOIN pragma_foreign_key_list (m.name) AS "p" ON "m"."name" != "p"."table"
  WHERE
	"m"."type" = ?
  ORDER BY
	"m"."name"
`

const getRelations = async (client: LibSqlClient) => {
  return executeQuery(
    client,
    {
      args: ['table'],
      sql: relationsQuery,
    },
    relationsResult,
  )
}

const tableNamesResult = result(['"name"'], ['string'])

const tableNamesQuery = (excludeTables: string[]) => `
  SELECT
	"name"
  FROM
	"sqlite_master"
  WHERE
	"type" IN ('table', 'view')
	AND "name" NOT LIKE 'sqlite_%'
	AND "name" NOT IN (${excludeTables.map((table) => `'${table}'`).join(', ')})
  ORDER BY
	"name"
`

const getTableNames = async (client: LibSqlClient, excludeTables: string[]) => {
  return await executeQuery(
    client,
    tableNamesQuery(excludeTables),
    tableNamesResult,
  )
}

const tableDefinitionResult = result(
  ['"sql"', '"type"'],
  ['string|undefined', 'string'],
)

const tableDefinitionQuery = (tableName: string) => `
  SELECT
	"sql",
	"type"
  FROM
	"sqlite_master"
  WHERE
	"name" = '${tableName}'
`

const getTableDefinition = async (client: LibSqlClient, tableName: string) => {
  return await executeQuery(
    client,
    tableDefinitionQuery(tableName),
    tableDefinitionResult,
  )
}

const tableColumnsResult = result(
  ['"name"', '"type"', '"notnull"', '"dflt_value"', '"pk"'],
  ['string', 'string', '0|1', 'string|undefined|null', '0|1'],
)

const tableColumnsQuery = (tableName: string) => `
  SELECT
	"name",
	"type",
	"notnull",
	"dflt_value",
	"pk"
  FROM
	pragma_table_info ('${tableName}') AS "table_info"
  ORDER BY
	"cid"
`

const getTableColumns = async (client: LibSqlClient, tableName: string) => {
  return await executeQuery(
    client,
    tableColumnsQuery(tableName),
    tableColumnsResult,
  )
}

async function getTableMetadata(client: LibSqlClient, tableName: string) {
  const tableDefinition = (await getTableDefinition(client, tableName))[0]

  const autoIncrementCol = tableDefinition.sql
    ?.split(/[(),]/)
    .find((it) => it.toLowerCase().includes('autoincrement'))
    ?.trimStart()
    .split(/\s+/)[0]
    ?.replace(/["`]/g, '')

  const columns = await getTableColumns(client, tableName)

  return {
    columns: columns.map((col) => ({
      columnName: col.name,
      dataType: col.type,
      defaultValue: typeof col.dflt_value === 'string' ? col.dflt_value : null,
      hasDefaultValue: col.dflt_value != null,
      isAutoIncrementing: col.name === autoIncrementCol,
      isNullable: col.notnull === 0 ? true : false,
      isPrimaryKey: col.pk === 1 ? true : false,
      tableName,
    })),
    isView: tableDefinition.type === 'view',
    tableName,
  }
}

export const introspectLibsql: DatabaseIntrospector<LibSqlClient> = async (
  client,
  options,
) => {
  const excludeTables = getExcludeTables(options)

  const tableNames = await getTableNames(client, excludeTables)
  const relations = await getRelations(client)
  const primaryKeys = await getPrimaryKeys(client)
  const uniqueColumns = await getUniqueColumns(client)

  const tableMetaData = await Promise.all(
    tableNames.map(({ name }) => getTableMetadata(client, name)),
  )

  const tables: Table[] = tableMetaData.map((table) => {
    const columns = table.columns.map((column) => {
      return {
        ...column,
        isForeignKey: relations.some(
          (r) =>
            r.tableName === table.tableName &&
            r.columnName === column.columnName,
        ),
        isUnique: uniqueColumns.some(
          (c) =>
            c.tableName === table.tableName &&
            c.columnName === column.columnName,
        ),
      }
    })

    return {
      ...table,
      columns,
      primaryKey:
        primaryKeys.find((pk) => pk.tableName === table.tableName)
          ?.columnName ?? null,
      relations: relations.filter((r) => r.tableName === table.tableName),
    }
  })

  return tables
}
