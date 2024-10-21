import type { StricliAutoCompleteContext } from '@stricli/auto-complete'
import type { CommandContext } from '@stricli/core'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export interface AppContext extends CommandContext, StricliAutoCompleteContext {
  readonly process: NodeJS.Process
}

export function buildAppContext(process: NodeJS.Process): AppContext {
  return {
    fs,
    os,
    path,
    process,
  }
}
