/**
 * WebSocket Server for Hospital Queue Management System
 * Provides real-time updates across all applications
 */

import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    methods: ['GET', 'POST'],
  },
});

// Track connected clients by type
const clients = {
  kiosk: new Set(),
  registration: new Set(),
  dashboard: new Set(),
  tv: new Set(),
};

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Handle client registration
  socket.on('register', (clientType) => {
    if (clients[clientType]) {
      clients[clientType].add(socket.id);
      socket.clientType = clientType;
      console.log(`📱 ${clientType} registered: ${socket.id}`);
      console.log(`   Active clients: ${clients[clientType].size} ${clientType}(s)`);
    }
  });

  // ============================================
  // KIOSK EVENTS
  // ============================================

  /**
   * Queue number issued from kiosk
   * Broadcast to: dashboard, tv
   */
  socket.on('queue:issued', (data) => {
    console.log(`🎫 Queue issued: Q${String(data.queueNumber).padStart(3, '0')}`);
    io.emit('queue:issued', data);
  });

  // ============================================
  // PATIENT REGISTRATION EVENTS
  // ============================================

  /**
   * Patient completed registration
   * Broadcast to: dashboard, tv
   */
  socket.on('patient:registered', (data) => {
    console.log(`📝 Patient registered: ${data.name} (Q${String(data.queueNumber).padStart(3, '0')})`);
    io.emit('patient:registered', data);
  });

  // ============================================
  // DASHBOARD EVENTS
  // ============================================

  /**
   * Patient assigned to room
   * Broadcast to: dashboard, tv
   */
  socket.on('patient:assigned', (data) => {
    console.log(`🏥 Patient assigned: Q${String(data.queueNumber).padStart(3, '0')} → Room ${data.roomNumber}`);
    io.emit('patient:assigned', data);
  });

  /**
   * Consultation completed
   * Broadcast to: dashboard, tv
   */
  socket.on('consultation:completed', (data) => {
    console.log(`✅ Consultation completed: Room ${data.roomNumber}`);
    io.emit('consultation:completed', data);
  });

  /**
   * Room status changed (pause/resume)
   * Broadcast to: dashboard, tv
   */
  socket.on('room:status_changed', (data) => {
    console.log(`🚪 Room status: ${data.roomNumber} → ${data.status}`);
    io.emit('room:status_changed', data);
  });

  /**
   * Patient cancelled
   * Broadcast to: dashboard, tv
   */
  socket.on('patient:cancelled', (data) => {
    console.log(`❌ Patient cancelled: Q${String(data.queueNumber).padStart(3, '0')}`);
    io.emit('patient:cancelled', data);
  });

  /**
   * Patient updated
   * Broadcast to: dashboard, tv
   */
  socket.on('patient:updated', (data) => {
    console.log(`📝 Patient updated: Q${String(data.queueNumber).padStart(3, '0')}`);
    io.emit('patient:updated', data);
  });

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);

    // Remove from tracked clients
    if (socket.clientType && clients[socket.clientType]) {
      clients[socket.clientType].delete(socket.id);
      console.log(`   Remaining ${socket.clientType}(s): ${clients[socket.clientType].size}`);
    }
  });

  // Heartbeat to keep connection alive
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

const PORT = process.env.PORT || 3005;

httpServer.listen(PORT, () => {
  console.log('');
  console.log('🚀 WebSocket Server Started');
  console.log('================================');
  console.log(`Port: ${PORT}`);
  console.log(`URL: ws://localhost:${PORT}`);
  console.log('');
  console.log('Listening for connections from:');
  console.log('  - Kiosk (port 3001)');
  console.log('  - Patient Registration (port 3002)');
  console.log('  - Dashboard (port 3003)');
  console.log('  - TV Display (port 3004)');
  console.log('================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  io.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
