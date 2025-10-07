import { Plugin } from 'obsidian';
import { AIAssistantView, AI_ASSISTANT_VIEW_TYPE } from './view';
import { Agent, ChatMessage } from './types';
// FIX: Removed import of React component to prevent type resolution issues.
// import { BrainCircuitIcon } from './ui/components/icons';

export interface AIPluginSettings {
  chatHistory: ChatMessage[];
  selectedAgent: Agent;
}

const DEFAULT_SETTINGS: AIPluginSettings = {
  chatHistory: [],
  selectedAgent: 'smart-chat',
};

export default class AIPlugin extends Plugin {
  settings: AIPluginSettings;

  async onload() {
    await this.loadSettings();

    this.registerView(
      AI_ASSISTANT_VIEW_TYPE,
      (leaf) => new AIAssistantView(leaf, this)
    );

    this.addRibbonIcon('brain-circuit', 'Open AI Assistant', () => {
      this.activateView();
    });
    
    // FIX: Add custom icon as an SVG string, not a React component.
    this.addIcon('brain-circuit', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 5a3 3 0 1 0-5.993.142"/>
<path d="M18 5a3 3 0 1 0-5.993.142"/>
<path d="M12 19a3 3 0 1 0 5.993-.142"/>
<path d="M6 19a3 3 0 1 0 5.993-.142"/>
<path d="M12 12a3 3 0 1 0-5.993.142"/>
<path d="M18 12a3 3 0 1 0-5.993.142"/>
<path d="M6 5h.01"/>
<path d="M18 5h.01"/>
<path d="M6 12h.01"/>
<path d="M18 12h.01"/>
<path d="M6 19h.01"/>
<path d="M18 19h.01"/>
<path d="m14.65 6.05.9 1.56"/>
<path d="m8.44 6.05-.9 1.56"/>
<path d="m14.65 16.39.9 1.56"/>
<path d="m8.44 16.39-.9 1.56"/>
<path d="m15.55 10.44 1.56.9"/>
<path d="m6.89 10.44-1.56.9"/>
<path d="m15.55 13.56 1.56-.9"/>
<path d="m6.89 13.56-1.56-.9"/>
</svg>`);


    this.addCommand({
      id: 'open-ai-assistant',
      name: 'Open AI Assistant',
      callback: () => {
        this.activateView();
      },
    });
  }

  onunload() {}

  async activateView() {
    this.app.workspace.detachLeavesOfType(AI_ASSISTANT_VIEW_TYPE);

    await this.app.workspace.getRightLeaf(false).setViewState({
      type: AI_ASSISTANT_VIEW_TYPE,
      active: true,
    });

    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(AI_ASSISTANT_VIEW_TYPE)[0]
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}