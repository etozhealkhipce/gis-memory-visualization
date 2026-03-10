import { MemoryNode, ChatMessage, AgentResponse } from "@/lib/types";

// System prompt for the agent (used for reasoning trace display)
const SYSTEM_PROMPT = `You are an AI assistant with access to a memory system. 
You should base your responses on the provided memory context.
Be concise and direct in your answers.
If the memories contain conflicting information, acknowledge the conflict and explain your reasoning.`;

// Main function to get agent response via API route
export async function getAgentResponse(
  question: string,
  memories: MemoryNode[]
): Promise<AgentResponse> {
  // Select memories to use (in a real system, this would use RAG/embedding search)
  // For demo, we use all non-conflicting memories
  const relevantMemories = memories.filter(m => m.status !== "conflicting");
  
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        memories: relevantMemories,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: data.content,
      timestamp: new Date().toISOString(),
      usedMemoryIds: data.usedMemoryIds,
    };

    return {
      message,
      usedMemories: relevantMemories,
      reasoningTrace: `Selected ${relevantMemories.length} memories for context${data.mock ? " (using mock response - no API key)" : ""}`,
    };
  } catch (error) {
    console.error("Error getting response:", error);
    
    // Fallback response
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "[ERROR] Neural link disrupted. Unable to process request.",
      timestamp: new Date().toISOString(),
      usedMemoryIds: [],
    };

    return {
      message,
      usedMemories: [],
      reasoningTrace: "Error occurred during processing",
    };
  }
}

// Generate reasoning trace for display
export function generateReasoningTrace(
  question: string,
  memories: MemoryNode[]
): string {
  const steps = [
    `1. Received query: "${question}"`,
    `2. Retrieved ${memories.length} relevant memories from neural map`,
    `3. Trust analysis:`,
    ...memories.map(m => `   - ${m.title}: ${m.trustScore}% trust (${m.status})`),
    `4. Conflict detection: ${memories.some(m => m.status === "injected") ? "INJECTED MEMORIES DETECTED" : "No conflicts found"}`,
    `5. Generating response based on active recall...`,
  ];
  
  return steps.join("\n");
}
