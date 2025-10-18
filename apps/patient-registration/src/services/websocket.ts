import { io, Socket } from 'socket.io-client';

type WebSocketEventData = {
  'patient:registered': {
    queueNumber: number;
    patientId: string;
    name: string;
    phone: string;
    age: number;
    gender: string;
    notes?: string;
    registeredAt: Date;
  };
  'register': { type: 'registration' };
};

class WebSocketClient {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3005') {
    if (this.socket?.connected) {
      console.log('✅ Already connected to WebSocket server');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      // Register this client as registration type
      this.socket?.emit('register', { type: 'registration' });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  emitPatientRegistered(data: WebSocketEventData['patient:registered']) {
    if (!this.socket?.connected) {
      console.warn('⚠️  Not connected to WebSocket server');
      return;
    }

    console.log('📢 Emitting patient:registered event', data);
    this.socket.emit('patient:registered', data);
  }
}

export const websocketClient = new WebSocketClient();
