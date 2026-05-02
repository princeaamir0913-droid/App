import { Smartphone, RotateCw, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useWS } from '../WSContext';

export default function VirtualPhone() {
  const { phoneReloadKey } = useWS();
  const [isLaunched, setIsLaunched] = useState(false);
  const [todos, setTodos] = useState<{id: number, text: string, done: boolean}[]>([
    { id: 1, text: "Learn Jetpack Compose", done: true },
    { id: 2, text: "Hook up Shizuku APIs", done: false },
  ]);

  // When agent triggers a reload, auto-launch
  useEffect(() => {
    if (phoneReloadKey > 0) {
      setIsLaunched(false);
      setTimeout(() => setIsLaunched(true), 600);
    }
  }, [phoneReloadKey]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-neutral-950 border-x border-neutral-800">
      <div className="relative w-full max-w-[320px] aspect-[9/19] bg-neutral-900 rounded-[2.5rem] border-[8px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
          <div className="w-32 h-full bg-neutral-800 rounded-b-xl"></div>
        </div>

        {/* Screen */}
        <div className="flex-1 bg-black relative flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="h-7 w-full flex justify-end items-center px-6 pt-1 gap-2 text-white/50 z-40 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0">
            <Activity className="w-3 h-3" />
            <div className="text-[10px] font-medium font-sans">12:30</div>
          </div>

          {/* Render Actual App or Sandbox Screen */}
          <AnimatePresence mode="wait">
            {!isLaunched ? (
              <motion.div 
                key="sandbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden"
              >
                {/* Background grids */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="relative z-10 p-4 rounded-full bg-blue-500/10"
                >
                  <Cpu className="w-12 h-12 text-blue-500" />
                </motion.div>

                <div className="relative z-10 space-y-2">
                  <h3 className="text-white font-medium text-lg">Nested Sandbox</h3>
                  <p className="text-neutral-400 text-xs">Work Profile isolated space. KVM extensions loaded.</p>
                </div>

                <div className="relative z-10 flex gap-4 w-full">
                  <div className="flex-1 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 flex flex-col items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-neutral-300">Secure</span>
                  </div>
                  <div className="flex-1 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 flex flex-col items-center gap-2">
                    <RotateCw className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-neutral-300">Live Sync</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsLaunched(true)}
                  className="relative z-10 mt-4 px-6 py-2.5 rounded-full bg-white text-black font-medium text-sm flex items-center gap-2 w-full justify-center hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  Launch App Variant
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="app"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="flex-1 bg-white pt-8 pb-4 flex flex-col pt-12"
              >
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-black font-bold text-xl">My Tasks</h2>
                  <button onClick={() => setIsLaunched(false)} className="text-blue-500 text-xs font-semibold uppercase tracking-wider">Close</button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {todos.map(todo => (
                    <div key={todo.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${todo.done ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 shadow-sm'}`}>
                      <div 
                        onClick={() => setTodos(t => t.map(x => x.id === todo.id ? {...x, done: !x.done} : x))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${todo.done ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}
                      >
                        {todo.done && <ShieldCheck className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-[15px] font-medium ${todo.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {todo.text}
                      </span>
                    </div>
                  ))}
                  <button 
                    onClick={() => setTodos([...todos, { id: Date.now(), text: "New Generated Task", done: false }])}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer mt-4"
                  >
                    + Add Fake Task
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-1/3 bg-white/30 backdrop-invert mx-auto rounded-full z-50"></div>
        </div>
      </div>
    </div>
  );
}
