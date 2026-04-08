import { useState } from 'react'
import { Radio, DatePicker, Space } from 'antd'
import type { TimeFilterType, TimeRange } from '../../types'
import { getTimeRangeByType } from '../../utils/time'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface TimeFilterProps {
  value: TimeFilterType
  onChange: (type: TimeFilterType, range: TimeRange) => void
}

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
  const [customDates, setCustomDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  const handleTypeChange = (type: TimeFilterType) => {
    if (type === 'custom') {
      // 切换到自定义时，不立即触发 onChange，等用户选择日期
      return
    }
    setCustomDates(null)
    const range = getTimeRangeByType(type as 'today' | 'week' | 'month' | 'all')
    onChange(type, range)
  }

  const handleCustomDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    setCustomDates(dates)
    if (dates && dates[0] && dates[1]) {
      onChange('custom', {
        start_timestamp: dates[0].startOf('day').unix(),
        end_timestamp: dates[1].endOf('day').unix(),
      })
    }
  }

  return (
    <Space>
      <Radio.Group
        value={value === 'custom' ? undefined : value}
        onChange={(e) => handleTypeChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
      >
        <Radio.Button value="today">今日</Radio.Button>
        <Radio.Button value="week">本周</Radio.Button>
        <Radio.Button value="month">本月</Radio.Button>
        <Radio.Button value="all">全部</Radio.Button>
      </Radio.Group>
      <RangePicker
        value={customDates}
        onChange={handleCustomDateChange}
        placeholder={['开始日期', '结束日期']}
        style={{ width: 240 }}
      />
    </Space>
  )
}