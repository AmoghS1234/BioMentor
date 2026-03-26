# 🧬 BioMentor: AI-Powered Bioinformatics Learning Platform

<div align="center">

![BioMentor Logo](https://img.shields.io/badge/BioMentor-AI%20Learning%20Platform-blue?style=for-the-badge&logo=react&logoColor=white)

**An interactive educational platform designed to help students and researchers master bioinformatics concepts through AI-powered learning.**

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-green?style=for-the-badge)](https://bio-mentor.vercel.app)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

</div>

## 📖 Overview

BioMentor combines structured static content with **AI-generated quizzes, tutorials, flashcards, and coding challenges** to create an infinite, personalized learning experience. The platform features **gamification elements** including XP tracking, levels, and progress monitoring to keep users engaged.

---

## ✨ Key Features

### 🎯 **Core Learning Tools**
- **� AI Chat Interface** - Interactive bioinformatics Q&A with contextual responses
- **🧬 Bio Tools** - Comprehensive bioinformatics analysis utilities
- **📊 Sequence Aligner** - Advanced sequence alignment and comparison
- **🔬 Protein Viewer** - 3D molecular visualization using 3Dmol.js
- **📚 Study Decks** - AI-generated flashcards for memorization
- **🎲 Quiz Generator** - Dynamic quiz creation with instant feedback
- **📝 Tutorials** - Step-by-step guided learning paths
- **🔍 Problem Solver** - AI-assisted problem resolution

### 📚 **Research & Reference**
- **📖 PubMed Search** - Direct integration with biomedical literature
- **🧪 Lab Protocols** - Standardized experimental procedures
- **🧬 Codon Table** - Interactive genetic code reference
- **📂 Resources Hub** - Curated learning materials and links
- **📓 Bio Notes** - Personal knowledge management system

### 🎮 **Gamification & UX**
- **🏆 XP & Leveling System** - Progress tracking with rewards
- **👤 User Profiles** - Personalized learning dashboards
- **🎨 Interactive Tours** - Guided onboarding with Driver.js
- **🌙 Dark/Light Mode** - Customizable themes
- **📱 Responsive Design** - Mobile-friendly interface

### 🔐 **Authentication & Security**
- **🔑 Firebase Auth** - Secure user authentication
- **✅ Email Verification** - Account validation system
- **👥 Guest Mode** - Try before you sign up
- **🛡️ Data Privacy** - Secure cloud storage

---

## 🛠️ Technology Stack

### 🎨 **Frontend Technologies**
```javascript
// Core Framework
React: 19.2.0          // UI library with modern hooks
Vite: 7.2.7           // Fast build tool & dev server

// Routing & Navigation  
React Router: 7.9.6   // Client-side routing

// Styling & UI
Tailwind CSS: 3.4.15  // Utility-first CSS framework
Lucide React: 0.555.0 // Modern icon library
Driver.js: 1.4.0      // Interactive tour library
```

### 🤖 **AI & Machine Learning**
```javascript
// AI Integration
Google Gemini API      // Primary AI model (gemini-2.5-flash)
Custom AI Hooks        // useChat, useAiGenerator
Context-aware Responses// Smart bioinformatics answers
```

### 📊 **Visualization & Media**
```javascript
// 3D Visualization
3Dmol: 2.5.3          // Molecular visualization library

// Content Rendering
React Markdown: 10.1.0 // Markdown parsing
Remark GFM: 4.0.1     // GitHub-flavored markdown
Rehype Raw: 7.0.0     // HTML in markdown support
Mermaid: 11.12.1      // Diagram generation
```

### 🔥 **Backend & Database**
```javascript
// Firebase Services
Firebase: 12.6.0       // Backend-as-a-Service
├── Firestore         // NoSQL database
├── Authentication    // User management
└── Hosting          // Deployment platform
```

### 🛠️ **Development Tools**
```javascript
// Code Quality
ESLint: 9.39.1        // JavaScript linting
PostCSS: 8.5.6        // CSS processing
Autoprefixer: 10.4.22 // CSS vendor prefixes

// Build & Deploy
Vercel                // Production hosting
GitHub Actions        // CI/CD pipeline
```

---
---

## 📁 Project Structure

```
BioMentor/
├── 📁 src/
│   ├── 📁 components/     # Reusable UI components
│   ├── 📁 context/       # React contexts (Tour, Theme)
│   ├── 📁 data/         # Static data & knowledge base
│   ├── 📁 hooks/        # Custom React hooks
│   │   ├── useChat.js        # AI chat functionality
│   │   ├── useAiGenerator.js # Content generation
│   │   ├── useFirebase.jsx   # Firebase integration
│   │   ├── useTheme.jsx      # Theme management
│   │   └── useTour.js        # Interactive tours
│   ├── 📁 lib/          # Utility libraries
│   │   └── ai.js             # AI integration layer
│   ├── 📁 pages/        # Main application pages
│   └── 📁 main.jsx      # Application entry point
├── 📁 public/           # Static assets
├── 📄 package.json      # Dependencies & scripts
├── 📄 tailwind.config.js # Tailwind configuration
└── 📄 vite.config.js    # Vite build configuration
```

---

## 🔧 Development Scripts

```json
{
  "dev": "vite",           // Start development server
  "build": "vite build",   // Build for production
  "lint": "eslint .",      // Code quality check
  "preview": "vite preview" // Preview production build
}
```

---

## 📊 Performance Features

- ⚡ **Lightning-fast builds** with Vite
- 🎯 **Code splitting** for optimal loading
- 📱 **PWA-ready** for mobile experience
- 🔄 **Lazy loading** for better performance
- 💾 **Smart caching** strategies

---

<div align="center">

**🧬 Made with ❤️ for the Bioinformatics Community**

[![GitHub stars](https://img.shields.io/github/stars/AmoghS1234/BioMentor?style=social)](https://github.com/AmoghS1234/BioMentor)
[![GitHub forks](https://img.shields.io/github/forks/AmoghS1234/BioMentor?style=social)](https://github.com/AmoghS1234/BioMentor)

</div>
