import type { Table } from './table.js'

export interface IntrospectorOptions {
  excludeTables: string[]
  includeDefaultExcludedTables: boolean
}

export type DatabaseIntrospector<T> = (
  dbClient: T,
  options?: Partial<IntrospectorOptions>,
) => Promise<Table[]> | Table[]
