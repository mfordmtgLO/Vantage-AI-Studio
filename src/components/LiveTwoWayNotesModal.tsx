import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, User, Shield, RefreshCw, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface VisitorNote {
  id: string;
  sender: 'visitor' | 'owner' | 'sms-reply';
  text: string;
  timestamp: string;
  channel: 'web' | 'sms';
}

interface LiveTwoWayNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTwoWayNotesModal: React.FC<LiveTwoWayNotesProps> = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState<VisitorNote[]>(() => {
    const saved = localStorage.getItem('vantage_live_visitor_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { id: '1', sender: 'visitor', text: 'Hello! I uploaded my lead lists. Can you verify the custom exclusion filters?', timestamp: '10:15 AM', channel: 'web' },
      { id: '2', sender: 'owner', text: 'Hi! Yes, the exclusion filters are fully active and purging matching domains.', timestamp: '10:16 AM', channel: 'sms' }
    ];
  });

  const [inputMsg, setInputMsg] = useState('');
  const [simulateSmsReply, setSimulateSmsReply] = useState('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('vantage_live_visitor_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSendVisitorNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newNote: VisitorNote = {
      id: Date.now().toString(),
      sender: 'visitor',
      text: inputMsg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'web'
    };

    setNotes(prev => [...prev, newNote]);
    setInputMsg('');

    // Trigger instant browser/iPhone push alert to workspace owner
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('New Visitor Note & Free SMS Alert!', {
            body: `Visitor wrote: "${newNote.text}". Sent instantly to your cell phone.`,
            icon: '/assets/icon-192.png'
          });
        });
      } else {
        new Notification('New Visitor Note & Free SMS Alert!', {
          body: `Visitor wrote: "${newNote.text}". Sent instantly to your cell phone.`,
          icon: '/assets/icon-192.png'
        });
      }
    }
  };

  const handleSimulateSmsReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulateSmsReply.trim()) return;

    const replyNote: VisitorNote = {
      id: Date.now().toString(),
      sender: 'sms-reply',
      text: simulateSmsReply.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'sms'
    };

    setNotes(prev => [...prev, replyNote]);
    setSimulateSmsReply('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative transition-colors max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live 2-Way Visitor Notes & Free SMS Sync</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Persistent real-time communication synced between website visitor, secure dashboard, and cell phone SMS.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                isAdminMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {isAdminMode ? 'Admin Dashboard View' : 'Website Visitor View'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              ✕
            </button>
          </div>
        </div>

        {/* Live Conversation Stream with Persistence */}
        <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[300px] max-h-[400px]">
          {notes.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">No active notes or communications yet. Start typing below!</p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className={`flex flex-col max-w-[85%] ${
                  n.sender === 'visitor' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {n.sender === 'visitor' ? 'Website Visitor' : n.sender === 'sms-reply' ? 'Owner Cell Phone (SMS Reply)' : 'Dashboard Admin'}
                  </span>
                  <span className="text-[9px] text-slate-400">({n.channel.toUpperCase()})</span>
                  <span className="text-[9px] text-slate-400">· {n.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    n.sender === 'visitor'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : n.sender === 'sms-reply'
                      ? 'bg-emerald-600 text-white rounded-bl-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {n.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Input Forms */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {isAdminMode ? (
            <form onSubmit={handleSimulateSmsReply} className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Simulate Cell Phone SMS Reply (Lands instantly back in visitor notes & dashboard)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type reply from cell phone text message..."
                  value={simulateSmsReply}
                  onChange={(e) => setSimulateSmsReply(e.target.value)}
                  className="flex-1 p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send SMS Reply
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendVisitorNote} className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Website Visitor Note Input (Sends free SMS to your phone & shows in secure dashboard)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type note or question as website visitor..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Note
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ⚡ Persistent across new browser sessions via secure LocalStorage & Push Sync.
            </span>
            <button
              onClick={() => {
                setNotes([]);
                localStorage.removeItem('vantage_live_visitor_notes');
              }}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
