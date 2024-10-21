import type { Client, InStatement } from '@libsql/client'

import { ArkErrors, type, Type } from 'arktype'

import type { Prettify } from '../../types/prettify.js'

type ZipTuples<
  First extends readonly unknown[],
  Second extends readonly unknown[],
  Acc extends readonly unknown[] = [],
> = First extends []
  ? Acc[number]
  : Second extends []
    ? Acc[number]
    : ZipTuples<
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        First extends [infer _, ...infer Rest] ? Rest : never,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Second extends [infer _, ...infer Rest] ? Rest : never,
        [...Acc, [First[0], Second[0]]]
      >

type TuplesToObject<T extends [unknown, unknown]> = {
  [K in T as K[0] & string]: K[1]
}

export const result = type('<t extends string[], v extends unknown[]>', {
  columns: 't',
  rows: 'v[]',
})

interface Result {
  columns: string[]
  rows: unknown[][]
}

type ResultRecord<T extends Result> = Prettify<
  TuplesToObject<ZipTuples<T['columns'], T['rows'][number]>>
>

function resultToRecords<T extends Result>(result: T) {
  const columns = result.columns
  const rows = result.rows

  return rows.map((row) => {
    const map = new Map<string, unknown>()

    for (let i = 0; i < columns.length; i++) {
      const key = columns[i]

      map.set(key, row[i])
    }

    return Object.fromEntries(map) as ResultRecord<T>
  })
}

export async function executeQuery<
  TType extends Type<{
    columns: string[]
    rows: unknown[][]
  }>,
>(
  client: Client,
  query: InStatement,
  validate: TType,
): Promise<ResultRecord<TType['infer']>[]> {
  const result = await client.execute(query)

  const validationResult = validate(result.toJSON())

  if (validationResult instanceof ArkErrors) {
    throw new Error('Error validating libSQL query result', {
      cause: validationResult,
    })
  }

  return resultToRecords(validationResult)
}
