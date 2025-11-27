import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, Database, GraduationCap, 
  BrainCircuit, Layers, Code, Dna, Menu, X, 
  Calculator, Search, GitMerge, ClipboardList, Grid, FileText 
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-brand text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-page border-r border-border text-slate-300 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* LOGO AREA */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border bg-page">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            {/* The DNA Icon acts as the Logo */}
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-txt-primary tracking-tight font-sans">
            BioMentor
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-6 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
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
                          ? 'bg-brand text-white shadow-md' 
                          : 'text-slate-400 hover:bg-panel hover:text-txt-primary'
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
          <div className="h-8"></div>
        </nav>
      </div>
    </>
  );
}