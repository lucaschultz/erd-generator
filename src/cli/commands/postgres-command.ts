import { buildCommand } from '@stricli/core'
import { writeFile } from 'fs/promises'
import pg from 'pg'

import type { AppContext } from '../app-context.js'

import { generateD2FromPostgres } from '../../internal/generate-d2-from-postgres.js'
import { parseOutputArg } from '../parsers/parse-output-arg.js'
import { parsePostgresUrl } from '../parsers/parse-postgres-url.js'

interface PostgresCommandFlags {
  readonly excludeTable?: string[]
  readonly format: 'd2'
  readonly generatedTables: boolean
  readonly output?: string
}

async function runLibSqlCommand(
  this: AppContext,
  flags: PostgresCommandFlags,
  url: URL,
): Promise<void> {
  const client = new pg.Client(url.toString())

  await client.connect()

  const diagram = await generateD2FromPostgres(client, {
    excludeTables: flags.excludeTable,
    includeDefaultExcludedTables: flags.generatedTables,
  })

  await client.end()

  if (flags.output) {
    await writeFile(flags.output, diagram)
    this.process.stdout.write(`D2 diagram written to "${flags.output}"`)
  } else {
    this.process.stdout.write(diagram)
  }
}

export const PostgresCommand = buildCommand({
  docs: {
    brief: 'Generate an ERD from a PostgreSQL database',
    customUsage: [
      '-o diagram.d2 postgres://user:password@localhost:5432/mydb',
      '-f d2 postgres://postgres@localhost:5432/postgres',
    ],
  },
  func: runLibSqlCommand,
  parameters: {
    aliases: {
      e: 'excludeTable',
      f: 'format',
      g: 'generatedTables',
      o: 'output',
    },
    flags: {
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
          brief:
            'PostgreSQL Connection URI (https://postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS)',
          parse: parsePostgresUrl,
          placeholder: 'url',
        },
      ],
    },
  },
})
