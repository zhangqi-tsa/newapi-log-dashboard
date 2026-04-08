import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { LogItem } from '../../types'
import { formatTimestamp } from '../../utils/time'
import { formatNumber } from '../../utils/aggregator'

interface LogTableProps {
  data: LogItem[]
  loading?: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}

export default function LogTable({
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
}: LogTableProps) {
  const columns: ColumnsType<LogItem> = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (value: number) => formatTimestamp(value),
      sorter: true,
    },
    {
      title: 'AK 名称',
      dataIndex: 'token_name',
      key: 'token_name',
      width: 150,
    },
    {
      title: '模型名称',
      dataIndex: 'model_name',
      key: 'model_name',
      width: 200,
    },
    {
      title: 'Tokens 详情',
      key: 'tokens',
      width: 150,
      render: (_, record) => (
        <span>
          {formatNumber(record.prompt_tokens || 0)} / {formatNumber(record.completion_tokens || 0)}
        </span>
      ),
    },
    {
      title: '消耗额度',
      dataIndex: 'quota',
      key: 'quota',
      width: 120,
      align: 'right',
      render: (value: number) => formatNumber(value || 0),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPageChange,
      }}
    />
  )
}