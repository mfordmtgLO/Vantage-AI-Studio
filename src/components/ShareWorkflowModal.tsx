import React, { useState } from 'react';
import { Share2, Copy, Check, Mail, Send, Link, Globe, Shield, Sparkles, X, CheckCircle2, UserCheck } from 'lucide-react';
import { getAccessToken } from '../services/firebase';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'scrape_url' | 'ai_synthesize' | 'gmail_draft' | 'docs_create' | 'calendar_event';
  config: {
    url?: string;
    prompt?: string;
    recipient?: string;
    subject?: string;
    docTitle?: string;
    eventTitle?: string;
  };
}

export interface ShareableWorkflowData {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  authorEmail?: string;
  createdAt: string;
  version: string;
}

interface ShareWorkflowModalProps {
  workflowName: string;
  workflowDescription?: string;
  steps: WorkflowStep[];
  authorEmail?: string;
  onClose: () => void;
}

export const ShareWorkflowModal: React.FC<ShareWorkflowModalProps> = ({
  workflowName,
  workflowDescription = 'Automated multi-step pipeline powered by Gemini AI and Google Workspace.',
  steps,
  authorEmail = 'fordmj@gmail.com',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalNote, setPersonalNote] = useState('Hey, here is a custom Vantage AI workflow I created that automates research and Google Workspace tasks. Import it to run it directly!');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Generate robust shareable encoded token
  const payloadData: ShareableWorkflowData = {
    id: 'vwf_' + Math.random().toString(36).substring(2, 9),
    name: workflowName,
    description: workflowDescription,
    steps,
    authorEmail,
    createdAt: new Date().toISOString(),
    version: '1.0',
  };

  const encodedPayload = btoa(encodeURIComponent(JSON.stringify(payloadData)));
  const publicShareUrl = `${window.location.origin}?workflow_import=${encodedPayload}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payloadData, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  };

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    setIsSendingEmail(true);
    setEmailStatus(null);

    const token = getAccessToken();
    const emailSubject = `Vantage AI Workflow Template: ${workflowName}`;
    const emailBody = `Hi,\n\n${authorEmail} has shared a Vantage AI multi-step workflow template with you:\n\n` +
      `Workflow: ${workflowName}\n` +
      `Description: ${workflowDescription}\n` +
      `Steps (${steps.length}):\n${steps.map((s, idx) => `  ${idx + 1}. ${s.name} [${s.type}]`).join('\n')}\n\n` +
      `Personal Note:\n"${personalNote}"\n\n` +
      `To import and run this workflow instantly in your Vantage AI Studio, click here:\n${publicShareUrl}\n\n` +
      `Automated via Vantage AI Second Brain & Logic Orchestrator.`;

    // If Google token exists, draft or send via Gmail API
    if (token) {
      try {
        const rawMessage = [
          `To: ${recipientEmail}`,
          `Subject: ${emailSubject}`,
          'Content-Type: text/plain; charset="UTF-8"',
          'MIME-Version: 1.0',
          '',
          emailBody,
        ].join('\r\n');

        const base64EncodedEmail = btoa(unescape(encodeURIComponent(rawMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: { raw: base64EncodedEmail },
          }),
        });

        if (res.ok) {
          setEmailStatus({
            type: 'success',
            message: `Workflow invite drafted in your Gmail for ${recipientEmail}! Ready to review or send.`,
          });
          setRecipientEmail('');
        } else {
          // Fallback to mailto link
          window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          setEmailStatus({
            type: 'success',
            message: `Created mailto invite link for ${recipientEmail}.`,
          });
        }
      } catch (err: any) {
        window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        setEmailStatus({
          type: 'success',
          message: `Opened mail client to send invite to ${recipientEmail}.`,
        });
      }
    } else {
      // Fallback: open default mailto handler
      window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      setEmailStatus({
        type: 'success',
        message: `Opened default mail client with workflow link for ${recipientEmail}.`,
      });
    }

    setIsSendingEmail(false);
  };

  return (
    <div
      id="share-workflow-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Share Workflow Template
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a public link or email invitation for other Workspace users.
              </p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Summary Chip */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{workflowName}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full">
              {steps.length} Steps
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{workflowDescription}</p>
        </div>

        {/* Tab Toggle: Link vs Email */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            id="share-tab-link"
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Public URL Link</span>
          </button>
          <button
            id="share-tab-email"
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Invite</span>
          </button>
        </div>

        {/* TAB 1: Public URL */}
        {activeTab === 'link' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Public Workflow Import Link</span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">One-click import</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="workflow-share-url-input"
                  type="text"
                  readOnly
                  value={publicShareUrl}
                  className="flex-1 px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  id="copy-workflow-share-url-btn"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0 ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl space-y-1 text-xs text-blue-900 dark:text-blue-200">
              <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-100">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Any Workspace User Can Import</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                Recipients clicking this link will open Vantage with an interactive import modal. All step configs, Gemini prompts, and Google Workspace targets are preserved.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">Need raw JSON configuration?</span>
              <button
                id="copy-raw-json-btn"
                onClick={handleCopyJson}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedPayload ? 'JSON Copied!' : 'Copy JSON Payload'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Email Invite */}
        {activeTab === 'email' && (
          <form onSubmit={handleSendEmailInvite} className="space-y-4 animate-in fade-in duration-150">
            {emailStatus && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  emailStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{emailStatus.message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recipient Email Address:</label>
              <input
                id="invite-recipient-email-input"
                type="email"
                required
                placeholder="colleague@company.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Note / Instructions:</label>
              <textarea
                id="invite-personal-note-input"
                rows={3}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Sends via verified Google Workspace Gmail
              </span>
              <button
                id="send-email-invite-btn"
                type="submit"
                disabled={isSendingEmail || !recipientEmail.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingEmail ? 'Sending...' : 'Send Invite'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
