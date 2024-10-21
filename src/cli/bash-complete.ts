import { proposeCompletions } from '@stricli/core'

import { app } from './app.js'
import { buildAppContext } from './app-context.js'

const inputs = process.argv.slice(3)
if (process.env.COMP_LINE?.endsWith(' ')) {
  inputs.push('')
}
await proposeCompletions(app, inputs, buildAppContext(process))
