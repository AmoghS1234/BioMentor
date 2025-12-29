import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { Star, Send, MessageSquare, ThumbsUp, Wrench, ShieldAlert, Loader, Trash2 } from 'lucide-react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL EMAIL TO SEE THE ADMIN PANEL
const ADMIN_EMAIL = 'amogh.sushilendra@gmail.com'; 

export default function Feedback() {
  const { user, db } = useFirebase();
  
  // Form States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [improvements, setImprovements] = useState('');
  const [bestPart, setBestPart] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Admin States
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      fetchFeedback();
    }
  }, [user]);

  const fetchFeedback = async () => {
    setLoadingAdmin(true);
    try {
      const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbackList(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'Anonymous',
        rating,
        improvements,
        bestPart,
        timestamp: Date.now()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if(!confirm("Delete this feedback?")) return;
      await deleteDoc(doc(db, 'feedback', id));
      fetchFeedback(); // Refresh list
  };

  if (submitted) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
          <ThumbsUp size={40} />
        </div>
        <h2 className="text-3xl font-bold text-txt-primary">Thank You!</h2>
        <p className="text-txt-secondary max-w-md">Your feedback helps us make BioMentor better for everyone.</p>
        <button onClick={() => window.history.back()} className="mt-8 text-brand hover:underline font-bold">Return to Settings</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-12">
      
      {/* HEADER */}
      <div className="text-center space-y-4 py-8 border-b border-border">
        <h2 className="text-3xl font-bold text-txt-primary flex items-center justify-center gap-2">
          <MessageSquare className="text-brand" size={32} /> User Feedback
        </h2>
        <p className="text-txt-secondary">Help us improve your research experience.</p>
      </div>

      {/* FEEDBACK FORM */}
      <div className="pro-panel bg-panel p-8 max-w-2xl mx-auto shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Rating */}
          <div className="text-center space-y-3">
            <label className="text-sm font-bold text-txt-muted uppercase tracking-wider">Rate your experience</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={32} 
                    className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-txt-muted'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Improvements */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <Wrench size={16} className="text-brand"/> What can we improve?
            </label>
            <textarea 
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full h-32 bg-page border border-border rounded-xl p-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none resize-none"
              placeholder="e.g. The chat sometimes lags, or I want a darker theme..."
            />
          </div>

          {/* 3. Best Part */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <ThumbsUp size={16} className="text-green-500"/> What do you like best?
            </label>
            <textarea 
              value={bestPart}
              onChange={(e) => setBestPart(e.target.value)}
              className="w-full h-32 bg-page border border-border rounded-xl p-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none resize-none"
              placeholder="e.g. The 3D protein viewer is amazing!"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <><Send size={18} /> Submit Feedback</>}
          </button>
        </form>
      </div>

      {/* --- ADMIN SECTION (ONLY VISIBLE TO YOU) --- */}
      {isAdmin && (
        <div className="mt-20 pt-10 border-t-2 border-dashed border-red-500/30">
          <div className="flex items-center gap-3 mb-6 text-red-500">
            <ShieldAlert size={24} />
            <h3 className="text-2xl font-bold">Admin Feedback Dashboard</h3>
          </div>

          {loadingAdmin ? (
            <div className="text-center py-10"><Loader className="animate-spin mx-auto text-txt-muted"/></div>
          ) : (
            <div className="grid gap-4">
              {feedbackList.map((item) => (
                <div key={item.id} className="pro-panel p-6 bg-page border border-border relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-txt-primary">{item.userEmail}</span>
                            <span className="text-xs text-txt-muted">({new Date(item.timestamp).toLocaleDateString()})</span>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-txt-muted/30"} />
                            ))}
                        </div>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="text-txt-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-500/5 p-3 rounded border border-red-500/10">
                        <strong className="block text-red-400 text-xs uppercase mb-1">Improvements</strong>
                        <p className="text-txt-secondary">{item.improvements || "None"}</p>
                    </div>
                    <div className="bg-green-500/5 p-3 rounded border border-green-500/10">
                        <strong className="block text-green-400 text-xs uppercase mb-1">Best Part</strong>
                        <p className="text-txt-secondary">{item.bestPart || "None"}</p>
                    </div>
                  </div>
                </div>
              ))}
              {feedbackList.length === 0 && <p className="text-txt-muted italic">No feedback received yet.</p>}
            </div>
          )}
        </div>
      )}

    </div>
  );
}