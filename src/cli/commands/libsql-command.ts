import { createClient } from '@libsql/client'
import { buildCommand } from '@stricli/core'

import type { AppContext } from '../app-context.js'

import { generateD2FromLibsql } from '../../internal/generate-d2-from-libsql.js'
import { LibSqlUri, parseLibSqlUri } from '../parsers/parse-libsql-uri.js'
import { parseOutputArg } from '../parsers/parse-output-arg.js'
import { assertValidOutput } from '../utils/assert-valid-output.js'
import { communicateDiagram } from '../utils/communicate-diagram.js'

interface LibSqlCommandFlags {
  readonly authToken?: string
  readonly diagramFormat: 'd2'
  readonly encryptionKey?: string
  readonly excludeTable?: string[]
  readonly force: boolean
  readonly generatedTables: boolean
  readonly output?: string
}

async function runLibSqlCommand(
  this: AppContext,
  flags: LibSqlCommandFlags,
  url: LibSqlUri,
): Promise<void> {
  await assertValidOutput(flags)

  const client = createClient({
    authToken: flags.authToken,
    encryptionKey: flags.encryptionKey,
    url,
  })

  const diagram = await generateD2FromLibsql(client, {
    excludeTables: flags.excludeTable,
    includeDefaultExcludedTables: flags.generatedTables,
  })

  await communicateDiagram(diagram, flags)
}

export const LibSqlCommand = buildCommand({
  docs: {
    brief: 'Generate an ERD from a SQLite or libSQL database',
    customUsage: [
      '-o diagram.d2 -k "1secret!password" ./encrypted.db',
      '-a eyJ…UBw -o libsql://mydb-myorg.turso.io',
      '-f d2 ./mydb.sqlite',
    ],
  },
  func: runLibSqlCommand,
  parameters: {
    aliases: {
      a: 'authToken',
      d: 'diagramFormat',
      e: 'excludeTable',
      f: 'force',
      g: 'generatedTables',
      k: 'encryptionKey',
      o: 'output',
    },
    flags: {
      authToken: {
        brief: 'Authentication token to connect to a remote database',
        kind: 'parsed',
        optional: true,
        parse: String,
        placeholder: 'token',
      },
      diagramFormat: {
        brief: 'Format of the diagram',
        default: 'd2',
        kind: 'enum',
        placeholder: 'format',
        values: ['d2'],
      },
      encryptionKey: {
        brief: 'Key to decrypt an encrypted local database',
        kind: 'parsed',
        optional: true,
        parse: String,
        placeholder: 'key',
      },
      excludeTable: {
        brief: 'Tables to exclude from the diagram',
        kind: 'parsed',
        optional: true,
        parse: String,
        variadic: true,
      },
      force: {
        brief: 'If output file exists, overwrite it',
        default: false,
        kind: 'boolean',
      },
      generatedTables: {
        brief: "Include generated tables (e.g. migration tables from ORM's)",
        default: false,
        kind: 'boolean',
      },
      output: {
        brief: 'Path to an output file (otherwise output is written to stdout)',
        kind: 'parsed',
        optional: true,
        parse: parseOutputArg,
        placeholder: 'path',
      },
    },
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'libSQL connection URI or SQLite file path',
          parse: parseLibSqlUri,
          placeholder: 'url',
        },
      ],
    },
  },
})
