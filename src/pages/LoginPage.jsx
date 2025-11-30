import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ArrowRight, CheckCircle, Shield, Mail, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { useFirebase } from '../hooks/useFirebase';

export default function LoginPage() {
  const { loginWithEmail, registerWithEmail, loginAsGuest, user } = useFirebase();
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // Redirect if logged in
  if (user) navigate('/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await registerWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password, rememberMe);
      }
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
      setLoading(true);
      try {
          await loginAsGuest();
          navigate('/');
      } catch (err) {
          setError("Guest login failed. Please try again.");
      } finally {
          setLoading(false);
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
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-txt-secondary mt-2">
              {isRegister ? 'Join the research community.' : 'Sign in to continue your work.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-brand transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required={isRegister}
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

            {!isRegister && (
              <div className="flex items-center gap-2 ml-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-input text-brand focus:ring-brand w-4 h-4"
                />
                <label htmlFor="remember" className="text-xs text-txt-secondary cursor-pointer select-none hover:text-txt-primary transition-colors">
                  Stay signed in on this device
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fadeIn">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

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
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="ml-2 text-brand hover:underline font-bold"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
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