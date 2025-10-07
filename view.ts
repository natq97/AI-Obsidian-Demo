import { ItemView, WorkspaceLeaf } from 'obsidian';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './ui/App';
// FIX: Use a type-only import to break the circular dependency with main.ts
import type AIPlugin from './main';

export const AI_ASSISTANT_VIEW_TYPE = 'ai-assistant-view';

export class AIAssistantView extends ItemView {
  private root: Root | null = null;
  private plugin: AIPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: AIPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return AI_ASSISTANT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'AI Assistant';
  }

  getIcon(): string {
    return 'sparkles';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    this.root = createRoot(container);
    this.root.render(
      <React.StrictMode>
        <App app={this.app} plugin={this.plugin} />
      </React.StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}