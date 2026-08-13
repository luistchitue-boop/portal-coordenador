const fs = require('fs')
const path = require('path')
const postgres = require('postgres')

const repoRoot = path.resolve(__dirname, '..')
const envPath = path.join(repoRoot, '.env.local')
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  return content.split(/\n/).reduce((acc, line) => {
    line = line.trim()
    if (!line || line.startsWith('#')) return acc
    const idx = line.indexOf('=')
    if (idx === -1) return acc
    const key = line.slice(0, idx)
    let val = line.slice(idx + 1)
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    acc[key] = val
    return acc
  }, {})
}

;(async () => {
  const env = parseEnvFile(envPath)
  const DATABASE_URL = process.env.DATABASE_URL || env.DATABASE_URL || env.NEON_DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set in .env.local')
    process.exit(1)
  }

  const migrationFile = path.join(repoRoot, 'drizzle', 'migrations', '0002_add_fks.sql')
  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile)
    process.exit(1)
  }

  const sqlText = fs.readFileSync(migrationFile, 'utf8')
  const sql = postgres(DATABASE_URL, { ssl: 'require' })
  try {
    console.log('Applying migration 0002_add_fks.sql')
    await sql.unsafe(sqlText)
    console.log('Migration applied.')
  } catch (err) {
    console.error('Error applying migration:', err)
    process.exit(1)
  } finally {
    await sql.end()
  }
})()
