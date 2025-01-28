import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export async function GET() {
  try {
    const headersList = await headers()
    const protocol = await headersList.get('x-forwarded-proto') || 'http'
    const host = await headersList.get('host') || 'localhost:3001'
    const origin = `${protocol}://${host}`

    if (!io) {
      const httpServer = createServer()
      io = new SocketIOServer(httpServer, {
        cors: {
          origin,
          methods: ['GET', 'POST'],
          credentials: true
        },
        path: '/api/socketio'
      })

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id)
        })
      })

      const port = parseInt(process.env.SOCKET_PORT || '3008', 10)
      httpServer.listen(port, () => {
        console.log(`Socket.IO server running on port ${port}`)
      })
    }

    return new NextResponse('Socket.IO server running', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
      },
    })
  } catch (error) {
    console.error('Socket.IO error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' 