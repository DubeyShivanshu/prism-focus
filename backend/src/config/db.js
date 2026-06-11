import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...')
})

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected')
})

mongoose.connection.on('error', (error) => {
  console.error(`MongoDB error: ${error.message}`)
})

export const disconnectDB = async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed')
}
