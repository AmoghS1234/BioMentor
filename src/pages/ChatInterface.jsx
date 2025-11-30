import React, { useState, useEffect, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Send, Plus, MessageSquare, Trash2, Settings, Bot, Download, Sparkles, Database, Loader, User, Copy, Check, AlertTriangle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { useFirebase } from '../hooks/useFirebase';

// --- MERMAID CONFIGURATION ---
try {
  mermaid.initialize({
    startOnLoad: false,
    suppressErrorRendering: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'sans-serif',
  });
  mermaid.parseError = (err) => {
    console.error("Mermaid Parse Error (Suppressed):", err);
  };
} catch (e) {
  console.warn("Mermaid init warning:", e);
}

// --- HELPER: Copy Code Button ---
const CodeBlock = ({ inline, className, children }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isMermaid = match && match[1] === 'mermaid';

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && isMermaid) {
    return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
  }

  if (inline) {
    return (
      <code className="bg-brand/10 text-brand-light px-1.5 py-0.5 rounded text-xs font-mono font-bold">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-4 rounded border border-border">
      <div className="flex justify-between items-center bg-input/50 px-3 py-1.5 border-b border-border">
        <span className="text-xs text-txt-muted uppercase font-bold font-mono">{match ? match[1] : 'TEXT'}</span>
        <button onClick={handleCopy} className="text-txt-muted hover:text-brand transition-colors">
          {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 bg-[#0d1117] overflow-x-auto m-0">
        <code className="text-sm font-mono text-gray-300 leading-relaxed">
          {children}
        </code>
      </pre>
    </div>
  );
};

// --- MEMOIZED MERMAID COMPONENT ---
const MermaidChart = memo(({ chart }) => {
  const ref = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || chart.trim().length < 5) return;
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(null);
      } catch (e) {
        console.error("Mermaid Render Failed:", e);
        setError("Diagram syntax error. Showing raw code instead.");
      }
    };
    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold mb-2">
          <AlertTriangle size={14} /> {error}
        </div>
        <pre className="text-xs font-mono text-txt-secondary overflow-x-auto p-2 bg-black/20 rounded">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden shadow-sm border border-border bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Figure 1: Generated Diagram</span>
      </div>
      <div 
        className="p-6 flex justify-center overflow-x-auto" 
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    </div>
  );
});

// --- MESSAGE BUBBLE ---
const MessageBubble = memo(({ msg }) => {
  const isUser = msg.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border border-border ${
          isUser ? 'bg-brand text-white' : 'bg-input text-brand'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-4 rounded-lg text-sm leading-7 w-full ${
            isUser 
              ? 'bg-brand/10 border border-brand/20 text-txt-primary' 
              : 'bg-transparent text-txt-secondary'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  // FIX: Use div instead of p to prevent "div inside p" hydration errors
                  p: ({ children }) => <div className="mb-4 last:mb-0 leading-relaxed">{children}</div>,
                  // FIX: Unwrap pre tags so CodeBlock (div) isn't nested inside pre
                  pre: ({ children }) => <>{children}</>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 border border-border rounded">
                      <table className="w-full text-sm text-left bg-page">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-input text-txt-primary uppercase font-bold text-xs">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 border-b border-border whitespace-nowrap">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 border-b border-border/50 font-mono text-xs">{children}</td>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 marker:text-brand">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-brand">{children}</ol>,
                  a: ({ children, href }) => <a href={href} target="_blank" className="text-brand hover:underline font-bold">{children}</a>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-brand pl-4 py-1 my-4 text-txt-muted italic">{children}</blockquote>
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
          {!isUser && msg.isRag && (
            <div className="mt-2 ml-1 flex items-center gap-1 text-[10px] text-brand font-mono uppercase tracking-wider opacity-80">
              <Database size={10} /> Knowledge Base
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// --- CONSTANTS ---
const SUGGESTIONS = [
  "Visualize the Central Dogma",
  "Draw a flowchart for PCR steps",
  "Compare DNA vs RNA in a table",
  "Write a Python script to count GC content"
];

const ConfigInput = ({ label, value, type, onUpdate }) => (
    <div className="space-y-1.5">
        <label className="text-xs text-txt-muted uppercase font-bold tracking-wide">{label}</label>
        <input 
            type={type || 'text'}
            value={value} 
            onChange={(e) => onUpdate(e.target.value)}
            className="pro-input text-xs font-mono"
            disabled={label === 'API Key'} 
        />
    </div>
);

// --- MAIN CHAT INTERFACE ---
export default function ChatInterface() {
  const { 
    sessions, currentSessionId, setCurrentSessionId, createNewChat, deleteChat, downloadChat,
    messages, sendMessage, isLoading, apiConfig, setApiConfig, chatEndRef 
  } = useChat();
  const { isAuthReady } = useFirebase();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef(null); 

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isLoading, currentSessionId]);

  const handleSend = () => {
      if (!input.trim() || isLoading) return;
      sendMessage(input);
      setInput('');
  };

  const handleSuggestionClick = (suggestion) => {
      setInput(suggestion);
      sendMessage(suggestion);
      setInput('');
  };

  const updateEndpoint = (value) => setApiConfig({...apiConfig, endpoint: value});
  const updateModel = (value) => setApiConfig({...apiConfig, model: value});

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 animate-fadeIn relative">
      
      {/* LEFT: History Sidebar */}
      <div className="w-72 flex flex-col pro-panel bg-panel overflow-hidden hidden lg:flex shadow-xl border-r-0">
        <div className="p-4 border-b border-border bg-input/10">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded font-bold transition-all shadow-md text-sm"
            disabled={!isAuthReady}
          >
            <Plus size={16} /> New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {!isAuthReady ? (
            <div className="text-center py-10 text-txt-muted flex flex-col items-center gap-2">
              <Loader className="animate-spin" size={20} /> 
              <span className="text-xs uppercase font-bold tracking-widest">Connecting...</span>
            </div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group flex items-center justify-between p-3 rounded cursor-pointer transition-all border border-transparent ${
                  session.id === currentSessionId 
                    ? 'bg-brand/10 border-brand/20 text-brand' 
                    : 'text-txt-secondary hover:bg-page hover:text-txt-primary hover:border-border'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={14} className={session.id === currentSessionId ? "fill-current" : ""} />
                  <span className="truncate text-xs font-medium font-mono">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1.5 hover:bg-red-500/10 rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 border-t border-border bg-input/10">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full text-xs font-bold text-txt-muted hover:text-brand transition-colors p-2 rounded hover:bg-page"
          >
            <div className="flex items-center gap-2"><Settings size={12} /> SETTINGS</div>
            <span className="bg-input px-1.5 py-0.5 rounded text-[10px] text-txt-secondary font-mono">{apiConfig.model.slice(0,12)}</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 flex flex-col pro-panel bg-panel overflow-hidden relative shadow-2xl border-l-0">
        
        {/* Header */}
        <div className="h-14 border-b border-border flex justify-between items-center px-6 bg-page/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <h2 className="font-bold text-txt-primary tracking-tight text-sm uppercase">BioMentor Terminal</h2>
          </div>
          <button onClick={downloadChat} className="p-2 text-txt-secondary hover:text-brand hover:bg-input rounded transition-colors" title="Export Log">
            <Download size={16} />
          </button>
        </div>

        {/* Settings Popover */}
        {showSettings && (
          <div className="absolute bottom-20 left-6 w-72 z-30 p-5 bg-panel border border-border rounded shadow-2xl animate-fadeIn space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-txt-primary text-sm">Model Config</h4>
                <button onClick={() => setShowSettings(false)} className="text-txt-muted hover:text-white"><Settings size={14}/></button>
             </div>
             <ConfigInput label="Model ID" value={apiConfig.model} onUpdate={updateModel} />
             <div className="text-[10px] text-txt-muted bg-input/50 p-2 rounded border border-border">
                API Keys managed via Vercel ENV.
             </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth bg-page/30">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-txt-muted opacity-60">
              <div className="w-16 h-16 bg-input rounded flex items-center justify-center mb-6 border border-border">
                <Bot size={32} className="text-brand opacity-80" />
              </div>
              <p className="text-sm font-medium mb-8 text-txt-primary uppercase tracking-widest">System Ready</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSuggestionClick(s)}
                    className="p-3 text-xs text-left bg-panel border border-border rounded hover:border-brand hover:bg-brand/5 hover:text-brand transition-all flex items-center gap-3 group font-mono"
                  >
                    <span className="text-brand opacity-50 group-hover:opacity-100">{`>`}</span> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-panel border border-border px-4 py-2 rounded flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-panel border-t border-border">
          <div className="relative flex items-center bg-input/30 border border-border rounded shadow-inner focus-within:ring-1 focus-within:ring-brand focus-within:border-brand transition-all overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              className="flex-1 bg-transparent border-none px-4 py-3 text-txt-primary placeholder-txt-muted focus:ring-0 text-sm font-mono"
              placeholder="Enter command or query..."
              disabled={!isAuthReady}
            />
            <div className="pr-2">
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !isAuthReady}
                className="p-2 bg-brand hover:bg-brand-hover disabled:bg-input disabled:text-txt-muted text-white rounded transition-all shadow-md"
              >
                <Send size={16} className={isLoading ? "opacity-0" : "opacity-100"} />
                {isLoading && <Loader size={16} className="animate-spin absolute inset-0 m-auto" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}