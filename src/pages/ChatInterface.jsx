import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Plus, MessageSquare, Trash2, Settings, Bot, Download, Sparkles, Database } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const SUGGESTIONS = [
  "Explain CRISPR-Cas9 mechanism",
  "Write a Python script to count GC content",
  "Difference between DNA and RNA?",
  "What is the function of Hemoglobin?"
];

export default function ChatInterface() {
  const { 
    sessions, currentSessionId, setCurrentSessionId, createNewChat, deleteChat, downloadChat,
    messages, sendMessage, isLoading, apiConfig, setApiConfig, chatEndRef 
  } = useChat();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Helper to send message from suggested chips
  const handleSuggestionClick = (suggestion) => {
      setInput(suggestion);
      sendMessage(suggestion);
      setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fadeIn">
      
      {/* LEFT: History Sidebar (Chat Sessions) */}
      <div className="w-64 flex flex-col pro-panel bg-panel overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-border bg-input/20">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-lg font-bold transition-all shadow-sm"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => setCurrentSessionId(session.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                session.id === currentSessionId 
                  ? 'bg-brand/10 border border-brand/50 text-brand' 
                  : 'text-txt-secondary hover:bg-page hover:text-txt-primary'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} />
                <span className="truncate text-sm font-medium">{session.title}</span>
              </div>
              <button 
                onClick={(e) => deleteChat(session.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Settings Toggle */}
        <div className="p-4 border-t border-border bg-input/10">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs text-txt-muted hover:text-brand transition-colors w-full"
          >
            <Settings size={14} /> AI Configuration
          </button>
        </div>
      </div>

      {/* RIGHT: Chat Area */}
      <div className="flex-1 flex flex-col pro-panel bg-panel overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-input/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Bot size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-bold text-txt-primary">BioMentor AI</h2>
              <p className="text-xs text-txt-secondary flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {apiConfig.model}
              </p>
            </div>
          </div>
          <button onClick={downloadChat} className="p-2 text-txt-secondary hover:text-brand hover:bg-page rounded-lg transition-colors" title="Export Chat">
            <Download size={18} />
          </button>
        </div>

        {/* Settings Overlay */}
        {showSettings && (
          <div className="absolute top-16 left-4 right-4 z-20 p-4 bg-panel border border-border rounded-xl shadow-2xl animate-fadeIn">
             <label className="text-xs text-txt-muted uppercase font-bold">API Endpoint</label>
             <input 
                value={apiConfig.endpoint} 
                onChange={(e) => setApiConfig({...apiConfig, endpoint: e.target.value})}
                className="w-full bg-input border border-border p-2 rounded mt-1 text-sm text-txt-primary mb-3"
             />
             <label className="text-xs text-txt-muted uppercase font-bold">Model Name</label>
             <input 
                value={apiConfig.model} 
                onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                className="w-full bg-input border border-border p-2 rounded mt-1 text-sm text-txt-primary"
             />
             <label className="text-xs text-txt-muted uppercase font-bold mt-3 block">API Key</label>
             <input 
                type="password"
                value={apiConfig.apiKey} 
                onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                className="w-full bg-input border border-border p-2 rounded mt-1 text-sm text-txt-primary"
             />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-txt-muted opacity-80">
              <Bot size={64} className="mb-6 text-border" />
              <p className="text-lg font-medium mb-8">How can I help you with your research?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSuggestionClick(s)}
                    className="p-3 text-sm text-left bg-page border border-border rounded-xl hover:border-brand/50 hover:text-brand transition-all flex items-center gap-2"
                  >
                    <Sparkles size={14} className="shrink-0" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-brand text-white rounded-br-none' 
                  : 'bg-page border border-border text-txt-secondary rounded-bl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  /* MARKDOWN RENDERING */
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        // Custom styles for Tables, Code Blocks, and Text Density
                        code: ({node, inline, className, children, ...props}) => (
                          <code className={`${inline ? 'bg-black/20 px-1 py-0.5 rounded text-yellow-300' : 'block bg-black/40 p-3 rounded-lg border border-white/10 my-2 overflow-x-auto text-yellow-300'} font-mono text-xs`} {...props}>
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="w-full text-xs border-collapse border border-border text-txt-secondary">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="p-2 border border-border bg-input/40 text-txt-primary font-bold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="p-2 border border-border">
                            {children}
                          </td>
                        ),
                        p: ({ children }) => (
                          <p className="mb-3 text-txt-secondary">{children}</p>
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {msg.isRag && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] opacity-70">
                    <Database size={10} /> Verified by Knowledge Base
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-page p-4 rounded-2xl rounded-tl-none border border-border flex gap-2 items-center">
                <div className="w-2 h-2 bg-brand rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-brand rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-page border-t border-border">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (sendMessage(input), setInput(''))}
              className="flex-1 bg-input/50 border border-border rounded-xl px-4 py-3 text-txt-primary placeholder-txt-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="Type your question here..."
              disabled={isLoading}
            />
            <button 
              onClick={() => { sendMessage(input); setInput(''); }}
              disabled={isLoading || !input.trim()}
              className="px-4 bg-brand hover:bg-brand-hover disabled:bg-border disabled:text-txt-muted text-white rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-brand/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}