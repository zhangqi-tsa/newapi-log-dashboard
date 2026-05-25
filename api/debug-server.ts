import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'new-api',
  user: 'root',
  password: 'Unitrust@Tsa123',
})

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.post('/auth/login', async (req, res) => {
  console.log('Login request body:', req.body)
  const { username, password } = req.body
  
  if (!username || !password) {
    res.status(400).json({ success: false, message: '请输入用户名和密码' })
    return
  }
  
  console.log('Querying user:', username)
  const result = await pool.query(
    `SELECT id, username, password, role, status, "group" FROM users WHERE username = $1 LIMIT 1`,
    [username]
  )
  
  console.log('Found rows:', result.rows.length)
  
  if (result.rows.length === 0) {
    res.status(401).json({ success: false, message: '用户名或密码错误' })
    return
  }
  
  const user = result.rows[0]
  console.log('User password hash:', user.password.substring(0, 30) + '...')
  
  const valid = bcrypt.compareSync(password, user.password)
  console.log('Password valid:', valid)
  
  if (!valid) {
    res.status(401).json({ success: false, message: '用户名或密码错误' })
    return
  }
  
  res.json({ success: true, message: '登录成功', data: { username: user.username } })
})

app.listen(3012, () => console.log('Debug server on port 3012'))
