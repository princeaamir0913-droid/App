import { motion } from 'motion/react';
import { Bot, CheckCircle, Play } from 'lucide-react';
import { architecture, libraries } from '../data';
import { useWS } from '../WSContext';

export default function PlanningMode() {
  const { startPlanning, isConnected } = useWS();
  const steps = [
    "Verify Shizuku Binder state.",
    "Establish 127.0.0.1 ADB loopback pipeline.",
    "Enforce PID Safeguard constraints.",
    "Mount Virtual Phone Sandbox (Work Profile).",
    "Initialize LSP Backend for Python/Kotlin.",
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 text-neutral-300 space-y-8 bg-neutral-900 border-x border-neutral-800 pb-20">
      <div className="space-y-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Planning Mode</h2>
          </div>
          <button
            onClick={startPlanning}
            disabled={!isConnected}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg font-medium transition-colors cursor-pointer text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            {isConnected ? "Start Simulation" : "Connecting..."}
          </button>
        </div>
        <p className="text-neutral-400 max-w-2xl leading-relaxed">
          The Planning Agent has analyzed the request and created a step-by-step roadmap to prevent hallucinations before generating any code.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">Execution Roadmap</h3>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: idx * 0.15 }}
              key={idx} 
              className="flex items-start gap-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-800"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-neutral-200">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{architecture.title}</h3>
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-blue-300">
            {architecture.content}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{libraries.title}</h3>
          <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-emerald-300">
            {libraries.content}
          </div>
        </div>
      </div>
    </div>
  );
}
