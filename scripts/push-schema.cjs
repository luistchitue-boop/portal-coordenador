const fs = require('fs')
const path = require('path')
const postgres = require('postgres')

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
    // remove surrounding quotes
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    acc[key] = val
    return acc
  }, {})
}

;(async () => {
  try {
    const repoRoot = path.resolve(__dirname, '..')
    const envPath = path.join(repoRoot, '.env.local')
    const env = parseEnvFile(envPath)
    const DATABASE_URL = process.env.DATABASE_URL || env.DATABASE_URL || env.NEON_DATABASE_URL
    if (!DATABASE_URL) {
      console.error('.env.local not found or DATABASE_URL not set. Aborting.')
      process.exit(1)
    }

    const migrationsDir = path.join(repoRoot, 'drizzle', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    if (!files.length) {
      console.error('No SQL migration files found in', migrationsDir)
      process.exit(1)
    }

    const sqlText = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n')

    console.log('Connecting to database...')
    const sql = postgres(DATABASE_URL, { ssl: 'require' })

    console.log('Applying migrations...')
    await sql.begin(async sqlTx => {
      // run raw SQL
      await sqlTx.unsafe(sqlText)
    })

    console.log('Migrations applied successfully.')
    await sql.end()
  } catch (err) {
    console.error('Error applying migrations:', err)
    process.exit(1)
  }
})()
