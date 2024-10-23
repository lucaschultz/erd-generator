import path from 'path'

import { checkDirectoryWriteAccess } from '../utils/check-directory-write-access.js'

export async function parseOutputArg(output: string): Promise<string> {
  if (!(await checkDirectoryWriteAccess(path.dirname(output)))) {
    throw new Error(`No write access to directory "${path.dirname(output)}"`)
  }

  return output
}
