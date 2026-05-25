import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'new-api',
  user: 'root',
  password: 'Unitrust@Tsa123',
})

async function test() {
  const result = await pool.query(
    `SELECT id, username, password, role, status, "group" FROM users WHERE username = $1 LIMIT 1`,
    ['tsa']
  )
  
  if (result.rows.length === 0) {
    console.log('User not found')
    return
  }
  
  const user = result.rows[0]
  console.log('Password from DB:', user.password)
  console.log('Password length:', user.password.length)
  
  const password = 'Unitrust@Tsa123'
  const valid = bcrypt.compareSync(password, user.password)
  console.log('Valid:', valid)
}

test().then(() => process.exit(0))
