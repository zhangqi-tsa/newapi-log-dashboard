// 日志项 - 来自 New API /api/log/
export interface LogItem {
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

// 统计数据 - 来自 New API /api/log/stat
export interface StatData {
  quota: number
  rpm: number
  tpm: number
}

// 用户聚合数据
export interface UserAggregate {
  token_name: string
  request_count: number
  total_quota: number
  total_tokens: number
  model_count: number
  last_used_at: number
}

// 模型聚合数据
export interface ModelAggregate {
  token_name: string
  model_name: string
  request_count: number
  total_quota: number
  total_tokens: number
}

// 统计卡片数据
export interface StatsCardsData {
  totalRequests: number
  totalTokens: number
  totalQuota: number
  activeUsers: number
  usedModels: number
}

// 时间筛选选项
export type TimeFilterType = 'today' | 'week' | 'month' | 'custom' | 'all'

// 时间范围
export interface TimeRange {
  start_timestamp: number
  end_timestamp: number
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// 分页信息
export interface PageInfo {
  total: number
  page: number
  page_size: number
  items: LogItem[]
}