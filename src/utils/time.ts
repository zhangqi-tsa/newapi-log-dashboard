import dayjs from 'dayjs'

// 获取今日时间范围
export function getTodayRange(): { start_timestamp: number; end_timestamp: number } {
  const today = dayjs().startOf('day')
  return {
    start_timestamp: today.unix(),
    end_timestamp: today.add(1, 'day').unix(),
  }
}

// 获取本周时间范围（最近7天）
export function getWeekRange(): { start_timestamp: number; end_timestamp: number } {
  const now = dayjs()
  return {
    start_timestamp: now.subtract(7, 'day').unix(),
    end_timestamp: now.unix(),
  }
}

// 获取本月时间范围（最近30天）
export function getMonthRange(): { start_timestamp: number; end_timestamp: number } {
  const now = dayjs()
  return {
    start_timestamp: now.subtract(30, 'day').unix(),
    end_timestamp: now.unix(),
  }
}

// 获取全部时间范围
export function getAllTimeRange(): { start_timestamp: number; end_timestamp: number } {
  return {
    start_timestamp: 0,
    end_timestamp: 0,
  }
}

// 根据筛选类型获取时间范围
export function getTimeRangeByType(
  type: 'today' | 'week' | 'month' | 'all'
): { start_timestamp: number; end_timestamp: number } {
  switch (type) {
    case 'today':
      return getTodayRange()
    case 'week':
      return getWeekRange()
    case 'month':
      return getMonthRange()
    case 'all':
    default:
      return getAllTimeRange()
  }
}

// 格式化时间戳为可读字符串
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化时间戳为日期
export function formatDate(timestamp: number): string {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD')
}