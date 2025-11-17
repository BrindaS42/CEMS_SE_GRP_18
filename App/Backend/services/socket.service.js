import { Server } from 'socket.io';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173', 
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] ✅ NEW CLIENT CONNECTED: ${socket.id}`);
    console.log(`[Socket.IO] 📊 Total connected clients: ${io.engine.clientsCount}`);

    socket.on('join_room', (eventId) => {
      socket.join(eventId);
      console.log(`[Socket.IO] 🚪 Client ${socket.id} joined room: ${eventId}`);
      
      // Show how many clients are in this room
      const roomSize = io.sockets.adapter.rooms.get(eventId)?.size || 0;
      console.log(`[Socket.IO] 📊 Room "${eventId}" now has ${roomSize} member(s)`);
    });

    socket.on('leave_room', (eventId) => {
      socket.leave(eventId);
      const roomSize = io.sockets.adapter.rooms.get(eventId)?.size || 0;
      console.log(`[Socket.IO] 👋 Client ${socket.id} left room: ${eventId}`);
      console.log(`[Socket.IO] 📊 Room "${eventId}" now has ${roomSize} member(s)`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] ❌ CLIENT DISCONNECTED: ${socket.id}`);
      console.log(`[Socket.IO] 📊 Total connected clients: ${io.engine.clientsCount}`);
    });

    // Debug: Listen to all events on this socket
    socket.onAny((event, ...args) => {
      if (event !== 'send_message') { // Don't log everything to avoid noise
        console.log(`[Socket.IO] 🔔 Event "${event}" from ${socket.id}:`, args[0]);
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};