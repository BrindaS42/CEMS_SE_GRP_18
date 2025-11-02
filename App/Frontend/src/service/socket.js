import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const socket = io(API_BASE, {
  autoConnect: false, 
  withCredentials: true,
});