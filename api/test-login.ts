import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'new-api',
  user: 'root',
  password: 'Unitrust@Tsa123',
})

async function testLogin(username: string, password: string) {
  console.log('Testing login for:', username)
  console.log('Password:', password)

  const result = await pool.query(
    `SELECT id, username, password, role, status, "group" FROM users WHERE username = $1 LIMIT 1`,
    [username]
  )

  console.log('Found user:', result.rows.length > 0)

  if (result.rows.length === 0) {
    console.log('User not found')
    return
  }

  const user = result.rows[0]
  console.log('User from DB:', { ...user, password: user.password.substring(0, 20) + '...' })

  const valid = bcrypt.compareSync(password, user.password)
  console.log('Password valid:', valid)
}

testLogin('tsa', 'Unitrust@Tsa123').then(() => process.exit(0))
