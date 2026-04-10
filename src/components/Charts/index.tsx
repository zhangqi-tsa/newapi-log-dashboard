import ReactECharts from 'echarts-for-react'
import type { UserAggregate, ModelAggregate } from '../../types'

interface TokenPieChartProps {
  data: UserAggregate[]
  loading?: boolean
}

export function TokenPieChart({ data, loading }: TokenPieChartProps) {
  const chartData = data.slice(0, 10).map(item => ({
    name: item.token_name,
    value: item.total_tokens,
  }))

  const option = {
    title: {
      text: 'AK Tokens 分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      showLoading={loading}
    />
  )
}

interface ModelBarChartProps {
  data: ModelAggregate[]
  loading?: boolean
}

export function ModelBarChart({ data, loading }: ModelBarChartProps) {
  const topData = data.slice(0, 10)

  const option = {
    title: {
      text: '模型请求次数 Top 10',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: topData.map(item => item.model_name),
      axisLabel: {
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '请求次数',
        type: 'bar',
        data: topData.map(item => item.request_count),
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      showLoading={loading}
    />
  )
}

interface QuotaBarChartProps {
  data: UserAggregate[]
  loading?: boolean
}

export function QuotaBarChart({ data, loading }: QuotaBarChartProps) {
  const topData = data.slice(0, 10)

  const option = {
    title: {
      text: 'AK 消耗额度 Top 10',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: topData.map(item => item.token_name),
      axisLabel: {
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '消耗额度',
        type: 'bar',
        data: topData.map(item => item.total_quota),
        itemStyle: {
          color: '#52c41a',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 300 }}
      showLoading={loading}
    />
  )
}