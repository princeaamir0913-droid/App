import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, MessageSquare, Code2, ShieldAlert } from 'lucide-react';
import { useWS } from '../WSContext';

export default function AgentManager({ isSidebar = false }: { isSidebar?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { agents } = useWS();

  const getAgentStyling = (id: string) => {
    switch (id) {
      case 'planner': return { icon: Bot, color: "text-blue-400", bg: "bg-blue-500/10" };
      case 'coder': return { icon: Code2, color: "text-purple-400", bg: "bg-purple-500/10" };
      case 'debugger': return { icon: ShieldAlert, color: "text-emerald-400", bg: "bg-emerald-500/10" };
      default: return { icon: Bot, color: "text-neutral-400", bg: "bg-neutral-500/10" };
    }
  };

  if (isSidebar) {
    return (
      <div className="space-y-4">
        {agents.map((agent, i) => {
          const styling = getAgentStyling(agent.id);
          return (
            <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-neutral-900/50 border border-neutral-800">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styling.bg}`}>
                <styling.icon className={`w-4 h-4 ${styling.color}`} />
              </div>
              <div className="hidden sm:block">
                <h4 className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest">{agent.name}</h4>
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">{agent.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                Orchestrator
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {agents.map((agent, i) => {
                const styling = getAgentStyling(agent.id);
                return (
                  <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-neutral-800/50 border border-neutral-800/50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styling.bg}`}>
                      <styling.icon className={`w-5 h-5 ${styling.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-200">{agent.name}</h4>
                      <p className="text-xs text-neutral-500 truncate max-w-[180px]">{agent.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
