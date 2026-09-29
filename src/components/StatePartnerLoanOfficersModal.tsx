/**
 * @file StatePartnerLoanOfficersModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Peer Loan Officer Directory & State Partner Manager Modal
 * Allows Mike Ford to configure, edit, and manage licensed peer colleagues
 * at Churchill Mortgage across all 50 states for automated out-of-state referrals.
 * Syncs directly with First-Time Homebuyers AI Studio Google sign-in backend.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  FileText,
  Building,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRight,
  Award
} from 'lucide-react';
import {
  PeerLoanOfficer,
  PeerLoanOfficersService,
  DEFAULT_PEER_LO_ROSTER
} from '../services/peerLoanOfficersService';
import { US_STATES } from '../data/usStatesAndCounties';

interface StatePartnerLoanOfficersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedState?: string;
  onPartnerSaved?: (updatedDirectory: Record<string, PeerLoanOfficer>) => void;
}

export const StatePartnerLoanOfficersModal: React.FC<StatePartnerLoanOfficersModalProps> = ({
  isOpen,
  onClose,
  initialSelectedState = 'WA',
  onPartnerSaved
}) => {
  const [directory, setDirectory] = useState<Record<string, PeerLoanOfficer>>(() => PeerLoanOfficersService.getDirectory());
  const [allSyncedPeers, setAllSyncedPeers] = useState<PeerLoanOfficer[]>(() => PeerLoanOfficersService.getAllPeerLoanOfficers());
  const [selectedState, setSelectedState] = useState<string>(initialSelectedState.toUpperCase());
  const [searchFilter, setSearchFilter] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'assignment_editor' | 'roster_gallery'>('assignment_editor');

  // Active form state for the selected state
  const [activePartner, setActivePartner] = useState<PeerLoanOfficer>(() => {
    return PeerLoanOfficersService.getPeerForState(initialSelectedState);
  });

  useEffect(() => {
    if (isOpen) {
      const current = PeerLoanOfficersService.getDirectory();
      const peers = PeerLoanOfficersService.getAllPeerLoanOfficers();
      setDirectory(current);
      setAllSyncedPeers(peers);
      const st = (initialSelectedState || 'WA').toUpperCase();
      setSelectedState(st);
      setActivePartner(PeerLoanOfficersService.getPeerForState(st));
      setSaveSuccessMsg(null);
      setCopySuccessMsg(null);
    }
  }, [isOpen, initialSelectedState]);

  useEffect(() => {
    setActivePartner(PeerLoanOfficersService.getPeerForState(selectedState));
  }, [selectedState]);

  if (!isOpen) return null;

  const handleStateSelect = (code: string) => {
    setSelectedState(code);
    const existing = PeerLoanOfficersService.getPeerForState(code);
    setActivePartner(existing);
  };

  const handleSyncPeerCardsFromHomebuyers = async () => {
    setIsSyncing(true);
    setSaveSuccessMsg(null);
    try {
      const res = await PeerLoanOfficersService.syncFromFirstTimeHomebuyerDashboard();
      const updatedDir = PeerLoanOfficersService.getDirectory();
      const updatedPeers = PeerLoanOfficersService.getAllPeerLoanOfficers();
      setDirectory(updatedDir);
      setAllSyncedPeers(updatedPeers);
      setActivePartner(PeerLoanOfficersService.getPeerForState(selectedState));
      if (onPartnerSaved) {
        onPartnerSaved(updatedDir);
      }
      setSaveSuccessMsg(`✓ Synced ${res.count} Peer LO Cards from First-Time Homebuyers Backend! Roster updated & ready.`);
      setTimeout(() => setSaveSuccessMsg(null), 4500);
    } catch (e) {
      console.error('Error syncing peer LO cards:', e);
      setSaveSuccessMsg('⚠️ Sync completed with cached offline profiles.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPeerFromSyncedRoster = (peerId: string) => {
    if (!peerId) return;
    const assigned = PeerLoanOfficersService.assignPeerToState(selectedState, peerId);
    if (assigned) {
      setActivePartner(assigned);
      const updatedDir = PeerLoanOfficersService.getDirectory();
      setDirectory(updatedDir);
      if (onPartnerSaved) {
        onPartnerSaved(updatedDir);
      }
      setSaveSuccessMsg(`✓ Assigned ${assigned.name} to ${selectedState}!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleSavePartner = async () => {
    await PeerLoanOfficersService.savePeerLoanOfficer(activePartner);
    const updated = PeerLoanOfficersService.getDirectory();
    setDirectory(updated);
    setAllSyncedPeers(PeerLoanOfficersService.getAllPeerLoanOfficers());
    if (onPartnerSaved) {
      onPartnerSaved(updated);
    }
    setSaveSuccessMsg(`✓ Saved ${activePartner.name} as licensed lending partner for ${selectedState}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleResetToDefault = () => {
    if (DEFAULT_PEER_LO_ROSTER[selectedState]) {
      setActivePartner(DEFAULT_PEER_LO_ROSTER[selectedState]);
    } else {
      setActivePartner(PeerLoanOfficersService.getPeerForState(selectedState));
    }
  };

  const sampleDraft = PeerLoanOfficersService.formatOutOfStateReferralDraft(
    'u/BoiseHomebuyer',
    `Boise, ${selectedState}`,
    selectedState,
    activePartner
  );

  const handleCopySampleDraft = () => {
    navigator.clipboard.writeText(sampleDraft);
    setCopySuccessMsg('✓ Copied sample outreach draft to clipboard!');
    setTimeout(() => setCopySuccessMsg(null), 2500);
  };

  // Filter states
  const filteredStates = US_STATES.filter(st => {
    if (st.code === 'OR') return false; // Mike is personally licensed in OR
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const partner = directory[st.code];
    return (
      st.code.toLowerCase().includes(q) ||
      st.name.toLowerCase().includes(q) ||
      (partner && partner.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
        
        {/* Header with Direct Sync Button */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-emerald-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  State Licensed Peer Loan Officer Directory
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider">
                  SAFE Act Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically injects your peer colleague's verified NMLS credentials, cell numbers, and personal loan application links into out-of-state discovery replies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Peer LO Cards Button */}
            <button
              type="button"
              onClick={handleSyncPeerCardsFromHomebuyers}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-purple-600/25 border border-purple-400/40 disabled:opacity-50"
              title="Import all Peer LO profile cards saved inside the First-time Homebuyer Google login backend dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Profile Cards...' : '🔄 Sync Peer LO Cards'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Sync Notification Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-5 py-2.5 text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Body: 2-Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left Column: State Selector & Search (4 Cols) */}
          <div className="md:col-span-4 border-r border-slate-800 flex flex-col min-h-0 bg-slate-950/50">
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search state or colleague..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 placeholder-slate-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Select Target State:</span>
                <span className="font-mono text-purple-400">{filteredStates.length} States</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredStates.map(st => {
                const isSelected = selectedState === st.code;
                const partner = directory[st.code];
                return (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => handleStateSelect(st.code)}
                    className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-purple-600/20 border border-purple-500/60 text-white shadow-sm'
                        : 'bg-slate-900/40 hover:bg-slate-800/80 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/30">
                          {st.code}
                        </span>
                        <span className="font-bold text-xs truncate text-slate-200">{st.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {partner ? `👤 ${partner.name}` : '⚙️ Default Specialist'}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active State Assignment & Synced LO Picker (8 Cols) */}
          <div className="md:col-span-8 flex flex-col min-h-0 overflow-y-auto p-5 space-y-5 bg-slate-900">
            
            {/* Active Partner Banner with Mode Switcher */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-sm text-purple-300">
                    {selectedState}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">
                        Licensed Specialist for {selectedState} ({US_STATES.find(s => s.code === selectedState)?.name || selectedState})
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                        Active Route
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Currently assigned: <strong className="text-purple-300">{activePartner.name}</strong> • {activePartner.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'assignment_editor' ? 'roster_gallery' : 'assignment_editor')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeTab === 'assignment_editor' ? `Browse All Cards (${allSyncedPeers.length})` : 'Edit Current Details'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition px-2 py-1"
                    title="Reset to default company peer for this state"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Quick Peer LO Dropdown Selector */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-xs font-bold text-amber-300 shrink-0 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose from Synced Peer LO Cards:</span>
                </label>
                <div className="relative flex-1">
                  <select
                    value={activePartner.id}
                    onChange={(e) => handleSelectPeerFromSyncedRoster(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border-2 border-amber-500/40 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
                  >
                    <option value="" disabled>-- Select a peer LO imported from First-Time Homebuyers --</option>
                    {allSyncedPeers.map(peer => (
                      <option key={peer.id} value={peer.id}>
                        {peer.name} • {peer.title} ({peer.company}) - NMLS #{peer.nmlsNumber}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* TAB 1: Detail & Override Editor */}
            {activeTab === 'assignment_editor' && (
              <>
                {/* Partner Details Inputs */}
                <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-400" />
                      <span>Colleague Profile &amp; Contact Credentials</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Synced from First-Time Homebuyer Google Auth Dashboard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Loan Officer Legal Name</label>
                      <input
                        type="text"
                        value={activePartner.name}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* NMLS */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">State / Federal NMLS #</label>
                      <input
                        type="text"
                        value={activePartner.nmlsNumber}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, nmlsNumber: e.target.value }))}
                        placeholder="e.g. 184920"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Cell Phone */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Direct Cell / Text Number</span>
                      </label>
                      <input
                        type="text"
                        value={activePartner.phone}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. (206) 555-0192"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-rose-400" />
                        <span>Work Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={activePartner.email}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. sjenkins@cfmtg.com"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Company & Title */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Company &amp; Branch City</label>
                      <input
                        type="text"
                        value={activePartner.branchLocation}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, branchLocation: e.target.value }))}
                        placeholder="e.g. Seattle / Bellevue Branch, WA"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Local DPA Program */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Key State / County DPA Program</label>
                      <input
                        type="text"
                        value={activePartner.localDpaProgram || ''}
                        onChange={(e) => setActivePartner(prev => ({ ...prev, localDpaProgram: e.target.value }))}
                        placeholder="e.g. WSHFC Down Payment Assistance"
                        className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Specific Loan Application URL */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-amber-400" />
                        <span>Their Personal Secure Digital Loan Application Link</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">e.g. https://cfmtg.com/username/</span>
                    </label>
                    <input
                      type="url"
                      value={activePartner.applicationUrl}
                      onChange={(e) => setActivePartner(prev => ({ ...prev, applicationUrl: e.target.value }))}
                      placeholder="https://cfmtg.com/partnername/"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border-2 border-amber-500/40 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Default State Checkbox */}
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={PeerLoanOfficersService.isDefaultPeerForState(activePartner.id, selectedState)}
                        onChange={(e) => {
                          const updated = PeerLoanOfficersService.setDefaultPeerForState(selectedState, activePartner.id, e.target.checked);
                          if (updated) {
                            setActivePartner(updated);
                            const updatedDir = PeerLoanOfficersService.getDirectory();
                            setDirectory(updatedDir);
                            setAllSyncedPeers(PeerLoanOfficersService.getAllPeerLoanOfficers());
                            if (onPartnerSaved) onPartnerSaved(updatedDir);
                            setSaveSuccessMsg(e.target.checked
                              ? `✓ Set ${activePartner.name} as automatic DEFAULT Peer LO for ${selectedState}!`
                              : `✓ Removed ${activePartner.name} as default for ${selectedState}.`);
                            setTimeout(() => setSaveSuccessMsg(null), 3500);
                          }
                        }}
                        className="mt-0.5 w-4 h-4 rounded border-purple-500 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Set as Default Peer LO for {selectedState}
                          </span>
                          {PeerLoanOfficersService.isDefaultPeerForState(activePartner.id, selectedState) && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40 font-bold">
                              ⭐ Active Default
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Auto response chat threads, draft Gmail templates, and SMS outreach will automatically auto-populate with {activePartner.name}&apos;s contact info and portal link for all {selectedState} leads.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Live Preview of the Dynamic Outreach Draft */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Outreach Preview for {selectedState} Leads</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySampleDraft}
                      className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer transition font-bold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Draft</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto shadow-inner">
                    {sampleDraft}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Synced Roster Gallery */}
            {activeTab === 'roster_gallery' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      All Synced Peer Profile Cards ({allSyncedPeers.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Imported from First-Time Homebuyers AI Studio backend. Click &ldquo;Assign to {selectedState}&rdquo; to set as the active partner.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncPeerCardsFromHomebuyers}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Re-Sync Cards</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {allSyncedPeers.map(peer => {
                    const isCurrentlyAssigned = activePartner.id === peer.id;
                    return (
                      <div
                        key={peer.id}
                        className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                          isCurrentlyAssigned
                            ? 'bg-purple-950/40 border-purple-500 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-white text-sm truncate">{peer.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {PeerLoanOfficersService.isDefaultPeerForState(peer.id, selectedState) && (
                                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40">
                                  ⭐ Default for {selectedState}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
                                NMLS #{peer.nmlsNumber}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-300 font-medium">
                            {peer.title} • {peer.company}
                          </div>

                          <div className="text-[11px] text-slate-400 flex flex-col gap-0.5">
                            <span>📱 {peer.phone}</span>
                            <span>✉️ {peer.email}</span>
                            <span className="truncate text-amber-300 font-mono">📝 {peer.applicationUrl}</span>
                          </div>

                          {peer.licensedStates && peer.licensedStates.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-1">
                              <span className="text-[10px] text-slate-400">States:</span>
                              {peer.licensedStates.map(st => (
                                <span key={st} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-200">
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-300">
                            <input
                              type="checkbox"
                              checked={PeerLoanOfficersService.isDefaultPeerForState(peer.id, selectedState)}
                              onChange={(e) => {
                                PeerLoanOfficersService.setDefaultPeerForState(selectedState, peer.id, e.target.checked);
                                const updatedDir = PeerLoanOfficersService.getDirectory();
                                setDirectory(updatedDir);
                                setAllSyncedPeers(PeerLoanOfficersService.getAllPeerLoanOfficers());
                                setActivePartner(PeerLoanOfficersService.getPeerForState(selectedState));
                                if (onPartnerSaved) onPartnerSaved(updatedDir);
                                setSaveSuccessMsg(e.target.checked
                                  ? `✓ Set ${peer.name} as automatic DEFAULT for ${selectedState}!`
                                  : `✓ Removed default status for ${selectedState}.`);
                                setTimeout(() => setSaveSuccessMsg(null), 3500);
                              }}
                              className="w-3.5 h-3.5 rounded border-purple-500 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span>Default for {selectedState}</span>
                          </label>

                          {isCurrentlyAssigned ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Active Specialist</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectPeerFromSyncedRoster(peer.id);
                                setActiveTab('assignment_editor');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <span>Select for {selectedState}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Copy Notification */}
            {copySuccessMsg && (
              <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{copySuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            Selected: <strong className="text-white">{activePartner.name}</strong> • Licensed in <span className="font-mono text-purple-300">{selectedState}</span>
            <span className="ml-2 text-slate-400 font-mono">({allSyncedPeers.length} Peer Cards Synced)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleSavePartner}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save {selectedState} Partner Settings</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
