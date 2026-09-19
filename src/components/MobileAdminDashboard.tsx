import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Phone, User, Shield, CheckCircle2, Clock, 
  Trash2, Bell, Sparkles, Smartphone, Mail, ChevronRight, Search, 
  Filter, CheckSquare, RefreshCw, Eye
} from 'lucide-react';

interface VisitorNote {
  id: string;
  sender: 'visitor' | 'owner' | 'sms-reply';
  text: string;
  timestamp: string;
  channel: 'web' | 'sms';
  userEmail?: string;
}

export const MobileAdminDashboard: React.FC<{ onOpenDesktopView?: () => void }> = ({ onOpenDesktopView }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'customers' | 'quick-sms' | 'settings'>('notes');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600">
      {/* iPhone Dynamic Island & Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white">Mike Ford Admin</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">NMLS 288455</span>
              </div>
              <p className="text-[11px] text-slate-400">Mobile Command Center</p>
            </div>
          </div>
          {onOpenDesktopView && (
            <button
              onClick={onOpenDesktopView}
              className="text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Desktop View
            </button>
          )}
        </div>

        {/* Mobile Sub-Nav Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
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
            onClick={() => setActiveTab('quick-sms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'quick-sms' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            SMS Relay
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
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
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

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                Add to iPhone Home Screen
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tap the Safari <strong>Share button (square with arrow)</strong> at the bottom of your screen, then select <strong>Add to Home Screen</strong>. This will install your direct Mike Ford Admin app icon!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
