import sqlite from 'sqlite3'
import path from 'path'
import logger from './logger'

let database: sqlite.Database

interface TableCount {
  count: number
}

async function createVideosTable() {
  await new Promise<void>((resolve) =>
    database.run(
      `
  CREATE TABLE "videos" (
    "uuid"	TEXT NOT NULL,
    "youtubeId"	TEXT NOT NULL,
    "format"	TEXT NOT NULL,
    "filename"	TEXT NOT NULL,
    "extension"	TEXT NOT NULL,
    "status"	TEXT NOT NULL CHECK(status in("Pending", "Cancelled", "Error", "Complete")),
    PRIMARY KEY("uuid")
  )
  `,
      (error) => {
        if (error) {
          logger.log('error', "Could not create table 'videos'")
          process.exit(1)
        }
        resolve()
      }
    )
  )
}

async function initializeTables() {
  const count = await new Promise<number>((resolve) =>
    database.each(
      `select count(*) as count from sqlite_master where type='table' and name='videos'`,
      (error: any, rows: TableCount) => {
        if (error) {
          logger.log('error', "Could not verify table 'videos'")
          process.exit(1)
        }

        resolve(rows.count)
      }
    )
  )

  if (count === 0) {
    logger.log('debug', "Table 'videos' does not exist, creating...")
    await createVideosTable()
    logger.log('debug', "Table 'videos' created")
  }
}

async function initializeDatabase() {
  database = new sqlite.Database(
    path.resolve(__dirname, '../../../../data/database.db'),
    sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
    (error) => {
      if (error) {
        logger.log('error', 'Could not open database')
        process.exit(1)
      }
    }
  )

  await initializeTables()
}

export async function getDatabase() {
  if (!database) {
    logger.log('debug', 'Initializing database...')
    await initializeDatabase()
    logger.log('debug', 'Connected to database at /data/database.db')
  }

  return database
}
