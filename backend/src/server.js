import http from 'http'
import { Server } from 'socket.io'

import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'

// HTTP Server 
const server = http.createServer(app)

// Socket.io 
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Reconnection settings
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Attach io to app so controllers can emit events
app.set('io', io)

// Socket Event Handlers 
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  // Join user's personal room for targeted events
  socket.on('join_user_room', (userId) => {
    socket.join(`user:${userId}`)
    console.log(`   ↳ ${socket.id} joined room user:${userId}`)
  })

  // import { registerStreakHandlers } from './sockets/streakHandler.js'
  // import { registerLeaderboardHandlers } from './sockets/leaderboardHandler.js'
  // registerStreakHandlers(io, socket)
  // registerLeaderboardHandlers(io, socket)

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (${reason})`)
  })
})

// Startup 
const start = async () => {
  await connectDB()

  server.listen(env.PORT, () => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`  🔷 Prism Backend`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`  🌍 Env:    ${env.NODE_ENV}`)
    console.log(`  🚀 Port:   ${env.PORT}`)
    console.log(`  ✅ Health: http://localhost:${env.PORT}/api/health`)
    console.log(`  🔌 Socket: ws://localhost:${env.PORT}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  })
}

start()

// Graceful Shutdown 
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`)
  server.close(() => {
    console.log('✅ HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

export { io, server }
