import { Server } from 'socket.io';

let io: Server | null = null;

export function getIO() {
  return io;
}

export function setIO(server: Server) {
  io = server;
  return io;
} 