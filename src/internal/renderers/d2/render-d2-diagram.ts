import { Eta } from 'eta'

import type { Table } from '../../types/table.js'

import { escapeTablesD2 } from './escape-tables-d2.js'

const template = `
<% it.schema.forEach(function(table) { %>
<%= table.name %>: {
  shape: sql_table

<% table.columns.forEach(function(column) { %>
  "<%= column.name %>": <%= column.dataType %> { constraint: [<%~ [
    column.isPrimaryKey ? 'primary_key' : null,
    column.isUnique ? 'unique' : null,
    column.isForeignKey ? 'foreign_key' : null,
    column.isNullable ? '"NULL"' : null,
    column.isAutoIncrementing ? 'INCR' : null,
    column.hasDefaultValue ? 'DFLT' : null,
  ].filter(Boolean).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).join('; ') %>] }
<% }) %>
}
<% table.relations.forEach(function(relations) { %>

<%= relations.tableName %>.<%= relations.columnName %> -> <%= relations.foreignTableName %>.<%= relations.foreignColumnName %>

<% }) %>

<% }) %>`

export function renderD2Diagram(tables: Table[]) {
  const eta = new Eta()
  const diagram = eta.renderString(template, {
    schema: escapeTablesD2(tables),
  })

  return `${diagram.trim()}\n`
}
