import sqlite from 'sqlite3'
import path from 'path'

let database: sqlite.Database

async function initializeTables() {
  const count = await new Promise((resolve, reject) =>
    database.run(
      `SELECT count(*) FROM sqlite_master WHERE type='table' AND name='table_name'`,
      (result: any, error: any) => {
        if (error) {
          console.error('Could not verify table')
          process.exit(1)
        }

        console.log(result)

        resolve(result)
      }
    )
  )
}

async function initializeDatabase() {
  database = new sqlite.Database(
    path.resolve(__dirname, '../../../../data/database.db'),
    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
    (error) => {
      if (error) {
        console.error('Could not open database')
        process.exit(1)
      }
    }
  )

  await initializeTables()
}

export async function getDatabase() {
  if (!database) {
    initializeDatabase()
  }

  return database
}
