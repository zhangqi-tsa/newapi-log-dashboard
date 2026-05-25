import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { message, Spin, Button, Row, Col, Table, Tooltip } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import { ModelBarChart } from '../../components/Charts'
import { getModelDimension, getLogsStat } from '../../services/api'
import { formatNumber, formatQuota } from '../../utils/aggregator'
import { getTimeRangeByType } from '../../utils/time'
import type { TimeFilterType, TimeRange, ModelAggregate, StatsCardsData } from '../../types'
import type { ColumnsType } from 'antd/es/table'

export default function ModelDimension() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialToken = searchParams.get('token') || ''

  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>(() => getTimeRangeByType('week'))
  const [modelData, setModelData] = useState<ModelAggregate[]>([])
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
      const [modelResult, statResult] = await Promise.all([
        getModelDimension({
          start_timestamp: timeRange.start_timestamp || undefined,
          end_timestamp: timeRange.end_timestamp || undefined,
        }),
        getLogsStat({
          start_timestamp: timeRange.start_timestamp || undefined,
          end_timestamp: timeRange.end_timestamp || undefined,
        }),
      ])

      setModelData(modelResult)
      setStatsData({
        totalRequests: statResult.rpm,
        totalTokens: statResult.tpm,
        totalQuota: statResult.quota,
        activeUsers: 0,
        usedModels: modelResult.length,
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

  const columns: ColumnsType<ModelAggregate> = [
    {
      title: '模型名称',
      dataIndex: 'model_name',
      key: 'model_name',
      sorter: (a, b) => a.model_name.localeCompare(b.model_name),
    },
    {
      title: '请求次数',
      dataIndex: 'request_count',
      key: 'request_count',
      align: 'right',
      render: (value: number) => formatNumber(value),
      sorter: (a, b) => a.request_count - b.request_count,
      defaultSortOrder: 'descend',
    },
    {
      title: '消耗额度',
      dataIndex: 'total_quota',
      key: 'total_quota',
      align: 'right',
      render: (value: number) => (
        <Tooltip title={formatNumber(value)}>
          {formatQuota(value)}
        </Tooltip>
      ),
      sorter: (a, b) => a.total_quota - b.total_quota,
    },
    {
      title: 'Tokens 数',
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      align: 'right',
      render: (value: number) => formatNumber(value),
      sorter: (a, b) => a.total_tokens - b.total_tokens,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialToken && (
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回用户明细
          </Button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
        </div>
      </div>

      {initialToken && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#e6f7ff', borderRadius: 4 }}>
          当前筛选: AK = <strong>{initialToken}</strong>
        </div>
      )}

      <Spin spinning={loading}>
        <StatsCards data={statsData} loading={loading} />
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <ModelBarChart data={modelData} loading={loading} />
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={modelData}
          rowKey={(record) => record.model_name}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            defaultPageSize: 20,
          }}
        />
      </Spin>
    </div>
  )
}