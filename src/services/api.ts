import type { LogItem, StatData, ApiResponse, PageInfo } from '../types'

const API_BASE = '/api'

// 通用请求函数
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include', // 携带 cookie
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // 未登录或权限不足，跳转登录页
    if (response.status === 401) {
      window.location.href = '/'
      throw new Error('未登录')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
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

  const result = await request<PageInfo>(`/log/?${queryParams.toString()}`)

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

// 检查登录状态
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/user/self`, {
      credentials: 'include',
    })
    const result = await response.json()
    return result.success && result.data?.role >= 10 // AdminUser
  } catch {
    return false
  }
}