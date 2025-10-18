/**
 * WebSocket Client for Dashboard
 */

import { io, Socket } from 'socket.io-client';

type WebSocketEventData = {
  'queue:issued': { queueNumber: number; issuedAt: Date; patientId?: string };
  'patient:registered': { queueNumber: number; patientId: string; name: string; phone: string; age: number; gender: string; registeredAt: Date };
  'patient:assigned': { queueNumber: number; patientId: string; roomId: string; roomNumber: string; assignedAt: Date };
  'consultation:completed': { roomId: string; roomNumber: string; patientId: string; completedAt: Date };
  'room:status_changed': { roomId: string; roomNumber: string; status: 'available' | 'busy' | 'paused' };
  'patient:cancelled': { patientId: string; queueNumber: number; reason: string };
  'patient:updated': { patientId: string; queueNumber: number; updates: Record<string, any> };
};

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

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
      console.log('✅ Connected to WebSocket server (dashboard)');
      this.socket?.emit('register', 'dashboard');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
    });

    // Forward all events to listeners
    const events = [
      'queue:issued',
      'patient:registered',
      'patient:assigned',
      'consultation:completed',
      'room:status_changed',
      'patient:cancelled',
      'patient:updated',
    ];

    events.forEach((eventName) => {
      this.socket?.on(eventName, (data: any) => {
        const listeners = this.listeners.get(eventName);
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }
      });
    });
  }

  on<K extends keyof WebSocketEventData>(
    event: K,
    callback: (data: WebSocketEventData[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as Function);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as Function);
    };
  }

  emit<K extends keyof WebSocketEventData>(event: K, data: WebSocketEventData[K]) {
    if (!this.socket?.connected) {
      console.warn('⚠️  Not connected to WebSocket server');
      return;
    }
    this.socket.emit(event as string, data);
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
