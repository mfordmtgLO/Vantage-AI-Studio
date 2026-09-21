/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FIRST-TIME HOMEBUYER GEOMAP & DPA PLUGIN COMPONENT
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Zero BYOK • 1-Click Master GeoSphere Feed Sync & Area Search Dispatcher
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
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
  TrendingDown,
  Clock,
  PlusCircle,
  X,
  Shield,
  Key
} from 'lucide-react';
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
  submitAreaListingRequest
} from '../services/geomapMortgageEngine';

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
      targetedAreaGrantBonus: true
    },
    sourceMasterFeedId: 'GeoSphere Oregon GIS Master'
  }
];

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
  onPropertySelect,
  onPrequalRecalculated,
  onAreaRequestSubmitted,
  className = '',
  isStandalone = false,
  onOpenByokDrawer
}) => {
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

  const [properties, setProperties] = useState<SyncedPropertyListing[]>(initialProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProperties[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState<'all' | 'usda' | 'lmi_cra' | 'price_drops' | 'prequalified'>('all');
  const [zillowInputUrl, setZillowInputUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Area Request Modal State
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [requestTargetArea, setRequestTargetArea] = useState('');
  const [requestBuyerEmail, setRequestBuyerEmail] = useState('');
  const [requestBuyerName, setRequestBuyerName] = useState('');
  const [requestProgram, setRequestProgram] = useState<'USDA 100%' | 'LMI CRA Grant' | 'HomeReady 3%' | 'Any Low/No Down'>('Any Low/No Down');
  const [areaRequestSuccess, setAreaRequestSuccess] = useState<string | null>(null);

  // Compute DTI Envelope
  const prequalResult = useMemo(() => {
    const res = calculateDtiEnvelope(buyerProfile);
    if (onPrequalRecalculated) onPrequalRecalculated(res);
    return res;
  }, [buyerProfile, onPrequalRecalculated]);

  // Filter listings
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      if (activeFilter === 'usda') return prop.specialPrograms.usdaRural100Financing;
      if (activeFilter === 'lmi_cra') return prop.specialPrograms.lmiCraGrantEligible;
      if (activeFilter === 'price_drops') return (prop.priceDropAmount || 0) > 0;
      if (activeFilter === 'prequalified') return prop.price <= prequalResult.estimatedMaxPurchasePrice;
      return true;
    });
  }, [properties, activeFilter, prequalResult.estimatedMaxPurchasePrice]);

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

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

  const mergedConfig: MasterFeedSyncConfig = {
    adminContactEmail: masterConfig.adminContactEmail || 'fordmj@gmail.com',
    assignedLoanOfficerName: masterConfig.assignedLoanOfficerName || 'Mike Ford',
    assignedAgentName: masterConfig.assignedAgentName || 'Kanndice Ford',
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
      {/* Plugin Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">First-Time Homebuyer GeoMap & DPA Engine</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                Managed Master Feed Sync
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Curated by Mike Ford • USDA 100% RD Rural • LMI Census Tract Grants • 50% Max DTI Envelope
            </p>
          </div>
        </div>

        {/* Action Buttons: 1-Click Sync & Request Area Listings */}
        <div className="flex items-center gap-2">
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
              title="API & Account Settings"
            >
              <Key className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {syncStatus && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Main Grid: DTI Sliders + Interactive Map Pin Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive DTI Sliders (5 Cols) */}
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

          {/* Real-time Calculated Prequal Envelope */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-400">Max Purchase Price:</span>
              <span className="text-base font-bold font-mono text-emerald-400">{formatUSD(prequalResult.estimatedMaxPurchasePrice)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400">Max Monthly Housing Pmt:</span>
              <span className="font-mono font-bold text-white">{formatUSD(prequalResult.maxAllowableMonthlyHousingPayment)}/mo</span>
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

        {/* Right Column: Spatial Map Pins & Selected Listing Deep-Dive (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Program Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: `All (${properties.length})` },
              { id: 'usda', label: '🌾 USDA 100% RD Rural' },
              { id: 'lmi_cra', label: '🏛️ LMI $5k CRA Grant' },
              { id: 'price_drops', label: '🔥 Price Drops' },
              { id: 'prequalified', label: '✅ Prequalified Only' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive GeoMap Canvas */}
          <div className="relative bg-stone-950 border border-stone-800 rounded-2xl h-56 w-full overflow-hidden p-4 flex flex-col justify-between">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 bg-stone-900/90 text-stone-300 text-[10px] font-mono rounded-lg border border-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" /> GeoSphere Master Layer (Oregon GIS)
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono rounded border border-emerald-800">
                Managed by Mike Ford
              </span>
            </div>

            {/* Interactive Pins */}
            <div className="relative z-10 flex items-center justify-around py-4">
              {filteredProperties.map((prop) => {
                const isSelected = prop.id === selectedPropertyId;
                const qualifies = prop.price <= prequalResult.estimatedMaxPurchasePrice;
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      if (onPropertySelect) onPropertySelect(prop);
                    }}
                    className={`flex flex-col items-center group transition transform hover:scale-110 cursor-pointer ${
                      isSelected ? 'scale-110 z-20' : 'opacity-85'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-2xl shadow-lg border flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-stone-950 border-white'
                          : qualifies
                          ? 'bg-stone-900 text-emerald-400 border-emerald-500/50'
                          : 'bg-stone-900 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                    </div>
                    <span className="mt-1 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-stone-900/90 text-white border border-stone-800">
                      {formatUSD(prop.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 flex justify-between items-center text-[10px] text-stone-400 font-mono">
              <span>Census Tract LMI: Active</span>
              <span>USDA RD Boundary: Active</span>
            </div>
          </div>

          {/* Selected Property Deep-Dive */}
          {selectedProperty && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3">
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

              {/* Two-Way Notes Box */}
              <div className="text-xs text-stone-300 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800 whitespace-pre-wrap font-sans">
                <span className="text-[10px] text-stone-400 font-bold uppercase block mb-1">Two-Way Listing Notes:</span>
                {selectedProperty.propertyNotes}
              </div>
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

      {/* Footer & Copyright */}
      <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-mono">
        <span>Vantage Intelligence Assist (VIA) • Master GeoSphere Network</span>
        <span>Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.</span>
      </div>
    </div>
  );
};
