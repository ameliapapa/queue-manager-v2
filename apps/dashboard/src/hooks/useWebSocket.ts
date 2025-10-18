import { useEffect, useState } from 'react';
import { websocketClient } from '../services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to server
    websocketClient.connect('http://localhost:3005');

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(websocketClient.isConnected());
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      websocketClient.disconnect();
    };
  }, []);

  return {
    ws: websocketClient,
    isConnected,
  };
}
