/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • MORTGAGE LOAN PRODUCT MANAGEMENT MODULE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Track, Filter & Configure Mortgage Products (Lakeview National, OHCS Flex Lending, etc.)
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit3,
  RotateCcw,
  DollarSign,
  Award,
  Building2,
  Sparkles,
  Layers,
  Filter,
  Check,
  Lock,
  Unlock,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  UserCheck,
  MapPin,
  Save,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  MortgageLoanProduct,
  MortgageProductCategory,
  DpaAssistanceType,
  BuyerEligibilityCheckInput
} from '../types/mortgageLoanProducts';
import {
  DEFAULT_MORTGAGE_LOAN_PRODUCTS,
  checkBuyerProductEligibility
} from '../data/defaultMortgageLoanProducts';

interface MortgageLoanProductManagerProps {
  onProductsUpdated?: (products: MortgageLoanProduct[]) => void;
  onFilterPropertiesByProduct?: (productId: string | 'all') => void;
  className?: string;
}

export const MortgageLoanProductManager: React.FC<MortgageLoanProductManagerProps> = ({
  onProductsUpdated,
  onFilterPropertiesByProduct,
  className = ''
}) => {
  const [products, setProducts] = useState<MortgageLoanProduct[]>(DEFAULT_MORTGAGE_LOAN_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'lakeview_ohcs_spotlight' | 'buyer_tester' | 'custom_editor'>('lakeview_ohcs_spotlight');

  // Modal / Drawer state for Editing / Creating Product
  const [editingProduct, setEditingProduct] = useState<MortgageLoanProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Interactive Buyer Eligibility Tester state
  const [testBuyer, setTestBuyer] = useState<BuyerEligibilityCheckInput>({
    grossAnnualIncome: 78000,
    creditScore: 650,
    areaMedianIncomeUsd: 92000,
    propertyState: 'OR',
    propertyPrice: 425000,
    liquidDownPayment: 15000,
    isTargetedCensusTract: false
  });

  // Notify parent whenever products change
  const handleUpdateProductsState = (newProducts: MortgageLoanProduct[], message?: string) => {
    setProducts(newProducts);
    if (onProductsUpdated) onProductsUpdated(newProducts);
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Toggle single product active eligibility
  const toggleProductEligibility = (productId: string) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        return { ...p, isEligibleActive: !p.isEligibleActive };
      }
      return p;
    });
    const target = updated.find((p) => p.id === productId);
    handleUpdateProductsState(
      updated,
      `Toggled "${target?.name}": ${target?.isEligibleActive ? 'ENABLED' : 'DISABLED'}`
    );
  };

  // Toggle Lakeview National & OHCS Flex specifically
  const setLakeviewState = (active: boolean) => {
    const updated = products.map((p) => {
      if (p.id.includes('lakeview')) {
        return { ...p, isEligibleActive: active };
      }
      return p;
    });
    handleUpdateProductsState(
      updated,
      `Lakeview National programs ${active ? 'ENABLED' : 'DISABLED'}`
    );
  };

  const setOhcsState = (active: boolean) => {
    const updated = products.map((p) => {
      if (p.id.includes('ohcs')) {
        return { ...p, isEligibleActive: active };
      }
      return p;
    });
    handleUpdateProductsState(
      updated,
      `OHCS Flex Lending programs ${active ? 'ENABLED' : 'DISABLED'}`
    );
  };

  // Enable / Disable All
  const setAllState = (active: boolean) => {
    const updated = products.map((p) => ({ ...p, isEligibleActive: active }));
    handleUpdateProductsState(
      updated,
      `All mortgage loan products ${active ? 'ENABLED' : 'DISABLED'}`
    );
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    handleUpdateProductsState(DEFAULT_MORTGAGE_LOAN_PRODUCTS, 'Reset mortgage loan products to factory defaults!');
  };

  // Filter products by category & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'featured' && p.isFeaturedSpecialtyProduct) ||
        (selectedCategory === 'lakeview_ohcs' && (p.id.includes('lakeview') || p.id.includes('ohcs'))) ||
        p.category === selectedCategory;

      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.agencyOrSponsor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Featured Lakeview and OHCS Products
  const lakeviewProducts = useMemo(() => products.filter((p) => p.id.includes('lakeview')), [products]);
  const ohcsProducts = useMemo(() => products.filter((p) => p.id.includes('ohcs')), [products]);

  // Save edited product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const exists = products.some((p) => p.id === editingProduct.id);
    let updated: MortgageLoanProduct[];
    if (exists) {
      updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    } else {
      updated = [...products, editingProduct];
    }

    handleUpdateProductsState(updated, `Saved product "${editingProduct.name}" configuration!`);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    handleUpdateProductsState(updated, 'Removed mortgage product program.');
  };

  // Evaluate Buyer Eligibility
  const buyerEvaluationResults = useMemo(() => {
    return products.map((product) =>
      checkBuyerProductEligibility(
        product,
        testBuyer.grossAnnualIncome,
        testBuyer.creditScore,
        testBuyer.areaMedianIncomeUsd,
        testBuyer.propertyState,
        testBuyer.propertyPrice,
        testBuyer.liquidDownPayment,
        testBuyer.isTargetedCensusTract
      )
    );
  }, [products, testBuyer]);

  const activeCount = products.filter((p) => p.isEligibleActive).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SUCCESS NOTIFICATION TOAST */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-200 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER & MODULE STATS BAR */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Mortgage Product & DPA Matrix Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">v3.8 • Live Compliance Tracking</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Mortgage Loan Product Management
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              Track, configure, and toggle eligibility for specialized national and state homebuyer programs including{' '}
              <strong className="text-amber-300">Lakeview National Bayview 100% DPA</strong> and{' '}
              <strong className="text-teal-300">OHCS Flex Lending FirstHome</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setAllState(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Enable All ({products.length})
            </button>
            <button
              onClick={() => setAllState(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              Disable All
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Reset products to default state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Reset Defaults
            </button>
            <button
              onClick={() => {
                setEditingProduct({
                  id: `custom_prod_${Date.now()}`,
                  name: 'New Custom Mortgage Loan Product',
                  agencyOrSponsor: 'Custom Lender / Portfolio',
                  category: 'State HFA',
                  maxLtvPercent: 97,
                  maxDpaAssistancePercent: 3.5,
                  dpaType: 'Forgivable Grant',
                  minCreditScore: 620,
                  maxAmiPercentage: 80,
                  eligibleStates: ['ALL'],
                  isTargetedAreaBonusEligible: false,
                  isEligibleActive: true,
                  description: 'Custom mortgage loan product program configured for specific lending criteria.',
                  underwritingGuidelines: ['Standard Lender Guidelines Apply'],
                  requiredDocumentation: ['W2s & Tax Returns']
                });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Loan Product
            </button>
          </div>
        </div>

        {/* QUICK TOGGLE HIGHLIGHT BAR FOR LAKEVIEW AND OHCS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                  Lakeview National Programs
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded font-mono">
                    100% LTV DPA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Bayview Soft 2nd (3.5%–5.0%) & Community Smart Conventional
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLakeviewState(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  lakeviewProducts.every((p) => p.isEligibleActive)
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ENABLE
              </button>
              <button
                onClick={() => setLakeviewState(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  lakeviewProducts.every((p) => !p.isEligibleActive)
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                DISABLE
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-teal-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
                  OHCS Flex Lending Programs
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/30 text-teal-300 rounded font-mono">
                    Oregon HFA
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  FirstHome 3.5%–5.0% Cash Grant & RateAdvantage Discount
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOhcsState(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  ohcsProducts.every((p) => p.isEligibleActive)
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ENABLE
              </button>
              <button
                onClick={() => setOhcsState(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  ohcsProducts.every((p) => !p.isEligibleActive)
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                DISABLE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('lakeview_ohcs_spotlight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'lakeview_ohcs_spotlight'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Lakeview & OHCS Spotlight</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>Product Catalog & Eligibility Matrix ({products.length})</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">
              {activeCount} Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('buyer_tester')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'buyer_tester'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>Buyer Eligibility Simulator</span>
          </button>
        </div>

        {onFilterPropertiesByProduct && (
          <button
            onClick={() => onFilterPropertiesByProduct('all')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Sync GeoMap Filter</span>
          </button>
        )}
      </div>

      {/* TAB 1: LAKEVIEW & OHCS SPOTLIGHT COMPARISON */}
      {activeTab === 'lakeview_ohcs_spotlight' && (
        <div className="space-y-6 animate-fade-in">
          {/* LAKEVIEW SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-amber-900/30 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase">
                    National DPA Leader
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Sponsor: Lakeview Loan Servicing / Bayview
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Lakeview National 100% LTV DPA Suite
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Status:
                </span>
                {lakeviewProducts.every((p) => p.isEligibleActive) ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Lakeview Programs Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Partial / Configured
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lakeviewProducts.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    p.isEligibleActive
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProductEligibility(p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition shrink-0 ${
                        p.isEligibleActive
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {p.isEligibleActive ? 'ELIGIBLE' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Max LTV</div>
                      <div className="font-black text-amber-700 dark:text-amber-400 text-sm">{p.maxLtvPercent}%</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">DPA Grant/2nd</div>
                      <div className="font-black text-amber-700 dark:text-amber-400 text-sm">{p.maxDpaAssistancePercent}%</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Min FICO</div>
                      <div className="font-black text-amber-700 dark:text-amber-400 text-sm">{p.minCreditScore}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Underwriting Highlights:
                    </div>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-1 text-[11px]">
                      {p.underwritingGuidelines.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-900/40 text-[11px]">
                    <span className="text-slate-500 font-mono">AMI Limit: {p.maxAmiPercentage}%</span>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditModalOpen(true);
                      }}
                      className="text-amber-700 dark:text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Parameters
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OHCS FLEX LENDING SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-teal-200 dark:border-teal-900/50 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 dark:border-teal-900/30 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-[10px] font-black uppercase">
                    State Housing Finance Agency (Oregon)
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Sponsor: Oregon Housing and Community Services (OHCS)
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  OHCS Flex Lending Program Matrix
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Status:
                </span>
                {ohcsProducts.every((p) => p.isEligibleActive) ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All OHCS Programs Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Partial / Configured
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ohcsProducts.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    p.isEligibleActive
                      ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProductEligibility(p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition shrink-0 ${
                        p.isEligibleActive
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {p.isEligibleActive ? 'ELIGIBLE' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-teal-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Max LTV</div>
                      <div className="font-black text-teal-700 dark:text-teal-400 text-sm">{p.maxLtvPercent}%</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-teal-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Grant Cash</div>
                      <div className="font-black text-teal-700 dark:text-teal-400 text-sm">{p.maxDpaAssistancePercent}%</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-teal-200 dark:border-teal-900">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Min FICO</div>
                      <div className="font-black text-teal-700 dark:text-teal-400 text-sm">{p.minCreditScore}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      Underwriting Guidelines:
                    </div>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-1 text-[11px]">
                      {p.underwritingGuidelines.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-teal-200 dark:border-teal-900/40 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      State: {p.eligibleStates.join(', ')} • AMI: {p.maxAmiPercentage}%
                    </span>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditModalOpen(true);
                      }}
                      className="text-teal-700 dark:text-teal-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Parameters
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG & MATRIX */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 animate-fade-in">
          {/* SEARCH & CATEGORY FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search programs, sponsors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'lakeview_ohcs', label: 'Lakeview & OHCS' },
                { id: 'National DPA', label: 'National DPA' },
                { id: 'State HFA', label: 'State HFA' },
                { id: 'Government 0-Down', label: 'Gov 0-Down' },
                { id: 'Conventional Specialty', label: 'Conv 97%' },
                { id: 'Portfolio CRA Grant', label: 'CRA Grants' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border shadow-xs space-y-3 transition flex flex-col justify-between ${
                  p.isEligibleActive
                    ? 'border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase">
                        {p.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{p.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{p.agencyOrSponsor}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProductEligibility(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        p.isEligibleActive
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {p.isEligibleActive ? 'ELIGIBLE' : 'DISABLED'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Max LTV</div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.maxLtvPercent}%</div>
                    </div>
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">DPA Grant</div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.maxDpaAssistancePercent}%</div>
                    </div>
                    <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Min Credit</div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.minCreditScore}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    State: {p.eligibleStates.join(', ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditModalOpen(true);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BUYER ELIGIBILITY SIMULATOR */}
      {activeTab === 'buyer_tester' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-500" />
              Interactive Buyer Product Match & Eligibility Tester
            </h3>
            <p className="text-xs text-slate-500">
              Input borrower credentials to test eligibility against active mortgage products (including Lakeview National and OHCS Flex Lending).
            </p>
          </div>

          {/* INPUT FORM */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Annual Income</label>
              <input
                type="number"
                value={testBuyer.grossAnnualIncome}
                onChange={(e) => setTestBuyer({ ...testBuyer, grossAnnualIncome: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Credit Score</label>
              <input
                type="number"
                value={testBuyer.creditScore}
                onChange={(e) => setTestBuyer({ ...testBuyer, creditScore: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">AMI Standard</label>
              <input
                type="number"
                value={testBuyer.areaMedianIncomeUsd}
                onChange={(e) => setTestBuyer({ ...testBuyer, areaMedianIncomeUsd: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">State</label>
              <select
                value={testBuyer.propertyState}
                onChange={(e) => setTestBuyer({ ...testBuyer, propertyState: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              >
                <option value="OR">Oregon (OR)</option>
                <option value="WA">Washington (WA)</option>
                <option value="CA">California (CA)</option>
                <option value="AZ">Arizona (AZ)</option>
                <option value="TX">Texas (TX)</option>
                <option value="FL">Florida (FL)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Home Price</label>
              <input
                type="number"
                value={testBuyer.propertyPrice}
                onChange={(e) => setTestBuyer({ ...testBuyer, propertyPrice: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Down Payment</label>
              <input
                type="number"
                value={testBuyer.liquidDownPayment}
                onChange={(e) => setTestBuyer({ ...testBuyer, liquidDownPayment: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={testBuyer.isTargetedCensusTract}
                  onChange={(e) => setTestBuyer({ ...testBuyer, isTargetedCensusTract: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Targeted Tract
              </label>
            </div>
          </div>

          {/* EVALUATION RESULTS GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Matched Mortgage Products ({buyerEvaluationResults.filter((r) => r.isEligible).length} Qualified)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {buyerEvaluationResults.map((res) => (
                <div
                  key={res.product.id}
                  className={`p-4 rounded-xl border transition space-y-2 ${
                    res.isEligible
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {res.product.name}
                        </span>
                        {(res.product.id.includes('lakeview') || res.product.id.includes('ohcs')) && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-bold">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{res.product.agencyOrSponsor}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                        res.isEligible
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {res.isEligible ? 'QUALIFIED' : 'DISQUALIFIED'}
                    </span>
                  </div>

                  {res.isEligible ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/40 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Est. DPA Grant Cash</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          ${res.maxEstimatedGrantUsd.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Net Out-Of-Pocket Down</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          ${res.effectiveRequiredDownPaymentUsd.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-900/30 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                      <span className="font-bold text-[10px] uppercase block">Disqualification Reason(s):</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {res.disqualificationReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE PRODUCT MODAL */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                Configure Mortgage Loan Product Parameters
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Program Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Agency or Sponsor</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.agencyOrSponsor}
                    onChange={(e) => setEditingProduct({ ...editingProduct, agencyOrSponsor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as MortgageProductCategory })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="National DPA">National DPA</option>
                    <option value="State HFA">State HFA</option>
                    <option value="Government 0-Down">Government 0-Down</option>
                    <option value="Conventional Specialty">Conventional Specialty</option>
                    <option value="Portfolio CRA Grant">Portfolio CRA Grant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assistance Type</label>
                  <select
                    value={editingProduct.dpaType}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dpaType: e.target.value as DpaAssistanceType })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Forgivable Grant">Forgivable Grant</option>
                    <option value="0% Interest Silent 2nd">0% Interest Silent 2nd</option>
                    <option value="Deferred Repayable 2nd">Deferred Repayable 2nd</option>
                    <option value="Closing Cost Subsidy">Closing Cost Subsidy</option>
                    <option value="Matched Savings Grant">Matched Savings Grant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max LTV (%)</label>
                  <input
                    type="number"
                    value={editingProduct.maxLtvPercent}
                    onChange={(e) => setEditingProduct({ ...editingProduct, maxLtvPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max DPA Assistance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingProduct.maxDpaAssistancePercent}
                    onChange={(e) => setEditingProduct({ ...editingProduct, maxDpaAssistancePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Min Credit Score (FICO)</label>
                  <input
                    type="number"
                    value={editingProduct.minCreditScore}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minCreditScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Max AMI Limit (%) (0 = None)</label>
                  <input
                    type="number"
                    value={editingProduct.maxAmiPercentage}
                    onChange={(e) => setEditingProduct({ ...editingProduct, maxAmiPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Program Overview & Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isEligibleActive}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isEligibleActive: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Program Active & Eligible</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeaturedSpecialtyProduct || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeaturedSpecialtyProduct: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Spotlight Featured Program</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Loan Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
