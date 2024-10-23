import { buildCommand } from '@stricli/core'
import pg from 'pg'

import type { AppContext } from '../app-context.js'

import { generateD2FromPostgres } from '../../internal/generate-d2-from-postgres.js'
import { parseOutputArg } from '../parsers/parse-output-arg.js'
import { parsePostgresUri } from '../parsers/parse-postgres-uri.js'
import { assertValidOutput } from '../utils/assert-valid-output.js'
import { communicateDiagram } from '../utils/communicate-diagram.js'

interface PostgresCommandFlags {
  readonly diagramFormat: 'd2'
  readonly excludeTable?: string[]
  readonly force: boolean
  readonly generatedTables: boolean
  readonly output?: string
}

async function runLibSqlCommand(
  this: AppContext,
  flags: PostgresCommandFlags,
  url: URL,
): Promise<void> {
  await assertValidOutput(flags)

  const client = new pg.Client(url.toString())

  await client.connect()

  const diagram = await generateD2FromPostgres(client, {
    excludeTables: flags.excludeTable,
    includeDefaultExcludedTables: flags.generatedTables,
  })

  await client.end()

  await communicateDiagram(diagram, flags)
}

export const PostgresCommand = buildCommand({
  docs: {
    brief: 'Generate an ERD from a PostgreSQL database',
    customUsage: [
      '-o diagram.d2 postgres://user:password@localhost:5432/mydb',
      '-d d2 postgres://postgres@localhost:5432/postgres',
    ],
  },
  func: runLibSqlCommand,
  parameters: {
    aliases: {
      d: 'diagramFormat',
      e: 'excludeTable',
      f: 'force',
      g: 'generatedTables',
      o: 'output',
    },
    flags: {
      diagramFormat: {
        brief: 'Format of the diagram',
        default: 'd2',
        kind: 'enum',
        placeholder: 'format',
        values: ['d2'],
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
          brief:
            'PostgreSQL Connection URI (https://postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS)',
          parse: parsePostgresUri,
          placeholder: 'url',
        },
      ],
    },
  },
})
