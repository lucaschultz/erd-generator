import { createClient } from '@libsql/client'
import { buildCommand } from '@stricli/core'
import { writeFile } from 'fs/promises'

import type { AppContext } from '../app-context.js'

import { generateD2FromLibsql } from '../../internal/generate-d2-from-libsql.js'
import { parseLibSqlUrl } from '../parsers/parse-libsql-url.js'
import { parseOutputArg } from '../parsers/parse-output-arg.js'

interface LibSqlCommandFlags {
  readonly authToken?: string
  readonly encryptionKey?: string
  readonly output?: string
}

async function runLibSqlCommand(
  this: AppContext,
  flags: LibSqlCommandFlags,
  url: string,
): Promise<void> {
  const client = createClient({
    authToken: flags.authToken,
    encryptionKey: flags.encryptionKey,
    url,
  })

  const diagram = await generateD2FromLibsql(client)

  if (flags.output) {
    await writeFile(flags.output, diagram)
    this.process.stdout.write(`D2 diagram written to "${flags.output}"`)
  } else {
    this.process.stdout.write(diagram)
  }
}

export const LibSqlCommand = buildCommand({
  docs: {
    brief: 'Generate an D2 ERD from a SQLite or libSQL database',
  },
  func: runLibSqlCommand,
  parameters: {
    flags: {
      authToken: {
        brief: 'Authentication token to connect to remote database',
        kind: 'parsed',
        optional: true,
        parse: String,
        placeholder: 'eyJh...jUBw',
      },
      encryptionKey: {
        brief: 'Key to decrypt an encrypted database',
        kind: 'parsed',
        optional: true,
        parse: String,
        placeholder: 'super-secret-password',
      },
      output: {
        brief: 'Output file',
        kind: 'parsed',
        optional: true,
        parse: parseOutputArg,
        placeholder: 'output.d2',
      },
    },
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'Url of the database',
          parse: parseLibSqlUrl,
          placeholder: 'file:local.db',
        },
      ],
    },
  },
})
