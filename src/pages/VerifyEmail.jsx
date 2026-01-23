import React, { useState, useEffect } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { user, auth } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Auto-check: If they verify in another tab, redirect them in this one
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await user.reload(); // Refresh the user token from Firebase
        if (user.emailVerified) navigate('/');
      }
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setMessage("Link sent! Please check your spam folder too.");
    } catch (err) {
      // Firebase limits how often you can send emails
      setMessage("Please wait a minute before trying again.");
    }
    setLoading(false);
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      await user.reload(); // Force Firebase to refresh status
      if (user.emailVerified) {
        navigate('/');
      } else {
        setMessage("Not verified yet. Click the link in your email!");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-panel border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full text-center space-y-6">
        
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto text-brand mb-4">
          <Mail size={40} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-txt-primary">Verify your email</h2>
          <p className="text-txt-secondary mt-2 text-sm">
            We sent a secure link to:<br/>
            <span className="font-mono text-brand font-bold bg-brand/5 px-2 py-1 rounded mt-1 inline-block">{user?.email}</span>
          </p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm text-yellow-500 text-left">
          <strong>Action Required:</strong> You must verify your email address to access the BioMentor dashboard.
        </div>

        {message && (
          <div className="text-sm font-bold text-brand animate-pulse">
            {message}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button 
            onClick={handleReload}
            disabled={loading}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            I have verified it
          </button>

          <button 
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3 bg-input hover:bg-input/80 border border-border text-txt-secondary rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Send size={18} /> Resend Link
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="text-txt-muted hover:text-red-400 text-xs flex items-center gap-1 mx-auto transition-colors mt-6"
        >
          <LogOut size={14} /> Sign Out
        </button>

      </div>
    </div>
  );
}