import type { DiagramGenerator } from './types/diagram-generator.js'

import { introspectLibsql } from './introspectors/libsql/introspect-libsql.js'
import { renderD2Diagram } from './renderers/d2/render-d2-diagram.js'

export const generateD2FromLibsql: DiagramGenerator<
  typeof introspectLibsql
> = async (client, options) => {
  const tables = await introspectLibsql(client, options)
  const diagram = renderD2Diagram(tables)

  return diagram
}
