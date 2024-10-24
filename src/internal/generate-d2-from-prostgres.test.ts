import { PGlite } from '@electric-sql/pglite'
import { expect, test } from 'vitest'

import { generateD2FromPostgres as generateD2FromLibsql } from './generate-d2-from-postgres.js'

const simpleDiagramSql = 'CREATE TABLE users (email TEXT)'

const simpleDiagram = `
users: {
  shape: sql_table

  "email": TEXT { constraint: ["NULL"] }
}`

test('generate simple diagram', async () => {
  const client = new PGlite()

  await client.query(simpleDiagramSql)

  const diagram = await generateD2FromLibsql(client)

  expect(diagram.trim()).toBe(simpleDiagram.trim())

  await client.close()
})

const simpleDiagramWithUniqueSql = `
CREATE TABLE users (email TEXT UNIQUE);
`

const simpleDiagramWithUnique = `
users: {
  shape: sql_table

  "email": TEXT { constraint: ["NULL"; unique] }
}`

test('generate diagram with unique column', async () => {
  const client = new PGlite()

  await client.query(simpleDiagramWithUniqueSql)

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(simpleDiagramWithUnique.trim())
})

const simpleDiagramWithPrimaryKeySql =
  'CREATE TABLE users (email TEXT PRIMARY KEY)'

const simpleDiagramWithPrimaryKey = `
users: {
  shape: sql_table

  "email": TEXT { constraint: [primary_key] }
}`

test('generate diagram with primary key column', async () => {
  const client = new PGlite()

  await client.query(simpleDiagramWithPrimaryKeySql)

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(simpleDiagramWithPrimaryKey.trim())
})

const simpleDiagramWithAutoIncrementSql =
  'CREATE TABLE users (id SERIAL PRIMARY KEY)'

const simpleDiagramWithAutoIncrement = `
users: {
  shape: sql_table

  "id": INTEGER { constraint: [DFLT; INCR; primary_key] }
}`

test('generate diagram with auto increment column', async () => {
  const client = new PGlite()

  await client.query(simpleDiagramWithAutoIncrementSql)

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(simpleDiagramWithAutoIncrement.trim())
})

const simpleDiagramWithDefaultValueSql =
  "CREATE TABLE users (email TEXT DEFAULT 'test')"

const simpleDiagramWithDefaultValue = `
users: {
  shape: sql_table

  "email": TEXT { constraint: ["NULL"; DFLT] }
}`

test('generate diagram with default value column', async () => {
  const client = new PGlite()

  await client.query(simpleDiagramWithDefaultValueSql)

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(simpleDiagramWithDefaultValue.trim())
})

const diagramWithNotNullableColumnSql =
  'CREATE TABLE users (email TEXT NOT NULL)'

const diagramWithNotNullableColumn = `
users: {
  shape: sql_table

  "email": TEXT { constraint: [] }
}`

test('generate diagram with not nullable column', async () => {
  const client = new PGlite()

  await client.query(diagramWithNotNullableColumnSql)

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(diagramWithNotNullableColumn.trim())
})

function split(sql: string) {
  return sql.split('\n').filter((l) => l.trim() !== '')
}

const diagramWithRelationSql = `
CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT);
CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, content TEXT, FOREIGN KEY (user_id) REFERENCES users (id));
`

const diagramWithRelation = `
posts: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "user_id": INTEGER { constraint: ["NULL"; foreign_key] }
  "content": TEXT { constraint: ["NULL"] }
}

posts.user_id -> users.id

users: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "email": TEXT { constraint: ["NULL"] }
}`

test('generate simple diagram with relation', async () => {
  const client = new PGlite()

  await Promise.all(
    split(diagramWithRelationSql).map((sql) => client.query(sql)),
  )

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(diagramWithRelation.trim())
})

const complexDiagramSql = `
CREATE TABLE users (id SERIAL PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE);
CREATE TABLE posts (id INTEGER PRIMARY KEY NOT NULL, user_id INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users (id));
CREATE TABLE comments (id INTEGER PRIMARY KEY NOT NULL, post_id INTEGER NOT NULL, content TEXT NOT NULL, FOREIGN KEY (post_id) REFERENCES posts (id));
CREATE TABLE likes (id INTEGER PRIMARY KEY NOT NULL, post_id INTEGER NOT NULL, FOREIGN KEY (post_id) REFERENCES posts (id));
CREATE TABLE tags (id INTEGER PRIMARY KEY NOT NULL, name TEXT);
CREATE TABLE post_tags (post_id INTEGER NOT NULL, tag_id INTEGER NOT NULL, FOREIGN KEY (post_id) REFERENCES posts (id), FOREIGN KEY (tag_id) REFERENCES tags (id));
`

const complexDiagram = `
comments: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "post_id": INTEGER { constraint: [foreign_key] }
  "content": TEXT { constraint: [] }
}

comments.post_id -> posts.id

likes: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "post_id": INTEGER { constraint: [foreign_key] }
}

likes.post_id -> posts.id

post_tags: {
  shape: sql_table

  "post_id": INTEGER { constraint: [foreign_key] }
  "tag_id": INTEGER { constraint: [foreign_key] }
}

post_tags.post_id -> posts.id

post_tags.tag_id -> tags.id

posts: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "user_id": INTEGER { constraint: [foreign_key] }
  "content": TEXT { constraint: [] }
}

posts.user_id -> users.id

tags: {
  shape: sql_table

  "id": INTEGER { constraint: [primary_key] }
  "name": TEXT { constraint: ["NULL"] }
}

users: {
  shape: sql_table

  "id": INTEGER { constraint: [DFLT; INCR; primary_key] }
  "email": TEXT { constraint: [unique] }
}`

test('generate complex diagram', async () => {
  const client = new PGlite()

  await Promise.all(split(complexDiagramSql).map((sql) => client.query(sql)))

  const diagram = await generateD2FromLibsql(client)

  await client.close()

  expect(diagram.trim()).toBe(complexDiagram.trim())
})
