import { io, Socket } from 'socket.io-client';

type WebSocketEventData = {
  'queue:issued': {
    queueNumber: number;
    issuedAt: Date;
    patientId?: string;
  };
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
  'patient:called': {
    queueNumber: number;
    roomNumber: number;
    calledAt: Date;
  };
  'patient:completed': {
    queueNumber: number;
    roomNumber: number;
    completedAt: Date;
  };
  'room:updated': {
    roomNumber: number;
    status: 'available' | 'busy' | 'paused';
    currentPatient?: number;
  };
  'register': { type: 'tv' };
};

class WebSocketClient {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();

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
      // Register this client as TV type
      this.socket?.emit('register', { type: 'tv' });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // Re-attach all event listeners after reconnection
    this.socket.on('connect', () => {
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach((callback) => {
          this.socket?.on(event, callback as any);
        });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventListeners.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  on<K extends keyof WebSocketEventData>(
    event: K,
    callback: (data: WebSocketEventData[K]) => void
  ): () => void {
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, new Set());
    }
    this.eventListeners.get(event as string)!.add(callback);

    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event as string);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event as string);
        }
      }
      if (this.socket) {
        this.socket.off(event as string, callback as any);
      }
    };
  }
}

export const websocketClient = new WebSocketClient();
