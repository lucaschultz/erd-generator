interface Relation {
  columnName: string
  foreignColumnName: string
  foreignTableName: string
  onDelete: 'CASCADE' | 'NO ACTION' | 'RESTRICT' | 'SET DEFAULT' | 'SET NULL'
  onUpdate: 'CASCADE' | 'NO ACTION' | 'RESTRICT' | 'SET DEFAULT' | 'SET NULL'
  tableName: string
}

interface Column {
  columnName: string
  dataType: string
  defaultValue: null | string
  hasDefaultValue: boolean
  isAutoIncrementing: boolean
  isForeignKey: boolean
  isNullable: boolean
  isPrimaryKey: boolean
  isUnique: boolean
  tableName: string
}

export interface Table {
  columns: Column[]
  isView: boolean
  primaryKey: null | string | string[]
  relations: Relation[]
  tableName: string
}
