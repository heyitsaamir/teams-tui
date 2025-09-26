import { useEffect, useRef, useState } from 'react';
import WebSocket from 'ws';

type WebSocketEvent = {
  id: string;
  type: 'activity.received' | 'activity.sent' | 'metadata';
  body: any;
  chat?: any;
  sentAt: Date;
};

type UseWebSocketReturn = {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  messages: Array<{ message: string; role: 'user' | 'assistant' }>;
  metadata: any;
};

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{ message: string; role: 'user' | 'assistant' }>>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const conversationId = useRef('default-conversation');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.on('open', () => {
      setIsConnected(true);
    });

    ws.on('message', (data: Buffer) => {
      try {
        const event: WebSocketEvent = JSON.parse(data.toString());

        switch (event.type) {
          case 'metadata':
            setMetadata(event.body);
            break;
          case 'activity.received':
            if (event.body?.text) {
              setMessages(prev => [...prev, {
                message: event.body.text,
                role: 'user'
              }]);
            }
            break;
          case 'activity.sent':
            if (event.body?.text) {
              setMessages(prev => [...prev, {
                message: event.body.text,
                role: 'assistant'
              }]);
            }
            break;
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });

    ws.on('close', () => {
      setIsConnected(false);
    });

    ws.on('error', () => {
      setIsConnected(false);
    });

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = async (message: string) => {
    if (!isConnected || !metadata) return;

    // Extract port from WebSocket URL
    const urlObj = new URL(url.replace('ws://', 'http://'));
    const port = urlObj.port;

    try {
      // Send HTTP POST to the devtools API
      const response = await fetch(`http://localhost:${port}/v3/conversations/${conversationId.current}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teams-devtools': 'true'
        },
        body: JSON.stringify({
          type: 'message',
          text: message,
          from: {
            id: 'cli-user',
            name: 'CLI User',
            role: 'user'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return {
    isConnected,
    sendMessage,
    messages,
    metadata
  };
}