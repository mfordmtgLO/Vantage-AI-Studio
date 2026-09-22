/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • PROFILE CARDS ADMIN PORTAL
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Secured Admin Portal for Loan Officer & Real Estate Agent Profile Cards Sync
 * Synced with First-Time Homebuyer AI Studio & Cloud Run Backend
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  RefreshCw,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Database,
  Server,
  Key,
  Layers,
  Trash2,
  Edit,
  Sliders,
  Check
} from 'lucide-react';
import ProfileCardSyncService, {
  LoanOfficerProfileCard,
  AgentProfileCard
} from '../services/profileCardSyncService';
import { useAccountPathway } from '../context/AccountPathwayContext';

export const ProfileCardsAdminPortal: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'los' | 'agents' | 'sync_spec'>('los');
  const [loanOfficers, setLoanOfficers] = useState<LoanOfficerProfileCard[]>([]);
  const [agents, setAgents] = useState<AgentProfileCard[]>([]);
  const [isSyncingLos, setIsSyncingLos] = useState(false);
  const [isSyncingAgents, setIsSyncingAgents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Modal State for Adding New Profile Card
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCardType, setAddCardType] = useState<'lo' | 'agent'>('lo');
  const [newCardName, setNewCardName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState(''); // NMLS or License
  const [newCardCompany, setNewCardCompany] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardEmail, setNewCardEmail] = useState('');
  const [newCardPhone, setNewCardPhone] = useState('');
  const [newCardState, setNewCardState] = useState('OR');

  const { pathway, connectedWorkspaceEmail } = useAccountPathway();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoanOfficers(ProfileCardSyncService.getLoanOfficers());
    setAgents(ProfileCardSyncService.getAgents());
  };

  const handleSyncLos = async () => {
    setIsSyncingLos(true);
    try {
      const res = await ProfileCardSyncService.syncLoanOfficersFromCloudRun();
      setLoanOfficers(res.profiles);
      setSyncNotice(`Successfully synced ${res.count} Loan Officer profile cards from First-Time Homebuyer Cloud Run backend!`);
      setTimeout(() => setSyncNotice(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingLos(false);
    }
  };

  const handleSyncAgents = async () => {
    setIsSyncingAgents(true);
    try {
      const res = await ProfileCardSyncService.syncAgentsFromCloudRun();
      setAgents(res.profiles);
      setSyncNotice(`Successfully synced ${res.count} Agent profile cards from First-Time Homebuyer Cloud Run backend!`);
      setTimeout(() => setSyncNotice(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingAgents(false);
    }
  };

  const handleDeleteLo = (id: string) => {
    if (confirm('Are you sure you want to remove this Loan Officer profile card?')) {
      const updated = ProfileCardSyncService.deleteLoanOfficer(id);
      setLoanOfficers(updated);
    }
  };

  const handleDeleteAgent = (id: string) => {
    if (confirm('Are you sure you want to remove this Agent profile card?')) {
      const updated = ProfileCardSyncService.deleteAgent(id);
      setAgents(updated);
    }
  };

  const handleCreateProfileCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName || !newCardEmail) return;

    if (addCardType === 'lo') {
      const newLo: LoanOfficerProfileCard = {
        id: `lo-custom-${Date.now()}`,
        name: newCardName,
        nmlsNumber: newCardNumber || 'N/A',
        company: newCardCompany || 'Vantage Home Loans',
        title: newCardTitle || 'Mortgage Loan Officer',
        email: newCardEmail,
        phone: newCardPhone || '+1 (503) 555-0100',
        specialties: ['USDA 100%', 'Lakeview DPA', 'Fannie Mae HomeReady'],
        primaryState: newCardState,
        status: 'Verified',
        rating: 5.0,
        activePreapprovalsCount: 5,
        lastSyncedAt: new Date().toISOString(),
        syncedFromApp: 'Mike Ford Admin Manual Ingest'
      };
      const updated = ProfileCardSyncService.saveLoanOfficer(newLo);
      setLoanOfficers(updated);
    } else {
      const newAgent: AgentProfileCard = {
        id: `agent-custom-${Date.now()}`,
        name: newCardName,
        licenseNumber: newCardNumber || 'N/A',
        brokerage: newCardCompany || 'Premier Real Estate',
        title: newCardTitle || 'Realtor® / Buyer Specialist',
        email: newCardEmail,
        phone: newCardPhone || '+1 (503) 555-0100',
        targetMarkets: ['Portland Metro', 'Beaverton', 'Hillsboro'],
        primaryState: newCardState,
        status: 'Verified',
        activeListingsCount: 3,
        lastSyncedAt: new Date().toISOString(),
        syncedFromApp: 'Mike Ford Admin Manual Ingest'
      };
      const updated = ProfileCardSyncService.saveAgent(newAgent);
      setAgents(updated);
    }

    setShowAddModal(false);
    setNewCardName('');
    setNewCardNumber('');
    setNewCardCompany('');
    setNewCardTitle('');
    setNewCardEmail('');
    setNewCardPhone('');
  };

  const filteredLos = loanOfficers.filter(
    (lo) =>
      lo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lo.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lo.nmlsNumber.includes(searchQuery) ||
      lo.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = agents.filter(
    (ag) =>
      ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.brokerage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.licenseNumber.includes(searchQuery) ||
      ag.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 antialiased text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Profile Cards Admin Portal
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
              Mike Ford Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Import, synchronize, and manage saved Loan Officer & Realtor/Agent profile cards from your First-Time Homebuyer AI Studio Cloud Run backend dashboard.
          </p>
        </div>

        {/* Sync Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncLos}
            disabled={isSyncingLos}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLos ? 'animate-spin' : ''}`} />
            <span>{isSyncingLos ? 'Syncing LOs...' : 'Sync LOs'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAgents}
            disabled={isSyncingAgents}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAgents ? 'animate-spin' : ''}`} />
            <span>{isSyncingAgents ? 'Syncing Agents...' : 'Sync Agents'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Sync Success Notification Toast */}
      {syncNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Sub Navigation Bar & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('los')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'los'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span>Loan Officers ({loanOfficers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('agents')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'agents'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Realtors & Agents ({agents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sync_spec')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'sync_spec'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Studio Sync Architecture Spec</span>
          </button>
        </div>

        {activeSubTab !== 'sync_spec' && (
          <div className="relative shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, NMLS, license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        )}
      </div>

      {/* SUB-TAB 1: LOAN OFFICERS */}
      {activeSubTab === 'los' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLos.map((lo) => (
            <div
              key={lo.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-4 space-y-3 shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      {lo.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white tracking-wide">{lo.name}</h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400">{lo.title}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLo(lo.id)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">NMLS ID:</span>
                    <span className="font-bold text-blue-300">#{lo.nmlsNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-bold text-slate-200 text-right truncate max-w-[150px]">{lo.company}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">State / Region:</span>
                    <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 font-bold">
                      {lo.primaryState}
                    </span>
                  </div>
                </div>

                {/* Specialties Badges */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">DPA & Loan Specialties:</span>
                  <div className="flex flex-wrap gap-1">
                    {lo.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[10px] font-bold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Paired Realtor/Agent Connectivity Section */}
                <div className="pt-2.5 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      Paired Agent Partners ({lo.pairedAgents?.length || 0}):
                    </span>
                  </div>
                  {lo.pairedAgents && lo.pairedAgents.length > 0 ? (
                    <div className="space-y-1">
                      {lo.pairedAgents.map((pa) => (
                        <div
                          key={pa.agentId}
                          className="bg-slate-950 p-2 rounded-xl border border-emerald-900/50 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-[11px] font-bold text-white truncate">{pa.agentName}</p>
                              <p className="text-[9px] text-slate-400 truncate">{pa.agentBrokerage}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[9px] font-bold">
                              {pa.pairingStatus}
                            </span>
                            <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                              {pa.coBrandedListingsCount} co-listings
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No paired agents currently assigned.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href={`mailto:${lo.email}`}
                    className="text-slate-300 hover:text-blue-400 flex items-center gap-1 transition"
                  >
                    <Mail className="w-3 h-3 text-blue-400" />
                    <span className="truncate max-w-[140px]">{lo.email}</span>
                  </a>
                  <a
                    href={`tel:${lo.phone}`}
                    className="text-slate-300 hover:text-blue-400 flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{lo.phone}</span>
                  </a>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Preapprovals: {lo.activePreapprovalsCount}</span>
                  <span>Synced: {new Date(lo.lastSyncedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: REALTORS & AGENTS */}
      {activeSubTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-4 space-y-3 shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white tracking-wide">{agent.name}</h3>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400">{agent.title}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">License #:</span>
                    <span className="font-bold text-emerald-300">{agent.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Brokerage:</span>
                    <span className="font-bold text-slate-200 text-right truncate max-w-[150px]">{agent.brokerage}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">State:</span>
                    <span className="px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300 font-bold">
                      {agent.primaryState}
                    </span>
                  </div>
                </div>

                {/* Target Markets */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase mb-1">Target Markets:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.targetMarkets.map((mkt, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold"
                      >
                        {mkt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Paired Loan Officer Connectivity Section */}
                <div className="pt-2.5 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      Paired Loan Officers ({agent.pairedLoanOfficers?.length || 0}):
                    </span>
                  </div>
                  {agent.pairedLoanOfficers && agent.pairedLoanOfficers.length > 0 ? (
                    <div className="space-y-1">
                      {agent.pairedLoanOfficers.map((pLo) => (
                        <div
                          key={pLo.loId}
                          className="bg-slate-950 p-2 rounded-xl border border-blue-900/50 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-[11px] font-bold text-white truncate">{pLo.loName}</p>
                              <p className="text-[9px] text-slate-400 truncate">{pLo.loCompany}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/80 text-[9px] font-bold">
                              {pLo.pairingStatus}
                            </span>
                            <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                              {pLo.pairedPreapprovalsCount} preapprovals
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No paired loan officers currently assigned.</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <a
                    href={`mailto:${agent.email}`}
                    className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span className="truncate max-w-[140px]">{agent.email}</span>
                  </a>
                  <a
                    href={`tel:${agent.phone}`}
                    className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{agent.phone}</span>
                  </a>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Listings: {agent.activeListingsCount}</span>
                  <span>Synced: {new Date(agent.lastSyncedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: AI STUDIO CLOUD RUN SYNC ARCHITECTURE SPEC */}
      {activeSubTab === 'sync_spec' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                How AI Studio Accomplishes Real-Time Cross-App Sync
              </h3>
            </div>
            <p className="text-slate-400">
              Technical specifications for syncing profile cards between First-Time Homebuyer AI Studio Cloud Run app and Vantage AI Workspace Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strategy 1 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-900/50 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Database className="w-4 h-4 text-purple-400" />
                <span>1. Shared Firestore Project ID (0 Overhead)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Both apps run on Google Cloud Run and reference the exact same Firebase Firestore database ID: <code className="text-purple-300">ai-studio-vantageaiworkspa-320759cc-ded2-4188-b4e0-ed887f4ad5bd</code>.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400">
                Collections:<br />
                • /loan_officers/{'{loId}'}<br />
                • /realtor_agents/{'{agentId}'}
              </div>
            </div>

            {/* Strategy 2 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-blue-900/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                <Key className="w-4 h-4 text-blue-400" />
                <span>2. Cloud Run REST API Integration</span>
              </div>
              <p className="text-[11px] text-slate-300">
                The First-Time Homebuyer app exports CORS-enabled REST endpoints on Cloud Run: <code className="text-blue-300">GET /api/v1/sync/los</code> and <code className="text-blue-300">GET /api/v1/sync/agents</code>.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400">
                Security:<br />
                • Authorization: Bearer {'<GOOGLE_ID_TOKEN>'}<br />
                • X-Admin-Email: fordmj@gmail.com
              </div>
            </div>

            {/* Strategy 3 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-900/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>3. Google Workspace AccountPathway Sync</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Utilizes the connected Google Workspace or Google Apps OAuth account context to automatically vectorize contact lists and directory cards into the 2nd Brain memory graph.
              </p>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400">
                Status: {pathway === 'workspace' ? `Workspace (${connectedWorkspaceEmail})` : 'Google Apps Free Account'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROFILE CARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl relative text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Add Profile Card Manually
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProfileCard} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddCardType('lo')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                    addCardType === 'lo'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Loan Officer Card
                </button>
                <button
                  type="button"
                  onClick={() => setAddCardType('agent')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                    addCardType === 'agent'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Realtor / Agent Card
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mike Ford"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  {addCardType === 'lo' ? 'NMLS #' : 'Real Estate License #'}
                </label>
                <input
                  type="text"
                  placeholder={addCardType === 'lo' ? '288455' : 'OR-201283941'}
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Company / Brokerage</label>
                  <input
                    type="text"
                    placeholder="Vantage Home Loans"
                    value={newCardCompany}
                    onChange={(e) => setNewCardCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Managing Loan Officer"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="fordmj@gmail.com"
                    value={newCardEmail}
                    onChange={(e) => setNewCardEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (503) 555-0100"
                    value={newCardPhone}
                    onChange={(e) => setNewCardPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg"
              >
                Save Profile Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCardsAdminPortal;
