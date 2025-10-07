import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { App as ObsidianApp, TFile } from 'obsidian';
import AIPlugin from '../main';
import { SearchResult, ViewMode, Agent, ChatMessage } from '../types';
import { searchNotes, createTextVector, searchChatHistory } from '../services/vectorService';
import { generateSmartChatResponseStream, generateRAGResponseStream, generateWebSearchResponseStream } from '../services/geminiService';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import ChatView from './components/ChatView';
import { SparklesIcon } from './components/icons';
import { useVaultNotes } from './hooks/useVaultNotes';
import SettingMessage from './components/SettingMessage';

interface AppProps {
  app: ObsidianApp;
  plugin: AIPlugin;
}

const App: React.FC<AppProps> = ({ app, plugin }) => {
  const allNotes = useVaultNotes(app.vault);
  const [selectedNotePath, setSelectedNotePath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');

  const { settings, saveSettings } = plugin;
  const { chatHistory, selectedAgent, apiKey } = settings;
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [notesWithContent, setNotesWithContent] = useState<{ file: TFile, content: string }[]>([]);

  useEffect(() => {
    const fetchNoteContents = async () => {
      const contentPromises = allNotes.map(async (file) => ({
        file,
        content: await app.vault.cachedRead(file),
      }));
      const resolvedNotes = await Promise.all(contentPromises);
      setNotesWithContent(resolvedNotes);
    };

    fetchNoteContents();
  }, [allNotes, app.vault]);
  
  const notesWithVectors = useMemo(() => {
    return notesWithContent.map(note => ({
      ...note,
      vector: createTextVector(note.file.basename + ' ' + note.content),
    }));
  }, [notesWithContent]);

  const handleCreateNote = useCallback(async () => {
    try {
      const newFile = await app.vault.create('Untitled Note.md', '');
      setSelectedNotePath(newFile.path);
      setViewMode('editor');
    } catch (error) {
      console.error("Error creating new note:", error);
    }
  }, [app.vault]);

  const handleSelectNote = useCallback((path: string) => {
    const file = app.vault.getAbstractFileByPath(path);
    if(file instanceof TFile) {
        app.workspace.getLeaf().openFile(file);
    }
    // We can also keep the view in the plugin if we want
    // setSelectedNotePath(path);
    // setViewMode('editor');
  }, [app]);

  const handleSelectChat = useCallback(() => {
    setSelectedNotePath(null);
    setViewMode('chat');
  }, []);
  
  useEffect(() => {
    if(viewMode === 'welcome' && allNotes.length > 0) {
      setViewMode('chat');
    } else if (viewMode === 'welcome' && allNotes.length === 0) {
      // stay on welcome
    } else if (allNotes.length === 0) {
      setViewMode('welcome');
    }
  }, [allNotes.length, viewMode])


  const handleUpdateNote = useCallback(async (path: string, newContent: string) => {
    const file = app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
        await app.vault.modify(file, newContent);
    }
  }, [app.vault]);

  const handleDeleteNote = useCallback(async (path: string) => {
    const file = app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      await app.vault.trash(file, true);
      if (selectedNotePath === path) {
        setSelectedNotePath(null);
        setViewMode(allNotes.length > 1 ? 'chat' : 'welcome');
      }
    }
  }, [selectedNotePath, app.vault, allNotes.length]);
  
  const setChatHistory = (updater: (history: ChatMessage[]) => ChatMessage[]) => {
      const newHistory = updater(settings.chatHistory);
      plugin.settings.chatHistory = newHistory;
      saveSettings();
  }

  const setSelectedAgent = (agent: Agent) => {
      plugin.settings.selectedAgent = agent;
      saveSettings();
  }

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
        alert("Please configure your Google Gemini API key in the plugin settings.");
        return;
    }

    const userMessage: ChatMessage = { role: 'user', content: message };
    
    const currentChatHistory = [...chatHistory, userMessage];
    setChatHistory(() => currentChatHistory);
    
    setIsModelLoading(true);
  
    const modelResponse: ChatMessage = { role: 'model', content: '', sources: [], webSources: [] };
    setChatHistory(prev => [...prev, modelResponse]);
  
    try {
      let stream;
      const updateLastMessage = (updater: (msg: ChatMessage) => void) => {
        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessage = newHistory[newHistory.length - 1];
            if (lastMessage) {
                updater(lastMessage);
            }
            return newHistory;
        });
      }

      switch (selectedAgent) {
        case 'smart-chat':
          const relevantHistory = searchChatHistory(message, currentChatHistory.slice(0, -1));
          stream = await generateSmartChatResponseStream(message, relevantHistory, apiKey);
          for await (const chunk of stream) {
            updateLastMessage(msg => msg.content += chunk.text);
          }
          break;
  
        case 'rag':
          const searchResults = searchNotes(message, notesWithVectors).slice(0, 5);
          updateLastMessage(msg => msg.sources = searchResults);
          stream = await generateRAGResponseStream(message, searchResults, apiKey);
          for await (const chunk of stream) {
            updateLastMessage(msg => msg.content += chunk.text);
          }
          break;
  
        case 'web-search':
          const streamResponse = await generateWebSearchResponseStream(message, apiKey);
          for await (const chunk of streamResponse) {
              updateLastMessage(msg => {
                msg.content += chunk.text;
                const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
                if (groundingMetadata?.groundingChunks) {
                    msg.webSources = (msg.webSources || []).concat(
                        groundingMetadata.groundingChunks
                            .map((chunk: any) => chunk.web)
                            .filter(Boolean)
                    ).filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i); // unique
                }
              });
          }
          break;
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMessage = newHistory[newHistory.length -1];
        if (lastMessage) {
            lastMessage.content = `Sorry, I encountered an error: ${error.message}. Please check the console for details.`;
        }
        return newHistory;
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const selectedNote = useMemo(() => {
    if (!selectedNotePath) return null;
    const file = app.vault.getAbstractFileByPath(selectedNotePath);
    return file instanceof TFile ? file : null;
  }, [app.vault, selectedNotePath]);

  const openSettings = () => {
    (app as any).setting.open();
    (app as any).setting.openTabById(plugin.manifest.id);
  };

  const renderMainView = () => {
    switch (viewMode) {
      case 'editor':
        return selectedNote ? (
          <NoteEditor
            key={selectedNote.path}
            noteFile={selectedNote}
            app={app}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        ) : (
            <div className="flex items-center justify-center h-full text-center text-[#6c7086]">
                Select a note to edit.
            </div>
        );
      case 'chat':
        if (!apiKey) {
            return <SettingMessage onOpenSettings={openSettings} />;
        }
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
              <p className="mt-2">Create a new note or start a chat.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen font-sans bg-[#1e1e2e] text-[#cdd6f4]">
      <Sidebar
        notes={allNotes}
        selectedNotePath={selectedNotePath}
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