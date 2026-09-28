import React, { useState, useMemo } from 'react';
import { 
  X, Copy, Check, ExternalLink, Smartphone, Share2, QrCode, 
  MessageSquare, Mail, Home, Building2, Brain, Mic, Sparkles, 
  ShieldCheck, Globe, CheckCircle2, ChevronDown, ChevronUp, Link as LinkIcon,
  Users, UserCheck, Award, Download, Maximize2, Tablet, Contact, User, Star,
  Lock, ShieldAlert
} from 'lucide-react';
import { 
  LEAD_MOBILE_PLUGIN_MODULES, 
  SHARED_BASE_URL, 
  DEV_BASE_URL, 
  buildLeadPluginUrl, 
  LeadPluginModuleUrlInfo 
} from '../data/leadMobilePluginUrls';
import { 
  ProfileCardSyncService, 
  LoanOfficerProfileCard, 
  AgentProfileCard 
} from '../services/profileCardSyncService';

interface LeadMobileShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPluginId?: string;
  initialLoId?: string;
  initialAgentId?: string;
  initialPropertyId?: string;
}

const PROMOTABLE_PROPERTIES = [
  { id: 'geo-101', address: '742 SE Hawthorne Blvd, Portland, OR 97214', price: 435000, desc: '$5k CRA Grant & $15k Price Drop' },
  { id: 'geo-102', address: '14800 NW St Helens Rd, Scappoose, OR 97056', price: 389000, desc: 'USDA 100% Zero-Down Eligible' },
  { id: 'geo-103', address: '2105 NE Alberta St, Portland, OR 97211', price: 485000, desc: 'Alberta Arts District • 20% DPA Bonus' }
];

export const LeadMobileShareLinksModal: React.FC<LeadMobileShareLinksModalProps> = ({
  isOpen,
  onClose,
  initialPluginId,
  initialLoId = 'lo-mike-ford',
  initialAgentId = 'agent-kanndice-mclean',
  initialPropertyId
}) => {
  const [selectedBaseUrlType, setSelectedBaseUrlType] = useState<'current' | 'dev' | 'custom'>('current');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('vantage_custom_cloudrun_url') || '';
    } catch {
      return '';
    }
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<string>(initialPluginId || 'all');
  const [isCobrandedQrExpanded, setIsCobrandedQrExpanded] = useState<boolean>(false);
  const [isShowingKioskOpen, setIsShowingKioskOpen] = useState<boolean>(false);
  const [isContactCardModalOpen, setIsContactCardModalOpen] = useState<boolean>(false);

  // Default property promotion state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    if (initialPropertyId) return initialPropertyId;
    try {
      return localStorage.getItem('vantage_geomap_default_property_id') || 'geo-101';
    } catch {
      return 'geo-101';
    }
  });
  const [includeDefaultProperty, setIncludeDefaultProperty] = useState<boolean>(true);

  // Curated property IDs state for multi-property lead export build
  const [curatedPropertyIds, setCuratedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_geomap_curated_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['geo-101', 'geo-102'];
  });
  const [includeCuratedShortlist, setIncludeCuratedShortlist] = useState<boolean>(true);

  // Dynamic promotable properties merged with any locally pushed LO listings
  const promotablePropertiesList = useMemo(() => {
    let list = [...PROMOTABLE_PROPERTIES];
    try {
      if (typeof window !== 'undefined') {
        const pushedJson = localStorage.getItem('vantage_geomap_pushed_properties');
        if (pushedJson) {
          const pushed = JSON.parse(pushedJson);
          if (Array.isArray(pushed) && pushed.length > 0) {
            const pushedItems = pushed.map((p: any) => ({
              id: p.id,
              address: p.formattedAddress || p.addressLine1 || 'Pushed Listing',
              price: p.price || 400000,
              desc: p.proactiveLoNote ? `LO Note: "${p.proactiveLoNote.slice(0, 35)}..."` : 'Curated Low/No-Down Home'
            }));
            const existingIds = new Set(list.map(item => item.id));
            const newOnes = pushedItems.filter((item: any) => !existingIds.has(item.id));
            list = [...newOnes, ...list];
          }
        }
      }
    } catch {}
    return list;
  }, []);

  const handleToggleCuratedId = (id: string) => {
    setCuratedPropertyIds((prev) => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('vantage_geomap_curated_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Synced LO and Agent Profiles for dynamic co-branding
  const loanOfficers = useMemo(() => ProfileCardSyncService.getLoanOfficers(), []);
  const agents = useMemo(() => ProfileCardSyncService.getAgents(), []);

  const [selectedLoId, setSelectedLoId] = useState<string>(initialLoId);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(initialAgentId);

  if (!isOpen) return null;

  const liveOrigin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : DEV_BASE_URL;

  const currentBaseUrl = selectedBaseUrlType === 'current' 
    ? liveOrigin 
    : selectedBaseUrlType === 'dev' 
    ? DEV_BASE_URL 
    : (customBaseUrl.trim() || liveOrigin);

  const currentLo = loanOfficers.find(l => l.id === selectedLoId) || loanOfficers[0] || {
    id: 'lo-mike-ford',
    name: 'Mike Ford',
    nmlsNumber: '288455',
    company: 'Vantage AI Mortgage & Loan Services',
    title: 'Managing Loan Officer & Principal Architect',
    email: 'fordmj@gmail.com',
    phone: '+1 (503) 555-0192',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  };

  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0] || {
    id: 'agent-kanndice-mclean',
    name: 'Kanndice McLean',
    licenseNumber: 'OR-201889423',
    brokerage: 'Cascade Premier Realty & Associates',
    title: 'Principal Broker & Lead Buyer Strategist',
    email: 'kanndice@cascadepremier.com',
    phone: '+1 (503) 555-0188',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  };

  const isSoloMode = selectedAgentId === 'solo' || selectedAgentId === 'none';

  // Primary Co-Branded Link for the selected LO+Agent pair (with default property front & center and checkboxed curated properties)
  const selectedCobrandedUrl = buildLeadPluginUrl(
    'geomap',
    currentBaseUrl,
    {
      leadMode: true,
      lo: currentLo.id,
      agent: isSoloMode ? 'none' : currentAgent.id,
      pack: 'geomap_brain_combo',
      prop: includeDefaultProperty ? selectedPropertyId : undefined,
      props: includeCuratedShortlist && curatedPropertyIds.length > 0 ? curatedPropertyIds : undefined
    }
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const handleCopyCobrandedLink = () => {
    handleCopy(selectedCobrandedUrl, 'cobranded_link_hero');
  };

  const handleShareViaSms = async () => {
    const partnerName = isSoloMode ? 'Direct Originator' : currentAgent.name;
    const shareTitle = `Homebuyer AI GeoMap & $0-Down Grant Portal`;
    const chosenProp = promotablePropertiesList.find(p => p.id === selectedPropertyId);
    const propSnippet = includeDefaultProperty && chosenProp
      ? `\n🏡 Featured Property Listing: ${chosenProp.address} ($${chosenProp.price.toLocaleString()}) - ${chosenProp.desc}`
      : '';
    const curatedSnippet = includeCuratedShortlist && curatedPropertyIds.length > 0
      ? `\n🎯 Curated Shortlist: ${curatedPropertyIds.length} homes pre-screened for low or zero down payment mortgage financing (USDA, OHCS Flex FirstHome, Lakeview 100%, HomeReady).`
      : '';
    const favoritesTip = `\n💡 Front & Center Tip: Click the ❤️ heart icon on ANY 3 property listing cards to customize your top 3 front & center carousel rotation view on desktop or mobile app!`;
    const shareText = `Hi! Here is our First-Time Homebuyer AI GeoMap & $0-Down Grant Portal from ${currentLo.name} (NMLS #${currentLo.nmlsNumber}) & ${partnerName}:${propSnippet}${curatedSnippet}${favoritesTip}\n\n${selectedCobrandedUrl}\n\nOpen on mobile or desktop to review the curated property list, test payment scenarios, and chat directly with our AI 2nd Brain!`;

    // Native mobile share intent (iOS/Android/iPad)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: selectedCobrandedUrl
        });
        setCopiedKey('sms_shared_hero');
        setTimeout(() => setCopiedKey(null), 2500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.log('Native share cancelled or unavailable, trying direct sms URI:', err);
      }
    }

    // Direct mobile SMS intent URI fallback for iOS / Android
    const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const separator = isIos ? '&' : '?';
    const smsUrl = `sms:${separator}body=${encodeURIComponent(shareText)}`;

    // Copy to clipboard as backup
    navigator.clipboard.writeText(shareText);
    setCopiedKey('sms_shared_hero');
    setTimeout(() => setCopiedKey(null), 2500);

    window.location.href = smsUrl;
  };

  const getFormattedAgentContactCard = (): string => {
    if (isSoloMode) {
      const photo = currentLo.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';
      return [
        `🏦 ${currentLo.name} | ${currentLo.title || 'Managing Loan Officer & Principal Architect'}`,
        `🏢 ${currentLo.company} • NMLS #${currentLo.nmlsNumber}`,
        `📞 Call/Text: ${currentLo.phone || '+1 (503) 555-0192'}`,
        `✉️ Email: ${currentLo.email || 'fordmj@gmail.com'}`,
        `📸 Profile Photo: ${photo}`,
        `🚀 $0-Down First-Time Homebuyer & DPA Grant Portal:`,
        `${selectedCobrandedUrl}`
      ].join('\n');
    }

    const agentPhoto = currentAgent.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
    return [
      `🏡 ${currentAgent.name} | ${currentAgent.title || 'Realtor® & Principal Broker'}`,
      `📍 ${currentAgent.brokerage} • Lic #${currentAgent.licenseNumber || 'OR-Active'}`,
      `🤝 Preferred Lending Partner: ${currentLo.name} | ${currentLo.company} (NMLS #${currentLo.nmlsNumber})`,
      `📞 Call/Text: ${currentAgent.phone || '+1 (503) 555-0188'}`,
      `✉️ Email: ${currentAgent.email || 'kanndice@cascadepremier.com'}`,
      `📸 Agent Photo: ${agentPhoto}`,
      `🚀 Search Homes & Check $0-Down Down Payment Grants (Live App):`,
      `${selectedCobrandedUrl}`
    ].join('\n');
  };

  const handleCopyAgentContactCard = () => {
    const cardText = getFormattedAgentContactCard();
    handleCopy(cardText, 'agent_contact_card');
  };


  const getIcon = (iconName: LeadPluginModuleUrlInfo['iconName']) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Building2': return Building2;
      case 'Brain': return Brain;
      case 'Mic': return Mic;
      case 'Sparkles': return Sparkles;
      default: return Sparkles;
    }
  };

  const filteredModules = activeTabFilter === 'all'
    ? LEAD_MOBILE_PLUGIN_MODULES
    : LEAD_MOBILE_PLUGIN_MODULES.filter(m => m.id === activeTabFilter);

  // Simple clean SVG QR Code generator component
  const SimpleQrCodeSvg: React.FC<{ value: string }> = ({ value }) => {
    // Generate an encoded Google Chart API / QR Server compatible SVG or image fallback
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&margin=6`;
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
        <img 
          src={qrUrl} 
          alt="QR Code for Mobile Add to Home Screen" 
          className="w-36 h-36 rounded-lg object-contain bg-white p-1"
          loading="lazy"
        />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium text-center">
          Scan with phone camera to open & install PWA
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Smartphone className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Mobile "Add to Home Screen" Live URLs
                </h2>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Lead Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Share direct live links with lead contacts. Automatically opens in desktop view or prompts 1-click mobile app install on phones.
              </p>
            </div>
          </div>

          {/* Environment Domain Selector */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-100">
              <Globe className="w-4 h-4 text-blue-300" />
              <span>Target Base URL:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                onClick={() => setSelectedBaseUrlType('current')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedBaseUrlType === 'current' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Current Live URL (Active)
              </button>
              <button
                onClick={() => setSelectedBaseUrlType('dev')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedBaseUrlType === 'dev' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Dev App
              </button>
              <button
                onClick={() => setSelectedBaseUrlType('custom')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedBaseUrlType === 'custom' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Cloud Run / Custom Domain
              </button>
            </div>
          </div>

          {selectedBaseUrlType === 'custom' && (
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => {
                  setCustomBaseUrl(e.target.value);
                  try { localStorage.setItem('vantage_custom_cloudrun_url', e.target.value); } catch {}
                }}
                placeholder="https://vantage-ai-workspace-xxxx-uw.a.run.app or https://yourdomain.com"
                className="w-full px-3 py-1.5 bg-white/10 border border-white/30 rounded-xl text-xs text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          )}

        </div>

        {/* Dedicated Co-Branded LO+Agent Fast Share Cockpit & Live Showing QR Code */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border-b border-emerald-500/30 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    Co-Branded LO + Agent Pair
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    1-Tap PWA Co-Branded Sync
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Tablet className="w-3 h-3" />
                    Property Showing Scan Ready
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Select your LO and Realtor partner to instantly generate an authenticated co-branded link with a live on-site showing QR code.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={handleCopyCobrandedLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-950/50 cursor-pointer border border-emerald-400/40 active:scale-95"
                title={`One-tap copy co-branded URL for ${currentLo.name} + ${isSoloMode ? 'Solo LO' : currentAgent.name} to clipboard`}
              >
                {copiedKey === 'cobranded_link_hero' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200 animate-bounce" />
                    <span className="text-white font-extrabold tracking-wide">✓ Copied Co-branded Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-200" />
                    <span className="tracking-wide">Copy Co-branded Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyAgentContactCard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-purple-950/40 cursor-pointer border border-purple-400/40 active:scale-95"
                title="Copy pre-formatted Agent Contact Card (including name, photo & co-branded link) for professional social media bios"
              >
                <Contact className="w-4 h-4 text-pink-200" />
                <span>{copiedKey === 'agent_contact_card' ? '✓ Copied Contact Card!' : 'Copy Agent Contact Card'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareViaSms}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-950/40 cursor-pointer border border-blue-400/40 active:scale-95"
                title="Trigger native mobile SMS share intent pre-populated with co-branded link"
              >
                <MessageSquare className="w-4 h-4 text-blue-200" />
                <span>{copiedKey === 'sms_shared_hero' ? '✓ SMS Sent / Shared!' : 'Share via SMS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShowingKioskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold border border-indigo-400/40 transition cursor-pointer shadow-xs"
                title="Open fullscreen presentation kiosk mode for tablet property showings"
              >
                <Tablet className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Tablet Kiosk</span>
              </button>

              <a
                href={selectedCobrandedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                title="Test Co-branded Link in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Grid Layout: Left Controls + Right Live Showing QR Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
            {/* Left Controls (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-3">
              {/* LO & Agent Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Loan Officer Card */}
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0 text-xs font-bold">
                      LO
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Loan Officer</div>
                      <div className="text-xs font-bold text-white truncate">{currentLo.name} (NMLS #{currentLo.nmlsNumber})</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700 font-semibold shrink-0">
                    Managing LO
                  </span>
                </div>

                {/* Real Estate Agent Selector */}
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 text-xs font-bold">
                      AG
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Partner Real Estate Agent</div>
                      <select
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="bg-transparent text-xs font-bold text-emerald-300 hover:text-emerald-200 border-none outline-none cursor-pointer w-full truncate"
                      >
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id} className="bg-slate-900 text-white">
                            {agent.name} — {agent.brokerage}
                          </option>
                        ))}
                        <option value="solo" className="bg-slate-900 text-amber-300">
                          Direct Solo LO (No Agent / 0 Relay)
                        </option>
                      </select>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Quick Partner Pairing Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Quick Pairs:</span>
                {agents.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => setSelectedAgentId(ag.id)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      selectedAgentId === ag.id
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                    }`}
                  >
                    {ag.name === 'Kanndice McLean' && <span>⭐</span>}
                    <span>Mike Ford + {ag.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedAgentId('solo')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    isSoloMode
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10'
                  }`}
                >
                  Solo LO (Direct)
                </button>
              </div>

              {/* Featured GeoMap Plugin Default Property & Curated Shortlist Selector */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDefaultProperty}
                        onChange={(e) => setIncludeDefaultProperty(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Featured Default Property</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCuratedShortlist}
                        onChange={(e) => setIncludeCuratedShortlist(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Curated Shortlist ({curatedPropertyIds.length})</span>
                      </span>
                    </label>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    Front & Center + Curated Cards
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {promotablePropertiesList.map((prop) => {
                      const isDefault = prop.id === selectedPropertyId;
                      const isCurated = curatedPropertyIds.includes(prop.id);
                      return (
                        <div
                          key={prop.id}
                          className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-1.5 ${
                            isDefault
                              ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400/40 shadow-xs'
                              : isCurated
                              ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-200'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-extrabold font-mono text-emerald-400">
                                ${(prop.price).toLocaleString()}
                              </span>
                              {isDefault ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-xs">
                                  <Star className="w-2.5 h-2.5 fill-slate-950" /> Default
                                </span>
                              ) : isCurated ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Curated
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[11px] font-bold truncate text-slate-200 mt-0.5">
                              {prop.address.split(',')[0]}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">
                              {prop.desc}
                            </div>
                          </div>

                          {/* Control Checkboxes for Default & Curate */}
                          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPropertyId(prop.id);
                                try {
                                  localStorage.setItem('vantage_geomap_default_property_id', prop.id);
                                } catch {}
                              }}
                              className={`flex items-center gap-1 font-bold cursor-pointer transition ${
                                isDefault ? 'text-amber-300' : 'text-slate-400 hover:text-white'
                              }`}
                              title="Set this property as the default front and center listing"
                            >
                              <Star className={`w-3 h-3 ${isDefault ? 'fill-amber-400 text-amber-400' : ''}`} />
                              <span>{isDefault ? 'Is Default' : 'Set Default'}</span>
                            </button>

                            <label
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-emerald-300 font-bold"
                              title="Toggle inclusion in curated lead export build"
                            >
                              <input
                                type="checkbox"
                                checked={isCurated}
                                onChange={() => handleToggleCuratedId(prop.id)}
                                className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
                              />
                              <span>Curate</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    When potential leads open your share link, QR code, SMS, or email, all checkboxed curated listings are built into their app deck, with the selected default property featured front-and-center!
                  </p>
                </div>
              </div>

              {/* Live Co-branded URL preview bar */}
              <div className="p-2.5 bg-black/40 rounded-xl border border-emerald-500/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1 px-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <code className="text-[11px] font-mono text-emerald-300 truncate select-all">
                    {selectedCobrandedUrl}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCobrandedLink}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  {copiedKey === 'cobranded_link_hero' ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pre-Formatted Social Media Bio Contact Card Bar */}
              <div className="p-2.5 bg-gradient-to-r from-purple-950/50 via-slate-900 to-pink-950/40 rounded-xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={isSoloMode ? currentLo.photoUrl : currentAgent.photoUrl}
                      alt={isSoloMode ? currentLo.name : currentAgent.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-purple-400/60 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                      ✓
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1">
                        <Contact className="w-3 h-3 text-pink-400" />
                        Agent Contact Card
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
                        Social Media Bio Ready
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {isSoloMode ? currentLo.name : currentAgent.name} ({isSoloMode ? `NMLS #${currentLo.nmlsNumber}` : (currentAgent.licenseNumber || 'Active Broker')})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCopyAgentContactCard}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition cursor-pointer flex items-center gap-1 shadow-xs border border-purple-400/30"
                    title="Copy formatted agent contact card with headshot and co-branded link to clipboard"
                  >
                    {copiedKey === 'agent_contact_card' ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span>✓ Copied Bio Card!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Bio Card</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsContactCardModalOpen(true)}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 text-purple-200 transition cursor-pointer flex items-center gap-1 border border-white/10"
                    title="Preview contact card format before pasting"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Showing QR Code Display Card (4 cols on lg) */}
            <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-emerald-500/40 p-3.5 flex flex-col items-center text-center shadow-lg relative group">
              <div className="w-full flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Showing Direct Scan
                </span>
                <button
                  type="button"
                  onClick={() => setIsShowingKioskOpen(true)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Expand to Fullscreen Showing Display"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Kiosk</span>
                </button>
              </div>

              {/* High-Contrast Showing QR Code */}
              <div 
                className="p-2 bg-white rounded-xl shadow-md cursor-pointer transition transform hover:scale-105"
                onClick={() => setIsShowingKioskOpen(true)}
                title="Tap to open full-screen tablet showing display"
              >
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedCobrandedUrl)}&margin=6`}
                  alt="Co-Branded Showing QR Code"
                  className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                  loading="lazy"
                />
              </div>

              {/* Showing Label & Partner Attribution */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentLo.name} & {isSoloMode ? 'Direct Originator' : currentAgent.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Hold up tablet/phone at showings. Buyers scan to install PWA with live DPA calculator.
                </p>
              </div>

              {/* Showing Action Links */}
              <div className="flex items-center justify-center gap-2.5 mt-2.5 pt-2 border-t border-slate-800 w-full text-[11px] font-semibold flex-wrap">
                <button
                  type="button"
                  onClick={handleShareViaSms}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition"
                  title="Share link with client via native mobile SMS share intent"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Text Client</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={handleCopyAgentContactCard}
                  className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer transition"
                  title="Copy formatted agent contact card for social media bio"
                >
                  <Contact className="w-3 h-3" />
                  <span>{copiedKey === 'agent_contact_card' ? 'Copied Bio' : 'Bio Card'}</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setIsShowingKioskOpen(true)}
                  className="text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Tablet className="w-3 h-3" />
                  <span>Tablet View</span>
                </button>
                <span className="text-slate-600">•</span>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(selectedCobrandedUrl)}&margin=8`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="showing-cobranded-qr.png"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
                  title="Download 400x400 high-res QR image for flyers or open house sign-in sheets"
                >
                  <Download className="w-3 h-3" />
                  <span>Save QR</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            All 5 Modules
          </button>
          {LEAD_MOBILE_PLUGIN_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveTabFilter(mod.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTabFilter === mod.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {mod.shortName}
            </button>
          ))}
        </div>

        {/* Modules List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {filteredModules.map((module) => {
            const Icon = getIcon(module.iconName);
            const isCobrandedPack = module.id === 'plugin_cobranded_agent_pack';
            const isRealEstateModule = module.id === 'plugin_real_estate';

            // Generate the live URL: if co-branded pack or real estate, dynamically attach the selected LO & Agent
            const liveUrl = isCobrandedPack
              ? selectedCobrandedUrl
              : buildLeadPluginUrl(
                  module.pluginParam, 
                  currentBaseUrl, 
                  { 
                    leadMode: true,
                    ...(isRealEstateModule && !isSoloMode ? { lo: currentLo.id, agent: currentAgent.id } : {})
                  }
                );
            const isQrExpanded = expandedQrId === module.id;

            return (
              <div 
                key={module.id}
                className={`bg-white dark:bg-slate-800/90 rounded-2xl border p-4 sm:p-5 shadow-xs transition ${
                  isCobrandedPack 
                    ? 'border-emerald-500/50 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50/20 via-white to-teal-50/20 dark:from-emerald-950/20 dark:via-slate-800/90 dark:to-teal-950/20 ring-1 ring-emerald-400/20' 
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isCobrandedPack
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {isCobrandedPack
                            ? `Co-Branded Pack: ${currentLo.name} + ${isSoloMode ? 'Solo LO' : currentAgent.name}`
                            : module.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCobrandedPack
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}>
                          {isCobrandedPack ? 'Active Co-Branded Pair' : module.badge}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                        {isCobrandedPack
                          ? `Co-Branded Portal for ${currentLo.name} (NMLS #${currentLo.nmlsNumber}) & ${isSoloMode ? 'Direct Originator' : currentAgent.name}`
                          : module.tagline}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offline to Public Notice */}
                {module.isOfflineForPublic && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-medium">
                      <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span><strong>Public Access Offline:</strong> This plugin URL is currently in Developer Testing Mode only and offline for public traffic.</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-mono text-[10px] font-bold shrink-0">
                      Dev Mode Only
                    </span>
                  </div>
                )}

                {/* Live URL Bar */}
                <div className={`mt-3.5 p-2.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 ${
                  isCobrandedPack
                    ? 'bg-emerald-950/20 dark:bg-emerald-950/40 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700/70'
                }`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1 px-1">
                    <LinkIcon className={`w-4 h-4 shrink-0 ${isCobrandedPack ? 'text-emerald-500' : 'text-blue-500'}`} />
                    <code className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                      {liveUrl}
                    </code>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Dedicated One-Tap Copy Co-branded Link Button for co-branded modules */}
                    {(isCobrandedPack || isRealEstateModule) ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(liveUrl, `cobranded_${module.id}`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-lg text-xs font-black transition cursor-pointer shadow-xs border border-emerald-400/30 active:scale-95"
                        title={`One-tap copy co-branded URL for ${currentLo.name} + ${isSoloMode ? 'Solo LO' : currentAgent.name}`}
                      >
                        {copiedKey === `cobranded_${module.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-200 animate-bounce" />
                            <span>✓ Copied Co-branded Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Copy Co-branded Link</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopy(liveUrl, `url_${module.id}`)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                        title="Copy live link to clipboard"
                      >
                        {copiedKey === `url_${module.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Live URL</span>
                          </>
                        )}
                      </button>
                    )}

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Open and test live link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Test Link</span>
                    </a>

                    <button
                      onClick={() => setExpandedQrId(isQrExpanded ? null : module.id)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isQrExpanded
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR Code Expansion Drawer */}
                {isQrExpanded && (
                  <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <SimpleQrCodeSvg value={liveUrl} />
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-500" />
                        Live Mobile Add-to-Home-Screen QR Code
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Have your lead open their phone camera, point it at this QR code, and tap the notification. When the page opens in mobile browser, they can tap <strong className="text-blue-600 dark:text-blue-400 font-semibold">"Add to Home Screen"</strong> to install the standalone mobile app.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(liveUrl, `qr_url_${module.id}`)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          {copiedKey === `qr_url_${module.id}` ? '✓ Copied' : 'Copy Direct Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Pitch Templates for SMS & Email */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Includes Zero BYOK Guest Bypass & 1-Tap A2HS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const smsText = isCobrandedPack
                          ? module.smsPitchTemplate
                              .replace(/Kanndice McLean/g, isSoloMode ? 'Valued Partner' : currentAgent.name)
                              .replace(/Kanndice/g, isSoloMode ? 'Partner' : currentAgent.name.split(' ')[0])
                              .replace('{URL}', liveUrl)
                          : module.smsPitchTemplate.replace('{URL}', liveUrl);

                        if (typeof navigator !== 'undefined' && navigator.share) {
                          try {
                            await navigator.share({
                              title: module.name,
                              text: smsText,
                              url: liveUrl
                            });
                            setCopiedKey(`sms_${module.id}`);
                            setTimeout(() => setCopiedKey(null), 2500);
                            return;
                          } catch (err: any) {
                            if (err?.name === 'AbortError') return;
                          }
                        }

                        // Native SMS URI fallback for mobile devices
                        const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
                        const sep = isIos ? '&' : '?';
                        window.location.href = `sms:${sep}body=${encodeURIComponent(smsText)}`;
                        handleCopy(smsText, `sms_${module.id}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Trigger native mobile SMS share intent with pre-populated property information"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{copiedKey === `sms_${module.id}` ? '✓ SMS Sent / Shared' : 'Share via SMS'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const emailBody = isCobrandedPack
                          ? module.emailPitchTemplate.body
                              .replace(/Kanndice McLean/g, isSoloMode ? 'Valued Partner' : currentAgent.name)
                              .replace(/Kanndice/g, isSoloMode ? 'Partner' : currentAgent.name.split(' ')[0])
                              .replace('{URL}', liveUrl)
                          : module.emailPitchTemplate.body.replace('{URL}', liveUrl);
                        const emailSubj = isCobrandedPack
                          ? module.emailPitchTemplate.subject
                              .replace(/Kanndice McLean/g, isSoloMode ? 'Valued Partner' : currentAgent.name)
                          : module.emailPitchTemplate.subject;
                        const fullEmail = `Subject: ${emailSubj}\n\n${emailBody}`;
                        handleCopy(fullEmail, `email_${module.id}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Copy pre-written Email pitch with subject and live URL"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{copiedKey === `email_${module.id}` ? '✓ Copied Email' : 'Copy Lead Email'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary / Quick Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Managed Master Hub Architecture:</span> All lead entries bypass API key configuration and connect directly to Mike Ford's master pipeline.
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const allLinks = LEAD_MOBILE_PLUGIN_MODULES.map(m => {
                  const url = buildLeadPluginUrl(m.pluginParam, currentBaseUrl, { leadMode: true });
                  return `${m.name}:\n${url}\n`;
                }).join('\n');
                handleCopy(allLinks, 'copy_all');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'copy_all' ? '✓ All 5 URLs Copied' : 'Copy All 5 URLs'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

        {/* Fullscreen Showing Tablet / Phone Kiosk Presenter Modal */}
        {isShowingKioskOpen && (
          <div 
            className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsShowingKioskOpen(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative space-y-5 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsShowingKioskOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Close showing kiosk"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black uppercase tracking-wider">
                  <Tablet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>On-Site Property Showing Kiosk</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentLo.name} & {isSoloMode ? 'Direct Originator' : currentAgent.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
                  {currentLo.company} (NMLS #{currentLo.nmlsNumber}) • {isSoloMode ? 'Direct Pipeline' : currentAgent.brokerage}
                </p>
              </div>

              {/* Large High-Contrast QR Code for Tablet Viewing */}
              <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-emerald-500/30 flex flex-col items-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(selectedCobrandedUrl)}&margin=8`}
                  alt="Showing Direct Scan QR Code"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Point Phone Camera at QR Code to Scan</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                When opened on the buyer's smartphone, they can tap <strong className="text-emerald-600 dark:text-emerald-400">"Add to Home Screen"</strong> to install the full co-branded portal with live $0-down grant radar and 2-way text notes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={handleCopyCobrandedLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md"
                >
                  {copiedKey === 'cobranded_link_hero' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied Co-branded Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Co-branded Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareViaSms}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md active:scale-95"
                  title="Share link with client via native mobile SMS share intent"
                >
                  <MessageSquare className="w-4 h-4 text-blue-200" />
                  <span>{copiedKey === 'sms_shared_hero' ? '✓ Link Shared / Sent!' : 'Share via SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAgentContactCard}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-md active:scale-95"
                  title="Copy pre-formatted Agent Contact Card (name, photo & co-branded link) for social media bios"
                >
                  <Contact className="w-4 h-4 text-pink-200" />
                  <span>{copiedKey === 'agent_contact_card' ? '✓ Copied Bio Card!' : 'Copy Bio Card'}</span>
                </button>

                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(selectedCobrandedUrl)}&margin=10`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="property-showing-cobranded-qr.png"
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                  title="Download high-resolution 500x500 QR image for flyers or open house sign-in sheets"
                >
                  <Download className="w-4 h-4" />
                  <span>Save QR Image</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsShowingKioskOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Contact Card Social Media Bio Modal */}
        {isContactCardModalOpen && (
          <div 
            className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setIsContactCardModalOpen(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border-2 border-purple-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col items-center relative space-y-4 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsContactCardModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Close bio card preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-xs font-black uppercase tracking-wider">
                  <Contact className="w-3.5 h-3.5 text-pink-500" />
                  <span>Professional Social Media Bio Card</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {isSoloMode ? currentLo.name : currentAgent.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pre-formatted text with photo and co-branded link, ready to paste directly into Instagram, LinkedIn, Linktree, TikTok, or email signatures.
                </p>
              </div>

              {/* Headshot Photo Preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 w-full">
                <img
                  src={isSoloMode ? currentLo.photoUrl : currentAgent.photoUrl}
                  alt={isSoloMode ? currentLo.name : currentAgent.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-md shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {isSoloMode ? currentLo.name : currentAgent.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {isSoloMode ? currentLo.title : currentAgent.title}
                  </div>
                  <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400 truncate">
                    {isSoloMode ? `${currentLo.company} • NMLS #${currentLo.nmlsNumber}` : `${currentAgent.brokerage} • Lic #${currentAgent.licenseNumber || 'Active'}`}
                  </div>
                </div>
              </div>

              {/* Formatted Bio Card Text Box */}
              <div className="w-full">
                <div className="flex items-center justify-between pb-1.5 px-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Copy-Ready Bio Text & Link
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Includes Co-Branded Portal Link
                  </span>
                </div>
                <textarea
                  readOnly
                  value={getFormattedAgentContactCard()}
                  rows={7}
                  className="w-full p-3 bg-slate-100 dark:bg-slate-950 border border-purple-300 dark:border-purple-800 rounded-2xl font-mono text-xs text-slate-800 dark:text-purple-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner select-all leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={handleCopyAgentContactCard}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  {copiedKey === 'agent_contact_card' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>✓ Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Agent Contact Card</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsContactCardModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
