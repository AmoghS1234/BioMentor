import { useState, useEffect, useRef } from 'react';
import { generateBioResponse, DEFAULT_CONFIG } from '../lib/ai';

export const useChat = () => {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('bioSessions');
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: 'New Chat', messages: [] }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(sessions[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState(DEFAULT_CONFIG);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('bioSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const createNewChat = () => {
    const newSession = { id: Date.now(), title: 'New Conversation', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteChat = (id, e) => {
    if(e) e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
      const fresh = { id: Date.now(), title: 'New Conversation', messages: [] };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(newSessions);
      if (id === currentSessionId) setCurrentSessionId(newSessions[0].id);
    }
  };

  // NEW: Export Chat Functionality
  const downloadChat = () => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const content = currentSession.messages.map(m => 
      `[${m.role.toUpperCase()}]\n${m.content}\n`
    ).join('\n-------------------\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biomentor-session-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    const currentSession = sessions.find(s => s.id === currentSessionId);
    const history = currentSession ? currentSession.messages : [];

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const title = s.messages.length === 0 ? input.slice(0, 30) + '...' : s.title;
        return { ...s, title, messages: [...s.messages, { role: 'user', content: input }] };
      }
      return s;
    }));

    setIsLoading(true);

    const { text, usedContext, error } = await generateBioResponse(input, history, apiConfig);

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { 
          ...s, 
          messages: [...s.messages, { 
            role: 'assistant', 
            content: text, 
            isRag: usedContext, 
            isError: error 
          }] 
        };
      }
      return s;
    }));

    setIsLoading(false);
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewChat,
    deleteChat,
    downloadChat, // Exported here
    messages: sessions.find(s => s.id === currentSessionId)?.messages || [],
    sendMessage,
    isLoading,
    apiConfig,
    setApiConfig,
    chatEndRef
  };
};