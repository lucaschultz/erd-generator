import { IntrospectorOptions } from '../../types/database-introspector.js'

const DEFAULT_EXCLUDED_TABLES = ['kysely_migration', 'kysely_migration_lock']

export function getExcludeTables(options?: IntrospectorOptions) {
  const excludeTables = []

  if (options?.excludeTables) {
    excludeTables.push(...options.excludeTables)
  }

  if (options?.includeDefaultExcludedTables !== true) {
    excludeTables.push(...DEFAULT_EXCLUDED_TABLES)
  }

  return excludeTables
}
