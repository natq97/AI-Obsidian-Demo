import React from 'react';
import { TFile } from 'obsidian';
import { ViewMode } from '../../types';
import { PlusIcon, ChatIcon } from './icons';

interface SidebarProps {
  notes: TFile[];
  selectedNotePath: string | null;
  onCreateNote: () => void;
  onSelectNote: (path: string) => void;
  onSelectChat: () => void;
  currentView: ViewMode;
}

const Sidebar: React.FC<SidebarProps> = ({ notes, selectedNotePath, onCreateNote, onSelectNote, onSelectChat, currentView }) => {
  const sortedNotes = [...notes].sort((a, b) => b.stat.mtime - a.stat.mtime);

  return (
    <aside className="w-80 bg-[#1e1e2e] border-r border-[#313244] flex flex-col h-full">
      <div className="p-4 flex justify-between items-center border-b border-[#313244]">
        <h1 className="text-xl font-bold text-[#f5c2e7]">AI Notes</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={onSelectChat}
            className={`p-2 rounded-lg ${currentView === 'chat' ? 'bg-[#585b70] text-[#a6e3a1]' : 'hover:bg-[#45475a] text-[#a6e3a1]'} transition-colors`}
            title="AI Assistant"
          >
            <ChatIcon className="w-6 h-6" />
          </button>
          <button
            onClick={onCreateNote}
            className="p-2 rounded-lg hover:bg-[#45475a] text-[#89b4fa] transition-colors"
            title="Create New Note"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav>
          <ul>
            {sortedNotes.map(note => (
              <li key={note.path}>
                <button
                  onClick={() => onSelectNote(note.path)}
                  className={`w-full text-left p-4 truncate ${
                    selectedNotePath === note.path
                      ? 'bg-[#313244] text-[#cba6f7]'
                      : 'hover:bg-[#313244] text-[#cdd6f4]'
                  } transition-colors`}
                >
                  <span className="font-semibold block">{note.basename}</span>
                  <span className="text-xs text-[#a6adc8] block mt-1">
                    {new Date(note.stat.mtime).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
