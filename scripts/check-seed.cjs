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
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1)
    }
    acc[key] = val
    return acc
  }, {})
}

(async () => {
  const repoRoot = path.resolve(__dirname, '..')
  const envPath = path.join(repoRoot, '.env.local')
  const env = parseEnvFile(envPath)
  const DATABASE_URL = process.env.DATABASE_URL || env.DATABASE_URL || env.NEON_DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }
  const sql = postgres(DATABASE_URL, { ssl: 'require' })
  const tables = ['users','turmas','turma_managers','students','enrollments','subjects','turma_subjects','grades','disciplinary_notes']
  for (const t of tables) {
    const res = await sql`SELECT COUNT(*)::int AS c FROM ${sql(t)}`
    console.log(t.padEnd(20), res[0].c)
  }
  await sql.end()
})()
