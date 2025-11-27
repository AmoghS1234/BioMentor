import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus } from 'lucide-react';

export default function BioNotes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('bioNotes');
    return saved ? JSON.parse(saved) : [{ id: 1, title: 'Project Ideas', content: '- Build a CRISPR visualizer\n- Study protein folding' }];
  });
  const [activeId, setActiveId] = useState(notes[0]?.id || null);

  useEffect(() => {
    localStorage.setItem('bioNotes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeId) || { title: '', content: '' };

  const updateNote = (key, value) => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, [key]: value, lastEdited: new Date().toLocaleDateString() } : n));
  };

  const createNote = () => {
    const newNote = { id: Date.now(), title: 'Untitled Note', content: '', lastEdited: 'Just now' };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const deleteNote = (id, e) => {
    e.stopPropagation();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fadeIn">
      <div className="w-64 flex flex-col pro-panel bg-panel rounded-xl overflow-hidden h-full">
        <div className="p-4 border-b border-border bg-input/20">
          <button onClick={createNote} className="w-full pro-btn flex items-center justify-center gap-2"><Plus size={16} /> New Note</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.map(note => (
            <div key={note.id} onClick={() => setActiveId(note.id)} className={`group p-3 rounded-lg cursor-pointer transition-all ${activeId === note.id ? 'bg-brand/10 border border-brand/50' : 'hover:bg-page border border-transparent'}`}>
              <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm truncate ${activeId === note.id ? 'text-brand' : 'text-txt-primary'}`}>{note.title || 'Untitled'}</h4>
                <button onClick={(e) => deleteNote(note.id, e)} className="opacity-0 group-hover:opacity-100 text-txt-muted hover:text-red-400"><Trash2 size={14} /></button>
              </div>
              <p className="text-xs text-txt-muted mt-1 truncate">{note.content || 'Empty note...'}</p>
            </div>
          ))}
        </div>
      </div>

      {activeId ? (
        <div className="flex-1 pro-panel bg-panel rounded-xl p-6 flex flex-col h-full">
          <input value={activeNote.title} onChange={(e) => updateNote('title', e.target.value)} className="text-2xl font-bold bg-transparent border-none focus:ring-0 text-txt-primary placeholder-txt-muted mb-4 outline-none" placeholder="Note Title" />
          <textarea value={activeNote.content} onChange={(e) => updateNote('content', e.target.value)} className="flex-1 w-full bg-page/50 rounded-lg p-4 text-txt-secondary resize-none border-none focus:ring-2 focus:ring-brand/50 leading-relaxed font-mono outline-none" placeholder="Start typing your observations..." />
          <div className="flex justify-between items-center mt-4 text-xs text-txt-muted">
             <span>Auto-saved to local storage</span>
             <span className="flex items-center gap-1"><Save size={12} /> {activeNote.lastEdited || 'Just now'}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-txt-muted pro-panel bg-panel rounded-xl">Select or create a note to begin writing.</div>
      )}
    </div>
  );
}