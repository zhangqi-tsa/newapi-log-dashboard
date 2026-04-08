import { useState, useEffect } from 'react'
import { message, Spin } from 'antd'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import LogTable from '../../components/LogTable'
import { getAllLogs } from '../../services/api'
import { calculateStats } from '../../utils/aggregator'
import type { TimeFilterType, TimeRange, LogItem, StatsCardsData } from '../../types'

export default function LogDetail() {
  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>({ start_timestamp: 0, end_timestamp: 0 })
  const [logs, setLogs] = useState<LogItem[]>([])
  const [statsData, setStatsData] = useState<StatsCardsData>({
    totalRequests: 0,
    totalTokens: 0,
    totalQuota: 0,
    activeUsers: 0,
    usedModels: 0,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (timeRange.start_timestamp || timeRange.end_timestamp) {
      fetchData()
    }
  }, [timeRange, page, pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getAllLogs({
        type: 2, // LogTypeConsume
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        page,
        page_size: pageSize,
      })

      setLogs(result.items || [])
      setTotal(result.total || 0)

      const stats = calculateStats(result.items || [])
      setStatsData(stats)
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeFilterChange = (type: TimeFilterType, range: TimeRange) => {
    setTimeFilter(type)
    setTimeRange(range)
    setPage(1)
  }

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>

      <Spin spinning={loading}>
        <StatsCards data={statsData} loading={loading} />
        <LogTable
          data={logs}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Spin>
    </div>
  )
}