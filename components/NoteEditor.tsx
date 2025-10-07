
import React, { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { TrashIcon } from './icons';

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const debounce = <F extends (...args: any[]) => any,>(func: F, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(debounce(onUpdate, 500), [onUpdate]);

  useEffect(() => {
    if (title !== note.title || content !== note.content) {
      debouncedUpdate(note.id, title, content);
    }
  }, [title, content, note.id, note.title, note.content, debouncedUpdate]);
  
  // Update local state if the selected note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);


  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        Last updated: {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default NoteEditor;
