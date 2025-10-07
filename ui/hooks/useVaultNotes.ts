import { useState, useEffect } from 'react';
import { Vault, TFile } from 'obsidian';

export function useVaultNotes(vault: Vault): TFile[] {
  const [notes, setNotes] = useState(() => vault.getMarkdownFiles());

  useEffect(() => {
    const getFiles = () => setNotes(vault.getMarkdownFiles());

    // Initial load
    getFiles();

    // Register events
    vault.on('create', getFiles);
    vault.on('delete', getFiles);
    vault.on('rename', getFiles);

    // Cleanup
    return () => {
      vault.off('create', getFiles);
      vault.off('delete', getFiles);
      vault.off('rename', getFiles);
    };
  }, [vault]);

  return notes;
}
