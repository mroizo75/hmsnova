import { createServer } from 'http';
import { Server } from 'socket.io';
import { getIO, setIO } from './store';
import { logger } from '@/lib/utils/logger';
import IORedis from 'ioredis';

/**
 * Starter en Socket.io-server
 * @returns Socket.io server instance
 */
export const startSocketServer = () => {
  try {
    const port = parseInt(process.env.SOCKET_PORT || '3001', 10);
    
    // Hvis IO allerede er satt, returner det
    const existingIO = getIO();
    if (existingIO) {
      logger.info('Socket.io-server allerede startet');
      return existingIO;
    }
    
    // Opprett HTTP-server
    const httpServer = createServer();
    
    // Konfigurer Socket.io med robuste innstillinger
    const io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", process.env.NEXT_PUBLIC_BASE_URL || "*"],
        methods: ["GET", "POST"],
        credentials: true
      },
      // Bruk miljøvariabler for timeouts med fornuftige standardverdier
      pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10), // 25 sekunder
      pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '10000', 10),   // 10 sekunder
      connectTimeout: 45000, // 45 sekunder
      transports: ['websocket', 'polling']
    });
    
    // Håndter tilkoblinger
    io.on('connection', (socket) => {
      logger.info(`Ny socket-tilkobling: ${socket.id}`);
      
      // Støtte for romfunksjonalitet (f.eks. bedriftsspesifikke hendelser)
      socket.on('joinRoom', (room) => {
        socket.join(room);
        logger.info(`Socket ${socket.id} koblet til rom: ${room}`);
      });
      
      socket.on('leaveRoom', (room) => {
        socket.leave(room);
        logger.info(`Socket ${socket.id} forlot rom: ${room}`);
      });
      
      // Ping/pong for å holde tilkoblingen åpen
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback({ status: 'pong', time: Date.now() });
        }
      });
      
      // Feilhåndtering
      socket.on('error', (error) => {
        logger.error(`Socket ${socket.id} feil`, { 
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'socket-server'
        });
      });
      
      socket.on('disconnect', (reason) => {
        logger.info(`Socket ${socket.id} frakoblet. Årsak: ${reason}`);
      });
    });
    
    // Start serveren
    httpServer.listen(port, () => {
      logger.info(`Socket.io-server startet på port ${port}`);
    });
    
    // Legg til feilhåndtering på HTTP-serveren
    httpServer.on('error', (error) => {
      logger.error('HTTP server feil', { 
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'socket-server'
      });
    });
    
    // Sett IO for bruk andre steder i applikasjonen
    setIO(io);
    
    return io;
  } catch (error) {
    logger.error('Feil ved oppstart av Socket.io-server', { 
      error: error instanceof Error ? error : new Error(String(error)),
      context: 'socket-server'
    });
    throw error;
  }
}; 