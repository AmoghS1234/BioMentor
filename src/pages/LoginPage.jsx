import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ArrowRight, CheckCircle, Shield, Mail, Lock, User, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';

export default function LoginPage() {
  const { loginWithEmail, registerWithEmail, loginAsGuest, resetPassword, user } = useFirebase();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState('login'); // 'login', 'register', 'reset'
  const [loading, setLoading] = useState(false); // <--- WE USE THIS ONE STATE FOR ALL LOADING
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  if (user) navigate('/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'register') {
        await registerWithEmail(formData.email, formData.password, formData.name);
        navigate('/');
      } else if (mode === 'login') {
        await loginWithEmail(formData.email, formData.password, rememberMe);
        navigate('/');
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        setSuccessMsg("Password reset link sent! Check your email.");
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      let msg = err.message.replace('Firebase: ', '');
      if (msg.includes('auth/invalid-credential')) msg = "Incorrect email or password.";
      if (msg.includes('auth/email-already-in-use')) msg = "Email already registered.";
      if (msg.includes('auth/weak-password')) msg = "Password should be at least 6 characters.";
      setError(msg);
    }
  };

  const handleGuestLogin = async () => {
      try {
          setError(null);
          setLoading(true); // <--- FIXED: Changed from setIsLoggingIn to setLoading
          
          // Force the tour to show by clearing previous session memory
          sessionStorage.removeItem('guestWelcomeSeen'); 
          
          await loginAsGuest(); 
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false); // <--- FIXED: Changed from setIsLoggingIn to setLoading
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 animate-fadeIn">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-panel border border-border rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left: Branding */}
        <div className="p-12 flex flex-col justify-between bg-gradient-to-br from-brand/20 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50"></div>
          
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-brand p-2.5 rounded-xl shadow-lg shadow-brand/30">
                <Dna size={32} className="text-white" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">BioMentor</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your AI-Powered <br/> <span className="text-brand-light">Research Lab</span>
            </h1>
            <p className="text-txt-secondary text-lg leading-relaxed">
              Access advanced bioinformatics tools, visualize protein structures, and collaborate on research with AI assistance.
            </p>
          </div>

          <div className="space-y-4 mt-12">
            <FeatureItem text="Cloud-Synced Lab Notebook" />
            <FeatureItem text="AI-Generated Quizzes & Flashcards" />
            <FeatureItem text="Secure Data Storage" />
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="p-12 flex flex-col justify-center bg-panel">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-txt-primary">
              {mode === 'register' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
            </h2>
            <p className="text-txt-secondary mt-2">
              {mode === 'register' ? 'Join the research community.' : mode === 'reset' ? 'Enter your email to receive a reset link.' : 'Sign in to continue your work.'}
            </p>
          </div>

          {/* Only show for Reset Mode */}
          {mode === 'reset' && (
             <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="mb-4 flex items-center gap-2 text-sm text-txt-muted hover:text-brand transition-colors">
                <ArrowLeft size={14} /> Back to Login
             </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-brand transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-txt-muted/50"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-brand transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address"
                required
                className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-txt-muted/50"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-brand transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="Password"
                  required
                  className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-3 text-txt-primary focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder-txt-muted/50"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between ml-1">
                <div className="flex items-center gap-2">
                    <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border bg-input text-brand focus:ring-brand w-4 h-4"
                    />
                    <label htmlFor="remember" className="text-xs text-txt-secondary cursor-pointer select-none hover:text-txt-primary transition-colors">
                    Remember me
                    </label>
                </div>
                <button 
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); setSuccessMsg(''); }}
                    className="text-xs text-brand hover:text-brand-light font-bold hover:underline"
                >
                    Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fadeIn">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm animate-fadeIn">
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (mode === 'register' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Sign In')}
              {!loading && mode !== 'reset' && <ArrowRight size={20} />}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-panel px-4 text-txt-muted font-bold tracking-widest">Or</span></div>
                </div>

                <button 
                    onClick={handleGuestLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-input hover:bg-border text-txt-primary font-bold rounded-xl transition-all border border-border text-sm disabled:opacity-50"
                >
                    {loading ? 'Creating Session...' : 'Continue as Guest'}
                </button>

                <p className="mt-6 text-center text-sm text-txt-secondary">
                    {mode === 'register' ? "Already have an account?" : "Don't have an account?"}
                    <button 
                    onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setSuccessMsg(''); }}
                    className="ml-2 text-brand hover:underline font-bold"
                    >
                    {mode === 'register' ? 'Sign In' : 'Register'}
                    </button>
                </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-txt-primary/90">
      <CheckCircle size={20} className="text-brand-light" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}