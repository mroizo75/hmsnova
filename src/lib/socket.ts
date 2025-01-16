import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: SocketIOServer | null = null

export function getIO() {
  return io
}

export default function initSocket(server: NetServer) {
  if (!io) {
    console.log('Initializing Socket.io...')
    io = new SocketIOServer(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-company', (companyId) => {
        socket.join(`company-${companyId}`)
        console.log(`Socket ${socket.id} joined company-${companyId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  return io
} 