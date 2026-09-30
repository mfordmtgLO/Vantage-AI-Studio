/**
 * @file leadGenAgentsService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Lead Generation Agents & Team Member Signature Roster Service
 * Manages lead generation agents, intake specialists, and licensed mortgage advisors
 * for signature template formatting, two-way comment synchronization, and CRM attribution.
 */

import { PeerLoanOfficersService, PeerLoanOfficer } from './peerLoanOfficersService';

export interface LeadGenAgent {
  id: string;
  name: string;
  title: string;
  roleCategory: 'team_lead' | 'lead_gen_specialist' | 'state_loan_officer' | 'peer_partner';
  roleBadge: string;
  company: string;
  nmlsNumber?: string;
  phone: string;
  email: string;
  primaryState: string;
  licensedStates: string[];
  specialty: string;
  experience?: string;
  applicationUrl?: string;
  isDefault?: boolean;
}

export const STORAGE_ACTIVE_AGENT_KEY = 'vantage_active_lead_gen_agent_id';
export const STORAGE_CUSTOM_AGENTS_KEY = 'vantage_custom_lead_gen_agents_v1';

export const DEFAULT_LEAD_GEN_AGENTS: LeadGenAgent[] = [
  // 1. Team Lead / Senior Mortgage Advisor
  {
    id: 'agent_mike_ford',
    name: 'Mike Ford',
    title: 'Senior Loan Officer',
    roleCategory: 'team_lead',
    roleBadge: '👑 Team Lead / Senior LO',
    company: 'Churchill Mortgage',
    nmlsNumber: '102938',
    phone: '(541) 729-2097',
    email: 'fordmj@gmail.com',
    primaryState: 'OR',
    licensedStates: ['OR', 'WA'],
    specialty: 'Oregon First-Time Buyer & 2-1 Buydown Programs',
    experience: '26 Yrs Oregon Experience',
    applicationUrl: 'https://cfmtg.com/mford/',
    isDefault: true
  },

  // 2. Dedicated Lead Generation & Outreach Specialists
  {
    id: 'agent_jessica_vance',
    name: 'Jessica Vance',
    title: 'Lead Generation Specialist',
    roleCategory: 'lead_gen_specialist',
    roleBadge: '🎯 Lead Gen & Outreach',
    company: 'Churchill Mortgage',
    nmlsNumber: '194820',
    phone: '(541) 555-0142',
    email: 'jvance@cfmtg.com',
    primaryState: 'OR',
    licensedStates: ['OR'],
    specialty: 'Community Ingestion & Buyer Pre-Screening',
    experience: 'First-Time Buyer Intake Specialist',
    applicationUrl: 'https://cfmtg.com/jvance/'
  },
  {
    id: 'agent_marcus_brody',
    name: 'Marcus Brody',
    title: 'Rural Housing Outreach Director',
    roleCategory: 'lead_gen_specialist',
    roleBadge: '🌾 USDA & Rural Outreach',
    company: 'Churchill Mortgage',
    nmlsNumber: '219401',
    phone: '(541) 555-0198',
    email: 'mbrody@cfmtg.com',
    primaryState: 'OR',
    licensedStates: ['OR', 'ID'],
    specialty: 'USDA Zero-Down & Agricultural Grants',
    experience: 'Rural Market Acquisition Specialist',
    applicationUrl: 'https://cfmtg.com/mbrody/'
  },
  {
    id: 'agent_alex_rivera',
    name: 'Alex Rivera',
    title: 'Homebuyer Concierge Specialist',
    roleCategory: 'lead_gen_specialist',
    roleBadge: '💬 Forum & Social Concierge',
    company: 'Churchill Mortgage',
    nmlsNumber: '302918',
    phone: '(503) 555-0164',
    email: 'arivera@cfmtg.com',
    primaryState: 'OR',
    licensedStates: ['OR'],
    specialty: 'Reddit & Forum Conversation Engagement',
    experience: 'Social Lead Discovery Specialist',
    applicationUrl: 'https://cfmtg.com/arivera/'
  },

  // 3. Regional State Loan Officers
  {
    id: 'agent_david_miller',
    name: 'David Miller',
    title: 'Senior Mortgage Specialist',
    roleCategory: 'state_loan_officer',
    roleBadge: '🌲 Oregon Regional Partner',
    company: 'Churchill Mortgage',
    nmlsNumber: '204910',
    phone: '(503) 555-0182',
    email: 'dmiller@cfmtg.com',
    primaryState: 'OR',
    licensedStates: ['OR', 'WA'],
    specialty: 'Portland & Bend Metro Housing Assistance',
    experience: '18 Yrs PNW Lending',
    applicationUrl: 'https://cfmtg.com/dmiller/'
  },
  {
    id: 'agent_sarah_jenkins',
    name: 'Sarah Jenkins',
    title: 'Senior Mortgage Specialist',
    roleCategory: 'state_loan_officer',
    roleBadge: '🌲 Washington Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '184920',
    phone: '(206) 555-0192',
    email: 'sjenkins@cfmtg.com',
    primaryState: 'WA',
    licensedStates: ['WA'],
    specialty: 'WSHFC Down Payment Assistance & HouseWA',
    experience: 'Washington State Lending Lead',
    applicationUrl: 'https://cfmtg.com/sjenkins/'
  },
  {
    id: 'agent_brad_callahan',
    name: 'Brad Callahan',
    title: 'Senior VP of Lending',
    roleCategory: 'state_loan_officer',
    roleBadge: '🥔 Idaho Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '294105',
    phone: '(208) 555-0144',
    email: 'bcallahan@cfmtg.com',
    primaryState: 'ID',
    licensedStates: ['ID', 'MT'],
    specialty: 'Idaho Housing (IHFA) Zero-Down Financing',
    experience: 'Treasure Valley Lending Lead',
    applicationUrl: 'https://cfmtg.com/bcallahan/'
  },
  {
    id: 'agent_elena_vasquez',
    name: 'Elena Vasquez',
    title: 'Executive Loan Consultant',
    roleCategory: 'state_loan_officer',
    roleBadge: '☀️ California Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '312894',
    phone: '(916) 555-0188',
    email: 'evasquez@cfmtg.com',
    primaryState: 'CA',
    licensedStates: ['CA'],
    specialty: 'CalHFA MyHome & Dream For All Grants',
    experience: 'California Community Lending Lead',
    applicationUrl: 'https://cfmtg.com/evasquez/'
  },
  {
    id: 'agent_jason_mercer',
    name: 'Jason Mercer',
    title: 'Senior Loan Officer',
    roleCategory: 'state_loan_officer',
    roleBadge: '🎰 Nevada Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '241852',
    phone: '(702) 555-0177',
    email: 'jmercer@cfmtg.com',
    primaryState: 'NV',
    licensedStates: ['NV', 'AZ'],
    specialty: 'Nevada Home is Possible (HIP) Grants',
    experience: 'Nevada & Southwest Lending Lead',
    applicationUrl: 'https://cfmtg.com/jmercer/'
  },
  {
    id: 'agent_rachel_holloway',
    name: 'Rachel Holloway',
    title: 'Senior Mortgage Director',
    roleCategory: 'state_loan_officer',
    roleBadge: '🤠 Texas Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '409122',
    phone: '(512) 555-0133',
    email: 'rholloway@cfmtg.com',
    primaryState: 'TX',
    licensedStates: ['TX'],
    specialty: 'TDHCA My First Texas Home & Grants',
    experience: 'Texas First-Time Buyer Director',
    applicationUrl: 'https://cfmtg.com/rholloway/'
  },
  {
    id: 'agent_travis_dunbar',
    name: 'Travis Dunbar',
    title: 'Senior Loan Specialist',
    roleCategory: 'state_loan_officer',
    roleBadge: '🏔️ Colorado Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '341908',
    phone: '(303) 555-0129',
    email: 'tdunbar@cfmtg.com',
    primaryState: 'CO',
    licensedStates: ['CO'],
    specialty: 'CHFA SmartStep & Colorado Grants',
    experience: 'Front Range Lending Lead',
    applicationUrl: 'https://cfmtg.com/tdunbar/'
  },
  {
    id: 'agent_david_sterling',
    name: 'David Sterling',
    title: 'Senior Lending Specialist',
    roleCategory: 'state_loan_officer',
    roleBadge: '🌴 Florida Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '284019',
    phone: '(407) 555-0118',
    email: 'dsterling@cfmtg.com',
    primaryState: 'FL',
    licensedStates: ['FL', 'GA'],
    specialty: 'Florida Hometown Heroes Down Payment Assistance',
    experience: 'Florida Lending Lead',
    applicationUrl: 'https://cfmtg.com/dsterling/'
  },
  {
    id: 'agent_mark_reynolds',
    name: 'Mark Reynolds',
    title: 'Area Lending Manager',
    roleCategory: 'state_loan_officer',
    roleBadge: '🌵 Arizona Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '381920',
    phone: '(602) 555-0165',
    email: 'mreynolds@cfmtg.com',
    primaryState: 'AZ',
    licensedStates: ['AZ'],
    specialty: 'AzIDA Arizona Home Plus Financing',
    experience: 'Phoenix & Southwest Lending Lead',
    applicationUrl: 'https://cfmtg.com/mreynolds/'
  },
  {
    id: 'agent_spencer_nielsen',
    name: 'Spencer Nielsen',
    title: 'Senior Loan Officer',
    roleCategory: 'state_loan_officer',
    roleBadge: '⛷️ Utah Specialist',
    company: 'Churchill Mortgage',
    nmlsNumber: '392104',
    phone: '(801) 555-0155',
    email: 'snielsen@cfmtg.com',
    primaryState: 'UT',
    licensedStates: ['UT'],
    specialty: 'Utah Housing Corporation (UHC) DPA',
    experience: 'Wasatch Front Lending Lead',
    applicationUrl: 'https://cfmtg.com/snielsen/'
  }
];

export class LeadGenAgentsService {
  /**
   * Retrieves all Lead Generation Agents including default roster,
   * any synced peer loan officers, and custom agents.
   */
  static getAllAgents(): LeadGenAgent[] {
    const agentsMap = new Map<string, LeadGenAgent>();
    
    // 1. Seed with default lead gen agents
    DEFAULT_LEAD_GEN_AGENTS.forEach(a => agentsMap.set(a.id, a));

    // 2. Add synced peer loan officers from directory if not already present
    try {
      const peerLos = PeerLoanOfficersService.getAllPeerLoanOfficers();
      peerLos.forEach(peer => {
        const id = `agent_${peer.id}`;
        if (!agentsMap.has(id) && !peer.name.toLowerCase().includes('mike ford')) {
          const isRegionalLO = peer.licensedStates && peer.licensedStates.length > 0;
          agentsMap.set(id, {
            id,
            name: peer.name,
            title: peer.title || 'Senior Mortgage Specialist',
            roleCategory: isRegionalLO ? 'state_loan_officer' : 'peer_partner',
            roleBadge: `👤 ${peer.licensedStates?.[0] || 'Partner'} Loan Officer`,
            company: peer.company || 'Churchill Mortgage',
            nmlsNumber: peer.nmlsNumber,
            phone: peer.phone || '(555) 019-2831',
            email: peer.email || 'loans@cfmtg.com',
            primaryState: peer.licensedStates?.[0] || 'OR',
            licensedStates: peer.licensedStates || ['OR'],
            specialty: peer.localDpaProgram || 'State First-Time Buyer & Down Payment Grants',
            experience: peer.branchLocation || 'Churchill Mortgage Lending Partner',
            applicationUrl: peer.applicationUrl
          });
        }
      });
    } catch (e) {
      console.warn('Error syncing peer loan officers into lead gen roster:', e);
    }

    // 3. Load custom agents from localStorage
    if (typeof window !== 'undefined') {
      try {
        const rawCustom = localStorage.getItem(STORAGE_CUSTOM_AGENTS_KEY);
        if (rawCustom) {
          const customList: LeadGenAgent[] = JSON.parse(rawCustom);
          customList.forEach(c => agentsMap.set(c.id, c));
        }
      } catch {}
    }

    return Array.from(agentsMap.values());
  }

  /**
   * Retrieves the currently selected active agent ID from localStorage
   * (defaults to 'agent_mike_ford').
   */
  static getActiveAgentId(): string {
    if (typeof window === 'undefined') return 'agent_mike_ford';
    try {
      return localStorage.getItem(STORAGE_ACTIVE_AGENT_KEY) || 'agent_mike_ford';
    } catch {
      return 'agent_mike_ford';
    }
  }

  /**
   * Sets the active agent ID in localStorage.
   */
  static setActiveAgentId(agentId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_ACTIVE_AGENT_KEY, agentId);
    } catch {}
  }

  /**
   * Resolves the full LeadGenAgent object by ID or falls back to Mike Ford.
   */
  static getAgentById(agentId?: string): LeadGenAgent {
    const all = this.getAllAgents();
    if (agentId) {
      const match = all.find(a => a.id === agentId);
      if (match) return match;
    }
    const defaultAgent = all.find(a => a.id === 'agent_mike_ford') || all[0];
    return defaultAgent;
  }

  /**
   * Resolves the active agent for a specific state code.
   */
  static getAgentForState(stateCode: string): LeadGenAgent {
    const all = this.getAllAgents();
    const stateMatch = all.find(a => a.primaryState === stateCode || a.licensedStates?.includes(stateCode));
    if (stateMatch) return stateMatch;
    return this.getAgentById('agent_mike_ford');
  }

  /**
   * Formats the Full Professional signature for a given agent and thread ref.
   */
  static generateFullSignature(agent: LeadGenAgent, threadRef?: string): string {
    const isMikeFord = agent.name.toLowerCase().includes('mike ford');
    const refLine = threadRef ? (threadRef.startsWith('[Ref:') ? threadRef : `[Ref: #${threadRef}]`) : `[Ref: #th_${agent.primaryState.toLowerCase()}_live_sweep]`;

    if (isMikeFord) {
      return `— Mike Ford (Senior Loan Officer)\nSenior Mortgage Loan Officer | 26 Yrs Oregon Experience\nDirect / SMS: (541) 729-2097 | Email: fordmj@gmail.com\n${refLine}`;
    }

    const nmlsLine = agent.nmlsNumber ? ` | NMLS #${agent.nmlsNumber}` : '';
    const expOrSpecialty = agent.experience || agent.specialty || `${agent.primaryState} Lending Specialist`;

    return `— ${agent.name} (${agent.title})\n${agent.company}${nmlsLine} | ${expOrSpecialty}\nDirect / SMS: ${agent.phone} | Email: ${agent.email}\n${refLine}`;
  }

  /**
   * Formats the Compact Social signature for a given agent.
   */
  static generateCompactSignature(agent: LeadGenAgent): string {
    return `— ${agent.name} (${agent.title}) | Direct / SMS: ${agent.phone}`;
  }

  /**
   * Formats the Canonical Single-Line signature for a given agent.
   */
  static generateSingleLineSignature(agent: LeadGenAgent): string {
    return `— ${agent.name} (${agent.title})`;
  }
}
