/**
 * WebSocket Client for Kiosk
 */

import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3005') {
    if (this.socket?.connected) {
      console.log('⚠️  Already connected to WebSocket');
      return;
    }

    console.log(`🔌 Connecting to WebSocket server at ${url}...`);

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server (kiosk)');
      this.socket?.emit('register', 'kiosk');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
    });
  }

  emitQueueIssued(data: { queueNumber: number; issuedAt: Date; patientId?: string }) {
    if (!this.socket?.connected) {
      console.warn('⚠️  Not connected to WebSocket server');
      return;
    }

    console.log('📢 Emitting queue:issued event', data);
    this.socket.emit('queue:issued', data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketClient = new WebSocketClient();
