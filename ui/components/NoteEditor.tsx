import React, { useState, useEffect, useCallback } from 'react';
import { TFile, App as ObsidianApp } from 'obsidian';
import { TrashIcon } from './icons';

interface NoteEditorProps {
  noteFile: TFile;
  app: ObsidianApp;
  onUpdate: (path: string, content: string) => void;
  onDelete: (path: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteFile, app, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(noteFile.basename);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNoteContent = async () => {
      setIsLoading(true);
      const fileContent = await app.vault.cachedRead(noteFile);
      setContent(fileContent);
      setTitle(noteFile.basename)
      setIsLoading(false);
    };
    loadNoteContent();
  }, [noteFile, app.vault]);

  const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(debounce(onUpdate, 500), [onUpdate]);

  useEffect(() => {
     // We only update content. Title changes are handled separately via rename.
     debouncedUpdate(noteFile.path, content);
  }, [content, noteFile.path, debouncedUpdate]);

  const handleTitleChange = async (newTitle: string) => {
      setTitle(newTitle);
      // Basic sanitation
      if (newTitle && newTitle !== noteFile.basename) {
          const newPath = `${noteFile.parent.path}/${newTitle}.md`;
          try {
            await app.fileManager.renameFile(noteFile, newPath);
          } catch(e) {
            console.error("Error renaming file", e);
            // Optionally revert title if rename fails
            setTitle(noteFile.basename);
          }
      }
  }


  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete(noteFile.path);
    }
  };
  
  if (isLoading) {
      return <div className="p-8">Loading note...</div>;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTitleChange(e.currentTarget.value)}
          className="text-4xl font-bold bg-transparent focus:outline-none w-full text-[#f38ba8]"
          placeholder="Note Title"
        />
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-[#45475a] text-[#f38ba8] transition-colors"
          title="Delete Note"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full bg-transparent focus:outline-none resize-none text-lg leading-relaxed text-[#cdd6f4]"
        placeholder="Start writing..."
      ></textarea>
      <div className="text-right text-xs text-[#6c7086] mt-4">
        Last updated: {new Date(noteFile.stat.mtime).toLocaleString()}
      </div>
    </div>
  );
};

export default NoteEditor;
