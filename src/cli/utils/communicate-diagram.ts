import { writeFile } from 'fs/promises'

export async function communicateDiagram(
  diagram: string,
  flags: {
    readonly force: boolean
    readonly output?: string
  },
) {
  if (flags.output) {
    await writeFile(flags.output, diagram, {
      flag: flags.force ? 'w' : 'wx',
    })
    console.log(`D2 diagram written to "${flags.output}"`)
  } else {
    console.log(diagram)
  }
}
