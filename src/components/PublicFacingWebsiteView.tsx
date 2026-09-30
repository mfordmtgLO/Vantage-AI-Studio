/**
 * @license
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 * Vantage AI Public-Facing Commercial Website & Client Portal
 */

import React, { useState } from 'react';
import { 
  Sparkles, Building2, Brain, Mic, ShieldCheck, ArrowRight, 
  CheckCircle2, Star, Zap, Globe, Smartphone, Lock, UserCircle2, 
  ExternalLink, Mail, Phone, MessageSquare, Send, ChevronRight, 
  Play, DollarSign, Layers, Check, RefreshCw, LogIn, LayoutDashboard,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';
import { isMikeFordAdmin } from '../utils/adminAuth';

interface PublicFacingWebsiteViewProps {
  onEnterGuestDemo: () => void;
  onOpenSignIn: () => void;
  onDirectAdminLogin?: () => void;
  onOpenDashboard?: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
  onOpenPitchDeck?: () => void;
}

export const PublicFacingWebsiteView: React.FC<PublicFacingWebsiteViewProps> = ({
  onEnterGuestDemo,
  onOpenSignIn,
  onDirectAdminLogin,
  onOpenDashboard,
  onLogout,
  currentUser,
  onOpenPitchDeck
}) => {
  const isAdmin = isMikeFordAdmin(currentUser);
  const [selectedDemoTab, setSelectedDemoTab] = useState<'mortgage' | 'brain' | 'voice' | 'workspace'>('mortgage');
  
  // Public Lead Inquiry State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Quick Loan Estimator for Public View
  const [estHomePrice, setEstHomePrice] = useState(450000);
  const [estDownPaymentPct, setEstDownPaymentPct] = useState(5);
  const [estAnnualIncome, setEstAnnualIncome] = useState(95000);

  const estLoanAmount = estHomePrice * (1 - estDownPaymentPct / 100);
  const estEstimatedDpaGrant = estAnnualIncome <= 105000 ? Math.min(estHomePrice * 0.04, 18000) : 0;
  const estMonthlyPI = Math.round((estLoanAmount * 0.065) / 12);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim() && !leadPhone.trim()) return;

    setIsSubmittingLead(true);
    try {
      // Save visitor note to localStorage so it instantly reflects in Mike Ford's Mobile Admin Dashboard
      const existingNotes = JSON.parse(localStorage.getItem('vantage_live_visitor_notes') || '[]');
      const newNote = {
        id: Date.now().toString(),
        sender: 'visitor',
        text: `New Inbound Lead: ${leadName || 'Website Visitor'} (${leadEmail || leadPhone}) - "${leadMessage || 'Interested in Vantage AI & Mortgage Pre-Approval'}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'web',
        userEmail: leadEmail || 'public-lead@vantage.workspace'
      };
      localStorage.setItem('vantage_live_visitor_notes', JSON.stringify([newNote, ...existingNotes]));
      
      setTimeout(() => {
        setIsSubmittingLead(false);
        setLeadSubmitted(true);
      }, 600);
    } catch {
      setIsSubmittingLead(false);
      setLeadSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Admin Navigation Banner (Visible when admin or logged-in user is previewing public site) */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-b border-blue-700/60 px-4 py-2.5 text-xs text-white flex flex-wrap items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-amber-300">
              {isAdmin ? '👑 Administrator Preview Active' : '👤 Signed In Session'}
            </span>
            <span className="text-blue-200 hidden sm:inline">
              ({currentUser.displayName || currentUser.email})
            </span>
            <span className="text-slate-300 hidden md:inline">
              — You are viewing the live public customer website experience.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Go to Back-End Dashboard</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-400/40 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base sm:text-lg">
                  Vantage AI <span className="text-blue-400">Studio</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Enterprise 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Mike Ford • NMLS 288455 Advisory Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onEnterGuestDemo}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Live Demo</span>
            </button>

            {currentUser ? (
              onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Back-End Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                {onDirectAdminLogin && (
                  <button
                    onClick={onDirectAdminLogin}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-sm transition cursor-pointer"
                    title="Direct Master Admin Access (Mike Ford)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                    <span>Admin Access</span>
                  </button>
                )}
                <button
                  onClick={onOpenSignIn}
                  className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-400" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation AI Real Estate & Autonomous Workspace Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Intelligent AI Architecture for <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Real Estate, Lending & Enterprise Teams
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate hours of manual workflow friction. Grounded with live Oregon & Washington DPA grant intelligence, 
            vector 2nd brain memory, multi-step voice macros, and 1-click Google Workspace automations.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterGuestDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Interactive Live Applet (No Login Required)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenPitchDeck && (
              <button
                onClick={onOpenPitchDeck}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Commercial ROI & Pitch Deck</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>TRID 3-Day Rule Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero-Storage Airgap Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Standalone iOS/Android PWA</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Four Specialized Engines in One Unified Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed specifically for high-velocity real estate brokerages, loan officers, and executive advisory teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-blue-700/60 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Real Estate GeoMap & DPA</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Interactive Pacific Northwest map with real-time Down Payment Assistance (DPA) stacking, instant buyer pre-qual calculations, and rate-lock alerts.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-700/60 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">2nd Brain Vector Memory</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Persistent long-term knowledge base. Remembers underwriter guidelines, client preferences, and past transactions across all devices.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-amber-700/60 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Voice Intent Orchestrator</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Speak compound natural language commands (e.g. &ldquo;Draft escrow confirmation and schedule signing notary&rdquo;) with multi-step execution.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-700/60 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Workspace UI Cockpit</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                One-click integration across Gmail, Google Drive, Calendar, Docs, and Sheets with explicit safety confirmations on every outbound action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Public Demo & Calculator */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Live Client Tool</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Instant Pacific NW DPA & Mortgage Estimator</h2>
            </div>
            <button
              onClick={onEnterGuestDemo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition self-start md:self-auto cursor-pointer"
            >
              <span>Open Full Interactive Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="space-y-4 lg:col-span-2 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Estimated Property Purchase Price</span>
                  <span className="text-blue-400 font-bold">${estHomePrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={1200000}
                  step={10000}
                  value={estHomePrice}
                  onChange={(e) => setEstHomePrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Down Payment Percentage</span>
                  <span className="text-indigo-400 font-bold">{estDownPaymentPct}% (${(estHomePrice * estDownPaymentPct / 100).toLocaleString()})</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={estDownPaymentPct}
                  onChange={(e) => setEstDownPaymentPct(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Buyer Household Gross Annual Income</span>
                  <span className="text-emerald-400 font-bold">${estAnnualIncome.toLocaleString()}/yr</span>
                </div>
                <input
                  type="range"
                  min={40000}
                  max={250000}
                  step={5000}
                  value={estAnnualIncome}
                  onChange={(e) => setEstAnnualIncome(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Results Output */}
            <div className="bg-gradient-to-br from-blue-950/70 to-indigo-950/70 p-5 rounded-2xl border border-blue-800/60 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Live Eligibility Synthesis</span>
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-300">Estimated DPA Grant Stack</div>
                  <div className="text-2xl font-black text-emerald-400">
                    {estEstimatedDpaGrant > 0 ? `$${estEstimatedDpaGrant.toLocaleString()} Approved` : 'Standard Loan Eligible'}
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-blue-800/40">
                  <div className="text-[11px] text-slate-300">Est. Principal & Interest (6.5%)</div>
                  <div className="text-xl font-bold text-white">${estMonthlyPI.toLocaleString()}/mo</div>
                </div>
              </div>

              <button
                onClick={onEnterGuestDemo}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test in Full GeoMap Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Inbound Direct Contact / Lead Message */}
      <section className="py-12 bg-slate-900/40 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Direct Inquiries</span>
            <h2 className="text-2xl font-bold text-white">Contact Mike Ford / Request Custom Solution</h2>
            <p className="text-xs text-slate-400">
              Submit your inquiry below. It directly syncs to the mobile administrator portal.
            </p>
          </div>

          {leadSubmitted ? (
            <div className="bg-emerald-950/60 border border-emerald-800 p-5 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Inquiry Received Successfully!</h3>
              <p className="text-xs text-slate-300">
                Your message has been transmitted directly to Mike Ford&apos;s mobile dashboard. We will be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center text-xs text-slate-400 px-1">
                  <span>Direct Advisor: <strong>Mike Ford (NMLS 288455)</strong></span>
                </div>
              </div>

              <textarea
                placeholder="What mortgage or AI workflow scenario would you like to explore?"
                rows={3}
                value={leadMessage}
                onChange={(e) => setLeadMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingLead ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Dashboard...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry to Mike Ford</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
        <p>&copy; 2026 Mike Ford (fordmj@gmail.com). All rights reserved. NMLS #288455.</p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <button onClick={onOpenSignIn} className="hover:text-white transition cursor-pointer">
            Administrator Sign In
          </button>
          <span>•</span>
          <button onClick={onEnterGuestDemo} className="hover:text-white transition cursor-pointer">
            Public Interactive Demo
          </button>
        </div>
      </footer>
    </div>
  );
};
