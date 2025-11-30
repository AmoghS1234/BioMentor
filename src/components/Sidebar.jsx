import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../hooks/useFirebase';
import { 
  Home, MessageSquare, Database, GraduationCap, 
  BrainCircuit, Layers, Code, Dna, Menu, X, 
  Calculator, Search, GitMerge, ClipboardList, Grid, Activity, FileText, 
  User, LogOut, Settings, ChevronUp, LogIn 
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAuthReady, logout } = useFirebase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navGroups = [
    {
      title: "Workspace",
      items: [
        { path: '/', label: 'Dashboard', icon: <Home size={18} /> },
        { path: '/chat', label: 'AI Mentor', icon: <MessageSquare size={18} /> },
        { path: '/notes', label: 'Lab Notebook', icon: <FileText size={18} /> },
      ]
    },
    {
      title: "Analysis Tools",
      items: [
        { path: '/tools', label: 'Bio Toolkit', icon: <Calculator size={18} /> },
        { path: '/aligner', label: 'Seq Aligner', icon: <GitMerge size={18} /> },
        { path: '/pubmed', label: 'PubMed Search', icon: <Search size={18} /> },
        { path: '/viewer', label: '3D Viewer', icon: <Dna size={18} /> },
      ]
    },
    {
      title: "Reference Data",
      items: [
        { path: '/protocols', label: 'Lab Protocols', icon: <ClipboardList size={18} /> },
        { path: '/codon', label: 'Codon Table', icon: <Grid size={18} /> },
        { path: '/resources', label: 'Database Links', icon: <Database size={18} /> },
      ]
    },
    {
      title: "Knowledge Base",
      items: [
        { path: '/tutorials', label: 'Tutorials', icon: <GraduationCap size={18} /> },
        { path: '/quiz', label: 'Quizzes', icon: <BrainCircuit size={18} /> },
        { path: '/flashcards', label: 'Flashcards', icon: <Layers size={18} /> },
        { path: '/problems', label: 'Challenges', icon: <Code size={18} /> },
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  // FIXED: Removed navigate('/login'). 
  // The App component detects the user change and switches views automatically.
  const handleLogout = async () => {
      setShowUserMenu(false); // Close menu immediately
      await logout();
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-page border-r border-border text-slate-300 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col shadow-2xl`}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border bg-page shrink-0">
          <div className="bg-gradient-to-br from-brand to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-brand/20">
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-txt-primary tracking-tight font-sans">
            BioMentor
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2 px-3">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        isActive
                          ? 'bg-brand/10 text-brand border border-brand/20' 
                          : 'text-slate-400 hover:bg-panel hover:text-txt-primary hover:border-border'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Menu (Footer) */}
        <div className="p-4 border-t border-border bg-panel relative" ref={menuRef}>
          
          {/* Popover Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-panel border border-border rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
                <div className="p-3 border-b border-border bg-input/20">
                    <p className="text-xs font-bold text-txt-muted uppercase">Signed in as</p>
                    <p className="text-sm font-bold text-txt-primary truncate">{user?.email || 'Guest'}</p>
                </div>
                <div className="p-1">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-txt-secondary hover:bg-page hover:text-txt-primary rounded-lg flex items-center gap-2">
                        <User size={16} /> Account Profile
                    </button>
                    {/* Placeholder for Settings */}
                    <button onClick={() => setShowUserMenu(false)} className="w-full text-left px-3 py-2 text-sm text-txt-secondary hover:bg-page hover:text-txt-primary rounded-lg flex items-center gap-2">
                        <Settings size={16} /> Settings
                    </button>
                </div>
                <div className="p-1 border-t border-border mt-1">
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg flex items-center gap-2">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
          )}

          {/* Trigger Button */}
          {isAuthReady && user ? (
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-page transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold border border-brand/30">
                  {user.displayName ? user.displayName[0].toUpperCase() : <User size={16} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-txt-primary truncate">{user.displayName || 'Guest'}</p>
                  <p className="text-[10px] text-txt-muted truncate">
                    {user.isAnonymous ? 'Guest Session' : 'Pro Plan'}
                  </p>
                </div>
              </div>
              <ChevronUp size={16} className="text-txt-muted group-hover:text-txt-primary transition-colors" />
            </button>
          ) : (
            <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
            >
                <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </div>
    </>
  );
}