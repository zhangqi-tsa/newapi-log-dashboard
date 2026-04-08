# New API 使用量看板实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 New API 构建独立部署的使用量看板，展示 AK 使用统计

**Architecture:** 纯前端 SPA，直接调用 New API 接口，本地聚合数据。Docker 容器化部署，端口 3010，同域名共享登录态。

**Tech Stack:** React 18 + TypeScript + Ant Design 5 + Vite

---

## 文件结构

```
newapi-log-dashboard/
├── src/
│   ├── components/
│   │   ├── StatsCards/
│   │   │   └── index.tsx          # 统计卡片组件
│   │   ├── TimeFilter/
│   │   │   └── index.tsx          # 时间筛选组件
│   │   ├── UserTable/
│   │   │   └── index.tsx          # 用户明细表格
│   │   ├── ModelTable/
│   │   │   └── index.tsx          # 模型维度表格
│   │   └── LogTable/
│   │       └── index.tsx          # 详细日志表格
│   ├── pages/
│   │   ├── UserSummary/
│   │   │   └── index.tsx          # 用户明细页
│   │   ├── ModelDimension/
│   │   │   └── index.tsx          # 模型维度页
│   │   └── LogDetail/
│   │       └── index.tsx          # 详细日志页
│   ├── services/
│   │   └── api.ts                 # New API 调用封装
│   ├── utils/
│   │   ├── aggregator.ts          # 数据聚合工具
│   │   └── time.ts                # 时间处理工具
│   ├── types/
│   │   └── index.ts               # TypeScript 类型定义
│   ├── App.tsx                    # 主应用布局
│   ├── main.tsx                   # 入口
│   └── index.css                  # 全局样式
├── Dockerfile                     # Docker 构建文件
├── docker-compose.yml             # Docker Compose 配置
├── .dockerignore                  # Docker 忽略文件
├── nginx.conf                     # Nginx 配置（容器内）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tsconfig.node.json
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 Vite React TypeScript 项目**

```bash
cd C:/Users/13794/Desktop/workspace/工作/2026/newapi-log-dashboard
npm create vite@latest . -- --template react-ts
```

Expected: 项目文件创建成功

- [ ] **Step 2: 安装依赖**

```bash
npm install antd @ant-design/icons dayjs react-router-dom
```

Expected: 依赖安装成功

- [ ] **Step 3: 配置 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dashboard/',
  server: {
    port: 3010,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: 更新 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/dashboard/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New API Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter basename="/dashboard">
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 6: 创建 src/index.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f2f5;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 7: 更新 .gitignore**

```
node_modules
dist
.env
.env.local
*.log
```

- [ ] **Step 8: 验证项目启动**

```bash
npm run dev
```

Expected: 服务启动在 http://localhost:3010

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: init vite react typescript project with antd"
```

---

### Task 2: TypeScript 类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// 日志项 - 来自 New API /api/log/
export interface LogItem {
  id: number
  user_id: number
  created_at: number
  type: number
  content: string
  username: string
  token_name: string
  model_name: string
  quota: number
  prompt_tokens: number
  completion_tokens: number
  use_time: number
  is_stream: boolean
  channel_id: number
  channel_name: string
  token_id: number
  group: string
}

// 统计数据 - 来自 New API /api/log/stat
export interface StatData {
  quota: number
  rpm: number
  tpm: number
}

// 用户聚合数据
export interface UserAggregate {
  token_name: string
  request_count: number
  total_quota: number
  total_tokens: number
  model_count: number
  last_used_at: number
}

// 模型聚合数据
export interface ModelAggregate {
  token_name: string
  model_name: string
  request_count: number
  total_quota: number
  total_tokens: number
}

// 统计卡片数据
export interface StatsCardsData {
  totalRequests: number
  totalTokens: number
  totalQuota: number
  activeUsers: number
  usedModels: number
}

// 时间筛选选项
export type TimeFilterType = 'today' | 'week' | 'month' | 'custom' | 'all'

// 时间范围
export interface TimeRange {
  start_timestamp: number
  end_timestamp: number
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// 分页信息
export interface PageInfo {
  total: number
  page: number
  page_size: number
  items: LogItem[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add typescript type definitions"
```

---

### Task 3: 时间处理工具

**Files:**
- Create: `src/utils/time.ts`

- [ ] **Step 1: 创建时间工具函数**

```typescript
import dayjs from 'dayjs'

// 获取今日时间范围
export function getTodayRange(): { start_timestamp: number; end_timestamp: number } {
  const today = dayjs().startOf('day')
  return {
    start_timestamp: today.unix(),
    end_timestamp: today.add(1, 'day').unix(),
  }
}

// 获取本周时间范围（最近7天）
export function getWeekRange(): { start_timestamp: number; end_timestamp: number } {
  const now = dayjs()
  return {
    start_timestamp: now.subtract(7, 'day').unix(),
    end_timestamp: now.unix(),
  }
}

// 获取本月时间范围（最近30天）
export function getMonthRange(): { start_timestamp: number; end_timestamp: number } {
  const now = dayjs()
  return {
    start_timestamp: now.subtract(30, 'day').unix(),
    end_timestamp: now.unix(),
  }
}

// 获取全部时间范围
export function getAllTimeRange(): { start_timestamp: number; end_timestamp: number } {
  return {
    start_timestamp: 0,
    end_timestamp: 0,
  }
}

// 根据筛选类型获取时间范围
export function getTimeRangeByType(
  type: 'today' | 'week' | 'month' | 'all'
): { start_timestamp: number; end_timestamp: number } {
  switch (type) {
    case 'today':
      return getTodayRange()
    case 'week':
      return getWeekRange()
    case 'month':
      return getMonthRange()
    case 'all':
    default:
      return getAllTimeRange()
  }
}

// 格式化时间戳为可读字符串
export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化时间戳为日期
export function formatDate(timestamp: number): string {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/time.ts
git commit -m "feat: add time utility functions"
```

---

### Task 4: 数据聚合工具

**Files:**
- Create: `src/utils/aggregator.ts`

- [ ] **Step 1: 创建数据聚合函数**

```typescript
import type { LogItem, UserAggregate, ModelAggregate, StatsCardsData } from '../types'

// 按 token_name 聚合用户数据
export function aggregateByUser(logs: LogItem[]): UserAggregate[] {
  const userMap = new Map<string, {
    request_count: number
    total_quota: number
    total_tokens: number
    last_used_at: number
    models: Set<string>
  }>()

  logs.forEach((log) => {
    const tokenName = log.token_name || '(未命名)'

    if (userMap.has(tokenName)) {
      const existing = userMap.get(tokenName)!
      existing.request_count += 1
      existing.total_quota += log.quota || 0
      existing.total_tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
      if (log.model_name) existing.models.add(log.model_name)
      if (log.created_at > existing.last_used_at) {
        existing.last_used_at = log.created_at
      }
    } else {
      userMap.set(tokenName, {
        request_count: 1,
        total_quota: log.quota || 0,
        total_tokens: (log.prompt_tokens || 0) + (log.completion_tokens || 0),
        last_used_at: log.created_at,
        models: new Set(log.model_name ? [log.model_name] : []),
      })
    }
  })

  // 转换为最终格式
  return Array.from(userMap.entries()).map(([token_name, data]) => ({
    token_name,
    request_count: data.request_count,
    total_quota: data.total_quota,
    total_tokens: data.total_tokens,
    model_count: data.models.size,
    last_used_at: data.last_used_at,
  }))
}

// 按 token_name + model_name 聚合模型数据
export function aggregateByModel(logs: LogItem[]): ModelAggregate[] {
  const modelMap = new Map<string, ModelAggregate>()

  logs.forEach((log) => {
    const key = `${log.token_name || '(未命名)'}_${log.model_name || '(未知)'}`
    const tokenName = log.token_name || '(未命名)'
    const modelName = log.model_name || '(未知)'

    if (modelMap.has(key)) {
      const existing = modelMap.get(key)!
      existing.request_count += 1
      existing.total_quota += log.quota || 0
      existing.total_tokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
    } else {
      modelMap.set(key, {
        token_name: tokenName,
        model_name: modelName,
        request_count: 1,
        total_quota: log.quota || 0,
        total_tokens: (log.prompt_tokens || 0) + (log.completion_tokens || 0),
      })
    }
  })

  return Array.from(modelMap.values())
}

// 计算统计卡片数据
export function calculateStats(logs: LogItem[]): StatsCardsData {
  const users = new Set<string>()
  const models = new Set<string>()
  let totalTokens = 0
  let totalQuota = 0

  logs.forEach((log) => {
    if (log.token_name) users.add(log.token_name)
    if (log.model_name) models.add(log.model_name)
    totalTokens += (log.prompt_tokens || 0) + (log.completion_tokens || 0)
    totalQuota += log.quota || 0
  })

  return {
    totalRequests: logs.length,
    totalTokens,
    totalQuota,
    activeUsers: users.size,
    usedModels: models.size,
  }
}

// 格式化数字（添加千分位）
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/aggregator.ts
git commit -m "feat: add data aggregation utilities"
```

---

### Task 5: API 服务层

**Files:**
- Create: `src/services/api.ts`

- [ ] **Step 1: 创建 API 服务**

```typescript
import type { LogItem, StatData, ApiResponse, PageInfo } from '../types'

const API_BASE = '/api'

// 通用请求函数
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include', // 携带 cookie
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // 未登录或权限不足，跳转登录页
    if (response.status === 401) {
      window.location.href = '/'
      throw new Error('未登录')
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 获取所有日志
export async function getAllLogs(params: {
  type?: number
  start_timestamp?: number
  end_timestamp?: number
  username?: string
  token_name?: string
  model_name?: string
  channel?: number
  group?: string
  page?: number
  page_size?: number
}): Promise<PageInfo> {
  const queryParams = new URLSearchParams()

  if (params.type !== undefined) queryParams.set('type', String(params.type))
  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))
  if (params.username) queryParams.set('username', params.username)
  if (params.token_name) queryParams.set('token_name', params.token_name)
  if (params.model_name) queryParams.set('model_name', params.model_name)
  if (params.channel !== undefined) queryParams.set('channel', String(params.channel))
  if (params.group) queryParams.set('group', params.group)
  if (params.page !== undefined) queryParams.set('p', String(params.page))
  if (params.page_size) queryParams.set('size', String(params.page_size))

  const result = await request<PageInfo>(`/log/?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取日志失败')
  }

  return result.data!
}

// 获取统计数据
export async function getLogsStat(params: {
  type?: number
  start_timestamp?: number
  end_timestamp?: number
  username?: string
  token_name?: string
  model_name?: string
  channel?: number
  group?: string
}): Promise<StatData> {
  const queryParams = new URLSearchParams()

  if (params.type !== undefined) queryParams.set('type', String(params.type))
  if (params.start_timestamp) queryParams.set('start_timestamp', String(params.start_timestamp))
  if (params.end_timestamp) queryParams.set('end_timestamp', String(params.end_timestamp))
  if (params.username) queryParams.set('username', params.username)
  if (params.token_name) queryParams.set('token_name', params.token_name)
  if (params.model_name) queryParams.set('model_name', params.model_name)
  if (params.channel !== undefined) queryParams.set('channel', String(params.channel))
  if (params.group) queryParams.set('group', params.group)

  const result = await request<StatData>(`/log/stat?${queryParams.toString()}`)

  if (!result.success) {
    throw new Error(result.message || '获取统计失败')
  }

  return result.data!
}

// 检查登录状态
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/user/self`, {
      credentials: 'include',
    })
    const result = await response.json()
    return result.success && result.data?.role >= 10 // AdminUser
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/api.ts
git commit -m "feat: add API service layer"
```

---

### Task 6: 时间筛选组件

**Files:**
- Create: `src/components/TimeFilter/index.tsx`

- [ ] **Step 1: 创建时间筛选组件**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TimeFilter/index.tsx
git commit -m "feat: add TimeFilter component"
```

---

### Task 7: 统计卡片组件

**Files:**
- Create: `src/components/StatsCards/index.tsx`

- [ ] **Step 1: 创建统计卡片组件**

```tsx
import { Row, Col, Card, Statistic } from 'antd'
import { ApiOutlined, TokenOutlined, DollarOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons'
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
      icon: <TokenOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatsCards/index.tsx
git commit -m "feat: add StatsCards component"
```

---

### Task 8: 用户明细表格组件

**Files:**
- Create: `src/components/UserTable/index.tsx`

- [ ] **Step 1: 创建用户明细表格组件**

```tsx
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
        <a onClick={() => onUserClick?.(text)}>{text}</a>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/UserTable/index.tsx
git commit -m "feat: add UserTable component"
```

---

### Task 9: 模型维度表格组件

**Files:**
- Create: `src/components/ModelTable/index.tsx`

- [ ] **Step 1: 创建模型维度表格组件**

```tsx
import { Table, Input, Button, Space } from 'antd'
import { SearchOutlined, ClearOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { ColumnsType } from 'antd/es/table'
import type { ModelAggregate } from '../../types'
import { formatNumber } from '../../utils/aggregator'

interface ModelTableProps {
  data: ModelAggregate[]
  loading?: boolean
  initialTokenName?: string
}

export default function ModelTable({ data, loading, initialTokenName }: ModelTableProps) {
  const [filterTokenName, setFilterTokenName] = useState(initialTokenName || '')

  const filteredData = filterTokenName
    ? data.filter((item) => item.token_name.includes(filterTokenName))
    : data

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
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索 AK 名称"
          prefix={<SearchOutlined />}
          value={filterTokenName}
          onChange={(e) => setFilterTokenName(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        {filterTokenName && (
          <Button
            icon={<ClearOutlined />}
            onClick={() => setFilterTokenName('')}
          >
            清除筛选
          </Button>
        )}
      </Space>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => `${record.token_name}_${record.model_name}`}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          defaultPageSize: 20,
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ModelTable/index.tsx
git commit -m "feat: add ModelTable component"
```

---

### Task 10: 详细日志表格组件

**Files:**
- Create: `src/components/LogTable/index.tsx`

- [ ] **Step 1: 创建详细日志表格组件**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LogTable/index.tsx
git commit -m "feat: add LogTable component"
```

---

### Task 11: 用户明细页

**Files:**
- Create: `src/pages/UserSummary/index.tsx`

- [ ] **Step 1: 创建用户明细页**

```tsx
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
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取消费日志 (type=2)
      const result = await getAllLogs({
        type: 2,
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        page: 1,
        page_size: 10000, // 获取足够多的数据进行聚合
      })

      const logs: LogItem[] = result.items || []

      // 聚合用户数据
      const aggregated = aggregateByUser(logs)
      setUserData(aggregated)

      // 计算统计卡片数据
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/UserSummary/index.tsx
git commit -m "feat: add UserSummary page"
```

---

### Task 12: 模型维度页

**Files:**
- Create: `src/pages/ModelDimension/index.tsx`

- [ ] **Step 1: 创建模型维度页**

```tsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { message, Spin, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import ModelTable from '../../components/ModelTable'
import { getAllLogs } from '../../services/api'
import { aggregateByModel, calculateStats } from '../../utils/aggregator'
import type { TimeFilterType, TimeRange, ModelAggregate, StatsCardsData, LogItem } from '../../types'

export default function ModelDimension() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialToken = searchParams.get('token') || ''

  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>({ start_timestamp: 0, end_timestamp: 0 })
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
      const result = await getAllLogs({
        type: 2,
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        token_name: initialToken || undefined,
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
        <ModelTable data={modelData} loading={loading} initialTokenName={initialToken} />
      </Spin>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ModelDimension/index.tsx
git commit -m "feat: add ModelDimension page"
```

---

### Task 13: 详细日志页

**Files:**
- Create: `src/pages/LogDetail/index.tsx`

- [ ] **Step 1: 创建详细日志页**

```tsx
import { useState, useEffect } from 'react'
import { message, Spin } from 'antd'
import StatsCards from '../../components/StatsCards'
import TimeFilter from '../../components/TimeFilter'
import LogTable from '../../components/LogTable'
import { getAllLogs } from '../../services/api'
import { calculateStats } from '../../utils/aggregator'
import type { TimeFilterType, TimeRange, LogItem, StatsCardsData } from '../../types'

export default function LogDetail() {
  const [loading, setLoading] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('week')
  const [timeRange, setTimeRange] = useState<TimeRange>({ start_timestamp: 0, end_timestamp: 0 })
  const [logs, setLogs] = useState<LogItem[]>([])
  const [statsData, setStatsData] = useState<StatsCardsData>({
    totalRequests: 0,
    totalTokens: 0,
    totalQuota: 0,
    activeUsers: 0,
    usedModels: 0,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchData()
  }, [timeRange, page, pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getAllLogs({
        type: 2,
        start_timestamp: timeRange.start_timestamp || undefined,
        end_timestamp: timeRange.end_timestamp || undefined,
        page,
        page_size: pageSize,
      })

      setLogs(result.items || [])
      setTotal(result.total || 0)

      // 使用当前页数据计算统计（简化处理）
      const stats = calculateStats(result.items || [])
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
    setPage(1) // 重置分页
  }

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>

      <Spin spinning={loading}>
        <StatsCards data={statsData} loading={loading} />
        <LogTable
          data={logs}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Spin>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LogDetail/index.tsx
git commit -m "feat: add LogDetail page"
```

---

### Task 14: 主应用布局

**Files:**
- Create: `src/App.tsx`

- [ ] **Step 1: 创建主应用布局**

```tsx
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Result, Spin } from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import UserSummary from './pages/UserSummary'
import ModelDimension from './pages/ModelDimension'
import LogDetail from './pages/LogDetail'
import { checkAuth } from './services/api'

const { Header, Content } = Layout

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const isAuthed = await checkAuth()
      setAuthed(isAuthed)
      if (!isAuthed) {
        // 未登录或权限不足，跳转 New API 登录页
        window.location.href = '/'
      }
    } catch {
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/' || path === '') return 'user'
    if (path === '/model') return 'model'
    if (path === '/log') return 'log'
    return 'user'
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!authed) {
    return (
      <Result
        status="403"
        title="需要管理员权限"
        subTitle="请登录 New API 管理员账户后访问"
      />
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 'bold', marginRight: 32 }}>
          New API Dashboard
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => {
            if (key === 'user') navigate('/')
            else if (key === 'model') navigate('/model')
            else if (key === 'log') navigate('/log')
          }}
          items={[
            { key: 'user', icon: <UserOutlined />, label: '用户明细' },
            { key: 'model', icon: <AppstoreOutlined />, label: '模型维度' },
            { key: 'log', icon: <FileTextOutlined />, label: '详细日志' },
          ]}
          style={{ flex: 1, borderBottom: 'none' }}
        />
      </Header>
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
          <Routes>
            <Route path="/" element={<UserSummary />} />
            <Route path="/model" element={<ModelDimension />} />
            <Route path="/log" element={<LogDetail />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add main App layout with routing"
```

---

### Task 15: Docker 部署配置

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 1: 创建 Dockerfile**

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: 创建 nginx.conf**

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到 New API
    location /api/ {
        proxy_pass http://new-api:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- [ ] **Step 3: 创建 docker-compose.yml**

```yaml
services:
  newapi-dashboard:
    build: .
    container_name: newapi-dashboard
    ports:
      - "3010:80"
    restart: unless-stopped
    networks:
      - newapi_network

networks:
  newapi_network:
    external: true
```

- [ ] **Step 4: 创建 .dockerignore**

```
node_modules
dist
.git
.gitignore
*.md
.env*
.superpowers
```

- [ ] **Step 5: 构建并运行**

```bash
cd C:/Users/13794/Desktop/workspace/工作/2026/newapi-log-dashboard
docker build -t newapi-dashboard .
docker run -d -p 3010:80 --name newapi-dashboard newapi-dashboard
```

Expected: 容器启动成功，访问 http://localhost:3010/dashboard/

- [ ] **Step 6: Commit**

```bash
git add Dockerfile nginx.conf docker-compose.yml .dockerignore
git commit -m "feat: add Docker deployment configuration"
```

---

### Task 16: 最终验证

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 更新 package.json scripts**

确保 package.json 包含正确的 scripts：

```json
{
  "name": "newapi-log-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ant-design/icons": "^5.x",
    "antd": "^5.x",
    "dayjs": "^1.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x"
  }
}
```

- [ ] **Step 2: 本地构建测试**

```bash
cd C:/Users/13794/Desktop/workspace/工作/2026/newapi-log-dashboard
npm run build
```

Expected: 构建成功，生成 dist 目录

- [ ] **Step 3: 最终 Commit**

```bash
git add .
git commit -m "chore: finalize project configuration"
```

---

## 部署步骤

在 VPS 上执行：

```bash
# 1. 进入项目目录
cd /path/to/newapi-log-dashboard

# 2. 构建镜像
docker build -t newapi-dashboard .

# 3. 创建网络（如果不存在）
docker network create newapi_network 2>/dev/null || true

# 4. 运行容器
docker run -d \
  --name newapi-dashboard \
  --network newapi_network \
  -p 3010:80 \
  --restart unless-stopped \
  newapi-dashboard

# 5. 验证
curl http://localhost:3010/dashboard/
```

## Nginx 配置（外层反向代理）

在 VPS 的主 nginx 配置中添加：

```nginx
location /dashboard {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```