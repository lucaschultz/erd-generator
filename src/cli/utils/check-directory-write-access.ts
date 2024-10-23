import * as fs from 'fs/promises'
import path from 'path'

export async function checkDirectoryWriteAccess(directoryPath: string) {
  const absolutePath = path.resolve(directoryPath)

  try {
    await fs.access(absolutePath, fs.constants.W_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}
