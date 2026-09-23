/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • REAL ESTATE LEAD CAPTURE FORM & AI 2ND BRAIN TRIAGE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Co-Branded LO+Agent Lead Capture with Automatic AI Domain Task Allocation
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Home,
  DollarSign,
  Shield,
  Award,
  CheckCircle2,
  Sliders,
  Settings,
  Copy,
  Check,
  ExternalLink,
  X,
  ChevronRight,
  AlertCircle,
  Building2,
  Users,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import {
  LeadCaptureFormData,
  LeadCaptureFormConfig,
  AiLeadTriageResult,
  DispatchedLeadRecord,
  LeadCaptureEmailService,
  DEFAULT_FORM_CONFIG
} from '../services/leadCaptureEmailService';
import { ProfileCardSyncService, LoanOfficerProfileCard, AgentProfileCard } from '../services/profileCardSyncService';

interface RealEstateLeadCaptureFormProps {
  property?: SyncedPropertyListing;
  initialNote?: string;
  onLeadCaptured?: (record: DispatchedLeadRecord) => void;
  onClose?: () => void;
  embedded?: boolean;
}

export const RealEstateLeadCaptureForm: React.FC<RealEstateLeadCaptureFormProps> = ({
  property,
  initialNote = '',
  onLeadCaptured,
  onClose,
  embedded = false
}) => {
  // Default property fallback if none selected
  const activeProperty: SyncedPropertyListing = property || {
    id: 'geo-101',
    formattedAddress: '742 SE Hawthorne Blvd, Portland, OR 97214',
    addressLine1: '742 SE Hawthorne Blvd',
    city: 'Portland',
    state: 'OR',
    zipCode: '97214',
    geoid: '41051001202',
    coordinates: { lat: 45.5121, lng: -122.6582 },
    price: 435000,
    daysOnMarket: 18,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1650,
    propertyType: 'Single Family',
    hoaMonthlyFee: 0,
    estimatedAnnualTax: 4200,
    estimatedAnnualInsurance: 1200,
    specialPrograms: {
      usdaRural100Financing: false,
      usdaRuralEligible: false,
      lmiCraGrantEligible: true,
      craGrantAmountUsd: 10000,
      fnmaHomeReady3Percent: true,
      fhlmcHomePossible3Percent: true,
      stateHfaFirstHomeEligible: true,
      lakeviewNationalDpaEligible: true,
      lakeviewGrantAmountUsd: 15400,
      ohcsFlexLendingFirstHomeEligible: true,
      ohcsGrantAmountUsd: 15400,
      targetedAreaGrantBonus: false
    },
    propertyNotes: ''
  };

  // Form Configuration State
  const [config, setConfig] = useState<LeadCaptureFormConfig>(() => LeadCaptureEmailService.loadConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // Visitor Form Fields State
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'phone' | 'text'>('email');
  const [timeframe, setTimeframe] = useState('Immediately (0-30 days)');
  const [preApprovalStatus, setPreApprovalStatus] = useState<'need_preapproval' | 'prequalified_elsewhere' | 'not_sure' | 'cash_buyer'>('need_preapproval');
  const [interestedInGrants, setInterestedInGrants] = useState(true);
  const [tourRequested, setTourRequested] = useState(false);
  const [preferredTourDate, setPreferredTourDate] = useState('');
  const [preferredTourTime, setPreferredTourTime] = useState('Afternoon (1pm - 4pm)');
  const [notesAndQuestions, setNotesAndQuestions] = useState(initialNote);

  // Status & AI Triage Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastDispatchedRecord, setLastDispatchedRecord] = useState<DispatchedLeadRecord | null>(null);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedLeads, setSavedLeads] = useState<DispatchedLeadRecord[]>(() => LeadCaptureEmailService.getSavedLeads());

  // Sync initialNote when prop changes
  useEffect(() => {
    if (initialNote) {
      setNotesAndQuestions(initialNote);
    }
  }, [initialNote]);

  // Load latest LO & Agent details from sync service
  useEffect(() => {
    const los = ProfileCardSyncService.getLoanOfficers();
    const agents = ProfileCardSyncService.getAgents();
    if (los.length > 0) {
      const lo = los[0];
      setConfig(prev => ({
        ...prev,
        loRecipientEmail: lo.email,
        loRecipientName: lo.name,
        loRecipientPhone: lo.phone,
        loCompany: lo.company,
        loNmls: lo.nmlsNumber
      }));
    }
    if (agents.length > 0 && !config.isSoloLoMode) {
      const agent = agents[0];
      setConfig(prev => ({
        ...prev,
        agentRecipientEmail: agent.email,
        agentRecipientName: agent.name,
        agentRecipientPhone: agent.phone,
        agentBrokerage: agent.brokerage,
        agentLicense: agent.licenseNumber
      }));
    }
  }, [config.isSoloLoMode]);

  // Quick suggestion prompts for visitors
  const SUGGESTION_CHIPS = [
    'Can we schedule a private walk-through this Saturday at 2pm?',
    'Is this property eligible for the $15,400 grant or USDA $0 down?',
    'What credit score do I need and what is the estimated monthly payment?',
    'Are the sellers open to closing cost credits or concessions?'
  ];

  const handleApplySuggestion = (chip: string) => {
    setNotesAndQuestions(prev => (prev ? `${prev}\n\n${chip}` : chip));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Submit form and trigger AI 2nd Brain Triage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!visitorName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!visitorEmail.trim() || !visitorEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (config.requirePhone && !visitorPhone.trim()) {
      setErrorMessage('A phone number is required to receive fast SMS updates.');
      return;
    }

    const payload: LeadCaptureFormData = {
      visitorName: visitorName.trim(),
      visitorEmail: visitorEmail.trim(),
      visitorPhone: visitorPhone.trim() || undefined,
      preferredContactMethod,
      timeframe,
      preApprovalStatus,
      interestedInGrants,
      tourRequested,
      preferredTourDate: tourRequested ? preferredTourDate || 'Flexible' : undefined,
      preferredTourTime: tourRequested ? preferredTourTime : undefined,
      notesAndQuestions: notesAndQuestions.trim()
    };

    setIsSubmitting(true);
    try {
      const record = await LeadCaptureEmailService.submitAndTriageLead(payload, activeProperty, config);
      setLastDispatchedRecord(record);
      setSavedLeads(LeadCaptureEmailService.getSavedLeads());
      setShowTriageModal(true);
      if (onLeadCaptured) {
        onLeadCaptured(record);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save updated configuration
  const handleSaveConfig = (newConfig: LeadCaptureFormConfig) => {
    setConfig(newConfig);
    LeadCaptureEmailService.saveConfig(newConfig);
    setShowConfigModal(false);
  };

  return (
    <div className={`bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col ${embedded ? 'w-full' : 'max-w-4xl mx-auto my-4'}`}>
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Co-Branded Lead Capture & 2nd Brain Triage</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              ✓ Simultaneous LO + Agent Email Relay
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {config.formTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {config.formSubtitle}
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'form' ? 'history' : 'form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Inspect previously captured leads and AI triage breakdowns"
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>Lead History ({savedLeads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer"
            title="Customize lead capture form fields and recipient emails"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Customize</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recipient Partnership Badge Strip */}
      <div className="bg-slate-950/80 px-5 sm:px-6 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Inquiry Dispatches To:
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-200 border border-blue-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <strong>LO:</strong> {config.loRecipientName} ({config.loRecipientEmail})
            </span>
            {!config.isSoloLoMode && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/80 text-pink-200 border border-pink-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
                <strong>Agent:</strong> {config.agentRecipientName} ({config.agentRecipientEmail})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span>AI 2nd Brain Automatically Categorizes Financing vs Showing Tasks</span>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* Lead History Tab */
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Captured Leads with AI 2nd Brain Triage ({savedLeads.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
            >
              ← Back to Lead Capture Form
            </button>
          </div>

          {savedLeads.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No leads captured yet. Fill out and submit the inquiry form below to test the automatic AI 2nd Brain triage and email generation!
            </div>
          ) : (
            <div className="space-y-3">
              {savedLeads.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setLastDispatchedRecord(item);
                    setShowTriageModal(true);
                  }}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white group-hover:text-purple-300 transition">
                        {item.lead.visitorName}
                      </span>
                      <span className="text-xs text-slate-400">({item.lead.visitorEmail})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.triage.urgencyLevel === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {item.triage.urgencyLevel} Urgency
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{item.property.address}</span>
                    <span className="text-slate-500">• ${item.property.price.toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-slate-400 italic line-clamp-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    "{item.lead.notesAndQuestions || 'No notes submitted'}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">
                        🏦 LO Tasks: <strong>{item.triage.loResponsibilities.identifiedTopics.length}</strong>
                      </span>
                      <span className="text-pink-400">
                        🏡 Agent Tasks: <strong>{item.triage.agentResponsibilities.identifiedTopics.length}</strong>
                      </span>
                      <span className="text-purple-300">
                        First Contact: <strong>{item.triage.firstContactRecommendation}</strong>
                      </span>
                    </div>
                    <span className="text-blue-400 group-hover:translate-x-1 transition font-bold flex items-center gap-1">
                      <span>View Full Breakdown</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Lead Capture Form */
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected Property Preview Mini-Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Home className="w-3 h-3 text-blue-400" /> Inquiring About Property
              </div>
              <div className="text-sm sm:text-base font-black text-white">
                {activeProperty.formattedAddress}
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-emerald-400">${activeProperty.price.toLocaleString()}</span>
                <span>•</span>
                <span>{activeProperty.bedrooms} Beds</span>
                <span>•</span>
                <span>{activeProperty.bathrooms} Baths</span>
                <span>•</span>
                <span>{activeProperty.squareFootage} SqFt</span>
                <span>•</span>
                <span>{activeProperty.daysOnMarket} Days on Market</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
              {activeProperty.specialPrograms?.lakeviewNationalDpaEligible && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  Lakeview 100% DPA
                </span>
              )}
              {activeProperty.specialPrograms?.ohcsFlexLendingFirstHomeEligible && (
                <span className="px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800 text-[10px] font-bold">
                  OHCS $15,400 Grant
                </span>
              )}
              {activeProperty.specialPrograms?.usdaRuralEligible && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  USDA $0 Down
                </span>
              )}
            </div>
          </div>

          {/* Contact Information Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Your Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Marcus Vance"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="marcus.vance@example.com"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Phone / Mobile {config.requirePhone && <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="tel"
                  placeholder="(503) 555-0192"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Preferred Contact Method & Pre-Approval Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={preferredContactMethod}
                  onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email Follow-Up</option>
                  <option value="phone">Phone Call</option>
                  <option value="text">SMS Text Message</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Buying Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Immediately (0-30 days)">Immediately (0-30 days)</option>
                  <option value="1-3 Months">1-3 Months</option>
                  <option value="3-6 Months">3-6 Months</option>
                  <option value="Just Browsing / Researching">Just Browsing / Researching</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Pre-Approval Status
                </label>
                <select
                  value={preApprovalStatus}
                  onChange={(e) => setPreApprovalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="need_preapproval">Need Pre-Approval / Estimate</option>
                  <option value="prequalified_elsewhere">Pre-Approved Elsewhere</option>
                  <option value="not_sure">Not Sure / Want Guidance</option>
                  <option value="cash_buyer">Cash Buyer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preferences & Tour Scheduling Toggles */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Special Program & Tour Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.enableGrantCheckboxes && (
                <label className="p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition cursor-pointer flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={interestedInGrants}
                    onChange={(e) => setInterestedInGrants(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 bg-slate-900 border-slate-700 focus:ring-teal-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Check $15,400+ Down Payment Grants
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-tight">
                      Have Mike Ford calculate your maximum allowable grant (OHCS Flex Lending, Lakeview 100%, or USDA Rural).
                    </span>
                  </div>
                </label>
              )}

              {config.enableTourScheduling && (
                <label className="p-3 bg-slate-950 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition cursor-pointer flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={tourRequested}
                    onChange={(e) => setTourRequested(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-pink-600 bg-slate-900 border-slate-700 focus:ring-pink-500"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Request Private Showing / Walk-Through
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-tight">
                      Have {config.agentRecipientName} coordinate access for an in-person tour or weekend open house walk-through.
                    </span>
                  </div>
                </label>
              )}
            </div>

            {/* Expandable Tour Date Picker if checked */}
            {tourRequested && (
              <div className="p-3.5 bg-pink-950/30 rounded-2xl border border-pink-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-pink-300 block mb-1">
                    Preferred Tour Date
                  </label>
                  <input
                    type="date"
                    value={preferredTourDate}
                    onChange={(e) => setPreferredTourDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-pink-800/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-pink-300 block mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={preferredTourTime}
                    onChange={(e) => setPreferredTourTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-pink-800/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Morning (9am - 12pm)">Morning (9am - 12pm)</option>
                    <option value="Afternoon (1pm - 4pm)">Afternoon (1pm - 4pm)</option>
                    <option value="Evening (4pm - 7pm)">Evening (4pm - 7pm)</option>
                    <option value="Saturday Any Time">Saturday Any Time</option>
                    <option value="Sunday Any Time">Sunday Any Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Comments & Questions Section (The Core of AI Triage) */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Comments, Questions & Listing Notes</span>
              </h3>
              <span className="text-[11px] text-purple-300 font-medium">
                🧠 Analyzed by AI 2nd Brain for LO vs Agent Domain Triage
              </span>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySuggestion(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] font-medium transition cursor-pointer text-left"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="Ask about down payment assistance, credit score requirements, monthly payments, seller credits, or request a tour time..."
              value={notesAndQuestions}
              onChange={(e) => setNotesAndQuestions(e.target.value)}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner leading-relaxed select-all"
            />
          </div>

          {/* Submission Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct encrypted dispatch to {config.loRecipientName} & {config.isSoloLoMode ? 'Direct Originator' : config.agentRecipientName}.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-900/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-blue-200" />
                  <span>Analyzing with AI 2nd Brain & Dispatching Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Submit Listing Note & Dispatch Team</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* AI 2nd Brain Triage & Automated Email Result Modal */}
      {showTriageModal && lastDispatchedRecord && (
        <div
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowTriageModal(false)}
        >
          <div
            className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 text-xs relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                    ✓ Email Dispatched to LO + Agent Team
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    lastDispatchedRecord.triage.urgencyLevel === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {lastDispatchedRecord.triage.urgencyLevel} Urgency
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  📍 {lastDispatchedRecord.property.address}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Lead: <strong className="text-slate-200">{lastDispatchedRecord.lead.visitorName}</strong> ({lastDispatchedRecord.lead.visitorEmail}) • Dispatched to {lastDispatchedRecord.recipients.loEmail} & {lastDispatchedRecord.recipients.agentEmail || 'Solo Pipeline'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTriageModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI 2nd Brain Triage Summary Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 rounded-2xl border border-indigo-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>AI 2nd Brain Domain Decomposition</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-bold">
                  Recommended First Contact: <strong>{lastDispatchedRecord.triage.firstContactRecommendation}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lastDispatchedRecord.triage.summary}
              </p>
              <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <strong>Strategy Rationale:</strong> {lastDispatchedRecord.triage.firstContactRationale}
              </div>
            </div>

            {/* Loan Officer vs Real Estate Agent Responsibilities Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* LO Column */}
              <div className="p-4 bg-slate-950 rounded-2xl border-l-4 border-blue-500 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>🏦 Loan Officer Action Items</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">{config.loRecipientName}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Identified Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {lastDispatchedRecord.triage.loResponsibilities.identifiedTopics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-medium border border-blue-800">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Recommended Talking Points:</span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {lastDispatchedRecord.triage.loResponsibilities.recommendedResponsePoints.map((pt, i) => (
                      <li key={i} className="leading-snug">{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* LO Draft Reply */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Draft Reply for {config.loRecipientName}:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(lastDispatchedRecord.triage.loResponsibilities.draftResponse, 'lo_draft')}
                      className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'lo_draft' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'lo_draft' ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl text-[11px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto border border-slate-800 select-all">
                    {lastDispatchedRecord.triage.loResponsibilities.draftResponse}
                  </div>
                </div>
              </div>

              {/* Agent Column */}
              <div className="p-4 bg-slate-950 rounded-2xl border-l-4 border-pink-500 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" />
                    <span>🏡 Realtor Agent Action Items</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {config.isSoloLoMode ? 'Solo Pipeline' : config.agentRecipientName}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Identified Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {lastDispatchedRecord.triage.agentResponsibilities.identifiedTopics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 text-[10px] font-medium border border-pink-800">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Recommended Talking Points:</span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {lastDispatchedRecord.triage.agentResponsibilities.recommendedResponsePoints.map((pt, i) => (
                      <li key={i} className="leading-snug">{pt}</li>
                    ))}
                  </ul>
                </div>

                {/* Agent Draft Reply */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>Draft Reply for {config.agentRecipientName}:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(lastDispatchedRecord.triage.agentResponsibilities.draftResponse, 'agent_draft')}
                      className="text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'agent_draft' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'agent_draft' ? 'Copied!' : 'Copy Draft'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl text-[11px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto border border-slate-800 select-all">
                    {lastDispatchedRecord.triage.agentResponsibilities.draftResponse}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Dispatch Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(lastDispatchedRecord.triage.emailText, 'email_text')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'email_text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'email_text' ? 'Copied Full Email!' : 'Copy Email Body'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    LeadCaptureEmailService.openGmailWebDraft(
                      lastDispatchedRecord.lead.visitorEmail,
                      `Regarding your inquiry on ${lastDispatchedRecord.property.address}`,
                      lastDispatchedRecord.triage.loResponsibilities.draftResponse,
                      config.isSoloLoMode ? undefined : config.agentRecipientEmail
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Gmail Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    LeadCaptureEmailService.openMailtoDraft(
                      lastDispatchedRecord.lead.visitorEmail,
                      `Regarding your inquiry on ${lastDispatchedRecord.property.address}`,
                      lastDispatchedRecord.triage.loResponsibilities.draftResponse,
                      config.isSoloLoMode ? undefined : config.agentRecipientEmail
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Mail App</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowTriageModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Customization Modal */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customize Lead Capture Form</h3>
                  <p className="text-[10px] text-slate-400">Configure fields, LO+Agent routing, and automated triage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Form Title</label>
                <input
                  type="text"
                  value={config.formTitle}
                  onChange={(e) => setConfig({ ...config, formTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Form Subtitle</label>
                <textarea
                  rows={2}
                  value={config.formSubtitle}
                  onChange={(e) => setConfig({ ...config, formSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Loan Officer Email</label>
                  <input
                    type="email"
                    value={config.loRecipientEmail}
                    onChange={(e) => setConfig({ ...config, loRecipientEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Realtor Agent Email</label>
                  <input
                    type="email"
                    disabled={config.isSoloLoMode}
                    value={config.agentRecipientEmail}
                    onChange={(e) => setConfig({ ...config, agentRecipientEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300 font-bold">Require Visitor Phone Number</span>
                  <input
                    type="checkbox"
                    checked={config.requirePhone}
                    onChange={(e) => setConfig({ ...config, requirePhone: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300 font-bold">Enable In-Person Tour / Walk-Through Option</span>
                  <input
                    type="checkbox"
                    checked={config.enableTourScheduling}
                    onChange={(e) => setConfig({ ...config, enableTourScheduling: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <span className="text-xs text-slate-300 font-bold">Enable $15,400+ DPA Grant Checkbox</span>
                  <input
                    type="checkbox"
                    checked={config.enableGrantCheckboxes}
                    onChange={(e) => setConfig({ ...config, enableGrantCheckboxes: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs text-slate-300 font-bold block">Solo LO Mode</span>
                    <span className="text-[10px] text-slate-500 block">Deactivates realtor-specific showing dispatches and routes solely to LO</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.isSoloLoMode}
                    onChange={(e) => setConfig({ ...config, isSoloLoMode: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_FORM_CONFIG)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset Defaults
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveConfig(config)}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
