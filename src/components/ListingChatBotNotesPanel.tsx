/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • PROPERTY LISTING CHAT BOT & TWO-WAY NOTES MODULE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Interactive Chat Bot with Q&A, Quick Answer Buttons & Income DTI Sidebar
 * Synced with First-Time Homebuyer AI Studio Architecture
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  DollarSign,
  Award,
  ChevronRight,
  Shield,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Info,
  Building,
  HelpCircle,
  Mail,
  Copy,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { SyncedPropertyListing, BuyerDtiProfile, BuyerPrequalificationResult } from '../types/firstTimeHomebuyerPlugin';
import mortgageEligibilityService from '../services/mortgageEligibility';
import { calculateMonthlyPI, formatUSD } from '../services/geomapMortgageEngine';
import { useAccountPathway } from '../context/AccountPathwayContext';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  text: string;
  timestamp: string;
  quickActionType?: string;
  grantHighlightsUsd?: number;
}

interface ListingChatBotNotesPanelProps {
  property: SyncedPropertyListing;
  buyerProfile: BuyerDtiProfile;
  prequalResult: BuyerPrequalificationResult;
  onUpdatePropertyNotes?: (propertyId: string, updatedNotes: string) => void;
  className?: string;
  assignedLoanOfficerName?: string;
  assignedAgentName?: string;
  hasPairedAgent?: boolean;
  onOpenLeadCapture?: (note: string) => void;
}

export const ListingChatBotNotesPanel: React.FC<ListingChatBotNotesPanelProps> = ({
  property,
  buyerProfile,
  prequalResult,
  onUpdatePropertyNotes,
  className = '',
  assignedLoanOfficerName = 'Mike Ford',
  assignedAgentName,
  hasPairedAgent = false,
  onOpenLeadCapture
}) => {
  const [showIncomeSidebar, setShowIncomeSidebar] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [selectedProgramTopic, setSelectedProgramTopic] = useState<'NHF & Lakeview National' | 'OHCS Flex Lending' | 'USDA Rural 100%'>('NHF & Lakeview National');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Consume AccountPathwayContext safely
  let pathway = 'google_apps';
  let connectedEmail = 'fordmj@gmail.com';
  let isWorkspaceConnected = false;

  try {
    const accountContext = useAccountPathway();
    pathway = accountContext.pathway;
    connectedEmail = accountContext.connectedWorkspaceEmail || 'fordmj@gmail.com';
    isWorkspaceConnected = accountContext.isWorkspaceConnected;
  } catch (e) {
    // Fallback if rendered outside provider
  }

  // Initialize chat thread whenever selected property changes
  useEffect(() => {
    const prescreen = mortgageEligibilityService.getComprehensiveDpaPrescreenReport(
      {
        grossAnnualIncome: buyerProfile.grossMonthlyIncome * 12,
        creditScore: 680,
        areaMedianIncomeUsd: 92000,
        propertyState: property.state || 'OR',
        propertyPrice: property.price,
        liquidDownPayment: buyerProfile.availableDownPayment,
        isTargetedCensusTract: Boolean(property.specialPrograms.lmiCraGrantEligible)
      },
      property
    );

    const initialGreeting: ChatMessage = {
      id: `msg-init-${property.id}`,
      sender: 'assistant',
      text: hasPairedAgent && assignedAgentName
        ? `Hello! I'm the AI Assistant for ${assignedLoanOfficerName} and ${assignedAgentName} for ${property.formattedAddress}.\n\n` +
          `• Price: ${formatUSD(property.price)}\n` +
          `• Summary: ${prescreen.recommendationSummary}\n` +
          `• Initial Listing Notes: "${property.propertyNotes}"\n\n` +
          `Select a quick question button below or type a custom question. Inbound notes and showing requests are relayed directly to both ${assignedLoanOfficerName} and ${assignedAgentName}.`
        : `Hello! I'm ${assignedLoanOfficerName}'s Direct AI Mortgage Assistant for ${property.formattedAddress}.\n\n` +
          `• Price: ${formatUSD(property.price)}\n` +
          `• Summary: ${prescreen.recommendationSummary}\n` +
          `• Initial Listing Notes: "${property.propertyNotes}"\n\n` +
          `Select a quick question button below or type a custom inquiry. In Solo Mode, all notes, DTI questions, and pre-qualification requests route 100% directly to ${assignedLoanOfficerName} with zero agent intermediary.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([initialGreeting]);
  }, [property.id, buyerProfile, property, hasPairedAgent, assignedAgentName, assignedLoanOfficerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper generator for automated AI responses based on exact Q&A prompts
  const generateAiAnswer = (promptText: string): string => {
    const lower = promptText.toLowerCase();
    const price = property.price;
    const special = property.specialPrograms;
    const annualIncome = buyerProfile.grossMonthlyIncome * 12;

    const prescreen = mortgageEligibilityService.getComprehensiveDpaPrescreenReport(
      {
        grossAnnualIncome: annualIncome,
        creditScore: 680,
        areaMedianIncomeUsd: 92000,
        propertyState: property.state || 'OR',
        propertyPrice: price,
        liquidDownPayment: buyerProfile.availableDownPayment,
        isTargetedCensusTract: Boolean(special.lmiCraGrantEligible)
      },
      property
    );

    if (lower.includes('lakeview') || lower.includes('100%')) {
      const lakeviewAmount = special.lakeviewGrantAmountUsd || Math.round(price * 0.035);
      return `🏞️ **Lakeview National 100% DPA Analysis**:\n` +
             `• Program LTV: 100% financing (FHA 1st + soft 2nd DPA)\n` +
             `• Estimated Assistance: ${formatUSD(lakeviewAmount)} (${special.lakeviewNationalDpaEligible ? 'Eligible' : 'Check FICO 620 requirement'})\n` +
             `• Required Down Payment from Buyer: $0\n` +
             `• Guideline: No 1st-time homebuyer restriction in non-targeted areas. Minimum credit score is 620 FICO.`;
    }

    if (lower.includes('ohcs') || lower.includes('oregon')) {
      const ohcsAmount = special.ohcsGrantAmountUsd || Math.round(price * 0.04);
      return `🌲 **OHCS Flex Lending FirstHome Analysis**:\n` +
             `• Program Status: ${special.ohcsFlexLendingFirstHomeEligible ? 'Eligible in Oregon' : 'Available statewide across Oregon'}\n` +
             `• Cash Grant Assistance: ${formatUSD(ohcsAmount)} (3.5% - 5.0% of loan amount)\n` +
             `• Minimum FICO: 640\n` +
             `• Note: Can be paired with competitive Oregon HFA fixed 1st mortgage rates.`;
    }

    if (lower.includes('usda') || lower.includes('rural')) {
      const usdaEval = mortgageEligibilityService.prescreenUsdaRuralZone(property, {
        grossAnnualIncome: annualIncome,
        creditScore: 680,
        areaMedianIncomeUsd: 92000,
        propertyState: property.state || 'OR',
        propertyPrice: price,
        liquidDownPayment: buyerProfile.availableDownPayment,
        isTargetedCensusTract: Boolean(special.lmiCraGrantEligible)
      });
      return `🌾 **USDA 100% Rural Development Pre-Screen**:\n` +
             `• Zone Status: ${usdaEval.isUsdaZoneEligible ? '✓ Property is located inside eligible USDA rural boundaries' : 'Outside USDA designated zone'}\n` +
             `• Income Limit: ${formatUSD(usdaEval.maxUsdaIncomeCapUsd)} (115% AMI)\n` +
             `• Buyer Down Payment: $0 Required\n` +
             `• Details: ${usdaEval.reason}`;
    }

    if (lower.includes('cra') || lower.includes('lmi') || lower.includes('grant')) {
      const craGrant = special.craGrantAmountUsd || 5000;
      return `🏛️ **CRA Low-to-Moderate Income (LMI) Grant Stacker**:\n` +
             `• Status: ${special.lmiCraGrantEligible ? `✓ Eligible for ${formatUSD(craGrant)} Non-Repayable Grant` : 'Property census tract is standard market rate'}\n` +
             `• Stacking: CRA bank grants do NOT require repayment and can be stacked on top of Lakeview or OHCS DPA loans!`;
    }

    if (lower.includes('cash') || lower.includes('closing') || lower.includes('need at close')) {
      const estTaxIns = Math.round((property.estimatedAnnualTax + property.estimatedAnnualInsurance) / 12);
      const estClosingCosts = Math.round(price * 0.025);
      const totalGrants = prescreen.stackedGrantBreakdownUsd;
      const netCashOut = Math.max(0, estClosingCosts - totalGrants);
      return `💰 **Cash Needed at Closing Estimate**:\n` +
             `• Property Purchase Price: ${formatUSD(price)}\n` +
             `• Estimated Closing Costs & Prepaids (~2.5%): ${formatUSD(estClosingCosts)}\n` +
             `• Less Total Stacked Grants & DPA: -${formatUSD(totalGrants)}\n` +
             `• **Net Estimated Buyer Cash Required**: ${formatUSD(netCashOut)} (versus standard $20,000+ without grants)`;
    }

    if (lower.includes('homeready') || lower.includes('pmui') || lower.includes('fannie')) {
      const homeReadyEval = mortgageEligibilityService.prescreenFannieMaeHomeReady({
        grossAnnualIncome: annualIncome,
        creditScore: 680,
        areaMedianIncomeUsd: 92000,
        propertyState: property.state || 'OR',
        propertyPrice: price,
        liquidDownPayment: buyerProfile.availableDownPayment,
        isTargetedCensusTract: Boolean(special.lmiCraGrantEligible)
      }, price);

      return `🔑 **Fannie Mae HomeReady 3% Down Pre-Screen**:\n` +
             `• Status: ${homeReadyEval.isEligible ? '✓ Eligible for 3% Conventional Down Payment' : 'Income exceeds 80% AMI cap'}\n` +
             `• Required Down Payment: ${formatUSD(homeReadyEval.requiredDownPaymentUsd)}\n` +
             `• Monthly PMI Savings: ~${formatUSD(homeReadyEval.reducedPmiSavingsUsdPerMonth)}/mo (25% reduced coverage)\n` +
             `• Feature: Boarder income & non-occupant co-signers permitted!`;
    }

    return `🤖 **Mike Ford Loan Officer AI Assistant**:\n` +
           `For ${property.formattedAddress} at ${formatUSD(price)}, your estimated monthly housing payment is approximately ${formatUSD(
             calculateMonthlyPI(Math.max(0, price - buyerProfile.availableDownPayment), buyerProfile.targetInterestRate, 30) +
             Math.round((property.estimatedAnnualTax + property.estimatedAnnualInsurance) / 12) + property.hoaMonthlyFee
           )}/mo. ` +
           `Your prequal envelope allows up to ${formatUSD(prequalResult.maxAllowableMonthlyHousingPayment)}/mo. ` +
           `Feel free to click any quick question button to evaluate specific DPA options!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (text === 'TRIGGER_EMAIL_INQUIRY') {
      setShowInquiryModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate instant AI response
    setTimeout(() => {
      const answerText = generateAiAnswer(text);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (onUpdatePropertyNotes) {
        onUpdatePropertyNotes(property.id, `${property.propertyNotes}\n[Q&A Log ${new Date().toLocaleDateString()}]: ${text}`);
      }
    }, 400);
  };

  // Email Template Builder utilizing AccountPathway Context
  const recipientEmail = 'fordmj@gmail.com'; // Assigned LO Mike Ford

  const emailSubject = `[Property Inquiry] Program Availability for ${property.formattedAddress} (${selectedProgramTopic})`;

  const emailBodyText = `Hi Mike Ford,

I am inquiring about loan program availability for the following property:

• Property Address: ${property.formattedAddress}
• Price: ${formatUSD(property.price)}
• GEOID: ${property.geoid}

Program Details Requested:
- Program Focus: ${selectedProgramTopic}
- Primary Down Payment Assistance: ${property.specialPrograms.lakeviewNationalDpaEligible ? 'Lakeview National 100% DPA' : 'National Homebuyer Fund (NHF) Fallback 0% Down'}
- State HFA Status: ${property.specialPrograms.ohcsFlexLendingFirstHomeEligible ? 'OHCS Flex Lending FirstHome Eligible' : 'Standard Market'}
- USDA Rural Zone: ${property.specialPrograms.usdaRural100Financing ? 'Eligible 100% Zero Down Zone' : 'Outside Rural Boundary'}

Buyer Financial Envelope Summary:
- Gross Monthly Income: ${formatUSD(buyerProfile.grossMonthlyIncome)}/mo ($${(buyerProfile.grossMonthlyIncome * 12).toLocaleString()}/yr)
- Available Liquid Down Payment: ${formatUSD(buyerProfile.availableDownPayment)}
- Monthly Debt Obligations: ${formatUSD(buyerProfile.totalMonthlyDebtObligations)}/mo
- Front-End DTI: ${prequalResult.calculatedFrontEndDti.toFixed(1)}% | Back-End DTI: ${prequalResult.calculatedBackEndDti.toFixed(1)}%
- Account Pathway: ${pathway === 'workspace' ? `Google Workspace Enterprise (${connectedEmail})` : 'Google Apps Free Account'}

Please confirm if this property qualifies for NHF or Lakeview National 100% financing and what documentation is needed to reserve funds.

Thank you!`;

  const handleOpenGmailWeb = () => {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.open(url, '_blank');
    setShowInquiryModal(false);
    handleSendMessage(`[Email Sent to LO via Gmail Web]: Inquired about ${selectedProgramTopic} program availability.`);
  };

  const handleOpenMailto = () => {
    const url = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.location.href = url;
    setShowInquiryModal(false);
    handleSendMessage(`[Email Sent to LO via Mail App]: Inquired about ${selectedProgramTopic} program availability.`);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBodyText}`);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 3000);
  };

  const quickPrompts = [
    { label: '✉️ Email LO Re: NHF / Lakeview', text: 'TRIGGER_EMAIL_INQUIRY' },
    { label: '🏞️ Lakeview 100% DPA', text: 'Can I use Lakeview 100% Zero-Down on this home?' },
    { label: '🌲 OHCS Flex FirstHome', text: 'What is my grant eligibility with OHCS Flex Lending?' },
    { label: '🌾 USDA 0% Down Zone', text: 'Is this home inside an eligible USDA Rural Zone?' },
    { label: '🏛️ Stack CRA $5k Grant', text: 'Can I stack a $5,000 CRA grant with DPA assistance?' },
    { label: '💰 Cash Needed at Close', text: 'How much cash do I need at closing for this property?' },
    { label: '🔑 HomeReady 3% Down', text: 'Check Fannie Mae HomeReady eligibility and PMI savings' }
  ];

  return (
    <div className={`bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex flex-col ${className}`}>
      {/* Top Header Bar */}
      <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">
                {hasPairedAgent && assignedAgentName
                  ? `${assignedLoanOfficerName} & ${assignedAgentName} Partner Portal`
                  : `${assignedLoanOfficerName} Direct Loan Officer Desk`}
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-stone-900 border border-stone-700 text-stone-300">
                {hasPairedAgent ? 'Co-Branded Live Relay' : 'Solo LO • 0 Agent Relay'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              {hasPairedAgent
                ? 'Two-Way Listing Notes Relay & Automated Q&A'
                : 'Direct Mortgage Inquiries & Loan Notes (Zero Agent Intermediary)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLeadCapture && (
            <button
              type="button"
              onClick={() => onOpenLeadCapture(inputText || messages.filter(m => m.sender === 'user').map(m => m.text).join('\n') || property.propertyNotes)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Open Lead Capture Form with Automatic AI 2nd Brain Triage & Dual LO+Agent Email Dispatch"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Lead Form & AI Triage</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInquiryModal(true)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3 h-3 text-amber-400" />
            <span>Quick Loan Inquiry</span>
          </button>

          <button
            type="button"
            onClick={() => setShowIncomeSidebar(!showIncomeSidebar)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              showIncomeSidebar
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-stone-900 text-stone-300 border-stone-700 hover:bg-stone-800'
            }`}
          >
            <Sliders className="w-3 h-3 text-emerald-400" />
            <span>{showIncomeSidebar ? 'Hide Income Sidebar' : 'Income & DTI'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Chat Thread + Optional Income Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px] max-h-[420px]">
        {/* Chat Thread Area */}
        <div className={`${showIncomeSidebar ? 'md:col-span-8 border-r border-stone-800' : 'md:col-span-12'} flex flex-col justify-between p-3 bg-stone-900/60`}>
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px] scrollbar-thin scrollbar-thumb-stone-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[88%] whitespace-pre-wrap font-sans text-[11px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-stone-950 text-stone-200 border border-stone-800 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                  <span className="block text-[9px] text-stone-400 font-mono mt-1 text-right opacity-80">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-stone-800 text-stone-300 border border-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Answer Buttons Bar */}
          <div className="py-2 border-t border-stone-800/80">
            <div className="text-[10px] text-stone-400 font-bold uppercase mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Question Prompts:
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
              {quickPrompts.map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(btn.text)}
                  className="px-2.5 py-1 rounded-xl bg-stone-950 text-emerald-300 hover:text-white border border-stone-800 hover:border-emerald-500/50 transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-stone-800"
          >
            <input
              type="text"
              placeholder="Ask a question about down payment, DTI, or grants..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Income & DTI Quick Sidebar */}
        {showIncomeSidebar && (
          <div className="md:col-span-4 bg-stone-950 p-3 space-y-3 text-xs border-t md:border-t-0 md:border-l border-stone-800 overflow-y-auto">
            <div className="border-b border-stone-800 pb-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Buyer Income & DTI
              </h5>
              <p className="text-[10px] text-stone-400">Pre-screened affordability stats</p>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2 bg-stone-900 rounded-xl border border-stone-800 space-y-0.5">
                <span className="text-[10px] text-stone-400 block">Gross Monthly Income</span>
                <span className="font-bold text-white text-xs">{formatUSD(buyerProfile.grossMonthlyIncome)}/mo</span>
              </div>

              <div className="p-2 bg-stone-900 rounded-xl border border-stone-800 space-y-0.5">
                <span className="text-[10px] text-stone-400 block">Monthly Debt Obligations</span>
                <span className="font-bold text-white text-xs">{formatUSD(buyerProfile.totalMonthlyDebtObligations)}/mo</span>
              </div>

              <div className="p-2 bg-stone-900 rounded-xl border border-stone-800 space-y-0.5">
                <span className="text-[10px] text-stone-400 block">Max Housing Budget</span>
                <span className="font-bold text-emerald-400 text-xs">{formatUSD(prequalResult.maxAllowableMonthlyHousingPayment)}/mo</span>
              </div>

              <div className="p-2 bg-stone-900 rounded-xl border border-stone-800 space-y-0.5">
                <span className="text-[10px] text-stone-400 block">Liquid Down Payment</span>
                <span className="font-bold text-amber-400 text-xs">{formatUSD(buyerProfile.availableDownPayment)}</span>
              </div>

              <div className="p-2 bg-emerald-950/60 rounded-xl border border-emerald-800/80 space-y-1 font-sans">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-300 font-bold">Front-End DTI</span>
                  <span className="font-mono text-emerald-300 font-bold">{prequalResult.calculatedFrontEndDti.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-300 font-bold">Back-End DTI</span>
                  <span className="font-mono text-emerald-300 font-bold">{prequalResult.calculatedBackEndDti.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quick Loan Inquiry Pre-filled Email Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative text-xs">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Loan Officer Quick Inquiry</h3>
                  <p className="text-[10px] text-stone-400">Pre-filled Email Template (AccountPathway Sync)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AccountPathway Status Banner */}
            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between text-[11px]">
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400 block font-bold">Target Recipient</span>
                <span className="font-bold text-white font-mono">Mike Ford ({recipientEmail})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block font-bold">Context Pathway</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {pathway === 'workspace' ? `Workspace (${connectedEmail})` : 'Google Apps (Free)'}
                </span>
              </div>
            </div>

            {/* Program Focus Selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-stone-400 font-bold uppercase block">Select Loan Program Topic:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['NHF & Lakeview National', 'OHCS Flex Lending', 'USDA Rural 100%'] as const).map((prog) => (
                  <button
                    key={prog}
                    type="button"
                    onClick={() => setSelectedProgramTopic(prog)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer text-center ${
                      selectedProgramTopic === prog
                        ? 'bg-amber-500 text-stone-950 shadow'
                        : 'bg-stone-950 text-stone-400 border border-stone-800 hover:text-white'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Body Preview */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase">
                <span>Pre-filled Subject & Message Preview:</span>
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedFeedback ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-[10px] font-mono text-stone-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                <div className="font-bold text-amber-300 border-b border-stone-800 pb-1 mb-2">
                  Subject: {emailSubject}
                </div>
                {emailBodyText}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenGmailWeb}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Gmail (Web Draft)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenMailto}
                className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-xl text-xs border border-stone-700 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Mail App (mailto)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
