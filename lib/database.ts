import sqlite from 'sqlite3'
import path from 'path'

console.log(process.cwd())

const database = new sqlite.Database(
  path.resolve(__dirname, '../../../../data/database.db')
)

export function getDatabase() {
  return database
}
