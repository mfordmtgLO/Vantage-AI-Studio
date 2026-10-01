import React, { useState } from 'react';
import { FirstTimeHomebuyerGeoPlugin } from './FirstTimeHomebuyerGeoPlugin';
import { LeadDpaGrantStackerStudio } from './LeadDpaGrantStackerStudio';
import { RealEstateLeadCaptureStudio } from './RealEstateLeadCaptureStudio';
import { RealEstateLeadCaptureForm } from './RealEstateLeadCaptureForm';
import { MortgageLoanProductManager } from './MortgageLoanProductManager';
import { 
  Home, 
  MapPin, 
  Sliders, 
  Shield, 
  TrendingUp, 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign,
  Layers,
  Database,
  Building2,
  Users,
  Award,
  ShieldCheck
} from 'lucide-react';
import { SAMPLE_RENTCAST_LISTINGS } from '../services/geomapMortgageEngine';
import { isMikeFordAdmin } from '../utils/adminAuth';
import { auth } from '../services/firebase';

interface RealEstateMortgageViewProps {
  onOpenPluginVault?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenShareLinksModal?: (propertyId?: string) => void;
}

export const RealEstateMortgageView: React.FC<RealEstateMortgageViewProps> = ({
  onOpenPluginVault,
  onOpenByokDrawer,
  onOpenShareLinksModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'geomap' | 'loan_products' | 'dpa_stacker' | 'lead_capture'>('geomap');
  const [leadCaptureMode, setLeadCaptureMode] = useState<'form' | 'crm'>('form');
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const isAdmin = isMikeFordAdmin(auth.currentUser);

  const embedSnippet = `<script src="https://vantage-ai.workspace/plugins/vantage-homebuyer-geomap.js" data-license="VAN-RE-8F2A1C04-9E3B" async></script>
<div id="vantage-homebuyer-container" data-theme="adaptive" data-fips-enabled="true"></div>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-blue-600" /> First-Time Homebuyer Sync
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
            {SAMPLE_RENTCAST_LISTINGS.length} Properties
          </div>
          <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Synced by Admin Mike Ford
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Lakeview 100% DPA
          </div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
            100% 0-Down
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            CLT & Soft Second Grants
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" /> OHCS Flex FirstHome
          </div>
          <div className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono">
            3.5%–5% Cash
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Oregon Housing DPA
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> USDA RD 100%
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {SAMPLE_RENTCAST_LISTINGS.filter(l => l.specialPrograms.usdaRuralEligible).length} Homes
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Zero Down Payment
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-600" /> CRA LMI Grants
          </div>
          <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
            $10,000 / tract
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            Non-Repayable Grant
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('geomap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'geomap'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 text-blue-300" />
          <span>GeoMap & USDA Spatial Explorer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('loan_products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'loan_products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Mortgage Loan Products (Lakeview & OHCS)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/30 text-amber-200 rounded-full font-bold">Config Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dpa_stacker')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'dpa_stacker'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>Lead DPA Grant & Loan Stacker</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/30 text-purple-200 rounded-full font-bold">5 Grants</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lead_capture')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'lead_capture'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Lead Intake & Prequal CRM Pipeline</span>
        </button>
      </div>

      {/* Sub-Tab Rendering */}
      {activeSubTab === 'geomap' && (
        <FirstTimeHomebuyerGeoPlugin 
          onOpenByokDrawer={onOpenByokDrawer} 
          onOpenShareLinksModal={onOpenShareLinksModal}
        />
      )}

      {activeSubTab === 'loan_products' && (
        <MortgageLoanProductManager
          onFilterPropertiesByProduct={() => setActiveSubTab('geomap')}
        />
      )}

      {activeSubTab === 'dpa_stacker' && (
        <LeadDpaGrantStackerStudio />
      )}

      {activeSubTab === 'lead_capture' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeadCaptureMode('form')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  leadCaptureMode === 'form'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Visitor Lead Capture Form & AI Email Triage</span>
              </button>

              <button
                type="button"
                onClick={() => setLeadCaptureMode('crm')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  leadCaptureMode === 'crm'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pre-Approval Intake & Pipeline CRM</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1 font-medium">
              <span>Simultaneous LO+Agent Email Dispatch with 2nd Brain Cognitive Parsing</span>
            </div>
          </div>

          {leadCaptureMode === 'form' ? (
            <RealEstateLeadCaptureForm embedded={true} />
          ) : (
            <RealEstateLeadCaptureStudio />
          )}
        </div>
      )}

      {/* Turnkey Commercial Distribution Bar */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Commercial License Ready
            </span>
            <span className="text-xs font-bold text-slate-300">
              By Mike Ford (fordmj@gmail.com)
            </span>
          </div>
          <h4 className="text-sm font-black tracking-tight text-white">
            Embed the Real Estate & Mortgage GeoMap Engine in Any External Site
          </h4>
          <p className="text-xs text-slate-400">
            Export standalone React component, REST OpenAPI endpoints, or 1-line universal HTML script embed with domain-locking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyEmbed}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmbed ? 'Embed Copied!' : 'Copy Script Tag'}</span>
          </button>

          {onOpenPluginVault && (
            <button
              onClick={onOpenPluginVault}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Open Plugin Vault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
