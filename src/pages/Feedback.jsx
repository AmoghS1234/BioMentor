import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { 
  Star, Send, MessageSquare, ThumbsUp, Wrench, ShieldAlert, 
  Loader, Trash2, TrendingUp, Users, Quote, User, Mail 
} from 'lucide-react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

// ⚠️ REPLACE THIS WITH YOUR EXACT LOGIN EMAIL
const ADMIN_EMAIL = 'amogh.sushilendra@gmail.com'; 

export default function Feedback() {
  const { user, db } = useFirebase();
  
  // Form States
  const [name, setName] = useState(''); 
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
    // Check if current user is Admin
    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      fetchFeedback();
    }
    // Auto-fill name if logged in
    if (user?.displayName) {
        setName(user.displayName);
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

  const stats = useMemo(() => {
    if (feedbackList.length === 0) return { avg: 0, total: 0 };
    const total = feedbackList.length;
    const sum = feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avg = (sum / total).toFixed(1);
    return { avg, total };
  }, [feedbackList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating!");
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'Guest User',
        userName: name.trim() || 'Anonymous', // <--- Ensures Name is saved
        rating,
        improvements,
        bestPart,
        timestamp: Date.now()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to send feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
      if(!confirm("Delete this feedback?")) return;
      await deleteDoc(doc(db, 'feedback', id));
      fetchFeedback(); 
  };

  // --- VIEW 1: SUCCESS MESSAGE ---
  if (submitted) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <ThumbsUp size={40} />
        </div>
        <h2 className="text-4xl font-bold text-txt-primary">Thank You!</h2>
        <p className="text-txt-secondary max-w-md text-lg">Your feedback helps build a better BioMentor.</p>
        <button onClick={() => window.history.back()} className="mt-8 text-brand hover:underline font-bold">Return to Settings</button>
      </div>
    );
  }

  // --- VIEW 2: ADMIN DASHBOARD (Only for You) ---
  if (isAdmin) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-txt-primary flex items-center gap-2">
                    <ShieldAlert className="text-brand" /> Admin Dashboard
                </h2>
                <p className="text-txt-secondary mt-1">User Feedback & Sentiment Analysis</p>
            </div>
            <button onClick={fetchFeedback} className="pro-btn text-xs">Refresh Data</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="pro-panel bg-panel p-6 flex items-center gap-4 border-l-4 border-brand shadow-lg">
                <div className="p-4 rounded-full bg-brand/10 text-brand"><TrendingUp size={24} /></div>
                <div>
                    <div className="text-3xl font-bold text-txt-primary">{stats.avg} / 5.0</div>
                    <div className="text-xs text-txt-muted uppercase font-bold tracking-wider">Average Rating</div>
                </div>
            </div>
            <div className="pro-panel bg-panel p-6 flex items-center gap-4 border-l-4 border-blue-500 shadow-lg">
                <div className="p-4 rounded-full bg-blue-500/10 text-blue-500"><Users size={24} /></div>
                <div>
                    <div className="text-3xl font-bold text-txt-primary">{stats.total}</div>
                    <div className="text-xs text-txt-muted uppercase font-bold tracking-wider">Total Responses</div>
                </div>
            </div>
        </div>

        {/* Feedback Grid */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-txt-primary">Recent Feedback</h3>
            
            {loadingAdmin ? (
                <div className="text-center py-20"><Loader className="animate-spin mx-auto text-brand" size={32}/></div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {feedbackList.map((item) => (
                        <div key={item.id} className="pro-panel bg-page p-6 flex flex-col justify-between group relative hover:shadow-xl hover:border-brand/30 transition-all duration-300">
                            
                            {/* USER INFO HEADER (UPDATED) */}
                            <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                                        {(item.userName || item.userEmail || 'A').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* NAME (Large & Bold) */}
                                        <div className="font-bold text-base text-txt-primary truncate">
                                            {item.userName || 'Anonymous'}
                                        </div>
                                        {/* EMAIL (Small & Gray) */}
                                        <div className="text-xs text-txt-muted flex items-center gap-1 truncate" title={item.userEmail}>
                                            <Mail size={10} /> {item.userEmail}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex bg-panel border border-border rounded-lg px-2 py-1 shadow-inner shrink-0 ml-2">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                                    <span className="text-xs font-bold text-txt-primary">{item.rating}.0</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 mb-6">
                                {item.bestPart && (
                                    <div className="relative pl-4 border-l-2 border-green-500/50">
                                        <div className="text-[10px] uppercase font-bold text-green-500 mb-1">Loved</div>
                                        <p className="text-sm text-txt-secondary leading-relaxed italic">"{item.bestPart}"</p>
                                    </div>
                                )}
                                {item.improvements && (
                                    <div className="relative pl-4 border-l-2 border-red-500/50">
                                        <div className="text-[10px] uppercase font-bold text-red-500 mb-1">Needs Work</div>
                                        <p className="text-sm text-txt-secondary leading-relaxed italic">"{item.improvements}"</p>
                                    </div>
                                )}
                                {!item.bestPart && !item.improvements && (
                                    <p className="text-sm text-txt-muted italic">No written feedback provided.</p>
                                )}
                            </div>

                            {/* Timestamp Footer */}
                            <div className="mt-auto flex justify-between items-center pt-2">
                                <span className="text-[10px] text-txt-muted">{new Date(item.timestamp).toLocaleString()}</span>
                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    className="text-xs text-txt-muted hover:text-red-500 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12}/> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {feedbackList.length === 0 && !loadingAdmin && (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                    <p className="text-txt-muted">No feedback collected yet.</p>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- VIEW 3: USER SUBMISSION FORM (Default) ---
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-12">
      <div className="text-center space-y-4 py-8 border-b border-border">
        <h2 className="text-3xl font-bold text-txt-primary flex items-center justify-center gap-2">
          <MessageSquare className="text-brand" size={32} /> User Feedback
        </h2>
        <p className="text-txt-secondary">Help us improve your research experience.</p>
      </div>

      <div className="pro-panel bg-panel p-8 max-w-2xl mx-auto shadow-2xl border border-brand/10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <User size={16} className="text-brand"/> Your Name <span className="text-txt-muted font-normal text-xs">(Optional)</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-page border border-border rounded-xl p-3 text-txt-primary focus:ring-2 focus:ring-brand outline-none placeholder-txt-muted/50 text-sm"
              placeholder="Enter your name"
            />
          </div>

          <div className="w-full h-px bg-border"></div>

          {/* Rating */}
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
                    size={36} 
                    className={`${(hoverRating || rating) >= star ? 'fill-brand text-brand drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-border fill-input'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-border"></div>

          {/* Improvements */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <Wrench size={16} className="text-brand"/> What can we improve?
            </label>
            <textarea 
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              className="w-full h-24 bg-page border border-border rounded-xl p-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none resize-none placeholder-txt-muted/50 text-sm"
              placeholder="e.g. The chat sometimes lags..."
            />
          </div>

          {/* Best Part */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-txt-primary">
              <Quote size={16} className="text-brand"/> What do you like best?
            </label>
            <textarea 
              value={bestPart}
              onChange={(e) => setBestPart(e.target.value)}
              className="w-full h-24 bg-page border border-border rounded-xl p-4 text-txt-primary focus:ring-2 focus:ring-brand outline-none resize-none placeholder-txt-muted/50 text-sm"
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
    </div>
  );
}