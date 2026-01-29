require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const formsRouter = require('./routes/forms')

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// API routes
app.use('/api/forms', formsRouter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Serve static files from frontend build (for production)
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(frontendPath))

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'))
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   CCFS Forms API Server                           ║
    ║   Running on port ${PORT}                            ║
    ║                                                   ║
    ║   API Base URL: http://localhost:${PORT}/api        ║
    ║   Health Check: http://localhost:${PORT}/api/health ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
  `)
})

module.exports = app
