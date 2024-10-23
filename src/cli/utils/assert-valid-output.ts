import { checkIfFileExists } from './check-if-file-exists.js'

export async function assertValidOutput(flags: {
  readonly force: boolean
  readonly output?: string
}) {
  if (flags.output && !flags.force && (await checkIfFileExists(flags.output))) {
    throw new Error(
      `Output file already exists "${flags.output}", use --force to overwrite`,
    )
  }
}
