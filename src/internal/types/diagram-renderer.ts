import type { Table } from './table.js'

export type DiagramRenderer = (tables: Table[]) => Promise<string> | string
