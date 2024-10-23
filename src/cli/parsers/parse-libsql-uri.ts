import { checkIfFileExists } from '../utils/check-if-file-exists.js'

type RemoteLibSqlUri = `libsql://${string}`

function isRemoteLibSqlUri(url: string): url is RemoteLibSqlUri {
  return url.startsWith('libsql://')
}

type LocalLibSqlUri = `file:${string}`

function isLocalLibSqlUri(url: string): url is LocalLibSqlUri {
  return url.startsWith('file:')
}

export type LibSqlUri = LocalLibSqlUri | RemoteLibSqlUri

export async function parseLibSqlUri(url: string): Promise<LibSqlUri> {
  if (isRemoteLibSqlUri(url)) {
    return url
  }

  const path = isLocalLibSqlUri(url) ? url.replace('file:', '') : url

  const fileExists = await checkIfFileExists(path)
  if (!fileExists) {
    throw new Error(`File not found "${path}"`)
  }

  return isLocalLibSqlUri(url) ? url : `file:${url}`
}
