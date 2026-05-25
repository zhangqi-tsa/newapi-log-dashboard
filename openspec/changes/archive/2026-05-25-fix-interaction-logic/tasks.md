## 1. Fix filterToken synchronization in ModelDimension

- [x] 1.1 Add `useEffect` in `src/pages/ModelDimension/index.tsx` to sync `filterToken` from URL `searchParams`
- [x] 1.2 Verify the fix: navigate from UserSummary to ModelDimension with `?token=` and confirm filtered data is displayed
- [x] 1.3 Verify stats cards show correct filtered totals (not all users)