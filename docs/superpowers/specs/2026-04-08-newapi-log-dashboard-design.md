# New API 使用量看板设计文档

## 项目概述

为 New API（AI API 管理平台）构建一个独立部署的使用量看板，展示每个 AK（Access Key）的使用情况。

## 部署架构

### 部署方式
- **方案**: A1 - 同域名子路径部署
- **路径**: `ai.unitrust.com.cn/dashboard`
- **认证**: 复用 New API session（同域名下 cookie 自动共享）

### 技术栈
- **前端**: React 18 + Ant Design 5 + Vite
- **后端**: 无（纯前端 SPA，直接调用 New API）
- **认证**: 依赖 New API session cookie

### 数据来源
调用 New API 现有接口获取数据：
- `GET /api/log/` - 获取所有日志（AdminAuth）
- `GET /api/log/stat` - 获取统计数据（AdminAuth）
- `GET /api/token/` - 获取 Token 列表（UserAuth）

## 页面设计

### 布局方案
顶部 Tab 导航 + 内容区，简洁风格：

```
┌─────────────────────────────────────────────────┐
│  New API Dashboard                               │
│  [用户明细] [模型维度] [详细日志]    时间筛选     │
├─────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │总请求│ │Tokens│ │Quota│ │活跃用户│ │模型数│       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────────────┤
│                                                 │
│              数据表格区域                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 页面 1: 用户明细

**功能**: 按 AK 名称聚合展示用户使用统计

**表格列**:
| 列名 | 说明 |
|------|------|
| AK 名称 (TokenName) | 用户标识，可点击跳转 |
| 请求次数 | 总 API 调用次数 |
| 消耗额度 (Quota) | 累计消耗的计费额度 |
| Tokens 数 | Prompt + Completion 总和 |
| 使用模型数 | 该 AK 使用的不同模型数 |
| 最后使用时间 | 最近一次 API 调用时间 |

**交互**:
- 点击 AK 名称 → 跳转模型维度页并自动筛选该用户
- 支持时间筛选
- 支持表格排序

### 页面 2: 模型维度

**功能**: 按 AK + 模型聚合展示使用统计

**表格列**:
| 列名 | 说明 |
|------|------|
| AK 名称 (TokenName) | 用户标识，来自筛选或列表 |
| 模型名称 (ModelName) | AI 模型标识 |
| 请求次数 | 该模型的调用次数 |
| 消耗额度 (Quota) | 该模型消耗额度 |
| Tokens 数 | 该模型 tokens 数 |

**交互**:
- 支持按 AK 名称筛选（从用户明细跳转时自动填充）
- 支持时间筛选
- 支持表格排序

### 页面 3: 详细日志

**功能**: 展示原始 API 调用日志列表

**表格列**:
| 列名 | 说明 |
|------|------|
| 时间 | API 调用时间 |
| AK 名称 (TokenName) | 调用的令牌名称 |
| 模型名称 (ModelName) | 调用的模型 |
| Tokens 详情 | Prompt / Completion tokens |
| 消耗额度 | 本次调用消耗的 quota |

**交互**:
- 支持时间筛选
- 支持分页
- 支持排序

### 统计卡片

每个页面顶部展示 5 个统计卡片：
| 卡片 | 说明 |
|------|------|
| 总请求数 | 筛选时间范围内的 API 调用总数 |
| 总 Tokens | Prompt + Completion 总和 |
| 消耗 Quota | 筛选时间范围内的额度消耗 |
| 活跃用户数 | 筛选时间范围内有调用的 AK 数量 |
| 使用模型数 | 筛选时间范围内被调用的模型种类数 |

### 时间筛选

支持 5 种时间筛选方式：
| 选项 | 说明 |
|------|------|
| 今日 | 当天的统计数据 |
| 本周 | 最近 7 天 |
| 本月 | 最近 30 天 / 当月 |
| 自定义 | 用户选择起止日期 |
| 全部时间 | 不限制时间，所有历史数据 |

## 数据流设计

### API 调用流程

```
用户操作 → 前端组件 → 调用 New API → 获取数据 → 本地聚合 → 渲染展示
```

### 数据聚合逻辑

由于 New API 的 `/api/log/` 返回原始日志，前端需要：

1. **用户明细聚合**: 按 `token_name` 分组，计算:
   - `count(*)` → 请求次数
   - `sum(quota)` → 消耗额度
   - `sum(prompt_tokens + completion_tokens)` → Tokens 数
   - `count(distinct model_name)` → 使用模型数
   - `max(created_at)` → 最后使用时间

2. **模型维度聚合**: 按 `token_name + model_name` 分组，计算:
   - `count(*)` → 请求次数
   - `sum(quota)` → 消耗额度
   - `sum(prompt_tokens + completion_tokens)` → Tokens 数

3. **详细日志**: 直接展示，无需聚合

### 性能考虑

- 使用分页查询，避免一次性加载大量数据
- 联合 `start_timestamp` / `end_timestamp` 参数减少数据量
- 前端聚合在合理数据量下可行，大数据量可考虑后端聚合

## 认证设计

### Session 共享机制

New API 使用 gin-session，session 数据存储在 cookie 中：
- `session_id`: session 标识
- `username`: 用户名
- `role`: 用户角色
- `id`: 用户 ID
- `status`: 用户状态

同域名部署时，cookie 自动共享，无需额外认证。

### 权限验证

调用 New API 的 AdminAuth 接口需要：
1. 用户已登录 New API（session cookie 存在）
2. 用户角色 >= AdminUser（role >= 10）

前端需处理未登录/权限不足的情况，跳转 New API 登录页。

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 未登录 | 跳转 New API 登录页 |
| 权限不足 | 提示"需要管理员权限" |
| API 调用失败 | 显示错误提示，允许重试 |
| 数据为空 | 显示"暂无数据" |

## 文件结构

```
newapi-log-dashboard/
├── src/
│   ├── components/
│   │   ├── StatsCards/         # 统计卡片组件
│   │   ├── TimeFilter/         # 时间筛选组件
│   │   ├── UserTable/          # 用户明细表格
│   │   ├── ModelTable/         # 模型维度表格
│   │   └── LogTable/           # 详细日志表格
│   ├── pages/
│   │   ├── UserSummary/        # 用户明细页
│   │   ├── ModelDimension/     # 模型维度页
│   │   └── LogDetail/          # 详细日志页
│   ├── services/
│   │   └── api.ts              # New API 调用封装
│   ├── utils/
│   │   └ aggregator.ts         # 数据聚合工具
│   │   └ time.ts               # 时间处理工具
│   ├── App.tsx                 # 主应用
│   └── main.tsx                # 入口
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 部署配置

### Nginx 配置（New API 服务器）

需要在 New API 的 nginx 配置中添加：

```nginx
location /dashboard {
    alias /path/to/newapi-log-dashboard/dist;
    try_files $uri $uri/ /dashboard/index.html;
}
```

### 环境变量

```env
VITE_NEWAPI_BASE_URL=/api  # New API 接口路径（同域名）
```

## 成功标准

1. 管理员登录 New API 后可直接访问看板
2. 看板正确展示用户明细、模型维度、详细日志
3. 点击用户可跳转查看模型用量
4. 时间筛选功能正常工作
5. 数据统计准确无误