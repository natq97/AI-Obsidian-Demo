import React from 'react';
import { BrainCircuitIcon } from './icons';

interface SettingMessageProps {
  onOpenSettings: () => void;
}

const SettingMessage: React.FC<SettingMessageProps> = ({ onOpenSettings }) => {
  return (
    <div className="flex items-center justify-center h-full text-center text-[#6c7086]">
      <div>
        <BrainCircuitIcon className="w-16 h-16 mx-auto text-[#f9e2af] mb-4" />
        <h2 className="text-2xl font-bold">Configure your AI Assistant</h2>
        <p className="mt-2 mb-4 max-w-sm mx-auto">
          Please set your Google Gemini API key in the plugin settings to start a conversation.
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 bg-[#89b4fa] text-[#1e1e2e] rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
        >
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default SettingMessage;
