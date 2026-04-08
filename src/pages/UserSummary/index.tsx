import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Spin } from 'antd'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import UserTable from '../../components/UserTable'
import { getAllLogs } from '../../services/api'
import { aggregateByUser, calculateStats } from '../../utils/aggregator'
import type { TimeFilterType, TimeRange, UserAggregate, StatsCardsData, LogItem } from '../../types'

export default function UserSummary() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>({ start_timestamp: 0, end_timestamp: 0 })
  const [userData, setUserData] = useState<UserAggregate[]>([])
  const [statsData, setStatsData] = useState<StatsCardsData>({
    totalRequests: 0,
    totalTokens: 0,
    totalQuota: 0,
    activeUsers: 0,
    usedModels: 0,
  })

  useEffect(() => {
    if (timeRange.start_timestamp || timeRange.end_timestamp) {
      fetchData()
    }
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getAllLogs({
        type: 2, // LogTypeConsume
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        page: 1,
        page_size: 10000,
      })

      const logs: LogItem[] = result.items || []
      const aggregated = aggregateByUser(logs)
      setUserData(aggregated)

      const stats = calculateStats(logs)
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
  }

  const handleUserClick = (tokenName: string) => {
    navigate(`/model?token=${encodeURIComponent(tokenName)}`)
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>

      <Spin spinning={loading}>
        <StatsCards data={statsData} loading={loading} />
        <UserTable data={userData} loading={loading} onUserClick={handleUserClick} />
      </Spin>
    </div>
  )
}