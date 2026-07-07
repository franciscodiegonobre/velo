import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

const connectionString = process.env.PLAYWRIGHT_DATABASE_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Missing database connection. Set PLAYWRIGHT_DATABASE_URL or DATABASE_URL before running Playwright.'
  )
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString,
    max: 10,
    ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : undefined,
  })
})

export const db = new Kysely<Database>({
  dialect,
})