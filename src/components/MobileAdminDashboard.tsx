import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Phone, User, Shield, CheckCircle2, Clock, 
  Trash2, Bell, Sparkles, Smartphone, Mail, ChevronRight, Search, 
  Filter, CheckSquare, RefreshCw, Eye, Building2, ExternalLink,
  Copy, Check, Briefcase, Package, Layers, Sliders, Brain, Users,
  Share2, LogOut, Globe
} from 'lucide-react';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { IndustryCareerTemplateSelector } from './IndustryCareerTemplateSelector';
import { TrainMyBrainQuickInput } from './TrainMyBrainQuickInput';
import { CommercialVersionReleaseStudio } from './CommercialVersionReleaseStudio';
import { IndustrySpecialtyBrainStudio } from './IndustrySpecialtyBrainStudio';
import { ProfileCardsAdminPortal } from './ProfileCardsAdminPortal';
import { GitHubCloudRunSyncStatusCard } from './GitHubCloudRunSyncStatusCard';
import { IndustryCareerTemplate } from '../data/industryCareerTemplates';

interface VisitorNote {
  id: string;
  sender: 'visitor' | 'owner' | 'sms-reply';
  text: string;
  timestamp: string;
  channel: 'web' | 'sms';
  userEmail?: string;
}

export const MobileAdminDashboard: React.FC<{ 
  onOpenDesktopView?: () => void;
  onOpenPluginVault?: () => void;
  onOpenShareLinksModal?: () => void;
  onOpenPublicWebsite?: () => void;
  onLogout?: () => void;
}> = ({ onOpenDesktopView, onOpenPluginVault, onOpenShareLinksModal, onOpenPublicWebsite, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'customers' | 'profile-cards' | 'quick-sms' | 'workspace' | 'morph-suite' | 'commercial-releases' | 'settings' | 'cicd-status'>('notes');
  const [brainSubView, setBrainSubView] = useState<'morph' | 'train'>('morph');
  const [activeTemplate, setActiveTemplate] = useState<IndustryCareerTemplate | null>(null);
  const [copiedUrlType, setCopiedUrlType] = useState<string | null>(null);
  const {
    pathway,
    setPathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    connectWorkspace,
    disconnectWorkspace,
    setIsWorkspaceModalOpen,
    syncData,
    isSyncing,
    lastSynced,
    syncStatusMsg
  } = useAccountPathway();
  const [notes, setNotes] = useState<VisitorNote[]>(() => {
    const saved = localStorage.getItem('vantage_live_visitor_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: '1', sender: 'visitor', text: 'Hi Mike, can we review our pre-approval options?', timestamp: '10:15 AM', channel: 'web', userEmail: 'client@example.com' },
      { id: '2', sender: 'sms-reply', text: 'Hi! Absolutely, I am reviewing your loan scenario right now.', timestamp: '10:16 AM', channel: 'sms' }
    ];
  });

  const [smsReplyText, setSmsReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetPhone, setTargetPhone] = useState(() => localStorage.getItem('vantage_target_phone') || '+1 (555) 019-2834');
  const [smsRelayEnabled, setSmsRelayEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vantage_sms_relay_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('vantage_live_visitor_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('vantage_sms_relay_enabled', JSON.stringify(smsRelayEnabled));
    localStorage.setItem('vantage_target_phone', targetPhone);
  }, [smsRelayEnabled, targetPhone]);

  const handleSendSmsReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsReplyText.trim()) return;

    const newNote: VisitorNote = {
      id: Date.now().toString(),
      sender: 'sms-reply',
      text: smsReplyText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'sms'
    };

    setNotes(prev => [...prev, newNote]);
    setSmsReplyText('');
  };

  const filteredNotes = notes.filter(n => 
    n.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.userEmail && n.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 overflow-x-hidden max-w-full w-full">
      {/* iPhone Dynamic Island & Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 pt-3 sm:pt-4 pb-3 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 max-w-full">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-white truncate">Mike Ford Admin</span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold shrink-0">NMLS 288455</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Mobile Command Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none max-w-full shrink-0">
            {onOpenPublicWebsite && (
              <button
                onClick={onOpenPublicWebsite}
                className="text-[10px] sm:text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-950/70 hover:bg-blue-900/80 px-2 py-1.5 rounded-lg border border-blue-800/80 transition flex items-center gap-1 cursor-pointer shrink-0"
                title="View Live Public Customer Facing Website"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Public Site</span>
              </button>
            )}
            {onOpenPluginVault && (
              <button
                onClick={onOpenPluginVault}
                className="text-[10px] sm:text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-950/70 px-2 py-1.5 rounded-lg border border-purple-800/80 transition flex items-center gap-1 cursor-pointer shrink-0"
                title="Open Plugin Archetypes Generator"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Plugins</span>
              </button>
            )}
            {onOpenShareLinksModal && (
              <button
                onClick={onOpenShareLinksModal}
                className="text-[10px] sm:text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-2 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer shrink-0"
                title="Open Live Lead Mobile URLs & PWA Launchers"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Lead URLs</span>
              </button>
            )}
            {onOpenDesktopView && (
              <button
                onClick={onOpenDesktopView}
                className="text-[10px] sm:text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 px-2 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[10px] sm:text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900/80 px-2 py-1.5 rounded-lg border border-rose-800/80 transition flex items-center gap-1 cursor-pointer shrink-0"
                title="Sign Out of Dashboard"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Nav Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Live Visitor Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'customers' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Connected Leads
          </button>
          <button
            onClick={() => setActiveTab('profile-cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'profile-cards' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Profile Cards
          </button>
          <button
            onClick={() => setActiveTab('quick-sms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'quick-sms' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            SMS Relay
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'workspace' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Google Apps & Workspace
          </button>
          <button
            onClick={() => setActiveTab('morph-suite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'morph-suite' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            2nd Brain Morph & Train
          </button>
          <button
            onClick={() => setActiveTab('commercial-releases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'commercial-releases' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Upgraded Releases
          </button>
          <button
            onClick={() => setActiveTab('cicd-status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'cicd-status' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Cloud Run & Git Sync
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts
          </button>
        </div>

        {/* Quick Pathway Mobile Banner */}
        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${pathway === 'workspace' ? 'bg-indigo-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-[11px] font-semibold text-slate-300">
              {pathway === 'workspace' ? 'Workspace Active' : 'Google Apps (Free)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => syncData()}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer shadow-xs"
            >
              <Building2 className="w-3 h-3" />
              <span>{isWorkspaceConnected ? 'Workspace Config' : 'Workspace Login'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
        {/* Compact Persistent Status Bar for Cloud Run & Git Sync */}
        {activeTab !== 'cicd-status' && (
          <GitHubCloudRunSyncStatusCard compact={true} />
        )}

        {activeTab === 'cicd-status' && (
          <GitHubCloudRunSyncStatusCard compact={false} />
        )}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search visitor notes or customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            {/* Conversation Feed */}
            <div className="space-y-3">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-6">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">No matching visitor notes found.</p>
                </div>
              ) : (
                filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border ${
                      n.sender === 'visitor'
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-blue-950/40 border-blue-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">
                          {n.sender === 'visitor' ? 'Website Visitor' : 'Mike Ford (SMS Reply)'}
                        </span>
                        {n.userEmail && (
                          <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-900">
                            {n.userEmail}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">{n.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendSmsReply} className="sticky bottom-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-xl flex gap-2">
              <input
                type="text"
                placeholder="Text reply back to visitor..."
                value={smsReplyText}
                onChange={(e) => setSmsReplyText(e.target.value)}
                className="flex-1 bg-slate-950 px-3 py-2 text-xs rounded-xl border border-slate-800 text-white outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </button>
            </form>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-xl text-xs text-blue-300">
              <span className="font-bold block mb-0.5">Customer Identity Directory</span>
              Showing all visitors who verified their email address to stay connected with you.
            </div>

            <div className="space-y-2">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">fordmj@gmail.com</h4>
                  <p className="text-[11px] text-slate-400">Workspace Administrator & Local Guide</p>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile-cards' && (
          <ProfileCardsAdminPortal />
        )}

        {activeTab === 'quick-sms' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Direct SMS Relay</h4>
                  <p className="text-[11px] text-slate-400">Receive text alerts directly on your iPhone</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsRelayEnabled}
                    onChange={(e) => setSmsRelayEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your iPhone Cell Phone Number</label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-4">
            {/* Pathway Status Banner */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dual Pathway Mode</h4>
                    <p className="text-[10px] text-slate-400">Google Apps (Free) & Google Workspace</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  pathway === 'workspace'
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {pathway === 'workspace' ? 'Workspace' : 'Free Apps'}
                </span>
              </div>

              {/* Pathway details */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Current Active Mode:</span>
                  <span className="font-semibold text-white">
                    {pathway === 'workspace' ? 'Google Workspace (Enterprise)' : 'Google Apps (Standard / Free)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Workspace Status:</span>
                  <span className={isWorkspaceConnected ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                    {isWorkspaceConnected ? connectedWorkspaceEmail || 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>

              {/* Sync and Workspace Actions */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => syncData()}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
                  <span>{isSyncing ? 'Syncing Workspace Data...' : 'Sync Workspace Data'}</span>
                </button>

                <button
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isWorkspaceConnected ? 'Manage Google Workspace Account' : 'Sign In with Google Workspace'}</span>
                </button>
              </div>

              {syncStatusMsg && (
                <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-blue-200">
                  {syncStatusMsg}
                </div>
              )}
            </div>

            {/* Quick Launcher for Built-in Google Apps */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Innately Available Google Apps (Mobile Quick Launch)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Free for all users who passed Google sign-in. Tap any app below to open directly in your mobile browser:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: 'Gmail', url: 'https://mail.google.com', icon: Mail, color: 'text-red-400' },
                  { name: 'Calendar', url: 'https://calendar.google.com', icon: Clock, color: 'text-blue-400' },
                  { name: 'Drive', url: 'https://drive.google.com', icon: Shield, color: 'text-amber-400' },
                  { name: 'Docs', url: 'https://docs.google.com', icon: MessageSquare, color: 'text-blue-500' },
                  { name: 'Sheets', url: 'https://sheets.google.com', icon: CheckSquare, color: 'text-emerald-400' },
                  { name: 'Tasks', url: 'https://tasks.google.com', icon: CheckCircle2, color: 'text-blue-400' },
                ].map((app, i) => {
                  const Icon = app.icon;
                  return (
                    <a
                      key={i}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${app.color}`} />
                        <span className="text-xs font-semibold text-slate-200">{app.name}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Live Lead Mobile PWA URLs Generator Card */}
            {onOpenShareLinksModal && (
              <div className="bg-gradient-to-r from-blue-950/70 to-indigo-950/70 p-4 rounded-2xl border border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-300" />
                    Shareable Lead Mobile URLs & QR Codes
                  </h4>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    Admin Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Generate customer-ready mobile demo links, SMS pitch copy, and QR codes with 1-click iPhone / Android Add-to-Home-Screen launchers.
                </p>
                <button
                  type="button"
                  onClick={onOpenShareLinksModal}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open 5 Live Mobile Plugin URLs Hub</span>
                </button>
              </div>
            )}

            {/* Direct Secret Admin URLs Card */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Mike Ford Direct Admin URLs (Bookmarks)
                </h4>
                <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-800">
                  Direct Links Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                As requested, the Admin Vault button has been removed from the public website. Use these direct URLs to bookmark or access your back-end dashboard:
              </p>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'mobile_admin',
                    title: 'Dedicated iPhone Mobile Admin View',
                    desc: 'Clean mobile-first command center for iPhone Safari / Home Screen.',
                    param: '?mobile_admin=true'
                  },
                  {
                    id: 'admin_plugins',
                    title: 'Standalone Plugin Archetypes Vault',
                    desc: '2nd Brain, Workplace UI, and Voice Plugin generators & distribution.',
                    param: '?tab=admin_plugins'
                  },
                  {
                    id: 'admin_general',
                    title: 'Direct Admin Dashboard Access',
                    desc: 'Standard secured admin bypass to the back-end workspace.',
                    param: '?admin=true'
                  }
                ].map((item) => {
                  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${item.param}` : item.param;
                  const isCopied = copiedUrlType === item.id;
                  return (
                    <div key={item.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-200">{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-blue-400 font-semibold shrink-0">
                          {item.param}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          readOnly
                          value={fullUrl}
                          className="flex-1 text-[11px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 select-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(fullUrl);
                            setCopiedUrlType(item.id);
                            setTimeout(() => setCopiedUrlType(null), 2500);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* iPhone Home Screen Instructions */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                Add Dedicated Mobile Admin to iPhone Home Screen
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                1. Open your dedicated iPhone URL (<span className="text-blue-400 font-mono font-semibold">?mobile_admin=true</span>) in Safari.<br />
                2. Tap the Safari <strong>Share button (square with arrow icon)</strong> at the bottom bar.<br />
                3. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                4. Name it <strong>Vantage Admin</strong> and tap <strong>Add</strong>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const mobileUrl = `${window.location.origin}/?mobile_admin=true`;
                    navigator.clipboard.writeText(mobileUrl);
                    setCopiedUrlType('mobile_admin_main');
                    setTimeout(() => setCopiedUrlType(null), 2500);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  {copiedUrlType === 'mobile_admin_main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrlType === 'mobile_admin_main' ? 'Mobile Admin URL Copied!' : 'Copy iPhone Mobile Admin URL'}</span>
                </button>
              </div>
            </div>

            {/* Session & Public Website Switching Card */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Session & Portal Navigation
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seamlessly jump to the public-facing customer portal to test lead experiences or sign out of your administrator session:
              </p>
              <div className="space-y-2 pt-1">
                {onOpenPublicWebsite && (
                  <button
                    type="button"
                    onClick={onOpenPublicWebsite}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>View Public Customer Website</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Admin Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: 2nd Brain Cognitive Morph & Training Suite (Admin Mobile) */}
        {activeTab === 'morph-suite' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">2nd Brain Architecture</span>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBrainSubView('morph')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    brainSubView === 'morph' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Industry Morph
                </button>
                <button
                  type="button"
                  onClick={() => setBrainSubView('train')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    brainSubView === 'train' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Train Brain (AI)
                </button>
              </div>
            </div>

            {brainSubView === 'morph' ? (
              <div className="bg-slate-900 p-3 sm:p-5 rounded-3xl border border-slate-800">
                <IndustryCareerTemplateSelector
                  onTemplateApplied={(template) => {
                    setActiveTemplate(template);
                    setBrainSubView('train');
                  }}
                  onOpenRecallWithQuestion={() => {
                    if (onOpenDesktopView) onOpenDesktopView();
                  }}
                  onOpenTrainWindow={() => {
                    setBrainSubView('train');
                  }}
                  onOpenIngestDocs={() => {
                    if (onOpenDesktopView) onOpenDesktopView();
                  }}
                />
              </div>
            ) : (
              <div className="bg-slate-900 p-3 sm:p-5 rounded-3xl border border-slate-800">
                <TrainMyBrainQuickInput
                  activeTemplate={activeTemplate}
                  onTrainingComplete={() => {}}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Commercial Version Releases (Admin Mobile) */}
        {activeTab === 'commercial-releases' && (
          <div className="space-y-6">
            <IndustrySpecialtyBrainStudio 
              onOpenDesktopView={onOpenDesktopView}
            />
            <div className="pt-6 border-t border-slate-800">
              <CommercialVersionReleaseStudio />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
