import { checkIfFileExists } from './parse-output-arg.js'

export async function parseLibSqlUrl(url: string): Promise<string> {
  if (url.startsWith('file:')) {
    const path = url.replace('file:', '')
    const filePath = await checkIfFileExists(url)

    if (!filePath) {
      new Error(`File not found" ${path}"`)
    }

    return url
  } else if (url.startsWith('libsql://')) {
    return url
  }

  throw new Error(
    `Invalid URL, must either start with 'file:' to open a local sqlite db or 'libsql://' to open a remote database`,
  )
}
