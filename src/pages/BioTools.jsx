import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { Save, FileText, Trash2, Plus, Loader, CloudOff } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function BioNotes() {
  const { user, db, isAuthReady } = useFirebase();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Cloud Notes
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) { setLoading(false); return; }

    const notesRef = collection(db, `users/${user.uid}/notes`);
    const q = query(notesRef, orderBy('lastEdited', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotes(fetched);
      setLoading(false);
      
      // Auto-select logic
      if (activeId === null && fetched.length > 0) setActiveId(fetched[0].id);
    });

    return () => unsubscribe();
  }, [isAuthReady, user, db]);

  const activeNote = notes.find(n => n.id === activeId);

  // Database Actions
  const createNote = async () => {
    if (!user) return;
    try {
      const ref = await addDoc(collection(db, `users/${user.uid}/notes`), {
        title: 'New Note',
        content: '',
        lastEdited: Date.now()
      });
      setActiveId(ref.id);
    } catch (e) { console.error(e); }
  };

  const updateNote = async (key, value) => {
    if (!activeId || !user) return;
    try {
      const ref = doc(db, `users/${user.uid}/notes`, activeId);
      await updateDoc(ref, { [key]: value, lastEdited: Date.now() });
    } catch (e) { console.error(e); }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!user || !confirm("Delete note?")) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, id));
      if (activeId === id) setActiveId(null);
    } catch (e) { console.error(e); }
  };

  if (!isAuthReady || loading) return <div className="p-12 text-center text-txt-muted"><Loader className="animate-spin mx-auto"/> Connecting to Cloud...</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      {/* Sidebar List */}
      <div className="w-64 flex flex-col pro-panel bg-panel rounded-xl overflow-hidden h-full">
        <div className="p-4 border-b border-border bg-input/20">
          <button onClick={createNote} className="w-full pro-btn flex items-center justify-center gap-2"><Plus size={16} /> New Note</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {notes.map(note => (
            <div key={note.id} onClick={() => setActiveId(note.id)} className={`group p-3 rounded-lg cursor-pointer transition-all ${activeId === note.id ? 'bg-brand/10 border border-brand/50 text-brand' : 'hover:bg-page border border-transparent'}`}>
              <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm truncate ${activeId === note.id ? 'text-brand' : 'text-txt-primary'}`}>{note.title || 'Untitled'}</h4>
                <button onClick={(e) => deleteNote(note.id, e)} className="opacity-0 group-hover:opacity-100 text-txt-muted hover:text-red-400"><Trash2 size={14} /></button>
              </div>
              <p className="text-xs text-txt-muted mt-1 truncate">{new Date(note.lastEdited).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {activeId && activeNote ? (
        <div className="flex-1 pro-panel bg-panel rounded-xl p-6 flex flex-col h-full">
          <input value={activeNote.title} onChange={(e) => updateNote('title', e.target.value)} className="text-2xl font-bold bg-transparent border-none focus:ring-0 text-txt-primary placeholder-txt-muted mb-4 outline-none" placeholder="Note Title" />
          <textarea value={activeNote.content} onChange={(e) => updateNote('content', e.target.value)} className="flex-1 w-full bg-page/50 rounded-lg p-4 text-txt-secondary resize-none border-none focus:ring-2 focus:ring-brand/50 leading-relaxed font-mono outline-none" placeholder="Type here..." />
          <div className="flex justify-between items-center mt-4 text-xs text-txt-muted">
             <span className="flex items-center gap-1 text-green-400"><Save size={12} /> Saved to Cloud</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-txt-muted pro-panel bg-panel rounded-xl">Select a note to edit.</div>
      )}
    </div>
  );
}