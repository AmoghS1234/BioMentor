import { useState, useEffect, useRef } from 'react';
import { generateBioResponse, DEFAULT_CONFIG } from '../lib/ai';
import { useFirebase } from './useFirebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const useChat = () => {
  const { user, db, profile, isAuthReady } = useFirebase();

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState(DEFAULT_CONFIG);
  const chatEndRef = useRef(null);

  // 1. Initialize State from Storage
  const [localActiveId, setLocalActiveId] = useState(() => {
      try {
        return localStorage.getItem('lastActiveChatId') || null;
      } catch (e) { return null; }
  });

  // 2. Sync Settings from Cloud Profile
  useEffect(() => {
    if (profile?.aiModel) {
      setApiConfig(prev => ({ ...prev, model: profile.aiModel, endpoint: profile.aiEndpoint || DEFAULT_CONFIG.baseUrl }));
    }
  }, [profile]);

  // 3. Real-time Chat Sync (Firestore)
  useEffect(() => {
    if (!isAuthReady || !user) {
        setSessions([]);
        return;
    }

    const q = query(collection(db, `users/${user.uid}/chats`));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        fetched.sort((a, b) => {
            const ta = a.lastUpdated?.toMillis ? a.lastUpdated.toMillis() : (a.lastUpdated || 0);
            const tb = b.lastUpdated?.toMillis ? b.lastUpdated.toMillis() : (b.lastUpdated || 0);
            return tb - ta;
        });

        setSessions(fetched);

        setCurrentSessionId(prev => {
            if (prev && String(prev).startsWith('new-')) return prev;
            if (prev && fetched.find(s => s.id === prev)) return prev;
            if (fetched.length > 0 && !prev) return fetched[0].id;
            return null;
        });

    }, (error) => {
        console.error("Chat Sync Error:", error);
        if (error.code === 'permission-denied') {
            alert("Database Permission Denied (Read). Check Firestore Rules.");
        }
    });

    return () => unsubscribe();
  }, [user, isAuthReady, db]);

  // 4. Persist Selection
  useEffect(() => {
      if (currentSessionId && !String(currentSessionId).startsWith('new-')) {
          localStorage.setItem('lastActiveChatId', currentSessionId);
      }
  }, [currentSessionId]);

  const silentIdSwap = (oldId, newId) => {
    setCurrentSessionId(newId);
    localStorage.setItem('lastActiveChatId', newId);
  };

  const createNewChat = () => {
    const newId = 'new-' + Date.now();
    setSessions(prev => [{ id: newId, title: 'New Chat', messages: [] }, ...prev]);
    setCurrentSessionId(newId);
  };

  const deleteChat = async (id, e) => {
    if(e) { e.preventDefault(); e.stopPropagation(); }
    if (!user) return;

    if (String(id).startsWith('new-')) {
        setSessions(prev => prev.filter(s => s.id !== id));
        return;
    }

    try {
        await deleteDoc(doc(db, `users/${user.uid}/chats`, id));
    } catch (err) { console.error("Delete failed", err); }
  };

  const saveToCloud = async (session) => {
      if (!user) {
          console.warn("Cannot save: User not logged in");
          return;
      }

      try {
        const isTemp = String(session.id).startsWith('new-');
        const docId = isTemp ? String(Date.now()) : session.id;
        
        if (isTemp) {
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, id: docId } : s));
            silentIdSwap(session.id, docId); 
        }

        // DEBUG LOGGING
        console.log(`Saving to: users/${user.uid}/chats/${docId}`);

        const docRef = doc(db, `users/${user.uid}/chats`, docId);
        
        const cleanMessages = session.messages.map(m => ({
            role: m.role,
            content: m.content || "",
            isRag: !!m.isRag,
            isError: !!m.isError
        }));

        await setDoc(docRef, {
            id: docId,
            title: session.title || "Chat",
            messages: cleanMessages,
            lastUpdated: serverTimestamp()
        }, { merge: true });

        console.log("Save Success!"); // Confirm write

      } catch (err) {
          console.error("Save Error:", err);
          if (err.code === 'permission-denied') {
              alert(`Error: Permission Denied for user ${user.uid}. Check Rules.`);
          } else {
              alert(`Save Failed: ${err.message}`);
          }
      }
  };

  const sendMessage = async (input) => {
    if (!input.trim() || !user) return;

    let activeSession = sessions.find(s => s.id === currentSessionId);
    let isNew = false;
    let tempId = currentSessionId;

    if (!activeSession) {
        tempId = 'new-' + Date.now();
        activeSession = { id: tempId, title: input.slice(0, 30), messages: [] };
        setSessions(prev => [activeSession, ...prev]);
        setCurrentSessionId(tempId);
        isNew = true;
    }

    const newMessages = [...activeSession.messages, { role: 'user', content: input }];
    const nextTitle = activeSession.messages.length === 0 ? input.slice(0, 30) : (activeSession.title || "Chat");
    
    const updatedSession = { 
        ...activeSession, 
        messages: newMessages, 
        title: nextTitle 
    };
    
    setSessions(prev => prev.map(s => s.id === tempId ? updatedSession : s));
    setIsLoading(true);

    const { text, usedContext, error } = await generateBioResponse(input, activeSession.messages, apiConfig);

    const finalMessages = [...newMessages, { 
        role: 'assistant', 
        content: text || "No response", 
        isRag: !!usedContext,
        isError: !!error
    }];

    const finalSession = { ...updatedSession, messages: finalMessages };
    
    setSessions(prev => prev.map(s => s.id === tempId ? finalSession : s));
    setIsLoading(false);

    await saveToCloud(finalSession);
  };

  const handleConfigChange = (newConfig) => {
    setApiConfig(newConfig);
    if (user) updateDoc(doc(db, 'users', user.uid), { aiModel: newConfig.model, aiEndpoint: newConfig.endpoint }).catch(e=>{});
  };

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

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
    setApiConfig: handleConfigChange,
    chatEndRef
  };
};