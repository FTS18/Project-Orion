import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  ChatRequest,
  ChatResponse,
  AgentState,
  WorkflowLogEntry,
} from "@shared/schema";

/**
 * Query hook for fetching all customers
 */
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });
}

/**
 * Query hook for fetching customer's audit logs
 */
export function useAuditLogs(customerId: string) {
  return useQuery({
    queryKey: ["audit", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/audit/${customerId}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
    enabled: !!customerId,
  });
}

/**
 * Mutation hook for chatting with agent
 */
export function useChatWithAgent() {
  return useMutation({
    mutationFn: async (payload: ChatRequest) => {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to send chat message");
      return response.json();
    },
  });
}

/**
 * Query hook for conversation history
 */
export function useConversationHistory(customerId: string) {
  return useQuery({
    queryKey: ["conversation", customerId],
    queryFn: async () => {
      const response = await fetch(`/api/conversation/${customerId}`);
      if (!response.ok) throw new Error("Failed to fetch conversation history");
      return response.json();
    },
    enabled: !!customerId,
  });
}

/**
 * Advanced hook for real-time agent chat with WebSocket
 */
export function useAgentChat(customerId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const messageCallbackRef = useRef<
    ((data: ChatResponse) => void) | null
  >(null);

  const connectWebSocket = (
    onMessage: (data: ChatResponse) => void
  ) => {
    messageCallbackRef.current = onMessage;

    try {
      const wsUrl = `ws://localhost:8000/ws/chat/${customerId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (err) {
          console.error("WebSocket parse error:", err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    } catch (err) {
      console.error("WebSocket connection error:", err);
    }
  };

  const sendMessage = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message }));
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [customerId]);

  return {
    connectWebSocket,
    sendMessage,
    disconnectWebSocket,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
