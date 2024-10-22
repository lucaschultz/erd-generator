import type { DiagramGenerator } from './types/diagram-generator.js'

import { introspectPostgres } from './introspectors/postgres/introspect-postgres.js'
import { renderD2Diagram } from './renderers/d2/render-d2-diagram.js'

export const generateD2FromPostgres: DiagramGenerator<
  typeof introspectPostgres
> = async (client, options) => {
  const tables = await introspectPostgres(client, options)
  const diagram = renderD2Diagram(tables)

  return diagram
}
