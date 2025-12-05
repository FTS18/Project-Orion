import { z } from "zod";

// Chat Request/Response (added for Agentic Mode)
export const chatRequestSchema = z.object({
  customerId: z.string(),
  message: z.string(),
  conversationHistory: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  message: z.string(),
  agentType: z.string(),
  agentStates: z.array(z.object({
    agentType: z.string(),
    status: z.string(),
    lastAction: z.string().optional(),
    progress: z.number().optional(),
  })),
  workflowLogs: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    agentType: z.string(),
    action: z.string(),
    details: z.string(),
    level: z.string(),
  })),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
