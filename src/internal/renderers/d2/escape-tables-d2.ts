import type { Table } from '../../table.js'

const keywords = ['label']

function escapeD2Keyword(str: string) {
  if (keywords.includes(str.toLowerCase())) {
    return `${str} `
  }

  return str
}

export function escapeTablesD2(tables: Table[]): Table[] {
  return tables.map((table) => {
    return {
      ...table,
      columns: table.columns.map((column) => {
        return {
          ...column,
          name: escapeD2Keyword(column.columnName),
        }
      }),
      name: escapeD2Keyword(table.tableName),
    }
  })
}
