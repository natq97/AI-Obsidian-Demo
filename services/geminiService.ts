import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, SearchResult } from "../types";

// The GoogleGenAI instance will be initialized lazily to prevent app crash on load.
let ai: GoogleGenAI | undefined;

/**
 * Gets the singleton instance of the GoogleGenAI client.
 * Initializes it on the first call.
 * @returns The GoogleGenAI instance.
 */
function getAi(): GoogleGenAI {
  if (!ai) {
    // This adheres to the requirement of using process.env.API_KEY, but defers
    // the call until the AI is actually needed, making the app more robust.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const modelConfig = {
    model: 'gemini-2.5-flash',
};

function formatChatHistoryForApi(chatHistory: ChatMessage[]) {
    return chatHistory.map(message => ({
        role: message.role,
        parts: [{ text: message.content }]
    }));
}

export async function generateSmartChatResponseStream(
    message: string, 
    relevantHistory: ChatMessage[]
) {
    const chat: Chat = getAi().chats.create({
        ...modelConfig,
        history: formatChatHistoryForApi(relevantHistory)
    });
    const response = await chat.sendMessageStream({ message });
    return response;
}

export async function generateRAGResponseStream(
    query: string, 
    context: SearchResult[]
) {
    const formattedContext = context
        .map(
            (result, index) =>
                `Source ${index + 1} (ID: ${result.note.id}):\nTitle: ${result.note.title
                }\nContent:\n${result.note.content}`
        )
        .join('\n\n---\n\n');

    const prompt = `You are an expert AI assistant. Your task is to answer the user's query based *only* on the provided context from their notes.
If the context does not contain the answer, state that the information is not available in the provided notes.
Do not use any external knowledge.
List the sources you used to construct your answer at the very end of your response, like this: "Sources: [1], [3]".

Here is the context from the user's notes:
---
${formattedContext}
---

User Query: "${query}"`;
    
    const response = await getAi().models.generateContentStream({
        ...modelConfig,
        contents: prompt
    });

    return response;
}


export async function generateWebSearchResponseStream(query: string) {
    const response = await getAi().models.generateContentStream({
        ...modelConfig,
        contents: query,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response;
}