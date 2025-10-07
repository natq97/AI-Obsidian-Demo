import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Agent, ChatMessage } from '../../types';
import { SendIcon, SparklesIcon, SearchIcon, BrainCircuitIcon, GlobeIcon } from './icons';

interface ChatViewProps {
  chatHistory: ChatMessage[];
  isModelLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  onSelectNote: (notePath: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  chatHistory,
  isModelLoading,
  onSendMessage,
  selectedAgent,
  onSelectAgent,
  onSelectNote
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isModelLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };
  
  const handleSourceClick = (notePath: string) => {
      onSelectNote(notePath);
  }

  const agentOptions: { id: Agent; name: string; icon: React.ReactNode; placeholder: string; }[] = [
    { id: 'smart-chat', name: 'Smart Chat', icon: <BrainCircuitIcon className="w-4 h-4" />, placeholder: 'Ask me anything...' },
    { id: 'rag', name: 'Answer from Notes', icon: <SearchIcon className="w-4 h-4" />, placeholder: 'Ask a question about your notes...' },
    { id: 'web-search', name: 'Web Search', icon: <GlobeIcon className="w-4 h-4" />, placeholder: 'Search the web...' },
  ];

  const currentAgent = agentOptions.find(opt => opt.id === selectedAgent) || agentOptions[0];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        <div className="space-y-6">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-[#cba6f7] flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-[#1e1e2e]" />
                </div>
              )}
              <div
                className={`max-w-2xl px-4 py-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-[#89b4fa] text-[#1e1e2e]'
                    : 'bg-[#313244] text-[#cdd6f4]'
                }`}
              >
                <div className="prose prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-a:text-[#89b4fa] hover:prose-a:text-[#a6e3a1]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content || ''}
                  </ReactMarkdown>
                </div>
                {message.role === 'model' && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#45475a]">
                        <h4 className="text-xs font-semibold text-[#a6adc8] mb-2">Sources:</h4>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map(source => (
                                <button
                                 key={source.file.path}
                                 onClick={() => handleSourceClick(source.file.path)}
                                 className="px-2 py-1 bg-[#45475a] text-xs text-[#f5c2e7] rounded hover:bg-[#585b70] transition-colors"
                                >
                                    {source.file.basename}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {message.role === 'model' && message.webSources && message.webSources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#45475a]">
                        <h4 className="text-xs font-semibold text-[#a6adc8] mb-2">Web Sources:</h4>
                        <div className="flex flex-col space-y-2">
                            {message.webSources.map((source, idx) => (
                                <a
                                 key={idx}
                                 href={source.uri}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-xs text-[#94e2d5] hover:underline truncate"
                                >
                                    {source.title || source.uri}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isModelLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1]?.role === 'model' && chatHistory[chatHistory.length-1].content === '' && (
             <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#cba6f7] flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-[#1e1e2e]" />
                </div>
                <div className="max-w-xl px-4 py-3 rounded-xl bg-[#313244] text-[#cdd6f4]">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-[#a6adc8] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-[#a6adc8] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-[#a6adc8] rounded-full animate-pulse"></div>
                    </div>
                </div>
             </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={currentAgent.placeholder}
            className="w-full bg-[#313244] border border-[#45475a] rounded-lg pl-4 pr-40 py-3 resize-none text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:ring-2 focus:ring-[#89b4fa]"
            rows={1}
            disabled={isModelLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <div className="relative inline-block text-left">
                <select 
                    value={selectedAgent}
                    onChange={(e) => onSelectAgent(e.target.value as Agent)}
                    className="appearance-none bg-[#45475a] text-xs text-[#cdd6f4] rounded-md pl-8 pr-4 py-2 focus:outline-none"
                    style={{ backgroundPosition: 'left 0.5rem center', backgroundRepeat: 'no-repeat' }}
                >
                    {agentOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-[#a6adc8]">
                    {currentAgent.icon}
                </div>
            </div>

            <button
              type="submit"
              disabled={isModelLoading || !inputMessage.trim()}
              className="p-2 rounded-lg bg-[#89b4fa] text-[#1e1e2e] disabled:bg-[#45475a] disabled:text-[#6c7086] transition-colors"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatView;