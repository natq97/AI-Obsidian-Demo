import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, SearchResult } from "../types";


function createAiClient(apiKey: string): GoogleGenAI {
    if (!apiKey) {
      throw new Error("API_KEY is missing. Please configure it in the plugin settings.");
    }
    return new GoogleGenAI({ apiKey });
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
    relevantHistory: ChatMessage[],
    apiKey: string
) {
    const ai = createAiClient(apiKey);
    const chat: Chat = ai.chats.create({
        ...modelConfig,
        history: formatChatHistoryForApi(relevantHistory)
    });
    const response = await chat.sendMessageStream({ message });
    return response;
}

export async function generateRAGResponseStream(
    query: string, 
    context: SearchResult[],
    apiKey: string
) {
    const ai = createAiClient(apiKey);
    const formattedContext = context
        .map(
            (result, index) =>
                `Source ${index + 1} (File: ${result.file.path}):\nTitle: ${result.file.basename
                }\nContent is implicitly known by the model`
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
    
    const response = await ai.models.generateContentStream({
        ...modelConfig,
        contents: prompt
    });

    return response;
}


export async function generateWebSearchResponseStream(query: string, apiKey: string) {
    const ai = createAiClient(apiKey);
    const response = await ai.models.generateContentStream({
        ...modelConfig,
        contents: query,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response;
}
