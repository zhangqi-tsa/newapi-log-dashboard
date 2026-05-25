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
  try {
    const { username, password } = req.body
    console.log('Login attempt:', username)

    if (!username || !password) {
      res.status(400).json({ success: false, message: '请输入用户名和密码' })
      return
    }

    const result = await pool.query(
      `SELECT id, username, password, role, status, "group" FROM users WHERE username = $1 LIMIT 1`,
      [username]
    )

    if (result.rows.length === 0) {
      console.log('User not found')
      res.status(401).json({ success: false, message: '用户名或密码错误' })
      return
    }

    const user = result.rows[0]
    console.log('Found user, checking password...')
    
    const valid = bcrypt.compareSync(password, user.password)
    console.log('Password valid:', valid)
    
    if (!valid) {
      res.status(401).json({ success: false, message: '用户名或密码错误' })
      return
    }

    if (user.status !== 1) {
      res.status(401).json({ success: false, message: '用户已被禁用' })
      return
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    
    res.cookie('dashboard_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '登录失败' })
  }
})

const PORT = 3013
app.listen(PORT, () => console.log(`Server on port ${PORT}`))
