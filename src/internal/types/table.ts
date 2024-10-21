interface Relation {
  columnName: string
  foreignColumnName: string
  foreignTableName: string
  onDelete: 'CASCADE' | 'NO ACTION' | 'RESTRICT' | 'SET DEFAULT' | 'SET NULL'
  onUpdate: 'CASCADE' | 'NO ACTION' | 'RESTRICT' | 'SET DEFAULT' | 'SET NULL'
  tableName: string
}

interface Column {
  dataType: string
  defaultValue: string | undefined
  hasDefaultValue: boolean
  isAutoIncrementing: boolean
  isForeignKey: boolean
  isNullable: boolean
  isPrimaryKey: boolean
  isUnique: boolean
  name: string
}

export interface Table {
  columns: Column[]
  isView: boolean
  name: string
  primaryKey: string | undefined
  relations: Relation[]
}
