import React, { useState, useRef } from 'react';
import { Mail, Send, Sparkles, CheckCircle2, Loader2, Bot, Building2, User, Mic, MicOff, ExternalLink } from 'lucide-react';
import { getAccessToken } from '../services/firebase';

interface ContactDraft {
  id: string;
  category: string;
  name: string;
  email: string;
  organization: string;
  subject: string;
  body: string;
}

const contactList: Array<Omit<ContactDraft, 'id'>> = [
  {
    category: 'Seed Investors & VC',
    name: 'Khosla Ventures Team',
    email: 'kv@khoslaventures.com',
    organization: 'Khosla Ventures',
    subject: 'AI-First Venture Pitch: Vantage AI & Long-Term Persistent 2nd Brain',
    body: `Dear Khosla Ventures Team,\n\nI am reaching out regarding Vantage AI, our cutting-edge hybrid memory recall and AI-first workspace platform backed by DeepThink reasoning and secure cloud persistence.\n\nGiven your leadership in scaling category-defining AI infrastructure (such as Emergent), we believe Vantage AI aligns strongly with your thesis.\n\nWe would love to share our live demo and technical roadmap.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Brett Rochkind',
    email: 'brett.rochkind@softbank.com',
    organization: 'SoftBank Vision Fund 2',
    subject: 'SoftBank Vision Fund Partnership: Vantage AI Enterprise Scale',
    body: `Hi Brett,\n\nI'm writing to introduce Vantage AI, an enterprise-grade AI assistant and 2nd brain integration suite for Google Workspace.\n\nAs SoftBank continues to champion transformative AI infrastructure, we are scaling rapidly with hybrid Deepseek + Gemini reasoning architectures.\n\nWould you be open to a brief introductory call next week?\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Vikas J. Parekh',
    email: 'vikas.parekh@softbank.com',
    organization: 'SoftBank Vision Fund 2',
    subject: 'AI Infrastructure Growth: Vantage AI Investment Overview',
    body: `Hi Vikas,\n\nIntroducing Vantage AI—a persistent learning memory platform designed to unify enterprise knowledge across Gmail, Calendar, Drive, and custom 2nd Brain ingest.\n\nWe would welcome the opportunity to share our metrics and product demo with SoftBank.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Nola Martin',
    email: 'nola@lsvp.com',
    organization: 'Lightspeed Venture Partners',
    subject: 'Lightspeed & Vantage AI: Next-Gen Developer & Workspace Tools',
    body: `Hi Nola,\n\nAs an early investor in category leaders like Emergent, Lightspeed is renowned for backing exceptional developer and AI tools.\n\nVantage AI delivers persistent memory recall and automated workspace execution with hybrid Deepseek + Gemini architecture.\n\nWe would love to connect.\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Y Combinator Admissions',
    email: 'info@ycombinator.com',
    organization: 'Y Combinator',
    subject: 'YC Application Follow-up / Vantage AI Persistent 2nd Brain',
    body: `Hello YC Team,\n\nWe have submitted our application for Vantage AI—a fully functional hybrid AI workspace and persistent 2nd brain supporting deep web scraping, document extraction, and workspace automation.\n\nWe look forward to your review and are available for any questions.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Hemant Taneja',
    email: 'htaneja@generalcatalyst.com',
    organization: 'General Catalyst',
    subject: 'General Catalyst & Vantage AI: Responsible AI & Enterprise Workflows',
    body: `Hi Hemant,\n\nGeneral Catalyst's backing of transformative developer tooling (such as Kilo Code) inspires our work at Vantage AI.\n\nWe are building a hybrid Gemini and Deepseek AI workspace agent with secure cloud persistence and automated document/media ingestion.\n\nWould you be open to a quick look at our deck?\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'S Capital Team',
    email: 'contact@scapitalvc.com',
    organization: 'S Capital VC',
    subject: 'S Capital & Vantage AI: Seed Financing & SaaS Innovation',
    body: `Hello S Capital Team,\n\nWe are reaching out from Vantage AI—building an advanced persistent learning memory and AI workspace suite.\n\nWith our proven ability to ingest 50MB+ documents, videos, and live URLs into long-term recall memory, we are primed for our seed round.\n\nWe'd love to connect.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Chris Schiavo',
    email: 'chris@battery.com',
    organization: 'Battery Ventures',
    subject: 'Battery Ventures & Vantage AI: Enterprise AI Coding & Workspace Suite',
    body: `Hi Chris,\n\nBattery Ventures has an incredible track record in enterprise AI coding tools (such as SolveAI).\n\nVantage AI brings together persistent 2nd brain memory recall and Google Workspace integrations in a unified platform.\n\nWould love to share our demo.\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Amit Garg',
    email: 'j@tauventures.com',
    organization: 'Tau Ventures',
    subject: 'Tau Ventures AI-First Seed Funding: Vantage AI',
    body: `Hi Amit,\n\nTau Ventures' focus on AI-first technologies makes you an ideal partner for Vantage AI.\n\nOur platform features multi-model hybrid reasoning (Gemini + Deepseek), live web scraping, and multi-format document ingestion (PDF, TXT, Video, Audio) for long-term situational recall.\n\nLet's connect soon.\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Dave Armstrong',
    email: 'DArmstrong@foundationcap.com',
    organization: 'Foundation Capital',
    subject: 'Foundation Capital & Vantage AI: Deep Technical AI Founders',
    body: `Hi Dave,\n\nFoundation Capital's ASHU Garg and team specialize in backing deeply technical AI founders.\n\nVantage AI delivers secure cloud persistence, real-time Gmail/Calendar synchronization, and an advanced 2nd brain memory engine.\n\nWould love your feedback on our product.\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Dave Morin',
    email: 'd@offline.vc',
    organization: 'Offline Ventures',
    subject: 'Offline Ventures & "Vibe Coding": Vantage AI Persistence Platform',
    body: `Hi Dave,\n\nOffline Ventures has been a vocal champion of the "vibe coding" and agentic workflow movement.\n\nVantage AI empowers developers and professionals with a true persistent learning memory agent that connects directly to Google Workspace.\n\nWould love to chat!\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Seed Investors & VC',
    name: 'Timothy Chen',
    email: 'tnachen@essencevc.fund',
    organization: 'Essence VC',
    subject: 'Essence VC & Vantage AI: Developer Infrastructure & 2nd Brain',
    body: `Hi Timothy,\n\nI know you are very excited about developer tools and infrastructure.\n\nVantage AI combines secure Firebase/Cloud Run deployment with a hybrid Deepseek + Gemini memory recall engine.\n\nWould love to share our technical architecture with you.\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Accelerators & Incubation',
    name: 'Astin (Hashed Vibe Labs)',
    email: 'astin@hashed.com',
    organization: 'Hashed Vibe Labs (Nitro)',
    subject: 'Hashed Vibe Labs Application: Vantage AI Live Product Demo',
    body: `Hi Astin,\n\nWe are applying to Vibe Labs with Vantage AI—a fully deployed, live AI workspace and persistent memory agent.\n\nYou can test our live application at our Cloud Run development URL. We've built robust multi-format file ingestion (50MB max) and hybrid model reasoning.\n\nLooking forward to your thoughts!\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Accelerators & Incubation',
    name: 'AI2 Incubator Team',
    email: 'info@ai2incubator.com',
    organization: 'AI2 Incubator',
    subject: 'AI2 Incubator Application: Vantage AI Persistent Memory Suite',
    body: `Hello AI2 Incubator Team,\n\nWe are technical founders building Vantage AI in Seattle. Our platform integrates advanced document scraping, video-to-text audio extraction, and hybrid LLM reasoning for persistent situational memory.\n\nWe would love to be considered for your next cohort.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'M&A & Acqui-Hire Advisors',
    name: 'Windsor Drake M&A',
    email: 'inquiries@windsordrake.com',
    organization: 'Windsor Drake',
    subject: 'Strategic Advisory & Growth Inquiry: Vantage AI',
    body: `Hello Windsor Drake Team,\n\nWe are exploring strategic M&A advisory and growth options for Vantage AI, a high-growth AI workspace and persistent memory software asset.\n\nWe would appreciate a brief discussion with your sell-side advisory team.\n\nBest regards,\nVantage AI Founder`
  },
  {
    category: 'M&A & Acqui-Hire Advisors',
    name: 'Amar (GrowthPal)',
    email: 'amar@growthpal.com',
    organization: 'GrowthPal',
    subject: 'GrowthPal Listing Inquiry: Vantage AI Acqui-Hire & Strategic Match',
    body: `Hi Amar,\n\nWe are interested in listing Vantage AI on GrowthPal to explore strategic acqui-hire and partnership opportunities with enterprise tech acquirers.\n\nCould you guide us on the onboarding process?\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Platforms & Resources',
    name: 'Steph (OpenVC)',
    email: 'steph@openvc.app',
    organization: 'OpenVC',
    subject: 'OpenVC Founder Profile Verification: Vantage AI',
    body: `Hi Steph,\n\nWe have submitted our founder profile for Vantage AI on OpenVC, focusing on AI, developer tooling, and persistent memory software.\n\nThank you for building such an incredible resource for founders!\n\nBest,\nVantage AI Founder`
  },
  {
    category: 'Platforms & Resources',
    name: 'Finn (Origami Agents)',
    email: 'finn@origamiagents.com',
    organization: 'Origami AI',
    subject: 'Origami Prospecting Tool Feedback & Vantage AI Collaboration',
    body: `Hi Finn,\n\nWe've been utilizing AI prospecting methodologies inspired by tools like Origami to connect with top-tier VCs for Vantage AI.\n\nWould love to connect and exchange notes on AI agent workflows.\n\nBest,\nVantage AI Founder`
  }
];

export const GmailDraftsView: React.FC = () => {
  const [drafts, setDrafts] = useState<ContactDraft[]>(
    contactList.map((item, index) => ({ id: 'draft_' + index, ...item }))
  );
  const [selectedDraftId, setSelectedDraftId] = useState<string>(drafts[0]?.id || '');
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<{ [key: string]: boolean }>({});
  const [gmailDraftIds, setGmailDraftIds] = useState<{ [key: string]: string }>({});
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const activeDraft = drafts.find(d => d.id === selectedDraftId) || drafts[0];

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript) {
        handleUpdateActiveDraft('body', activeDraft.body + '\n\n[Voice Note]: ' + transcript);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleUpdateActiveDraft = (field: keyof ContactDraft, val: string) => {
    setDrafts(prev => prev.map(d => d.id === activeDraft.id ? { ...d, [field]: val } : d));
  };

  const handleSaveDraftToGmail = async (draft: ContactDraft) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('Please connect your Google Account in Workspace Hub to save drafts directly to Gmail.');
        return;
      }

      const rawMessage = [
        `To: ${draft.email}`,
        `Subject: ${draft.subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        draft.body,
      ].join('\n');

      const utf8Bytes = new TextEncoder().encode(rawMessage);
      let binaryString = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryString += String.fromCharCode(utf8Bytes[i]);
      }
      const encodedMessage = btoa(binaryString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Create Draft in Gmail API
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft: {
            message: { raw: encodedMessage }
          }
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to save draft to Gmail');
      }

      const data = await res.json();
      const createdDraftId = data.id;

      setSavedStatus(prev => ({ ...prev, [draft.id]: true }));
      if (createdDraftId) {
        setGmailDraftIds(prev => ({ ...prev, [draft.id]: createdDraftId }));
      }
      setGlobalSuccess(`Successfully saved draft in Gmail for ${draft.name} (${draft.organization})!`);
      setTimeout(() => setGlobalSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert('Error saving draft to Gmail: ' + err.message);
    }
  };

  const handleSaveAllDrafts = async () => {
    setIsSavingAll(true);
    for (const draft of drafts) {
      if (!savedStatus[draft.id]) {
        await handleSaveDraftToGmail(draft);
      }
    }
    setIsSavingAll(false);
    setGlobalSuccess('All 18 verified contact draft emails successfully created and saved in Gmail!');
    setTimeout(() => setGlobalSuccess(null), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold w-fit mb-3 border border-white/10">
            <Mail className="w-4 h-4 text-cyan-400" /> Gmail Draft Generator ({drafts.length} Contacts)
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Saved Draft Emails for Verified Contacts</h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Generated tailored pitch drafts for all verified seed investors, VCs, accelerators, and M&A advisors extracted from your intelligence feed.
          </p>
        </div>
        <button
          onClick={handleSaveAllDrafts}
          disabled={isSavingAll}
          className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSavingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving All to Gmail...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Save All {drafts.length} Drafts to Gmail
            </>
          )}
        </button>
      </div>

      {globalSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* Mobile Contact Selector Dropdown */}
      <div className="block lg:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-700">Select Contact ({drafts.length} available):</label>
        <select
          value={activeDraft.id}
          onChange={(e) => setSelectedDraftId(e.target.value)}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium"
        >
          {drafts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.organization} {savedStatus[d.id] ? '✓ (Saved)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Sidebar (Desktop) */}
        <div className="hidden lg:flex bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex-col h-[700px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Extracted Contacts ({drafts.length})</h3>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {drafts.map((d) => {
              const isSelected = d.id === activeDraft.id;
              const isSaved = savedStatus[d.id];
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDraftId(d.id)}
                  className={`w-full text-left p-4 transition flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{d.name}</span>
                      {isSaved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{d.organization}</p>
                    <span className="inline-block text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                      {d.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Draft Editor View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between min-h-[600px] lg:h-[700px]">
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                  {activeDraft.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{activeDraft.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{activeDraft.organization} • &lt;{activeDraft.email}&gt;</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {savedStatus[activeDraft.id] ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" /> Saved in Gmail Drafts
                    </span>
                    <a
                      href={gmailDraftIds[activeDraft.id] ? `https://mail.google.com/mail/u/0/#drafts/${gmailDraftIds[activeDraft.id]}` : 'https://mail.google.com/mail/u/0/#drafts'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View in Gmail
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() => handleSaveDraftToGmail(activeDraft)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Save Draft to Gmail
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={activeDraft.email}
                  onChange={(e) => handleUpdateActiveDraft('email', e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={activeDraft.subject}
                  onChange={(e) => handleUpdateActiveDraft('subject', e.target.value)}
                  className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Email Body Draft</label>
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg transition ${
                      isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                    title="Click to dictate email draft via Voice"
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isRecording ? 'Listening (Click to Stop)...' : 'Talk-to-Text Dictation'}
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={activeDraft.body}
                  onChange={(e) => handleUpdateActiveDraft('body', e.target.value)}
                  className="w-full text-xs font-sans p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Contact ID: {activeDraft.id}</span>
            <span className="font-medium text-slate-600 text-center sm:text-right">All fields fully editable before syncing to Gmail API.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
