import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { queryLogs, getStats, aggregateByUser, aggregateByModel, validateUser, validateAccessToken } from './db'

const app = express()

// 配置 CORS，允许携带 cookie
app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// 登录接口 - 支持用户名密码或 access_token
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password, access_token } = req.body

    let user: UserSession | null = null

    // 1. 优先尝试 access_token 登录
    if (access_token) {
      user = await validateAccessToken(access_token)
      if (user) {
        console.log('Login via access_token:', user.username)
      }
    }

    // 2. 如果 access_token 失败，尝试用户名密码
    if (!user && username && password) {
      user = await validateUser(username, password)
      if (user) {
        console.log('Login via username/password:', user.username)
      }
    }

    if (!user) {
      res.status(401).json({ success: false, message: '用户名或密码错误', data: null })
      return
    }

    // 生成简单的 token（使用用户ID和时间戳）
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // 设置 cookie
    res.cookie('dashboard_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
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
    res.status(500).json({ success: false, message: '登录失败', data: null })
  }
})

// 检查登录状态
app.get('/auth/check', async (req, res) => {
  try {
    const token = req.cookies?.dashboard_token

    if (!token) {
      // 检查是否有 NewAPI 的 session cookie
      const session = req.cookies?.session
      if (session) {
        console.log('Found NewAPI session cookie, validating...')
        // 用 session cookie 调用 NewAPI 验证接口
        const newapiResponse = await fetch('http://127.0.0.1:3000/api/user/self', {
          headers: {
            'Cookie': `session=${session}`,
            'New-Api-User': '1',
          },
        })
        if (newapiResponse.ok) {
          const data = await newapiResponse.json()
          if (data.success && data.data?.username) {
            console.log('NewAPI session valid for:', data.data.username)
            // 生成 dashboard token
            const dashboardToken = Buffer.from(`${data.data.id}:${Date.now()}`).toString('base64')
            res.cookie('dashboard_token', dashboardToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            res.json({ success: true, message: '已登录', data: { id: data.data.id } })
            return
          }
        }
      }
      res.json({ success: false, message: '未登录', data: null })
      return
    }

    // 简单验证 token 格式
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')

    if (!userId) {
      res.json({ success: false, message: '无效的 token', data: null })
      return
    }

    res.json({ success: true, message: '已登录', data: { id: parseInt(userId) } })
  } catch (error) {
    res.json({ success: false, message: '未登录', data: null })
  }
})

// 退出登录
app.post('/auth/logout', (req, res) => {
  res.clearCookie('dashboard_token')
  res.json({ success: true, message: '退出成功', data: null })
})

// 鉴权中间件 - 支持 cookie 或 access_token
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies?.dashboard_token

  // 1. 先检查 cookie
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [userId] = decoded.split(':')
      if (userId) {
        ;(req as any).userId = parseInt(userId)
        next()
        return
      }
    } catch (error) {
      // cookie 无效，继续检查 access_token
    }
  }

  // 2. 检查 Authorization header (access_token)
  const authHeader = req.headers.authorization
  if (authHeader) {
    const accessToken = authHeader.replace(/^Bearer\s+/i, '')
    // 异步验证 access_token
    validateAccessToken(accessToken).then(user => {
      if (user) {
        ;(req as any).userId = user.id
        next()
      } else {
        res.status(401).json({ success: false, message: '未登录', data: null })
      }
    }).catch(() => {
      res.status(401).json({ success: false, message: '未登录', data: null })
    })
    return
  }

  // 3. 都没有，返回未登录
  res.status(401).json({ success: false, message: '未登录', data: null })
}

// 应用鉴权中间件到所有数据 API 路由
app.use('/log', authMiddleware)
app.use('/user/summary', authMiddleware)
app.use('/model/dimension', authMiddleware)

// 获取所有日志
app.get('/log', async (req, res) => {
  try {
    const { start_timestamp, end_timestamp, username, token_name, model_name, type, p, size } = req.query

    const result = await queryLogs({
      startTime: start_timestamp ? parseInt(start_timestamp as string) : undefined,
      endTime: end_timestamp ? parseInt(end_timestamp as string) : undefined,
      username: username as string,
      tokenName: token_name as string,
      modelName: model_name as string,
      type: type ? parseInt(type as string) : undefined,
      limit: size ? parseInt(size as string) : 20,
      offset: p ? (parseInt(p as string) - 1) * (size ? parseInt(size as string) : 20) : 0,
    })

    res.json({
      success: true,
      message: '',
      data: {
        total: result.total,
        page: p ? parseInt(p as string) : 1,
        page_size: size ? parseInt(size as string) : 20,
        items: result.rows,
      },
    })
  } catch (error) {
    console.error('Error querying logs:', error)
    res.status(500).json({ success: false, message: '查询失败', data: null })
  }
})

// 获取统计数据
app.get('/log/stat', async (req, res) => {
  try {
    const { start_timestamp, end_timestamp } = req.query

    const stats = await getStats({
      startTime: start_timestamp ? parseInt(start_timestamp as string) : undefined,
      endTime: end_timestamp ? parseInt(end_timestamp as string) : undefined,
    })

    res.json({
      success: true,
      message: '',
      data: {
        quota: stats.totalQuota,
        rpm: stats.totalRequests,
        tpm: stats.totalTokens,
      },
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({ success: false, message: '查询失败', data: null })
  }
})

// 获取用户汇总
app.get('/user/summary', async (req, res) => {
  try {
    const { start_timestamp, end_timestamp } = req.query

    const result = await aggregateByUser({
      startTime: start_timestamp ? parseInt(start_timestamp as string) : undefined,
      endTime: end_timestamp ? parseInt(end_timestamp as string) : undefined,
    })

    res.json({
      success: true,
      message: '',
      data: result,
    })
  } catch (error) {
    console.error('Error aggregating by user:', error)
    res.status(500).json({ success: false, message: '查询失败', data: null })
  }
})

// 获取模型维度
app.get('/model/dimension', async (req, res) => {
  try {
    const { start_timestamp, end_timestamp } = req.query

    const result = await aggregateByModel({
      startTime: start_timestamp ? parseInt(start_timestamp as string) : undefined,
      endTime: end_timestamp ? parseInt(end_timestamp as string) : undefined,
    })

    res.json({
      success: true,
      message: '',
      data: result,
    })
  } catch (error) {
    console.error('Error aggregating by model:', error)
    res.status(500).json({ success: false, message: '查询失败', data: null })
  }
})

const PORT = process.env.PORT || 3011
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
