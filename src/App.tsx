/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bot, Terminal, Code2, Smartphone, MessageSquare, Globe as GlobeIcon, Settings, Key, X } from 'lucide-react';
import PlanningMode from './components/PlanningMode';
import Editor from './components/Editor';
import SmartTerminal from './components/SmartTerminal';
import VirtualPhone from './components/VirtualPhone';
import AgentManager from './components/AgentManager';
import AgentChat from './components/AgentChat';
import VirtualBrowser from './components/VirtualBrowser';
import { useWS } from './WSContext';

type TabType = 'chat' | 'plan' | 'editor' | 'terminal' | 'phone' | 'browser';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { sendApiKey } = useWS();

  const tabs = [
    { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
    { id: 'plan', label: 'Planning Mode', icon: Bot },
    { id: 'editor', label: 'IDE Editor', icon: Code2 },
    { id: 'terminal', label: 'Smart Terminal', icon: Terminal },
    { id: 'phone', label: 'Virtual Phone', icon: Smartphone },
    { id: 'browser', label: 'Virtual Browser', icon: GlobeIcon },
  ] as const;

  const handleSaveSettings = () => {
    if (apiKeyInput.trim()) {
      sendApiKey(apiKeyInput.trim());
    }
    setShowSettings(false);
  };

  return (
    <div className="flex h-screen bg-[#000000] text-neutral-200 overflow-hidden font-sans relative">
      {/* Sidebar - Premium hardware aesthetic */}
      <div className="w-16 sm:w-64 bg-[#0A0A0B] border-r border-[#1C1D21] flex flex-col pt-6 z-20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center px-4 sm:px-6 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block ml-3">
            <h1 className="font-semibold text-sm tracking-wide text-neutral-100">Antigravity</h1>
            <h2 className="text-[10px] uppercase font-mono text-blue-400 tracking-widest mt-0.5">Mobile Pro</h2>
          </div>
        </div>
        
        <div className="hidden sm:block px-6 mb-3 text-[10px] font-mono tracking-widest uppercase text-neutral-500">
          Workspaces
        </div>
        
        <nav className="flex-1 px-2 sm:px-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center px-2 sm:px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden ${
                  isActive 
                    ? 'bg-[#1A1C23] text-white border border-[#2A2D3A] shadow-inner' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#15161A]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-500 rounded-r-md"></div>
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-400' : 'group-hover:text-neutral-300'}`} />
                <span className="hidden sm:block ml-3 font-medium text-sm tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-[#1C1D21] flex flex-col gap-4">
          <AgentManager isSidebar={true} />
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 px-2 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:block text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#050505] overflow-hidden">
        {/* Glow effect matching Hardware/Atmospheric recipe */}
        <div className="absolute top-0 right-1/4 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="absolute inset-0 z-10">
          {activeTab === 'chat' && <AgentChat />}
          {activeTab === 'plan' && <PlanningMode />}
          {activeTab === 'editor' && <Editor />}
          {activeTab === 'terminal' && <SmartTerminal />}
          {activeTab === 'browser' && <VirtualBrowser />}
          {activeTab === 'phone' && <VirtualPhone />}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#111216] border border-[#2A2D3A] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2A2D3A] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">System Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-[#1A1C23] border border-[#2A2D3A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Used by the Agentic Manager to execute operations.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-[#2A2D3A] bg-[#0A0A0B] flex justify-end gap-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
