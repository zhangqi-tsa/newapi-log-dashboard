# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个 NewAPI 日志仪表盘应用，用于可视化和分析 API 使用日志。基于 React + TypeScript + Vite 构建，使用 Ant Design 作为 UI 组件库，Recharts 用于数据可视化。

## Development Commands

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## Architecture

### 技术栈
- **构建工具**: Vite 6.x
- **前端框架**: React 19.x + TypeScript 5.x
- **UI 组件库**: Ant Design 5.x
- **路由**: React Router 7.x
- **图表**: Recharts 2.x
- **时间处理**: Day.js

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Charts/         # 数据图表组件（使用 Recharts）
│   ├── LogTable/       # 日志表格组件
│   ├── StatsCards/     # 统计卡片组件
│   ├── TimeFilter/     # 时间筛选组件
│   └── UserTable/      # 用户表格组件
├── pages/              # 页面级组件
│   ├── Login/          # 登录页
│   ├── LogDetail/      # 日志详情页
│   ├── ModelDimension/ # 模型维度统计页
│   └── UserSummary/    # 用户汇总页
├── services/           # API 服务
│   └── api.ts          # 后端接口封装
├── types/              # TypeScript 类型定义
│   └── index.ts        # 全局类型
└── utils/              # 工具函数
    ├── aggregator.ts   # 数据聚合工具
    └── time.ts         # 时间处理工具
```

### 路由结构

应用使用 React Router 的 BrowserRouter，路由定义在 `App.tsx` 中：

- `/` - 日志详情页（默认首页）
- `/users` - 用户汇总统计
- `/models` - 模型维度统计

### 状态管理

- 使用 React 的 `useState` 和 `useEffect` 进行本地状态管理
- 时间筛选状态通过 URL query 参数传递（`useSearchParams`）
- 登录状态通过 localStorage 存储 token

### API 集成

后端 API 封装在 `src/services/api.ts`，主要端点：

- `GET /api/log` - 获取日志列表
- `GET /api/log/search` - 搜索日志
- `GET /api/user/summary` - 获取用户汇总数据
- `GET /api/model/dimension` - 获取模型维度数据

### 时间处理约定

时间戳统一使用 Unix 秒级时间戳（非毫秒）。时间范围工具函数位于 `src/utils/time.ts`：

- `getTodayRange()` - 今日 00:00:00 到明日 00:00:00
- `getWeekRange()` - 最近 7 天
- `getMonthRange()` - 最近 30 天
- `getAllTimeRange()` - 全部时间（返回 0, 0）

### 数据聚合

`src/utils/aggregator.ts` 提供客户端数据聚合功能：

- `aggregateByUser()` - 按用户聚合消费数据
- `aggregateByModel()` - 按模型聚合使用数据

### 样式约定

- 使用 Ant Design 的 `style` 属性进行内联样式定义
- 全局基础样式在 `src/index.css`
- 布局使用 Ant Design 的 Grid 系统（Row/Col）
- 响应式断点：xs(<576px), sm(≥576px), md(≥768px), lg(≥992px), xl(≥1200px)

### 类型定义

主要数据类型定义在 `src/types/index.ts`：

- `LogEntry` - 单条日志记录
- `UserSummary` - 用户汇总数据
- `ModelDimension` - 模型维度数据
- `TimeRangeType` - 时间范围类型（'today' | 'week' | 'month' | 'all'）

## 开发注意事项

1. **时间戳格式**: 所有时间戳使用 Unix 秒级（非毫秒），与后端保持一致
2. **图表数据**: Charts 组件接收聚合后的数据，原始数据转换在父组件完成
3. **路由跳转**: 时间筛选状态通过 URL query 参数保持，刷新页面后状态不丢失
4. **API 错误**: 当前使用 console.error 输出错误，生产环境需要添加错误边界处理

## 部署指南

### 生产环境部署步骤

```bash
# 1. 安装依赖并构建
npm install
npm run build
# 生成 dist 目录

# 2. 将 dist 目录部署到静态目录
rm -rf /var/www/dashboard
cp -r dist /var/www/dashboard

# 3. 重载 nginx
nginx -t && nginx -s reload
```

### Nginx 配置

在 `ai.unitrust.com.cn` server block 中添加：

```nginx
location /dashboard/ {
    alias /var/www/dashboard/;
    index index.html;
    try_files $uri $uri/ /dashboard/index.html;
}

location /api/ {
    # 代理到 New API 后端
    # 确保与现有 API 配置一致
}
```

### 验证部署

1. 先登录 https://ai.unitrust.com.cn
2. 访问 https://ai.unitrust.com.cn/dashboard/
3. 应显示日志统计数据，不再跳转
