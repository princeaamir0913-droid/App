import { useState, useRef, useEffect, FormEvent } from 'react';
import { useWS } from '../WSContext';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export default function AgentChat() {
  const { chatHistory, sendMessage, isConnected } = useWS();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-transparent font-sans">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide pb-32">
        {chatHistory.map((chat, idx) => (
          <div key={idx} className={`flex gap-4 md:gap-6 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {chat.sender === 'manager' && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[85%] md:max-w-[75%] ${chat.sender === 'user' ? 'order-1' : 'order-2'}`}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  {chat.sender === 'user' ? 'Operator' : 'Agentic Manager'}
                </span>
                {chat.sender === 'manager' && <Sparkles className="w-3 h-3 text-blue-400" />}
              </div>
              
              <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xl backdrop-blur-md ${
                chat.sender === 'user' 
                  ? 'bg-neutral-800/80 border border-neutral-700/50 text-white rounded-tr-sm' 
                  : 'bg-[#15161A]/90 border border-[#2A2D3A] text-neutral-200 rounded-tl-sm'
              }`}>
                {chat.sender === 'user' ? (
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                ) : (
                  <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-loose prose-pre:bg-black/50 prose-pre:border prose-pre:border-neutral-800">
                    <Markdown>{chat.message}</Markdown>
                  </div>
                )}
              </div>
            </div>
            
            {chat.sender === 'user' && (
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 order-2">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-20 pointer-events-none">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto backdrop-blur-xl bg-[#1A1C23]/60 p-2 rounded-2xl border border-[#2A2D3A] shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!isConnected}
            placeholder={isConnected ? "Message the Agentic Manager..." : "Connecting to swarm..."}
            className="flex-1 bg-transparent border-none px-4 py-3 text-[15px] text-white placeholder-neutral-500 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
