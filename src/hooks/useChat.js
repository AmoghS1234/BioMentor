import { useState, useEffect, useRef } from 'react';
import { generateBioResponse, DEFAULT_CONFIG } from '../lib/ai';
import { useFirebase } from './useFirebase';

export const useChat = () => {
  const { user, profile, updateProfileSetting, isAuthReady } = useFirebase();

  // Load chat history from LocalStorage (Hybrid approach for speed)
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('bioSessions');
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: 'New Chat', messages: [] }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(sessions[0].id);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize AI Config with defaults
  const [apiConfig, setApiConfig] = useState(DEFAULT_CONFIG);
  const chatEndRef = useRef(null);

  // 1. Sync AI Settings from Cloud Profile
  useEffect(() => {
      if (profile && profile.aiModel) {
          setApiConfig(prev => ({
              ...prev,
              model: profile.aiModel,
              endpoint: profile.aiEndpoint || DEFAULT_CONFIG.baseUrl,
          }));
      }
  }, [profile]);

  // 2. Save AI Settings to Cloud when changed
  const handleConfigChange = (newConfig) => {
    setApiConfig(newConfig);
    if (user) {
        updateProfileSetting({
            aiModel: newConfig.model,
            aiEndpoint: newConfig.endpoint,
        });
    }
  };

  useEffect(() => {
    localStorage.setItem('bioSessions', JSON.stringify(sessions));
  }, [sessions]);

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
    downloadChat: () => {}, 
    messages: sessions.find(s => s.id === currentSessionId)?.messages || [],
    sendMessage,
    isLoading,
    apiConfig,
    setApiConfig: handleConfigChange, // Uses cloud sync
    chatEndRef
  };
};