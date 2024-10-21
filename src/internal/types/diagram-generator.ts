import type { DatabaseIntrospector } from './database-introspector.js'

export type DiagramGenerator<T> = (
  ...params: Parameters<DatabaseIntrospector<T>>
) => Promise<string> | string
