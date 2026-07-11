require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const analyzeRouter = require('./src/routes/analyze')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api', analyzeRouter)

// Central error handler
app.use((err, req, res, _next) => {
  const status  = err.status  || 500
  const message = err.message || 'Internal server error'
  console.error(`[${status}] ${message}`)
  res.status(status).json({ error: message })
})

app.listen(PORT, () =>
  console.log(`Resume Analyzer API → http://localhost:${PORT}`)
)
