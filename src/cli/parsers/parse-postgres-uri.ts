// This can probably be replaced with the `pg-connection-string` package
// @see https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS
// @see https://github.com/brianc/node-postgres/tree/master/packages/pg-connection-string
// @see https://github.com/brianc/node-postgres/pull/3128

export function parsePostgresUri(url: string): URL {
  const parsed = new URL(url)

  if (parsed.protocol !== 'postgres:') {
    throw new Error(
      `Invalid URL protocol, expected "postgres:" received "${parsed.protocol}"`,
    )
  }

  return parsed
}
