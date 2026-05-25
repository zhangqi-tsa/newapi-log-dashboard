import { Row, Col, Card, Statistic, Tooltip } from 'antd'
import { ApiOutlined, NumberOutlined, DollarOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { StatsCardsData } from '../../types'
import { formatNumber, formatQuota } from '../../utils/aggregator'

interface StatsCardsProps {
  data: StatsCardsData
  loading?: boolean
}

export default function StatsCards({ data, loading }: StatsCardsProps) {
  const cards = [
    {
      title: '总请求数',
      value: data.totalRequests,
      icon: <ApiOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#e6f7ff',
      formatter: (v: number) => formatNumber(v),
    },
    {
      title: '总 Tokens',
      value: data.totalTokens,
      icon: <NumberOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#f6ffed',
      formatter: (v: number) => formatNumber(v),
    },
    {
      title: '消耗 Quota',
      value: data.totalQuota,
      icon: <DollarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      color: '#fffbe6',
      formatter: (v: number) => formatQuota(v),
      tooltip: (v: number) => formatNumber(v),
    },
    {
      title: '活跃用户数',
      value: data.activeUsers,
      icon: <UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff',
      formatter: (v: number) => formatNumber(v),
    },
    {
      title: '使用模型数',
      value: data.usedModels,
      icon: <AppstoreOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      color: '#e6fffb',
      formatter: (v: number) => formatNumber(v),
    },
  ]

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      {cards.map((card, index) => (
        <Col key={index} flex={1}>
          <Card
            style={{ backgroundColor: card.color }}
            bodyStyle={{ padding: '16px 24px' }}
            loading={loading}
          >
            <Tooltip title={card.tooltip ? card.tooltip(card.value) : undefined}>
              <Statistic
                title={card.title}
                value={card.value}
                formatter={(value) => card.formatter(Number(value))}
                prefix={card.icon}
              />
            </Tooltip>
          </Card>
        </Col>
      ))}
    </Row>
  )
}