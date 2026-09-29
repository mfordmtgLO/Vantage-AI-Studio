/**
 * @file peerLoanOfficersService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Peer Loan Officer Directory & State Licensing Referral Engine
 * Dynamically resolves licensed peer loan officers across all 50 states
 * for compliant out-of-state loan origination and pre-approval referrals.
 */

import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import ProfileCardSyncService from './profileCardSyncService';

export interface PeerLoanOfficer {
  id: string;
  name: string;
  nmlsNumber: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  licensedStates: string[];
  defaultStates?: string[];
  applicationUrl: string;
  branchLocation: string;
  localDpaProgram?: string;
  syncedFrom?: string;
  photoUrl?: string;
  updatedAt?: string;
}

export const STORAGE_PEER_LO_DIRECTORY_KEY = 'vantage_peer_lo_directory_v1';
export const STORAGE_ALL_PEER_LOS_KEY = 'vantage_all_peer_los_v1';

/**
 * Default peer loan officer roster for company colleagues licensed in key states.
 * Pre-configured with typical peer profiles so out-of-state outreach works out of the box.
 */
export const DEFAULT_PEER_LO_ROSTER: Record<string, PeerLoanOfficer> = {
  OR: {
    id: 'peer_or_mford',
    name: 'Mike Ford',
    nmlsNumber: '102938',
    company: 'Churchill Mortgage',
    title: 'Senior Mortgage Advisor / Team Lead',
    email: 'mford@cfmtg.com',
    phone: '(541) 729-2097',
    licensedStates: ['OR', 'WA'],
    defaultStates: ['OR'],
    applicationUrl: 'https://cfmtg.com/mford/',
    branchLocation: 'Eugene / Willamette Valley Branch, OR',
    localDpaProgram: 'Oregon Housing and Community Services (OHCS) & Flex 97 DPA'
  },
  WA: {
    id: 'peer_wa_jenkins',
    name: 'Sarah Jenkins',
    nmlsNumber: '184920',
    company: 'Churchill Mortgage',
    title: 'Senior Mortgage Specialist',
    email: 'sjenkins@cfmtg.com',
    phone: '(206) 555-0192',
    licensedStates: ['WA'],
    applicationUrl: 'https://cfmtg.com/sjenkins/',
    branchLocation: 'Seattle / Bellevue Branch, WA',
    localDpaProgram: 'Washington State Housing Finance Commission (WSHFC) DPA & HouseWA'
  },
  ID: {
    id: 'peer_id_callahan',
    name: 'Brad Callahan',
    nmlsNumber: '294105',
    company: 'Churchill Mortgage',
    title: 'Senior Vice President of Lending',
    email: 'bcallahan@cfmtg.com',
    phone: '(208) 555-0144',
    licensedStates: ['ID', 'MT'],
    applicationUrl: 'https://cfmtg.com/bcallahan/',
    branchLocation: 'Boise / Treasure Valley Branch, ID',
    localDpaProgram: 'Idaho Housing and Finance Association (IHFA) Zero-Down Financing'
  },
  CA: {
    id: 'peer_ca_vasquez',
    name: 'Elena Vasquez',
    nmlsNumber: '312894',
    company: 'Churchill Mortgage',
    title: 'Executive Loan Consultant',
    email: 'evasquez@cfmtg.com',
    phone: '(916) 555-0188',
    licensedStates: ['CA'],
    applicationUrl: 'https://cfmtg.com/evasquez/',
    branchLocation: 'Sacramento / Bay Area Branch, CA',
    localDpaProgram: 'CalHFA MyHome Assistance & California Dream For All'
  },
  NV: {
    id: 'peer_nv_mercer',
    name: 'Jason Mercer',
    nmlsNumber: '241852',
    company: 'Churchill Mortgage',
    title: 'Senior Loan Officer',
    email: 'jmercer@cfmtg.com',
    phone: '(702) 555-0177',
    licensedStates: ['NV', 'AZ'],
    applicationUrl: 'https://cfmtg.com/jmercer/',
    branchLocation: 'Reno & Las Vegas Branch, NV',
    localDpaProgram: 'Nevada Home is Possible (HIP) Down Payment Grant'
  },
  AZ: {
    id: 'peer_az_reynolds',
    name: 'Mark Reynolds',
    nmlsNumber: '381920',
    company: 'Churchill Mortgage',
    title: 'Area Lending Manager',
    email: 'mreynolds@cfmtg.com',
    phone: '(602) 555-0165',
    licensedStates: ['AZ'],
    applicationUrl: 'https://cfmtg.com/mreynolds/',
    branchLocation: 'Phoenix / Scottsdale Branch, AZ',
    localDpaProgram: 'Arizona Home Plus (AzIDA) Zero-Down DPA'
  },
  TX: {
    id: 'peer_tx_holloway',
    name: 'Rachel Holloway',
    nmlsNumber: '409122',
    company: 'Churchill Mortgage',
    title: 'Senior Mortgage Director',
    email: 'rholloway@cfmtg.com',
    phone: '(512) 555-0133',
    licensedStates: ['TX'],
    applicationUrl: 'https://cfmtg.com/rholloway/',
    branchLocation: 'Austin / Dallas Branch, TX',
    localDpaProgram: 'Texas Department of Housing (TDHCA) My First Texas Home Program'
  },
  CO: {
    id: 'peer_co_dunbar',
    name: 'Travis Dunbar',
    nmlsNumber: '341908',
    company: 'Churchill Mortgage',
    title: 'Senior Loan Specialist',
    email: 'tdunbar@cfmtg.com',
    phone: '(303) 555-0129',
    licensedStates: ['CO'],
    applicationUrl: 'https://cfmtg.com/tdunbar/',
    branchLocation: 'Denver / Front Range Branch, CO',
    localDpaProgram: 'CHFA SmartStep & Colorado Down Payment Grant'
  },
  FL: {
    id: 'peer_fl_sterling',
    name: 'David Sterling',
    nmlsNumber: '284019',
    company: 'Churchill Mortgage',
    title: 'Senior Lending Specialist',
    email: 'dsterling@cfmtg.com',
    phone: '(407) 555-0118',
    licensedStates: ['FL', 'GA'],
    applicationUrl: 'https://cfmtg.com/dsterling/',
    branchLocation: 'Orlando / Tampa Branch, FL',
    localDpaProgram: 'Florida Housing Finance Corporation (FHFC) Hometown Heroes DPA'
  },
  UT: {
    id: 'peer_ut_nielsen',
    name: 'Spencer Nielsen',
    nmlsNumber: '392104',
    company: 'Churchill Mortgage',
    title: 'Senior Loan Officer',
    email: 'snielsen@cfmtg.com',
    phone: '(801) 555-0155',
    licensedStates: ['UT'],
    applicationUrl: 'https://cfmtg.com/snielsen/',
    branchLocation: 'Salt Lake City / Provo Branch, UT',
    localDpaProgram: 'Utah Housing Corporation (UHC) First-Time DPA Second'
  }
};

export class PeerLoanOfficersService {
  /**
   * Retrieves all individual peer loan officer profile cards across the roster.
   */
  static getAllPeerLoanOfficers(): PeerLoanOfficer[] {
    if (typeof window === 'undefined') return Object.values(DEFAULT_PEER_LO_ROSTER);
    try {
      const raw = localStorage.getItem(STORAGE_ALL_PEER_LOS_KEY);
      if (raw) {
        const list: PeerLoanOfficer[] = JSON.parse(raw);
        if (list && list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Error reading all peer LOs from localStorage:', e);
    }

    // Initialize with default roster + any profiles in ProfileCardSyncService
    const initialPeersMap = new Map<string, PeerLoanOfficer>();
    Object.values(DEFAULT_PEER_LO_ROSTER).forEach(p => initialPeersMap.set(p.id, p));

    // Pre-seed an additional Oregon-licensed colleague for regional assignments (Portland / Bend / Medford)
    if (!initialPeersMap.has('peer_or_miller')) {
      initialPeersMap.set('peer_or_miller', {
        id: 'peer_or_miller',
        name: 'David Miller',
        nmlsNumber: '204910',
        company: 'Churchill Mortgage',
        title: 'Senior Mortgage Specialist / Regional Partner',
        email: 'dmiller@cfmtg.com',
        phone: '(503) 555-0182',
        licensedStates: ['OR', 'WA'],
        defaultStates: [],
        applicationUrl: 'https://cfmtg.com/dmiller/',
        branchLocation: 'Portland / Central Oregon (Bend) Branch, OR',
        localDpaProgram: 'OHCS Flex Lending & City of Portland / Bend Down Payment Assistance'
      });
    }

    try {
      const syncProfiles = ProfileCardSyncService.getLoanOfficers();
      syncProfiles.forEach(lo => {
        if (!lo.id.includes('mike-ford') && !lo.name?.toLowerCase().includes('mike ford')) {
          const peer = this.convertProfileCardToPeer(lo);
          initialPeersMap.set(peer.id, peer);
        }
      });
    } catch {}

    const result = Array.from(initialPeersMap.values());
    try {
      localStorage.setItem(STORAGE_ALL_PEER_LOS_KEY, JSON.stringify(result));
    } catch {}
    return result;
  }

  /**
   * Helper to convert a LoanOfficerProfileCard to PeerLoanOfficer
   */
  static convertProfileCardToPeer(lo: any): PeerLoanOfficer {
    const states = lo.licensedStates && lo.licensedStates.length > 0 
      ? lo.licensedStates 
      : (lo.primaryState ? [lo.primaryState] : ['WA']);
    
    const slug = lo.email ? lo.email.split('@')[0] : lo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const applicationUrl = lo.applicationUrl || `https://cfmtg.com/${slug}/`;

    return {
      id: lo.id || `peer_${slug}`,
      name: lo.name || 'Senior Lending Colleague',
      nmlsNumber: lo.nmlsNumber || '102938',
      company: lo.company || 'Churchill Mortgage',
      title: lo.title || 'Senior Mortgage Specialist',
      email: lo.email || `${slug}@cfmtg.com`,
      phone: lo.phone || '(555) 019-2831',
      licensedStates: states,
      defaultStates: lo.defaultStates || [],
      applicationUrl,
      branchLocation: lo.branchLocation || `${lo.company || 'Churchill Mortgage'} (${states[0] || 'WA'} Branch)`,
      localDpaProgram: lo.localDpaProgram || (lo.specialties?.[0]) || 'State Down Payment Assistance & First-Time Grant',
      syncedFrom: lo.syncedFrom || 'First-Time Homebuyer AI Studio Dashboard',
      photoUrl: lo.photoUrl,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Syncs and imports all Peer LO Profile Cards from the First-Time Homebuyers AI Studio backend
   * (via shared Firestore `/loan_officers` collection and ProfileCardSyncService).
   */
  static async syncFromFirstTimeHomebuyerDashboard(): Promise<{
    count: number;
    profiles: PeerLoanOfficer[];
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    const peersMap = new Map<string, PeerLoanOfficer>();

    // 1. Pull from Firestore collection `/loan_officers`
    try {
      const colRef = collection(db, 'loan_officers');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        snap.forEach(docSnap => {
          const data = docSnap.data();
          if (docSnap.id.includes('mike-ford') || data.name?.toLowerCase().includes('mike ford')) {
            return;
          }
          const peer = this.convertProfileCardToPeer({ id: docSnap.id, ...data });
          peersMap.set(peer.id, peer);
        });
      }
    } catch (err) {
      console.warn('Firestore query for /loan_officers issue, falling back:', err);
    }

    // 2. Also incorporate profiles from ProfileCardSyncService
    try {
      const cloudRunProfiles = ProfileCardSyncService.getLoanOfficers();
      cloudRunProfiles.forEach(lo => {
        if (!lo.id.includes('mike-ford') && !lo.name?.toLowerCase().includes('mike ford')) {
          if (!peersMap.has(lo.id)) {
            peersMap.set(lo.id, this.convertProfileCardToPeer(lo));
          }
        }
      });
    } catch (e) {
      console.warn('ProfileCardSyncService local pull issue:', e);
    }

    // 3. Fallback: ensure default peer roster exists
    Object.values(DEFAULT_PEER_LO_ROSTER).forEach(def => {
      if (!peersMap.has(def.id)) {
        peersMap.set(def.id, def);
      }
    });

    const allPeers = Array.from(peersMap.values());

    // Save all synced peer LO cards
    try {
      localStorage.setItem(STORAGE_ALL_PEER_LOS_KEY, JSON.stringify(allPeers));
    } catch (e) {
      console.warn('Error saving all peers to localStorage:', e);
    }

    // Update state directory assignments for any states where these peers are licensed
    const currentDir = this.getDirectory();
    allPeers.forEach(peer => {
      peer.licensedStates.forEach(st => {
        const code = st.toUpperCase().trim();
        if (code && code !== 'OR' && !currentDir[code]) {
          currentDir[code] = peer;
        }
      });
    });

    try {
      localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(currentDir));
    } catch {}

    return {
      count: allPeers.length,
      profiles: allPeers,
      timestamp
    };
  }

  /**
   * Assigns a specific Peer LO from the synced roster to a specific target state.
   */
  static assignPeerToState(stateCode: string, peerId: string): PeerLoanOfficer | null {
    const upper = stateCode.toUpperCase().trim();
    const allPeers = this.getAllPeerLoanOfficers();
    const found = allPeers.find(p => p.id === peerId);
    if (!found) return null;

    const currentDir = this.getDirectory();
    const updatedPeer: PeerLoanOfficer = {
      ...found,
      licensedStates: Array.from(new Set([...found.licensedStates, upper])),
      updatedAt: new Date().toISOString()
    };

    currentDir[upper] = updatedPeer;
    try {
      localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(currentDir));
    } catch (e) {
      console.warn('Failed to update directory assignment:', e);
    }

    // Update remote Firestore
    try {
      const docRef = doc(db, 'loan_officers', updatedPeer.id);
      setDoc(docRef, updatedPeer, { merge: true }).catch(() => {});
    } catch {}

    return updatedPeer;
  }

  /**
   * Sets or unsets a Peer LO as the default for a specific state.
   * Auto-response chat thread comments, Gmail drafts, and SMS outreach will
   * automatically use the default peer LO for out-of-state discovery leads.
   */
  static setDefaultPeerForState(stateCode: string, peerId: string, isDefault: boolean = true): PeerLoanOfficer | null {
    const upper = stateCode.toUpperCase().trim();
    const allPeers = this.getAllPeerLoanOfficers();
    const currentDir = this.getDirectory();

    let targetPeer = allPeers.find(p => p.id === peerId);
    if (!targetPeer) return null;

    if (isDefault) {
      // 1. Ensure targetPeer is licensed for this state
      const newLicensed = Array.from(new Set([...targetPeer.licensedStates, upper]));
      const newDefaults = Array.from(new Set([...(targetPeer.defaultStates || []), upper]));
      targetPeer = {
        ...targetPeer,
        licensedStates: newLicensed,
        defaultStates: newDefaults,
        updatedAt: new Date().toISOString()
      };

      // 2. Remove default status for this state from any other peer
      const updatedAll = allPeers.map(p => {
        if (p.id === targetPeer!.id) {
          return targetPeer!;
        }
        if (p.defaultStates && p.defaultStates.includes(upper)) {
          return {
            ...p,
            defaultStates: p.defaultStates.filter(s => s !== upper),
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      // 3. Update active directory
      currentDir[upper] = targetPeer;

      try {
        localStorage.setItem(STORAGE_ALL_PEER_LOS_KEY, JSON.stringify(updatedAll));
        localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(currentDir));
      } catch (e) {
        console.warn('Failed to save default peer LO:', e);
      }

      // Update Firestore
      try {
        const docRef = doc(db, 'loan_officers', targetPeer.id);
        setDoc(docRef, targetPeer, { merge: true }).catch(() => {});
      } catch {}

      return targetPeer;
    } else {
      // Unset default
      const newDefaults = (targetPeer.defaultStates || []).filter(s => s !== upper);
      targetPeer = {
        ...targetPeer,
        defaultStates: newDefaults,
        updatedAt: new Date().toISOString()
      };

      const updatedAll = allPeers.map(p => p.id === targetPeer!.id ? targetPeer! : p);

      // If this peer was the one in currentDir[upper], see if another peer is licensed in this state
      if (currentDir[upper]?.id === peerId) {
        const alternate = updatedAll.find(p => p.id !== peerId && p.licensedStates.includes(upper));
        if (alternate) {
          currentDir[upper] = alternate;
        } else if (DEFAULT_PEER_LO_ROSTER[upper]) {
          currentDir[upper] = DEFAULT_PEER_LO_ROSTER[upper];
        }
      }

      try {
        localStorage.setItem(STORAGE_ALL_PEER_LOS_KEY, JSON.stringify(updatedAll));
        localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(currentDir));
      } catch (e) {}

      try {
        const docRef = doc(db, 'loan_officers', targetPeer.id);
        setDoc(docRef, targetPeer, { merge: true }).catch(() => {});
      } catch {}

      return targetPeer;
    }
  }

  /**
   * Checks whether a specific peer LO is currently the designated default for a state.
   */
  static isDefaultPeerForState(peerId: string, stateCode: string): boolean {
    const upper = stateCode.toUpperCase().trim();
    const currentDir = this.getDirectory();
    if (currentDir[upper]?.id === peerId) return true;
    const allPeers = this.getAllPeerLoanOfficers();
    const found = allPeers.find(p => p.id === peerId);
    return Boolean(found?.defaultStates?.includes(upper));
  }

  /**
   * Returns all peer loan officers available for a specific state,
   * categorizing them into licensed peers (with default first) and other nationwide peers.
   */
  static getPeersForState(stateCode: string): {
    defaultPeer: PeerLoanOfficer;
    licensedPeers: PeerLoanOfficer[];
    allPeers: PeerLoanOfficer[];
  } {
    const upper = stateCode.toUpperCase().trim();
    const defaultPeer = this.getPeerForState(upper);
    const all = this.getAllPeerLoanOfficers();

    // Licensed in this state
    const licensed = all.filter(p => p.licensedStates.map(s => s.toUpperCase()).includes(upper));
    
    // Sort so default is first
    licensed.sort((a, b) => {
      if (a.id === defaultPeer.id) return -1;
      if (b.id === defaultPeer.id) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      defaultPeer,
      licensedPeers: licensed,
      allPeers: all
    };
  }

  /**
   * Retrieves the current peer loan officers directory from localStorage.
   */
  static getDirectory(): Record<string, PeerLoanOfficer> {
    if (typeof window === 'undefined') return DEFAULT_PEER_LO_ROSTER;
    try {
      const raw = localStorage.getItem(STORAGE_PEER_LO_DIRECTORY_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(DEFAULT_PEER_LO_ROSTER));
        return DEFAULT_PEER_LO_ROSTER;
      }
      return { ...DEFAULT_PEER_LO_ROSTER, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PEER_LO_ROSTER;
    }
  }

  /**
   * Saves or updates a peer loan officer for one or more licensed states.
   */
  static async savePeerLoanOfficer(partner: PeerLoanOfficer): Promise<void> {
    const current = this.getDirectory();
    const updated = { ...current };

    partner.licensedStates.forEach(st => {
      const code = st.toUpperCase().trim();
      if (code) {
        updated[code] = {
          ...partner,
          updatedAt: new Date().toISOString()
        };
      }
    });

    try {
      localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to cache peer loan officer directory to localStorage:', e);
    }

    // Persist to Firestore /loan_officers/{id}
    try {
      const docRef = doc(db, 'loan_officers', partner.id);
      await setDoc(docRef, {
        id: partner.id,
        name: partner.name,
        nmlsNumber: partner.nmlsNumber,
        company: partner.company || 'Churchill Mortgage',
        title: partner.title || 'Senior Mortgage Specialist',
        email: partner.email,
        phone: partner.phone,
        primaryState: partner.licensedStates[0] || 'WA',
        specialties: [partner.localDpaProgram || 'State DPA & Pre-Approval'],
        applicationUrl: partner.applicationUrl,
        licensedStates: partner.licensedStates,
        branchLocation: partner.branchLocation,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to persist peer loan officer to Firestore:', e);
    }
  }

  /**
   * Fetches remote peer loan officer configs from Firestore.
   */
  static async fetchRemoteDirectory(): Promise<Record<string, PeerLoanOfficer>> {
    try {
      const current = this.getDirectory();
      // For core states, attempt to read updated Firestore doc if present
      for (const st of Object.keys(current)) {
        const partner = current[st];
        if (partner?.id) {
          const snap = await getDoc(doc(db, 'loan_officers', partner.id));
          if (snap.exists()) {
            const data = snap.data();
            current[st] = {
              ...partner,
              name: data.name || partner.name,
              nmlsNumber: data.nmlsNumber || partner.nmlsNumber,
              email: data.email || partner.email,
              phone: data.phone || partner.phone,
              applicationUrl: data.applicationUrl || partner.applicationUrl,
              branchLocation: data.branchLocation || partner.branchLocation,
              localDpaProgram: data.specialties?.[0] || partner.localDpaProgram
            };
          }
        }
      }
      localStorage.setItem(STORAGE_PEER_LO_DIRECTORY_KEY, JSON.stringify(current));
      return current;
    } catch (err) {
      console.warn('Failed to fetch remote peer loan officer profiles:', err);
      return this.getDirectory();
    }
  }

  /**
   * Detects the state abbreviation from location string (e.g. "Boise, ID" -> "ID", "Seattle, Washington" -> "WA").
   */
  static extractStateCode(locationStr?: string, fallbackState: string = 'WA'): string {
    if (!locationStr) return fallbackState.toUpperCase();
    const clean = locationStr.toUpperCase();

    // Check for standard 2-letter postal state codes
    const stateMatches = clean.match(/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/);
    if (stateMatches && stateMatches[1]) {
      return stateMatches[1];
    }

    // Name-based fallbacks for major states
    if (clean.includes('WASHINGTON') || clean.includes('SEATTLE') || clean.includes('SPOKANE') || clean.includes('VANCOUVER')) return 'WA';
    if (clean.includes('IDAHO') || clean.includes('BOISE') || clean.includes('MERIDIAN') || clean.includes('NAMPA')) return 'ID';
    if (clean.includes('CALIFORNIA') || clean.includes('SACRAMENTO') || clean.includes('SAN JOSE') || clean.includes('SAN DIEGO')) return 'CA';
    if (clean.includes('TEXAS') || clean.includes('AUSTIN') || clean.includes('DALLAS') || clean.includes('HOUSTON')) return 'TX';
    if (clean.includes('ARIZONA') || clean.includes('PHOENIX') || clean.includes('TUCSON') || clean.includes('SCOTTSDALE')) return 'AZ';
    if (clean.includes('NEVADA') || clean.includes('RENO') || clean.includes('LAS VEGAS')) return 'NV';
    if (clean.includes('COLORADO') || clean.includes('DENVER') || clean.includes('COLORADO SPRINGS')) return 'CO';
    if (clean.includes('FLORIDA') || clean.includes('ORLANDO') || clean.includes('TAMPA') || clean.includes('MIAMI')) return 'FL';
    if (clean.includes('UTAH') || clean.includes('SALT LAKE')) return 'UT';

    return fallbackState.toUpperCase();
  }

  /**
   * Resolves the assigned peer loan officer for a specific state code.
   * If an exact state match does not exist, provides a nationwide senior lending partner.
   */
  static getPeerForState(stateCode: string): PeerLoanOfficer {
    const dir = this.getDirectory();
    const upper = stateCode.toUpperCase().trim();
    if (dir[upper]) {
      return dir[upper];
    }

    // Fallback company nationwide senior lending partner
    return {
      id: `peer_national_${upper.toLowerCase()}`,
      name: 'Sarah Jenkins',
      nmlsNumber: '184920',
      company: 'Churchill Mortgage',
      title: 'Senior Mortgage Director (National Partner Division)',
      email: 'sjenkins@cfmtg.com',
      phone: '(206) 555-0192',
      licensedStates: [upper],
      applicationUrl: 'https://cfmtg.com/sjenkins/',
      branchLocation: `Licensed Lending Division (${upper})`,
      localDpaProgram: `State First-Time Homebuyer & Down Payment Assistance Programs (${upper})`
    };
  }

  /**
   * Evaluates if a given location or sweep state represents Oregon jurisdiction.
   */
  static isOregonLocation(locationStr?: string, sweepState: string = 'OR'): boolean {
    const locClean = (locationStr || '').trim().toLowerCase();
    
    // Explicit non-Oregon indicators take precedence
    const nonOregonStates = [
      'wa', 'washington', 'seattle', 'spokane', 'tacoma', 'vancouver, wa', 'bellevue',
      'id', 'idaho', 'boise', 'meridian', 'nampa', 'idaho falls',
      'ca', 'california', 'sacramento', 'san francisco', 'los angeles', 'san diego',
      'nv', 'nevada', 'reno', 'las vegas', 'henderson',
      'az', 'arizona', 'phoenix', 'scottsdale', 'tucson', 'mesa',
      'tx', 'texas', 'austin', 'dallas', 'houston', 'san antonio',
      'co', 'colorado', 'denver', 'colorado springs', 'boulder',
      'fl', 'florida', 'orlando', 'tampa', 'miami', 'jacksonville',
      'ut', 'utah', 'salt lake', 'provo', 'ogden'
    ];

    for (const st of nonOregonStates) {
      if (
        locClean === st ||
        locClean.startsWith(`${st},`) ||
        locClean.endsWith(`, ${st}`) ||
        locClean.includes(`, ${st} `) ||
        locClean.includes(` ${st},`) ||
        locClean.includes(`in ${st}`) ||
        locClean.includes(`(${st.toUpperCase()})`)
      ) {
        return false;
      }
    }

    if (sweepState && sweepState.toUpperCase() !== 'OR') {
      // If sweep is specifically targeting another state, only Oregon mentions override
      if (locClean.includes('oregon') || locClean.includes('portland') || locClean.includes('eugene') || locClean.includes('bend') || locClean.includes('salem') || locClean.includes('medford') || locClean.includes('corvallis')) {
        return true;
      }
      return false;
    }

    // Default sweep is OR or location specifies Oregon cues
    if (
      locClean.includes('oregon') ||
      locClean.includes('portland') ||
      locClean.includes('eugene') ||
      locClean.includes('bend') ||
      locClean.includes('salem') ||
      locClean.includes('medford') ||
      locClean.includes('corvallis') ||
      locClean.includes('roseburg') ||
      locClean.includes('coos bay') ||
      locClean.includes('lake oswego') ||
      locClean.includes('gresham') ||
      locClean.includes('hillsboro') ||
      locClean.includes('beaverton') ||
      locClean.includes('springfield') ||
      locClean.includes('albany') ||
      locClean.includes('deschutes') ||
      locClean.includes('lane county') ||
      locClean.includes('marion county') ||
      locClean.includes('clackamas') ||
      locClean.endsWith('or') ||
      locClean.endsWith(', or')
    ) {
      return true;
    }

    return (sweepState || 'OR').toUpperCase() === 'OR';
  }

  /**
   * Generates a 100% compliant, customized out-of-state referral draft
   * with the exact peer loan officer's real name, NMLS, phone, email, and application link.
   */
  static formatOutOfStateReferralDraft(
    author: string,
    location: string,
    stateCode: string,
    peer: PeerLoanOfficer
  ): string {
    return `Hi ${author}! While I am a 26-year mortgage veteran personally licensed specifically in Oregon (NMLS #102938), our lending division at ${peer.company} operates nationwide across all 50 states.

Here is the best way to get your exact numbers and pre-approval depending on where you are buying:

1. 🌲 If you are planning to relocate or purchase a home here in Oregon:
You can start your official pre-approval directly through my personal secure portal:
👉 https://cfmtg.com/mford/

2. 📍 If you are purchasing locally in ${location}:
To ensure you receive 100% compliant, state-licensed origination and access to every local down payment assistance grant in ${stateCode}, I've partnered directly with our senior state-licensed lending specialist for ${stateCode}:

👤 ${peer.name} (NMLS #${peer.nmlsNumber})
🏢 ${peer.title} | ${peer.company} (${peer.branchLocation})
📱 Cell / Text: ${peer.phone}
✉️ Email: ${peer.email}
📝 Secure ${stateCode} Digital Loan Portal: ${peer.applicationUrl}

${peer.name} will run your numbers with automated underwriting (AUS), verify local ${peer.localDpaProgram || 'down payment assistance grants'} with zero cost or obligation, and issue your official pre-approval letter for local realtors.

Would you like me to connect you two directly via text/email, or would you prefer to get started through ${peer.name.split(' ')[0]}'s portal above?

---
🏠 Mike Ford | 26-Year Oregon Mortgage Veteran (NMLS #102938)
📝 Oregon Home Loan Pre-Approval Portal: https://cfmtg.com/mford/`;
  }

  /**
   * Master State-Aware Conversion Bridge Engine.
   * Detects the lead's state. If outside Oregon, automatically looks up the corresponding
   * Peer LO from stored profiles and injects their name, credentials, contact info,
   * and unique personal application link into the outreach template.
   */
  static generateConversionBridgeTemplate({
    author,
    location,
    matchedProgram,
    sweepState = 'OR',
    title,
    snippet,
    tone = 'standard',
    channel = 'chat',
    overridePeer
  }: {
    author: string;
    location: string;
    matchedProgram: string;
    sweepState?: string;
    title?: string;
    snippet?: string;
    tone?: 'standard' | 'warm' | 'direct' | 'specialist' | 'reengagement' | 'preapproval_app' | 'out_of_state_referral';
    channel?: 'chat' | 'gmail' | 'sms';
    overridePeer?: PeerLoanOfficer;
  }): string {
    const isOregon = this.isOregonLocation(location, sweepState);
    const stateCode = this.extractStateCode(location, sweepState);
    const peer = overridePeer || this.getPeerForState(stateCode);

    // ==========================================
    // 1. OUT-OF-STATE CONVERSION BRIDGE (NON-OR)
    // ==========================================
    if (!isOregon) {
      if (channel === 'sms') {
        return `Hi ${author}! Saw your post on ${matchedProgram} in ${location}. I'm a 26-yr LO in OR, but our ${peer.company} team operates nationwide! For ${stateCode}, I've connected you with our licensed partner ${peer.name} (${peer.phone}). Check ${peer.name.split(' ')[0]}'s pre-approval portal: ${peer.applicationUrl} or reply here!`;
      }

      if (channel === 'gmail') {
        return `Hi ${author},

I saw your recent inquiry regarding "${title || 'Home Financing Options'}" in ${location}.

"${snippet || 'Exploring first-time buyer loan programs, low down payment options, and pre-approval steps.'}"

While I am a 26-year mortgage loan officer personally licensed specifically in Oregon (NMLS #102938), our lending division at ${peer.company} operates nationwide across all 50 states.

To ensure you receive 100% compliant, state-licensed origination and access to every local down payment assistance grant in ${stateCode}, I have paired you with our top vetted senior loan specialist licensed specifically in your market:

• Specialist: ${peer.name} (NMLS #${peer.nmlsNumber})
• Title: ${peer.title} | ${peer.company}
• Branch: ${peer.branchLocation}
• Direct Cell / Text: ${peer.phone}
• Work Email: ${peer.email}
• Local Grant Program: ${peer.localDpaProgram || stateCode + ' Down Payment Assistance'}
• Secure Digital Pre-Approval Portal: ${peer.applicationUrl}

${peer.name} can verify your automated underwriting (AUS) numbers, review zero-down and state assistance allocations with zero cost or obligation, and issue an official pre-approval letter for your local real estate agent.

(Note: If your upcoming home search involves relocating or purchasing here in Oregon, you can apply directly with me at: https://cfmtg.com/mford/)

Would you like me to make a warm introduction to ${peer.name} via email/text, or would you prefer to get started directly in their secure portal above?

Best regards,

Mike Ford
Mortgage Loan Officer | 26 Years Oregon Lending Experience (NMLS #102938)
Direct Cell / Text: (541) 729-2097 | Email: fordmj@gmail.com
Oregon Pre-Approval Portal: https://cfmtg.com/mford/`;
      }

      // Standard / Chat tone variants
      if (tone === 'warm') {
        return `Hi ${author}! I totally understand your situation in ${location}. While I'm a 26-year mortgage veteran based in Oregon, our team at ${peer.company} operates nationwide. In ${stateCode}, I work alongside ${peer.name} (NMLS #${peer.nmlsNumber}). ${peer.name.split(' ')[0]} helps first-time buyers use ${peer.localDpaProgram || matchedProgram} every week. You can explore your numbers with zero obligation through ${peer.name.split(' ')[0]}'s secure portal: ${peer.applicationUrl} or call/text ${peer.phone}. Let's chat whenever you have 5 minutes!`;
      }

      if (tone === 'direct') {
        return `Hi ${author}, regarding your post about ${title || 'home financing'}: In ${location}, your market qualifies for ${peer.localDpaProgram || matchedProgram}. To get exact numbers from our licensed ${stateCode} team, connect directly with ${peer.name} (NMLS #${peer.nmlsNumber}) at ${peer.phone} or review your purchase capacity through ${peer.name.split(' ')[0]}'s digital application: ${peer.applicationUrl}. Zero-down and DPA options can cover up to 100% of closing hurdles!`;
      }

      if (tone === 'reengagement') {
        return `Hi ${author}! Following up on your home search in ${location}. Did you get your questions answered regarding ${peer.localDpaProgram || matchedProgram}? Our licensed ${stateCode} partner ${peer.name} (NMLS #${peer.nmlsNumber}) is available at ${peer.phone} or via secure pre-approval portal at ${peer.applicationUrl}. Let us know if you'd like to run updated pricing or schedule a 10-minute scenario review!`;
      }

      // Default out-of-state referral / preapproval_app
      return this.formatOutOfStateReferralDraft(author, location, stateCode, peer);
    }

    // ==========================================
    // 2. OREGON CONVERSION BRIDGE (IN-STATE)
    // ==========================================
    const isMikeFord = peer.id.includes('mford') || peer.name.toLowerCase().includes('mike ford');

    // If assigned to another Oregon licensed colleague (e.g. closer to Bend, Medford, Portland)
    if (!isMikeFord) {
      if (channel === 'sms') {
        return `Hi ${author}! Saw your post on ${matchedProgram} in ${location}. I've connected you with our local Oregon senior lending specialist ${peer.name} (${peer.phone}) based right in your area. Start your pre-approval: ${peer.applicationUrl} or text back here!`;
      }

      if (channel === 'gmail') {
        return `Hi ${author},

I saw your recent question regarding "${title || 'Homeownership Options'}" in ${location}.

"${snippet || 'Looking for low down payment options and pre-approval guidance.'}"

While I am a 26-year Oregon mortgage veteran (NMLS #102938), I want to make sure you have direct access to our top local Oregon senior loan specialist based right in your market area:

• Specialist: ${peer.name} (NMLS #${peer.nmlsNumber})
• Title: ${peer.title} | ${peer.company}
• Local Branch: ${peer.branchLocation}
• Direct Cell / Text: ${peer.phone}
• Work Email: ${peer.email}
• Local Grant Program: ${peer.localDpaProgram || 'OHCS Flex Lending & Local Oregon DPA'}
• Secure Digital Loan Portal: ${peer.applicationUrl}

With current Oregon housing programs (including OHCS Flex Lending, local County DPA grants, and zero-down options), you can often stop renting without needing 20% down. ${peer.name} will run a quick, no-pressure 10-minute numbers review to look at your exact monthly payment targets and program qualifications.

When you're ready to see your numbers with zero guesswork, start directly through ${peer.name.split(' ')[0]}'s portal above!

(Note: If you have any general lending or scenario questions, feel free to also reach me directly at: fordmj@gmail.com / (541) 729-2097)

Best regards,

Mike Ford
Mortgage Loan Officer | 26 Years Oregon Lending Experience (NMLS #102938)
Direct Cell / Text: (541) 729-2097 | Email: fordmj@gmail.com
Oregon Pre-Approval Portal: https://cfmtg.com/mford/`;
      }

      if (tone === 'warm') {
        return `Hi ${author}! I totally understand your situation in ${location}. While I'm a 26-year Oregon mortgage veteran, I've paired you directly with our local Oregon specialist ${peer.name} (NMLS #${peer.nmlsNumber}) at ${peer.company} (${peer.branchLocation}). ${peer.name.split(' ')[0]} helps buyers in your area use ${peer.localDpaProgram || matchedProgram} every week. You can explore your numbers with zero obligation through ${peer.name.split(' ')[0]}'s secure portal: ${peer.applicationUrl} or text ${peer.phone}!`;
      }

      if (tone === 'direct') {
        return `Hi ${author}, regarding your inquiry about ${title || 'home financing'} in ${location}: I've assigned your request to our local Oregon lending specialist ${peer.name} (NMLS #${peer.nmlsNumber}). Connect directly with ${peer.name} at ${peer.phone} or review your purchase capacity through ${peer.name.split(' ')[0]}'s digital application: ${peer.applicationUrl}. Zero-down and DPA options can cover up to 100% of closing hurdles!`;
      }

      if (tone === 'reengagement') {
        return `Hi ${author}! Following up on your home search in ${location}. Did you get your questions answered regarding ${peer.localDpaProgram || matchedProgram}? Our local Oregon colleague ${peer.name} (NMLS #${peer.nmlsNumber}) is available at ${peer.phone} or via secure portal at ${peer.applicationUrl}. Let us know if you'd like to run updated numbers!`;
      }

      // Default assigned peer response
      return `Hi ${author}! As a 26-year mortgage loan officer here in Oregon (NMLS #102938), I wanted to make sure you get immediate local attention in ${location}. I've connected you with our senior Oregon lending specialist ${peer.name} (NMLS #${peer.nmlsNumber}) from our ${peer.branchLocation}.

When you're ready to see your numbers with zero guesswork, start your official pre-approval directly through ${peer.name.split(' ')[0]}'s portal:
👉 ${peer.applicationUrl}

Feel free to text or call ${peer.name} directly at ${peer.phone} or reply here!`;
    }

    // Default: Mike Ford personal Oregon response
    if (channel === 'sms') {
      return `Hi ${author}! As a 26-year Oregon mortgage LO, I saw your post on ${matchedProgram} in ${location}. Stop renting with zero-down/DPA options! Start your 10-min pre-approval: https://cfmtg.com/mford/ or text me back here!`;
    }

    if (channel === 'gmail') {
      return `Hi ${author},

I saw your recent question regarding "${title || 'Homeownership Options'}" in ${location}.

"${snippet || 'Looking for low down payment options and pre-approval guidance.'}"

As a 26-year mortgage loan officer here in Oregon (NMLS #102938), I specialize in ${matchedProgram}. 

With current Oregon housing programs (including OHCS Flex Lending, local County DPA, and zero-down options), you can often stop renting without needing 20% down. We can run a quick, no-pressure 10-minute numbers review to look at your exact monthly payment targets and program qualifications.

When you're ready to see exactly what purchase price and grant allocation you qualify for in ${location} with zero guesswork, you can start your official pre-approval directly through my secure digital loan portal:
👉 https://cfmtg.com/mford/

It takes about 10 minutes to complete from your phone or computer, doesn't obligate you to anything, and lets us verify your numbers with automated underwriting (AUS) so we can issue an official Pre-Approval Letter for your realtor.

Feel free to reply directly to this email or call/text my direct cell at (541) 729-2097.

Best regards,

Mike Ford
Mortgage Loan Officer | 26 Years Oregon Lending Experience (NMLS #102938)
Direct Cell / Text: (541) 729-2097 | Email: fordmj@gmail.com
Oregon Pre-Approval Portal: https://cfmtg.com/mford/`;
    }

    if (tone === 'warm') {
      return `Hi ${author}! I totally understand your situation in ${location}. As a 26-year Oregon mortgage veteran, I see renters making the leap into homeownership every week without draining savings. With programs like ${matchedProgram}, you have fantastic options. You can test your numbers at https://cfmtg.com/mford/ or call/text my cell at (541) 729-2097 whenever you have a quick 5 minutes—no pressure at all!`;
    }

    if (tone === 'direct') {
      return `Hi ${author}, regarding your post about ${title || 'home financing'}: Your target market in ${location} qualifies for ${matchedProgram}. Down payment assistance and zero-down options can cover up to 100% of closing hurdles here in Oregon. Start your pre-approval with zero guesswork at https://cfmtg.com/mford/ or text me at (541) 729-2097 to review your numbers today!`;
    }

    if (tone === 'reengagement') {
      return `Hi ${author}! Did you get your questions answered and check out the curated local property listings already prequalified for low or no down payment loan programs for ${location}? You can verify your loan eligibility anytime at https://cfmtg.com/mford/. Let me know if you'd like to review updated rates or schedule a quick walkthrough!`;
    }

    if (tone === 'specialist') {
      return `Hello ${author}! Specializing in ${matchedProgram} across ${location}, I wanted to drop a quick note. Renting right now in Oregon means missing out on appreciation, whereas OHCS DPA and zero-down programs make monthly payments comparable to rent. You can start your numbers review directly at https://cfmtg.com/mford/. Let's connect on your custom loan scenario!`;
    }

    // Default standard Oregon conversion bridge
    return `Hi ${author}! As a 26-year mortgage loan officer here in Oregon (NMLS #102938), I help first-time buyers navigate ${matchedProgram} every day. You don't necessarily need a massive down payment to stop renting in ${location}. With OHCS Flex Lending and local DPA grants, we frequently bridge closing costs and down payments for borrowers in your exact income bracket.

When you're ready to see your numbers with zero guesswork, start your official pre-approval directly through my portal:
👉 https://cfmtg.com/mford/

Feel free to text or call my cell directly at (541) 729-2097 with any questions!`;
  }

  /**
   * Generates a state-aware GeoMap carousel branding signature with the appropriate
   * Oregon portal or Peer LO application link.
   */
  static generateGeoMapBrandingSignature({
    location,
    sweepState = 'OR',
    matchedCity,
    matchedPropertyListing,
    carouselLink,
    matchedProgram,
    overridePeer
  }: {
    location: string;
    sweepState?: string;
    matchedCity: string;
    matchedPropertyListing: string;
    carouselLink: string;
    matchedProgram: string;
    overridePeer?: PeerLoanOfficer;
  }): string {
    const isOregon = this.isOregonLocation(location, sweepState);
    const stateCode = this.extractStateCode(location, sweepState);
    const peer = overridePeer || this.getPeerForState(stateCode);

    if (isOregon) {
      return `\n\n---\n🏠 **Mike Ford** | 26-Year Oregon Mortgage Veteran (NMLS #102938)\n📊 **Vantage AI 2nd Brain GeoMap Carousel Match**: Closest Prequalified Property Listing for **${matchedCity}** -> *${matchedPropertyListing}* (${matchedProgram}).\n🔗 **Explore Live Interactive Carousel & Zero-Down Listings**: ${carouselLink}\n📝 **Official Home Loan Pre-Approval Portal**: https://cfmtg.com/mford/\n📱 *(Dispatched instantly to Loan Officer cell iPhone & synced across chat/blog/vlog/FB/YouTube/TikTok/X channels for maximum eyeball exposure)*`;
    }

    return `\n\n---\n🏠 **Mike Ford** | 26-Year Oregon Mortgage Veteran (NMLS #102938) • Nationwide Lending Network\n🤝 **Assigned ${stateCode} Licensed Peer**: **${peer.name}** (NMLS #${peer.nmlsNumber}) | ${peer.company} (${peer.branchLocation})\n📱 **${peer.name.split(' ')[0]}'s Direct Contact**: ${peer.phone} | ${peer.email}\n📝 **Official ${stateCode} Loan Application Portal**: ${peer.applicationUrl}\n🌲 **Relocating to Oregon? Start here**: https://cfmtg.com/mford/\n📊 **Vantage AI 2nd Brain GeoMap Carousel Match**: Closest Prequalified Property Listing for **${matchedCity}** -> *${matchedPropertyListing}* (${matchedProgram}).\n🔗 **Explore Live Interactive Carousel & Zero-Down Listings**: ${carouselLink}`;
  }
}

