import type { AnyDatabaseIntrospector } from './database-introspector.js'

export type DiagramGenerator<T extends AnyDatabaseIntrospector> = (
  ...params: Parameters<T>
) => Promise<string> | string
