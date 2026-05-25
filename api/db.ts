import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'new-api',
  user: 'root',
  password: 'Unitrust@Tsa123',
})

export interface LogEntry {
  id: number
  user_id: number
  created_at: number
  type: number
  content: string
  username: string
  token_name: string
  model_name: string
  quota: number
  prompt_tokens: number
  completion_tokens: number
  use_time: number
  is_stream: boolean
  channel_id: number
  channel_name: string
  token_id: number
  group: string
}

export interface UserSession {
  id: number
  username: string
  role: number
  status: number
  group: string
}

// 验证用户名密码
export async function validateUser(username: string, password: string): Promise<UserSession | null> {
  try {
    if (!username || !password) {
      return null
    }

    // 从数据库查询用户
    const result = await pool.query(
      `SELECT id, username, password, role, status, "group" FROM users WHERE username = $1 LIMIT 1`,
      [username]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]

    // 验证密码（bcrypt）
    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      return null
    }

    // 检查用户状态（数据库返回的是字符串 '1'）
    if (user.status != 1) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      group: user.group,
    }
  } catch (error) {
    console.error('Error validating user:', error)
    return null
  }
}

// 通过 access_token 验证用户
export async function validateAccessToken(token: string): Promise<UserSession | null> {
  try {
    if (!token) {
      return null
    }

    // 移除 Bearer 前缀
    const cleanToken = token.replace(/^Bearer\s+/i, '')

    // 从数据库查询用户
    const result = await pool.query(
      `SELECT id, username, role, status, "group" FROM users WHERE access_token = $1 LIMIT 1`,
      [cleanToken]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]

    // 检查用户状态
    if (user.status != 1) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      group: user.group,
    }
  } catch (error) {
    console.error('Error validating access token:', error)
    return null
  }
}

// 检查用户是否有管理员权限
export function isAdmin(user: UserSession): boolean {
  return user.role >= 10 // RoleAdminUser = 10
}

export async function queryLogs(params: {
  startTime?: number
  endTime?: number
  username?: string
  tokenName?: string
  modelName?: string
  type?: number
  limit?: number
  offset?: number
}): Promise<{ rows: LogEntry[]; total: number }> {
  const { startTime, endTime, username, tokenName, modelName, type, limit = 100, offset = 0 } = params

  let whereClause = 'WHERE 1=1'
  const values: (string | number)[] = []
  let paramIndex = 1

  if (startTime) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    values.push(startTime)
  }
  if (endTime) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    values.push(endTime)
  }
  if (username) {
    whereClause += ` AND username = $${paramIndex++}`
    values.push(username)
  }
  if (tokenName) {
    whereClause += ` AND token_name = $${paramIndex++}`
    values.push(tokenName)
  }
  if (modelName) {
    whereClause += ` AND model_name = $${paramIndex++}`
    values.push(modelName)
  }
  if (type !== undefined) {
    whereClause += ` AND type = $${paramIndex++}`
    values.push(type)
  }

  const countResult = await pool.query(`SELECT COUNT(*) FROM logs ${whereClause}`, values)
  const total = parseInt(countResult.rows[0].count)

  const query = `SELECT * FROM logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
  values.push(limit, offset)

  const result = await pool.query(query, values)
  return { rows: result.rows as LogEntry[], total }
}

export async function getStats(params: {
  startTime?: number
  endTime?: number
  tokenName?: string
}): Promise<{
  totalRequests: number
  totalTokens: number
  totalQuota: number
  activeUsers: number
  usedModels: number
}> {
  const { startTime, endTime, tokenName } = params

  let whereClause = 'WHERE 1=1'
  const values: (string | number)[] = []
  let paramIndex = 1

  if (startTime) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    values.push(startTime)
  }
  if (endTime) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    values.push(endTime)
  }
  if (tokenName) {
    whereClause += ` AND token_name = $${paramIndex++}`
    values.push(tokenName)
  }

  const result = await pool.query(`
    SELECT
      COUNT(*) as total_requests,
      COALESCE(SUM(prompt_tokens + completion_tokens), 0) as total_tokens,
      COALESCE(SUM(quota), 0) as total_quota,
      COUNT(DISTINCT username) as active_users,
      COUNT(DISTINCT model_name) as used_models
    FROM logs
    ${whereClause}
  `, values)

  const row = result.rows[0]
  return {
    totalRequests: parseInt(row.total_requests),
    totalTokens: parseInt(row.total_tokens),
    totalQuota: parseInt(row.total_quota),
    activeUsers: parseInt(row.active_users),
    usedModels: parseInt(row.used_models),
  }
}

export async function aggregateByUser(params: {
  startTime?: number
  endTime?: number
}): Promise<{
  username: string
  token_name: string
  request_count: number
  total_quota: number
  total_tokens: number
  model_count: number
  last_used_at: number
}[]> {
  const { startTime, endTime } = params

  let whereClause = 'WHERE 1=1'
  const values: (string | number)[] = []
  let paramIndex = 1

  if (startTime) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    values.push(startTime)
  }
  if (endTime) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    values.push(endTime)
  }

  const result = await pool.query(`
    SELECT
      username,
      token_name,
      COUNT(*) as request_count,
      SUM(quota) as total_quota,
      SUM(prompt_tokens + completion_tokens) as total_tokens,
      COUNT(DISTINCT model_name) as model_count,
      MAX(created_at) as last_used_at
    FROM logs
    ${whereClause}
    GROUP BY username, token_name
    ORDER BY total_quota DESC
  `, values)

  return result.rows.map(row => ({
    username: row.username,
    token_name: row.token_name,
    request_count: parseInt(row.request_count),
    total_quota: parseInt(row.total_quota),
    total_tokens: parseInt(row.total_tokens),
    model_count: parseInt(row.model_count),
    last_used_at: parseInt(row.last_used_at),
  }))
}

export async function aggregateByModel(params: {
  startTime?: number
  endTime?: number
  tokenName?: string
}): Promise<{
  model_name: string
  request_count: number
  total_quota: number
  total_tokens: number
}[]> {
  const { startTime, endTime, tokenName } = params

  let whereClause = 'WHERE 1=1'
  const values: (string | number)[] = []
  let paramIndex = 1

  if (startTime) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    values.push(startTime)
  }
  if (endTime) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    values.push(endTime)
  }
  if (tokenName) {
    whereClause += ` AND token_name = $${paramIndex++}`
    values.push(tokenName)
  }

  const result = await pool.query(`
    SELECT
      model_name,
      COUNT(*) as request_count,
      SUM(quota) as total_quota,
      SUM(prompt_tokens + completion_tokens) as total_tokens
    FROM logs
    ${whereClause}
    GROUP BY model_name
    ORDER BY total_quota DESC
  `, values)

  return result.rows.map(row => ({
    model_name: row.model_name,
    request_count: parseInt(row.request_count),
    total_quota: parseInt(row.total_quota),
    total_tokens: parseInt(row.total_tokens),
  }))
}
