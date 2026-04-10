import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { message, Spin, Button, Input, Space, Row, Col } from 'antd'
import { ArrowLeftOutlined, ClearOutlined } from '@ant-design/icons'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import { ModelBarChart } from '../../components/Charts'
import { getAllLogs } from '../../services/api'
import { aggregateByModel, calculateStats } from '../../utils/aggregator'
import { formatNumber } from '../../utils/aggregator'
import { getTimeRangeByType } from '../../utils/time'
import type { TimeFilterType, TimeRange, ModelAggregate, StatsCardsData, LogItem } from '../../types'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export default function ModelDimension() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialToken = searchParams.get('token') || ''

  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>(() => getTimeRangeByType('week'))
  const [modelData, setModelData] = useState<ModelAggregate[]>([])
  const [filterToken, setFilterToken] = useState(initialToken)
  const [statsData, setStatsData] = useState<StatsCardsData>({
    totalRequests: 0,
    totalTokens: 0,
    totalQuota: 0,
    activeUsers: 0,
    usedModels: 0,
  })

  useEffect(() => {
    fetchData()
  }, [timeRange, filterToken])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getAllLogs({
        type: 2,
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        token_name: filterToken || undefined,
        page: 1,
        page_size: 10000,
      })

      const logs: LogItem[] = result.items || []
      const aggregated = aggregateByModel(logs)
      setModelData(aggregated)

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

  const columns: ColumnsType<ModelAggregate> = [
    {
      title: 'AK 名称',
      dataIndex: 'token_name',
      key: 'token_name',
      sorter: (a, b) => a.token_name.localeCompare(b.token_name),
    },
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
      render: (value: number) => formatNumber(value),
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

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索 AK 名称"
          value={filterToken}
          onChange={(e) => setFilterToken(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        {filterToken && (
          <Button icon={<ClearOutlined />} onClick={() => setFilterToken('')}>
            清除筛选
          </Button>
        )}
      </Space>

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
          rowKey={(record) => `${record.token_name}_${record.model_name}`}
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