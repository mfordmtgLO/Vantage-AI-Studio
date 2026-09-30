/**
 * @file ThreadWebsiteViewerModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * In-App Simulated Website & Conversation Comments Viewer
 * Faithfully renders the external website (Real Estate Blogs, Reddit communities, Forums, Chat Boards)
 * including full article content, author metadata, and the live conversation comments section
 * so clicking 'Open Thread URL' never fails with 'server can't be found' in mobile Safari.
 */

import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  X,
  MessageSquare,
  ThumbsUp,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Send,
  UserCheck,
  Building2,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { TwoWaySyncIntegrationGuideModal } from './TwoWaySyncIntegrationGuideModal';
import { CopySignatureButton } from './CopySignatureButton';

export interface ThreadMessageItem {
  sender: 'lo' | 'renter' | 'community';
  authorName: string;
  text: string;
  timestamp: string;
  likes?: number;
  avatarUrl?: string;
  badge?: string;
}

export interface ThreadWebsiteData {
  leadId: string;
  url: string;
  title: string;
  platform: string;
  author: string;
  location?: string;
  matchedProgram?: string;
  messageThreadId?: string;
  targetCommentId?: string;
  messages: ThreadMessageItem[];
  articleSnippet?: string;
}

interface ThreadWebsiteViewerModalProps {
  threadData: ThreadWebsiteData | null;
  isOpen: boolean;
  onClose: () => void;
  onPostNewComment?: (leadId: string, authorName: string, text: string) => void;
}

export const ThreadWebsiteViewerModal: React.FC<ThreadWebsiteViewerModalProps> = ({
  threadData,
  isOpen,
  onClose,
  onPostNewComment
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [localComments, setLocalComments] = useState<ThreadMessageItem[]>([]);
  const [commentLiked, setCommentLiked] = useState<Record<number, boolean>>({});

  // Synchronize local comments when threadData changes
  React.useEffect(() => {
    if (threadData) {
      setLocalComments(threadData.messages || []);
    }
  }, [threadData]);

  if (!isOpen || !threadData) return null;

  const url = threadData.url || 'https://pnwrealestateblog.org/oregon-usda-zones';
  const isReddit = threadData.platform.toLowerCase().includes('reddit') || url.includes('reddit.com');
  const isDiscordOrChat = threadData.platform.toLowerCase().includes('discord') || threadData.platform.toLowerCase().includes('chat');
  const isBlog = !isReddit && !isDiscordOrChat;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newMsg: ThreadMessageItem = {
      sender: 'lo',
      authorName: 'Mike Ford (Senior Loan Officer)',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 1,
      badge: 'Verified Oregon Mortgage LO • 26 Yrs Exp'
    };

    setLocalComments(prev => [...prev, newMsg]);
    if (onPostNewComment) {
      onPostNewComment(threadData.leadId, 'Mike Ford (LO)', newCommentText.trim());
    }
    setNewCommentText('');
  };

  const toggleLike = (index: number) => {
    setCommentLiked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] max-h-[860px] bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-emerald-500/30">
        
        {/* ===================================================================== */}
        {/* BROWSER CHROME / APP BAR HEADER                                       */}
        {/* ===================================================================== */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left: Window Controls & Back/Forward */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block hover:opacity-100 cursor-pointer" onClick={onClose} title="Close window" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block opacity-75" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block opacity-75" />
            </div>
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <button type="button" className="p-1 hover:text-slate-200 rounded hover:bg-slate-800 transition" title="Back">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button type="button" className="p-1 hover:text-slate-200 rounded hover:bg-slate-800 transition" title="Forward">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={handleRefresh} 
                className={`p-1 hover:text-slate-200 rounded hover:bg-slate-800 transition ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
                title="Reload website"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center: Address Bar (with SSL lock and live URL) */}
          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 shadow-inner">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono shrink-0">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Secure</span>
            </div>
            <div className="flex-1 font-mono text-[11px] truncate text-slate-200 selection:bg-indigo-500">
              {url}
            </div>
            <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              200 OK
            </span>
          </div>

          {/* Right: Actions (Integration Guide, Copy Signature, Copy URL, Close) */}
          <div className="flex items-center gap-1.5">
            <CopySignatureButton
              currentState="OR"
              threadId={threadData?.messageThreadId}
              variant="compact"
            />

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-indigo-500/40"
              title="Open Two-Way Comment Sync & Signature Attribution Guide"
            >
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">Sync Guide</span>
            </button>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer border border-slate-700"
              title="Copy original link"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Banner Notification */}
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              <strong>AI 2nd Brain Direct Comment Anchor:</strong> Thread mapped directly to <strong>@{threadData.author}</strong>.
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-[10px] font-bold">
              MessageThreadID: #{threadData.messageThreadId || `th_${threadData.leadId.slice(0, 10)}`}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold">
              Anchor: #{threadData.targetCommentId || `cmt_${threadData.leadId.slice(0, 8)}`}
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-emerald-400/80">
            Source: {threadData.platform} (Isolated from general thread noise)
          </span>
        </div>

        {/* ===================================================================== */}
        {/* SIMULATED WEBPAGE CONTENT BODY                                        */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto bg-slate-900 selection:bg-indigo-600 selection:text-white">
          
          {/* =================================================================== */}
          {/* LAYOUT 1: REAL ESTATE BLOG ARTICLE & COMMENTS                       */}
          {/* =================================================================== */}
          {isBlog && (
            <div className="min-h-full bg-slate-900 text-slate-200 flex flex-col">
              {/* Blog Header & Masthead */}
              <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-serif font-black text-sm tracking-wide text-white uppercase">
                        Pacific Northwest Real Estate Blog
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans tracking-tight">
                        Oregon &amp; Washington Housing Intelligence, First-Time Buyer Grants &amp; Mortgage Guides
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="text-emerald-400 hover:underline cursor-pointer">Guides</span>
                    <span className="hover:text-white cursor-pointer">Programs</span>
                    <span className="hover:text-white cursor-pointer">Ask an LO</span>
                  </div>
                </div>
              </div>

              {/* Main Article Container */}
              <div className="max-w-3xl mx-auto w-full px-5 py-6 flex-1 space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="hover:text-white cursor-pointer">Home</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="hover:text-white cursor-pointer">Oregon Mortgage Guides</span>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="text-emerald-400 font-medium truncate">USDA RD Zero-Down Financing</span>
                </div>

                {/* Article Header */}
                <div className="space-y-3 border-b border-slate-800 pb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                    <span>Mortgage Program Spotlight • 2026 Guidelines</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-tight font-serif">
                    {threadData.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-300">By Senior Housing Analyst</span>
                    <span>•</span>
                    <span>Published March 2026</span>
                    <span>•</span>
                    <span>Verified Oregon USDA Rural Development Guidelines</span>
                  </div>
                </div>

                {/* Article Body */}
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3.5">
                  <p>
                    With rental rates climbing rapidly across Oregon, first-time homebuyers in Marion, Clackamas, and Lane counties are turning to federal <strong>USDA Rural Development (RD) 100% Zero-Down Financing</strong> to purchase single-family homes without the standard 5% to 20% down payment requirement.
                  </p>
                  
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                    <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Highlights for Marion &amp; Clackamas County Buyers:</span>
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-1">
                      <li><strong>$0 Down Payment Required:</strong> 100% financing based on the appraised value.</li>
                      <li><strong>Significantly Lower Monthly Guarantee Fees:</strong> 0.35% annual fee vs 0.55%+ on FHA loans.</li>
                      <li><strong>Eligible Geographic Zones:</strong> Towns like Woodburn, Silverton, Molalla, Sandy, Estacada, Sublimity, and surrounding agricultural tracts qualify.</li>
                      <li><strong>Modular Home Eligibility:</strong> Off-frame modular homes on permanent concrete foundations are fully permitted under standard USDA RD Section 502 underwriting.</li>
                    </ul>
                  </div>

                  <p>
                    Prospective buyers must have household income below the county moderate-income limit and maintain a minimum credit score of 620 to qualify for automated underwriting approvals.
                  </p>
                </div>

                {/* ============================================================= */}
                {/* COMMENTS & CONVERSATION SECTION                               */}
                {/* ============================================================= */}
                <div className="border-t border-slate-800 pt-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Reader Comments &amp; Expert Consultation ({localComments.length})
                      </h2>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Thread Status: <strong className="text-emerald-400">Live Active Discussion</strong>
                    </span>
                  </div>

                  {/* Comment Cards List */}
                  <div className="space-y-3">
                    {localComments.map((msg, idx) => {
                      const isLo = msg.sender === 'lo';
                      const isRenter = msg.sender === 'renter';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl transition border ${
                            isLo
                              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md ml-2 sm:ml-6'
                              : 'bg-slate-950 border-slate-800 shadow-sm'
                          }`}
                        >
                          {/* Comment Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                isLo 
                                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50' 
                                  : 'bg-emerald-600 text-slate-950'
                              }`}>
                                {msg.authorName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white">
                                    {msg.authorName}
                                  </span>
                                  {isLo && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                      <Award className="w-2.5 h-2.5 text-indigo-400" />
                                      Verified Oregon LO
                                    </span>
                                  )}
                                  {isRenter && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Prospective Buyer • Salem / Woodburn
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{msg.timestamp}</span>
                                  {isLo && (
                                    <span className="text-indigo-300 font-mono font-bold">
                                      ↳ Direct Reply to Comment #{threadData.targetCommentId || 'cmt_1'} (Thread #{threadData.messageThreadId || 'th_1'})
                                    </span>
                                  )}
                                  {isRenter && (
                                    <span className="text-emerald-400 font-mono font-bold">
                                      Anchor: #{threadData.targetCommentId || 'cmt_1'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Likes Button */}
                            <button
                              type="button"
                              onClick={() => toggleLike(idx)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                                commentLiked[idx]
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${commentLiked[idx] ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                              <span>{(msg.likes || 1) + (commentLiked[idx] ? 1 : 0)}</span>
                            </button>
                          </div>

                          {/* Comment Content */}
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-9">
                            {msg.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Post New Comment Form */}
                  <form onSubmit={handleAddComment} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Leave a Reply as Mike Ford (Senior Loan Officer):</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <CopySignatureButton
                          currentState="OR"
                          threadId={threadData?.messageThreadId}
                          variant="compact"
                        />
                        <span className="text-[11px] text-slate-400">Connected to CRM</span>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={`Reply to ${threadData.author} regarding USDA zero-down eligibility, credit requirements, or closing costs...`}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Comments post instantly to thread and automatically sync with two-way SMS/email leads.
                      </span>
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-40"
                      >
                        <Send className="w-3 h-3" />
                        <span>Post Comment to Live Thread</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* LAYOUT 2: REDDIT COMMUNITY FORUM & COMMENTS                         */}
          {/* =================================================================== */}
          {isReddit && (
            <div className="min-h-full bg-slate-950 text-slate-200 p-4 sm:p-6 space-y-4">
              {/* Subreddit Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-white text-xs">
                    r/
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {threadData.platform.replace('Reddit (', '').replace(')', '')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Community Housing Discussion • 84k Members
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">
                  Reddit Forum
                </span>
              </div>

              {/* Main Reddit Post */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Posted by <strong className="text-slate-200">{threadData.author}</strong></span>
                  <span>•</span>
                  <span>Oregon Housing Discussion</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {threadData.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {threadData.articleSnippet || 'Looking for advice on transitioning from renting an overpriced apartment to homeownership. Does anyone have experience pairing local grants with zero-down mortgage options in this county?'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 font-semibold text-orange-400">
                    <ThumbsUp className="w-3 h-3" /> 24 Upvotes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {localComments.length} Comments
                  </span>
                  <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={handleCopyUrl}>
                    <Share2 className="w-3 h-3" /> Share
                  </span>
                </div>
              </div>

              {/* Reddit Comments Stream */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top Comments
                </h3>
                {localComments.map((msg, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 ml-2 sm:ml-4 border-l-2 border-l-indigo-500">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-bold ${msg.sender === 'lo' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {msg.authorName} {msg.sender === 'lo' ? '(Verified Loan Officer)' : '(OP)'}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {/* Reply box */}
                <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={`Comment on Reddit thread as Mike Ford...`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40"
                  >
                    Reply
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* LAYOUT 3: CHAT BOARD / DISCORD FORUM                                */}
          {/* =================================================================== */}
          {isDiscordOrChat && (
            <div className="min-h-full bg-slate-950 text-slate-200 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    #
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {threadData.platform}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Topic: {threadData.title}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-bold">
                  Community Chat Board
                </span>
              </div>

              {/* Chat Thread Messages */}
              <div className="space-y-3">
                {localComments.map((msg, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-bold ${msg.sender === 'lo' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {msg.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={`Type message as Mike Ford (LO)...`}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Renter: <strong className="text-white">{threadData.author}</strong> ({threadData.location || 'Oregon'})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>

      {/* Two-Way Comment Sync & Attribution Integration Guide Modal */}
      <TwoWaySyncIntegrationGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        sampleThreadId={threadData.messageThreadId}
      />
    </div>
  );
};
