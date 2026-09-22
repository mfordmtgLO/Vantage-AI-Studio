/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • PROFILE CARDS SYNC & CROSS-APP IMPORT SERVICE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Synchronizes Loan Officer & Agent Profile Cards with First-Time Homebuyer AI Studio
 * ============================================================================
 */

export interface PairedAgentInfo {
  agentId: string;
  agentName: string;
  agentBrokerage: string;
  coBrandedListingsCount: number;
  pairingStatus: 'Active Partner' | 'Preferred' | 'Pending';
}

export interface PairedLoInfo {
  loId: string;
  loName: string;
  loCompany: string;
  pairedPreapprovalsCount: number;
  pairingStatus: 'Active Partner' | 'Preferred' | 'Pending';
}

export interface LoanOfficerProfileCard {
  id: string;
  name: string;
  nmlsNumber: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  photoUrl?: string;
  specialties: string[];
  primaryState: string;
  status: 'Active' | 'Verified' | 'Pending Review';
  rating: number;
  activePreapprovalsCount: number;
  lastSyncedAt: string;
  syncedFromApp: string;
  pairedAgentIds?: string[];
  pairedAgents?: PairedAgentInfo[];
}

export interface AgentProfileCard {
  id: string;
  name: string;
  licenseNumber: string;
  brokerage: string;
  title: string;
  email: string;
  phone: string;
  photoUrl?: string;
  targetMarkets: string[];
  primaryState: string;
  status: 'Active' | 'Verified' | 'Pending Review';
  activeListingsCount: number;
  lastSyncedAt: string;
  syncedFromApp: string;
  pairedLoIds?: string[];
  pairedLoanOfficers?: PairedLoInfo[];
}

const LO_STORAGE_KEY = 'vantage_synced_lo_profiles_v2';
const AGENT_STORAGE_KEY = 'vantage_synced_agent_profiles_v2';

const DEFAULT_LO_PROFILES: LoanOfficerProfileCard[] = [
  {
    id: 'lo-mike-ford',
    name: 'Mike Ford',
    nmlsNumber: '288455',
    company: 'Vantage AI Mortgage & Loan Services',
    title: 'Managing Loan Officer & Principal Architect',
    email: 'fordmj@gmail.com',
    phone: '+1 (503) 555-0192',
    specialties: ['USDA 100% Rural', 'Lakeview National DPA', 'Fannie Mae HomeReady', 'OHCS Flex Lending'],
    primaryState: 'OR',
    status: 'Verified',
    rating: 5.0,
    activePreapprovalsCount: 24,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedAgentIds: ['agent-rebecca-vance', 'agent-elena-rodriguez'],
    pairedAgents: [
      {
        agentId: 'agent-rebecca-vance',
        agentName: 'Rebecca Vance',
        agentBrokerage: 'Cascade Premier Realty',
        coBrandedListingsCount: 12,
        pairingStatus: 'Active Partner'
      },
      {
        agentId: 'agent-elena-rodriguez',
        agentName: 'Elena Rodriguez',
        agentBrokerage: 'Willamette Valley Homes',
        coBrandedListingsCount: 8,
        pairingStatus: 'Preferred'
      }
    ]
  },
  {
    id: 'lo-sarah-jenkins',
    name: 'Sarah Jenkins',
    nmlsNumber: '1092834',
    company: 'Pacific Northwest Home Lending',
    title: 'Senior Down Payment Specialist',
    email: 'sjenkins@pnwhomelending.com',
    phone: '+1 (503) 555-0144',
    specialties: ['National Homebuyer Fund (NHF)', 'CRA $5k LMI Grants', 'FHA Zero Down'],
    primaryState: 'WA',
    status: 'Active',
    rating: 4.9,
    activePreapprovalsCount: 18,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedAgentIds: ['agent-marcus-brooks'],
    pairedAgents: [
      {
        agentId: 'agent-marcus-brooks',
        agentName: 'Marcus Brooks',
        agentBrokerage: 'Sound Real Estate Group',
        coBrandedListingsCount: 8,
        pairingStatus: 'Active Partner'
      }
    ]
  },
  {
    id: 'lo-david-chen',
    name: 'David Chen',
    nmlsNumber: '882319',
    company: 'Vantage West Capital',
    title: 'Vice President of Residential Mortgages',
    email: 'dchen@vantagecapital.com',
    phone: '+1 (415) 555-0188',
    specialties: ['Jumbo DPA', 'HomeReady 3% Down', 'First-Time Buyer Advisory'],
    primaryState: 'CA',
    status: 'Verified',
    rating: 4.95,
    activePreapprovalsCount: 31,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedAgentIds: ['agent-rebecca-vance'],
    pairedAgents: [
      {
        agentId: 'agent-rebecca-vance',
        agentName: 'Rebecca Vance',
        agentBrokerage: 'Cascade Premier Realty',
        coBrandedListingsCount: 5,
        pairingStatus: 'Preferred'
      }
    ]
  }
];

const DEFAULT_AGENT_PROFILES: AgentProfileCard[] = [
  {
    id: 'agent-rebecca-vance',
    name: 'Rebecca Vance',
    licenseNumber: 'OR-201283941',
    brokerage: 'Cascade Premier Realty',
    title: 'Principal Buyer Specialist & Realtor®',
    email: 'rebecca@cascadepremier.com',
    phone: '+1 (503) 555-0177',
    targetMarkets: ['Portland Metro', 'Beaverton', 'Hillsboro', 'Lake Oswego'],
    primaryState: 'OR',
    status: 'Verified',
    activeListingsCount: 12,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedLoIds: ['lo-mike-ford', 'lo-david-chen'],
    pairedLoanOfficers: [
      {
        loId: 'lo-mike-ford',
        loName: 'Mike Ford',
        loCompany: 'Vantage AI Mortgage & Loan Services',
        pairedPreapprovalsCount: 24,
        pairingStatus: 'Active Partner'
      },
      {
        loId: 'lo-david-chen',
        loName: 'David Chen',
        loCompany: 'Vantage West Capital',
        pairedPreapprovalsCount: 10,
        pairingStatus: 'Preferred'
      }
    ]
  },
  {
    id: 'agent-marcus-brooks',
    name: 'Marcus Brooks',
    licenseNumber: 'WA-992014',
    brokerage: 'Sound Real Estate Group',
    title: 'First-Time Homebuyer Director',
    email: 'mbrooks@soundregroup.com',
    phone: '+1 (206) 555-0133',
    targetMarkets: ['Seattle', 'Tacoma', 'Bellevue', 'Renton'],
    primaryState: 'WA',
    status: 'Active',
    activeListingsCount: 8,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedLoIds: ['lo-sarah-jenkins'],
    pairedLoanOfficers: [
      {
        loId: 'lo-sarah-jenkins',
        loName: 'Sarah Jenkins',
        loCompany: 'Pacific Northwest Home Lending',
        pairedPreapprovalsCount: 18,
        pairingStatus: 'Active Partner'
      }
    ]
  },
  {
    id: 'agent-elena-rodriguez',
    name: 'Elena Rodriguez',
    licenseNumber: 'OR-201948301',
    brokerage: 'Willamette Valley Homes',
    title: 'Rural & USDA Property Specialist',
    email: 'elena@willamettevalleyhomes.com',
    phone: '+1 (541) 555-0166',
    targetMarkets: ['Salem', 'Eugene', 'Corvallis', 'Albany'],
    primaryState: 'OR',
    status: 'Verified',
    activeListingsCount: 15,
    lastSyncedAt: new Date().toISOString(),
    syncedFromApp: 'first-time-homebuyer_ai_studio (Cloud Run)',
    pairedLoIds: ['lo-mike-ford'],
    pairedLoanOfficers: [
      {
        loId: 'lo-mike-ford',
        loName: 'Mike Ford',
        loCompany: 'Vantage AI Mortgage & Loan Services',
        pairedPreapprovalsCount: 15,
        pairingStatus: 'Preferred'
      }
    ]
  }
];

export class ProfileCardSyncService {
  public static getLoanOfficers(): LoanOfficerProfileCard[] {
    const saved = localStorage.getItem(LO_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved LO profiles:', e);
      }
    }
    localStorage.setItem(LO_STORAGE_KEY, JSON.stringify(DEFAULT_LO_PROFILES));
    return DEFAULT_LO_PROFILES;
  }

  public static getAgents(): AgentProfileCard[] {
    const saved = localStorage.getItem(AGENT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved Agent profiles:', e);
      }
    }
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(DEFAULT_AGENT_PROFILES));
    return DEFAULT_AGENT_PROFILES;
  }

  public static async syncLoanOfficersFromCloudRun(): Promise<{
    count: number;
    profiles: LoanOfficerProfileCard[];
    timestamp: string;
  }> {
    // Simulate active network pull from Cloud Run app: https://github.com/mfordmtgLO/first-time-homebuyer_ai_studio
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const current = this.getLoanOfficers();
    const updatedTimestamp = new Date().toISOString();

    const syncedProfiles = current.map((lo) => ({
      ...lo,
      lastSyncedAt: updatedTimestamp,
      status: 'Verified' as const
    }));

    localStorage.setItem(LO_STORAGE_KEY, JSON.stringify(syncedProfiles));

    return {
      count: syncedProfiles.length,
      profiles: syncedProfiles,
      timestamp: updatedTimestamp
    };
  }

  public static async syncAgentsFromCloudRun(): Promise<{
    count: number;
    profiles: AgentProfileCard[];
    timestamp: string;
  }> {
    // Simulate active network pull from Cloud Run app: https://github.com/mfordmtgLO/first-time-homebuyer_ai_studio
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const current = this.getAgents();
    const updatedTimestamp = new Date().toISOString();

    const syncedProfiles = current.map((agent) => ({
      ...agent,
      lastSyncedAt: updatedTimestamp,
      status: 'Verified' as const
    }));

    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(syncedProfiles));

    return {
      count: syncedProfiles.length,
      profiles: syncedProfiles,
      timestamp: updatedTimestamp
    };
  }

  public static saveLoanOfficer(lo: LoanOfficerProfileCard): LoanOfficerProfileCard[] {
    const current = this.getLoanOfficers();
    const index = current.findIndex((item) => item.id === lo.id);
    let updated: LoanOfficerProfileCard[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = lo;
    } else {
      updated = [lo, ...current];
    }
    localStorage.setItem(LO_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public static saveAgent(agent: AgentProfileCard): AgentProfileCard[] {
    const current = this.getAgents();
    const index = current.findIndex((item) => item.id === agent.id);
    let updated: AgentProfileCard[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = agent;
    } else {
      updated = [agent, ...current];
    }
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public static deleteLoanOfficer(id: string): LoanOfficerProfileCard[] {
    const current = this.getLoanOfficers();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(LO_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  }

  public static deleteAgent(id: string): AgentProfileCard[] {
    const current = this.getAgents();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  }

  public static pairLoAndAgent(loId: string, agentId: string, pairingStatus: 'Active Partner' | 'Preferred' = 'Active Partner'): {
    updatedLos: LoanOfficerProfileCard[];
    updatedAgents: AgentProfileCard[];
  } {
    const los = this.getLoanOfficers();
    const agents = this.getAgents();

    const lo = los.find((item) => item.id === loId);
    const agent = agents.find((item) => item.id === agentId);

    if (!lo || !agent) {
      return { updatedLos: los, updatedAgents: agents };
    }

    // Update LO
    const existingLoPairedIds = lo.pairedAgentIds || [];
    if (!existingLoPairedIds.includes(agentId)) {
      lo.pairedAgentIds = [...existingLoPairedIds, agentId];
      const existingPairedAgents = lo.pairedAgents || [];
      lo.pairedAgents = [
        ...existingPairedAgents.filter((p) => p.agentId !== agentId),
        {
          agentId: agent.id,
          agentName: agent.name,
          agentBrokerage: agent.brokerage,
          coBrandedListingsCount: agent.activeListingsCount,
          pairingStatus
        }
      ];
      this.saveLoanOfficer(lo);
    }

    // Update Agent
    const existingAgentPairedIds = agent.pairedLoIds || [];
    if (!existingAgentPairedIds.includes(loId)) {
      agent.pairedLoIds = [...existingAgentPairedIds, loId];
      const existingPairedLos = agent.pairedLoanOfficers || [];
      agent.pairedLoanOfficers = [
        ...existingPairedLos.filter((p) => p.loId !== loId),
        {
          loId: lo.id,
          loName: lo.name,
          loCompany: lo.company,
          pairedPreapprovalsCount: lo.activePreapprovalsCount,
          pairingStatus
        }
      ];
      this.saveAgent(agent);
    }

    return {
      updatedLos: this.getLoanOfficers(),
      updatedAgents: this.getAgents()
    };
  }

  public static unpairLoAndAgent(loId: string, agentId: string): {
    updatedLos: LoanOfficerProfileCard[];
    updatedAgents: AgentProfileCard[];
  } {
    const los = this.getLoanOfficers();
    const agents = this.getAgents();

    const lo = los.find((item) => item.id === loId);
    const agent = agents.find((item) => item.id === agentId);

    if (lo) {
      lo.pairedAgentIds = (lo.pairedAgentIds || []).filter((id) => id !== agentId);
      lo.pairedAgents = (lo.pairedAgents || []).filter((p) => p.agentId !== agentId);
      this.saveLoanOfficer(lo);
    }

    if (agent) {
      agent.pairedLoIds = (agent.pairedLoIds || []).filter((id) => id !== loId);
      agent.pairedLoanOfficers = (agent.pairedLoanOfficers || []).filter((p) => p.loId !== loId);
      this.saveAgent(agent);
    }

    return {
      updatedLos: this.getLoanOfficers(),
      updatedAgents: this.getAgents()
    };
  }
}

export default ProfileCardSyncService;
