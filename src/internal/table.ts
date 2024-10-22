import { scope } from 'arktype'

const IntrospectionData = scope({
  column: {
    columnName: 'string',
    dataType: 'string',
    defaultValue: 'string|null',
    hasDefaultValue: 'boolean',
    isAutoIncrementing: 'boolean',
    isForeignKey: 'boolean',
    isNullable: 'boolean',
    isPrimaryKey: 'boolean',
    isUnique: 'boolean',
    tableName: 'string',
  },
  referentialAction:
    '"NO ACTION" | "CASCADE" | "RESTRICT" | "SET DEFAULT" | "SET NULL"',
  relation: {
    columnName: 'string',
    foreignColumnName: 'string',
    foreignTableName: 'string',
    onDelete: 'referentialAction',
    onUpdate: 'referentialAction',
    tableName: 'string',
  },
  table: {
    columns: 'column[]',
    isView: 'boolean',
    primaryKey: 'string|string[]|null',
    relations: 'relation[]',
    tableName: 'string',
  },
}).export()

export const Table = IntrospectionData.table
export type Table = typeof Table.infer
