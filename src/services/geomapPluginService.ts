/**
 * Real Estate GeoMap & MLS Intelligence Standalone Plugin Service
 * Generates turn-key prompts, standalone React code, headless hooks, Express routers, and HTML embeds.
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>
 */

import { PluginPackagingConfig } from './pluginArchetypeService';

export function generateGeoMapPluginPrompt(config: PluginPackagingConfig): string {
  return `# Vantage AI Studio — Real Estate GeoMap & MLS Intelligence Standalone Plugin
**Target Component**: \`${config.pluginName}\`
**Author & Commercial IP**: Mike Ford <fordmj@gmail.com>

## Mission
You are generating a turn-key, zero-dependency Real Estate Geospatial Intelligence Plugin.
It equips mortgage originators, real estate brokers, and home buyers with an interactive map, MLS property cards, DTI/down payment qualifiers, USDA rural boundaries, and LMI CRA grant layers.

## Core Capabilities
1. **Geospatial Property Visualization**: Interactive property pins with price tiers, status (Active, Pending, Contingent), and bed/bath filters.
2. **Mortgage & DTI Qualifier**: Instant P&I calculation with real-time interest rate slider, down payment estimator, and monthly obligation breakdown.
3. **Neighborhood Demographics & School Ratings**: Census tract median income ratios, school ratings, and walk scores.
4. **Boundary Overlays**: USDA rural eligibility zoning, CRA LMI subsidy census tracts, and municipal tax districts.

## Packaging Specification
- Component Name: \`${config.pluginName}\`
- API Base Path: \`${config.apiBasePath}\`
- Framework Target: \`${config.targetFramework}\`
`;
}

export function generateGeoMapPluginReactCode(config: PluginPackagingConfig): string {
  return `/**
 * ${config.pluginName}.tsx
 * Vantage AI Studio — Real Estate GeoMap & MLS Intelligence Standalone Plugin
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>
 */

import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Home, 
  DollarSign, 
  Sliders, 
  Layers, 
  Navigation, 
  Search, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  ShieldCheck,
  Building,
  TrendingUp,
  Percent
} from 'lucide-react';

export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: 'active' | 'pending' | 'sold';
  lat: number;
  lng: number;
  isUsdaEligible: boolean;
  isCraGrantEligible: boolean;
  imageUrl?: string;
}

export interface GeoMapPluginProps {
  apiKey?: string;
  apiBasePath?: string;
  initialCenter?: { lat: number; lng: number };
  onPropertySelect?: (property: PropertyListing) => void;
  className?: string;
}

const SAMPLE_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop-101',
    address: '4288 Evergreen Ridge Trail',
    city: 'Bend',
    state: 'OR',
    zip: '97703',
    price: 549000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    status: 'active',
    lat: 44.0582,
    lng: -121.3153,
    isUsdaEligible: true,
    isCraGrantEligible: false,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80'
  },
  {
    id: 'prop-102',
    address: '1124 Columbia River Way',
    city: 'Vancouver',
    state: 'WA',
    zip: '98661',
    price: 435000,
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    status: 'active',
    lat: 45.6387,
    lng: -122.6615,
    isUsdaEligible: false,
    isCraGrantEligible: true,
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80'
  },
  {
    id: 'prop-103',
    address: '890 Sunny Hills Parkway',
    city: 'Redmond',
    state: 'OR',
    zip: '97756',
    price: 389000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    status: 'pending',
    lat: 44.2726,
    lng: -121.1739,
    isUsdaEligible: true,
    isCraGrantEligible: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
  }
];

export const ${config.pluginName}: React.FC<GeoMapPluginProps> = ({
  apiBasePath = '${config.apiBasePath}',
  onPropertySelect,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing>(SAMPLE_PROPERTIES[0]);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(10);
  const [activeLayer, setActiveLayer] = useState<'all' | 'usda' | 'cra'>('all');

  const filteredProperties = useMemo(() => {
    return SAMPLE_PROPERTIES.filter(p => {
      const matchText = (p.address + ' ' + p.city + ' ' + p.zip).toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchText) return false;
      if (activeLayer === 'usda') return p.isUsdaEligible;
      if (activeLayer === 'cra') return p.isCraGrantEligible;
      return true;
    });
  }, [searchQuery, activeLayer]);

  const loanCalculation = useMemo(() => {
    if (!selectedProperty) return null;
    const price = selectedProperty.price;
    const downPayment = (price * downPaymentPct) / 100;
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = 360;
    const monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const estimatedTaxAndInsurance = (price * 0.012) / 12 + 110;
    const totalMonthly = monthlyPI + estimatedTaxAndInsurance;
    return {
      price,
      downPayment,
      loanAmount,
      monthlyPI: Math.round(monthlyPI),
      estimatedTaxAndInsurance: Math.round(estimatedTaxAndInsurance),
      totalMonthly: Math.round(totalMonthly)
    };
  }, [selectedProperty, interestRate, downPaymentPct]);

  return (
    <div className={\`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden \${className}\`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GeoMap & MLS Intelligence
            </span>
            <span className="text-[10px] text-slate-400 font-mono">By Mike Ford</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" /> Geospatial Property & Mortgage Explorer
          </h2>
        </div>

        {/* Filter Layers */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={\`px-3 py-1 rounded-lg font-semibold transition \${activeLayer === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}\`}
          >
            All Listings
          </button>
          <button
            onClick={() => setActiveLayer('usda')}
            className={\`px-3 py-1 rounded-lg font-semibold transition \${activeLayer === 'usda' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}\`}
          >
            USDA 100% Rural
          </button>
          <button
            onClick={() => setActiveLayer('cra')}
            className={\`px-3 py-1 rounded-lg font-semibold transition \${activeLayer === 'cra' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'}\`}
          >
            LMI / CRA Grants
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 min-h-[500px]">
        {/* Left Column: Property List & Search (5 cols) */}
        <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto max-h-[600px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city, zip or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-3">
            {filteredProperties.map(prop => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop);
                    onPropertySelect?.(prop);
                  }}
                  className={\`p-4 rounded-2xl border transition cursor-pointer relative \${
                    isSelected 
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }\`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">\${prop.price.toLocaleString()}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{prop.address}</div>
                      <div className="text-[11px] text-slate-400">{prop.city}, {prop.state} {prop.zip}</div>
                    </div>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase \${
                      prop.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-100 text-amber-800'
                    }\`}>
                      {prop.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500">
                    <span>{prop.beds} Beds</span>
                    <span>•</span>
                    <span>{prop.baths} Baths</span>
                    <span>•</span>
                    <span>{prop.sqft.toLocaleString()} SqFt</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {prop.isUsdaEligible && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold rounded-md border border-emerald-200 dark:border-emerald-800">
                        USDA 0% Down
                      </span>
                    )}
                    {prop.isCraGrantEligible && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-[10px] font-bold rounded-md border border-blue-200 dark:border-blue-800">
                        \$5K CRA Grant
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map Simulation & Mortgage Qualifier (7 cols) */}
        <div className="lg:col-span-7 p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Simulated Map Canvas */}
          <div className="bg-slate-900 rounded-2xl h-64 relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
            <div className="flex items-center justify-between z-10">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] text-white font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> GPS Lat: {selectedProperty?.lat.toFixed(4)}, Lng: {selectedProperty?.lng.toFixed(4)}
              </span>
              <span className="px-2.5 py-1 bg-emerald-600/80 backdrop-blur-md rounded-lg text-[11px] text-white font-semibold">
                Boundary: Active
              </span>
            </div>

            {/* Visual Pins */}
            <div className="relative flex items-center justify-center my-auto">
              <div className="p-3 bg-emerald-600 text-white rounded-full shadow-2xl animate-pulse ring-8 ring-emerald-500/20">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            <div className="z-10 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-white">
              <div className="font-semibold">{selectedProperty?.address}</div>
              <div className="font-bold text-emerald-400">\${selectedProperty?.price.toLocaleString()}</div>
            </div>
          </div>

          {/* Mortgage Calculator Card */}
          {loanCalculation && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Real-Time Mortgage & Payment Estimator
                </h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  \${loanCalculation.totalMonthly.toLocaleString()}/mo Total
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                    <span>Interest Rate:</span>
                    <span className="font-bold">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.125"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                    <span>Down Payment:</span>
                    <span className="font-bold">{downPaymentPct}% (\${Math.round(loanCalculation.downPayment).toLocaleString()})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Principal & Int.</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">\${loanCalculation.monthlyPI.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400">Taxes & Ins.</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">\${loanCalculation.estimatedTaxAndInsurance.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Total Estimated</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">\${loanCalculation.totalMonthly.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ${config.pluginName};
`;
}

export function generateGeoMapPluginHookCode(config: PluginPackagingConfig): string {
  return `/**
 * useVantageGeoMap.ts
 * Headless Hook for Real Estate GeoMap & MLS Intelligence
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>
 */

import { useState, useCallback } from 'react';

export function useVantageGeoMap(apiBasePath = '${config.apiBasePath}') {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  const searchProperties = useCallback(async (params: { query?: string; bounds?: any; maxPrice?: number }) => {
    setLoading(true);
    try {
      const res = await fetch(\`\${apiBasePath}/properties/search\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      setProperties(data.properties || []);
      return data;
    } finally {
      setLoading(false);
    }
  }, [apiBasePath]);

  return {
    loading,
    properties,
    searchProperties
  };
}
`;
}

export function generateGeoMapPluginBackendCode(config: PluginPackagingConfig): string {
  return `/**
 * vantage-geomap-router.ts
 * Express API Router for Vantage Real Estate GeoMap Plugin
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>
 */

import { Router } from 'express';

export function createGeoMapRouter(): Router {
  const router = Router();

  router.post('/properties/search', async (req, res) => {
    const { query, maxPrice, usdaOnly } = req.body;
    res.json({
      success: true,
      count: 3,
      properties: [
        { id: '1', address: '4288 Evergreen Ridge Trail', price: 549000, usdaEligible: true },
        { id: '2', address: '1124 Columbia River Way', price: 435000, craGrantEligible: true },
        { id: '3', address: '890 Sunny Hills Parkway', price: 389000, usdaEligible: true }
      ]
    });
  });

  return router;
}
`;
}

export function generateGeoMapPluginScriptEmbed(config: PluginPackagingConfig): string {
  return `<!-- Vantage Real Estate GeoMap Script Embed -->
<div id="vantage-geomap-container"></div>
<script src="https://cdn.vantage-ai.com/plugins/geomap/v1/bundle.js" 
  data-api-base="${config.apiBasePath}" 
  data-container="vantage-geomap-container"
  async>
</script>
`;
}
