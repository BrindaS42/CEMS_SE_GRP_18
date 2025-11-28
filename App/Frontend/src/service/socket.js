import { io } from 'socket.io-client';

// Get the socket server URL from environment or use defaults
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

console.log('[socket.js] 🔌 Socket URL:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'], // Try websocket first, then polling
});

// Add error handler to debug connection issues
socket.on('connect_error', (error) => {
  console.error('[socket.js] ❌ Connection error:', error.message);
});

socket.on('error', (error) => {
  console.error('[socket.js] ❌ Socket error:', error);
});

socket.on('connect', () => {
  console.log('[socket.js] ✅ Connected! ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[socket.js] ⚠️ Disconnected!');
});

console.log('[socket.js] 🔌 Socket instance created, attempting to connect...');