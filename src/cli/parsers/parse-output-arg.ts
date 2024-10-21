import * as fs from 'fs/promises'
import path from 'path'

export async function checkIfFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

async function checkDirectoryWriteAccess(directoryPath: string) {
  const absolutePath = path.resolve(directoryPath)

  try {
    await fs.access(absolutePath, fs.constants.W_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

export async function parseOutputArg(output: string): Promise<string> {
  if (!(await checkDirectoryWriteAccess(path.dirname(output)))) {
    throw new Error(`No write access to directory "${path.dirname(output)}"`)
  }

  if (await checkIfFileExists(output)) {
    throw new Error(`Output file already exists "${output}"`)
  }

  return output
}
