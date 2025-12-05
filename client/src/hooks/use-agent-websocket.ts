import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook for WebSocket connection to agentic backend
 * Handles real-time chat with agent orchestration
 */
export function useAgentWebSocket(customerId: string) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>([]);
  const [agentStates, setAgentStates] = useState([]);
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(0);

  // Connect to WebSocket
  useEffect(() => {
    if (!customerId) return;

    try {
      const wsUrl = `ws://localhost:8000/ws/chat/${customerId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Add assistant message
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${messageIdRef.current++}`,
              role: "assistant",
              content: data.message,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ]);

          // Update agent states
          setAgentStates(data.agentStates || []);

          // Update workflow logs
          setWorkflowLogs(data.workflowLogs || []);

          setLoading(false);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error. Using REST API fallback.");
        setLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setConnected(false);
      };

      wsRef.current = ws;

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to connect to agent");
    }
  }, [customerId]);

  // Send message through WebSocket or REST API
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setLoading(true);

      // Add user message to history
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${messageIdRef.current++}`,
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      try {
        if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
          // Use WebSocket
          wsRef.current.send(JSON.stringify({ message: userMessage }));
        } else {
          // Fallback to REST API
          const response = await fetch("http://localhost:8000/api/agent/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId,
              message: userMessage,
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();

          // Add assistant message
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${messageIdRef.current++}`,
              role: "assistant",
              content: data.message,
              timestamp: new Date().toISOString(),
            },
          ]);

          setAgentStates(data.agentStates || []);
          setWorkflowLogs(data.workflowLogs || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Error sending message");
        setLoading(false);
      }
    },
    [connected, customerId]
  );

  // Load conversation history
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/conversation/${customerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.messages?.map(
            (msg: any, idx: number) => ({
              id: `msg-${idx}`,
              ...msg,
            })
          ) || []
        );
        setAgentStates(data.agents || []);
        setWorkflowLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }, [customerId]);

  return {
    connected,
    messages,
    agentStates,
    workflowLogs,
    loading,
    error,
    sendMessage,
    loadHistory,
  };
}

/**
 * REST API client for agent chat
 */
export async function chatWithAgent(
  customerId: string,
  message: string
): Promise<any> {
  const response = await fetch("http://localhost:8000/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId,
      message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get conversation history from backend
 */
export async function getConversation(customerId: string): Promise<any> {
  const response = await fetch(
    `http://localhost:8000/api/conversation/${customerId}`
  );

  if (!response.ok) {
    throw new Error(`Conversation error: ${response.status}`);
  }

  return response.json();
}
