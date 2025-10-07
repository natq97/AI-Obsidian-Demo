export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type Vector = Map<string, number>;

export interface NoteWithVector extends Note {
  vector: Vector;
}

export interface SearchResult {
  note: Note;
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