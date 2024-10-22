import { createClient } from '@libsql/client'
import { buildCommand } from '@stricli/core'
import { writeFile } from 'fs/promises'

import type { AppContext } from '../app-context.js'

import { generateD2FromLibsql } from '../../internal/generate-d2-from-libsql.js'
import { LibSqlUrl, parseLibSqlUrl } from '../parsers/parse-libsql-url.js'
import { parseOutputArg } from '../parsers/parse-output-arg.js'

interface LibSqlCommandFlags {
  readonly authToken?: string
  readonly encryptionKey?: string
  readonly excludeTable?: string[]
  readonly format: 'd2'
  readonly generatedTables: boolean
  readonly output?: string
}

async function runLibSqlCommand(
  this: AppContext,
  flags: LibSqlCommandFlags,
  url: LibSqlUrl,
): Promise<void> {
  const client = createClient({
    authToken: flags.authToken,
    encryptionKey: flags.encryptionKey,
    url,
  })

  const diagram = await generateD2FromLibsql(client, {
    excludeTables: flags.excludeTable,
    includeDefaultExcludedTables: flags.generatedTables,
  })

  if (flags.output) {
    await writeFile(flags.output, diagram)
    this.process.stdout.write(`D2 diagram written to "${flags.output}"`)
  } else {
    this.process.stdout.write(diagram)
  }
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
      e: 'excludeTable',
      f: 'format',
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
      format: {
        brief: 'Format of the diagram',
        default: 'd2',
        kind: 'enum',
        placeholder: 'format',
        values: ['d2'],
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
          parse: parseLibSqlUrl,
          brief: 'libSQL connection URI or SQLite file path',
          placeholder: 'url',
        },
      ],
    },
  },
})
