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
  Check,
  Star,
  Heart
} from 'lucide-react';
import { SyncedPropertyListing, BuyerDtiProfile, BuyerPrequalificationResult } from '../types/firstTimeHomebuyerPlugin';
import mortgageEligibilityService from '../services/mortgageEligibility';
import {
  calculateMonthlyPI,
  formatUSD,
  resolveOregonCountyFannieMaeAmi,
  evaluateLakeviewNationalIncomeEligibility,
  evaluateOregonLakeviewNationalEligibility,
  evaluateOregonOhcsFlexFirstHomeEligibility,
  evaluateUsdaRdIncomeEligibility,
  FANNIE_MAE_SCHEDULE_CONSTANTS,
  OHCS_FLEX_SCHEDULE_CONSTANTS,
  USDA_RD_SCHEDULE_CONSTANTS,
  evaluateNhfDpaEligibility,
  NHF_PROGRAM_CONSTANTS
} from '../services/geomapMortgageEngine';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { ListingNotesProfileFooter } from './ListingNotesProfileFooter';

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
  onUpdateCreditScore?: (creditScore: number) => void;
  onOpenSmsRelay?: () => void;
  className?: string;
  assignedLoanOfficerName?: string;
  assignedAgentName?: string;
  hasPairedAgent?: boolean;
  onOpenLeadCapture?: (note: string) => void;
  isCarouselOnlyView?: boolean;
}

export const ListingChatBotNotesPanel: React.FC<ListingChatBotNotesPanelProps> = ({
  property,
  buyerProfile,
  prequalResult,
  onUpdatePropertyNotes,
  onUpdateCreditScore,
  onOpenSmsRelay,
  className = '',
  assignedLoanOfficerName = 'Mike Ford',
  assignedAgentName,
  hasPairedAgent = false,
  onOpenLeadCapture,
  isCarouselOnlyView = false
}) => {
  const [showIncomeSidebar, setShowIncomeSidebar] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [selectedProgramTopic, setSelectedProgramTopic] = useState<'NHF & Lakeview National' | 'OHCS Flex Lending' | 'USDA Rural 100%'>('NHF & Lakeview National');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

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

    const isDefaultListing = Boolean(property.isGeoMapPluginDefault) ||
      (typeof window !== 'undefined' && localStorage.getItem('vantage_geomap_default_property_id') === property.id);

    const defaultBanner = isDefaultListing
      ? `⭐ FEATURED GEOMAP PLUGIN DEFAULT LISTING (Front & Center View)\n`
      : '';

    const initialGreeting: ChatMessage = {
      id: `msg-init-${property.id}`,
      sender: 'assistant',
      text: hasPairedAgent && assignedAgentName
        ? `${defaultBanner}Hello! I'm the AI Assistant for ${assignedLoanOfficerName} and ${assignedAgentName} for ${property.formattedAddress}.\n\n` +
          `• Price: ${formatUSD(property.price)}\n` +
          `• Summary: ${prescreen.recommendationSummary}\n` +
          `• Initial Listing Notes: "${property.propertyNotes}"\n\n` +
          `Select a quick question button below or type a custom question. Inbound notes and showing requests are relayed directly to both ${assignedLoanOfficerName} and ${assignedAgentName}.`
        : `${defaultBanner}Hello! I'm ${assignedLoanOfficerName}'s Direct AI Mortgage Assistant for ${property.formattedAddress}.\n\n` +
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

    if (lower.includes('city') || lower.includes('what city') || lower.includes('desired area') || lower.includes('planning to purchase')) {
      return `📍 **Target City & Desired Purchase Area Intake**:\n` +
             `What city or neighborhood in Oregon are you planning to purchase in? (e.g. Scappoose, Portland, St. Helens, Columbia County, Beaverton, Hillsboro, Salem, Bend).\n\n` +
             `Our Oregon GeoSphere spatial engine continuously maps:\n` +
             `• **USDA Rural Development 100% Zero-Down Zones** (e.g. Scappoose, Columbia County, outskirts)\n` +
             `• **LMI Census Tract CRA $5,000–$10,000 Grants**\n` +
             `• **OHCS Flex Lending $15,400 Cash Grant Corridors**\n\n` +
             `Type your desired city below, or click **"Curate Low/No-Down Shortlist"** to have ${assignedLoanOfficerName} ${hasPairedAgent && assignedAgentName ? `and ${assignedAgentName}` : ''} curate matching properties for you!`;
    }

    if (lower.includes('curate') || lower.includes('short list') || lower.includes('shortlist') || lower.includes('low or no down')) {
      return `✨ **Curated Low or No Down Payment Property Shortlist**:\n` +
             `Yes! We would love to curate a custom shortlist of active for-sale properties in your desired purchase area that qualify for:\n` +
             `• **USDA 100% Financing ($0 Down Payment)**\n` +
             `• **OHCS Flex Lending FirstHome ($15,400 Grant)**\n` +
             `• **Lakeview National 100% DPA (FHA 1st + Soft 2nd)**\n` +
             `• **Fannie Mae HomeReady 3% Down (with 25% PMI Discount)**\n` +
             `• **Bank CRA $5k–$10k Non-Repayable Grants**\n\n` +
             `${assignedLoanOfficerName} ${hasPairedAgent && assignedAgentName ? `and ${assignedAgentName}` : ''} will review active listings synced from the GeoSphere spatial feed, verify down payment grant rules, and push the curated properties directly into your mobile/desktop GeoMap app!`;
    }

    if (lower.includes('favorite') || lower.includes('heart') || lower.includes('front and center') || lower.includes('carousel') || lower.includes('top 3') || lower.includes('rotation')) {
      return `❤️ **Customizing Your Front & Center Carousel View**:\n` +
             `You can easily personalize which homes appear first in your viewing carousel on desktop and in your mobile "Add to Home Screen" app at any time!\n\n` +
             `• **How to Set**: Click the **❤️ Heart icon** on **ANY 3 property listing cards** in the deck.\n` +
             `• **Always Front & Center**: Those 3 homes will **always be the first 3 property listing cards in the carousel rotation view** every time you open the app!\n` +
             `• **Rotating Homes**: Click ❤️ on any card to add or remove it from your top 3. Your selection automatically saves to your device.\n` +
             `• **Easy Exploration**: Use the Next/Prev buttons or Auto-Rotate to preview monthly payments, DPA eligibility (USDA, OHCS FirstHome $15.4k, Lakeview 100%), and ask me any questions in real time!`;
    }

    if (lower.includes('seller') || lower.includes('concession') || lower.includes('contribution') || lower.includes('price reduction')) {
      return `🏷️ **Seller Concessions & Price Reduction Strategy**:\n` +
             `When a property experiences a price reduction or has room to negotiate, ${hasPairedAgent && assignedAgentName ? `${assignedAgentName} and ` : ''}${assignedLoanOfficerName} can craft an offer requesting seller contributions towards your closing costs (up to 3% for Conventional, 6% for FHA/USDA).\n\n` +
             `• **Strategy**: Seller concessions can cover title, escrow, prepaids, or buy down your interest rate by 0.5%–1.0%.\n` +
             `• **Combined with DPA**: When stacked with Lakeview 100% or OHCS FirstHome ($15.4k), seller contributions can result in a **True $0 Out-of-Pocket Closing**!`;
    }

    if (lower.includes('credit') || lower.includes('fico') || lower.includes('score')) {
      const buyerFico = buyerProfile.creditScore || 680;
      return `💳 **Program Minimum Credit Score (FICO) Requirements**:\n\n` +
             `• **Lakeview National 100% DPA**: **660+ FICO** (${buyerFico >= 660 ? '✓ Your score meets threshold' : `⚠️ Your score ${buyerFico} is below 660 min`})\n` +
             `• **FirstHome (OHCS Flex Lending)**: **620+ FICO** (${buyerFico >= 620 ? '✓ Your score meets threshold' : `⚠️ Your score ${buyerFico} is below 620 min`})\n` +
             `• **National Homebuyers Fund (NHF DPA)**: **620+ FICO** (${buyerFico >= 620 ? '✓ Your score meets threshold' : `⚠️ Your score ${buyerFico} is below 620 min`})\n` +
             `• **USDA Rural Development (100% Zero-Down)**: **680+ FICO** (${buyerFico >= 680 ? '✓ Your score meets threshold' : `⚠️ Your score ${buyerFico} is below 680 min`})\n\n` +
             `💡 You can self-input your credit score or adjust the FICO slider in the LO Underwriting Deck to test program eligibility in real time!`;
    }

    if (lower.includes('lakeview') || lower.includes('100%') || lower.includes('ami') || lower.includes('income limit')) {
      const countyData = resolveOregonCountyFannieMaeAmi(property.county || property.fipsGeoId || property.city || property.formattedAddress);
      const lakeviewEval = evaluateOregonLakeviewNationalEligibility({
        price: property.price,
        state: property.state,
        county: property.county,
        city: property.city,
        address: property.formattedAddress,
        fipsGeoId: property.fipsGeoId || property.geoid,
        propertyType: property.propertyType,
        grossAnnualIncome: annualIncome,
        isPrimaryResidence: true,
        isStickBuilt: property.propertyType !== 'Manufactured'
      });

      const incomeStatus = annualIncome <= countyData.ami140CapUsd
        ? `✓ Your combined annualized income (${formatUSD(annualIncome)}) meets the 140% Fannie Mae AMI cap (${formatUSD(countyData.ami140CapUsd)}) for ${countyData.countyName} County.`
        : `✕ Current combined income (${formatUSD(annualIncome)}) exceeds the 140% AMI cap (${formatUSD(countyData.ami140CapUsd)}) for ${countyData.countyName} County. (Adjust income slider in LO dashboard if co-borrower incomes differ).`;

      return `🏞️ **Lakeview National 100% DPA & County AMI Analysis**:\n` +
             `• **Eligibility Status**: ${lakeviewEval.isEligible ? '✓ 100% Eligible for $0 Down Financing' : '⚠️ Ineligible for this property / income profile'}\n` +
             `• **Subject County**: ${countyData.countyName} County (${countyData.msaName})\n` +
             `• **Fannie Mae 100% AMI**: ${formatUSD(countyData.baseAmiUsd)} | **140% AMI Cap**: ${formatUSD(countyData.ami140CapUsd)}\n` +
             `• **Income Check**: ${incomeStatus}\n` +
             `• **Conforming Loan Limit**: $832,750 (2026 Oregon 1-Unit Conforming Baseline across all 36 counties)\n` +
             `• **Property Type Rule**: Strictly 1-Unit Primary Residence stick-built SFR, PUD, or Condominium (Manufactured & Multi-Unit ineligible)\n` +
             `• **Estimated DPA Assistance**: ${formatUSD(lakeviewEval.estimatedGrantAmountUsd)} (Soft 2nd lien)\n` +
             `• **Fannie Mae Statutory Schedules**: Area Median Income (AMI) updated annually by **12/1**; Maximum Loan Limits updated annually by **7/1**.\n` +
             (lakeviewEval.disqualificationReasons.length > 0 ? `• **Notes**: ${lakeviewEval.disqualificationReasons.join('; ')}` : '');
    }

    if (lower.includes('ohcs') || lower.includes('firsthome') || lower.includes('hfa') || lower.includes('flex lending')) {
      const countyData = resolveOregonCountyFannieMaeAmi(property.county || property.fipsGeoId || property.city || property.formattedAddress);
      const ohcsEval = evaluateOregonOhcsFlexFirstHomeEligibility({
        state: property.state,
        price: property.price,
        grossAnnualIncome: annualIncome,
        householdSize: 1,
        fipsGeoId: property.fipsGeoId || property.geoid,
        geoid: property.geoid
      });

      const incomeStatus = ohcsEval.isWithinIncomeLimit
        ? `✓ Your combined annualized income (${formatUSD(annualIncome)}) meets the OHCS limit (${formatUSD(ohcsEval.householdIncomeLimitUsd)}) for ${countyData.countyName} County.`
        : `✕ Current combined income (${formatUSD(annualIncome)}) exceeds the OHCS limit (${formatUSD(ohcsEval.householdIncomeLimitUsd)}) for ${countyData.countyName} County. (Check 3+ household size or targeted tract options in LO dashboard).`;

      const priceStatus = ohcsEval.isWithinPurchasePriceLimit
        ? `✓ Purchase price (${formatUSD(property.price)}) is under the county cap (${formatUSD(ohcsEval.purchasePriceLimitUsd)}).`
        : `✕ Purchase price (${formatUSD(property.price)}) exceeds the county cap (${formatUSD(ohcsEval.purchasePriceLimitUsd)}).`;

      return `🌲 **OHCS Flex Lending FirstHome (Oregon HFA) Analysis**:\n` +
             `• **Eligibility Status**: ${ohcsEval.isEligible ? `✓ Eligible for ${ohcsEval.grantPercent}% Cash Assistance DPA` : '⚠️ Ineligible for this property / income profile'}\n` +
             `• **Subject County**: ${countyData.countyName} County ${ohcsEval.isLmiTargetedArea ? '(🎯 Targeted Census Tract: 5.0% Grant + 3-Yr FTHB Waiver)' : '(Standard Area: 4.0% Grant)'}\n` +
             `• **Income Limit**: ${formatUSD(ohcsEval.householdIncomeLimitUsd)} (1-2 Persons)\n` +
             `• **Income Check**: ${incomeStatus}\n` +
             `• **Purchase Price Cap**: ${formatUSD(ohcsEval.purchasePriceLimitUsd)} (${priceStatus})\n` +
             `• **Estimated Cash DPA Grant**: ${formatUSD(ohcsEval.grantAmountUsd)} (${ohcsEval.grantPercent}% of 1st Mortgage - No Repayment Required!)\n` +
             `• **Annual Update Note**: OHCS and eHousingPlus update county income and purchase price schedules annually.\n` +
             (ohcsEval.disqualificationReasons.length > 0 ? `• **Notes**: ${ohcsEval.disqualificationReasons.join('; ')}` : '');
    }

    if (lower.includes('usda') || lower.includes('rural') || lower.includes('section 502')) {
      const isUsdaZone = Boolean(
        property.specialPrograms?.usdaRural100Financing ||
        property.specialPrograms?.usdaRuralEligible
      );
      const usdaEval = evaluateUsdaRdIncomeEligibility(
        annualIncome,
        1,
        property.county || property.fipsGeoId || property.city || property.formattedAddress,
        {
          isUsdaZoneEligible: isUsdaZone,
          isProgramActive: true
        }
      );

      const incomeStatus = usdaEval.isWithinIncomeLimit
        ? `✓ Your combined annualized household income (${formatUSD(annualIncome)}) meets the USDA limit (${formatUSD(usdaEval.applicableIncomeLimitUsd)}) for 1-4 person households in ${usdaEval.countyName} County.`
        : `✕ Current combined income (${formatUSD(annualIncome)}) exceeds the USDA limit (${formatUSD(usdaEval.applicableIncomeLimitUsd)}) for 1-4 person households in ${usdaEval.countyName} County. (Note: 5-8 person household limit is ${formatUSD(usdaEval.incomeLimit5to8Usd)}).`;

      const zoneStatus = isUsdaZone
        ? '✓ Property is located within USDA RD designated rural geographic boundaries.'
        : '✕ Property is located inside an ineligible metro core boundary (Portland, Salem, Eugene, or Bend core).';

      return `🌾 **USDA Rural Development 100% Guaranteed Financing Pre-Screen**:\n` +
             `• **Eligibility Status**: ${usdaEval.isEligible ? '✓ 100% Eligible for $0 Down Financing ($0 Required at Close)' : '⚠️ Ineligible for this property / income profile'}\n` +
             `• **Geographic Zone**: ${zoneStatus}\n` +
             `• **Subject County**: ${usdaEval.countyName} County\n` +
             `• **Household Income Limits**: ${formatUSD(usdaEval.incomeLimit1to4Usd)} (1-4 Persons) | ${formatUSD(usdaEval.incomeLimit5to8Usd)} (5-8 Persons)\n` +
             `• **Income Verification**: ${incomeStatus}\n` +
             `• **Guarantee Fees**: 1.00% Upfront Guarantee Fee (financed into loan) + 0.35% Annual Guarantee Fee (~$${Math.round((price * 0.0035) / 12)}/mo)\n` +
             `• **Statutory Update Schedule**: USDA Rural Development updates household income limits annually by **August 1st (8/1)**.\n` +
             (usdaEval.disqualificationReasons.length > 0 ? `• **Notes**: ${usdaEval.disqualificationReasons.join('; ')}` : '');
    }

    if (lower.includes('nhf') || lower.includes('national homebuyer') || lower.includes('nhfloan')) {
      const nhfEval = evaluateNhfDpaEligibility(
        annualIncome,
        price,
        'FHA',
        property.county || property.fipsGeoId || property.city || property.formattedAddress,
        {
          creditScore: 660,
          isProgramActive: true
        }
      );

      const priceStatus = nhfEval.isWithinPurchasePriceLimit
        ? `✓ Listing price (${formatUSD(price)}) is within the 2026 FHA county purchase price limit (${formatUSD(nhfEval.fhaMaxPurchasePriceLimitUsd)} / max loan: ${formatUSD(nhfEval.fhaMaxLoanLimitUsd)}).`
        : `✕ Listing price (${formatUSD(price)}) exceeds the 2026 FHA county purchase price cap (${formatUSD(nhfEval.fhaMaxPurchasePriceLimitUsd)}) for ${nhfEval.countyName} County.`;

      return `🇺🇸 **National Homebuyers Fund (NHF) Down Payment Assistance Program**:\n` +
             `• **Official Programs**: ${NHF_PROGRAM_CONSTANTS.OFFICIAL_URL}\n` +
             `• **Eligibility Status**: ${nhfEval.isEligible ? `✓ Qualified for up to ${formatUSD(nhfEval.maxEstimatedAssistanceUsd)} DPA Assistance (${nhfEval.maxAssistancePercent}% of loan)` : '⚠️ Criteria check required'}\n` +
             `• **First-Time Homebuyer Rule**: 🌟 **NO First-Time Homebuyer Requirement** (open to repeat buyers & first-time buyers alike!)\n` +
             `• **Loan Types Supported**: FHA (covers full 3.5% down payment), Conventional, VA, and USDA Rural Development\n` +
             `• **2026 FHA Purchase Price Limit**: ${formatUSD(nhfEval.fhaMaxPurchasePriceLimitUsd)} in ${nhfEval.countyName} County (${priceStatus})\n` +
             `• **140% AMI County Income Cap**: ${formatUSD(nhfEval.applicableIncomeLimitUsd)} (Your income: ${formatUSD(annualIncome)})\n` +
             `• **Assistance Options**: Non-repayable gift / grant, forgivable soft 2nd, or 0% interest deferred subordinate lien\n` +
             `• **Net Out-of-Pocket Down Payment**: ${formatUSD(nhfEval.netOutOfPocketDownPaymentUsd)} for FHA\n` +
             `• **Annual Update Schedule**: HUD and FHA update forward mortgage loan limits and maximum purchase price limits annually on **January 1st (1/1)**.\n` +
             `• **Organization Track Record**: ${NHF_PROGRAM_CONSTANTS.ORGANIZATION_TYPE} delivering ${NHF_PROGRAM_CONSTANTS.TOTAL_AID_DELIVERED}.\n` +
             (nhfEval.disqualificationReasons.length > 0 ? `• **Notes**: ${nhfEval.disqualificationReasons.join('; ')}` : '');
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

    if (text === 'TRIGGER_SMS_RELAY') {
      if (onOpenSmsRelay) {
        onOpenSmsRelay();
      } else {
        setShowInquiryModal(true);
      }
      return;
    }

    // Auto-detect credit score intake in user message (e.g., "my credit score is 720", "FICO 650", "credit score 680")
    const ficoMatch = text.match(/(?:credit\s*score|fico|score)\s*(?:is|=|:)?\s*(\d{3})/i) || text.match(/\b(5[89]\d|[67]\d{2}|8[0-4]\d|850)\b/);
    if (ficoMatch && onUpdateCreditScore) {
      const parsedScore = parseInt(ficoMatch[1] || ficoMatch[0], 10);
      if (parsedScore >= 500 && parsedScore <= 850) {
        onUpdateCreditScore(parsedScore);
      }
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
    { label: '📱 Text Note to Kanndice (SMS Relay)', text: 'TRIGGER_SMS_RELAY' },
    { label: '💳 Check Minimum Credit Scores', text: 'What credit score do I need for Lakeview, FirstHome, USDA RD, and NHF DPA?' },
    { label: '💳 Self-Input Credit Score (720 FICO)', text: 'My credit score is 720' },
    { label: '💳 Self-Input Credit Score (660 FICO)', text: 'My credit score is 660' },
    { label: '💳 Self-Input Credit Score (620 FICO)', text: 'My credit score is 620' },
    { label: '❤️ Top 3 Front & Center Tip', text: 'How do I customize my Top 3 Front & Center carousel property listings?' },
    { label: '📍 What City?', text: 'What city are you planning to purchase a house in?' },
    { label: '✨ Curate Low/No-Down Shortlist', text: 'Would you like us to curate a short list of for sale properties in your desired home purchase area that likely qualify for low or no down payment mortgage financing?' },
    { label: '🏷️ Price Cut & Seller Credits', text: 'Can the seller pay closing costs or offer seller concessions with a price reduction?' },
    { label: '✉️ Email LO Re: Lakeview/NHF', text: 'TRIGGER_EMAIL_INQUIRY' },
    { label: '🏞️ Lakeview 100% DPA (660+ Min)', text: 'Can I use Lakeview 100% Zero-Down on this home?' },
    { label: '🌲 OHCS Flex FirstHome (620+ Min)', text: 'What is my grant eligibility with OHCS Flex Lending?' },
    { label: '🌾 USDA 0% Down Zone (680+ Min)', text: 'Is this home inside an eligible USDA Rural Zone?' },
    { label: '⚡ USDA 0% + 2-1 Buydown Stack', text: 'Can I stack zero-down USDA RD or low-down programs with a 2-1 rate buydown funded by seller credits?' },
    { label: '💰 Cash Needed at Close', text: 'How much cash do I need at closing for this property?' },
    { label: '🔑 HomeReady 3% Down', text: 'Check Fannie Mae HomeReady eligibility and PMI savings' }
  ];

  const isFavoriteProperty = typeof window !== 'undefined' && (() => {
    try {
      const saved = localStorage.getItem('vantage_geomap_lead_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.includes(property.id);
      }
    } catch {}
    return false;
  })();

  if (isCarouselOnlyView && !isChatExpanded) {
    return (
      <div className={`bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Vantage AI Co-Branded Mortgage Chat Desk Active
            </h4>
            <p className="text-[10px] text-stone-400">
              Inquire about USDA zero-down, local grants, or request a tour showing instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsChatExpanded(true)}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Open Interactive AI Advisor ({assignedLoanOfficerName})</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex flex-col ${className}`}>
      {/* Top Header Bar */}
      <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white tracking-wide">
                {hasPairedAgent && assignedAgentName
                  ? `${assignedLoanOfficerName} & ${assignedAgentName} Partner Portal`
                  : `${assignedLoanOfficerName} Direct Loan Officer Desk`}
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-stone-900 border border-stone-700 text-stone-300">
                {hasPairedAgent ? 'Co-Branded Live Relay' : 'Solo LO • 0 Agent Relay'}
              </span>
              {isFavoriteProperty && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1 shadow-xs">
                  <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                  <span>Top 3 Front & Center</span>
                </span>
              )}
              {(Boolean(property.isGeoMapPluginDefault) || (typeof window !== 'undefined' && localStorage.getItem('vantage_geomap_default_property_id') === property.id)) && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  <span>GeoMap Default Listing</span>
                </span>
              )}
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

          {isCarouselOnlyView && (
            <button
              type="button"
              onClick={() => setIsChatExpanded(false)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-900 text-stone-400 hover:text-white border border-stone-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Collapse Interactive Advisor"
            >
              <X className="w-3 h-3" />
              <span>Close Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Chat Thread + Optional Income Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px] max-h-[420px]">
        {/* Chat Thread Area */}
        <div className={`${showIncomeSidebar ? 'md:col-span-8 border-r border-stone-800' : 'md:col-span-12'} flex flex-col justify-between p-3 bg-stone-900/60`}>
          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px] scrollbar-thin scrollbar-thumb-stone-800">
            {property.proactiveLoNote && (
              <div className="p-3 bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-500/50 rounded-xl text-xs space-y-1 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Loan Officer Strategy Note ({assignedLoanOfficerName}):</span>
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    Pushed to App
                  </span>
                </div>
                <p className="text-stone-200 italic font-medium">"{property.proactiveLoNote}"</p>
              </div>
            )}
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

      {/* Curated Listings & Direct Response Explanatory Notice */}
      <div className="p-3.5 bg-stone-950/95 border-t border-stone-800 text-[11px] text-stone-300 leading-relaxed space-y-1.5">
        <p>
          <strong className="text-amber-400 font-bold">Curated Property Listings Notice: </strong>
          These recently for sale property listings are curated to try and match your desired home purchase area+low or now downpayment home loan programs. You can always click the Zillow link inside the cards to verify current sales status or current price or any other details our GeoMap might be missing or is a little outdated even though we strive to keep data as fresh as possible for you and feel free to type in the NOTES of any card to reqeust a tour/showing or request a a new curated for sale property list in a different desired purchase city or have prequalifcation questions, etc and we will respond right back in the notes for you ASAP!
        </p>
      </div>

      {/* Always at the bottom of the notes sections of every property listing cards: LO profile card if solo or LO+agent profile cards if co-branded pair */}
      <div className="p-3 bg-stone-950 border-t border-stone-800">
        <ListingNotesProfileFooter
          assignedLoanOfficerName={assignedLoanOfficerName}
          assignedAgentName={assignedAgentName}
          hasPairedAgent={hasPairedAgent}
          propertyAddress={`${property.addressLine1}, ${property.city}, ${property.state} ${property.zipCode}`}
          onRequestTour={() => {
            setInputText(`Hi ${hasPairedAgent && assignedAgentName ? assignedAgentName : assignedLoanOfficerName}, I would like to request a private tour/showing for ${property.addressLine1}.`);
          }}
          onAskQuestion={(topic) => {
            setInputText(`I have a question regarding down payment and financing on ${property.addressLine1}.`);
          }}
        />
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
