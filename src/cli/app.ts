import { buildApplication, buildRouteMap } from '@stricli/core'

import { version } from '../../package.json'
import { LibSqlCommand } from './commands/libsql-command.js'
import { PostgresCommand } from './commands/postgres-command.js'

const routeMap = buildRouteMap({
  docs: {
    brief: 'Generate ERD diagrams from various sources',
  },
  routes: {
    libsql: LibSqlCommand,
    postgres: PostgresCommand,
    sqlite: LibSqlCommand,
  },
})

export const app = buildApplication(routeMap, {
  documentation: {
    caseStyle: 'convert-camel-to-kebab',
    useAliasInUsageLine: true,
  },
  name: 'erd-generator',
  scanner: {
    caseStyle: 'allow-kebab-for-camel',
  },
  versionInfo: {
    currentVersion: version,
    upgradeCommand: 'npm install -g erd-generator',
  },
})
