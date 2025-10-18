import { useEffect, useRef, useState } from 'react';
import { createWebSocketClient, WebSocketClient } from '@shared/websocket/client';

export function useWebSocket() {
  const wsRef = useRef<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create WebSocket client
    const ws = createWebSocketClient('dashboard');
    wsRef.current = ws;

    // Connect to server
    ws.connect('http://localhost:3005');

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(ws.isConnected());
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      ws.disconnect();
    };
  }, []);

  return {
    ws: wsRef.current,
    isConnected,
  };
}
