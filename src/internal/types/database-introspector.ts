import type { Table } from '../table.js'

export type IntrospectorOptions = Partial<{
  excludeTables: string[]
  includeDefaultExcludedTables: boolean
}>

export type DatabaseIntrospector<T> = (
  dbClient: T,
  options?: IntrospectorOptions,
) => Promise<Table[]> | Table[]
