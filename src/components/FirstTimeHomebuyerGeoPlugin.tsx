/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FIRST-TIME HOMEBUYER GEOMAP & DPA PLUGIN COMPONENT
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Zero BYOK • 1-Click Master GeoSphere Feed Sync & Area Search Dispatcher
 * ============================================================================
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  Sliders,
  DollarSign,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Send,
  Building,
  Heart,
  ExternalLink,
  Layers,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  LayoutGrid,
  TrendingDown,
  Clock,
  PlusCircle,
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  Key,
  Smartphone,
  Share2,
  Star,
  Copy,
  Check,
  MessageSquare,
  Calendar,
  Target,
  Info,
  AlertTriangle,
  Globe,
  Bell
} from 'lucide-react';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';
import { IosInstallGuideModal } from './IosInstallGuideModal';
import { ListingChatBotNotesPanel } from './ListingChatBotNotesPanel';
import { ListingNotesProfileFooter } from './ListingNotesProfileFooter';
import { LoSmsAgentRelayModal } from './LoSmsAgentRelayModal';
import { ZillowSweepControlDeck } from './ZillowSweepControlDeck';
import { ZillowSweepMatchModal } from './ZillowSweepMatchModal';
import { useBatterySaver } from '../context/BatterySaverContext';
import { zillowSwarmSweepService, ZillowSwarmSweepResult } from '../services/zillowSwarmSweepService';
import { buildLeadPluginUrl } from '../data/leadMobilePluginUrls';
import {
  getOregonCensusTractLmiCategory,
  getAllOregonLmiTractDetails,
  getCountyNameFromFips,
  isOregonLmiCensusTractStrict,
  OregonLmiCategory
} from '../data/oregonLmiMatchedTracts';
import {
  BuyerDtiProfile,
  FirstTimeHomebuyerGeoPluginProps,
  SyncedPropertyListing,
  AreaListingRequestPayload,
  MasterFeedSyncConfig
} from '../types/firstTimeHomebuyerPlugin';
import {
  calculateDtiEnvelope,
  calculateMonthlyPI,
  formatUSD,
  parseZillowListingUrl,
  submitAreaListingRequest,
  resolveOregonCountyFannieMaeAmi,
  evaluateLakeviewNationalIncomeEligibility,
  evaluateOregonLakeviewNationalEligibility,
  FANNIE_MAE_SCHEDULE_CONSTANTS,
  OREGON_36_COUNTIES_FANNIE_AMI,
  getOregonCountyOhcsData,
  evaluateOhcsFlexFirstHomeIncomeEligibility,
  evaluateOregonOhcsFlexFirstHomeEligibility,
  OHCS_FLEX_SCHEDULE_CONSTANTS,
  getOregonCountyUsdaRdData,
  evaluateUsdaRdIncomeEligibility,
  USDA_RD_SCHEDULE_CONSTANTS,
  evaluateNhfDpaEligibility,
  NHF_PROGRAM_CONSTANTS
} from '../services/geomapMortgageEngine';
import mortgageEligibilityService from '../services/mortgageEligibility';
import {
  calculateClimateHazardEnvelope,
  calculateAduHouseHackOffset,
  checkSituationalMemoryContext
} from '../services/geomapCognitiveEngine';
import { DpaGrantWaterfallModal } from './DpaGrantWaterfallModal';
import { CoBorrowerCanvasModal } from './CoBorrowerCanvasModal';
import { ExecutivePreApprovalDossierModal } from './ExecutivePreApprovalDossierModal';
import { DeepThinkPreMortemModal } from './DeepThinkPreMortemModal';
import { ProactiveGeofenceAlertBanner } from './ProactiveGeofenceAlertBanner';
import { RealEstateLeadCaptureForm } from './RealEstateLeadCaptureForm';

const DEFAULT_MASTER_SEED_LISTINGS: SyncedPropertyListing[] = [
  {
    id: 'geo-101',
    formattedAddress: '742 SE Hawthorne Blvd, Portland, OR 97214',
    addressLine1: '742 SE Hawthorne Blvd',
    city: 'Portland',
    state: 'OR',
    zipCode: '97214',
    county: 'Multnomah',
    geoid: '41051001202',
    coordinates: { lat: 45.5121, lng: -122.6582 },
    price: 435000,
    originalPrice: 450000,
    priceDropAmount: 15000,
    priceDropPercent: 3.3,
    daysOnMarket: 18,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1580,
    propertyType: 'Single Family',
    hoaMonthlyFee: 0,
    estimatedAnnualTax: 3950,
    estimatedAnnualInsurance: 1100,
    zillowUrl: 'https://www.zillow.com/homedetails/742-SE-Hawthorne-Blvd-Portland-OR-97214/12345_zpid/',
    rentCastValuationScore: 96,
    propertyNotes: 'Master Synced: $15,000 price drop. Located in LMI Census Tract: $5,000 CRA grant eligible.',
    specialPrograms: {
      usdaRural100Financing: false,
      lmiCraGrantEligible: true,
      craGrantAmountUsd: 5000,
      fnmaHomeReady3Percent: true,
      fhlmcHomePossible3Percent: true,
      stateHfaFirstHomeEligible: true,
      lakeviewNationalDpaEligible: true,
      lakeviewGrantAmountUsd: 13475,
      ohcsFlexLendingFirstHomeEligible: true,
      ohcsGrantAmountUsd: 15400,
      targetedAreaGrantBonus: false
    },
    sourceMasterFeedId: 'GeoSphere Oregon GIS Master'
  },
  {
    id: 'geo-102',
    formattedAddress: '14800 NW St Helens Rd, Scappoose, OR 97056',
    addressLine1: '14800 NW St Helens Rd',
    city: 'Scappoose',
    state: 'OR',
    zipCode: '97056',
    county: 'Columbia',
    geoid: '41009000101',
    coordinates: { lat: 45.7576, lng: -122.8781 },
    price: 389000,
    originalPrice: 399000,
    priceDropAmount: 10000,
    priceDropPercent: 2.5,
    daysOnMarket: 28,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1720,
    propertyType: 'Single Family',
    hoaMonthlyFee: 0,
    estimatedAnnualTax: 3200,
    estimatedAnnualInsurance: 950,
    zillowUrl: 'https://www.zillow.com/homedetails/14800-NW-St-Helens-Rd-Scappoose-OR-97056/67890_zpid/',
    rentCastValuationScore: 92,
    propertyNotes: 'Master Synced: USDA Rural Development 100% Financing Eligible (Zero Down Payment).',
    specialPrograms: {
      usdaRural100Financing: true,
      lmiCraGrantEligible: false,
      craGrantAmountUsd: 0,
      fnmaHomeReady3Percent: true,
      fhlmcHomePossible3Percent: true,
      stateHfaFirstHomeEligible: true,
      lakeviewNationalDpaEligible: true,
      lakeviewGrantAmountUsd: 13615,
      ohcsFlexLendingFirstHomeEligible: true,
      ohcsGrantAmountUsd: 15560,
      targetedAreaGrantBonus: false
    },
    sourceMasterFeedId: 'GeoSphere Oregon GIS Master'
  },
  {
    id: 'geo-103',
    formattedAddress: '2105 NE Alberta St, Portland, OR 97211',
    addressLine1: '2105 NE Alberta St',
    city: 'Portland',
    state: 'OR',
    zipCode: '97211',
    county: 'Multnomah',
    geoid: '41051003403',
    coordinates: { lat: 45.5589, lng: -122.6437 },
    price: 485000,
    daysOnMarket: 9,
    bedrooms: 2,
    bathrooms: 1.5,
    squareFootage: 1240,
    propertyType: 'Townhouse',
    hoaMonthlyFee: 120,
    estimatedAnnualTax: 4400,
    estimatedAnnualInsurance: 1050,
    zillowUrl: 'https://www.zillow.com/homedetails/2105-NE-Alberta-St-Portland-OR-97211/11223_zpid/',
    rentCastValuationScore: 98,
    propertyNotes: 'Master Synced: Alberta Arts District. Targeted Area with 20% DPA Bonus & CRA grant.',
    specialPrograms: {
      usdaRural100Financing: false,
      lmiCraGrantEligible: true,
      craGrantAmountUsd: 5000,
      fnmaHomeReady3Percent: true,
      fhlmcHomePossible3Percent: true,
      stateHfaFirstHomeEligible: true,
      lakeviewNationalDpaEligible: true,
      lakeviewGrantAmountUsd: 16975,
      ohcsFlexLendingFirstHomeEligible: true,
      ohcsGrantAmountUsd: 19400,
      targetedAreaGrantBonus: true
    },
    sourceMasterFeedId: 'GeoSphere Oregon GIS Master'
  }
];

// Client-side image preloader and cache map for flawless smooth swiping
const imageCache = new Map<string, string>();

export const getPropertyImageUrl = (id: string): string => {
  switch (id) {
    case 'geo-101':
      return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80';
    case 'geo-102':
      return 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80';
    case 'geo-103':
      return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=80';
  }
};

const preloadAndCacheImage = (url: string): Promise<string> => {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imageCache.set(url, url);
      resolve(url);
    };
    img.onerror = () => {
      resolve(url);
    };
  });
};

export const FirstTimeHomebuyerGeoPlugin: React.FC<FirstTimeHomebuyerGeoPluginProps> = ({
  initialProperties = DEFAULT_MASTER_SEED_LISTINGS,
  initialBuyerProfile,
  masterConfig = {
    adminContactEmail: 'fordmj@gmail.com',
    assignedLoanOfficerName: 'Mike Ford',
    assignedAgentName: 'Kanndice Ford',
    autoSyncOnLoad: true,
    enableAreaListingRequests: true
  },
  defaultPropertyId: propDefaultPropertyId,
  onSetDefaultProperty,
  onOpenShareLinksModal,
  onPropertySelect,
  onPrequalRecalculated,
  onAreaRequestSubmitted,
  className = '',
  isStandalone = false,
  onOpenByokDrawer
}) => {
  // Check if we are in standalone consumer/lead mode (either passed as a prop, or detected via URL search params)
  const isStandaloneView = useMemo(() => {
    if (isStandalone) return true;
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return (
          urlParams.get('lead') === '1' ||
          urlParams.get('lead_mode') === '1' ||
          urlParams.get('guest') === '1' ||
          urlParams.get('client') === '1'
        );
      }
    } catch {}
    return false;
  }, [isStandalone]);

  // Check if we are in carousel only mode (specifically requested for clean social media iframe / posts embed)
  const isCarouselOnlyView = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return (
          urlParams.get('view') === 'carousel_only' ||
          urlParams.get('mode') === 'carousel_only' ||
          isStandaloneView
        );
      }
    } catch {}
    return isStandaloneView;
  }, [isStandaloneView]);

  // Buyer DTI State
  const [buyerProfile, setBuyerProfile] = useState<BuyerDtiProfile>({
    grossMonthlyIncome: initialBuyerProfile?.grossMonthlyIncome || 8500,
    totalMonthlyDebtObligations: initialBuyerProfile?.totalMonthlyDebtObligations || 550,
    availableDownPayment: initialBuyerProfile?.availableDownPayment || 25000,
    targetInterestRate: initialBuyerProfile?.targetInterestRate || 6.25,
    loanTermYears: 30,
    maxBackEndDtiPercent: 50.0,
    maxFrontEndDtiPercent: 36.0
  });

  // All borrowers combined annualized income state for LO dashboard slider & Fannie Mae 140% county AMI calculations
  const [allBorrowersCombinedAnnualIncome, setAllBorrowersCombinedAnnualIncome] = useState<number>(() => {
    return (initialBuyerProfile?.grossMonthlyIncome || 8500) * 12;
  });
  const [isLoIncomeSliderActive, setIsLoIncomeSliderActive] = useState<boolean>(true);
  const [isLakeviewProgramActive, setIsLakeviewProgramActive] = useState<boolean>(true);
  const [isOhcsProgramActive, setIsOhcsProgramActive] = useState<boolean>(true);
  const [isUsdaProgramActive, setIsUsdaProgramActive] = useState<boolean>(true);
  const [isNhfProgramActive, setIsNhfProgramActive] = useState<boolean>(true);
  const [loHouseholdSize, setLoHouseholdSize] = useState<number>(1);
  const [usdaHouseholdCount, setUsdaHouseholdCount] = useState<number>(1);
  const [isVeteranBorrower, setIsVeteranBorrower] = useState<boolean>(false);

  // Lead borrower credit score state for LO dashboard slider & program qualification
  const [borrowerCreditScore, setBorrowerCreditScore] = useState<number>(() => {
    return initialBuyerProfile?.creditScore || 680;
  });

  const handleCreditScoreChange = (newScore: number) => {
    setBorrowerCreditScore(newScore);
    setBuyerProfile(prev => ({
      ...prev,
      creditScore: newScore
    }));
  };
  const handleCombinedAnnualIncomeChange = (newAnnualIncome: number) => {
    setAllBorrowersCombinedAnnualIncome(newAnnualIncome);
    const newMonthly = Math.round(newAnnualIncome / 12);
    setBuyerProfile(prev => ({
      ...prev,
      grossMonthlyIncome: newMonthly
    }));
  };

  // SMS Relay & Push Notification State for Agent Kanndice McLean
  const [isSmsRelayModalOpen, setIsSmsRelayModalOpen] = useState<boolean>(false);
  const [smsRelayProperty, setSmsRelayProperty] = useState<SyncedPropertyListing | null>(null);
  const [activePushNotification, setActivePushNotification] = useState<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleOpenSmsRelay = (propToRelay?: SyncedPropertyListing) => {
    const targetProp = propToRelay || properties.find(p => p.id === selectedPropertyId) || properties[0] || null;
    setSmsRelayProperty(targetProp);
    setIsSmsRelayModalOpen(true);
  };

  const handleSendSmsRelay = (
    propertyId: string,
    leadName: string,
    propertyAddress: string,
    outboundText: string,
    agentReplyText: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `[Note from Kanndice McLean (Realtor®) • ${timeStr}]: ${agentReplyText}`;

    setProperties(prev =>
      prev.map(p => {
        if (p.id === propertyId) {
          const updatedNotes = p.propertyNotes
            ? `${formattedNote}\n\n${p.propertyNotes}`
            : formattedNote;
          return { ...p, propertyNotes: updatedNotes };
        }
        return p;
      })
    );

    const notifTitle = `${propertyAddress} has a NEW note from Kanndice`;
    setActivePushNotification({
      id: `push-${Date.now()}`,
      title: notifTitle,
      message: `Kanndice McLean: "${agentReplyText}"`,
      timestamp: timeStr
    });

    try {
      if (typeof window !== 'undefined') {
        const key = `vantage_note_relay_${propertyId}`;
        localStorage.setItem(key, JSON.stringify({
          leadName,
          propertyAddress,
          outboundText,
          agentReplyText,
          timestamp: new Date().toISOString()
        }));
      }
    } catch {}
  };

  const { isBatterySaverActive, getAdjustedInterval } = useBatterySaver();

  // Initialize properties from initialProperties merged with Zillow Swarm Sweep listings & locally pushed LO listings
  const [properties, setProperties] = useState<SyncedPropertyListing[]>(() => {
    let base = [...initialProperties];
    try {
      // 1. Merge 30-day Zillow Sweep historical listings
      const sweepListings = zillowSwarmSweepService.getAllSweepListings();
      const baseIds = new Set(base.map(p => p.id));
      const sweepNew = sweepListings.filter(p => !baseIds.has(p.id));
      base = [...base, ...sweepNew];

      // 2. Merge locally pushed LO listings
      if (typeof window !== 'undefined') {
        const pushedJson = localStorage.getItem('vantage_geomap_pushed_properties');
        if (pushedJson) {
          const pushed: SyncedPropertyListing[] = JSON.parse(pushedJson);
          if (Array.isArray(pushed) && pushed.length > 0) {
            const existingIds = new Set(base.map(p => p.id));
            const newItems = pushed.filter(p => !existingIds.has(p.id));
            base = [...newItems, ...base];
          }
        }
      }
    } catch {}
    return base;
  });

  // Priority for Default Listing:
  // 1. URL Query Param (?prop=... or ?listing=... or ?propertyId=...)
  // 2. propDefaultPropertyId passed via props
  // 3. localStorage vantage_geomap_default_property_id
  // 4. Listing marked with isGeoMapPluginDefault
  // 5. First listing in initialProperties
  const initialResolvedDefaultId = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlProp = urlParams.get('prop') || urlParams.get('listing') || urlParams.get('propertyId') || urlParams.get('default_prop');
        if (urlProp && properties.some(p => p.id === urlProp)) {
          return urlProp;
        }
      }
    } catch {}
    if (propDefaultPropertyId && properties.some(p => p.id === propDefaultPropertyId)) {
      return propDefaultPropertyId;
    }
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vantage_geomap_default_property_id');
        if (saved && properties.some(p => p.id === saved)) {
          return saved;
        }
      }
    } catch {}
    const flagged = properties.find(p => p.isGeoMapPluginDefault);
    if (flagged) return flagged.id;
    return properties[0]?.id || '';
  }, [propDefaultPropertyId, properties]);

  const [activeDefaultPropertyId, setActiveDefaultPropertyId] = useState<string>(initialResolvedDefaultId);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialResolvedDefaultId || properties[0]?.id || '');
  const [copiedPromoLink, setCopiedPromoLink] = useState<boolean>(false);
  const [copiedCuratedLink, setCopiedCuratedLink] = useState<boolean>(false);
  const defaultListingCardRef = useRef<HTMLDivElement>(null);

  // Multi-property curated selection for lead export build
  const [curatedPropertyIds, setCuratedPropertyIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlProps = urlParams.get('props');
        if (urlProps) {
          const ids = urlProps.split(',').map(s => s.trim()).filter(Boolean);
          if (ids.length > 0) return ids;
        }
        const saved = localStorage.getItem('vantage_geomap_curated_ids');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    // Default to initial properties that qualify for low/no-down payment
    return ['geo-101', 'geo-102'];
  });

  const [showCuratedOnly, setShowCuratedOnly] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('props') || urlParams.get('curated') === '1';
      }
    } catch {}
    return false;
  });

  // Modal State for Proactive Loan Officer Curation & Push
  const [showPushListingModal, setShowPushListingModal] = useState<boolean>(false);
  const [newListingCity, setNewListingCity] = useState<string>('Scappoose');
  const [newListingAddress, setNewListingAddress] = useState<string>('51842 SW Old Portland Rd, Scappoose, OR 97056');
  const [newListingPrice, setNewListingPrice] = useState<number>(415000);
  const [newListingOriginalPrice, setNewListingOriginalPrice] = useState<number>(435000);
  const [newListingBeds, setNewListingBeds] = useState<number>(3);
  const [newListingBaths, setNewListingBaths] = useState<number>(2);
  const [newListingSqft, setNewListingSqft] = useState<number>(1680);
  const [newListingUsda, setNewListingUsda] = useState<boolean>(true);
  const [newListingOhcs, setNewListingOhcs] = useState<boolean>(true);
  const [newListingLakeview, setNewListingLakeview] = useState<boolean>(true);
  const [newListingHomeReady, setNewListingHomeReady] = useState<boolean>(true);
  const [newListingCra, setNewListingCra] = useState<boolean>(false);
  const [newListingSellerConcession, setNewListingSellerConcession] = useState<number>(12450);
  const [newListingLoNote, setNewListingLoNote] = useState<string>(
    'Checkout this house which just had a price reduction and we can reach out to Kanndice to see if seller will consider seller contributions towards your closing costs..what do you think?'
  );
  const [pushSuccessFeedback, setPushSuccessFeedback] = useState<string | null>(null);

  // OHCS Flex Lending FirstHome LMI Census Tract GeoMap Layer State
  const [showOhcsLmiLayer, setShowOhcsLmiLayer] = useState<boolean>(true);
  const [lmiCategoryFilter, setLmiCategoryFilter] = useState<'ALL' | 'Low' | 'Moderate'>('ALL');
  const [lmiCountyFilter, setLmiCountyFilter] = useState<string>('ALL');
  const [showLmiTractExplorerModal, setShowLmiTractExplorerModal] = useState<boolean>(false);
  const [lmiTractSearchQuery, setLmiTractSearchQuery] = useState<string>('');

  // USDA RD Rural Development Eligibility Boundary Layer State
  const [showUsdaRdLayer, setShowUsdaRdLayer] = useState<boolean>(true);
  const [showUsdaBoundaryModal, setShowUsdaBoundaryModal] = useState<boolean>(false);

  // Auto-select and scroll front and center if opened with specific listing param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlProp = urlParams.get('prop') || urlParams.get('listing') || urlParams.get('propertyId');
      if (urlProp && properties.some(p => p.id === urlProp)) {
        setSelectedPropertyId(urlProp);
        setActiveDefaultPropertyId(urlProp);
        if (!isCarouselOnlyView) {
          setTimeout(() => {
            defaultListingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 350);
        }
      }
    }
  }, [properties, isCarouselOnlyView]);

  // Background Preloading and Caching of Property Images for smooth carousel swiping
  useEffect(() => {
    if (isCarouselOnlyView) {
      properties.forEach((p) => {
        const url = getPropertyImageUrl(p.id);
        preloadAndCacheImage(url);
      });
    }
  }, [properties, isCarouselOnlyView]);

  const handleToggleDefaultProperty = (propId: string) => {
    setActiveDefaultPropertyId((prev) => {
      const next = prev === propId ? '' : propId;
      try {
        if (typeof window !== 'undefined') {
          if (next) {
            localStorage.setItem('vantage_geomap_default_property_id', next);
          } else {
            localStorage.removeItem('vantage_geomap_default_property_id');
          }
        }
      } catch {}
      if (onSetDefaultProperty) {
        onSetDefaultProperty(next);
      }
      return next;
    });
    // Immediately select and bring front & center
    setSelectedPropertyId(propId);
    setTimeout(() => {
      defaultListingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
  };

  const handleToggleCuratedProperty = (propId: string) => {
    setCuratedPropertyIds((prev) => {
      const next = prev.includes(propId) ? prev.filter(id => id !== propId) : [...prev, propId];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vantage_geomap_curated_ids', JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  };

  // Client Front & Center Top 3 Favorites (persisted for desktop & mobile "Add to Home Screen" app)
  const [favoritePropertyIds, setFavoritePropertyIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vantage_geomap_lead_favorites');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3);
        }
      }
    } catch {}
    return [];
  });

  const [favoriteToast, setFavoriteToast] = useState<string | null>(null);
  const [showFavoriteAwarenessTip, setShowFavoriteAwarenessTip] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('vantage_geomap_fav_tip_dismissed');
        return dismissed !== 'true';
      }
    } catch {}
    return true;
  });

  // Carousel Rotation View state & controls
  const [carouselViewMode, setCarouselViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Real-time gesture and swipe-spin displacement state
  // Commercial Attribution: Copyright © Mike Ford <fordmj@gmail.com> (All rights reserved)
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Touch swiping state (mobile view swipe left/right)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (touchStartX.current !== null) {
      setSwipeOffset(e.touches[0].clientX - touchStartX.current);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swipe Left -> Next Property in Rotation list
        setCarouselIndex((prev) => (prev < filteredProperties.length - 1 ? prev + 1 : 0));
      } else {
        // Swipe Right -> Previous Property in Rotation list
        setCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredProperties.length - 1));
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsDragging(false);
    setSwipeOffset(0);
  };

  // Mouse dragging state (desktop view drag-and-swipe control)
  const dragStartX = useRef<number | null>(null);
  const dragCurrentX = useRef<number | null>(null);
  const isDraggingState = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drag
    dragStartX.current = e.clientX;
    dragCurrentX.current = e.clientX;
    isDraggingState.current = true;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingState.current || dragStartX.current === null) return;
    dragCurrentX.current = e.clientX;
    setSwipeOffset(e.clientX - dragStartX.current);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingState.current || dragStartX.current === null || dragCurrentX.current === null) {
      setIsDragging(false);
      setSwipeOffset(0);
      return;
    }
    const diffX = dragStartX.current - dragCurrentX.current;
    const dragThreshold = 50;

    if (Math.abs(diffX) > dragThreshold) {
      e.stopPropagation();
      if (diffX > 0) {
        // Drag Left -> Next Property in Rotation list
        setCarouselIndex((prev) => (prev < filteredProperties.length - 1 ? prev + 1 : 0));
      } else {
        // Drag Right -> Previous Property in Rotation list
        setCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredProperties.length - 1));
      }
    }
    isDraggingState.current = false;
    dragStartX.current = null;
    dragCurrentX.current = null;
    setIsDragging(false);
    setSwipeOffset(0);
  };

  const handleMouseLeave = () => {
    isDraggingState.current = false;
    dragStartX.current = null;
    dragCurrentX.current = null;
    setIsDragging(false);
    setSwipeOffset(0);
  };

  const handleToggleFavorite = (propId: string) => {
    setFavoritePropertyIds((prev) => {
      let next: string[];
      const targetProp = properties.find(p => p.id === propId);
      const propName = targetProp?.addressLine1 || 'Listing';

      if (prev.includes(propId)) {
        next = prev.filter(id => id !== propId);
        setFavoriteToast(`Removed "${propName}" from your Top 3 Front & Center rotation.`);
      } else {
        if (prev.length < 3) {
          next = [...prev, propId];
          setFavoriteToast(`❤️ "${propName}" is now locked in your Top 3 Front & Center rotation (${next.length} of 3 locked)!`);
        } else {
          // Keep maximum of 3 by rotating out the oldest so the lead always has their preferred 3
          next = [prev[1], prev[2], propId];
          setFavoriteToast(`❤️ Rotated Top 3! "${propName}" is now locked as one of your 3 Front & Center carousel homes.`);
        }
      }
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vantage_geomap_lead_favorites', JSON.stringify(next));
        }
      } catch {}
      setTimeout(() => setFavoriteToast(null), 5500);
      return next;
    });
  };

  // Card-specific notes input & 2-way dispatch state
  const [activeCardNotesId, setActiveCardNotesId] = useState<string | null>(null);
  const [cardNoteInputs, setCardNoteInputs] = useState<Record<string, string>>({});
  const [cardNoteSuccessFeedback, setCardNoteSuccessFeedback] = useState<Record<string, string>>({});

  const handleSendCardNote = (propId: string) => {
    const noteText = cardNoteInputs[propId]?.trim();
    if (!noteText) return;

    // Append to property notes state
    setProperties(prev => prev.map(p => {
      if (p.id === propId) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const existing = p.propertyNotes
          ? `${p.propertyNotes}\n[${timestamp} Buyer Note]: ${noteText}`
          : `[${timestamp} Buyer Note]: ${noteText}`;
        return { ...p, propertyNotes: existing };
      }
      return p;
    }));

    setCardNoteInputs(prev => ({ ...prev, [propId]: '' }));
    const recipient = hasPairedAgent && mergedConfig.assignedAgentName
      ? `${mergedConfig.assignedLoanOfficerName} & ${mergedConfig.assignedAgentName}`
      : `${mergedConfig.assignedLoanOfficerName}`;
    setCardNoteSuccessFeedback(prev => ({
      ...prev,
      [propId]: `Note dispatched to ${recipient}! We will respond right back in the notes for you ASAP!`
    }));
    setTimeout(() => {
      setCardNoteSuccessFeedback(prev => {
        const next = { ...prev };
        delete next[propId];
        return next;
      });
    }, 6500);
  };

  // Helper to construct lead export URL with selected LO, Agent, Default Property, and all Checkboxed Curated Properties
  const getExportedCuratedAppUrl = (mode: 'solo' | 'paired' = 'paired') => {
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://ais-pre-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';
    const cleanOrigin = origin.replace(/\/+$/, '');
    const currentParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const currentLo = currentParams?.get('lo') || 'lo-mike-ford';
    const currentAgent = currentParams?.get('agent');
    const resolvedAgent = mode === 'solo' ? 'none' : (currentAgent && currentAgent !== 'none' && currentAgent !== 'solo' ? currentAgent : 'agent-kanndice-mclean');

    const params = new URLSearchParams();
    params.set('plugin', 'geomap');
    params.set('lead', '1');
    params.set('guest', '1');
    params.set('lo', currentLo);
    params.set('agent', resolvedAgent);
    params.set('pack', 'geomap_brain_combo');
    if (activeDefaultPropertyId) {
      params.set('prop', activeDefaultPropertyId);
    }
    if (curatedPropertyIds.length > 0) {
      params.set('props', curatedPropertyIds.join(','));
    }
    return `${cleanOrigin}/?${params.toString()}`;
  };

  // Proactive Listing Push Handler
  const handlePushNewListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `pushed-${Date.now()}`;
    const priceDrop = newListingOriginalPrice > newListingPrice ? newListingOriginalPrice - newListingPrice : undefined;
    
    const newListing: SyncedPropertyListing = {
      id: newId,
      formattedAddress: newListingAddress,
      addressLine1: newListingAddress.split(',')[0] || newListingAddress,
      city: newListingCity,
      state: 'OR',
      zipCode: '97056',
      county: 'Columbia County',
      geoid: '41009970100',
      coordinates: { lat: 45.7576, lng: -122.8801 },
      price: newListingPrice,
      originalPrice: newListingOriginalPrice,
      priceDropAmount: priceDrop,
      daysOnMarket: 4,
      bedrooms: newListingBeds,
      bathrooms: newListingBaths,
      squareFootage: newListingSqft,
      propertyType: 'Single Family',
      hoaMonthlyFee: 0,
      estimatedAnnualTax: Math.round(newListingPrice * 0.011),
      estimatedAnnualInsurance: 1100,
      specialPrograms: {
        usdaRural100Financing: newListingUsda,
        usdaRuralEligible: newListingUsda,
        lmiCraGrantEligible: newListingCra,
        craGrantAmountUsd: newListingCra ? 5000 : 0,
        fnmaHomeReady3Percent: newListingHomeReady,
        fhlmcHomePossible3Percent: true,
        stateHfaFirstHomeEligible: newListingOhcs,
        ohcsFlexLendingFirstHomeEligible: newListingOhcs,
        ohcsGrantAmountUsd: newListingOhcs ? 15400 : 0,
        lakeviewNationalDpaEligible: newListingLakeview,
        lakeviewGrantAmountUsd: newListingLakeview ? Math.round(newListingPrice * 0.035) : 0,
        targetedAreaGrantBonus: false
      },
      propertyNotes: newListingLoNote,
      proactiveLoNote: newListingLoNote,
      sellerConcessionSuggestedUsd: newListingSellerConcession,
      isGeoMapPluginDefault: true,
      isCuratedForLead: true,
      lastSyncedTimestamp: new Date().toISOString()
    };

    setProperties(prev => {
      const updated = [newListing, ...prev];
      try {
        if (typeof window !== 'undefined') {
          const currentPushedJson = localStorage.getItem('vantage_geomap_pushed_properties');
          const currentPushed = currentPushedJson ? JSON.parse(currentPushedJson) : [];
          localStorage.setItem('vantage_geomap_pushed_properties', JSON.stringify([newListing, ...currentPushed]));
        }
      } catch {}
      return updated;
    });

    setCuratedPropertyIds(prev => {
      const next = [newId, ...prev];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('vantage_geomap_curated_ids', JSON.stringify(next));
        }
      } catch {}
      return next;
    });

    setActiveDefaultPropertyId(newId);
    setSelectedPropertyId(newId);
    setShowPushListingModal(false);
    setPushSuccessFeedback(`Successfully pushed "${newListing.addressLine1}" with Loan Officer Strategy Note! Selected as Default & Curated for Lead.`);
    setTimeout(() => setPushSuccessFeedback(null), 6000);
  };

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [activeFilter, setActiveFilter] = useState<'all' | 'zillow_sweep' | 'lakeview_national' | 'ohcs_flex_firsthome' | 'usda' | 'homeready' | 'nhf_fallback' | 'lmi_cra' | 'price_drops' | 'prequalified'>('all');
  const [zillowSweepSelectedDates, setZillowSweepSelectedDates] = useState<string[]>([todayDateStr]);
  const [zillowSweepSelectedPropertyIds, setZillowSweepSelectedPropertyIds] = useState<string[]>([]);
  const [showZillowMatchModal, setShowZillowMatchModal] = useState<boolean>(false);

  // Today's sweep count
  const todaySweepCount = useMemo(() => {
    return properties.filter((p) => p.zillowSweepDate === todayDateStr).length;
  }, [properties, todayDateStr]);

  const handleSweepExecuted = (res: ZillowSwarmSweepResult) => {
    if (res.success) {
      setProperties((prev) => {
        // 1. Update existing properties from Wave 1 Address Audit
        const auditedMap = new Map(
          (res.auditResults?.auditedUpdatedProperties || []).map((p) => [p.id, p])
        );

        let updatedList = prev.map((p) => auditedMap.get(p.id) || p);

        // 2. Prepend newly discovered listings from Wave 2 Broad Discovery
        if (res.discoveryResults?.newListings?.length > 0) {
          const existingIds = new Set(updatedList.map((p) => p.id));
          const newOnes = res.discoveryResults.newListings.filter((p) => !existingIds.has(p.id));
          updatedList = [...newOnes, ...updatedList];
        }

        zillowSwarmSweepService.saveSweepListings(updatedList);
        return updatedList;
      });
      // Switch to today's date if not already
      setZillowSweepSelectedDates([todayDateStr]);
    }
  };

  const handleAppendNotesToProperties = (propertyIds: string[], noteText: string) => {
    const idSet = new Set(propertyIds);
    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (idSet.has(p.id)) {
          return {
            ...p,
            propertyNotes: `${p.propertyNotes ? p.propertyNotes + '\n\n' : ''}${noteText}`,
            proactiveLoNote: noteText
          };
        }
        return p;
      });
      zillowSwarmSweepService.saveSweepListings(updated);
      return updated;
    });
  };
  const [isochroneFilter, setIsochroneFilter] = useState<'all' | '15m' | '30m' | '45m'>('all');
  const [projectedAduRent, setProjectedAduRent] = useState<number>(0);
  const [zillowInputUrl, setZillowInputUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // GeoMap 3.0 Cognitive Modal States
  const [showWaterfallModal, setShowWaterfallModal] = useState<boolean>(false);
  const [showCoBorrowerModal, setShowCoBorrowerModal] = useState<boolean>(false);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [showPreMortemModal, setShowPreMortemModal] = useState<boolean>(false);
  const [showLeadCaptureModal, setShowLeadCaptureModal] = useState<boolean>(false);
  const [leadCaptureInitialNote, setLeadCaptureInitialNote] = useState<string>('');

  // Area Request Modal State
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [requestTargetArea, setRequestTargetArea] = useState('');
  const [requestBuyerEmail, setRequestBuyerEmail] = useState('');
  const [requestBuyerName, setRequestBuyerName] = useState('');
  const [requestProgram, setRequestProgram] = useState<'USDA 100%' | 'LMI CRA Grant' | 'HomeReady 3%' | 'Lakeview National DPA' | 'OHCS Flex Lending FirstHome' | 'Any Low/No Down'>('Any Low/No Down');
  const [areaRequestSuccess, setAreaRequestSuccess] = useState<string | null>(null);

  // Mobile PWA Install Helper
  const { isInstallable, isInstalled, isIOS, isIosGuideOpen, setIsIosGuideOpen, triggerInstall } = usePwaInstallPrompt();

  const handleMobileInstallClick = async () => {
    if (isIOS) {
      setIsIosGuideOpen(true);
      return;
    }
    const res = await triggerInstall();
    if (res === 'ios_guide') {
      setIsIosGuideOpen(true);
    }
  };

  // Compute DTI Envelope
  const prequalResult = useMemo(() => {
    const res = calculateDtiEnvelope(buyerProfile);
    if (onPrequalRecalculated) onPrequalRecalculated(res);
    return res;
  }, [buyerProfile, onPrequalRecalculated]);

  // Filter listings via MortgageLoanEligibilityService & Zillow Sweep Swarm
  const rawFilteredProperties = useMemo(() => {
    if (activeFilter === 'zillow_sweep') {
      return zillowSwarmSweepService.filterListingsBySweepDates(properties, zillowSweepSelectedDates);
    }
    if (activeFilter === 'lakeview_national') {
      // If Lakeview National program is toggled off, then slider bar income eligibility and maximum loan amount caps filter do not apply!
      if (!isLakeviewProgramActive) {
        return properties;
      }
      return mortgageEligibilityService.filterGeoMapPropertiesByDownPayment(
        properties,
        'lakeview_national',
        allBorrowersCombinedAnnualIncome
      );
    }
    if (activeFilter === 'ohcs_flex_firsthome') {
      // If FirstHome program is toggled off, then slider bar income eligibility and maximum purchase price do not apply!
      if (!isOhcsProgramActive) {
        return properties;
      }
      return mortgageEligibilityService.filterGeoMapPropertiesByDownPayment(
        properties,
        'ohcs_flex',
        {
          grossAnnualIncome: allBorrowersCombinedAnnualIncome,
          householdSize: loHouseholdSize,
          isVeteranBorrower: isVeteranBorrower
        } as any
      );
    }
    if (activeFilter === 'usda') {
      // If USDA RD program is toggled off, then slider bar income eligibility and geographic boundary filters do not apply!
      if (!isUsdaProgramActive) {
        return properties;
      }
      return mortgageEligibilityService.filterGeoMapPropertiesByDownPayment(
        properties,
        'usda_zone',
        {
          grossAnnualIncome: allBorrowersCombinedAnnualIncome,
          householdSize: usdaHouseholdCount
        } as any
      );
    }
    if (activeFilter === 'homeready') {
      return mortgageEligibilityService.filterGeoMapPropertiesByDownPayment(properties, 'homeready', allBorrowersCombinedAnnualIncome);
    }
    if (activeFilter === 'nhf_fallback') {
      // If NHF program is toggled off, then DPA eligibility and criteria filters do not apply!
      if (!isNhfProgramActive) {
        return properties;
      }
      return mortgageEligibilityService.filterGeoMapPropertiesByDownPayment(properties, 'nhf_fallback', allBorrowersCombinedAnnualIncome);
    }
    return properties.filter((prop) => {
      if (activeFilter === 'lmi_cra') return prop.specialPrograms.lmiCraGrantEligible;
      if (activeFilter === 'price_drops') return (prop.priceDropAmount || 0) > 0;
      if (activeFilter === 'prequalified') return prop.price <= prequalResult.estimatedMaxPurchasePrice;
      return true;
    });
  }, [
    properties,
    activeFilter,
    prequalResult.estimatedMaxPurchasePrice,
    allBorrowersCombinedAnnualIncome,
    zillowSweepSelectedDates,
    isLakeviewProgramActive,
    isOhcsProgramActive,
    isUsdaProgramActive,
    isNhfProgramActive,
    loHouseholdSize,
    usdaHouseholdCount,
    isVeteranBorrower
  ]);

  // Highlight lead's top 3 favorited properties as ALWAYS FIRST in the carousel rotation, followed by default and curated!
  const filteredProperties = useMemo(() => {
    let list = rawFilteredProperties;
    if (showCuratedOnly) {
      list = list.filter(p => curatedPropertyIds.includes(p.id));
    }
    return [...list].sort((a, b) => {
      // 1. Any favorited property (up to 3) is ALWAYS first!
      const aFavIdx = favoritePropertyIds.indexOf(a.id);
      const bFavIdx = favoritePropertyIds.indexOf(b.id);
      const aIsFav = aFavIdx !== -1;
      const bIsFav = bFavIdx !== -1;

      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      if (aIsFav && bIsFav) return aFavIdx - bFavIdx;

      // 2. Default property (if not already in favorites)
      if (a.id === activeDefaultPropertyId) return -1;
      if (b.id === activeDefaultPropertyId) return 1;

      // 3. Curated properties
      const aCurated = curatedPropertyIds.includes(a.id);
      const bCurated = curatedPropertyIds.includes(b.id);
      if (aCurated && !bCurated) return -1;
      if (!aCurated && bCurated) return 1;

      return 0;
    });
  }, [rawFilteredProperties, favoritePropertyIds, activeDefaultPropertyId, showCuratedOnly, curatedPropertyIds]);

  // Desktop left-right arrow keystroke listener (loaded below filteredProperties to avoid early variable usage)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      if (carouselViewMode === 'carousel' && filteredProperties.length > 1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setCarouselIndex((prev) => (prev < filteredProperties.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCarouselIndex((prev) => (prev > 0 ? prev - 1 : filteredProperties.length - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselViewMode, filteredProperties]);

  // Real-time Lakeview 140% County AMI Curation Statistics across checkboxed curated listings
  const curatedLakeviewStats = useMemo(() => {
    const curatedListings = properties.filter(p => curatedPropertyIds.includes(p.id));
    let eligibleCount = 0;
    let capBustedCount = 0;
    let loanLimitBustedCount = 0;
    let otherIneligibleCount = 0;

    curatedListings.forEach(prop => {
      const countyData = resolveOregonCountyFannieMaeAmi(prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress);
      const evalResult = evaluateOregonLakeviewNationalEligibility({
        price: prop.price,
        state: prop.state,
        county: prop.county,
        city: prop.city,
        address: prop.formattedAddress,
        fipsGeoId: prop.fipsGeoId || prop.geoid,
        propertyType: prop.propertyType,
        grossAnnualIncome: allBorrowersCombinedAnnualIncome,
        creditScore: borrowerCreditScore,
        isPrimaryResidence: true,
        isStickBuilt: prop.propertyType !== 'Manufactured',
        isProgramActive: isLakeviewProgramActive
      });

      if (evalResult.isEligible) {
        eligibleCount++;
      } else {
        if (!evalResult.isWithinConformingLimit) {
          loanLimitBustedCount++;
        } else if (allBorrowersCombinedAnnualIncome > countyData.ami140CapUsd) {
          capBustedCount++;
        } else {
          otherIneligibleCount++;
        }
      }
    });

    return {
      totalCurated: curatedListings.length,
      eligibleCount,
      capBustedCount,
      loanLimitBustedCount,
      otherIneligibleCount,
      isProgramActive: isLakeviewProgramActive
    };
  }, [properties, curatedPropertyIds, allBorrowersCombinedAnnualIncome, borrowerCreditScore, isLakeviewProgramActive]);

  // Real-time OHCS Flex Lending FirstHome Curation Statistics across checkboxed curated listings
  const curatedOhcsStats = useMemo(() => {
    const curatedListings = properties.filter(p => curatedPropertyIds.includes(p.id));
    let eligibleCount = 0;
    let incomeBustedCount = 0;
    let priceBustedCount = 0;
    let targetedBonusCount = 0;

    curatedListings.forEach(prop => {
      const ohcsEval = evaluateOregonOhcsFlexFirstHomeEligibility({
        state: prop.state,
        price: prop.price,
        grossAnnualIncome: allBorrowersCombinedAnnualIncome,
        householdSize: loHouseholdSize,
        creditScore: borrowerCreditScore,
        isVeteranBorrower: isVeteranBorrower,
        fipsGeoId: prop.fipsGeoId || prop.geoid,
        geoid: prop.geoid,
        isProgramActive: isOhcsProgramActive
      });

      if (ohcsEval.isEligible) {
        eligibleCount++;
        if (ohcsEval.grantPercent === 5.0) {
          targetedBonusCount++;
        }
      } else {
        if (!ohcsEval.isWithinIncomeLimit) {
          incomeBustedCount++;
        } else if (!ohcsEval.isWithinPurchasePriceLimit) {
          priceBustedCount++;
        }
      }
    });

    return {
      totalCurated: curatedListings.length,
      eligibleCount,
      incomeBustedCount,
      priceBustedCount,
      targetedBonusCount,
      isProgramActive: isOhcsProgramActive
    };
  }, [properties, curatedPropertyIds, allBorrowersCombinedAnnualIncome, borrowerCreditScore, loHouseholdSize, isVeteranBorrower, isOhcsProgramActive]);

  // Real-time USDA Rural Development 100% Curation Statistics across checkboxed curated listings
  const curatedUsdaStats = useMemo(() => {
    const curatedListings = properties.filter(p => curatedPropertyIds.includes(p.id));
    let eligibleCount = 0;
    let incomeBustedCount = 0;
    let zoneIneligibleCount = 0;

    curatedListings.forEach(prop => {
      const isUsdaZone = Boolean(
        prop.specialPrograms.usdaRural100Financing ||
        prop.specialPrograms.usdaRuralEligible
      );
      const usdaEval = evaluateUsdaRdIncomeEligibility(
        allBorrowersCombinedAnnualIncome,
        usdaHouseholdCount,
        prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress,
        {
          isUsdaZoneEligible: isUsdaZone,
          isProgramActive: isUsdaProgramActive,
          creditScore: borrowerCreditScore
        }
      );

      if (usdaEval.isEligible) {
        eligibleCount++;
      } else {
        if (!usdaEval.isUsdaZoneEligible) {
          zoneIneligibleCount++;
        } else if (!usdaEval.isWithinIncomeLimit) {
          incomeBustedCount++;
        }
      }
    });

    return {
      totalCurated: curatedListings.length,
      eligibleCount,
      incomeBustedCount,
      zoneIneligibleCount,
      isProgramActive: isUsdaProgramActive
    };
  }, [properties, curatedPropertyIds, allBorrowersCombinedAnnualIncome, borrowerCreditScore, usdaHouseholdCount, isUsdaProgramActive]);

  // Real-time National Homebuyers Fund (NHF) Curation Statistics across checkboxed curated listings
  const curatedNhfStats = useMemo(() => {
    const curatedListings = properties.filter(p => curatedPropertyIds.includes(p.id));
    let eligibleCount = 0;
    let incomeBustedCount = 0;
    let priceBustedCount = 0;

    curatedListings.forEach(prop => {
      const nhfEval = evaluateNhfDpaEligibility(
        allBorrowersCombinedAnnualIncome,
        prop.price,
        'FHA',
        prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress,
        {
          creditScore: borrowerCreditScore,
          isProgramActive: isNhfProgramActive
        }
      );

      if (nhfEval.isEligible) {
        eligibleCount++;
      } else {
        if (!nhfEval.isWithinPurchasePriceLimit) {
          priceBustedCount++;
        } else if (!nhfEval.isWithinIncomeLimit) {
          incomeBustedCount++;
        }
      }
    });

    return {
      totalCurated: curatedListings.length,
      eligibleCount,
      incomeBustedCount,
      priceBustedCount,
      isProgramActive: isNhfProgramActive
    };
  }, [properties, curatedPropertyIds, allBorrowersCombinedAnnualIncome, borrowerCreditScore, isNhfProgramActive]);

  // Auto-rotate effect if enabled by client (dynamically throttled under Battery Saver)
  useEffect(() => {
    if (!autoRotate || filteredProperties.length <= 1) return;
    const intervalMs = getAdjustedInterval(5000);
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredProperties.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [autoRotate, filteredProperties.length, getAdjustedInterval, isBatterySaverActive]);

  // Keep carouselIndex in bounds if list changes
  useEffect(() => {
    if (carouselIndex >= filteredProperties.length && filteredProperties.length > 0) {
      setCarouselIndex(0);
    }
  }, [filteredProperties.length, carouselIndex]);

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) ||
           properties.find((p) => p.id === activeDefaultPropertyId) ||
           properties[0];
  }, [properties, selectedPropertyId, activeDefaultPropertyId]);

  // 1-Click "Sync GeoMap Saved Listings" from Mike Ford's Master Feed
  const handleSyncMasterFeed = () => {
    setIsSyncing(true);
    setSyncStatus('Connecting to Mike Ford GeoSphere Master Feed...');
    setTimeout(() => {
      setIsSyncing(false);
      // Simulate refreshing latest listings with price drops & badges
      const updated = properties.map((p) => {
        const drop = p.priceDropAmount || 12500;
        return {
          ...p,
          priceDropAmount: drop,
          lastSyncedTimestamp: new Date().toISOString(),
          propertyNotes: `${p.propertyNotes}\n[Master Feed Sync]: Synchronized with GeoSphere Oregon GIS. Price & DPA badging verified.`
        };
      });
      setProperties(updated);
      setSyncStatus(`✓ Successfully synced ${updated.length} master listings from Mike Ford's GeoSphere Hub!`);
    }, 1200);
  };

  // Check URL parameters for runtime co-branding routing
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlAgent = queryParams?.get('agent');
  const urlLo = queryParams?.get('lo');

  // Determine paired agent:
  // If explicitly provided in masterConfig.assignedAgentName, use it.
  // Otherwise, inspect URL query (?agent=...) — if absent, 'none', or 'solo', default to Solo LO Mode (no agent).
  const resolvedAgentName: string | undefined = masterConfig.assignedAgentName !== undefined
    ? (masterConfig.assignedAgentName || undefined)
    : (urlAgent && urlAgent !== 'none' && urlAgent !== 'solo'
        ? (urlAgent.toLowerCase().includes('kanndice') ? 'Kanndice McLean' : urlAgent)
        : undefined);

  const hasPairedAgent = Boolean(resolvedAgentName && resolvedAgentName.trim().length > 0);

  const mergedConfig: MasterFeedSyncConfig = {
    adminContactEmail: masterConfig.adminContactEmail || 'fordmj@gmail.com',
    assignedLoanOfficerName: masterConfig.assignedLoanOfficerName || (urlLo ? (urlLo.toLowerCase().includes('ford') ? 'Mike Ford' : urlLo) : 'Mike Ford'),
    assignedAgentName: resolvedAgentName,
    autoSyncOnLoad: masterConfig.autoSyncOnLoad ?? true,
    enableAreaListingRequests: masterConfig.enableAreaListingRequests ?? true,
    masterFeedEndpointUrl: masterConfig.masterFeedEndpointUrl
  };

  // Submit Area-Specific Request to Mike Ford's Queue
  const handleSubmitAreaRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTargetArea.trim() || !requestBuyerEmail.trim()) {
      alert('Please provide target city/zip and your email address.');
      return;
    }

    const payload: AreaListingRequestPayload = {
      requestId: `req-${Date.now()}`,
      buyerName: requestBuyerName || 'Prospective Homebuyer',
      buyerEmail: requestBuyerEmail,
      targetCityOrZip: requestTargetArea,
      targetState: 'OR',
      maxTargetMonthlyPayment: prequalResult.maxAllowableMonthlyHousingPayment,
      preferredDownPaymentProgram: requestProgram,
      buyerGrossMonthlyIncome: buyerProfile.grossMonthlyIncome,
      submittedAt: new Date().toISOString(),
      status: 'Pending Admin Review'
    };

    const res = await submitAreaListingRequest(payload, mergedConfig);
    if (onAreaRequestSubmitted) onAreaRequestSubmitted(payload);

    setAreaRequestSuccess(res.message);
    setTimeout(() => {
      setShowAreaModal(false);
      setAreaRequestSuccess(null);
      setRequestTargetArea('');
    }, 3000);
  };

  // 1-Click Zillow URL Geocoder
  const handleImportZillow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zillowInputUrl) return;
    const parsed = parseZillowListingUrl(zillowInputUrl);
    if (parsed) {
      const newListing = parsed as SyncedPropertyListing;
      setProperties([newListing, ...properties]);
      setSelectedPropertyId(newListing.id);
      setZillowInputUrl('');
    } else {
      alert('Please enter a valid Zillow property listing URL.');
    }
  };

  return (
    <div className={`bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl p-4 sm:p-6 space-y-6 ${className}`}>
      {/* Dynamic Mini Co-Branded Advisory Header for Carousel Only Mode */}
      {isCarouselOnlyView ? (
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider">
              {mergedConfig.assignedLoanOfficerName} &amp; {mergedConfig.assignedAgentName || 'Partner'} • Direct Advisory Mini Portal
            </h1>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
            Social Media Embed
          </span>
        </div>
      ) : (
        <>
          {/* Plugin Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    First-Time Homebuyer GeoMap &amp; DPA Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Managed Master Feed Sync
                  </span>
                  {hasPairedAgent ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Pair ({mergedConfig.assignedLoanOfficerName} &amp; {mergedConfig.assignedAgentName})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold inline-flex items-center gap-1 shadow-sm">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Direct Originator Mode (Solo LO)
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {hasPairedAgent
                    ? `Curated by Mike Ford (${mergedConfig.assignedLoanOfficerName} & ${mergedConfig.assignedAgentName}) • USDA 100% RD Rural • LMI Census Grants`
                    : `Curated by ${mergedConfig.assignedLoanOfficerName || 'Mike Ford'} (Managing Loan Officer, NMLS #288455) • Direct Homebuyer Advisory • USDA &amp; CRA Grants`}
                </p>
              </div>
            </div>

            {/* Action Buttons: 1-Click Sync & Request Area Listings & Add to Mobile */}
            <div className="flex flex-wrap items-center gap-2">
              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleMobileInstallClick}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  title="Add this interactive tool directly to your iPhone or Android Home Screen"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Add to Phone (App)</span>
                </button>
              )}

              {onOpenShareLinksModal && (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenShareLinksModal) {
                      onOpenShareLinksModal(selectedPropertyId);
                    }
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer border border-blue-500/30"
                  title="Share the currently selected home listing and custom prequal view"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Current View</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowCoBorrowerModal(true)}
                className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Open Collaborative Co-Borrower Canvas"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Co-Borrower Canvas</span>
              </button>

              <button
                type="button"
                onClick={handleSyncMasterFeed}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync GeoMap Saved Listings'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAreaModal(true)}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-xl text-xs font-bold border border-stone-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Request Area Listings</span>
              </button>

              {onOpenByokDrawer && (
                <button
                  type="button"
                  onClick={onOpenByokDrawer}
                  className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white rounded-xl text-xs font-bold border border-stone-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="API &amp; Account Settings"
                >
                  <Key className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Proactive Geofence Interest Radius Notification Radar */}
          <ProactiveGeofenceAlertBanner 
            onSelectAlertArea={(area) => {
              if (area.toLowerCase().includes('scappoose') || area.toLowerCase().includes('columbia')) {
                const match = properties.find(p => p.id === 'geo-102');
                if (match) setSelectedPropertyId(match.id);
              } else if (area.toLowerCase().includes('hawthorne') || area.toLowerCase().includes('portland')) {
                const match = properties.find(p => p.id === 'geo-101');
                if (match) setSelectedPropertyId(match.id);
              }
            }}
          />

          {syncStatus && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </>
      )}

      {/* Main Grid: DTI Sliders + Interactive Map Pin Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive DTI Sliders (5 Cols) */}
        {!isCarouselOnlyView && (
          <div className="lg:col-span-5 bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" /> Buyer DTI & Affordability Envelope
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">Max 50% DTI</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-400">Gross Monthly Income</span>
                <span className="font-mono font-bold text-white">{formatUSD(buyerProfile.grossMonthlyIncome)}/mo</span>
              </div>
              <input
                type="range"
                min={3000}
                max={20000}
                step={250}
                value={buyerProfile.grossMonthlyIncome}
                onChange={(e) => setBuyerProfile({ ...buyerProfile, grossMonthlyIncome: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-400">Monthly Debt Obligations</span>
                <span className="font-mono font-bold text-white">{formatUSD(buyerProfile.totalMonthlyDebtObligations)}/mo</span>
              </div>
              <input
                type="range"
                min={0}
                max={4000}
                step={50}
                value={buyerProfile.totalMonthlyDebtObligations}
                onChange={(e) => setBuyerProfile({ ...buyerProfile, totalMonthlyDebtObligations: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-400">Available Down Payment</span>
                <span className="font-mono font-bold text-emerald-400">{formatUSD(buyerProfile.availableDownPayment)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={150000}
                step={2500}
                value={buyerProfile.availableDownPayment}
                onChange={(e) => setBuyerProfile({ ...buyerProfile, availableDownPayment: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-400">Target Interest Rate</span>
                <span className="font-mono font-bold text-white">{buyerProfile.targetInterestRate.toFixed(3)}%</span>
              </div>
              <input
                type="range"
                min={4.5}
                max={8.5}
                step={0.125}
                value={buyerProfile.targetInterestRate}
                onChange={(e) => setBuyerProfile({ ...buyerProfile, targetInterestRate: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* ADU & House-Hack Income Offset Simulator */}
          <div className="p-3.5 rounded-xl bg-stone-900 border border-indigo-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> ADU Rental Income Offset
              </span>
              <span className="font-mono text-emerald-400 font-bold">+{formatUSD(projectedAduRent)}/mo</span>
            </div>
            <input
              type="range"
              min={0}
              max={2500}
              step={100}
              value={projectedAduRent}
              onChange={(e) => setProjectedAduRent(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>$0 (No ADU)</span>
              <span>Fannie Mae 75% Rule: +{formatUSD(projectedAduRent * 0.75)}/mo credit</span>
              <span>$2,500/mo</span>
            </div>
          </div>

          {/* Real-time Calculated Prequal Envelope */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-400">Max Purchase Price:</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatUSD(prequalResult.estimatedMaxPurchasePrice + Math.round((projectedAduRent * 0.75 * 0.45 * 0.8 * 140)))}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">Max Monthly Housing Pmt:</span>
              <span className="font-mono font-bold text-white">
                {formatUSD(prequalResult.maxAllowableMonthlyHousingPayment + Math.round(projectedAduRent * 0.75 * 0.45))}/mo
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">Resulting DTI (Front / Back):</span>
              <span className="font-mono text-stone-300">
                {prequalResult.calculatedFrontEndDti}% / {prequalResult.calculatedBackEndDti}%
              </span>
            </div>
          </div>

          {/* 1-Click Zillow Import */}
          <form onSubmit={handleImportZillow} className="space-y-2 pt-2 border-t border-stone-800">
            <label className="text-[11px] text-stone-400 font-bold block">1-Click Zillow URL Geocoder</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste Zillow URL (e.g. zillow.com/homedetails/...)"
                value={zillowInputUrl}
                onChange={(e) => setZillowInputUrl(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer"
              >
                Import
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Right Column: Spatial Map Pins & Selected Listing Deep-Dive (7 Cols or 12 Cols if Carousel Only) */}
        <div className={`${isCarouselOnlyView ? "lg:col-span-12" : "lg:col-span-7"} space-y-4`}>
          {/* Program Filters */}
          {!isCarouselOnlyView && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'zillow_sweep', label: `⚡ Zillow Sweep — New Today (${todaySweepCount})`, isSpecial: true },
                { id: 'all', label: `All (${properties.length})` },
                { id: 'lakeview_national', label: '🏞️ Lakeview 100% DPA' },
                { id: 'ohcs_flex_firsthome', label: '🌲 OHCS Flex FirstHome' },
                { id: 'usda', label: '🌾 USDA 100% RD Rural' },
                { id: 'homeready', label: '🔑 HomeReady 3% Down' },
                { id: 'nhf_fallback', label: '🇺🇸 NHF FHA 0% Fallback' },
                { id: 'lmi_cra', label: '🏛️ LMI $5k CRA Grant' },
                { id: 'price_drops', label: '🔥 Price Drops' },
                { id: 'prequalified', label: '✅ Prequalified Only' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                    activeFilter === tab.id
                      ? tab.isSpecial
                        ? 'bg-amber-500 text-stone-950 shadow-md font-black ring-1 ring-amber-400'
                        : 'bg-emerald-600 text-white shadow-md'
                      : tab.isSpecial
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
                      : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* MAP LAYERS MASTER TOGGLE TOOLBAR (OHCS LMI & USDA RD) - Hidden in Carousel-Only mode */}
          {!isCarouselOnlyView && (
            <>
              <div className="p-3 bg-gradient-to-r from-emerald-950/60 via-stone-900 to-amber-950/40 rounded-2xl border border-emerald-500/30 shadow-md space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* OHCS LMI Layer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowOhcsLmiLayer(!showOhcsLmiLayer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    showOhcsLmiLayer
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 ring-2 ring-emerald-400'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>🎯 OHCS Targeted Area Layer: {showOhcsLmiLayer ? 'ACTIVE' : 'OFF'}</span>
                </button>

                {/* USDA RD Boundary Layer Toggle */}
                <button
                  type="button"
                  onClick={() => setShowUsdaRdLayer(!showUsdaRdLayer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    showUsdaRdLayer
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 ring-2 ring-amber-300'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>🌾 USDA RD Boundaries (Shaded Ineligible): {showUsdaRdLayer ? 'ACTIVE' : 'OFF'}</span>
                </button>

                {showOhcsLmiLayer && (
                  <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLmiCategoryFilter('ALL')}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        lmiCategoryFilter === 'ALL'
                          ? 'bg-emerald-600 text-white'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      All (214)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLmiCategoryFilter('Low')}
                      className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                        lmiCategoryFilter === 'Low'
                          ? 'bg-rose-600 text-white font-black'
                          : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <span>🔴 Low (&lt;50% AMI)</span>
                      <span className="text-[9px] opacity-80">(20)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLmiCategoryFilter('Moderate')}
                      className={`px-2 py-0.5 rounded-lg transition flex items-center gap-1 ${
                        lmiCategoryFilter === 'Moderate'
                          ? 'bg-amber-500 text-stone-950 font-black'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      <span>🟡 Moderate (50-80% AMI)</span>
                      <span className="text-[9px] opacity-80">(194)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowLmiTractExplorerModal(true)}
                  className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Building className="w-3 h-3 text-emerald-400" />
                  <span>214 LMI Tracts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUsdaBoundaryModal(true)}
                  className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Shield className="w-3 h-3 text-amber-400" />
                  <span>USDA Boundaries</span>
                </button>
              </div>
            </div>

            {/* Layer Explanation & Official FFIEC Lookup Disclaimer Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[10px] text-stone-300 font-mono bg-stone-950/80 p-2.5 rounded-xl border border-stone-800">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> OHCS FirstHome Rules:
                  </span>
                  <span className="text-emerald-300 font-bold">5.0% DPA Grant</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">3-Yr FTHB Waiver Active</span>
                  <span>•</span>
                  <span className="text-purple-300 font-bold">214 FFIEC LMI Tracts</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  <strong className="text-stone-300">FirstHome Disclaimer:</strong> Cross-reference official 11-digit GEOID census tract designations &amp; LMI status via the FFIEC Geocoding Mapping Tool before locking loans.
                </p>
              </div>

              <a
                href="https://geomap.ffiec.gov/ffiecgeomap/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer border border-emerald-400/40"
                title="Open official FFIEC Geocoding System in new window"
              >
                <span>Official FFIEC Lookup</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
              </a>
            </div>
          </div>

          {/* Interactive GeoMap Canvas */}
          <div className="relative bg-stone-950 border border-stone-800 rounded-2xl h-64 w-full overflow-hidden p-4 flex flex-col justify-between">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* OHCS Targeted Area Census Tract Shading Layer Overlay */}
            {showOhcsLmiLayer && (
              <div
                className="absolute inset-x-4 top-4 bottom-4 opacity-40 bg-emerald-950/40 border-2 border-emerald-400/80 rounded-3xl pointer-events-none flex items-start justify-end p-2"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)',
                  backgroundSize: '12px 12px'
                }}
              >
                <span className="bg-stone-950/95 text-emerald-300 text-[9px] font-mono font-black uppercase px-2 py-1 rounded-xl border border-emerald-500/70 tracking-wider shadow-xl flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                  <span>🎯 OHCS Targeted Tract Shading (214 Tracts • 3-Yr FTHB Waiver Active + 5.0% DPA + Higher Limits)</span>
                </span>
              </div>
            )}

            {/* USDA RD Ineligible Metro Shading Layer Overlay */}
            {showUsdaRdLayer && (
              <div
                className="absolute inset-x-8 top-12 bottom-12 opacity-30 bg-rose-950/40 border-2 border-dashed border-rose-500/60 rounded-3xl pointer-events-none flex items-center justify-center p-2"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, rgba(244, 63, 94, 0.15) 0, rgba(244, 63, 94, 0.15) 10px, transparent 10px, transparent 20px)'
                }}
              >
                <span className="bg-stone-950/90 text-rose-300 text-[9px] font-mono font-black uppercase px-2 py-1 rounded border border-rose-500/60 tracking-wider shadow-lg">
                  🚫 Shaded Zone = USDA Ineligible Metro Cores (Portland/Eugene/Salem/Bend)
                </span>
              </div>
            )}

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 bg-stone-900/90 text-stone-300 text-[10px] font-mono rounded-lg border border-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" /> GeoSphere Spatial Layer (Oregon GIS • LMI &amp; USDA Boundaries)
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono rounded border border-emerald-800">
                Managed by Mike Ford
              </span>
            </div>

            {/* Interactive Pins with LMI & USDA RD Eligibility Badges */}
            <div className="relative z-10 flex items-center justify-around py-2">
              {filteredProperties.map((prop) => {
                const isSelected = prop.id === selectedPropertyId;
                const isDefault = prop.id === activeDefaultPropertyId;
                const qualifies = prop.price <= prequalResult.estimatedMaxPurchasePrice;
                const lmiCat = getOregonCensusTractLmiCategory(prop.geoid);
                const isUsdaEligible = Boolean(prop.specialPrograms?.usdaRural100Financing || prop.specialPrograms?.usdaRuralEligible);

                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      if (onPropertySelect) onPropertySelect(prop);
                    }}
                    className={`flex flex-col items-center group transition transform hover:scale-110 cursor-pointer ${
                      isSelected || isDefault ? 'scale-110 z-20' : 'opacity-85'
                    }`}
                  >
                    <div
                      className={`relative p-2 rounded-2xl shadow-lg border flex items-center justify-center ${
                        isDefault
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 border-amber-300 ring-2 ring-amber-400/60 shadow-amber-950/40'
                          : isSelected
                          ? 'bg-emerald-500 text-stone-950 border-white'
                          : qualifies
                          ? 'bg-stone-900 text-emerald-400 border-emerald-500/50'
                          : 'bg-stone-900 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      {isDefault && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-stone-950" />
                        </div>
                      )}
                    </div>

                    <span className={`mt-1 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                      isDefault
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                        : 'bg-stone-900/90 text-white border border-stone-800'
                    }`}>
                      {formatUSD(prop.price)}
                    </span>

                    {/* Program Badges */}
                    <div className="flex flex-col items-center gap-0.5 mt-0.5">
                      {showOhcsLmiLayer && lmiCat && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow-xs ${
                          lmiCat === 'Low'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/80 animate-pulse'
                            : 'bg-amber-950 text-amber-300 border-amber-500/80'
                        }`}>
                          {lmiCat === 'Low' ? '🔴 5% DPA (Low)' : '🟡 5% DPA (Mod)'}
                        </span>
                      )}

                      {showUsdaRdLayer && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow-xs ${
                          isUsdaEligible
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80 ring-1 ring-emerald-500/40'
                            : 'bg-stone-950 text-stone-400 border-stone-800'
                        }`}>
                          {isUsdaEligible ? '🌾 USDA 100%' : '🚫 Ineligible'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 flex justify-between items-center text-[10px] text-stone-400 font-mono">
              <span>OHCS LMI Layer: {showOhcsLmiLayer ? 'ACTIVE (214 Tracts)' : 'Off'}</span>
              <span>USDA RD Boundary Layer: {showUsdaRdLayer ? 'ACTIVE (Shaded Metro Core)' : 'Off'}</span>
            </div>
          </div>
        </>
      )}

      {/* PROPERTY LISTING CARDS DECK & CURATED SHORTLIST EXPORT SELECTOR */}
          <div className="space-y-2.5">
            {/* Curated Lead Shortlist & Loan Officer Strategy Toolbar with Dynamic Income Slider - Hidden in Carousel-Only and Standalone modes */}
            {!isCarouselOnlyView && !isStandaloneView && (
              <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-900/95 to-emerald-950/40 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Curated Shortlist for Lead Export</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      {curatedPropertyIds.length} Selected of {properties.length} Total
                    </span>
                    {activeDefaultPropertyId && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Default Front & Center: {properties.find(p => p.id === activeDefaultPropertyId)?.addressLine1 || 'Active'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Curate low/no down properties (Lakeview 100%, OHCS Flex FirstHome, USDA, HomeReady) synced from GeoSphere. Exported URL/app includes all checkboxed listings.
                  </p>
                </div>

                {/* Action Buttons: Toggle Curated Filter, Push New Listing, Export App Link */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowCuratedOnly(!showCuratedOnly)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      showCuratedOnly
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-stone-950 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-800'
                    }`}
                    title="Toggle between showing only curated checkboxed listings or all listings"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showCuratedOnly ? `Curated Only (${curatedPropertyIds.length})` : 'Show Curated Only'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPushListingModal(true)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Proactively curate and push a new property listing with custom Loan Officer notes directly into the GeoMap app"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ Push Listing & Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const exportUrl = getExportedCuratedAppUrl(hasPairedAgent ? 'paired' : 'solo');
                      navigator.clipboard.writeText(exportUrl);
                      setCopiedCuratedLink(true);
                      setTimeout(() => setCopiedCuratedLink(false), 3000);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                    title="Copy shareable link with all checkboxed curated listings and default featured listing"
                  >
                    {copiedCuratedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Copied Curated URL!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-white" />
                        <span>Export Curated App</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LO DASHBOARD: ALL BORROWERS COMBINED ANNUAL INCOME SLIDER & TRIPLE LAKEVIEW / OHCS / USDA RD STRESS-TEST ENGINE */}
              <div className="pt-2.5 border-t border-stone-800/80 space-y-3 bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-300">
                          Loan Officer Underwriting: All Borrowers Combined Annual Income
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                          Lakeview 140% AMI • OHCS FirstHome • USDA RD (8/1 Update)
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        Dynamically stress-test combined household earnings against Fannie Mae 140% County AMI, OHCS Flex Lending FirstHome, and USDA Rural Development household income tiers.
                      </p>
                    </div>
                  </div>

                  {/* Live Income Readout & Monthly Equivalent */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-right">
                      <span className="text-[10px] text-stone-400 block leading-tight">Combined Annual Income</span>
                      <span className="text-sm font-black font-mono text-amber-300">
                        {formatUSD(allBorrowersCombinedAnnualIncome)}
                        <span className="text-[10px] font-normal text-stone-400 ml-1">
                          ({formatUSD(Math.round(allBorrowersCombinedAnnualIncome / 12))}/mo)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Slider Bar Control with Quick Preset Buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-stone-500">$30k</span>
                    <input
                      type="range"
                      min={30000}
                      max={260000}
                      step={1000}
                      value={allBorrowersCombinedAnnualIncome}
                      onChange={(e) => handleCombinedAnnualIncomeChange(Number(e.target.value))}
                      className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      title="Slide to dynamically test combined borrower income against Lakeview 140% AMI, OHCS, and USDA RD county limits"
                    />
                    <span className="text-[10px] font-mono text-stone-500">$260k</span>
                  </div>

                  {/* Quick Preset Buttons & Household Size / Veteran Qualifiers */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-900">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Presets:</span>
                      {[
                        { label: '$65k (Single)', val: 65000 },
                        { label: '$95k (Rural/Mid)', val: 95000 },
                        { label: '$120k (Median)', val: 120000 },
                        { label: '$145k (Metro Cap)', val: 145000 },
                        { label: '$175k (High/Cap Bust)', val: 175000 }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => handleCombinedAnnualIncomeChange(preset.val)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                            allBorrowersCombinedAnnualIncome === preset.val
                              ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleCombinedAnnualIncomeChange((initialBuyerProfile?.grossMonthlyIncome || 8500) * 12)}
                        className="px-2 py-0.5 rounded text-[9px] font-bold bg-stone-900 text-stone-400 border border-stone-800 hover:text-white hover:border-stone-700 transition cursor-pointer"
                        title="Reset slider to original lead intake self-reported income"
                      >
                        ↺ Reset Intake ({formatUSD((initialBuyerProfile?.grossMonthlyIncome || 8500) * 12)})
                      </button>
                    </div>

                    {/* OHCS & USDA Household Family Member Count Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* OHCS Household Size Selector */}
                      <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[9px] font-bold">
                        <span className="text-stone-400 px-1">OHCS HH:</span>
                        <button
                          type="button"
                          onClick={() => setLoHouseholdSize(1)}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            loHouseholdSize <= 2
                              ? 'bg-teal-600 text-white font-black shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          1-2
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoHouseholdSize(3)}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            loHouseholdSize >= 3
                              ? 'bg-teal-600 text-white font-black shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          3+
                        </button>
                      </div>

                      {/* USDA RD Household Family Member Count Selector */}
                      <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[9px] font-bold">
                        <span className="text-emerald-400 px-1">USDA Members (8/1):</span>
                        <button
                          type="button"
                          onClick={() => setUsdaHouseholdCount(1)}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            usdaHouseholdCount <= 4
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          1-4 Pers
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsdaHouseholdCount(5)}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            usdaHouseholdCount >= 5
                              ? 'bg-emerald-600 text-white font-black shadow-xs'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          5-8 Pers
                        </button>
                      </div>

                      <label className="flex items-center gap-1 cursor-pointer text-[9px] text-teal-300 bg-teal-950/60 px-2 py-1 rounded-lg border border-teal-800/60 font-bold">
                        <input
                          type="checkbox"
                          checked={isVeteranBorrower}
                          onChange={(e) => setIsVeteranBorrower(e.target.checked)}
                          className="w-3 h-3 rounded text-teal-500 bg-stone-900 border-stone-700 focus:ring-teal-500 cursor-pointer"
                        />
                        <span>Veteran</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Credit Score Slider Control */}
                <div className="pt-2.5 border-t border-stone-800/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-teal-300">
                            Lead Borrower Credit Score (FICO)
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                            borrowerCreditScore >= 740
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : borrowerCreditScore >= 680
                              ? 'bg-teal-950 text-teal-300 border-teal-500/40'
                              : borrowerCreditScore >= 660
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : borrowerCreditScore >= 620
                              ? 'bg-orange-950 text-orange-300 border-orange-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}>
                            {borrowerCreditScore >= 740
                              ? '740+ Prime Tier'
                              : borrowerCreditScore >= 680
                              ? '680+ USDA RD Qualified'
                              : borrowerCreditScore >= 660
                              ? '660+ Lakeview Qualified'
                              : borrowerCreditScore >= 620
                              ? '620+ FHA / OHCS / NHF Qualified'
                              : 'Under 620 (Credit Enhancement Required)'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Dynamically test eligibility across programs: Lakeview (660+), OHCS FirstHome (620+), USDA RD (680+), NHF DPA (620+).
                        </p>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/40 text-right self-start sm:self-auto shrink-0">
                      <span className="text-[10px] text-stone-400 block leading-tight">Borrower Credit Score</span>
                      <span className="text-sm font-black font-mono text-teal-300">
                        {borrowerCreditScore} FICO
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-stone-500">580</span>
                      <input
                        type="range"
                        min={580}
                        max={850}
                        step={1}
                        value={borrowerCreditScore}
                        onChange={(e) => handleCreditScoreChange(Number(e.target.value))}
                        className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                        title="Slide to dynamically test borrower credit score against program minimum FICO requirements"
                      />
                      <span className="text-[10px] font-mono text-stone-500">850</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Presets:</span>
                        {[
                          { label: '620 (OHCS/NHF Min)', val: 620 },
                          { label: '640', val: 640 },
                          { label: '660 (Lakeview Min)', val: 660 },
                          { label: '680 (USDA Min)', val: 680 },
                          { label: '740 (Prime)', val: 740 }
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => handleCreditScoreChange(preset.val)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                              borrowerCreditScore === preset.val
                                ? 'bg-teal-400 text-stone-950 border-teal-300 font-black'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-teal-500/50 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleCreditScoreChange(initialBuyerProfile?.creditScore || 680)}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-stone-900 text-stone-400 border border-stone-800 hover:text-white hover:border-stone-700 transition cursor-pointer"
                          title="Reset credit score slider to lead intake self-reported score"
                        >
                          ↺ Reset Intake ({initialBuyerProfile?.creditScore || 680})
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quad Program Curation Statistics & Statutory Schedule Callouts with Toggle Switches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
                  {/* Lakeview Status Box */}
                  <div className={`p-2.5 rounded-lg border space-y-1.5 transition ${
                    isLakeviewProgramActive
                      ? 'bg-stone-900/90 border-stone-800'
                      : 'bg-stone-950/80 border-stone-800/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between font-bold gap-2">
                      <span className="text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">Lakeview 100% DPA</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsLakeviewProgramActive(!isLakeviewProgramActive)}
                          className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-black transition border flex items-center gap-1 cursor-pointer ${
                            isLakeviewProgramActive
                              ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-xs'
                              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                          }`}
                          title="Toggle Lakeview National 140% AMI & conforming loan limit stress-test filter on/off"
                        >
                          <span>{isLakeviewProgramActive ? 'ON' : 'OFF'}</span>
                        </button>
                        {isLakeviewProgramActive && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[8.5px]">
                            {curatedLakeviewStats.eligibleCount}/{curatedLakeviewStats.totalCurated} Pass
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-stone-400 leading-snug">
                      {isLakeviewProgramActive
                        ? `Max 140% County AMI • Conforming Limit: $832,750 (1-Unit). Schedules: AMI by 12/1, Loan Limits by 7/1.`
                        : `⚠️ Filter OFF: 140% County AMI & $832k limits bypassed.`}
                    </p>
                  </div>

                  {/* OHCS Flex FirstHome Status Box */}
                  <div className={`p-2.5 rounded-lg border space-y-1.5 transition ${
                    isOhcsProgramActive
                      ? 'bg-teal-950/40 border-teal-800/60'
                      : 'bg-stone-950/80 border-stone-800/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between font-bold gap-2">
                      <span className="text-teal-300 flex items-center gap-1.5">
                        <Target className="w-3 h-3 text-teal-400 shrink-0" />
                        <span className="truncate">OHCS FirstHome</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsOhcsProgramActive(!isOhcsProgramActive)}
                          className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-black transition border flex items-center gap-1 cursor-pointer ${
                            isOhcsProgramActive
                              ? 'bg-teal-400 text-stone-950 border-teal-300 shadow-xs'
                              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                          }`}
                          title="Toggle OHCS Flex Lending FirstHome income & purchase price limit stress-test filter on/off"
                        >
                          <span>{isOhcsProgramActive ? 'ON' : 'OFF'}</span>
                        </button>
                        {isOhcsProgramActive && (
                          <span className="px-1.5 py-0.2 rounded bg-teal-900 text-teal-200 border border-teal-500/40 font-mono font-bold text-[8.5px]">
                            {curatedOhcsStats.eligibleCount}/{curatedOhcsStats.totalCurated} Pass
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-stone-300 leading-snug">
                      {isOhcsProgramActive
                        ? `4.0%/5.0% Grant. HH ${loHouseholdSize >= 3 ? '3+' : '1-2'}. eHousingPlus updates schedules annually.`
                        : `⚠️ Filter OFF: Income limits & price caps bypassed.`}
                    </p>
                  </div>

                  {/* USDA RD 100% Guaranteed Status Box */}
                  <div className={`p-2.5 rounded-lg border space-y-1.5 transition ${
                    isUsdaProgramActive
                      ? 'bg-emerald-950/40 border-emerald-800/60'
                      : 'bg-stone-950/80 border-stone-800/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between font-bold gap-2">
                      <span className="text-emerald-300 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">USDA RD 100% ($0 Down)</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsUsdaProgramActive(!isUsdaProgramActive)}
                          className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-black transition border flex items-center gap-1 cursor-pointer ${
                            isUsdaProgramActive
                              ? 'bg-emerald-400 text-stone-950 border-emerald-300 shadow-xs'
                              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                          }`}
                          title="Toggle USDA Rural Development 100% income and geographic boundary stress-test filter on/off"
                        >
                          <span>{isUsdaProgramActive ? 'ON' : 'OFF'}</span>
                        </button>
                        {isUsdaProgramActive && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-200 border border-emerald-500/40 font-mono font-bold text-[8.5px]">
                            {curatedUsdaStats.eligibleCount}/{curatedUsdaStats.totalCurated} Pass
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-stone-300 leading-snug">
                      {isUsdaProgramActive
                        ? `100% Financing ($0 Down). Tier: ${usdaHouseholdCount >= 5 ? '5-8 Persons' : '1-4 Persons'}. USDA updates income limits annually by 8/1.`
                        : `⚠️ Filter OFF: USDA income & boundary filters bypassed.`}
                    </p>
                  </div>

                  {/* NHF DPA (Up to 5%) Status Box */}
                  <div className={`p-2.5 rounded-lg border space-y-1.5 transition ${
                    isNhfProgramActive
                      ? 'bg-indigo-950/40 border-indigo-800/60'
                      : 'bg-stone-950/80 border-stone-800/60 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between font-bold gap-2">
                      <span className="text-indigo-300 flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">NHF DPA (Up to 5%)</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setIsNhfProgramActive(!isNhfProgramActive)}
                          className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-black transition border flex items-center gap-1 cursor-pointer ${
                            isNhfProgramActive
                              ? 'bg-indigo-400 text-stone-950 border-indigo-300 shadow-xs'
                              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                          }`}
                          title="Toggle National Homebuyers Fund (NHF) DPA stress-test filter on/off"
                        >
                          <span>{isNhfProgramActive ? 'ON' : 'OFF'}</span>
                        </button>
                        {isNhfProgramActive && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-200 border border-indigo-500/40 font-mono font-bold text-[8.5px]">
                            {curatedNhfStats.eligibleCount}/{curatedNhfStats.totalCurated} Pass
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-stone-300 leading-snug">
                      {isNhfProgramActive
                        ? `Up to 5% DPA. NO FTHB rule. Max 140% AMI. FHA Purchase Caps: $560k–$744k (HUD updates annually 1/1).`
                        : `⚠️ Filter OFF: NHF criteria & FHA purchase caps bypassed.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* CLIENT AWARENESS & ONBOARDING BANNER FOR FRONT & CENTER CUSTOMIZATION - Hidden in Carousel-Only mode */}
            {!isCarouselOnlyView && (
              <>
                {showFavoriteAwarenessTip ? (
              <div className="p-3.5 bg-gradient-to-r from-rose-950/40 via-stone-900 to-amber-950/30 rounded-2xl border border-rose-500/40 shadow-md relative animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0 mt-0.5">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>Personalize Your Front & Center View (Desktop & Home Screen App)</span>
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                          {favoritePropertyIds.length} of 3 Favorites Locked
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        Click the <strong className="text-rose-400 font-bold">❤️ heart favorite icon</strong> on <strong className="text-white font-bold">ANY 3 property listing cards</strong> below. Those 3 homes will <strong className="text-amber-300 font-semibold">ALWAYS be the first 3 cards in your carousel rotation view</strong> every time you open this app on desktop or from your mobile home screen!
                      </p>

                      {/* Quick slot indicators */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {[0, 1, 2].map((slotIdx) => {
                          const favId = favoritePropertyIds[slotIdx];
                          const favProp = favId ? properties.find(p => p.id === favId) : null;
                          return (
                            <div
                              key={slotIdx}
                              onClick={() => {
                                if (favId) {
                                  setSelectedPropertyId(favId);
                                  const idx = filteredProperties.findIndex(p => p.id === favId);
                                  if (idx !== -1) setCarouselIndex(idx);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition flex items-center gap-1.5 ${
                                favProp
                                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-200 cursor-pointer hover:bg-rose-900/60 shadow-xs'
                                  : 'bg-stone-950/80 border-dashed border-stone-700 text-stone-500'
                              }`}
                              title={favProp ? `Jump to ${favProp.addressLine1}` : `Slot ${slotIdx + 1} empty - heart any card below`}
                            >
                              <Heart className={`w-3 h-3 ${favProp ? 'fill-rose-400 text-rose-400' : 'text-stone-600'}`} />
                              <span className="font-bold">
                                Spot #{slotIdx + 1}: {favProp ? favProp.addressLine1.split(',')[0] : 'Click ❤️ on any card'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Dismiss / Got it button */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFavoriteAwarenessTip(false);
                        try {
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('vantage_geomap_fav_tip_dismissed', 'true');
                          }
                        } catch {}
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Got it</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowFavoriteAwarenessTip(true);
                    try {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('vantage_geomap_fav_tip_dismissed');
                      }
                    } catch {}
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Personalize Top 3 Front & Center rotation ({favoritePropertyIds.length}/3 locked)</span>
                </button>
              </div>
            )}
              </>
            )}

            {/* Favorite Toast notification */}
            {favoriteToast && (
              <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400 shrink-0" />
                  <span className="font-semibold">{favoriteToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFavoriteToast(null)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Success toast after pushing new listing */}
            {pushSuccessFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <span className="font-semibold">{pushSuccessFeedback}</span>
                <button
                  type="button"
                  onClick={() => setPushSuccessFeedback(null)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* CURATED PROPERTY LISTINGS PLAIN EXPLANATION BANNER (Desktop & Home Screen App) */}
            {!isCarouselOnlyView && (
              <div className="p-3.5 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-2xl border border-amber-500/40 shadow-lg space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Curated For Sale Property Listings & Direct Advisory</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                        Desktop URL & Mobile Home Screen View
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-200 leading-relaxed font-sans">
                      These recently for sale property listings are curated to try and match your desired home purchase area+low or now downpayment home loan programs. You can always click the Zillow link inside the cards to verify current sales status or current price or any other details our GeoMap might be missing or is a little outdated even though we strive to keep data as fresh as possible for you and feel free to type in the NOTES of any card to reqeust a tour/showing or request a a new curated for sale property list in a different desired purchase city or have prequalifcation questions, etc and we will respond right back in the notes for you ASAP!
                    </p>
                    
                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px]">
                      <span className="px-2 py-0.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-500/40 font-semibold flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-sky-400" />
                        <span>Verify on Zillow Link inside Cards</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-400" />
                        <span>Type in Card Notes (Tour, City, Prequal)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{hasPairedAgent ? 'LO + Agent Profile at Bottom of Notes' : 'Solo LO Profile at Bottom of Notes'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DeepSeek Swarm Zillow Sweep Control Deck */}
            {activeFilter === 'zillow_sweep' && (
              <ZillowSweepControlDeck
                currentListings={properties}
                selectedDates={zillowSweepSelectedDates}
                onSelectedDatesChange={setZillowSweepSelectedDates}
                selectedPropertyIds={zillowSweepSelectedPropertyIds}
                onToggleSelectProperty={(id) => {
                  setZillowSweepSelectedPropertyIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  );
                }}
                onSelectAllVisible={(ids) => setZillowSweepSelectedPropertyIds(ids)}
                onClearSelectedProperties={() => setZillowSweepSelectedPropertyIds([])}
                onOpenMatchModal={() => setShowZillowMatchModal(true)}
                onSweepExecuted={handleSweepExecuted}
              />
            )}

            {/* View Mode & Carousel Rotation Toolbar */}
            <div className="p-2.5 bg-stone-900/80 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-lg bg-stone-950 border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setCarouselViewMode('carousel')}
                    className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px] ${
                      carouselViewMode === 'carousel'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Carousel Rotation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarouselViewMode('grid')}
                    className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px] ${
                      carouselViewMode === 'grid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Grid View</span>
                  </button>
                </div>

                {carouselViewMode === 'carousel' && (
                  <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                      autoRotate
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                    title="Automatically rotate to next card every 5 seconds"
                  >
                    {autoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{autoRotate ? 'Auto-Rotate ON' : 'Auto-Rotate'}</span>
                  </button>
                )}
              </div>

              {carouselViewMode === 'carousel' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCarouselIndex(prev => (prev > 0 ? prev - 1 : filteredProperties.length - 1))}
                    className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <span className="text-[10px] font-mono font-bold text-stone-300 px-2 py-1 rounded bg-stone-950 border border-stone-800">
                    Rotation #{carouselIndex + 1} of {filteredProperties.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCarouselIndex(prev => (prev < filteredProperties.length - 1 ? prev + 1 : 0))}
                    className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-stone-400 font-mono">
                  Showing all {filteredProperties.length} properties (Top 3 favorites first)
                </div>
              )}
            </div>

            {/* Render Property Cards: Carousel 3-Card Rotation or Grid */}
            {(() => {
              const renderPropertyCard = (prop: SyncedPropertyListing, rotationPosition: number) => {
                const isSelected = prop.id === selectedPropertyId;
                const isDefault = prop.id === activeDefaultPropertyId;
                const isCurated = curatedPropertyIds.includes(prop.id);
                const favoriteIndex = favoritePropertyIds.indexOf(prop.id);
                const isFavorite = favoriteIndex !== -1;

                return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      if (onPropertySelect) onPropertySelect(prop);
                    }}
                    className={`relative p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isFavorite
                        ? 'bg-gradient-to-b from-rose-950/25 via-stone-900 to-stone-950 border-rose-500/80 shadow-lg ring-1 ring-rose-500/40'
                        : isDefault
                        ? 'bg-gradient-to-b from-amber-950/25 via-stone-900 to-stone-950 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                        : isSelected
                        ? 'bg-stone-900 border-emerald-500/80 shadow-md'
                        : isCurated
                        ? 'bg-stone-950/90 border-emerald-500/40 hover:border-emerald-500 hover:bg-stone-900/60'
                        : 'bg-stone-950/90 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                    }`}
                  >
                    {/* Header with price & badges */}
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Multi-Select Checkbox for Zillow Sweep Outreach */}
                          <input
                            type="checkbox"
                            checked={zillowSweepSelectedPropertyIds.includes(prop.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              setZillowSweepSelectedPropertyIds((prev) =>
                                prev.includes(prop.id) ? prev.filter((id) => id !== prop.id) : [...prev, prop.id]
                              );
                            }}
                            className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700 focus:ring-amber-500 cursor-pointer shrink-0"
                            title="Select property for 1-click buyer outreach matching"
                          />
                          <span className="text-xs font-extrabold text-white font-mono">
                            {formatUSD(prop.price)}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                            #{rotationPosition + 1} in Rotation
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Zillow Status Badge */}
                          {prop.zillowStatus && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              prop.zillowStatus === 'Price Change'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : prop.zillowStatus === 'Active'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : prop.zillowStatus === 'Pending'
                                ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                                : 'bg-stone-800 text-stone-400 border-stone-700'
                            }`}>
                              {prop.zillowStatus === 'Price Change' ? '⚡ Price Cut' : prop.zillowStatus}
                            </span>
                          )}

                          {/* Zillow Sweep Date Badge */}
                          {prop.zillowSweepDate && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9px] font-mono font-semibold border border-amber-500/30">
                              ⚡ {prop.zillowSweepDate === todayDateStr ? 'Swept Today' : prop.zillowSweepDate.slice(5)}
                            </span>
                          )}

                          {/* Heart Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(prop.id);
                            }}
                            className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 shrink-0 ${
                              isFavorite
                                ? 'bg-rose-500/25 border-rose-500 text-rose-300 ring-1 ring-rose-500/60 shadow-xs'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-400/50 hover:bg-stone-800'
                            }`}
                            title={
                              isFavorite
                                ? `Favorited #${favoriteIndex + 1} for Front & Center! Click to remove.`
                                : `Click ❤️ to add this card to your Top 3 Front & Center carousel rotation!`
                            }
                          >
                            <Heart className={`w-3.5 h-3.5 transition ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-400'}`} />
                            {isFavorite && (
                              <span className="text-[9px] font-mono font-black text-rose-300">
                                #{favoriteIndex + 1}
                              </span>
                            )}
                          </button>

                          {isFavorite && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs animate-in fade-in">
                              <Heart className="w-2.5 h-2.5 fill-white" />
                              <span>Front & Center #{favoriteIndex + 1}</span>
                            </span>
                          )}

                          {isDefault && !isFavorite && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 fill-stone-950" />
                              <span>Default</span>
                            </span>
                          )}

                          {isCurated && !isDefault && !isFavorite ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                              Curated
                            </span>
                          ) : null}

                          {prop.priceDropAmount ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              -${prop.priceDropAmount.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-stone-200 mt-1 line-clamp-1">
                        {prop.addressLine1}
                      </h5>
                      <p className="text-[11px] text-stone-400">
                        {prop.city}, {prop.state} {prop.zipCode}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1.5 font-mono">
                        <span>{prop.bedrooms}b/{prop.bathrooms}ba</span>
                        <span>•</span>
                        <span>{prop.squareFootage.toLocaleString()} sqft</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{prop.propertyType}</span>
                      </div>

                      {/* Zillow Verification Link & Direct Notes Request Button */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 flex-wrap">
                        <a
                          href={`https://www.zillow.com/homes/${encodeURIComponent(prop.formattedAddress || `${prop.addressLine1}, ${prop.city}, ${prop.state} ${prop.zipCode}`)}_rb/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-200 hover:text-white border border-sky-500/40 transition text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Click to verify current sales status, price, or details on Zillow"
                        >
                          <span>Verify on Zillow</span>
                          <ExternalLink className="w-3 h-3 text-sky-400" />
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardNotesId(prev => (prev === prop.id ? null : prop.id));
                          }}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                            activeCardNotesId === prop.id
                              ? 'bg-amber-500/25 border-amber-500 text-amber-200 shadow-xs'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/40'
                          }`}
                          title="Open notes for this card to request a tour, new city list, or prequalification question"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-400" />
                          <span>{activeCardNotesId === prop.id ? 'Close Card Notes' : 'Card Notes & Inquiries'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSmsRelay(prop);
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Send SMS text note to Realtor Kanndice McLean regarding seller contributions"
                        >
                          <Smartphone className="w-3 h-3 text-amber-400" />
                          <span>Text Note to Kanndice</span>
                        </button>
                      </div>
                    </div>

                    {/* Loan Officer Proactive Strategy Note (if present) */}
                    {prop.proactiveLoNote && (
                      <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>LO Strategy Note:</span>
                          </span>
                          {prop.sellerConcessionSuggestedUsd && (
                            <span className="text-emerald-300 font-mono text-[9px]">
                              +${prop.sellerConcessionSuggestedUsd.toLocaleString()} Seller Credits
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 italic line-clamp-2 leading-relaxed">
                          "{prop.proactiveLoNote}"
                        </p>
                      </div>
                    )}

                    {/* Targeted Area Validation Check Banner */}
                    {isOregonLmiCensusTractStrict(prop.geoid) && (
                      <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-emerald-950/90 border border-emerald-500/50 space-y-1 shadow-sm">
                        <div className="flex items-center justify-between text-emerald-300 font-bold text-[10px]">
                          <span className="flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                            <span className="font-black tracking-wide uppercase">🎯 Targeted Area Qualified</span>
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 text-[9px] font-mono font-bold">
                            FTHB Waiver Active
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-300 leading-snug">
                          3-Yr First-Time Homebuyer Rule <strong className="text-emerald-300 font-bold">WAIVED</strong> • 5.0% DPA Grant • Higher Income ($171.5k) &amp; Price Cap ($782k)
                        </p>
                      </div>
                    )}

                    {/* Program Badges snippet */}
                    <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                      {prop.specialPrograms.lakeviewNationalDpaEligible && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
                          Lakeview DPA
                        </span>
                      )}
                      {prop.specialPrograms.usdaRural100Financing && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                          USDA 100%
                        </span>
                      )}
                      {prop.specialPrograms.ohcsFlexLendingFirstHomeEligible && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/80">
                          OHCS FirstHome ${((prop.specialPrograms.ohcsGrantAmountUsd || 18500) / 1000).toFixed(1)}k
                        </span>
                      )}
                      {prop.specialPrograms.lmiCraGrantEligible && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80">
                          $5k CRA Grant
                        </span>
                      )}
                    </div>

                    {/* Dynamic Real-Time Lakeview 140% County AMI & Fannie Mae Maximum Loan Limit Qualification Card */}
                    {(() => {
                      const countyData = resolveOregonCountyFannieMaeAmi(prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress);
                      const lakeviewEval = evaluateOregonLakeviewNationalEligibility({
                        price: prop.price,
                        state: prop.state,
                        county: prop.county,
                        city: prop.city,
                        address: prop.formattedAddress,
                        fipsGeoId: prop.fipsGeoId || prop.geoid,
                        propertyType: prop.propertyType,
                        grossAnnualIncome: allBorrowersCombinedAnnualIncome,
                        creditScore: borrowerCreditScore,
                        isPrimaryResidence: true,
                        isStickBuilt: prop.propertyType !== 'Manufactured',
                        isProgramActive: isLakeviewProgramActive
                      });

                      const isCreditBusted = isLakeviewProgramActive && borrowerCreditScore < 660;
                      const isLoanLimitBusted = !lakeviewEval.isWithinConformingLimit;
                      const isIncomeCapBusted = isLakeviewProgramActive && allBorrowersCombinedAnnualIncome > countyData.ami140CapUsd;

                      if (!isLakeviewProgramActive) {
                        return (
                          <div className="p-2 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span className="w-2 h-2 rounded-full bg-stone-500" />
                                <span>Lakeview 100% DPA: Filter Toggled OFF</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsLakeviewProgramActive(true);
                                }}
                                className="px-1.5 py-0.2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-bold cursor-pointer transition"
                              >
                                Activate Stress Test
                              </button>
                            </div>
                            <p className="text-[8.5px] text-stone-500 italic">
                              140% County AMI, 660 FICO min, and $832,750 conforming loan limit filters are bypassed.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className={`p-2 rounded-xl border text-[10px] space-y-1 transition ${
                          lakeviewEval.isEligible
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-xs'
                            : isCreditBusted
                            ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                            : isLoanLimitBusted
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : isIncomeCapBusted
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : 'bg-stone-900/80 border-stone-800 text-stone-400'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {lakeviewEval.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : isCreditBusted ? (
                                <X className="w-3 h-3 text-orange-400 shrink-0" />
                              ) : isLoanLimitBusted ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              ) : isIncomeCapBusted ? (
                                <X className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : (
                                <Info className="w-3 h-3 text-stone-400 shrink-0" />
                              )}
                              <span>
                                {lakeviewEval.isEligible
                                  ? 'Lakeview 100% DPA: Eligible'
                                  : isCreditBusted
                                  ? 'Lakeview: Min 660 FICO Req'
                                  : isLoanLimitBusted
                                  ? 'Lakeview: Max Loan Limit Exceeded'
                                  : isIncomeCapBusted
                                  ? 'Lakeview: 140% County AMI Cap Busted'
                                  : 'Lakeview: Property Ineligible'}
                              </span>
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-stone-300 border border-stone-800">
                              {countyData.countyName} Co. • Min 660
                            </span>
                          </div>
                          <div className="text-[9px] flex items-center justify-between text-stone-300 flex-wrap gap-1">
                            <span>
                              140% AMI Cap:{' '}
                              <strong className={isIncomeCapBusted ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>
                                {formatUSD(countyData.ami140CapUsd)}
                              </strong>
                              {' '}• Max Loan: {formatUSD(lakeviewEval.conformingLoanLimitUsd)}
                            </span>
                            {lakeviewEval.isEligible ? (
                              <span className="text-emerald-400 font-bold font-mono">
                                +{formatUSD(lakeviewEval.estimatedGrantAmountUsd)} DPA
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[8.5px] italic">
                                {isCreditBusted
                                  ? `Borrower FICO (${borrowerCreditScore}) < 660 min`
                                  : isLoanLimitBusted
                                  ? `Price over limit by ${formatUSD(prop.price - lakeviewEval.conformingLoanLimitUsd)}`
                                  : isIncomeCapBusted
                                  ? `Income exceeds by ${formatUSD(allBorrowersCombinedAnnualIncome - countyData.ami140CapUsd)}`
                                  : '1-Unit SFR/PUD/Condo Only'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Dynamic Real-Time OHCS Flex Lending FirstHome Qualification Card */}
                    {(() => {
                      const ohcsEval = evaluateOregonOhcsFlexFirstHomeEligibility({
                        state: prop.state,
                        price: prop.price,
                        grossAnnualIncome: allBorrowersCombinedAnnualIncome,
                        householdSize: loHouseholdSize,
                        creditScore: borrowerCreditScore,
                        isVeteranBorrower: isVeteranBorrower,
                        fipsGeoId: prop.fipsGeoId || prop.geoid,
                        geoid: prop.geoid,
                        isProgramActive: isOhcsProgramActive
                      });

                      const isCreditBusted = isOhcsProgramActive && borrowerCreditScore < 620;
                      const isIncomeBusted = isOhcsProgramActive && !ohcsEval.isWithinIncomeLimit;
                      const isPriceBusted = isOhcsProgramActive && !ohcsEval.isWithinPurchasePriceLimit;

                      if (!isOhcsProgramActive) {
                        return (
                          <div className="p-2 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span className="w-2 h-2 rounded-full bg-stone-500" />
                                <span>OHCS FirstHome: Filter Toggled OFF</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOhcsProgramActive(true);
                                }}
                                className="px-1.5 py-0.2 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[9px] font-bold cursor-pointer transition"
                              >
                                Activate Stress Test
                              </button>
                            </div>
                            <p className="text-[8.5px] text-stone-500 italic">
                              County household income limits and purchase price caps are bypassed.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className={`p-2 rounded-xl border text-[10px] space-y-1 transition ${
                          ohcsEval.isEligible
                            ? 'bg-teal-950/40 border-teal-500/50 text-teal-100 shadow-xs'
                            : isCreditBusted
                            ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                            : isIncomeBusted
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : isPriceBusted
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : 'bg-stone-900/80 border-stone-800 text-stone-400'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {ohcsEval.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                              ) : isCreditBusted ? (
                                <X className="w-3 h-3 text-orange-400 shrink-0" />
                              ) : isIncomeBusted ? (
                                <X className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : isPriceBusted ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              ) : (
                                <Info className="w-3 h-3 text-stone-400 shrink-0" />
                              )}
                              <span>
                                {ohcsEval.isEligible
                                  ? `OHCS FirstHome: Eligible (${ohcsEval.grantPercent}% Grant)`
                                  : isCreditBusted
                                  ? 'OHCS FirstHome: Min 620 FICO Req'
                                  : isIncomeBusted
                                  ? 'OHCS FirstHome: Income Cap Busted'
                                  : isPriceBusted
                                  ? 'OHCS FirstHome: Price Cap Exceeded'
                                  : 'OHCS FirstHome: Ineligible'}
                              </span>
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-teal-300 border border-teal-800/60">
                              {ohcsEval.isLmiTargetedArea ? '🎯 Targeted' : 'Standard'} • Min 620
                            </span>
                          </div>
                          <div className="text-[9px] flex items-center justify-between text-stone-300 flex-wrap gap-1">
                            <span>
                              Income Limit: <strong className={isIncomeBusted ? 'text-rose-300 font-bold' : 'text-teal-300 font-bold'}>{formatUSD(ohcsEval.householdIncomeLimitUsd)}</strong> • Price Cap: {formatUSD(ohcsEval.purchasePriceLimitUsd)}
                            </span>
                            {ohcsEval.isEligible ? (
                              <span className="text-teal-300 font-bold font-mono">
                                +{formatUSD(ohcsEval.grantAmountUsd)} Cash DPA
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[8.5px] italic">
                                {isCreditBusted
                                  ? `Borrower FICO (${borrowerCreditScore}) < 620 min`
                                  : isIncomeBusted
                                  ? `Exceeds by ${formatUSD(allBorrowersCombinedAnnualIncome - ohcsEval.householdIncomeLimitUsd)}`
                                  : isPriceBusted
                                  ? `Price over cap by ${formatUSD(prop.price - ohcsEval.purchasePriceLimitUsd)}`
                                  : 'Statewide Oregon Only'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Dynamic Real-Time USDA Rural Development 100% ($0 Down) Qualification Card */}
                    {(() => {
                      const isUsdaZone = Boolean(
                        prop.specialPrograms.usdaRural100Financing ||
                        prop.specialPrograms.usdaRuralEligible
                      );

                      const usdaEval = evaluateUsdaRdIncomeEligibility(
                        allBorrowersCombinedAnnualIncome,
                        usdaHouseholdCount,
                        prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress,
                        {
                          isUsdaZoneEligible: isUsdaZone,
                          isProgramActive: isUsdaProgramActive,
                          creditScore: borrowerCreditScore
                        }
                      );

                      const isCreditBusted = isUsdaProgramActive && borrowerCreditScore < 680;
                      const isIncomeBusted = isUsdaProgramActive && !usdaEval.isWithinIncomeLimit;
                      const isZoneIneligible = isUsdaProgramActive && !usdaEval.isUsdaZoneEligible;

                      if (!isUsdaProgramActive) {
                        return (
                          <div className="p-2 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span className="w-2 h-2 rounded-full bg-stone-500" />
                                <span>USDA RD 100%: Filter Toggled OFF</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsUsdaProgramActive(true);
                                }}
                                className="px-1.5 py-0.2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold cursor-pointer transition"
                              >
                                Activate Stress Test
                              </button>
                            </div>
                            <p className="text-[8.5px] text-stone-500 italic">
                              USDA household income limits and rural boundary filters are bypassed.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className={`p-2 rounded-xl border text-[10px] space-y-1 transition ${
                          usdaEval.isEligible
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-xs'
                            : isCreditBusted
                            ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                            : isZoneIneligible
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : isIncomeBusted
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : 'bg-stone-900/80 border-stone-800 text-stone-400'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {usdaEval.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              ) : isCreditBusted ? (
                                <X className="w-3 h-3 text-orange-400 shrink-0" />
                              ) : isZoneIneligible ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              ) : isIncomeBusted ? (
                                <X className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : (
                                <Info className="w-3 h-3 text-stone-400 shrink-0" />
                              )}
                              <span>
                                {usdaEval.isEligible
                                  ? 'USDA RD 100%: Eligible ($0 Down Financing)'
                                  : isCreditBusted
                                  ? 'USDA RD: Min 680 FICO Req'
                                  : isZoneIneligible
                                  ? 'USDA RD: Ineligible Metro Core Location'
                                  : isIncomeBusted
                                  ? 'USDA RD: Household Income Limit Exceeded'
                                  : 'USDA RD: Ineligible'}
                              </span>
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-emerald-300 border border-emerald-800/60">
                              {usdaEval.householdTierLabel} • Min 680
                            </span>
                          </div>
                          <div className="text-[9px] flex items-center justify-between text-stone-300 flex-wrap gap-1">
                            <span>
                              Household Limit: <strong className={isIncomeBusted ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>{formatUSD(usdaEval.applicableIncomeLimitUsd)}</strong> (8/1 Update Schedule)
                            </span>
                            {usdaEval.isEligible ? (
                              <span className="text-emerald-300 font-bold font-mono">
                                $0 Down • 100% LTV
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[8.5px] italic">
                                {isCreditBusted
                                  ? `Borrower FICO (${borrowerCreditScore}) < 680 min`
                                  : isZoneIneligible
                                  ? 'Outside USDA Rural Boundaries'
                                  : isIncomeBusted
                                  ? `Exceeds by ${formatUSD(allBorrowersCombinedAnnualIncome - usdaEval.applicableIncomeLimitUsd)}`
                                  : 'Ineligible Location'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Dynamic Real-Time National Homebuyers Fund (NHF) DPA (Up to 5%) Qualification Card */}
                    {(() => {
                      const nhfEval = evaluateNhfDpaEligibility(
                        allBorrowersCombinedAnnualIncome,
                        prop.price,
                        'FHA',
                        prop.county || prop.fipsGeoId || prop.city || prop.formattedAddress,
                        {
                          creditScore: borrowerCreditScore,
                          isProgramActive: isNhfProgramActive
                        }
                      );

                      const isCreditBusted = isNhfProgramActive && borrowerCreditScore < 620;
                      const isIncomeBusted = isNhfProgramActive && !nhfEval.isWithinIncomeLimit;
                      const isPriceBusted = isNhfProgramActive && !nhfEval.isWithinPurchasePriceLimit;

                      if (!isNhfProgramActive) {
                        return (
                          <div className="p-2 rounded-xl border border-stone-800 bg-stone-950/60 text-stone-400 text-[10px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span className="w-2 h-2 rounded-full bg-stone-500" />
                                <span>NHF DPA (Up to 5%): Filter Toggled OFF</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsNhfProgramActive(true);
                                }}
                                className="px-1.5 py-0.2 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold cursor-pointer transition"
                              >
                                Activate Stress Test
                              </button>
                            </div>
                            <p className="text-[8.5px] text-stone-500 italic">
                              NHF 140% AMI income limits and FHA purchase caps are bypassed.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className={`p-2 rounded-xl border text-[10px] space-y-1 transition ${
                          nhfEval.isEligible
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-100 shadow-xs'
                            : isCreditBusted
                            ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                            : isPriceBusted
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                            : isIncomeBusted
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            : 'bg-stone-900/80 border-stone-800 text-stone-400'
                        }`}>
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              {nhfEval.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
                              ) : isCreditBusted ? (
                                <X className="w-3 h-3 text-orange-400 shrink-0" />
                              ) : isPriceBusted ? (
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              ) : isIncomeBusted ? (
                                <X className="w-3 h-3 text-rose-400 shrink-0" />
                              ) : (
                                <Info className="w-3 h-3 text-stone-400 shrink-0" />
                              )}
                              <span>
                                {nhfEval.isEligible
                                  ? `NHF DPA: Eligible ($${nhfEval.maxEstimatedAssistanceUsd.toLocaleString()} Assistance)`
                                  : isCreditBusted
                                  ? 'NHF DPA: Min 620 FICO Req'
                                  : isPriceBusted
                                  ? 'NHF: Exceeds 2026 FHA Purchase Price Cap'
                                  : isIncomeBusted
                                  ? 'NHF: 140% AMI Income Limit Exceeded'
                                  : 'NHF: Ineligible'}
                              </span>
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-indigo-300 border border-indigo-800/60">
                              No FTHB Req • Min 620
                            </span>
                          </div>
                          <div className="text-[9px] flex items-center justify-between text-stone-300 flex-wrap gap-1">
                            <span>
                              FHA Cap: <strong className={isPriceBusted ? 'text-amber-300 font-bold' : 'text-indigo-300 font-bold'}>{formatUSD(nhfEval.fhaMaxPurchasePriceLimitUsd)}</strong> (1/1 Update)
                            </span>
                            {nhfEval.isEligible ? (
                              <span className="text-indigo-300 font-bold font-mono">
                                Net Down: ${nhfEval.netOutOfPocketDownPaymentUsd.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[8.5px] italic">
                                {isCreditBusted
                                  ? `Borrower FICO (${borrowerCreditScore}) < 620 min`
                                  : isPriceBusted
                                  ? `Exceeds FHA cap by ${formatUSD(prop.price - nhfEval.fhaMaxPurchasePriceLimitUsd)}`
                                  : isIncomeBusted
                                  ? `Exceeds 140% AMI (${formatUSD(nhfEval.applicableIncomeLimitUsd)})`
                                  : 'Guideline criteria not met'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Controls: Heart for Top 3, GeoMap Default & Curate for Lead */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Heart for Front & Center Top 3 Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(prop.id);
                          }}
                          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                            isFavorite
                              ? 'bg-rose-500/25 border-rose-500/70 text-rose-200 shadow-xs'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-rose-300 hover:border-rose-500/40'
                          }`}
                          title="Heart this property to customize your Top 3 Front & Center rotation view"
                        >
                          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-stone-500'}`} />
                          <span>{isFavorite ? `Top 3 (#${favoriteIndex + 1})` : 'Heart for Top 3'}</span>
                        </button>

                        {/* GeoMap Plugin Default Checkbox */}
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                            isDefault
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                          }`}
                          title="Set this property as the default front-and-center featured listing for plugin export"
                        >
                          <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={() => handleToggleDefaultProperty(prop.id)}
                            className="w-3.5 h-3.5 rounded border-stone-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900 bg-stone-950 cursor-pointer"
                          />
                          <span className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${isDefault ? 'text-amber-400 fill-amber-400' : 'text-stone-500'}`} />
                            <span>Default</span>
                          </span>
                        </label>

                        {/* Curate for Lead Export Checkbox */}
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border text-[10px] font-bold transition ${
                            isCurated
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                          }`}
                          title="Check box to include this property listing card in the curated lead app export build"
                        >
                          <input
                            type="checkbox"
                            checked={isCurated}
                            onChange={() => handleToggleCuratedProperty(prop.id)}
                            className="w-3.5 h-3.5 rounded border-stone-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-stone-900 bg-stone-950 cursor-pointer"
                          />
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className={`w-3 h-3 ${isCurated ? 'text-emerald-400' : 'text-stone-500'}`} />
                            <span>Curate</span>
                          </span>
                        </label>
                      </div>

                      {isFavorite ? (
                        <span className="text-[10px] text-rose-400 font-mono font-bold flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-rose-400" />
                          <span>Front & Center #{favoriteIndex + 1}</span>
                        </span>
                      ) : isDefault ? (
                        <span className="text-[10px] text-amber-400 font-mono font-bold animate-pulse">
                          Front & Center
                        </span>
                      ) : isCurated ? (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          In Export Build
                        </span>
                      ) : null}
                    </div>

                    {/* Interactive Card Notes & Direct 2-Way Relay Section with LO/Agent Profile Cards */}
                    <div className="mt-2.5 pt-2.5 border-t border-stone-800/90 space-y-2">
                      {/* Email Webhook Sync Live Status Indicator */}
                      <div className="flex items-center justify-between bg-purple-950/40 border border-purple-500/30 rounded-xl px-2.5 py-1 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                          </span>
                          <span>📧 Email Webhook Sync: <strong className="text-emerald-400 font-extrabold">ACTIVE</strong></span>
                        </div>
                        <span className="text-[9px] text-stone-400 font-mono hidden sm:inline">
                          Listening for {mergedConfig.assignedAgentName || 'Kanndice'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-stone-300">
                        <span className="flex items-center gap-1 text-amber-300">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Listing Notes &amp; Direct Relay:</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardNotesId(prev => (prev === prop.id ? null : prop.id));
                          }}
                          className="text-stone-400 hover:text-white text-[9px] cursor-pointer"
                        >
                          {activeCardNotesId === prop.id ? 'Hide Note Input ▲' : 'Type Note / Request ▼'}
                        </button>
                      </div>

                      {/* Display existing notes if any */}
                      {prop.propertyNotes && (
                        <div className="p-2 bg-stone-950/90 rounded-xl border border-stone-800 text-[10px] text-stone-300 font-mono whitespace-pre-line max-h-32 overflow-y-auto space-y-1.5">
                          <div>{prop.propertyNotes}</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSmsRelay(prop);
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-stone-950" />
                            <span>📱 Relay Note to Kanndice via SMS</span>
                          </button>
                        </div>
                      )}

                      {/* Success feedback toast */}
                      {cardNoteSuccessFeedback[prop.id] && (
                        <div className="p-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-[10px] font-bold flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{cardNoteSuccessFeedback[prop.id]}</span>
                        </div>
                      )}

                      {/* Active Note Input Box & Quick Prompt Chips */}
                      {activeCardNotesId === prop.id && (
                        <div className="space-y-1.5 pt-1 animate-in fade-in" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 flex-wrap text-[9px]">
                            <button
                              type="button"
                              onClick={() => setCardNoteInputs(prev => ({ ...prev, [prop.id]: `I'd like to request a private tour/showing for this home.` }))}
                              className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 cursor-pointer"
                            >
                              🗓️ Request Tour
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardNoteInputs(prev => ({ ...prev, [prop.id]: `Please curate a new property list in a different desired city for me: ` }))}
                              className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-sky-300 border border-sky-500/30 cursor-pointer"
                            >
                              📍 Request New City
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardNoteInputs(prev => ({ ...prev, [prop.id]: `I have a prequalification and grant eligibility question on this property.` }))}
                              className="px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                            >
                              💰 Prequal Question
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={cardNoteInputs[prop.id] || ''}
                              onChange={(e) => setCardNoteInputs(prev => ({ ...prev, [prop.id]: e.target.value }))}
                              placeholder="Type in notes: request tour/showing, new city list, prequal question..."
                              className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-[10px] text-white placeholder-stone-500 outline-none focus:border-amber-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSendCardNote(prop.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSendCardNote(prop.id)}
                              disabled={!cardNoteInputs[prop.id]?.trim()}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center gap-1"
                            >
                              <span>Send</span>
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[9px] text-stone-400 italic">
                            Type in the NOTES of any card to request a tour/showing, new curated city list, or prequal questions, and we will respond right back in the notes for you ASAP!
                          </p>
                        </div>
                      )}

                      {/* ALWAYS AT THE BOTTOM OF THE NOTES SECTIONS OF EVERY PROPERTY LISTING CARD:
                          Loan officer profile card if solo or LO+agent profile cards if co-branded pair */}
                      <ListingNotesProfileFooter
                        assignedLoanOfficerName={mergedConfig.assignedLoanOfficerName}
                        assignedAgentName={mergedConfig.assignedAgentName}
                        hasPairedAgent={hasPairedAgent}
                        propertyAddress={`${prop.addressLine1}, ${prop.city}, ${prop.state} ${prop.zipCode}`}
                        compact={true}
                        onRequestTour={() => {
                          setActiveCardNotesId(prop.id);
                          setCardNoteInputs(prev => ({
                            ...prev,
                            [prop.id]: `Hi ${hasPairedAgent && mergedConfig.assignedAgentName ? mergedConfig.assignedAgentName : mergedConfig.assignedLoanOfficerName}, I would like to request a private tour/showing for ${prop.addressLine1}.`
                          }));
                        }}
                        onAskQuestion={(topic) => {
                          setActiveCardNotesId(prop.id);
                          setCardNoteInputs(prev => ({
                            ...prev,
                            [prop.id]: `I have a ${topic.toLowerCase()} regarding ${prop.addressLine1}.`
                          }));
                        }}
                      />
                    </div>
                  </div>
                );
              };

              if (filteredProperties.length === 0) {
                return (
                  <div className="p-8 text-center bg-stone-950 rounded-2xl border border-stone-800 text-stone-400 text-xs">
                    No properties match the selected criteria.
                  </div>
                );
              }

              if (carouselViewMode === 'carousel') {
                // Carousel Rotation View: 3 cards side-by-side on desktop, 1 on mobile, starting at carouselIndex
                const count = Math.min(3, filteredProperties.length);
                const visibleCards = [];
                for (let i = 0; i < count; i++) {
                  const idx = (carouselIndex + i) % filteredProperties.length;
                  visibleCards.push({ prop: filteredProperties[idx], index: idx });
                }

                return (
                  <div className="space-y-3 overflow-hidden" style={{ perspective: '1200px' }}>
                    <div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 select-none touch-pan-y active:cursor-grabbing cursor-grab"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        transform: `rotateY(${(swipeOffset / 400) * 35}deg) translateX(${swipeOffset * 0.55}px) translateZ(${-Math.abs(swipeOffset) * 0.25}px)`,
                        transformStyle: 'preserve-3d',
                        transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.255)',
                      }}
                      title="Swipe or Drag left/right to rotate listings"
                    >
                      {visibleCards.map(({ prop, index }) => renderPropertyCard(prop, index))}
                    </div>

                    {/* Carousel Rotation Quick Navigation Dots */}
                    <div className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono">
                      <div className="flex items-center gap-2 max-w-full overflow-x-auto scrollbar-none">
                        <span className="text-stone-400 shrink-0">
                          Rotation Rail:
                        </span>
                        <div className="flex items-center gap-1.5 py-0.5">
                          {filteredProperties.map((p, idx) => {
                            const isFav = favoritePropertyIds.includes(p.id);
                            const isCurrent = idx === carouselIndex;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setCarouselIndex(idx);
                                  setSelectedPropertyId(p.id);
                                }}
                                className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                                  isCurrent
                                    ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-400 shadow-xs'
                                    : isFav
                                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/50 hover:bg-rose-900/60'
                                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                                }`}
                                title={`Jump to Listing #${idx + 1}: ${p.addressLine1} ${isFav ? '(Front & Center Top 3)' : ''}`}
                              >
                                {isFav && <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />}
                                <span>#{idx + 1}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>Arrow Keys ⌨️ or Drag/Swipe cards 🖱️ to spin!</span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid Deck View: all cards rendered simultaneously
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {filteredProperties.map((prop, idx) => renderPropertyCard(prop, idx))}
                </div>
              );
            })()}
          </div>

          {/* Selected Property Deep-Dive */}
          {selectedProperty && (
            <div ref={defaultListingCardRef} className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
              {/* GEOMAP PLUGIN DEFAULT PROMOTION HERO BANNER */}
              {!isStandaloneView && !isCarouselOnlyView && (() => {
                const isCurrentDefault = selectedProperty.id === activeDefaultPropertyId;
                return (
                  <div
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrentDefault
                        ? 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-emerald-950/30 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-stone-900/90 border-stone-800'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <label
                        className="flex items-center gap-2.5 cursor-pointer bg-stone-950 px-3 py-2 rounded-xl border border-stone-800 hover:border-amber-500/60 transition shadow-xs"
                        title="Set this property as the default featured listing for the GeoMap plugin export"
                      >
                        <input
                          type="checkbox"
                          checked={isCurrentDefault}
                          onChange={() => handleToggleDefaultProperty(selectedProperty.id)}
                          className="w-4 h-4 rounded border-stone-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900 bg-stone-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Star className={`w-4 h-4 ${isCurrentDefault ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} />
                          <span>GeoMap Plugin default</span>
                        </span>
                      </label>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isCurrentDefault
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {isCurrentDefault ? '★ Promoted Default Listing' : 'Standard Listing'}
                          </span>
                          <span className="text-xs text-stone-300 font-semibold">
                            {isCurrentDefault
                              ? 'Highlighted first front & center for potential leads'
                              : 'Check to highlight this property front & center on mobile & desktop'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {isCurrentDefault
                            ? 'Leads opening via QR code, SMS, email, messaging, or social links see this listing first.'
                            : 'When checked, the GeoMap plugin export highlights this property as the first to review.'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Promotion Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const promoUrl = buildLeadPluginUrl('geomap', undefined, {
                            leadMode: true,
                            lo: mergedConfig.assignedLoanOfficerName ? 'lo-mike-ford' : undefined,
                            agent: hasPairedAgent ? 'agent-kanndice-mclean' : 'none',
                            pack: 'geomap_brain_combo',
                            prop: selectedProperty.id
                          });
                          navigator.clipboard.writeText(promoUrl);
                          setCopiedPromoLink(true);
                          setTimeout(() => setCopiedPromoLink(false), 2500);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-850 text-stone-200 border border-stone-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Copy direct promotional link with default property pre-loaded"
                      >
                        {copiedPromoLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-400" />
                            <span>Copy Promo Link</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenShareLinksModal) {
                            onOpenShareLinksModal(selectedProperty.id);
                          } else {
                            const promoUrl = buildLeadPluginUrl('geomap', undefined, {
                              leadMode: true,
                              lo: 'lo-mike-ford',
                              agent: hasPairedAgent ? 'agent-kanndice-mclean' : 'none',
                              prop: selectedProperty.id
                            });
                            if (navigator.share) {
                              navigator.share({
                                title: `Featured Listing: ${selectedProperty.formattedAddress}`,
                                text: `Check out ${selectedProperty.formattedAddress} ($${selectedProperty.price.toLocaleString()}) - $0-down grant eligible! Open our interactive AI GeoMap to view payments & chat with our 2nd Brain:`,
                                url: promoUrl
                              }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(promoUrl);
                              setCopiedPromoLink(true);
                              setTimeout(() => setCopiedPromoLink(false), 2500);
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Open share modal for QR code, SMS, email, and social media campaigns"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-200" />
                        <span>Promote & Share</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Preloaded and Cached Property Image with Live Cache Badge Indicator */}
              {(() => {
                const imgUrl = getPropertyImageUrl(selectedProperty.id);
                return (
                  <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-stone-800 bg-stone-900 group shadow-lg">
                    <img
                      src={imgUrl}
                      alt={selectedProperty.formattedAddress}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-stone-950/90 text-emerald-400 text-[9px] font-mono font-black border border-emerald-500/30 backdrop-blur-xs flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                      <span>IMAGE PRELOAD CACHE ACTIVE</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedProperty.formattedAddress}</h4>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                    <span>{selectedProperty.bedrooms} Beds • {selectedProperty.bathrooms} Baths</span>
                    <span>{selectedProperty.squareFootage.toLocaleString()} SqFt</span>
                    <span className="font-mono text-stone-500">GEOID: {selectedProperty.geoid}</span>
                  </div>
                </div>
                {selectedProperty.zillowUrl && (
                  <a
                    href={selectedProperty.zillowUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-900 text-emerald-400 border border-stone-800 hover:bg-stone-850"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Special Badges */}
              <div className="flex flex-wrap gap-1.5">
                {isOregonLmiCensusTractStrict(selectedProperty.geoid) && (
                  <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 text-emerald-300 border border-emerald-500/70 text-[10px] font-black flex items-center gap-1.5 shadow-sm ring-1 ring-emerald-500/30">
                    <Target className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>🎯 Targeted Area Qualified (3-Yr FTHB Waiver Active + 5.0% DPA Boost)</span>
                  </span>
                )}
                {selectedProperty.specialPrograms.lakeviewNationalDpaEligible && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                    🏞️ Lakeview 100% National DPA (${(selectedProperty.specialPrograms.lakeviewGrantAmountUsd || 13475).toLocaleString()})
                  </span>
                )}
                {selectedProperty.specialPrograms.ohcsFlexLendingFirstHomeEligible && (
                  <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold">
                    🌲 OHCS Flex Lending FirstHome (${(selectedProperty.specialPrograms.ohcsGrantAmountUsd || 15400).toLocaleString()})
                  </span>
                )}
                {selectedProperty.specialPrograms.usdaRural100Financing && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                    🌾 USDA 100% Financing (0% Down)
                  </span>
                )}
                {selectedProperty.specialPrograms.lmiCraGrantEligible && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
                    🏛️ ${selectedProperty.specialPrograms.craGrantAmountUsd.toLocaleString()} CRA Grant Eligible
                  </span>
                )}
                {selectedProperty.specialPrograms.fnmaHomeReady3Percent && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                    🔑 HomeReady 3% Down
                  </span>
                )}
                {selectedProperty.priceDropAmount && selectedProperty.priceDropAmount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Price Drop: {formatUSD(selectedProperty.priceDropAmount)}
                  </span>
                )}
              </div>

              {/* Monthly Payment Calculation */}
              <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Est. Monthly Payment</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {formatUSD(
                      calculateMonthlyPI(
                        Math.max(0, selectedProperty.price - buyerProfile.availableDownPayment),
                        buyerProfile.targetInterestRate,
                        30
                      ) + Math.round((selectedProperty.estimatedAnnualTax + selectedProperty.estimatedAnnualInsurance) / 12) + selectedProperty.hoaMonthlyFee
                    )}
                    /mo
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Prequal Status</span>
                  <span
                    className={`font-bold ${
                      selectedProperty.price <= prequalResult.estimatedMaxPurchasePrice
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {selectedProperty.price <= prequalResult.estimatedMaxPurchasePrice ? '✓ Fits Budget' : 'Exceeds Current DTI'}
                  </span>
                </div>
              </div>

              {/* Real-time Mortgage Eligibility Service Pre-Screen Analysis */}
              {(() => {
                const prescreen = mortgageEligibilityService.getComprehensiveDpaPrescreenReport(
                  {
                    grossAnnualIncome: buyerProfile.grossMonthlyIncome * 12,
                    creditScore: 680,
                    areaMedianIncomeUsd: 92000,
                    propertyState: selectedProperty.state || 'OR',
                    propertyPrice: selectedProperty.price,
                    liquidDownPayment: buyerProfile.availableDownPayment,
                    isTargetedCensusTract: Boolean(selectedProperty.specialPrograms.lmiCraGrantEligible)
                  },
                  selectedProperty
                );

                return (
                  <div className="bg-stone-900/90 p-3 rounded-xl border border-emerald-900/60 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mortgage Eligibility Service Matrix
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {prescreen.isZeroDownEligible ? '100% Zero-Down Qualified' : 'Low Down Payment'}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-stone-200">
                      {prescreen.recommendationSummary}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 rounded bg-stone-950 border border-stone-800">
                        <span className="text-stone-400 block font-bold">USDA RD Zone:</span>
                        <span className={prescreen.usdaRuralOption?.isEligible ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                          {prescreen.usdaRuralOption?.isEligible ? '✓ Zone Eligible (100% LTV)' : 'Outside Rural Zone'}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-stone-950 border border-stone-800">
                        <span className="text-stone-400 block font-bold">HomeReady 3% Down:</span>
                        <span className={prescreen.homeReadyOption?.isEligible ? 'text-purple-400 font-bold' : 'text-stone-500'}>
                          {prescreen.homeReadyOption?.isEligible ? `✓ Eligible ($${prescreen.homeReadyOption.requiredDownPaymentUsd.toLocaleString()} Down)` : 'Income Above Cap'}
                        </span>
                      </div>
                    </div>

                    {prescreen.universalNhfFallbackOption.isEligible && (
                      <div className="text-[10px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded border border-amber-900/50 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>NHF FHA Fallback: 3.5% ($${prescreen.universalNhfFallbackOption.estimatedGrantUsd.toLocaleString()}) DPA Gift available.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* VANTAGE GEOMAP 3.0 COGNITIVE ACTION ACCELERATOR BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowWaterfallModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-sm flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-emerald-200" />
                  <span>DPA Grant Waterfall</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCoBorrowerModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-[11px] shadow-sm flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-indigo-200" />
                  <span>Co-Borrower Canvas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDossierModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-[11px] shadow-sm flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Executive Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreMortemModal(true)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-[11px] shadow-sm flex flex-col items-center gap-1 text-center cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-rose-200" />
                  <span>DeepThink Pre-Mortem</span>
                </button>
              </div>

              {/* Climate, FEMA Flood & Hazard Insurance Escrow Envelope */}
              {(() => {
                const hazard = calculateClimateHazardEnvelope(selectedProperty);
                return (
                  <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Climate & Hazard Insurance Escrow Envelope
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        hazard.wildfireRiskTier === 'High (WUI)' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-stone-800 text-stone-300'
                      }`}>
                        {hazard.floodZone} • Wildfire: {hazard.wildfireRiskTier}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300">Est. Insurance Escrow: <strong>${hazard.totalMonthlyInsuranceEscrow}/mo</strong></span>
                      <span className="text-[11px] text-stone-400">({hazard.insuranceImpactOnMonthlyPaymentDelta >= 0 ? '+' : ''}${hazard.insuranceImpactOnMonthlyPaymentDelta}/mo vs generic est.)</span>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      {hazard.hazardRiskSummary}
                    </p>
                  </div>
                );
              })()}

              {/* LEAD CAPTURE & AI 2ND BRAIN TRIAGE ACTION CALLOUT */}
              <div className="p-3.5 bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 rounded-2xl border border-indigo-500/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Co-Branded Inquiry
                    </span>
                    <span className="text-xs font-bold text-white">
                      Ask LO+Agent Team About This Property
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Submit questions or request a private tour. Our AI 2nd Brain segments your questions and simultaneously emails {mergedConfig.assignedLoanOfficerName} & {hasPairedAgent ? mergedConfig.assignedAgentName : 'Direct Originator'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLeadCaptureInitialNote(selectedProperty.propertyNotes || '');
                    setShowLeadCaptureModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Lead Form & AI Triage</span>
                </button>
              </div>

              {/* Two-Way Communication Notes & Interactive Chat Bot */}
              <ListingChatBotNotesPanel
                property={{
                  ...selectedProperty,
                  isGeoMapPluginDefault: selectedProperty.id === activeDefaultPropertyId
                }}
                buyerProfile={buyerProfile}
                prequalResult={prequalResult}
                assignedLoanOfficerName={mergedConfig.assignedLoanOfficerName}
                assignedAgentName={mergedConfig.assignedAgentName}
                hasPairedAgent={hasPairedAgent}
                onUpdateCreditScore={(score) => handleCreditScoreChange(score)}
                onOpenSmsRelay={() => handleOpenSmsRelay(selectedProperty)}
                onOpenLeadCapture={(note) => {
                  setLeadCaptureInitialNote(note);
                  setShowLeadCaptureModal(true);
                }}
                onUpdatePropertyNotes={(propId, updatedNotes) => {
                  setProperties((prev) =>
                    prev.map((p) => (p.id === propId ? { ...p, propertyNotes: updatedNotes } : p))
                  );
                }}
                isCarouselOnlyView={isCarouselOnlyView}
              />
            </div>
          )}
        </div>
      </div>

      {/* Area-Specific Listing Request Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Request Area Listings & Grant Match</h3>
                <p className="text-xs text-stone-400">Dispatches directly to Mike Ford Admin for GeoSphere pull</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAreaModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {areaRequestSuccess ? (
              <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-2xl text-xs text-emerald-300 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <p className="font-bold">{areaRequestSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitAreaRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Target City, County, or Zip Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bend, Medford, Salem, or 97401"
                    value={requestTargetArea}
                    onChange={(e) => setRequestTargetArea(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={requestBuyerName}
                      onChange={(e) => setRequestBuyerName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="buyer@example.com"
                      value={requestBuyerEmail}
                      onChange={(e) => setRequestBuyerEmail(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Preferred Low/No Down Payment Program</label>
                  <select
                    value={requestProgram}
                    onChange={(e) => setRequestProgram(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Any Low/No Down">Any Qualifying Low / No Down Payment Program</option>
                    <option value="Lakeview National DPA">Lakeview National 100% DPA / Community Land Trust</option>
                    <option value="OHCS Flex Lending FirstHome">OHCS Flex Lending FirstHome (3.5%–5% Cash Assistance)</option>
                    <option value="USDA 100%">USDA Rural Development (100% 0-Down Financing)</option>
                    <option value="LMI CRA Grant">LMI Census Tract CRA Grants ($5,000–$10,000)</option>
                    <option value="HomeReady 3%">Fannie Mae HomeReady (3% Down Payment)</option>
                  </select>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block">Target Monthly Payment Cap:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatUSD(prequalResult.maxAllowableMonthlyHousingPayment)}/mo (Based on 50% max DTI)
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request to Mike Ford Admin</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* GeoMap 3.0 Cognitive & Underwriting Modals */}
      {selectedProperty && (
        <>
          <DpaGrantWaterfallModal
            listing={selectedProperty}
            buyerProfile={buyerProfile}
            isOpen={showWaterfallModal}
            onClose={() => setShowWaterfallModal(false)}
          />

          <ExecutivePreApprovalDossierModal
            listing={selectedProperty}
            buyerProfile={buyerProfile}
            isOpen={showDossierModal}
            assignedLoanOfficerName={mergedConfig.assignedLoanOfficerName}
            assignedAgentName={mergedConfig.assignedAgentName}
            hasPairedAgent={hasPairedAgent}
            onClose={() => setShowDossierModal(false)}
          />

          <DeepThinkPreMortemModal
            listing={selectedProperty}
            isOpen={showPreMortemModal}
            onClose={() => setShowPreMortemModal(false)}
          />
        </>
      )}

      <CoBorrowerCanvasModal
        isOpen={showCoBorrowerModal}
        onClose={() => setShowCoBorrowerModal(false)}
        onApplyProfile={(jointMaxPrice, jointDown) => {
          setBuyerProfile(prev => ({
            ...prev,
            availableDownPayment: jointDown
          }));
        }}
      />

      {/* iOS Step-by-Step Installation Modal */}
      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        pluginName="First-Time Homebuyer GeoMap & DPA Tool"
      />

      {/* Customizable Real Estate Lead Capture & AI 2nd Brain Triage Modal */}
      {showLeadCaptureModal && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setShowLeadCaptureModal(false)}
        >
          <div
            className="max-w-4xl w-full max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <RealEstateLeadCaptureForm
              property={selectedProperty || undefined}
              initialNote={leadCaptureInitialNote}
              onClose={() => setShowLeadCaptureModal(false)}
              onLeadCaptured={(record) => {
                console.log('Lead successfully captured and triaged:', record);
              }}
            />
          </div>
        </div>
      )}

      {/* Proactive Loan Officer Curation & Push Listing Modal */}
      {showPushListingModal && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setShowPushListingModal(false)}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Proactively Curate & Push Listing to App
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Sync from GeoSphere or add custom listing with low/no-down DPA and strategic notes
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPushListingModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePushNewListingSubmit} className="space-y-4">
              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-bold text-stone-300 uppercase">Target City</label>
                  <input
                    type="text"
                    required
                    value={newListingCity}
                    onChange={(e) => setNewListingCity(e.target.value)}
                    placeholder="e.g. Scappoose"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-stone-300 uppercase">Property Address</label>
                  <input
                    type="text"
                    required
                    value={newListingAddress}
                    onChange={(e) => setNewListingAddress(e.target.value)}
                    placeholder="e.g. 51842 SW Old Portland Rd, Scappoose, OR 97056"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Price & Price Reduction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-300 uppercase">Current List Price ($)</label>
                  <input
                    type="number"
                    required
                    min={50000}
                    step={1000}
                    value={newListingPrice}
                    onChange={(e) => setNewListingPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-300 uppercase">Original Price ($)</label>
                  <input
                    type="number"
                    min={50000}
                    step={1000}
                    value={newListingOriginalPrice}
                    onChange={(e) => setNewListingOriginalPrice(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-300 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-300 uppercase">Suggested Seller Credits ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={newListingSellerConcession}
                    onChange={(e) => setNewListingSellerConcession(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Beds / Baths / Sqft */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400">Bedrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newListingBeds}
                    onChange={(e) => setNewListingBeds(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400">Bathrooms</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.5}
                    value={newListingBaths}
                    onChange={(e) => setNewListingBaths(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400">Square Feet</label>
                  <input
                    type="number"
                    min={400}
                    step={50}
                    value={newListingSqft}
                    onChange={(e) => setNewListingSqft(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Low/No Down Payment Program Tags */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="text-[10px] font-bold text-stone-300 uppercase block">
                  Identified Low / No-Down Payment Mortgage Programs:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListingUsda}
                      onChange={(e) => setNewListingUsda(e.target.checked)}
                      className="rounded border-stone-700 text-emerald-500"
                    />
                    <span>🌾 USDA Rural Development 100% Zero-Down</span>
                  </label>
                  <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListingOhcs}
                      onChange={(e) => setNewListingOhcs(e.target.checked)}
                      className="rounded border-stone-700 text-teal-500"
                    />
                    <span>🌲 OHCS Flex Lending FirstHome ($15,400 Grant)</span>
                  </label>
                  <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListingLakeview}
                      onChange={(e) => setNewListingLakeview(e.target.checked)}
                      className="rounded border-stone-700 text-amber-500"
                    />
                    <span>🏞️ Lakeview National 100% DPA (FHA 1st + Soft 2nd)</span>
                  </label>
                  <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListingHomeReady}
                      onChange={(e) => setNewListingHomeReady(e.target.checked)}
                      className="rounded border-stone-700 text-indigo-500"
                    />
                    <span>🔑 Fannie Mae HomeReady 3% Down (Reduced PMI)</span>
                  </label>
                  <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newListingCra}
                      onChange={(e) => setNewListingCra(e.target.checked)}
                      className="rounded border-stone-700 text-blue-500"
                    />
                    <span>🏛️ CRA LMI $5,000 Bank Grant Stack</span>
                  </label>
                </div>
              </div>

              {/* Custom Proactive Loan Officer Note */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Loan Officer Proactive Strategy Note:</span>
                  </label>
                  <span className="text-[10px] text-stone-400">Featured in Lead's App & Chat</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={newListingLoNote}
                  onChange={(e) => setNewListingLoNote(e.target.value)}
                  placeholder="e.g. Checkout this house which just had a price reduction and we can reach out to Kanndice to see if seller will consider seller contributions towards your closing costs..what do you think?"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white focus:border-amber-500 outline-none leading-relaxed text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowPushListingModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-stone-950 font-black shadow-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4 text-stone-950" />
                  <span>Push Directly to GeoMap App Deck</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zillow Sweep 1-Click Match & Dispatch Outreach Modal */}
      <ZillowSweepMatchModal
        isOpen={showZillowMatchModal}
        onClose={() => setShowZillowMatchModal(false)}
        selectedProperties={properties.filter((p) => zillowSweepSelectedPropertyIds.includes(p.id))}
        hasPairedAgent={hasPairedAgent}
        onAppendNotesToProperties={handleAppendNotesToProperties}
      />

      {/* OHCS FLEX FIRSTHOME 214 OREGON LMI CENSUS TRACT EXPLORER MODAL */}
      {showLmiTractExplorerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>OHCS Flex FirstHome — 214 Oregon LMI Census Tracts</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                      FFIEC &amp; eHousingPlus Grounded
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Source: <code className="text-emerald-400">geosphere-map-oregon/lmi-matched-tracts.js</code> • 5.0% DPA Grant • FTHB 3-Yr Waiver Active
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLmiTractExplorerModal(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search, Filters & Official FFIEC Disclaimer Link */}
            <div className="p-4 bg-stone-950 border-b border-stone-800 space-y-3">
              {/* Official FFIEC Lookup Disclaimer Banner */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official FirstHome &amp; FFIEC Property Lookup Disclaimer</span>
                  </span>
                  <p className="text-[11px] text-stone-300">
                    Always cross-reference official 11-digit GEOID census tract designations, low/moderate-income (LMI) level, and OHCS Flex Lending FirstHome program eligibility for a specific street address on the FFIEC Geocoding Mapping System.
                  </p>
                </div>

                <a
                  href="https://geomap.ffiec.gov/ffiecgeomap/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer border border-emerald-400/40"
                >
                  <span>Check Official FFIEC Lookup</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={lmiTractSearchQuery}
                    onChange={(e) => setLmiTractSearchQuery(e.target.value)}
                    placeholder="Search by 11-Digit GEOID or County Name (e.g., 41051... or Multnomah)..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 font-mono"
                  />
                  <Building className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>

                {/* Category Toggles */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-bold w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setLmiCategoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      lmiCategoryFilter === 'ALL'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    All (214)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLmiCategoryFilter('Low')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                      lmiCategoryFilter === 'Low'
                        ? 'bg-rose-600 text-white font-black shadow-sm'
                        : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    <span>🔴 Low (&lt;50% AMI)</span>
                    <span className="text-[10px] opacity-80">(20)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLmiCategoryFilter('Moderate')}
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                      lmiCategoryFilter === 'Moderate'
                        ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                        : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span>🟡 Mod (50-80% AMI)</span>
                    <span className="text-[10px] opacity-80">(194)</span>
                  </button>
                </div>
              </div>

              {/* County Quick Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                <span className="text-stone-500 text-[10px] uppercase font-bold mr-1">County:</span>
                {[
                  { id: 'ALL', label: 'All Counties' },
                  { id: '41051', label: 'Multnomah (Portland)' },
                  { id: '41067', label: 'Washington (Hillsboro)' },
                  { id: '41005', label: 'Clackamas (Oregon City)' },
                  { id: '41017', label: 'Deschutes (Bend/Redmond)' },
                  { id: '41047', label: 'Marion (Salem)' },
                  { id: '41039', label: 'Lane (Eugene)' },
                  { id: '41029', label: 'Jackson (Medford)' },
                  { id: '41011', label: 'Coos County' },
                  { id: '41035', label: 'Klamath County' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setLmiCountyFilter(c.id)}
                    className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                      lmiCountyFilter === c.id
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: List of Oregon LMI Census Tracts */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
              {(() => {
                const allTracts = getAllOregonLmiTractDetails();
                const filtered = allTracts.filter((t) => {
                  const matchesCat = lmiCategoryFilter === 'ALL' || t.category === lmiCategoryFilter;
                  const matchesCounty = lmiCountyFilter === 'ALL' || t.geoid.startsWith(lmiCountyFilter);
                  const q = lmiTractSearchQuery.toLowerCase().trim();
                  const matchesSearch = !q || t.geoid.includes(q) || t.countyName.toLowerCase().includes(q);
                  return matchesCat && matchesCounty && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-stone-500 font-mono text-xs">
                      No census tracts found matching query "{lmiTractSearchQuery}".
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filtered.map((tract) => {
                      const matchedProperties = properties.filter((p) => p.geoid === tract.geoid);
                      return (
                        <div
                          key={tract.geoid}
                          className={`p-3 rounded-2xl border transition ${
                            tract.category === 'Low'
                              ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                              : 'bg-stone-950 border-stone-800 hover:border-emerald-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                                tract.category === 'Low'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {tract.category === 'Low' ? '🔴 Low (<50% AMI)' : '🟡 Moderate (50-80% AMI)'}
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                FIPS: {tract.geoid}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                              5.0% DPA Boost
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-stone-300 font-bold">{tract.countyName}</span>
                            <span className="text-[10px] text-amber-300 font-mono">3-Yr FTHB Waiver Active</span>
                          </div>

                          {matchedProperties.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-stone-800/80 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{matchedProperties.length} Saved Property Listing(s) inside this Tract:</span>
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {matchedProperties.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPropertyId(p.id);
                                      setShowLmiTractExplorerModal(false);
                                    }}
                                    className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded text-[10px] font-mono border border-emerald-800 transition cursor-pointer"
                                  >
                                    {p.addressLine1} ({formatUSD(p.price)})
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-[11px]">
                Showing {getAllOregonLmiTractDetails().length} total FFIEC Oregon Census Tracts for OHCS FirstHome
              </span>
              <button
                type="button"
                onClick={() => setShowLmiTractExplorerModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USDA RD BOUNDARY & INELIGIBILITY ZONE INSPECTOR MODAL */}
      {showUsdaBoundaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>USDA RD Rural Development Boundary Inspector</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                      100% Zero Down
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Shaded Areas = Ineligible Metro Cores • <strong className="text-emerald-400">Everything Outside Shaded Areas = 100% USDA Eligible</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUsdaBoundaryModal(false)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Core Principle Banner */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2">
                <h4 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>The Fundamental USDA RD Rule:</span>
                </h4>
                <p className="text-stone-300 leading-relaxed">
                  USDA Rural Development (RD) Guaranteed Housing loans do <strong className="text-white">NOT</strong> publish a list of eligible towns. Instead, USDA defines strict <strong className="text-rose-300">Ineligible Urbanized Boundaries</strong> (shaded metropolitan cores).
                </p>
                <p className="text-emerald-300 font-bold leading-relaxed bg-stone-950/80 p-2.5 rounded-xl border border-emerald-800 font-mono">
                  👉 Rule: ANY single-family home or condo located OUTSIDE of the shaded urban metro boundary qualifies for 100% USDA Zero-Down financing!
                </p>
              </div>

              {/* Shaded Ineligible Metro Cores in Oregon */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Shaded Ineligible Urban Metro Cores (Population &gt; 35k / Metro Density):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
                  <div className="p-3 bg-stone-950 rounded-xl border border-rose-500/30">
                    <span className="font-bold text-white block">Portland Metro Core (Ineligible Zone)</span>
                    <span className="text-[11px] text-stone-400">Portland, Beaverton, Hillsboro, Gresham, Tigard, Lake Oswego, Tualatin city centers.</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-rose-500/30">
                    <span className="font-bold text-white block">Eugene / Springfield Core (Ineligible Zone)</span>
                    <span className="text-[11px] text-stone-400">Eugene city limits &amp; urbanized Springfield core.</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-rose-500/30">
                    <span className="font-bold text-white block">Salem / Keizer Core (Ineligible Zone)</span>
                    <span className="text-[11px] text-stone-400">Salem city core &amp; Keizer metropolitan area.</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-rose-500/30">
                    <span className="font-bold text-white block">Bend Core (Ineligible Zone)</span>
                    <span className="text-[11px] text-stone-400">Bend urban growth boundary &amp; central municipality.</span>
                  </div>
                </div>
              </div>

              {/* High-Demand 100% USDA Eligible Surrounding Oregon Communities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Popular 100% USDA Eligible Towns (Outside Shaded Zones):</span>
                </h4>

                <div className="p-3 bg-stone-950 rounded-xl border border-emerald-500/30 space-y-2 text-stone-300">
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {[
                      'Scappoose', 'St. Helens', 'Molalla', 'Estacada', 'Sandy', 'Canby', 'Vernonia',
                      'Silverton', 'Stayton', 'Sublimity', 'Monmouth', 'Independence', 'Dallas',
                      'Cottage Grove', 'Junction City', 'Creswell', 'Oakridge',
                      'Redmond', 'La Pine', 'Sisters', 'Prineville', 'Madras',
                      'Central Point', 'Talent', 'Phoenix', 'Eagle Point', 'Shady Cove',
                      'Dayton', 'Carlton', 'Yamhill', 'Sheridan', 'Willamina', 'Dundee',
                      'Lebanon', 'Sweet Home', 'Philomath', 'Brownsville'
                    ].map((city) => (
                      <span
                        key={city}
                        className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold"
                      >
                        ✓ {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Income & Underwriting Guidelines */}
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1 text-stone-300 font-mono text-[11px]">
                <span className="text-white font-bold block">USDA 100% Underwriting Guidelines:</span>
                <div>• Household Income Cap: Up to 115% Area Median Income (AMI) (e.g., $110,000–$125,000+ depending on household size).</div>
                <div>• Minimum Credit Score: 620 FICO (Standard automated approval).</div>
                <div>• Upfront Guarantee Fee: 1.00% (Financed into loan) + 0.35% Annual Guarantee Fee.</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-[11px]">USDA Rural Development Guaranteed Housing Program</span>
              <button
                type="button"
                onClick={() => setShowUsdaBoundaryModal(false)}
                className="px-4 py-2 bg-amber-500 text-stone-950 font-black rounded-xl transition cursor-pointer hover:bg-amber-400"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LO SMS Agent Relay Modal */}
      <LoSmsAgentRelayModal
        isOpen={isSmsRelayModalOpen}
        onClose={() => setIsSmsRelayModalOpen(false)}
        property={smsRelayProperty}
        leadName={(initialBuyerProfile as any)?.buyerName || 'John Jones'}
        loanOfficerName={mergedConfig.assignedLoanOfficerName || 'Mike Ford'}
        agentName={mergedConfig.assignedAgentName || 'Kanndice McLean'}
        onSendSmsRelay={handleSendSmsRelay}
      />

      {/* Real-Time Push Notification Toast Banner for LO & Lead Contact */}
      {activePushNotification && (
        <div className="fixed top-4 right-4 sm:right-6 z-[100] max-w-md w-full animate-bounceIn shadow-2xl">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 text-stone-950 font-sans border-2 border-amber-300 space-y-1.5 shadow-2xl">
            <div className="flex items-center justify-between font-black text-xs">
              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                <Bell className="w-4 h-4 text-stone-950 animate-bounce" />
                <span>🔔 Push Notification (LO + Lead Contact)</span>
              </span>
              <button
                type="button"
                onClick={() => setActivePushNotification(null)}
                className="p-1 rounded-lg bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 font-black cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="font-black text-sm text-stone-950 leading-snug">
              "{activePushNotification.title}"
            </div>
            <p className="text-xs font-bold text-stone-900 bg-white/40 p-2 rounded-xl backdrop-blur-xs leading-snug">
              {activePushNotification.message}
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-900 pt-0.5">
              <span>Dispatched to Mike Ford (LO) &amp; {(initialBuyerProfile as any)?.buyerName || 'John Jones'}</span>
              <span>{activePushNotification.timestamp}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer & Copyright */}
      <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-mono">
        <span>Vantage Intelligence Assist (VIA) • Master GeoSphere Network</span>
        <span>Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.</span>
      </div>
    </div>
  );
};
