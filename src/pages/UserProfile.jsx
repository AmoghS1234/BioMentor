import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { updateProfile } from 'firebase/auth';
import { 
  User, Mail, Calendar, Shield, Edit2, Save, X, 
  Award, TrendingUp, Zap, Clock 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function UserProfile() {
  const { user, db } = useFirebase();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [stats, setStats] = useState({ xp: 0, level: 1, quizzes: 0, joined: Date.now() });
  const [loading, setLoading] = useState(false);

  // 1. Load User Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !db) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            xp: data.xp || 0,
            level: Math.floor((data.xp || 0) / 100) + 1,
            joined: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
          });
        }
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };
    fetchStats();
  }, [user, db]);

  // 2. Name Logic: Show Email if DisplayName is missing
  const getDisplayName = () => {
    if (user.displayName) return user.displayName;
    return user.email || 'Guest Researcher'; 
  };

  // 3. Update Name Function
  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: newName });
      setIsEditing(false);
      window.location.reload(); 
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* HEADER CARD */}
      <div className="pro-panel bg-panel p-8 rounded-2xl border border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand to-purple-600"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-page">
            {getInitials()}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="bg-page border border-brand rounded-lg px-3 py-1 text-lg font-bold outline-none text-txt-primary"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} disabled={loading} className="p-2 bg-brand text-white rounded-lg hover:bg-brand-hover">
                    <Save size={18} />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-page border border-border text-txt-muted rounded-lg hover:text-red-500">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-txt-primary break-all">{getDisplayName()}</h1>
                  {!user.isAnonymous && (
                    <button 
                      onClick={() => { setIsEditing(true); setNewName(getDisplayName()); }} 
                      className="text-txt-muted hover:text-brand transition-colors p-1"
                      title="Edit Display Name"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-txt-secondary">
              <span className="flex items-center gap-2 bg-page px-3 py-1 rounded-full border border-border">
                <Mail size={14} /> {user.email || 'No Email Linked'}
              </span>
              <span className="flex items-center gap-2 bg-page px-3 py-1 rounded-full border border-border">
                <Shield size={14} /> {user.isAnonymous ? 'Guest Account' : 'Researcher ID: ' + user.uid.slice(0, 8)}
              </span>
              <span className="flex items-center gap-2 bg-page px-3 py-1 rounded-full border border-border">
                <Calendar size={14} /> Joined {new Date(stats.joined).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="pro-panel bg-panel p-6 border-l-4 border-brand">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 bg-brand/10 text-brand rounded-xl"><Award size={24} /></div>
            <span className="text-xs font-bold text-txt-muted uppercase">Level</span>
          </div>
          <div className="text-3xl font-bold text-txt-primary">{stats.level}</div>
          <p className="text-xs text-txt-secondary mt-1">Research Rank</p>
        </div>

        <div className="pro-panel bg-panel p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl"><Zap size={24} /></div>
            <span className="text-xs font-bold text-txt-muted uppercase">Experience</span>
          </div>
          <div className="text-3xl font-bold text-txt-primary">{stats.xp} XP</div>
          <p className="text-xs text-txt-secondary mt-1">Total Points Earned</p>
        </div>

        <div className="pro-panel bg-panel p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><Clock size={24} /></div>
            <span className="text-xs font-bold text-txt-muted uppercase">Status</span>
          </div>
          <div className="text-3xl font-bold text-txt-primary">Active</div>
          <p className="text-xs text-txt-secondary mt-1">Account Status</p>
        </div>
      </div>

      {/* ACCOUNT DETAILS */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-txt-primary flex items-center gap-2">
          <User size={20} className="text-brand"/> Account Details
        </h2>
        
        <div className="pro-panel bg-panel divide-y divide-border">
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-txt-primary">Display Name</p>
                    <p className="text-xs text-txt-muted">Visible on your profile and certificates.</p>
                </div>
                <div className="text-sm text-txt-secondary font-medium">{getDisplayName()}</div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-txt-primary">Email Address</p>
                    <p className="text-xs text-txt-muted">Used for login and recovery.</p>
                </div>
                <div className="text-sm text-txt-secondary">{user.email || 'N/A'}</div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="text-sm font-bold text-txt-primary">User ID</p>
                    <p className="text-xs text-txt-muted">Unique system identifier.</p>
                </div>
                <div className="text-sm text-txt-secondary font-mono bg-page px-2 py-1 rounded">{user.uid}</div>
            </div>
        </div>
      </div>

    </div>
  );
}