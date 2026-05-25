import type { StatData, ApiResponse, PageInfo } from '../types'

const API_BASE = '/dashboard/api'
const AUTH_TOKEN_KEY = 'dashboard_auth'
const ACCESS_TOKEN_KEY = 'dashboard_access_token'

// 获取存储的 access_token
function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

// 存储 access_token
function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

// 清除 access_token
function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

// 获取存储的登录状态
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

// 存储登录状态
function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

// 清除登录状态
function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// 通用请求函数
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  }

  // 如果有 access_token，添加到请求头
  const accessToken = getAccessToken()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include', // 携带 cookie
    headers,
  })

  if (response.status === 401) {
    // 未登录，清除状态
    clearAuthToken()
    clearAccessToken()
    throw new Error('未登录')
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 登录 - 支持用户名密码或 access_token
export async function login(username: string, password: string, accessToken?: string): Promise<boolean> {
  try {
    // 如果提供了 access_token，先尝试用 access_token 验证
    if (accessToken) {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ access_token: accessToken }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setAccessToken(accessToken)
        setAuthToken(JSON.stringify(result.data))
        return true
      }
    }

    // 使用用户名密码登录
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const result = await response.json()

    if (result.success && result.data) {
      setAuthToken(JSON.stringify(result.data))
      return true
    }
    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

// 检查登录状态
export async function checkAuth(): Promise<boolean> {
  // 先检查 localStorage
  const authData = getAuthToken()
  const accessToken = getAccessToken()

  if (!authData && !accessToken) {
    return false
  }

  try {
    // 验证 cookie 或 access_token 是否有效
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${API_BASE}/auth/check`, {
      credentials: 'include',
      headers,
    })
    const result = await response.json()

    if (!result.success) {
      clearAuthToken()
      clearAccessToken()
      return false
    }

    return true
  } catch (error) {
    clearAuthToken()
    clearAccessToken()
    return false
  }
}

// 退出登录
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
  clearAuthToken()
  clearAccessToken()
}

// 获取所有日志
export async function getAllLogs(params: {
  type?: number
  start_timestamp?: number
  end_timestamp?: number
  username?: string
  token_name?: string
  model_name?: string
  channel?: number
  group?: string
  page?: number
  page_size?: number
}): Promise<PageInfo> {
  const queryParams = new URLSearchParams()

  if (params.type !== undefined) queryParams.set('type', String(params.type))
  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))
  if (params.username) queryParams.set('username', params.username)
  if (params.token_name) queryParams.set('token_name', params.token_name)
  if (params.model_name) queryParams.set('model_name', params.model_name)
  if (params.channel !== undefined) queryParams.set('channel', String(params.channel))
  if (params.group) queryParams.set('group', params.group)
  if (params.page !== undefined) queryParams.set('p', String(params.page))
  if (params.page_size) queryParams.set('size', String(params.page_size))

  const result = await request<PageInfo>(`/log?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取日志失败')
  }

  return result.data!
}

// 获取统计数据
export async function getLogsStat(params: {
  type?: number
  start_timestamp?: number
  end_timestamp?: number
  username?: string
  token_name?: string
  model_name?: string
  channel?: number
  group?: string
}): Promise<StatData> {
  const queryParams = new URLSearchParams()

  if (params.type !== undefined) queryParams.set('type', String(params.type))
  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))
  if (params.username) queryParams.set('username', params.username)
  if (params.token_name) queryParams.set('token_name', params.token_name)
  if (params.model_name) queryParams.set('model_name', params.model_name)
  if (params.channel !== undefined) queryParams.set('channel', String(params.channel))
  if (params.group) queryParams.set('group', params.group)

  const result = await request<StatData>(`/log/stat?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取统计失败')
  }

  return result.data!
}

// 获取用户汇总数据
export async function getUserSummary(params: {
  start_timestamp?: number
  end_timestamp?: number
}) {
  const queryParams = new URLSearchParams()

  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))

  const result = await request<any>(`/user/summary?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取用户汇总失败')
  }

  return result.data!
}

// 获取模型维度数据
export async function getModelDimension(params: {
  start_timestamp?: number
  end_timestamp?: number
}) {
  const queryParams = new URLSearchParams()

  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))

  const result = await request<any>(`/model/dimension?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取模型维度失败')
  }

  return result.data!
}
