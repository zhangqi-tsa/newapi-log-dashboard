import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message, Spin, Row, Col } from 'antd'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import UserTable from '../../components/UserTable'
import { TokenPieChart, QuotaBarChart } from '../../components/Charts'
import { getUserSummary, getLogsStat } from '../../services/api'
import { getTimeRangeByType } from '../../utils/time'
import type { TimeFilterType, TimeRange, UserAggregate, StatsCardsData } from '../../types'

export default function UserSummary() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>(() => getTimeRangeByType('week'))
  const [userData, setUserData] = useState<UserAggregate[]>([])
  const [statsData, setStatsData] = useState<StatsCardsData>({
    totalRequests: 0,
    totalTokens: 0,
    totalQuota: 0,
    activeUsers: 0,
    usedModels: 0,
  })

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userResult, statResult] = await Promise.all([
        getUserSummary({
          start_timestamp: timeRange.start_timestamp || undefined,
          end_timestamp: timeRange.end_timestamp || undefined,
        }),
        getLogsStat({
          start_timestamp: timeRange.start_timestamp || undefined,
          end_timestamp: timeRange.end_timestamp || undefined,
        }),
      ])

      setUserData(userResult)
      setStatsData({
        totalRequests: statResult.rpm,
        totalTokens: statResult.tpm,
        totalQuota: statResult.quota,
        activeUsers: userResult.length,
        usedModels: 0,
      })
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
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <TokenPieChart data={userData} loading={loading} />
          </Col>
          <Col span={12}>
            <QuotaBarChart data={userData} loading={loading} />
          </Col>
        </Row>
        <UserTable data={userData} loading={loading} onUserClick={handleUserClick} />
      </Spin>
    </div>
  )
}