## Context

当前模型维度页面 (`src/pages/ModelDimension/index.tsx`) 通过 URL 参数 `?token=` 接收用户筛选条件。然而，`filterToken` 使用 `useState(initialToken)` 初始化，仅在建组件时执行一次。当用户从用户明细页面点击特定用户跳转时，React Router 会复用组件而不重新挂载，导致 `filterToken` 保持旧值（空字符串），API 请求不带 `token_name` 参数，最终显示所有用户数据而非特定用户。

## Goals / Non-Goals

**Goals:**
- 修复模型维度页面 `filterToken` 与 URL 参数的同步问题
- 确保从用户明细跳转后，模型维度正确显示特定用户的数据
- 修复统计卡片（总请求数、总 Tokens）显示全部数据的问题

**Non-Goals:**
- 不修改用户明细页面的业务逻辑
- 不修改后端 API 接口
- 不引入新的依赖包

## Decisions

### Decision 1: 使用 useEffect 监听 searchParams 同步 filterToken
- **方案**: 添加 `useEffect` 依赖 `searchParams`，在 URL 参数变化时调用 `setFilterToken`
- **理由**: React 推荐的模式，useState 只负责初始值，后续同步由 effect 处理
- **替代方案**: 使用 `useSearchParams` 的返回值直接作为 `filterToken`——但会失去手动清除筛选的能力（输入框可以清空）

### Decision 2: 保持 fetchData 依赖不变
- **方案**: `fetchData` 仍依赖 `[timeRange, filterToken]`
- **理由**: `filterToken` 更新后会自然触发重新获取数据，无需额外改动

## Risks / Trade-offs

- **额外渲染**: useEffect 同步会导致一次额外的 render，但影响极小
- **手动输入冲突**: 如果用户在输入框手动修改了 filterToken，然后 URL 参数变化，会覆盖手动输入——但这是期望行为，URL 是权威来源
