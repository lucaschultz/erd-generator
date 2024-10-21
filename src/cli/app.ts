import { buildApplication } from '@stricli/core'

import { name, version } from '../../package.json'
import { LibSqlCommand } from './commands/libsql-command.js'

export const app = buildApplication(LibSqlCommand, {
  name,
  scanner: {
    caseStyle: 'allow-kebab-for-camel',
  },
  versionInfo: {
    currentVersion: version,
  },
})
