import type { LogItem, UserAggregate, ModelAggregate, StatsCardsData } from '../types'

// 按 token_name 聚合用户数据
export function aggregateByUser(logs: LogItem[]): UserAggregate[] {
  const userMap = new Map<string, {
    request_count: number
    total_quota: number
    total_tokens: number
    last_used_at: number
    models: Set<string>
  }>()

  logs.forEach((log) => {
    const tokenName = log.token_name || '(未命名)'

    if (userMap.has(tokenName)) {
      const existing = userMap.get(tokenName)!
      existing.request_count += 1
      existing.total_quota += log.quota || 0
      existing.total_tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
      if (log.model_name) existing.models.add(log.model_name)
      if (log.created_at > existing.last_used_at) {
        existing.last_used_at = log.created_at
      }
    } else {
      userMap.set(tokenName, {
        request_count: 1,
        total_quota: log.quota || 0,
        total_tokens: (log.prompt_tokens || 0) + (log.completion_tokens || 0),
        last_used_at: log.created_at,
        models: new Set(log.model_name ? [log.model_name] : []),
      })
    }
  })

  // 转换为最终格式
  return Array.from(userMap.entries()).map(([token_name, data]) => ({
    username: '',
    token_name,
    request_count: data.request_count,
    total_quota: data.total_quota,
    total_tokens: data.total_tokens,
    model_count: data.models.size,
    last_used_at: data.last_used_at,
  }))
}

// 按 token_name + model_name 聚合模型数据
export function aggregateByModel(logs: LogItem[]): ModelAggregate[] {
  const modelMap = new Map<string, ModelAggregate>()

  logs.forEach((log) => {
    const key = `${log.token_name || '(未命名)'}_${log.model_name || '(未知)'}`
    const tokenName = log.token_name || '(未命名)'
    const modelName = log.model_name || '(未知)'

    if (modelMap.has(key)) {
      const existing = modelMap.get(key)!
      existing.request_count += 1
      existing.total_quota += log.quota || 0
      existing.total_tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
    } else {
      modelMap.set(key, {
        token_name: tokenName,
        model_name: modelName,
        request_count: 1,
        total_quota: log.quota || 0,
        total_tokens: (log.prompt_tokens || 0) + (log.completion_tokens || 0),
      })
    }
  })

  return Array.from(modelMap.values())
}

// 计算统计卡片数据
export function calculateStats(logs: LogItem[]): StatsCardsData {
  const users = new Set<string>()
  const models = new Set<string>()
  let totalTokens = 0
  let totalQuota = 0

  logs.forEach((log) => {
    if (log.token_name) users.add(log.token_name)
    if (log.model_name) models.add(log.model_name)
    totalTokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
    totalQuota += log.quota || 0
  })

  return {
    totalRequests: logs.length,
    totalTokens,
    totalQuota,
    activeUsers: users.size,
    usedModels: models.size,
  }
}

// 格式化数字（添加千分位）
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

// 格式化额度（使用 K M B 单位）
export function formatQuota(num: number): string {
  if (num === 0) return '0'
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
  return (num / 1000000000).toFixed(1) + 'B'
}

// 格式化额度显示（带详细数字的 tooltip）
export function formatQuotaWithFull(num: number): { display: string; full: string } {
  return {
    display: formatQuota(num),
    full: formatNumber(num)
  }
}