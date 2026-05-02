import { useState } from 'react';
import { kotlinCode, pythonCode } from '../data';
import { FileCode2, FileJson } from 'lucide-react';

export default function Editor() {
  const [activeFile, setActiveFile] = useState<'kotlin' | 'python'>('kotlin');

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-x border-neutral-800">
      <div className="flex border-b border-neutral-800 bg-[#252526] overflow-x-auto scollbar-hide">
        <button
          onClick={() => setActiveFile('kotlin')}
          className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors whitespace-nowrap ${
            activeFile === 'kotlin' 
              ? 'bg-[#1e1e1e] text-blue-400 border-t-2 border-t-blue-500' 
              : 'text-neutral-400 hover:bg-[#2a2d2e] border-t-2 border-t-transparent'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          LocalAdbService.kt
        </button>
        <button
          onClick={() => setActiveFile('python')}
          className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors whitespace-nowrap ${
            activeFile === 'python' 
              ? 'bg-[#1e1e1e] text-yellow-400 border-t-2 border-t-yellow-500' 
              : 'text-neutral-400 hover:bg-[#2a2d2e] border-t-2 border-t-transparent'
          }`}
        >
          <FileJson className="w-4 h-4" />
          bootstrap.py
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-sm leading-relaxed text-neutral-300">
          <code>
            {activeFile === 'kotlin' ? kotlinCode : pythonCode}
          </code>
        </pre>
      </div>
    </div>
  );
}
