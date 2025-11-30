import React from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { User, Mail, Shield, Zap, Calendar, Edit2 } from 'lucide-react';

export default function UserProfile() {
  const { user, profile } = useFirebase();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pro-panel p-8 bg-gradient-to-r from-brand/20 to-transparent border-brand/20 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-panel border-4 border-brand/30 flex items-center justify-center text-txt-secondary shadow-xl">
            {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full" />
            ) : (
                <User size={48} className="text-brand" />
            )}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-txt-primary">{user.displayName || 'Guest Researcher'}</h1>
            <p className="text-txt-secondary flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active Session
            </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Account Details */}
        <div className="md:col-span-2 space-y-6">
            <div className="pro-panel p-6 bg-panel">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-txt-primary">Account Details</h3>
                    <button className="text-xs text-brand hover:text-brand-light flex items-center gap-1">
                        <Edit2 size={12} /> Edit Profile
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-page/50 border border-border">
                        <Mail className="text-txt-muted" size={20} />
                        <div>
                            <p className="text-xs text-txt-muted uppercase font-bold">Email Address</p>
                            <p className="text-txt-primary">{user.email || 'No email linked'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-page/50 border border-border">
                        <Shield className="text-txt-muted" size={20} />
                        <div>
                            <p className="text-xs text-txt-muted uppercase font-bold">Account Type</p>
                            <p className="text-txt-primary">{user.isAnonymous ? 'Guest (Unsecured)' : 'Researcher (Verified)'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg bg-page/50 border border-border">
                        <Calendar className="text-txt-muted" size={20} />
                        <div>
                            <p className="text-xs text-txt-muted uppercase font-bold">Last Login</p>
                            <p className="text-txt-primary">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
            <div className="pro-panel p-6 bg-panel flex flex-col items-center text-center">
                <div className="p-4 bg-yellow-500/10 rounded-full mb-4">
                    <Zap size={32} className="text-yellow-500" />
                </div>
                <h3 className="text-4xl font-bold text-txt-primary mb-1">{profile?.xp || 0}</h3>
                <p className="text-sm text-txt-muted uppercase font-bold tracking-wider">Total XP Earned</p>
            </div>
            
            <div className="pro-panel p-6 bg-brand/5 border-brand/20">
                <h4 className="font-bold text-txt-primary mb-2">Pro Tip</h4>
                <p className="text-sm text-txt-secondary">
                    Link your Google account to sync your XP and notes across multiple devices.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}