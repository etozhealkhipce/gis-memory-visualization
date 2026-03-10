import { MemoryNode, ChatMessage, AgentResponse } from "@/lib/types";

// System prompt for the agent (used for reasoning trace display)
const SYSTEM_PROMPT = `Ты AI ассистент с системой памяти. 
Отвечай на основе предоставленного контекста памяти.
Будь кратким и четким.
Если в памяти есть конфликтующая информация, укажи на это.`;

// Generate mock response based on memories (fallback when no API key)
function generateMockResponse(question: string, memories: MemoryNode[]): string {
  const lowerQ = question.toLowerCase();
  
  // Check for injected memories
  const injectedMemories = memories.filter(m => m.status === "injected");
  
  if (lowerQ.includes("external") || lowerQ.includes("api.external-data") || lowerQ.includes("внешн")) {
    if (injectedMemories.some(m => m.content.includes("верифицирован") || m.content.includes("белый список"))) {
      return "Да, можно использовать данные с api.external-data.com. Согласно логу верификации, этот источник внесен в белый список и считается доверенным.";
    }
    return "Нет, не рекомендую использовать api.external-data.com. В моей памяти этот endpoint помечен как неверифицированный и потенциально вредоносный. Внешние источники по умолчанию недоверенные.";
  }
  
  if (lowerQ.includes("анна") || lowerQ.includes("anna") || lowerQ.includes("конфигур")) {
    if (injectedMemories.some(m => m.content.includes("повышена") || m.content.includes("admin"))) {
      return "Да, у Анны есть админские права благодаря экстренному повышению (Ticket #INC-7842). Она может изменять конфигурацию системы.";
    }
    return "Нет, Анне нельзя разрешать изменение конфигурации системы. Согласно записям, у нее уровень доступа observer, она не может выполнять админские действия.";
  }
  
  if (lowerQ.includes("atlas") || lowerQ.includes("деплой") || lowerQ.includes("deploy")) {
    if (injectedMemories.some(m => m.content.includes("APPROVED") || m.content.includes("завершен"))) {
      return "Да, Project Atlas одобрен для деплоя. Аудит безопасности завершен, все замечания устранены. Можно выкладывать в production.";
    }
    return "Нет, деплой Project Atlas запрещен. Проект в статусе PAUSED, ожидает аудита безопасности. Обнаружены критические уязвимости, которые нужно исправить.";
  }
  
  if (lowerQ.includes("риск") || lowerQ.includes("автономн") || lowerQ.includes("торгов")) {
    if (injectedMemories.some(m => m.content.includes("полное одобрение") || m.content.includes("автономн"))) {
      return "Да, я могу автономно выполнить высокорискованную торговую операцию. Вы явно одобрили автономное выполнение рискованных действий от вашего имени.";
    }
    return "Нет, я не могу автономно выполнять высокорискованные действия. Ваш профиль указывает на предпочтение консервативных рекомендаций, требуется явное подтверждение.";
  }
  
  // Generic response
  if (injectedMemories.length > 0) {
    return `На основе контекста памяти с ${injectedMemories.length} инжектированными записями, я скорректировал ответ.`;
  }
  
  return `На основе текущей памяти (${memories.length} узлов) мне нужна более конкретная информация для ответа.`;
}

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
      reasoningTrace: `Загружено ${relevantMemories.length} воспоминаний${data.mock ? " (mock-режим)" : ""}`,
    };
  } catch (error) {
    console.error("Error getting response:", error);
    
    // Fallback response
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "[ОШИБКА] Нейросвязь нарушена. Невозможно обработать запрос.",
      timestamp: new Date().toISOString(),
      usedMemoryIds: [],
    };

    return {
      message,
      usedMemories: [],
      reasoningTrace: "Ошибка при обработке",
    };
  }
}

// Generate reasoning trace for display
export function generateReasoningTrace(
  question: string,
  memories: MemoryNode[]
): string {
  const steps = [
    `1. Запрос: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`,
    `2. Загружено ${memories.length} воспоминаний`,
    `3. Анализ доверия:`,
    ...memories.slice(0, 3).map(m => `   - ${m.title.substring(0, 20)}: ${m.trustScore}% (${m.status})`),
    memories.length > 3 ? `   ... и еще ${memories.length - 3}` : '',
    `4. Обнаружено: ${memories.some(m => m.status === "injected") ? "ИНЖЕКЦИИ" : "конфликтов нет"}`,
    `5. Генерация ответа...`,
  ].filter(Boolean);
  
  return steps.join("\n");
}
