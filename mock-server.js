import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// Mock session cookie
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
  next()
})

// Auth check - always return true
app.get('/api/user/self', (req, res) => {
  res.json({
    success: true,
    message: '',
    data: {
      id: 1,
      username: 'admin',
      display_name: 'Admin',
      role: 100, // admin
    }
  })
})

// Generate mock logs
function generateMockLogs(count = 100) {
  const logs = []
  const tokens = ['AK-001', 'AK-002', 'AK-003', 'AK-004', 'AK-005']
  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro']

  for (let i = 0; i < count; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)]
    const model = models[Math.floor(Math.random() * models.length)]
    const promptTokens = Math.floor(Math.random() * 500) + 50
    const completionTokens = Math.floor(Math.random() * 1000) + 100
    const totalTokens = promptTokens + completionTokens
    const quota = totalTokens * 0.001

    logs.push({
      id: i + 1,
      created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 7 * 24 * 3600),
      token_name: token,
      model_name: model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      quota: quota,
      content: `Request ${i + 1}`,
      detail: JSON.stringify({
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens
      })
    })
  }

  return logs.sort((a, b) => b.created_at - a.created_at)
}

const allLogs = generateMockLogs(500)

// Get all logs with pagination
app.get('/api/log/', (req, res) => {
  const { page = 1, page_size = 20, start_timestamp, end_timestamp, type, token_name } = req.query

  let filteredLogs = allLogs

  if (start_timestamp) {
    filteredLogs = filteredLogs.filter(log => log.created_at >= parseInt(start_timestamp))
  }
  if (end_timestamp) {
    filteredLogs = filteredLogs.filter(log => log.created_at <= parseInt(end_timestamp))
  }
  if (token_name) {
    filteredLogs = filteredLogs.filter(log => log.token_name === token_name)
  }

  const start = (parseInt(page) - 1) * parseInt(page_size)
  const items = filteredLogs.slice(start, start + parseInt(page_size))

  res.json({
    success: true,
    message: '',
    data: {
      items,
      total: filteredLogs.length,
      page: parseInt(page),
      page_size: parseInt(page_size),
    }
  })
})

// Log stats
app.get('/api/log/stat', (req, res) => {
  const totalTokens = allLogs.reduce((sum, log) => sum + log.total_tokens, 0)
  const totalQuota = allLogs.reduce((sum, log) => sum + log.quota, 0)

  res.json({
    success: true,
    message: '',
    data: {
      total_requests: allLogs.length,
      total_tokens: totalTokens,
      total_quota: totalQuota,
    }
  })
})

app.listen(3000, '127.0.0.1', () => {
  console.log('Mock New API server running at http://127.0.0.1:3000')
})