import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UserAggregate } from '../../types'
import { formatTimestamp } from '../../utils/time'
import { formatNumber } from '../../utils/aggregator'

interface UserTableProps {
  data: UserAggregate[]
  loading?: boolean
  onUserClick?: (tokenName: string) => void
}

export default function UserTable({ data, loading, onUserClick }: UserTableProps) {
  const columns: ColumnsType<UserAggregate> = [
    {
      title: 'AK 名称',
      dataIndex: 'token_name',
      key: 'token_name',
      render: (text: string) => (
        <a onClick={() => onUserClick?.(text)} style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
      sorter: (a, b) => a.token_name.localeCompare(b.token_name),
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
    {
      title: '使用模型数',
      dataIndex: 'model_count',
      key: 'model_count',
      align: 'right',
      render: (value: number) => formatNumber(value),
      sorter: (a, b) => a.model_count - b.model_count,
    },
    {
      title: '最后使用时间',
      dataIndex: 'last_used_at',
      key: 'last_used_at',
      render: (value: number) => formatTimestamp(value),
      sorter: (a, b) => a.last_used_at - b.last_used_at,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="token_name"
      loading={loading}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        defaultPageSize: 20,
      }}
    />
  )
}