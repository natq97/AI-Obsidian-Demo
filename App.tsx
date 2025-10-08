


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Note, SearchResult, ViewMode, Agent, ChatMessage, NoteWithVector } from './types';
import { searchNotes, createTextVector, searchChatHistory } from './services/vectorService';
import { generateSmartChatResponseStream, generateRAGResponseStream, generateWebSearchResponseStream } from './services/geminiService';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import ChatView from './components/ChatView';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []);
  const [selectedAgent, setSelectedAgent] = useLocalStorage<Agent>('selectedAgent', 'smart-chat');
  const [isModelLoading, setIsModelLoading] = useState(false);

  const notesWithVectors = useMemo(() => {
    return notes.map(note => ({
      ...note,
      // @ts-ignore - HACK: Standalone app does not have TFile, but vectorService expects it.
      // This is a temporary shim to make it work. A proper fix would involve refactoring vectorService.
      file: { path: note.id, basename: note.title },
      vector: createTextVector(note.title + ' ' + note.content),
    }));
  }, [notes]);

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
    setViewMode('editor');
  }, [setNotes]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    setViewMode('editor');
  }, []);

  const handleSelectChat = useCallback(() => {
    setSelectedNoteId(null);
    setViewMode('chat');
  }, []);
  
  useEffect(() => {
    if(viewMode === 'welcome' && notes.length > 0) {
      setViewMode('chat');
    }
  }, [notes.length, viewMode])


  const handleUpdateNote = useCallback((id: string, title: string, content: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? { ...note, title, content, updatedAt: new Date().toISOString() } : note
      )
    );
  }, [setNotes]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setViewMode(notes.length > 1 ? 'chat' : 'welcome');
    }
  }, [selectedNoteId, setNotes, notes.length]);

  const handleSendMessage = async (message: string) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      alert("API Key is not configured. Please create a .env file with VITE_API_KEY.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    const currentChatHistory = [...chatHistory, userMessage];
    setChatHistory(currentChatHistory);
    setIsModelLoading(true);
  
    const modelResponse: ChatMessage = { role: 'model', content: '', sources: [], webSources: [] };
    setChatHistory(prev => [...prev, modelResponse]);
  
    try {
      let stream;
  
      switch (selectedAgent) {
        case 'smart-chat':
          const relevantHistory = searchChatHistory(message, currentChatHistory.slice(0, -1));
          stream = await generateSmartChatResponseStream(message, relevantHistory, apiKey);
          for await (const chunk of stream) {
            modelResponse.content += chunk.text;
            setChatHistory(prev => [...prev.slice(0, -1), { ...modelResponse }]);
          }
          break;
  
        case 'rag':
          // The `notesWithVectors` object does not match `NoteWithVector[]` perfectly for the standalone app.
          // Using `as any` to bypass the type check as this is a known hack.
          const searchResults = searchNotes(message, notesWithVectors as any).slice(0, 5);
          modelResponse.sources = searchResults;
          stream = await generateRAGResponseStream(message, searchResults, apiKey);
          for await (const chunk of stream) {
            modelResponse.content += chunk.text;
            setChatHistory(prev => [...prev.slice(0, -1), { ...modelResponse }]);
          }
          break;
  
        case 'web-search':
          const streamResponse = await generateWebSearchResponseStream(message, apiKey);
          for await (const chunk of streamResponse) {
              modelResponse.content += chunk.text;
              const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
              if (groundingMetadata?.groundingChunks) {
                modelResponse.webSources = groundingMetadata.groundingChunks.map((chunk: any) => chunk.web).filter(Boolean);
              }
              setChatHistory(prev => [...prev.slice(0, -1), { ...modelResponse }]);
          }
          break;
      }
    } catch (error) {
      console.error("Error generating response:", error);
      modelResponse.content = "Sorry, I encountered an error. Please check the console for details.";
      setChatHistory(prev => [...prev.slice(0, -1), modelResponse]);
    } finally {
      setIsModelLoading(false);
    }
  };

  const selectedNote = useMemo(() => {
    return notes.find(note => note.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  const renderMainView = () => {
    switch (viewMode) {
      case 'editor':
        return selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        ) : null;
      case 'chat':
        return (
          <ChatView
            chatHistory={chatHistory}
            isModelLoading={isModelLoading}
            onSendMessage={handleSendMessage}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            onSelectNote={handleSelectNote}
          />
        );
      case 'welcome':
      default:
        return (
          <div className="flex items-center justify-center h-full text-center text-[#6c7086]">
            <div>
              <SparklesIcon className="w-16 h-16 mx-auto text-[#cba6f7] mb-4" />
              <h2 className="text-2xl font-bold">Welcome to your AI Assistant</h2>
              <p className="mt-2">Create a new note to get started.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen font-sans bg-[#1e1e2e] text-[#cdd6f4]">
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onCreateNote={handleCreateNote}
        onSelectNote={handleSelectNote}
        onSelectChat={handleSelectChat}
        currentView={viewMode}
      />
      <main className="flex-1 flex flex-col h-full bg-[#181825]">
        <div className="flex-1 overflow-y-auto">
          {renderMainView()}
        </div>
      </main>
    </div>
  );
};

export default App;
