import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Play, Sparkles, Loader, Save, X } from 'lucide-react';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { useFirebase } from '../hooks/useFirebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function StudyDeck() {
  const { generateContent, isGenerating } = useAiGenerator();
  const { user, db, isAuthReady } = useFirebase();
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generator States
  const [mode, setMode] = useState('overview'); 
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [previewCards, setPreviewCards] = useState(null);

  // 1. Load Cards from Firestore
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
        setCards([]); // Clear cards if logged out
        setLoading(false);
        return;
    }

    const q = query(collection(db, `users/${user.uid}/flashcards`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCards(loaded);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAuthReady, db]);

  // 2. Save Generated Cards to Firestore
  const confirmSaveCards = async () => {
    if (!user) return;
    const batch = previewCards.map(card => ({
        front: card.front,
        back: card.back,
        createdAt: Date.now()
    }));

    // Add each card to Firestore
    // (For production, use a batch write, but simple loops work for small sets)
    for (const card of batch) {
        await addDoc(collection(db, `users/${user.uid}/flashcards`), card);
    }
    setPreviewCards(null);
  };

  // 3. Delete from Firestore
  const deleteCard = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/flashcards`, id));
  };

  const handleAiGenerate = async () => {
    if (!genTopic.trim()) return;
    const newCards = await generateContent(genTopic, 'flashcards');
    if (newCards) {
      setPreviewCards(newCards);
      setShowGenModal(false);
      setGenTopic('');
    }
  };

  if (loading) return <div className="p-12 text-center text-txt-muted"><Loader className="animate-spin mx-auto"/> Loading Deck...</div>;

  // --- REVIEW MODE ---
  if (previewCards) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="pro-panel p-8 bg-brand/5 border-brand/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
              <Sparkles className="text-brand" /> Review Generated Cards
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setPreviewCards(null)} className="pro-btn bg-panel hover:bg-red-500/10 hover:text-red-400 border border-border text-txt-muted">Discard</button>
              <button onClick={confirmSaveCards} className="pro-btn flex items-center gap-2"><Save size={18} /> Save to Cloud</button>
            </div>
          </div>
          <div className="grid gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {previewCards.map((card, idx) => (
              <div key={idx} className="p-4 bg-page rounded-xl border border-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 font-bold text-txt-primary border-b md:border-b-0 md:border-r border-border pb-2 md:pb-0 md:pr-4">{card.front}</div>
                <div className="flex-[2] text-txt-secondary">{card.back}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- STUDY MODE ---
  if (mode === 'study') {
    const currentCard = cards[studyIndex];
    const progress = ((studyIndex + 1) / cards.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <button onClick={() => setMode('overview')} className="text-txt-secondary hover:text-brand font-bold text-sm">← Back to Deck</button>
          <span className="text-txt-muted font-mono text-xs">Card {studyIndex + 1} of {cards.length}</span>
        </div>
        <div className="w-full h-1 bg-panel rounded-full overflow-hidden">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <div onClick={() => setIsFlipped(!isFlipped)} className="relative h-80 w-full cursor-pointer perspective-1000 group">
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute w-full h-full pro-panel bg-panel p-8 flex flex-col items-center justify-center backface-hidden shadow-xl border border-border">
              <span className="text-xs font-bold text-brand uppercase tracking-widest mb-4">Term / Question</span>
              <h3 className="text-3xl font-bold text-center text-txt-primary">{currentCard.front}</h3>
              <p className="absolute bottom-6 text-txt-muted text-xs animate-pulse">Click to flip</p>
            </div>
            <div className="absolute w-full h-full bg-brand border border-brand/50 rounded-xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-xl text-white">
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-4">Definition / Answer</span>
              <p className="text-xl text-center font-medium leading-relaxed">{currentCard.back}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={() => { if (studyIndex > 0) { setStudyIndex(i => i - 1); setIsFlipped(false); } }} disabled={studyIndex === 0} className="pro-btn bg-panel hover:bg-border text-txt-primary border border-border disabled:opacity-50">Previous</button>
          <button onClick={() => { if (studyIndex < cards.length - 1) { setStudyIndex(i => i + 1); setIsFlipped(false); } else { alert("Deck Complete!"); setMode('overview'); setStudyIndex(0); setIsFlipped(false); } }} className="pro-btn">{studyIndex === cards.length - 1 ? 'Finish' : 'Next Card'}</button>
        </div>
      </div>
    );
  }

  // --- OVERVIEW MODE ---
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold text-txt-primary flex items-center gap-2"><Layers className="text-brand" /> Study Deck</h2>
          <p className="text-txt-secondary mt-1">Manage your flashcards and test your memory.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowGenModal(true)} className="pro-btn bg-purple-600 hover:bg-purple-700 flex items-center gap-2"><Sparkles size={18} /> AI Generate</button>
          <button onClick={() => setMode('study')} disabled={cards.length === 0} className="pro-btn flex items-center gap-2"><Play size={18} /> Start Session</button>
        </div>
      </div>

      {showGenModal && (
        <div className="pro-panel p-6 bg-brand/10 border-brand/20 animate-fadeIn">
          <h3 className="font-bold text-txt-primary mb-2 flex items-center gap-2"><Sparkles size={16} className="text-brand"/> Generate Flashcards with AI</h3>
          <div className="flex gap-2">
            <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)} placeholder="Enter topic (e.g. 'Krebs Cycle')..." className="pro-input bg-page" onKeyPress={(e) => e.key === 'Enter' && handleAiGenerate()} />
            <button onClick={handleAiGenerate} disabled={isGenerating} className="pro-btn w-40 flex justify-center items-center">{isGenerating ? <Loader className="animate-spin" size={18} /> : 'Generate'}</button>
            <button onClick={() => setShowGenModal(false)} className="px-4 text-txt-muted hover:text-txt-primary"><X size={18}/></button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="pro-panel p-6 bg-panel group hover:border-brand/50 transition-all relative h-40 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded">TERM</span>
              <button onClick={() => deleteCard(card.id)} className="text-txt-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-txt-primary mb-2 pr-6 line-clamp-2">{card.front}</h3>
              <div className="h-px w-full bg-border my-2"></div>
              <p className="text-txt-secondary text-sm line-clamp-2">{card.back}</p>
            </div>
          </div>
        ))}
        {cards.length === 0 && !showGenModal && <div className="col-span-full text-center py-12 text-txt-muted italic border-2 border-dashed border-border rounded-xl">Your deck is empty. Use the AI Generator to create cards instantly!</div>}
      </div>
    </div>
  );
}