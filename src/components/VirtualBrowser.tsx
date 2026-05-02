import { useState, useRef, useEffect } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Monitor, Blocks, X, Plus, Activity, Star, Home, Search, Bot, MoreVertical, XCircle, LayoutPanelLeft } from 'lucide-react';
import { useWS } from '../WSContext';
import Markdown from 'react-markdown';

interface Extension {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
}

interface BrowserTab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
}

interface Bookmark {
  url: string;
  title: string;
}

const DEFAULT_EXTENSIONS: Extension[] = [
  {
    id: '1',
    name: 'Dark Mode Enforcer',
    code: 'document.body.style.backgroundColor = "#1a1a1a"; document.body.style.color = "#e5e5e5";',
    enabled: false
  },
  {
    id: '2',
    name: 'Remove Images',
    code: 'document.querySelectorAll("img").forEach(img => img.remove());',
    enabled: false
  }
];

export default function VirtualBrowser() {
  // Use WS for AI Copilot in browser
  const { isConnected, chatHistory, sendMessage } = useWS();
  const [copilotInput, setCopilotInput] = useState('');
  const [showCopilot, setShowCopilot] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement>(null);

  // Browser State
  const [tabs, setTabs] = useState<BrowserTab[]>([{
    id: 'tab-1',
    url: 'https://example.com',
    title: 'New Tab',
    history: ['https://example.com'],
    historyIndex: 0
  }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    { title: 'Google', url: 'https://google.com' },
    { title: 'Wikipedia', url: 'https://wikipedia.org' }
  ]);
  const [showBookmarks, setShowBookmarks] = useState(true);

  // Extensions
  const [showExtensions, setShowExtensions] = useState(false);
  const [extensions, setExtensions] = useState<Extension[]>(DEFAULT_EXTENSIONS);
  const [newExtName, setNewExtName] = useState('');
  const [newExtCode, setNewExtCode] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    setUrlInput(activeTab.url);
  }, [activeTab.url, activeTabId]);

  useEffect(() => {
    if (showCopilot) {
      copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showCopilot]);

  const updateTab = (id: string, updates: Partial<BrowserTab>) => {
    setTabs(tabs.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const navigateTo = (url: string) => {
    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.') && !finalUrl.includes(' ')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(finalUrl);
      }
    }
    
    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    newHistory.push(finalUrl);
    
    updateTab(activeTabId, {
      url: finalUrl,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      title: finalUrl // Basic title fallback
    });
    setUrlInput(finalUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateTo(urlInput);
    }
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const prevIndex = activeTab.historyIndex - 1;
      updateTab(activeTabId, {
        historyIndex: prevIndex,
        url: activeTab.history[prevIndex]
      });
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      updateTab(activeTabId, {
        historyIndex: nextIndex,
        url: activeTab.history[nextIndex]
      });
    }
  };

  const handleHome = () => {
    navigateTo('https://example.com');
  };

  const handleReload = () => {
    const temp = activeTab.url;
    updateTab(activeTabId, { url: '' });
    setIsLoading(true);
    setTimeout(() => {
      updateTab(activeTabId, { url: temp });
      setIsLoading(false);
    }, 500);
  };

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => b.url !== activeTab.url));
    } else {
      setBookmarks([...bookmarks, { title: activeTab.title || activeTab.url, url: activeTab.url }]);
    }
  };

  // Tabs Management
  const addNewTab = () => {
    const newId = 'tab-' + Date.now();
    setTabs([...tabs, {
      id: newId,
      url: 'https://example.com',
      title: 'New Tab',
      history: ['https://example.com'],
      historyIndex: 0
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close last tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // Extension Management
  const toggleExtension = (id: string) => {
    setExtensions(extensions.map(ext => 
      ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
    ));
    handleReload();
  };

  const addExtension = () => {
    if (!newExtName.trim() || !newExtCode.trim()) return;
    setExtensions([...extensions, {
      id: Date.now().toString(),
      name: newExtName,
      code: newExtCode,
      enabled: true
    }]);
    setNewExtName('');
    setNewExtCode('');
  };

  const removeExtension = (id: string) => {
    setExtensions(extensions.filter(ext => ext.id !== id));
  };

  const handleIframeLoad = () => {
    if (!iframeRef.current) return;
    const activeExtensions = extensions.filter(ext => ext.enabled);
    if (activeExtensions.length > 0) {
      try {
        const iframeWin = iframeRef.current.contentWindow;
        if (iframeWin) {
          activeExtensions.forEach(ext => {
            (iframeWin as any).eval(ext.code);
          });
        }
      } catch (err) {
        // Cross-origin exception expected
      }
    }
  };

  const submitCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (copilotInput.trim() && isConnected) {
      sendMessage(`[Copilot Browser Request] URL: ${activeTab.url} -> ${copilotInput}`);
      setCopilotInput('');
    }
  };

  const isBookmarked = bookmarks.some(b => b.url === activeTab.url);
  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div className="absolute inset-0 flex flex-col bg-neutral-950 font-sans z-10 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-[#0A0A0B] border-b border-neutral-800/80 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-2 group min-w-[140px] max-w-[200px] px-3 py-1.5 rounded-t-lg cursor-pointer transition-all ${
              activeTabId === tab.id 
                ? 'bg-neutral-900 border-x border-t border-neutral-800 text-white' 
                : 'text-neutral-500 hover:bg-[#15161A] hover:text-neutral-300'
            }`}
          >
            <Globe className={`w-3 h-3 shrink-0 ${activeTabId === tab.id ? 'text-blue-400' : ''}`} />
            <span className="text-xs truncate flex-1">{tab.title || tab.url}</span>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className={`hover:bg-neutral-800 rounded p-0.5 ${tabs.length === 1 ? 'invisible' : 'visible opacity-0 group-hover:opacity-100'}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button onClick={addNewTab} className="p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 mx-1">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Browser Chrome / Action Bar */}
      <div className="flex flex-col bg-neutral-900 border-b border-neutral-800 backdrop-blur-md">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={handleBack} 
              disabled={!canGoBack}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${canGoBack ? 'hover:bg-neutral-800 text-neutral-300' : 'text-neutral-600'}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleForward}
              disabled={!canGoForward}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${canGoForward ? 'hover:bg-neutral-800 text-neutral-300' : 'text-neutral-600'}`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={handleReload} className="p-1.5 md:p-2 rounded-md hover:bg-neutral-800 text-neutral-300 transition-colors">
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleHome} className="p-1.5 md:p-2 rounded-md hover:bg-neutral-800 text-neutral-300 transition-colors">
              <Home className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 max-w-4xl flex items-center bg-neutral-950 rounded-full border border-neutral-800/80 px-4 py-1.5 focus-within:border-blue-500/50 focus-within:ring-1 transition-all">
            <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0 hidden sm:block" />
            <input 
              type="text" 
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-[13px] md:text-sm text-neutral-200 focus:outline-none focus:ring-0 placeholder-neutral-500"
              placeholder="Search or type a URL"
            />
            <button type="button" onClick={toggleBookmark} className="ml-2">
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`} />
            </button>
          </form>
          
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button 
              onClick={() => setShowCopilot(!showCopilot)}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${showCopilot ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-neutral-800 text-neutral-400'}`}
              title="AI Browser Copilot"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowExtensions(!showExtensions)}
              className={`p-1.5 md:p-2 rounded-md transition-colors ${showExtensions ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-neutral-800 text-neutral-400'}`}
              title="Extensions"
            >
              <Blocks className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-neutral-800 mx-1"></div>
            <button 
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 transition-colors"
              title="Toggle Bookmarks Bar"
            >
              <LayoutPanelLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bookmarks Bar */}
        {showBookmarks && bookmarks.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-[#0D0D0E] border-t border-neutral-800/50 text-[11px] overflow-x-auto scrollbar-hide">
            {bookmarks.map((bm, i) => (
              <button 
                key={i} 
                onClick={() => navigateTo(bm.url)}
                className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 px-2 py-1 rounded max-w-[200px] truncate"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{bm.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden relative z-10 w-full bg-white">
        
        {/* Main Viewport */}
        <div className="flex-1 h-full relative z-0 w-full overflow-hidden">
          {activeTab.url ? (
            <iframe 
              ref={iframeRef}
              src={activeTab.url} 
              onLoad={handleIframeLoad}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="Virtual Web View"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-neutral-600">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest">Awaiting Connection</p>
            </div>
          )}
        </div>

        {/* AI Copilot Side Panel */}
        {showCopilot && (
          <div className="w-80 border-l border-neutral-800 bg-[#0A0A0B] flex flex-col shadow-2xl relative z-10 shrink-0 h-full">
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-neutral-200">AI Copilot</h3>
              </div>
              <button onClick={() => setShowCopilot(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex gap-3 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    chat.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm'
                  }`}>
                    {chat.sender === 'user' ? (
                      <p className="text-[13px] leading-relaxed break-words">{chat.message}</p>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-[13px] prose-a:text-blue-400">
                        <Markdown>{chat.message}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={copilotEndRef} />
            </div>
            
            <div className="p-3 border-t border-neutral-800 bg-neutral-950">
              <form onSubmit={submitCopilot} className="relative">
                <input 
                  type="text" 
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  disabled={!isConnected}
                  placeholder="Ask copilot..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-10 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!isConnected || !copilotInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-500">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Agentic Manager Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        )}

        {/* Extensions Overlay */}
        {showExtensions && (
          <div className="absolute right-4 top-4 w-80 bg-[#1A1C23] border border-[#2A2D3A] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-[#2A2D3A] flex items-center justify-between bg-[#15161A]">
              <h3 className="font-semibold text-sm text-neutral-200 flex items-center gap-2">
                <Blocks className="w-4 h-4 text-blue-400" />
                Extensions
              </h3>
              <button onClick={() => setShowExtensions(false)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto flex-1">
              <div className="space-y-2 mb-4">
                {extensions.map(ext => (
                  <div key={ext.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-300">{ext.name}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleExtension(ext.id)}
                          className={`w-8 h-4 rounded-full relative transition-colors ${ext.enabled ? 'bg-blue-600' : 'bg-neutral-700'}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${ext.enabled ? 'left-4' : 'left-0.5'}`} />
                        </button>
                        <button onClick={() => removeExtension(ext.id)} className="text-neutral-500 hover:text-red-400 bg-neutral-800 rounded p-1">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500 bg-black/40 p-1.5 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                      {ext.code}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Add Script</h4>
                <input 
                  value={newExtName}
                  onChange={e => setNewExtName(e.target.value)}
                  placeholder="Extension Name"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 mb-2 focus:border-blue-500 focus:outline-none"
                />
                <textarea 
                  value={newExtCode}
                  onChange={e => setNewExtCode(e.target.value)}
                  placeholder="JavaScript Code"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 font-mono mb-2 h-20 resize-none focus:border-blue-500 focus:outline-none"
                />
                <button 
                  onClick={addExtension}
                  disabled={!newExtName.trim() || !newExtCode.trim()}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-md py-1.5 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Extension
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

