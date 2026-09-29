/**
 * @file CensusTractLeadDensityHeatmap.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Interactive Census Tract Lead Density, Household Income, & Property Value Heatmap Visualization.
 * Features:
 *  - Clickable Property Pinning System synced to Workspace 2nd Brain Memory
 *  - 1-Click Hyper-Local Micro-Scrape Trigger around pinned properties
 *  - AI Two-Way "Join Conversation" Outreach Response Scripting
 *  - 2-Way Co-Branded Loan Officer & Realtor SMS Relay
 *  - Metric Layer Toggle: 'Lead Density' | 'Average Household Income' | 'Property Value'
 *  - Interactive Zoom Controls: Zoom In (+), Zoom Out (-), Reset View (100%)
 *  - Dedicated ZIP code & County search bar with instant autocomplete chips
 *  - Dynamic Floating Legend Overlay responding to active metric mode
 *  - Low-to-Moderate Income (LMI), USDA Rural, Lakeview 100%, and CRA Grant cluster overlays
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Flame,
  Layers,
  MapPin,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  DollarSign,
  Send,
  Building,
  CheckCircle2,
  ShieldCheck,
  Search,
  ArrowRight,
  Maximize2,
  Minimize2,
  Sliders,
  Compass,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
  Play,
  Copy,
  Check,
  Hash,
  HelpCircle,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Pin,
  PlusCircle,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Trash2,
  Share2
} from 'lucide-react';
import {
  CensusTractLeadCluster,
  CensusTractLeadDensityService,
  GeoMapPinnedProperty,
  HeatmapFilterOptions,
  HeatmapMetricMode,
  generateCensusTractClustersForRegion,
  getDensityColor,
  getHeatmapMetricColor
} from '../services/censusTractLeadDensityService';
import { US_STATES } from '../data/usStatesAndCounties';
import { useMemory } from '../context/MemoryContext';

interface CensusTractLeadDensityHeatmapProps {
  isOpen: boolean;
  onClose: () => void;
  initialStateCode?: string;
  onLaunchTargetedCampaign?: (campaignQuery: { andTerms: string[]; orTerms: string[]; notTerms: string[] }) => void;
}

export const CensusTractLeadDensityHeatmap: React.FC<CensusTractLeadDensityHeatmapProps> = ({
  isOpen,
  onClose,
  initialStateCode = 'OR',
  onLaunchTargetedCampaign
}) => {
  const { saveMemory } = useMemory();

  const [selectedState, setSelectedState] = useState<string>(initialStateCode);
  const [activeLayer, setActiveLayer] = useState<HeatmapFilterOptions['activeLayer']>('all_density');
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('lead_density');
  const [minLeadCount, setMinLeadCount] = useState<number>(1);
  const [selectedTract, setSelectedTract] = useState<CensusTractLeadCluster | null>(null);
  
  // Dedicated GeoMap Search Bar State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'all' | 'zip' | 'county'>('all');
  const [selectedCountyChip, setSelectedCountyChip] = useState<string>('all');
  const [selectedZipChip, setSelectedZipChip] = useState<string>('all');

  // Floating Legend Overlay State
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  // Zoom and Pan Viewport Controls State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Property Pinning & Workspace Memory States
  const [selectedPin, setSelectedPin] = useState<GeoMapPinnedProperty | null>(null);
  const [showPinsDrawer, setShowPinsDrawer] = useState<boolean>(false);
  const [showAddPinModal, setShowAddPinModal] = useState<boolean>(false);
  const [savingMemoryId, setSavingMemoryId] = useState<string | null>(null);
  const [memorySuccessMsg, setMemorySuccessMsg] = useState<string | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'spatial_map' | 'grid_cards'>('spatial_map');

  // Custom Pin Form State
  const [newPinAddress, setNewPinAddress] = useState<string>('');
  const [newPinCity, setNewPinCity] = useState<string>('');
  const [newPinZip, setNewPinZip] = useState<string>('');
  const [newPinPrice, setNewPinPrice] = useState<string>('375000');
  const [newPinBeds, setNewPinBeds] = useState<string>('3');
  const [newPinBaths, setNewPinBaths] = useState<string>('2');
  const [newPinNotes, setNewPinNotes] = useState<string>('');

  const rawClusters = useMemo(() => {
    return generateCensusTractClustersForRegion(selectedState);
  }, [selectedState]);

  // Load custom saved pins from local storage and merge with sample properties
  const [storedPinnedProperties, setStoredPinnedProperties] = useState<GeoMapPinnedProperty[]>(() => {
    return CensusTractLeadDensityService.getPinnedProperties(selectedState);
  });

  // Re-sync stored pins when state changes
  useEffect(() => {
    setStoredPinnedProperties(CensusTractLeadDensityService.getPinnedProperties(selectedState));
  }, [selectedState]);

  // Combine sample cluster properties + user custom pinned properties
  const allPinnedProperties = useMemo(() => {
    const clusterSamplePins = rawClusters.flatMap(c => c.sampleProperties || []);
    const userCustomPins = storedPinnedProperties.filter(p => p.stateCode.toUpperCase() === selectedState.toUpperCase());
    
    // Deduplicate by ID
    const map = new Map<string, GeoMapPinnedProperty>();
    clusterSamplePins.forEach(p => map.set(p.id, p));
    userCustomPins.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, [rawClusters, storedPinnedProperties, selectedState]);

  const availableFilters = useMemo(() => {
    return CensusTractLeadDensityService.getAvailableCountiesAndZips(rawClusters);
  }, [rawClusters]);

  const filteredClusters = useMemo(() => {
    let result = CensusTractLeadDensityService.filterTractClusters(rawClusters, {
      stateCode: selectedState,
      countyName: selectedCountyChip !== 'all' ? selectedCountyChip : undefined,
      zipCode: selectedZipChip !== 'all' ? selectedZipChip : undefined,
      activeLayer,
      metricMode,
      minLeadCountThreshold: minLeadCount,
      minDensityScore: 0
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c => {
        if (searchMode === 'zip') {
          return c.primaryZipCode.startsWith(q) || c.zipCodes.some(z => z.startsWith(q));
        } else if (searchMode === 'county') {
          return c.countyName.toLowerCase().includes(q);
        } else {
          return (
            c.primaryZipCode.startsWith(q) ||
            c.zipCodes.some(z => z.startsWith(q)) ||
            c.countyName.toLowerCase().includes(q) ||
            c.tractName.toLowerCase().includes(q) ||
            c.cityName.toLowerCase().includes(q) ||
            c.tractGeoId.includes(q)
          );
        }
      });
    }

    return result;
  }, [rawClusters, selectedState, selectedCountyChip, selectedZipChip, activeLayer, metricMode, minLeadCount, searchQuery, searchMode]);

  const summary = useMemo(() => {
    return CensusTractLeadDensityService.computeHeatmapSummary(filteredClusters);
  }, [filteredClusters]);

  // Set default selected tract to highest density
  useEffect(() => {
    if (filteredClusters.length > 0 && !selectedTract) {
      setSelectedTract(filteredClusters[0]);
    } else if (filteredClusters.length > 0 && selectedTract) {
      const stillExists = filteredClusters.find(c => c.tractGeoId === selectedTract.tractGeoId);
      if (!stillExists) setSelectedTract(filteredClusters[0]);
    }
  }, [filteredClusters]);

  // Reset zoom & pan when switching states or filtering
  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.65, +(prev - 0.25).toFixed(2)));
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // WORKSPACE MEMORY SAVING HANDLER
  const handleSavePinToWorkspaceMemory = async (property: GeoMapPinnedProperty) => {
    setSavingMemoryId(property.id);
    try {
      // 1. Format memory document
      const memoryDoc = CensusTractLeadDensityService.formatPropertyToWorkspaceMemory(property);

      // 2. Persist to Second Brain Workspace Memory via Context
      await saveMemory({
        title: memoryDoc.title,
        content: memoryDoc.content,
        type: 'knowledge',
        tags: memoryDoc.tags,
        category: 'Real Estate & Mortgage Intelligence'
      });

      // 3. Save to local storage pinned list
      const updatedList = CensusTractLeadDensityService.savePinnedProperty(property);
      setStoredPinnedProperties(updatedList);

      // 4. Update selected pin
      setSelectedPin(prev => prev ? { ...prev, savedToWorkspaceMemory: true } : null);

      setMemorySuccessMsg(`Saved "${property.address}" to Workspace 2nd Brain!`);
      setTimeout(() => setMemorySuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save to memory', err);
    } finally {
      setSavingMemoryId(null);
    }
  };

  // REMOVE PIN
  const handleRemovePin = (propertyId: string) => {
    const updated = CensusTractLeadDensityService.removePinnedProperty(propertyId);
    setStoredPinnedProperties(updated);
    if (selectedPin?.id === propertyId) {
      setSelectedPin(null);
    }
  };

  // LAUNCH MICRO-SCRAPE AROUND PINNED PROPERTY
  const handleLaunchMicroScrapeForPin = (property: GeoMapPinnedProperty) => {
    if (onLaunchTargetedCampaign) {
      onLaunchTargetedCampaign(property.microScrapeQuery);
      onClose();
    }
  };

  // COPY OUTREACH SCRIPT
  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // CREATE CUSTOM PROPERTY PIN
  const handleCreateCustomPin = () => {
    if (!newPinAddress || !newPinZip) return;

    const matchedTract = filteredClusters.find(c => c.primaryZipCode === newPinZip || c.zipCodes.includes(newPinZip)) || filteredClusters[0];
    const priceNum = Number(newPinPrice) || 375000;
    const isLmi = matchedTract?.isLmiEligible ?? true;
    const isUsda = matchedTract?.isUsdaRuralEligible ?? false;

    const newPin: GeoMapPinnedProperty = {
      id: `custom_pin_${Date.now()}`,
      address: newPinAddress,
      cityName: newPinCity || matchedTract?.cityName || 'Target Area',
      stateCode: selectedState,
      zipCode: newPinZip,
      priceUsd: priceNum,
      beds: Number(newPinBeds) || 3,
      baths: Number(newPinBaths) || 2,
      sqft: 1400,
      propertyType: 'Single Family',
      tractGeoId: matchedTract?.tractGeoId || `${selectedState}999000100`,
      tractName: matchedTract?.tractName || 'Custom Target Census Tract',
      countyName: matchedTract?.countyName || `${selectedState} County`,
      lmiCategory: matchedTract?.lmiCategory || 'Moderate',
      amiPercentage: matchedTract?.amiPercentage || 68,
      isLmiEligible: isLmi,
      isLakeviewEligible: (matchedTract?.amiPercentage || 68) <= 140,
      isUsdaRuralEligible: isUsda,
      isStateBondEligible: true,
      allowsRateBuydownStacking: true,
      topProgramStack: isUsda ? 'USDA Rural 100% Zero-Down + 2-1 Buydown' : isLmi ? 'Lakeview 100% Zero-Down + 2-1 Buydown' : 'HomeReady 3% Down + 2-1 Buydown',
      downPaymentRequiredUsd: (isUsda || isLmi) ? 0 : Math.round(priceNum * 0.03),
      netOutofPocketEstimateUsd: isLmi ? 1200 : 2500,
      affordabilityStrategies: [
        isUsda ? 'USDA 100% Zero-Down Rural Financing' : 'State HFA Down Payment Assistance & Zero-Down Stack',
        '2-1 Temporary Rate Buydown Structured with Seller Credits',
        'Seller-Paid Closing Cost Concessions'
      ],
      smartCallToAction: `Connect with a licensed loan officer for a complimentary 10-minute seller-concession & buydown review for ${newPinAddress}.`,
      suggestedOutreachScript: `Regarding ${newPinAddress} in ${newPinZip}: This property qualifies for ${isLmi ? '100% zero-down financing options' : 'State HFA low down payment options'}. As a loan officer, I can help you structure a 2-1 rate buydown with seller concessions so your initial housing costs stay manageable from day one. Let’s do a quick 10-minute review to explore your custom scenario!`,
      microScrapeQuery: {
        andTerms: [newPinAddress.split(' ')[0], newPinZip, 'buyer'],
        orTerms: ['down payment assistance', 'first time buyer', 'starter home'],
        notTerms: ['investor', 'cash']
      },
      matchedLeadsCount: matchedTract?.leadCount || 10,
      savedToWorkspaceMemory: false,
      customNotes: newPinNotes,
      pinStatus: 'ready_to_outreach',
      coordinates: { xPercent: 50, yPercent: 50 }
    };

    const updated = CensusTractLeadDensityService.savePinnedProperty(newPin);
    setStoredPinnedProperties(updated);
    setSelectedPin(newPin);
    setShowAddPinModal(false);
    setNewPinAddress('');
    setNewPinCity('');
    setNewPinZip('');
    setNewPinNotes('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCountyChip('all');
    setSelectedZipChip('all');
    setActiveLayer('all_density');
    handleResetZoom();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-rose-500/20 text-white">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-white via-rose-200 to-indigo-200 bg-clip-text text-transparent">
                  GeoMap Lead Density &amp; Property Pinning Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Live Memory Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pin high-interest properties to Workspace Memory, trigger micro-scrapes, &amp; join buyer conversations with $0 down DPA calculations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Saved Pins Counter Button */}
            <button
              onClick={() => setShowPinsDrawer(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border cursor-pointer ${
                showPinsDrawer
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950/80 text-amber-300 border-amber-500/30 hover:bg-slate-800'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Saved Pins ({allPinnedProperties.length})</span>
            </button>

            {/* Add Custom Pin Button */}
            <button
              onClick={() => setShowAddPinModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Drop Pin</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Memory Save Notification Toast */}
        {memorySuccessMsg && (
          <div className="px-6 py-2 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              <span>{memorySuccessMsg}</span>
            </div>
            <span className="text-[10px] text-slate-400">Available in 2nd Brain &amp; Voice Macros</span>
          </div>
        )}

        {/* Dedicated GeoMap Search & Layer Control Bar */}
        <div className="px-6 py-3 bg-slate-950/95 border-b border-slate-800/80 flex flex-col gap-2.5 text-xs">
          
          {/* Main Search & Metric Layer Switcher Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input with Mode Toggle */}
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              
              {/* State Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
                <Compass className="w-4 h-4 text-indigo-400" />
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCountyChip('all');
                    setSelectedZipChip('all');
                    handleResetZoom();
                  }}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code} className="bg-slate-900 text-white">
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* GeoMap Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    searchMode === 'zip'
                      ? "Filter by ZIP code (e.g. 97402, 97266, 97756)..."
                      : searchMode === 'county'
                      ? "Filter by County name (e.g. Lane, Multnomah, Deschutes)..."
                      : "Search by ZIP, County, City, or Tract Name..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 text-slate-100 pl-9 pr-8 py-1.5 rounded-xl border border-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-500 font-medium text-xs shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Mode Toggle */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] shrink-0">
                <button
                  onClick={() => setSearchMode('all')}
                  className={`px-2 py-1 rounded-lg font-semibold transition ${
                    searchMode === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchMode('zip')}
                  className={`px-2 py-1 rounded-lg font-semibold transition ${
                    searchMode === 'zip'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📮 ZIP
                </button>
                <button
                  onClick={() => setSearchMode('county')}
                  className={`px-2 py-1 rounded-lg font-semibold transition ${
                    searchMode === 'county'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏛️ County
                </button>
              </div>

            </div>

            {/* Quick Stats & Reset */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-bold text-cyan-300">
                🎯 {filteredClusters.length} Tracts Active
              </span>
              {(searchQuery || selectedCountyChip !== 'all' || selectedZipChip !== 'all' || activeLayer !== 'all_density' || metricMode !== 'lead_density') && (
                <button
                  onClick={handleClearFilters}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

          </div>

          {/* PRIMARY LAYER TOGGLE CONTROL */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Heatmap Layer:
              </span>
              <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-indigo-500/30 shadow-md">
                
                {/* 1. Lead Density Layer */}
                <button
                  onClick={() => setMetricMode('lead_density')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    metricMode === 'lead_density'
                      ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-rose-500/20 ring-1 ring-rose-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lead Density</span>
                </button>

                {/* 2. Average Household Income Layer */}
                <button
                  onClick={() => setMetricMode('household_income')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    metricMode === 'household_income'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Average Household Income</span>
                </button>

                {/* 3. Property Value Layer */}
                <button
                  onClick={() => setMetricMode('property_value')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    metricMode === 'property_value'
                      ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  <span>Property Value</span>
                </button>

              </div>
            </div>

            {/* Minimum Lead Count Slider */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Min Leads Filter:</span>
              <span className="font-bold text-cyan-300 w-4">{minLeadCount}</span>
              <input
                type="range"
                min={1}
                max={15}
                value={minLeadCount}
                onChange={(e) => setMinLeadCount(Number(e.target.value))}
                className="w-16 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick County & ZIP Suggestions Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900/80">
            
            {/* County Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Counties:</span>
              <button
                onClick={() => setSelectedCountyChip('all')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  selectedCountyChip === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Counties
              </button>
              {availableFilters.counties.slice(0, 7).map((county) => (
                <button
                  key={county}
                  onClick={() => setSelectedCountyChip(county === selectedCountyChip ? 'all' : county)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCountyChip === county
                      ? 'bg-purple-600 text-white shadow ring-1 ring-purple-400'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  🏛️ {county.replace(' County', '')}
                </button>
              ))}
            </div>

            {/* ZIP Code Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">ZIPs:</span>
              {availableFilters.zipCodes.slice(0, 6).map((zip) => (
                <button
                  key={zip}
                  onClick={() => setSelectedZipChip(zip === selectedZipChip ? 'all' : zip)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                    selectedZipChip === zip
                      ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-400'
                      : 'bg-slate-900 text-cyan-300/80 hover:text-cyan-200 border border-slate-800'
                  }`}
                >
                  📮 {zip}
                </button>
              ))}
            </div>

          </div>

          {/* Program Qualifier Filter Chips */}
          <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-900/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-1">Eligibility Overlays:</span>
            <button
              onClick={() => setActiveLayer('all_density')}
              className={`px-2.5 py-0.5 font-semibold rounded-lg text-[11px] transition cursor-pointer ${
                activeLayer === 'all_density'
                  ? 'bg-gradient-to-r from-slate-700 to-indigo-700 text-white shadow ring-1 ring-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              🌐 All Qualified Zones
            </button>
            <button
              onClick={() => setActiveLayer('lmi_only')}
              className={`px-2.5 py-0.5 font-semibold rounded-lg text-[11px] transition cursor-pointer ${
                activeLayer === 'lmi_only'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow ring-1 ring-pink-400'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              💎 LMI Hotspots (≤80% AMI)
            </button>
            <button
              onClick={() => setActiveLayer('buydown_stack_only')}
              className={`px-2.5 py-0.5 font-semibold rounded-lg text-[11px] transition cursor-pointer ${
                activeLayer === 'buydown_stack_only'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              ⚡ 2-1 Rate Buydown Stack
            </button>
            <button
              onClick={() => setActiveLayer('usda_only')}
              className={`px-2.5 py-0.5 font-semibold rounded-lg text-[11px] transition cursor-pointer ${
                activeLayer === 'usda_only'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow ring-1 ring-amber-400'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              🚜 USDA Rural 100%
            </button>
            <button
              onClick={() => setActiveLayer('lakeview_only')}
              className={`px-2.5 py-0.5 font-semibold rounded-lg text-[11px] transition cursor-pointer ${
                activeLayer === 'lakeview_only'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow ring-1 ring-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              🌟 Lakeview 100% DPA
            </button>
          </div>

        </div>

        {/* Viewport KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-6 py-2 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Filtered Tracts:</span>
            <span className="font-bold text-white">{summary.totalTracts}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">LMI Eligible Clusters:</span>
            <span className="font-bold text-pink-400">{summary.lmiTractsCount} tracts ({Math.round((summary.lmiTractsCount / (summary.totalTracts || 1)) * 100)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Scraped Leads:</span>
            <span className="font-bold text-cyan-400">{summary.totalLeadsInClusters} leads ({summary.totalHighIntentLeads} High-Intent)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pinned Homes in Area:</span>
            <span className="font-bold text-amber-300">{allPinnedProperties.length} Properties Tracked</span>
          </div>
        </div>

        {/* Main Heatmap Content & Detail Inspector */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Spatial Heatmap Visualizer (Left 7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>
                  {metricMode === 'lead_density' && `🔥 Lead Density & Pinned Properties Map (${selectedState})`}
                  {metricMode === 'household_income' && `💵 Average Household Income Heatmap (${selectedState})`}
                  {metricMode === 'property_value' && `🏡 Property Value & Conforming Price Heatmap (${selectedState})`}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any 📍 Property Pin or Census Tract
              </span>
            </div>

            {/* Spatial Visual Map Simulation Canvas with Interactive Zoom & Pan */}
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative w-full h-[440px] sm:h-[490px] bg-slate-950 rounded-3xl border border-slate-800 p-4 overflow-hidden flex flex-col justify-between shadow-inner select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              
              {/* Background Geographic Gridlines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* INTUITIVE ZOOM & 'RESET VIEW' BUTTONS (Floating Top-Left) */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-indigo-500/40 shadow-xl">
                
                {/* Zoom In Button */}
                <button
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4 text-cyan-400" />
                </button>

                {/* Zoom Level Indicator */}
                <span className="px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-300 bg-slate-950 rounded-lg border border-slate-800">
                  {Math.round(zoomLevel * 100)}%
                </span>

                {/* Zoom Out Button */}
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4 text-cyan-400" />
                </button>

                {/* Reset View Button */}
                <button
                  onClick={handleResetZoom}
                  title="Reset View (100% & Center)"
                  className="px-2 py-1 text-slate-300 hover:text-white hover:bg-indigo-600/80 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reset</span>
                </button>
              </div>

              {/* DYNAMIC FLOATING LEGEND OVERLAY */}
              <div
                className="absolute top-3 right-3 z-20 max-w-[270px] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-indigo-500/40 shadow-2xl p-3 text-[11px] transition-all duration-300"
              >
                {/* Floating Legend Header */}
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    {metricMode === 'lead_density' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                    {metricMode === 'household_income' && <DollarSign className="w-3.5 h-3.5 text-emerald-400" />}
                    {metricMode === 'property_value' && <Home className="w-3.5 h-3.5 text-amber-400" />}
                    <span>
                      {metricMode === 'lead_density' && 'Lead Density & Pins'}
                      {metricMode === 'household_income' && 'Household Income Scale'}
                      {metricMode === 'property_value' && 'Property Value Scale'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLegendExpanded(prev => !prev)}
                    className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
                    title={isLegendExpanded ? "Collapse Legend" : "Expand Legend"}
                  >
                    {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Legend Details */}
                {isLegendExpanded ? (
                  <div className="space-y-2 mt-2">
                    
                    {/* Continuous Gradient Bar for Active Layer */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                        {metricMode === 'lead_density' && (
                          <>
                            <span>Low Density</span>
                            <span>Medium</span>
                            <span>Ultra-High</span>
                          </>
                        )}
                        {metricMode === 'household_income' && (
                          <>
                            <span>Low (&lt;50% AMI)</span>
                            <span>Moderate</span>
                            <span>Upper (&gt;140%)</span>
                          </>
                        )}
                        {metricMode === 'property_value' && (
                          <>
                            <span>Starter (&le;$350k)</span>
                            <span>Mid ($500k)</span>
                            <span>Ceiling ($832k+)</span>
                          </>
                        )}
                      </div>
                      
                      <div className={`w-full h-2 rounded-full shadow ${
                        metricMode === 'lead_density'
                          ? 'bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-rose-500 to-pink-500'
                          : metricMode === 'household_income'
                          ? 'bg-gradient-to-r from-rose-500 via-pink-500 via-purple-500 via-cyan-500 to-emerald-500'
                          : 'bg-gradient-to-r from-emerald-500 via-cyan-500 via-amber-500 via-orange-500 to-pink-500'
                      }`} />
                    </div>

                    {/* Scale Breakdown Items */}
                    {metricMode === 'lead_density' && (
                      <div className="space-y-1 pt-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                            <span className="font-bold text-pink-300">Ultra-High Intensity</span>
                          </div>
                          <span className="text-slate-400 font-mono">90-100 (15+ Leads)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                            <span className="font-bold text-purple-300">High Intensity</span>
                          </div>
                          <span className="text-slate-400 font-mono">70-89 (10-14 Leads)</span>
                        </div>
                      </div>
                    )}

                    {metricMode === 'household_income' && (
                      <div className="space-y-1 pt-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                            <span className="font-bold text-rose-300">Low Income (&le;50% AMI)</span>
                          </div>
                          <span className="text-slate-400 font-mono">$10k Grant Target</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
                            <span className="font-bold text-pink-300">Moderate LMI (50-80%)</span>
                          </div>
                          <span className="text-slate-400 font-mono">Prime DPA</span>
                        </div>
                      </div>
                    )}

                    {metricMode === 'property_value' && (
                      <div className="space-y-1 pt-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                            <span className="font-bold text-emerald-300">Starter Tier (&le;$350k)</span>
                          </div>
                          <span className="text-slate-400 font-mono">High Afford</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                            <span className="font-bold text-cyan-300">FHA &amp; DPA ($350k-$425k)</span>
                          </div>
                          <span className="text-slate-400 font-mono">Sweet Spot</span>
                        </div>
                      </div>
                    )}

                    {/* Program & Pin Symbols Key */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[9px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <span className="text-amber-400">📍</span> Pinned Property
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-400">⚡</span> 2-1 Buydown Stack
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-pink-400">💎</span> LMI (&le;80% AMI)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-cyan-400">🌟</span> Lakeview 100%
                      </span>
                    </div>

                  </div>
                ) : (
                  <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Pins &amp; Heatmap Active</span>
                    <span className="text-cyan-400 font-bold">{allPinnedProperties.length} Pins</span>
                  </div>
                )}
              </div>

              {/* Spatial Heatmap Nodes & Property Pins Container */}
              <div
                className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto transition-transform duration-150 ease-out origin-center"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`
                }}
              >
                {filteredClusters.map((cluster, idx) => {
                  const isSelected = selectedTract?.tractGeoId === cluster.tractGeoId;
                  const isTopHottest = idx === 0;
                  const activeMetricColor = getHeatmapMetricColor(cluster, metricMode);
                  const tractPins = allPinnedProperties.filter(p => p.tractGeoId === cluster.tractGeoId);

                  return (
                    <div
                      key={cluster.tractGeoId}
                      className={`relative p-3 rounded-2xl border text-left transition-all group overflow-hidden ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-400 shadow-2xl ring-2 ring-indigo-400/60 scale-[1.02]'
                          : 'bg-slate-900/85 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Metric Color Glow Flare */}
                      <div
                        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl opacity-35 group-hover:opacity-65 transition"
                        style={{ backgroundColor: activeMetricColor }}
                      />

                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-1 mb-1.5 cursor-pointer" onClick={() => setSelectedTract(cluster)}>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">
                            {cluster.cityName}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-cyan-300 px-1 py-0.2 bg-cyan-950/80 rounded border border-cyan-500/30">
                            {cluster.primaryZipCode}
                          </span>
                        </div>
                        
                        {/* Dynamic Top Badge */}
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-black text-white"
                          style={{ backgroundColor: activeMetricColor }}
                        >
                          {metricMode === 'lead_density' && `${cluster.leadCount} Leads`}
                          {metricMode === 'household_income' && `$${Math.round(cluster.medianHouseholdIncomeUsd / 1000)}k Inc`}
                          {metricMode === 'property_value' && `$${Math.round(cluster.avgTargetHomePriceUsd / 1000)}k Val`}
                        </span>
                      </div>

                      <h4
                        onClick={() => setSelectedTract(cluster)}
                        className="text-xs font-bold text-white group-hover:text-indigo-200 transition truncate cursor-pointer"
                      >
                        {cluster.tractName.split('(')[0]}
                      </h4>

                      {/* Dynamic Metric Metrics Row */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          cluster.lmiCategory === 'Low'
                            ? 'bg-rose-500/20 text-rose-300'
                            : cluster.lmiCategory === 'Moderate'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {cluster.lmiCategory} ({cluster.amiPercentage}% AMI)
                        </span>

                        <div className="flex items-center gap-1 font-extrabold text-amber-400">
                          <Flame className="w-3 h-3" />
                          <span>{cluster.leadDensityScore}</span>
                        </div>
                      </div>

                      {/* CLICKABLE PROPERTY PINS IN THIS TRACT */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                          <span className="flex items-center gap-1 text-amber-300">
                            <Pin className="w-3 h-3 text-amber-400" />
                            <span>Pinned Homes ({tractPins.length})</span>
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTract(cluster);
                              setNewPinCity(cluster.cityName);
                              setNewPinZip(cluster.primaryZipCode);
                              setShowAddPinModal(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer font-semibold"
                          >
                            <PlusCircle className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                        </div>

                        {tractPins.slice(0, 2).map((pin) => {
                          const isPinSelected = selectedPin?.id === pin.id;
                          return (
                            <button
                              key={pin.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPin(pin);
                                setSelectedTract(cluster);
                              }}
                              className={`w-full p-1.5 rounded-xl border text-left transition text-[10px] flex items-center justify-between cursor-pointer ${
                                isPinSelected
                                  ? 'bg-indigo-950/80 border-amber-400 ring-1 ring-amber-400 text-white'
                                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-amber-400">📍</span>
                                <span className="font-bold truncate">{pin.address}</span>
                              </div>
                              <span className="font-mono font-bold text-emerald-400 shrink-0 ml-1">
                                ${Math.round(pin.priceUsd / 1000)}k
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {isTopHottest && (
                        <span className="absolute top-1 right-1 flex h-2 w-2 pointer-events-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Canvas Helper */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  FFIEC Census Tracts &bull; Click 📍 Pins to Save to Memory &amp; Launch Micro-Scrapes
                </span>
                <span className="font-semibold text-indigo-300">{allPinnedProperties.length} Properties Tracked</span>
              </div>

            </div>
          </div>

          {/* Tract & Pinned Property Inspector (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            
            {/* Header with Pin Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {selectedPin ? (
                  <>
                    <Pin className="w-4 h-4 text-amber-400" />
                    <span>Pinned Property Intelligence</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Census Tract Campaign Inspector</span>
                  </>
                )}
              </h3>

              {selectedPin ? (
                <button
                  onClick={() => setSelectedPin(null)}
                  className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-slate-800 cursor-pointer"
                >
                  View Tract Leads
                </button>
              ) : selectedTract && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedTract.leadDensityScore}/100 Density Index
                </span>
              )}
            </div>

            {/* PINNED PROPERTY CARD VIEW */}
            {selectedPin ? (
              <div className="bg-slate-950/85 rounded-3xl border border-amber-500/40 p-4 space-y-3.5 shadow-2xl flex-1 flex flex-col justify-between">
                <div>
                  
                  {/* Property Header */}
                  <div className="p-3 bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/50 rounded-2xl border border-amber-500/30 mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          <span>Pinned Property</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 px-1.5 py-0.2 bg-cyan-950/90 rounded border border-cyan-500/40">
                          ZIP {selectedPin.zipCode}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-400 font-mono">
                        ${selectedPin.priceUsd.toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {selectedPin.address}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {selectedPin.cityName}, {selectedPin.stateCode} &bull; {selectedPin.beds} Beds, {selectedPin.baths} Baths ({selectedPin.sqft.toLocaleString()} SqFt)
                    </p>

                    {/* Financial & Compliance Overview */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Cash-to-Close:</span>
                        <span className="font-bold text-emerald-300">
                          ${selectedPin.netOutofPocketEstimateUsd.toLocaleString()} (${selectedPin.downPaymentRequiredUsd === 0 ? '$0 Down Payment' : `$${selectedPin.downPaymentRequiredUsd.toLocaleString()} Down`})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Affordability Strategy:</span>
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>2-1 Buydown &amp; Seller Concessions</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Affordability Strategies Blueprint (100% APR-Compliant) */}
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-emerald-500/30 text-xs space-y-2 mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span>Payment Affordability Blueprint:</span>
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% APR-Compliant
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      {selectedPin.affordabilityStrategies.map((strat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                          <span>{strat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase tracking-wider">High-Converting Loan Officer CTA:</span>
                      <p className="text-amber-200 font-medium text-[11px] italic bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                        "{selectedPin.smartCallToAction}"
                      </p>
                    </div>
                  </div>

                  {/* Program Qualification Stack */}
                  <div className="space-y-1.5 mb-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Qualified Low/No-Down Programs &amp; Stacking:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPin.allowsRateBuydownStacking && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ⚡ 2-1 Rate Buydown Stackable
                        </span>
                      )}
                      {selectedPin.isLakeviewEligible && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          🌟 Lakeview 100% Zero-Down
                        </span>
                      )}
                      {selectedPin.isUsdaRuralEligible && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🚜 USDA 100% Rural Loan
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        💎 {selectedPin.lmiCategory} LMI ({selectedPin.amiPercentage}% AMI)
                      </span>
                    </div>
                  </div>

                  {/* AI Two-Way Outreach Script */}
                  <div className="p-3 bg-slate-900 rounded-2xl border border-indigo-500/30 text-xs space-y-1.5 mb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        <span>AI 1-Click "Join Conversation" Smart CTA Script</span>
                      </span>
                      <button
                        onClick={() => handleCopyScript(selectedPin.suggestedOutreachScript)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedScript ? 'Copied' : 'Copy Script'}
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] italic bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                      "{selectedPin.suggestedOutreachScript}"
                    </p>
                  </div>

                </div>

                {/* Pin Action Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    
                    {/* Save to Workspace Memory Button */}
                    <button
                      onClick={() => handleSavePinToWorkspaceMemory(selectedPin)}
                      disabled={savingMemoryId === selectedPin.id}
                      className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savingMemoryId === selectedPin.id ? 'Syncing...' : 'Save to 2nd Brain'}</span>
                    </button>

                    {/* 2-Way SMS to LO / Partner */}
                    <a
                      href={`sms:?body=${encodeURIComponent(`[Pinned Property Opportunity]\n${selectedPin.address}, ${selectedPin.cityName} (${selectedPin.zipCode})\nPrice: $${selectedPin.priceUsd.toLocaleString()}\nFinancing: ${selectedPin.topProgramStack}\nOut-of-Pocket: $${selectedPin.netOutofPocketEstimateUsd.toLocaleString()}\nScript: ${selectedPin.suggestedOutreachScript}`)}`}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>📱 LO / Realtor SMS</span>
                    </a>
                  </div>

                  {/* Launch Micro-Scrape Around Pin */}
                  <button
                    onClick={() => handleLaunchMicroScrapeForPin(selectedPin)}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>🚀 Launch Micro-Scrape Around This Property</span>
                  </button>
                </div>

              </div>
            ) : selectedTract ? (
              
              /* CENSUS TRACT DETAILS VIEW */
              <div className="bg-slate-950/80 rounded-3xl border border-indigo-500/30 p-4 space-y-3.5 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  
                  {/* Tract Header */}
                  <div className="p-3 bg-gradient-to-br from-indigo-950/50 to-slate-900 rounded-2xl border border-indigo-500/30 mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          {selectedTract.countyName} &bull; {selectedTract.cityName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-cyan-300 px-1.5 py-0.2 bg-cyan-950/90 rounded border border-cyan-500/40">
                          ZIP {selectedTract.primaryZipCode}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        GeoID: {selectedTract.tractGeoId}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {selectedTract.tractName}
                    </h4>
                    
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Median Income:</span>
                        <span className="font-bold text-amber-300">
                          ${selectedTract.medianHouseholdIncomeUsd.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({selectedTract.amiPercentage}% of ${selectedTract.areaMedianIncomeUsd.toLocaleString()} AMI)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Target Home Price:</span>
                        <span className="font-bold text-emerald-300">
                          ${selectedTract.avgTargetHomePriceUsd.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          (Est. DPA: ${(selectedTract.avgTargetHomePriceUsd * 0.035).toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Qualified Program Badges */}
                  <div className="space-y-1.5 mb-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Qualified Low/No-Down Programs in this Tract:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTract.isLmiEligible && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          💎 LMI Eligible (&le;80% AMI)
                        </span>
                      )}
                      {selectedTract.allowsRateBuydownStacking && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ⚡ 2-1 Rate Buydown Stackable
                        </span>
                      )}
                      {selectedTract.isLakeviewEligible && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          🌟 Lakeview 100% (140% AMI)
                        </span>
                      )}
                      {selectedTract.isUsdaRuralEligible && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🚜 USDA 100% Zero-Down Rural
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top Matched Program */}
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 mb-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Top Recommended Program Stack:</span>
                    <span className="font-bold text-emerald-400">{selectedTract.topMatchedProgram}</span>
                  </div>

                  {/* Active Inbound Scraped Leads in Tract */}
                  <div className="space-y-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Inbound Lead Thread ({selectedTract.activeLeadsSample.length} in Sample):
                      </span>
                    </div>

                    {selectedTract.activeLeadsSample.map((lead, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-white truncate max-w-[170px]">{lead.author}</span>
                          <span className="text-[10px] text-cyan-400">{lead.platform}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] line-clamp-2 italic mb-1">
                          "{lead.snippet}"
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>Intent Score: <strong className="text-emerald-400">{lead.intentScore}%</strong></span>
                          <span className="text-indigo-400 font-semibold">High Conversion</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Campaign Action Box */}
                <div className="pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300">Targeted Campaign Matrix</span>
                    <button
                      onClick={() => {
                        const text = `AND: [${selectedTract.recommendedCampaignQuery.andTerms.join(', ')}] | OR: [${selectedTract.recommendedCampaignQuery.orTerms.join(', ')}] | NOT: [${selectedTract.recommendedCampaignQuery.notTerms.join(', ')}]`;
                        navigator.clipboard.writeText(text);
                        setCopiedQuery(true);
                        setTimeout(() => setCopiedQuery(false), 2000);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedQuery ? 'Copied Matrix' : 'Copy Query'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onLaunchTargetedCampaign) {
                        onLaunchTargetedCampaign(selectedTract.recommendedCampaignQuery);
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-pink-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Launch Targeted Scrape Sweep in this Tract</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-950/80 rounded-3xl border border-slate-800 p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                <Info className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
                <p className="text-xs">Select a census tract or click any 📍 property pin to inspect details and launch outreach.</p>
              </div>
            )}
          </div>

        </div>

        {/* FLOATING SAVED PINS DRAWER */}
        {showPinsDrawer && (
          <div className="px-6 py-4 bg-slate-950/98 border-t border-indigo-500/40 animate-fade-in max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Workspace Pinned Properties ({allPinnedProperties.length} Total in {selectedState})
                </h4>
              </div>
              <button
                onClick={() => setShowPinsDrawer(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

            {allPinnedProperties.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No properties pinned yet. Click "Drop Pin" or pick any property pin on the GeoMap.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allPinnedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedPin(prop);
                      setShowPinsDrawer(false);
                    }}
                    className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-400/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-300">
                        {prop.zipCode} &bull; {prop.cityName}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        ${prop.priceUsd.toLocaleString()}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate mb-1">
                      {prop.address}
                    </h5>

                    <p className="text-[11px] text-slate-400 truncate mb-2">
                      {prop.topProgramStack}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80">
                      <span className="text-amber-400 font-semibold">{prop.matchedLeadsCount} Leads</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePin(prop.id);
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-800 cursor-pointer"
                        title="Remove Pin"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD CUSTOM PIN MODAL */}
        {showAddPinModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-indigo-500/50 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Pin className="w-4 h-4 text-amber-400" />
                  <span>Drop Property Pin on GeoMap</span>
                </div>
                <button
                  onClick={() => setShowAddPinModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 1420 W 11th Ave"
                    value={newPinAddress}
                    onChange={(e) => setNewPinAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">City Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Eugene"
                      value={newPinCity}
                      onChange={(e) => setNewPinCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">ZIP Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 97402"
                      value={newPinZip}
                      onChange={(e) => setNewPinZip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Price ($)</label>
                    <input
                      type="number"
                      placeholder="375000"
                      value={newPinPrice}
                      onChange={(e) => setNewPinPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Beds</label>
                    <input
                      type="number"
                      placeholder="3"
                      value={newPinBeds}
                      onChange={(e) => setNewPinBeds(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Baths</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={newPinBaths}
                      onChange={(e) => setNewPinBaths(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Custom Notes / Outreach Target</label>
                  <input
                    type="text"
                    placeholder="e.g. High FHA eligibility, perfect for first-time buyers renting near Bethel"
                    value={newPinNotes}
                    onChange={(e) => setNewPinNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddPinModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomPin}
                  disabled={!newPinAddress || !newPinZip}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
                >
                  📍 Drop &amp; Stack DPA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% APR-Compliant Outreach: Focuses on DPA grant stacking, seller-funded 2-1 buydowns, and custom LO consultations without ungrounded payment/rate quotes.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition cursor-pointer"
          >
            Close Heatmap
          </button>
        </div>

      </div>
    </div>
  );
};
