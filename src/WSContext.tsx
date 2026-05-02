import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Agent = {
  id: string;
  name: string;
  status: string;
};

type ChatMessage = {
  sender: string;
  message: string;
};

type WSContextType = {
  agents: Agent[];
  logs: string[];
  chatHistory: ChatMessage[];
  startPlanning: () => void;
  sendMessage: (msg: string) => void;
  sendApiKey: (key: string) => void;
  phoneReloadKey: number;
  isConnected: boolean;
};

const WSContext = createContext<WSContextType | null>(null);

export function WSProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<string[]>(['$']);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [phoneReloadKey, setPhoneReloadKey] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WS on the same host and port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'agents_status') {
          setAgents(message.data);
        } else if (message.type === 'chat_history') {
          setChatHistory(message.data);
        } else if (message.type === 'virtual_phone_update') {
          setPhoneReloadKey((prev) => prev + 1);
        } else if (message.type === 'agent_update') {
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === message.data.id
                ? { ...agent, status: message.data.status }
                : agent
            )
          );
        } else if (message.type === 'terminal_log') {
          setLogs((prev) => {
            // Remove the blinking cursor '$', add new log, re-add cursor
            const withoutCursor = prev.filter(log => log !== '$');
            return [...withoutCursor, message.data, '$'];
          });
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const startPlanning = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setLogs(['$']); // Clear logs when starting new simulation
      socket.send(JSON.stringify({ type: 'start_planning' }));
    }
  };

  const sendMessage = (msg: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat_message', message: msg }));
    }
  };

  const sendApiKey = (key: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'set_api_key', key }));
    }
  };

  return (
    <WSContext.Provider value={{ agents, logs, chatHistory, phoneReloadKey, startPlanning, sendMessage, sendApiKey, isConnected }}>
      {children}
    </WSContext.Provider>
  );
}

export function useWS() {
  const context = useContext(WSContext);
  if (!context) {
    throw new Error('useWS must be used within a WSProvider');
  }
  return context;
}
