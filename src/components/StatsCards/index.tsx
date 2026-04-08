import { Row, Col, Card, Statistic } from 'antd'
import { ApiOutlined, NumberOutlined, DollarOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { StatsCardsData } from '../../types'
import { formatNumber } from '../../utils/aggregator'

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
    },
    {
      title: '总 Tokens',
      value: data.totalTokens,
      icon: <NumberOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#f6ffed',
    },
    {
      title: '消耗 Quota',
      value: data.totalQuota,
      icon: <DollarOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      color: '#fffbe6',
    },
    {
      title: '活跃用户数',
      value: data.activeUsers,
      icon: <UserOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
    {
      title: '使用模型数',
      value: data.usedModels,
      icon: <AppstoreOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      color: '#e6fffb',
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
            <Statistic
              title={card.title}
              value={card.value}
              formatter={(value) => formatNumber(Number(value))}
              prefix={card.icon}
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}