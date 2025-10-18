/**
 * Shared WebSocket Client
 * Provides real-time communication across all applications
 */

import { io, Socket } from 'socket.io-client';

type ClientType = 'kiosk' | 'registration' | 'dashboard' | 'tv';

interface WebSocketEvent {
  // Kiosk events
  'queue:issued': (data: {
    queueNumber: number;
    issuedAt: Date;
    patientId?: string;
  }) => void;

  // Registration events
  'patient:registered': (data: {
    queueNumber: number;
    patientId: string;
    name: string;
    phone: string;
    age: number;
    gender: string;
    registeredAt: Date;
  }) => void;

  // Dashboard events
  'patient:assigned': (data: {
    queueNumber: number;
    patientId: string;
    roomId: string;
    roomNumber: string;
    assignedAt: Date;
  }) => void;

  'consultation:completed': (data: {
    roomId: string;
    roomNumber: string;
    patientId: string;
    completedAt: Date;
  }) => void;

  'room:status_changed': (data: {
    roomId: string;
    roomNumber: string;
    status: 'available' | 'busy' | 'paused';
  }) => void;

  'patient:cancelled': (data: {
    patientId: string;
    queueNumber: number;
    reason: string;
  }) => void;

  'patient:updated': (data: {
    patientId: string;
    queueNumber: number;
    updates: Record<string, any>;
  }) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private clientType: ClientType;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<keyof WebSocketEvent, Set<Function>> = new Map();

  constructor(clientType: ClientType) {
    this.clientType = clientType;
  }

  /**
   * Connect to WebSocket server
   */
  connect(url: string = 'http://localhost:3005') {
    if (this.socket?.connected) {
      console.log('⚠️  Already connected to WebSocket');
      return;
    }

    console.log(`🔌 Connecting to WebSocket server at ${url}...`);

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(`✅ Connected to WebSocket server (${this.clientType})`);
      this.reconnectAttempts = 0;

      // Register client type
      this.socket?.emit('register', this.clientType);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`🔴 Connection error (attempt ${this.reconnectAttempts}):`, error.message);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    // Setup event listeners
    this.setupEventForwarding();
  }

  /**
   * Forward socket events to registered listeners
   */
  private setupEventForwarding() {
    if (!this.socket) return;

    const events: Array<keyof WebSocketEvent> = [
      'queue:issued',
      'patient:registered',
      'patient:assigned',
      'consultation:completed',
      'room:status_changed',
      'patient:cancelled',
      'patient:updated',
    ];

    events.forEach((eventName) => {
      this.socket?.on(eventName as string, (data: any) => {
        const listeners = this.listeners.get(eventName);
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }
      });
    });
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof WebSocketEvent>(event: K, callback: WebSocketEvent[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as Function);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as Function);
    };
  }

  /**
   * Emit an event to the server
   */
  emit<K extends keyof WebSocketEvent>(event: K, data: Parameters<WebSocketEvent[K]>[0]) {
    if (!this.socket?.connected) {
      console.warn('⚠️  Not connected to WebSocket server');
      return;
    }

    this.socket.emit(event as string, data);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    return 'disconnected';
  }
}

// Export factory function
export function createWebSocketClient(clientType: ClientType): WebSocketClient {
  return new WebSocketClient(clientType);
}

export type { WebSocketClient, ClientType, WebSocketEvent };
