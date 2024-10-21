import { checkIfFileExists } from './parse-output-arg.js'

type RemoteLibSqlUrl = `libsql://${string}`

function isRemoteLibSqlUrl(url: string): url is RemoteLibSqlUrl {
  return url.startsWith('libsql://')
}

type LocalLibSqlUrl = `file:${string}`

function isLocalLibSqlUrl(url: string): url is LocalLibSqlUrl {
  return url.startsWith('file:')
}

export type LibSqlUrl = LocalLibSqlUrl | RemoteLibSqlUrl

export async function parseLibSqlUrl(url: string): Promise<LibSqlUrl> {
  if (isRemoteLibSqlUrl(url)) {
    return url
  }

  const path = isLocalLibSqlUrl(url) ? url.replace('file:', '') : url

  const fileExists = await checkIfFileExists(path)
  if (!fileExists) {
    throw new Error(`File not found "${path}"`)
  }

  return isLocalLibSqlUrl(url) ? url : `file:${url}`
}
