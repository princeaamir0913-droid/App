import { useEffect, useRef } from 'react';
import { useWS } from '../WSContext';

export default function SmartTerminal() {
  const { logs, isConnected } = useWS();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm border-x border-neutral-800 flex flex-col">
      <div className="flex-none px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-xs flex justify-between items-center">
        <span>Smart Terminal (Shizuku + LSP)</span>
        <span className={isConnected ? "text-emerald-500" : "text-amber-500"}>
          {isConnected ? "Connected WS" : "Disconnected"}
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={`whitespace-pre-wrap ${log === '$' ? 'animate-pulse' : ''}`}>
            {log === '$' ? <span className="text-white">$ <span className="inline-block w-2 h-4 bg-white/70 align-middle animate-pulse"></span></span> : log}
          </div>
        ))}
      </div>
    </div>
  );
}
