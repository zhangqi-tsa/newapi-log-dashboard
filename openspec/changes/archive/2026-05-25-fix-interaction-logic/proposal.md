## Why

用户明细页面点击特定用户跳转到模型维度页面时，模型维度未正确过滤该用户数据，仍显示所有用户汇总。这破坏了用户期望的"查看特定用户模型维度"的交互流程，导致数据不准确。

## What Changes

- 修复模型维度页面 `filterToken` 未从 URL 参数同步的问题
- 修复后，从用户明细跳转到模型维度时正确显示特定用户的模型使用数据
- 修复总请求数、总 Tokens 等统计卡片显示全部数据而非特定用户数据的问题

## Capabilities

### New Capabilities
- `model-filter-sync`: 模型维度页面的用户筛选与 URL 参数同步

### Modified Capabilities
- `user-detail-navigation`: 用户明细到模型维度的跳转交互修复

## Impact

- 影响文件：`src/pages/ModelDimension/index.tsx`
- 交互影响：用户明细 → 模型维度的跳转链路
- 数据影响：模型维度页面的 API 请求参数