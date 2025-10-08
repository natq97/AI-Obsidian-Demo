import { TFile } from "obsidian";

// FIX: Add Note interface for standalone app version
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Vector = Map<string, number>;

export interface NoteWithVector {
  file: TFile;
  content: string;
  vector: Vector;
}

export interface SearchResult {
  file: TFile;
  score: number;
}

export type Agent = 'smart-chat' | 'rag' | 'web-search';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: SearchResult[];
  webSources?: { uri: string; title: string }[];
}

export type ViewMode = 'welcome' | 'editor' | 'chat';

// Fix: Moved AIPluginSettings from main.ts to break circular dependency
export interface AIPluginSettings {
  chatHistory: ChatMessage[];
  selectedAgent: Agent;
  apiKey: string;
}

// Fix: Added IAIPlugin interface to break circular dependency
export interface IAIPlugin {
  settings: AIPluginSettings;
  saveSettings(): Promise<void>;
  manifest: { id: string };
}
