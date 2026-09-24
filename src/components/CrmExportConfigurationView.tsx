/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution: Mike Ford <fordmj@gmail.com>
 *
 * Vantage AI Studio - CRM Export Configuration Studio
 * Interactive Column Header Mapping, Hygiene Verification & Multi-CRM Exporter
 * Supports Total Expert, Big Purple Dot (BPD), BoldTrail (kvCORE), Salesforce & HubSpot
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Table, 
  FileText, 
  FileSpreadsheet,
  Code, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle, 
  Filter, 
  Layers, 
  ArrowRight,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  AlertTriangle,
  Zap,
  FileStack
} from 'lucide-react';
import { sanitizeToAscii, normalizeTotalExpertGroup, normalizeBoldTrailHashtags } from './LeadDatabaseCleanupTool';
import { 
  PreExportHygieneModal, 
  CsvHygieneValidatorTool, 
  validateCsvHygiene, 
  autoSanitizeCsvContent 
} from './CsvHygieneValidator';
import { CrmBatchProcessor } from './CrmBatchProcessor';

export type SupportedCrm = 
  | 'total_expert' 
  | 'total_expert_mortgage' 
  | 'big_purple_dot' 
  | 'bpd_encompass' 
  | 'boldtrail' 
  | 'salesforce' 
  | 'hubspot';

export interface ColumnMappingDefinition {
  id: string;
  crmHeader: string;
  vantageField: string;
  dataType: string;
  hygieneRule: string;
  requirement: 'mandatory' | 'recommended' | 'optional' | 'system_flag';
  sampleValue: string;
  description: string;
  enabled: boolean;
}

const CRM_DEFINITIONS: Record<SupportedCrm, {
  name: string;
  brandTitle: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  exportFilename: string;
  dropboxSubject?: string;
  officialDocUrl?: string;
  rules: Array<{ title: string; desc: string }>;
  defaultColumns: ColumnMappingDefinition[];
}> = {
  total_expert: {
    name: 'Total Expert CRM',
    brandTitle: 'Total Expert Standard CSV',
    badge: 'Official Training Standard',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    tagline: 'Standard contact & co-borrower schema strictly normalized to ASCII plaintext (1-127).',
    exportFilename: 'vantage_total_expert_standard_leads.csv',
    rules: [
      { title: 'Strict ASCII Encoding (1-127)', desc: 'Replaces Unicode smart quotes, em-dashes, and special characters that cause import rejection.' },
      { title: 'Comma-Separated Group Syntax', desc: 'Formats multiple groups without internal spaces (e.g. "Realtor,Past Client,Lead").' },
      { title: 'Mandatory Baseline Names', desc: 'Enforces distinct "first name" and "last name" baseline headers in Row 1.' }
    ],
    defaultColumns: [
      { id: 'te_first_name', crmHeader: 'first name', vantageField: 'firstName', dataType: 'String (ASCII)', hygieneRule: 'Strict ASCII sanitize', requirement: 'mandatory', sampleValue: 'Sarah', description: 'Primary contact first name', enabled: true },
      { id: 'te_last_name', crmHeader: 'last name', vantageField: 'lastName', dataType: 'String (ASCII)', hygieneRule: 'Strict ASCII sanitize', requirement: 'mandatory', sampleValue: 'Jenkins', description: 'Primary contact last name', enabled: true },
      { id: 'te_email', crmHeader: 'email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'sarah.jenkins@example.com', description: 'Primary email address', enabled: true },
      { id: 'te_phone', crmHeader: 'phone', vantageField: 'phone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'recommended', sampleValue: '(503) 555-0192', description: 'Primary contact phone number', enabled: true },
      { id: 'te_cell_phone', crmHeader: 'cell phone', vantageField: 'cellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'recommended', sampleValue: '(503) 555-0192', description: 'Mobile phone for SMS workflows', enabled: true },
      { id: 'te_group', crmHeader: 'Group', vantageField: 'group', dataType: 'Comma-delimited', hygieneRule: 'Zero-space comma list', requirement: 'recommended', sampleValue: 'Realtor,Past Client,VIP', description: 'Campaign groups & tag categories', enabled: true },
      { id: 'te_address', crmHeader: 'address', vantageField: 'address', dataType: 'String', hygieneRule: 'Title case street format', requirement: 'optional', sampleValue: '742 Evergreen Terrace', description: 'Street mailing address', enabled: true },
      { id: 'te_city', crmHeader: 'city', vantageField: 'city', dataType: 'String', hygieneRule: 'Title case standard', requirement: 'optional', sampleValue: 'Portland', description: 'Mailing city', enabled: true },
      { id: 'te_state', crmHeader: 'state', vantageField: 'state', dataType: 'State Code', hygieneRule: '2-letter uppercase', requirement: 'optional', sampleValue: 'OR', description: 'Mailing state / province', enabled: true },
      { id: 'te_zip', crmHeader: 'zip', vantageField: 'zip', dataType: 'Postal Code', hygieneRule: '5-digit clean zip', requirement: 'optional', sampleValue: '97201', description: 'ZIP or postal code', enabled: true },
      { id: 'te_spouse_first', crmHeader: 'spouse first name', vantageField: 'spouseFirstName', dataType: 'String', hygieneRule: 'Title case', requirement: 'optional', sampleValue: 'David', description: 'Co-borrower / spouse first name', enabled: true },
      { id: 'te_spouse_last', crmHeader: 'spouse last name', vantageField: 'spouseLastName', dataType: 'String', hygieneRule: 'Title case', requirement: 'optional', sampleValue: 'Jenkins', description: 'Co-borrower / spouse last name', enabled: true },
      { id: 'te_spouse_email', crmHeader: 'spouse email', vantageField: 'spouseEmail', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'optional', sampleValue: 'david.j@example.com', description: 'Co-borrower email address', enabled: true },
      { id: 'te_spouse_cell', crmHeader: 'spouse cell phone', vantageField: 'spouseCellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'optional', sampleValue: '(503) 555-0193', description: 'Co-borrower mobile phone', enabled: true }
    ]
  },
  total_expert_mortgage: {
    name: 'Total Expert CRM + Loan Data',
    brandTitle: 'Total Expert Mortgage & Active Loan Extended CSV',
    badge: 'Mortgage Active Pipeline',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    tagline: 'Extended mortgage loan pipeline schema including loan number, amounts, interest rates, and loan programs.',
    exportFilename: 'vantage_total_expert_mortgage_leads.csv',
    rules: [
      { title: 'Loan ID & Amount Pairing', desc: 'Maps exact loan numbers, loan amounts, and active interest rates.' },
      { title: 'Property Address Sanitization', desc: 'Subject property addresses mapped separately from primary borrower mailing addresses.' },
      { title: 'ASCII Plaintext Baseline', desc: 'Maintains Total Expert ASCII 1-127 character encoding across all mortgage notes.' }
    ],
    defaultColumns: [
      { id: 'tem_first_name', crmHeader: 'first name', vantageField: 'firstName', dataType: 'String (ASCII)', hygieneRule: 'Strict ASCII sanitize', requirement: 'mandatory', sampleValue: 'Marcus', description: 'Borrower first name', enabled: true },
      { id: 'tem_last_name', crmHeader: 'last name', vantageField: 'lastName', dataType: 'String (ASCII)', hygieneRule: 'Strict ASCII sanitize', requirement: 'mandatory', sampleValue: 'Vance', description: 'Borrower last name', enabled: true },
      { id: 'tem_email', crmHeader: 'email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'mvance@apex.io', description: 'Borrower email address', enabled: true },
      { id: 'tem_phone', crmHeader: 'phone', vantageField: 'phone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'recommended', sampleValue: '(541) 555-0841', description: 'Borrower primary phone', enabled: true },
      { id: 'tem_cell_phone', crmHeader: 'cell phone', vantageField: 'cellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'recommended', sampleValue: '(541) 555-0841', description: 'Borrower cell phone', enabled: true },
      { id: 'tem_group', crmHeader: 'Group', vantageField: 'group', dataType: 'Comma-delimited', hygieneRule: 'Zero-space comma list', requirement: 'recommended', sampleValue: 'PreApproved,FirstTimeBuyer,DPA', description: 'Lead tags & group pipelines', enabled: true },
      { id: 'tem_loan_num', crmHeader: 'loan number', vantageField: 'loanNumber', dataType: 'String', hygieneRule: 'Alphanumeric Loan ID', requirement: 'mandatory', sampleValue: 'LN-2026-9841', description: 'Origination loan number / Encompass ID', enabled: true },
      { id: 'tem_loan_amt', crmHeader: 'loan amount', vantageField: 'loanAmount', dataType: 'Currency', hygieneRule: '$XXX,XXX standard', requirement: 'mandatory', sampleValue: '$485,000', description: 'Total financed loan amount', enabled: true },
      { id: 'tem_rate', crmHeader: 'interest rate', vantageField: 'interestRate', dataType: 'Percentage', hygieneRule: 'X.XX% standard', requirement: 'recommended', sampleValue: '6.125%', description: 'Locked note rate', enabled: true },
      { id: 'tem_program', crmHeader: 'loan program', vantageField: 'loanProgram', dataType: 'String', hygieneRule: 'Standard product name', requirement: 'recommended', sampleValue: 'Conventional 30Y Fixed', description: 'Mortgage loan program / product', enabled: true },
      { id: 'tem_purpose', crmHeader: 'loan purpose', vantageField: 'loanPurpose', dataType: 'Enum', hygieneRule: 'Purchase / Refinance', requirement: 'recommended', sampleValue: 'Purchase', description: 'Loan purpose classification', enabled: true },
      { id: 'tem_prop_addr', crmHeader: 'property address', vantageField: 'propertyAddress', dataType: 'String', hygieneRule: 'Title case street format', requirement: 'optional', sampleValue: '1280 SW Crestview Blvd', description: 'Subject collateral property address', enabled: true }
    ]
  },
  big_purple_dot: {
    name: 'Big Purple Dot (BPD) CRM',
    brandTitle: 'Big Purple Dot Standard Auto-Mapping CSV',
    badge: 'Wizard Auto-Mapping',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    tagline: 'Standard Big Purple Dot schema configured for 100% automated column recognition in import wizard.',
    exportFilename: 'vantage_big_purple_dot_standard_leads.csv',
    rules: [
      { title: 'Strict Row 1 Header Position', desc: 'No blank rows, banner notes, or merged metadata cells prior to Row 1.' },
      { title: 'Discrete Phone & Mobile Columns', desc: 'Separates Phone and Mobile Phone into dedicated columns rather than pooled cells.' },
      { title: 'Auto-Pairing Header Nomenclature', desc: 'Column titles precisely match Big Purple Dot importer dictionary keywords.' }
    ],
    defaultColumns: [
      { id: 'bpd_first', crmHeader: 'First Name', vantageField: 'firstName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Elena', description: 'Lead first name', enabled: true },
      { id: 'bpd_last', crmHeader: 'Last Name', vantageField: 'lastName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Rostova', description: 'Lead last name', enabled: true },
      { id: 'bpd_email', crmHeader: 'Email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'elena.rostova@techmail.org', description: 'Lead primary email address', enabled: true },
      { id: 'bpd_phone', crmHeader: 'Phone', vantageField: 'phone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX format', requirement: 'recommended', sampleValue: '(503) 555-7744', description: 'Primary phone number', enabled: true },
      { id: 'bpd_mobile', crmHeader: 'Mobile Phone', vantageField: 'cellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX format', requirement: 'recommended', sampleValue: '(503) 555-7744', description: 'Discrete mobile phone for BPD SMS/Dialer', enabled: true },
      { id: 'bpd_address', crmHeader: 'Street Address', vantageField: 'address', dataType: 'String', hygieneRule: 'Normalized street suffix', requirement: 'optional', sampleValue: '450 NW Skyline Way', description: 'Primary physical address', enabled: true },
      { id: 'bpd_city', crmHeader: 'City', vantageField: 'city', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'optional', sampleValue: 'Beaverton', description: 'City name', enabled: true },
      { id: 'bpd_state', crmHeader: 'State', vantageField: 'state', dataType: 'State Code', hygieneRule: '2-letter uppercase', requirement: 'optional', sampleValue: 'OR', description: 'State abbreviation', enabled: true },
      { id: 'bpd_zip', crmHeader: 'Zip Code', vantageField: 'zip', dataType: 'Postal Code', hygieneRule: '5-digit clean zip', requirement: 'optional', sampleValue: '97005', description: 'Postal zip code', enabled: true },
      { id: 'bpd_source', crmHeader: 'Lead Source', vantageField: 'source', dataType: 'String', hygieneRule: 'Origin channel string', requirement: 'recommended', sampleValue: 'Zillow Premier / Open House', description: 'Lead marketing origin', enabled: true },
      { id: 'bpd_status', crmHeader: 'Status', vantageField: 'classification', dataType: 'Enum', hygieneRule: 'Standard BPD status', requirement: 'recommended', sampleValue: 'Active', description: 'Pipeline stage classification', enabled: true },
      { id: 'bpd_tags', crmHeader: 'Tags', vantageField: 'tags', dataType: 'Comma-delimited', hygieneRule: 'Clean tag string', requirement: 'recommended', sampleValue: 'Buyer,Pre-Approved,DPA Grant', description: 'Filtering tags', enabled: true },
      { id: 'bpd_agent', crmHeader: 'Assigned To', vantageField: 'assignedTo', dataType: 'String', hygieneRule: 'Loan officer / agent name', requirement: 'recommended', sampleValue: 'Mike Ford', description: 'Assigned user in Big Purple Dot', enabled: true },
      { id: 'bpd_notes', crmHeader: 'Notes', vantageField: 'notes', dataType: 'Text', hygieneRule: 'Plaintext notes', requirement: 'optional', sampleValue: 'Client looking for $500k single family in Washington County.', description: 'Initial contact summary notes', enabled: true }
    ]
  },
  bpd_encompass: {
    name: 'BPD + Encompass / ERDB Loan Schema',
    brandTitle: 'Big Purple Dot + Encompass ERDB Extended CSV',
    badge: 'Co-Borrower & ERDB',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300 border-fuchsia-300',
    tagline: 'Deep mortgage CRM mapping integrating primary borrower, co-borrower, and Encompass reporting loan attributes.',
    exportFilename: 'vantage_bpd_encompass_leads.csv',
    rules: [
      { title: 'Borrower & Co-Borrower Segregation', desc: 'Discretely captures Borrower and Co-Borrower emails, phones, and names.' },
      { title: 'Encompass ERDB Loan Keys', desc: 'Includes Loan Number, Loan Amount, and Loan Program matching Encompass database fields.' },
      { title: 'Clean Single Row Alignment', desc: 'Maintains flat tabular CSV output suitable for automated BPD webhook parsers.' }
    ],
    defaultColumns: [
      { id: 'bpde_bfirst', crmHeader: 'Borrower First Name', vantageField: 'firstName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Nathaniel', description: 'Primary borrower first name', enabled: true },
      { id: 'bpde_blast', crmHeader: 'Borrower Last Name', vantageField: 'lastName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Drake', description: 'Primary borrower last name', enabled: true },
      { id: 'bpde_email', crmHeader: 'Email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'nathaniel.drake@gmail.com', description: 'Primary email address', enabled: true },
      { id: 'bpde_phone', crmHeader: 'Phone', vantageField: 'phone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX format', requirement: 'recommended', sampleValue: '(503) 555-1994', description: 'Borrower phone', enabled: true },
      { id: 'bpde_mobile', crmHeader: 'Mobile Phone', vantageField: 'cellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX format', requirement: 'recommended', sampleValue: '(503) 555-1994', description: 'Borrower mobile phone', enabled: true },
      { id: 'bpde_street', crmHeader: 'Street Address', vantageField: 'address', dataType: 'String', hygieneRule: 'Title case street format', requirement: 'optional', sampleValue: '312 Oak Ridge Road', description: 'Property / mailing address', enabled: true },
      { id: 'bpde_city', crmHeader: 'City', vantageField: 'city', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'optional', sampleValue: 'Lake Oswego', description: 'City', enabled: true },
      { id: 'bpde_state', crmHeader: 'State', vantageField: 'state', dataType: 'State Code', hygieneRule: '2-letter uppercase', requirement: 'optional', sampleValue: 'OR', description: 'State', enabled: true },
      { id: 'bpde_zip', crmHeader: 'Zip Code', vantageField: 'zip', dataType: 'Postal Code', hygieneRule: '5-digit clean zip', requirement: 'optional', sampleValue: '97034', description: 'Zip code', enabled: true },
      { id: 'bpde_cb_first', crmHeader: 'Co-Borrower First Name', vantageField: 'spouseFirstName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'optional', sampleValue: 'Elena', description: 'Co-borrower first name', enabled: true },
      { id: 'bpde_cb_last', crmHeader: 'Co-Borrower Last Name', vantageField: 'spouseLastName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'optional', sampleValue: 'Fisher', description: 'Co-borrower last name', enabled: true },
      { id: 'bpde_cb_email', crmHeader: 'Co-Borrower Email', vantageField: 'spouseEmail', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'optional', sampleValue: 'elena.f@gmail.com', description: 'Co-borrower email', enabled: true },
      { id: 'bpde_cb_phone', crmHeader: 'Co-Borrower Phone', vantageField: 'spouseCellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX format', requirement: 'optional', sampleValue: '(503) 555-1995', description: 'Co-borrower mobile phone', enabled: true },
      { id: 'bpde_loan_num', crmHeader: 'Loan Number', vantageField: 'loanNumber', dataType: 'String', hygieneRule: 'Encompass Loan Key', requirement: 'mandatory', sampleValue: 'ENC-884019', description: 'Encompass mortgage loan number', enabled: true },
      { id: 'bpde_loan_amt', crmHeader: 'Loan Amount', vantageField: 'loanAmount', dataType: 'Currency', hygieneRule: '$XXX,XXX format', requirement: 'mandatory', sampleValue: '$620,000', description: 'Total active loan amount', enabled: true },
      { id: 'bpde_program', crmHeader: 'Loan Program', vantageField: 'loanProgram', dataType: 'String', hygieneRule: 'Product name', requirement: 'recommended', sampleValue: 'FHA 30Y Standard', description: 'Mortgage loan program description', enabled: true }
    ]
  },
  boldtrail: {
    name: 'BoldTrail CRM (kvCORE)',
    brandTitle: 'BoldTrail Lead Dropbox & Bulk CSV Import Template',
    badge: 'Inside Real Estate',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
    tagline: 'Official Inside Real Estate Lead Dropbox CSV column ordering with pipe-delimited hashtags and opt-in flags.',
    exportFilename: 'vantage_boldtrail_compliant_leads.csv',
    dropboxSubject: 'New Lead CSV',
    officialDocUrl: 'https://help.insiderealestate.com/en/articles/3420175-boldtrail-lead-dropbox-csv-import',
    rules: [
      { title: 'Exact Template Column Match', desc: 'Headers must match official Lead Dropbox column names in exact order without renaming.' },
      { title: 'Pipe-Delimited Hashtags (|)', desc: 'Hashtags formatted as tag1|tag2|tag3 strictly without the pound (#) symbol.' },
      { title: 'Explicit Opt-In Flags = "true"', desc: 'email_optin, phone_optin, and text_optin must be "true" to prevent automatic lead unsubscription.' },
      { title: 'Email Subject: "New Lead CSV"', desc: 'When emailing directly into BoldTrail Lead Dropbox, email subject must be "New Lead CSV".' }
    ],
    defaultColumns: [
      { id: 'bt_first_name', crmHeader: 'first_name', vantageField: 'firstName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Alexander', description: 'Lead first name', enabled: true },
      { id: 'bt_last_name', crmHeader: 'last_name', vantageField: 'lastName', dataType: 'String', hygieneRule: 'Proper title case', requirement: 'mandatory', sampleValue: 'Hayes', description: 'Lead last name (surname)', enabled: true },
      { id: 'bt_email', crmHeader: 'email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'ahayes@northwestgroup.com', description: 'Primary email address', enabled: true },
      { id: 'bt_cell_1', crmHeader: 'cell_phone_1', vantageField: 'cellPhone', dataType: 'Phone', hygieneRule: '(XXX) XXX-XXXX standard', requirement: 'mandatory', sampleValue: '(503) 555-3881', description: 'Primary mobile number for automated smart campaigns', enabled: true },
      { id: 'bt_cell_2', crmHeader: 'cell_phone_2', vantageField: 'phone', dataType: 'Phone', hygieneRule: 'Optional second cell', requirement: 'optional', sampleValue: '', description: 'Secondary cell phone number', enabled: true },
      { id: 'bt_home_phone', crmHeader: 'home_phone', vantageField: 'homePhone', dataType: 'Phone', hygieneRule: 'Landline phone', requirement: 'optional', sampleValue: '(503) 555-3880', description: 'Home landline phone number', enabled: true },
      { id: 'bt_work_phone', crmHeader: 'work_phone', vantageField: 'officePhone', dataType: 'Phone', hygieneRule: 'Office extension', requirement: 'optional', sampleValue: '', description: 'Workplace phone number', enabled: true },
      { id: 'bt_address', crmHeader: 'primary_address', vantageField: 'address', dataType: 'String', hygieneRule: 'Street address', requirement: 'optional', sampleValue: '1840 Willamette Falls Dr', description: 'Primary street address', enabled: true },
      { id: 'bt_city', crmHeader: 'primary_city', vantageField: 'city', dataType: 'String', hygieneRule: 'City name', requirement: 'optional', sampleValue: 'West Linn', description: 'Primary city', enabled: true },
      { id: 'bt_state', crmHeader: 'primary_state', vantageField: 'state', dataType: 'State Code', hygieneRule: '2-letter state code', requirement: 'optional', sampleValue: 'OR', description: 'Primary state', enabled: true },
      { id: 'bt_zip', crmHeader: 'primary_zip', vantageField: 'zip', dataType: 'Postal Code', hygieneRule: '5-digit zip code', requirement: 'optional', sampleValue: '97068', description: 'Primary postal zip code', enabled: true },
      { id: 'bt_lead_type', crmHeader: 'lead_type', vantageField: 'leadType', dataType: 'Enum', hygieneRule: 'Buyer / Seller / Renter', requirement: 'recommended', sampleValue: 'Buyer', description: 'Type of lead persona', enabled: true },
      { id: 'bt_lead_status', crmHeader: 'lead_status', vantageField: 'classification', dataType: 'Enum', hygieneRule: 'New Lead / Active / Client / Closed', requirement: 'recommended', sampleValue: 'Active Lead', description: 'Pipeline lifecycle status', enabled: true },
      { id: 'bt_deal_type', crmHeader: 'deal_type', vantageField: 'loanPurpose', dataType: 'Enum', hygieneRule: 'Purchase / Refinance', requirement: 'recommended', sampleValue: 'Purchase', description: 'Deal objective classification', enabled: true },
      { id: 'bt_hashtags', crmHeader: 'hashtags', vantageField: 'tags', dataType: 'Pipe-delimited', hygieneRule: 'Pipe separated, no # symbol', requirement: 'recommended', sampleValue: 'Realtor|FirstTimeBuyer|OregonDPA', description: 'BoldTrail search & trigger hashtags', enabled: true },
      { id: 'bt_email_optin', crmHeader: 'email_optin', vantageField: 'optIn', dataType: 'Boolean Flag', hygieneRule: 'Strictly "true"', requirement: 'system_flag', sampleValue: 'true', description: 'Prevents automatic unsubscription', enabled: true },
      { id: 'bt_phone_optin', crmHeader: 'phone_optin', vantageField: 'optIn', dataType: 'Boolean Flag', hygieneRule: 'Strictly "true"', requirement: 'system_flag', sampleValue: 'true', description: 'Enables outbound dialer', enabled: true },
      { id: 'bt_text_optin', crmHeader: 'text_optin', vantageField: 'optIn', dataType: 'Boolean Flag', hygieneRule: 'Strictly "true"', requirement: 'system_flag', sampleValue: 'true', description: 'Enables SMS text messaging automation', enabled: true },
      { id: 'bt_agent', crmHeader: 'assigned_agent', vantageField: 'assignedTo', dataType: 'String', hygieneRule: 'Agent name or email', requirement: 'recommended', sampleValue: 'Mike Ford', description: 'Assigned BoldTrail agent / lender', enabled: true },
      { id: 'bt_note', crmHeader: 'note', vantageField: 'notes', dataType: 'Text', hygieneRule: 'Lead history notes', requirement: 'optional', sampleValue: 'Looking for 4 bedroom single family home in West Linn school district.', description: 'Initial contact notes', enabled: true },
      { id: 'bt_source', crmHeader: 'source', vantageField: 'source', dataType: 'String', hygieneRule: 'Lead channel source', requirement: 'optional', sampleValue: 'Lead Dropbox / GeoMap MLS', description: 'Source tracking identifier', enabled: true }
    ]
  },
  salesforce: {
    name: 'Salesforce CRM',
    brandTitle: 'Salesforce Lead Standard Object CSV',
    badge: 'Enterprise Standard',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
    tagline: 'Standard Salesforce Lead object schema for Data Loader and Import Wizard.',
    exportFilename: 'vantage_salesforce_leads.csv',
    rules: [
      { title: 'Standard API Field Names', desc: 'Headers match standard Lead object fields (FirstName, LastName, MailingStreet, LeadSource).' },
      { title: 'Company Name Baseline', desc: 'Defaults Company to client employer name or individual designation.' }
    ],
    defaultColumns: [
      { id: 'sf_first', crmHeader: 'FirstName', vantageField: 'firstName', dataType: 'String', hygieneRule: 'Title case', requirement: 'mandatory', sampleValue: 'Jonathan', description: 'Lead first name', enabled: true },
      { id: 'sf_last', crmHeader: 'LastName', vantageField: 'lastName', dataType: 'String', hygieneRule: 'Title case', requirement: 'mandatory', sampleValue: 'Reid', description: 'Lead last name', enabled: true },
      { id: 'sf_phone', crmHeader: 'Phone', vantageField: 'phone', dataType: 'Phone', hygieneRule: 'Standard phone', requirement: 'recommended', sampleValue: '(503) 555-6677', description: 'Business or mobile phone', enabled: true },
      { id: 'sf_email', crmHeader: 'Email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'jreid@vanguard.io', description: 'Lead email', enabled: true },
      { id: 'sf_company', crmHeader: 'Company', vantageField: 'company', dataType: 'String', hygieneRule: 'Company / Employer', requirement: 'mandatory', sampleValue: 'Reid Design Works', description: 'Lead employer or company name', enabled: true },
      { id: 'sf_source', crmHeader: 'LeadSource', vantageField: 'source', dataType: 'String', hygieneRule: 'Lead source', requirement: 'recommended', sampleValue: 'Web Capture', description: 'Salesforce LeadSource field', enabled: true },
      { id: 'sf_street', crmHeader: 'MailingStreet', vantageField: 'address', dataType: 'String', hygieneRule: 'Street address', requirement: 'optional', sampleValue: '1000 SW Broadway', description: 'Mailing street', enabled: true },
      { id: 'sf_city', crmHeader: 'MailingCity', vantageField: 'city', dataType: 'String', hygieneRule: 'City name', requirement: 'optional', sampleValue: 'Portland', description: 'Mailing city', enabled: true },
      { id: 'sf_state', crmHeader: 'MailingState', vantageField: 'state', dataType: 'State Code', hygieneRule: '2-letter state code', requirement: 'optional', sampleValue: 'OR', description: 'Mailing state', enabled: true },
      { id: 'sf_zip', crmHeader: 'MailingPostalCode', vantageField: 'zip', dataType: 'Postal Code', hygieneRule: 'Postal code', requirement: 'optional', sampleValue: '97205', description: 'Mailing postal code', enabled: true }
    ]
  },
  hubspot: {
    name: 'HubSpot CRM',
    brandTitle: 'HubSpot Contact Object CSV',
    badge: 'Marketing & Sales',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    tagline: 'Standard HubSpot Contact schema for 1-click contact database import.',
    exportFilename: 'vantage_hubspot_contacts.csv',
    rules: [
      { title: 'Standard Contact Properties', desc: 'Uses standard HubSpot contact property names (First Name, Last Name, Email, Lead Status).' }
    ],
    defaultColumns: [
      { id: 'hs_first', crmHeader: 'First Name', vantageField: 'firstName', dataType: 'String', hygieneRule: 'Title case', requirement: 'mandatory', sampleValue: 'Claire', description: 'First name', enabled: true },
      { id: 'hs_last', crmHeader: 'Last Name', vantageField: 'lastName', dataType: 'String', hygieneRule: 'Title case', requirement: 'mandatory', sampleValue: 'Redfield', description: 'Last name', enabled: true },
      { id: 'hs_email', crmHeader: 'Email', vantageField: 'email', dataType: 'Email', hygieneRule: 'Lowercase trim', requirement: 'mandatory', sampleValue: 'claire.r@terrasave.org', description: 'Contact email', enabled: true },
      { id: 'hs_phone', crmHeader: 'Phone Number', vantageField: 'phone', dataType: 'Phone', hygieneRule: 'Phone format', requirement: 'recommended', sampleValue: '(503) 555-8822', description: 'Phone number', enabled: true },
      { id: 'hs_company', crmHeader: 'Company Name', vantageField: 'company', dataType: 'String', hygieneRule: 'Company name', requirement: 'optional', sampleValue: 'TerraSave Global', description: 'Associated company', enabled: true },
      { id: 'hs_status', crmHeader: 'Lead Status', vantageField: 'classification', dataType: 'Enum', hygieneRule: 'HubSpot lifecycle stage', requirement: 'recommended', sampleValue: 'IN_PROGRESS', description: 'HubSpot lead status', enabled: true },
      { id: 'hs_city', crmHeader: 'City', vantageField: 'city', dataType: 'String', hygieneRule: 'City name', requirement: 'optional', sampleValue: 'Bend', description: 'Contact city', enabled: true }
    ]
  }
};

export const CrmExportConfigurationView: React.FC = () => {
  const [selectedCrm, setSelectedCrm] = useState<SupportedCrm>('total_expert');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'matrix' | 'table_preview' | 'raw_csv' | 'validator' | 'batch_processor' | 'json_schema'>('matrix');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPreExportModalOpen, setIsPreExportModalOpen] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Column toggle state per CRM
  const [columnStates, setColumnStates] = useState<Record<SupportedCrm, ColumnMappingDefinition[]>>(() => {
    const initial: Record<string, ColumnMappingDefinition[]> = {};
    (Object.keys(CRM_DEFINITIONS) as SupportedCrm[]).forEach((crmKey) => {
      initial[crmKey] = CRM_DEFINITIONS[crmKey].defaultColumns.map(c => ({ ...c }));
    });
    return initial as Record<SupportedCrm, ColumnMappingDefinition[]>;
  });

  const currentCrmConfig = CRM_DEFINITIONS[selectedCrm];
  const activeColumns = columnStates[selectedCrm] || [];

  // Filtered columns for search
  const filteredColumns = useMemo(() => {
    if (!searchFilter.trim()) return activeColumns;
    const q = searchFilter.toLowerCase();
    return activeColumns.filter(c => 
      c.crmHeader.toLowerCase().includes(q) ||
      c.vantageField.toLowerCase().includes(q) ||
      c.dataType.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }, [activeColumns, searchFilter]);

  // Toggle single column
  const handleToggleColumn = (id: string) => {
    setColumnStates(prev => ({
      ...prev,
      [selectedCrm]: prev[selectedCrm].map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    }));
  };

  // Toggle all columns on / off
  const handleToggleAll = (enableAll: boolean) => {
    setColumnStates(prev => ({
      ...prev,
      [selectedCrm]: prev[selectedCrm].map(c => ({
        ...c,
        enabled: c.requirement === 'mandatory' || c.requirement === 'system_flag' ? true : enableAll
      }))
    }));
  };

  // Reset to default
  const handleResetDefaults = () => {
    setColumnStates(prev => ({
      ...prev,
      [selectedCrm]: CRM_DEFINITIONS[selectedCrm].defaultColumns.map(c => ({ ...c }))
    }));
  };

  // Enabled column list
  const enabledColumns = useMemo(() => {
    return activeColumns.filter(c => c.enabled);
  }, [activeColumns]);

  // Generated CSV Header String
  const csvHeaderString = useMemo(() => {
    return enabledColumns.map(c => `"${c.crmHeader}"`).join(',');
  }, [enabledColumns]);

  // Generated Raw CSV Sample
  const rawCsvContent = useMemo(() => {
    const rows: string[] = [];
    rows.push(enabledColumns.map(c => `"${c.crmHeader}"`).join(','));
    
    // Sample Row 1
    const sampleRow1 = enabledColumns.map(c => `"${c.sampleValue}"`).join(',');
    rows.push(sampleRow1);

    // Sample Row 2 (variation)
    const sampleRow2 = enabledColumns.map(c => {
      if (c.vantageField === 'firstName') return '"Marcus"';
      if (c.vantageField === 'lastName') return '"Sterling"';
      if (c.vantageField === 'email') return '"marcus.sterling@pacwest.com"';
      if (c.vantageField === 'phone' || c.vantageField === 'cellPhone') return '"(503) 555-0144"';
      if (c.vantageField === 'loanNumber') return '"ENC-994102"';
      if (c.vantageField === 'loanAmount') return '"$540,000"';
      if (c.vantageField === 'tags' && selectedCrm === 'boldtrail') return '"Realtor|Buyer|DPA-Grant"';
      if (c.requirement === 'system_flag') return '"true"';
      return `"${c.sampleValue}"`;
    }).join(',');
    rows.push(sampleRow2);

    return rows.join('\n');
  }, [enabledColumns, selectedCrm]);

  // Live Hygiene Validation on Active Export
  const liveHygieneValidation = useMemo(() => {
    return validateCsvHygiene(rawCsvContent, selectedCrm);
  }, [rawCsvContent, selectedCrm]);

  // Generated JSON Schema Mapping
  const jsonSchemaContent = useMemo(() => {
    const mappingObj = {
      crmPlatform: currentCrmConfig.name,
      exportPreset: selectedCrm,
      targetFilename: currentCrmConfig.exportFilename,
      columnCount: enabledColumns.length,
      columns: enabledColumns.map((c, idx) => ({
        index: idx + 1,
        targetCrmHeader: c.crmHeader,
        sourceVantageProperty: c.vantageField,
        dataType: c.dataType,
        hygieneRule: c.hygieneRule,
        requirementLevel: c.requirement,
        sampleOutput: c.sampleValue
      }))
    };
    return JSON.stringify(mappingObj, null, 2);
  }, [currentCrmConfig, selectedCrm, enabledColumns]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Direct CSV download
  const handleDownloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExportSuccessMessage(`Downloaded ${filename}`);
    setTimeout(() => setExportSuccessMessage(null), 3000);
  };

  // Download Blank/Sample CRM Template Helper
  const handleDownloadCrmTemplate = (crmKey?: SupportedCrm, includeSampleRow: boolean = false) => {
    const targetKey = crmKey || selectedCrm;
    const targetConfig = CRM_DEFINITIONS[targetKey];
    const targetCols = (columnStates[targetKey] && columnStates[targetKey].length > 0)
      ? columnStates[targetKey].filter(c => c.enabled)
      : targetConfig.defaultColumns;

    const headersRow = targetCols.map(c => `"${sanitizeToAscii(c.crmHeader)}"`).join(',');
    
    let content = headersRow;
    if (includeSampleRow) {
      const sampleRow = targetCols.map(c => {
        let val = c.sampleValue;
        if (targetKey === 'boldtrail' && c.vantageField === 'tags') val = 'Realtor|Buyer|DPA-Grant';
        if (targetKey === 'total_expert' && c.vantageField === 'tags') val = 'Realtor,Past Client';
        return `"${sanitizeToAscii(val)}"`;
      }).join(',');
      content = `${headersRow}\n${sampleRow}`;
    }

    const filename = includeSampleRow 
      ? `sample_template_${targetConfig.exportFilename}` 
      : `template_${targetConfig.exportFilename}`;

    handleDownloadCsv(content, filename);
    setExportSuccessMessage(`Downloaded ${targetConfig.name} ${includeSampleRow ? 'Sample' : 'Blank'} Template (.csv)`);
  };

  // Pre-Export Interceptor Check
  const handlePreExportDownload = () => {
    // If there are warnings or errors or special characters, open pre-export modal verification gate
    if (liveHygieneValidation.totalErrors > 0 || liveHygieneValidation.totalWarnings > 0) {
      setIsPreExportModalOpen(true);
    } else {
      handleDownloadCsv(rawCsvContent, currentCrmConfig.exportFilename);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pre-Export Modal Gate */}
      <PreExportHygieneModal
        isOpen={isPreExportModalOpen}
        onClose={() => setIsPreExportModalOpen(false)}
        targetCrm={selectedCrm}
        crmName={currentCrmConfig.name}
        exportFilename={currentCrmConfig.exportFilename}
        csvContent={rawCsvContent}
        onDownloadCleanCsv={(cleaned, filename) => handleDownloadCsv(cleaned, filename)}
        onDownloadOriginalCsv={(original, filename) => handleDownloadCsv(original, filename)}
      />

      {/* Success Toast */}
      {exportSuccessMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{exportSuccessMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full">
            Exact CRM Header Row Included
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 backdrop-blur-md rounded-full text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-CRM Header Mapping & Pre-Export Hygiene Engine
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 rounded-full text-[11px] font-semibold border border-cyan-400/20">
                Total Expert • Big Purple Dot • BoldTrail (kvCORE)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                liveHygieneValidation.isValid 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Hygiene: {liveHygieneValidation.score}%
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              CRM Export Configuration & CSV Hygiene Validator
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
              Configure column mappings, download blank spreadsheet templates with exact header rows for Total Expert, Big Purple Dot, or BoldTrail, and run automated pre-export validation before downloading files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setPreviewMode('batch_processor')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer ${
                previewMode === 'batch_processor'
                  ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title="Upload multiple CSV files, bulk validate hygiene, deduplicate across files and merge into 1 CRM download"
            >
              <FileStack className="w-4 h-4 text-cyan-200" />
              <span>Batch Processor (Multi-File)</span>
            </button>
            <button
              onClick={handlePreExportDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export {currentCrmConfig.name} CSV</span>
            </button>
            <button
              onClick={() => handleDownloadCrmTemplate(selectedCrm, false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg border border-cyan-400/30 transition cursor-pointer"
              title={`Download blank CSV template with exact ${currentCrmConfig.name} header row`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CRM Template</span>
            </button>
            <button
              onClick={() => handleDownloadCrmTemplate(selectedCrm, true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
              title="Download template pre-populated with 1 compliant sample row"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>With Sample Row</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target CRM Selection Deck */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-500" />
              Target CRM System
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Select CRM Destination to Configure Column Mapping & Download Templates
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold">{Object.keys(CRM_DEFINITIONS).length} CRM Profiles Available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(CRM_DEFINITIONS) as SupportedCrm[]).map((crmKey) => {
            const def = CRM_DEFINITIONS[crmKey];
            const isSelected = selectedCrm === crmKey;
            return (
              <div
                key={crmKey}
                onClick={() => setSelectedCrm(crmKey)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{def.name}</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${def.badgeColor}`}>
                      {def.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {def.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] gap-2">
                  <span className="font-mono text-[10px] text-slate-400">
                    {def.defaultColumns.length} headers
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCrmTemplate(crmKey, false);
                      }}
                      className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      title={`Download blank ${def.name} CSV template`}
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span>Template</span>
                    </button>
                    
                    <span className={`font-semibold flex items-center gap-0.5 text-xs ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                      {isSelected ? 'Active' : 'Select'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CRM Importer Rules & Specifications Card */}
      <div className="bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 rounded-2xl border border-blue-200/80 dark:border-indigo-900/50 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-indigo-900/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {currentCrmConfig.name} Upload & Importer Rules
                {currentCrmConfig.dropboxSubject && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded border border-rose-200">
                    Subject: "{currentCrmConfig.dropboxSubject}"
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Official specifications verified against native CRM importer parsers.
              </p>
            </div>
          </div>

          {currentCrmConfig.officialDocUrl && (
            <a
              href={currentCrmConfig.officialDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View Official Importer Specs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {currentCrmConfig.rules.map((rule, idx) => (
            <div key={idx} className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-blue-100 dark:border-slate-800 space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{rule.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* View Switcher & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Sub-View Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPreviewMode('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Column Mapping Matrix ({enabledColumns.length}/{activeColumns.length})</span>
          </button>

          <button
            onClick={() => setPreviewMode('batch_processor')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'batch_processor'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100'
            }`}
          >
            <FileStack className="w-3.5 h-3.5" />
            <span>Batch Processor & Merger</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100">
              Multi-File
            </span>
          </button>

          <button
            onClick={() => setPreviewMode('validator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'validator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CSV Hygiene Validator</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              liveHygieneValidation.isValid 
                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100' 
                : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
            }`}>
              {liveHygieneValidation.score}%
            </span>
          </button>

          <button
            onClick={() => setPreviewMode('table_preview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'table_preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Live Data Table Preview</span>
          </button>

          <button
            onClick={() => setPreviewMode('raw_csv')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'raw_csv'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw CSV Output</span>
          </button>

          <button
            onClick={() => setPreviewMode('json_schema')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              previewMode === 'json_schema'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Schema</span>
          </button>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2">
          {previewMode === 'matrix' && (
            <>
              <button
                onClick={() => handleToggleAll(true)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            </>
          )}

          <button
            onClick={() => handleDownloadCrmTemplate(selectedCrm, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-bold transition cursor-pointer"
            title={`Download blank CSV template with exact ${currentCrmConfig.name} header row`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Download Template</span>
          </button>

          <button
            onClick={() => handleCopy(csvHeaderString, 'headers')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            {copiedKey === 'headers' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'headers' ? 'Copied Headers!' : 'Copy Headers'}</span>
          </button>
        </div>
      </div>

      {/* 1. COLUMN MAPPING MATRIX VIEW */}
      {previewMode === 'matrix' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${currentCrmConfig.name} fields, data types, or transformation rules...`}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">Include</th>
                  <th className="p-3 w-12 text-center font-mono">#</th>
                  <th className="p-3">Target CRM Column Header</th>
                  <th className="p-3">Internal Vantage Field</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Hygiene & Formatting Rule</th>
                  <th className="p-3">Requirement</th>
                  <th className="p-3">Sample Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredColumns.map((col, idx) => {
                  const isLocked = col.requirement === 'mandatory' || col.requirement === 'system_flag';
                  return (
                    <tr 
                      key={col.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition ${!col.enabled ? 'opacity-50 bg-slate-50/30 dark:bg-slate-950/20' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={col.enabled}
                          disabled={isLocked}
                          onChange={() => handleToggleColumn(col.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {col.crmHeader}
                      </td>
                      <td className="p-3 font-mono text-slate-800 dark:text-slate-200">
                        lead.{col.vantageField}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        {col.dataType}
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono border border-slate-200 dark:border-slate-700">
                          {col.hygieneRule}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          col.requirement === 'mandatory'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                            : col.requirement === 'system_flag'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                            : col.requirement === 'recommended'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300'
                        }`}>
                          {col.requirement.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold max-w-[150px] truncate" title={col.sampleValue}>
                        {col.sampleValue || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LIVE DATA TABLE PREVIEW VIEW */}
      {previewMode === 'table_preview' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              Simulated export dataset ({enabledColumns.length} active columns)
            </span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
              Target: {currentCrmConfig.exportFilename}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-bold z-10">
                <tr>
                  {enabledColumns.map(col => (
                    <th key={col.id} className="p-3 whitespace-nowrap font-mono">
                      {col.crmHeader}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  {enabledColumns.map(col => (
                    <td key={col.id} className="p-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {col.sampleValue || '—'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/30 dark:bg-slate-950/20">
                  {enabledColumns.map(col => {
                    let val = col.sampleValue;
                    if (col.vantageField === 'firstName') val = 'Marcus';
                    if (col.vantageField === 'lastName') val = 'Sterling';
                    if (col.vantageField === 'email') val = 'marcus.s@apexmortgage.org';
                    if (col.vantageField === 'phone' || col.vantageField === 'cellPhone') val = '(503) 555-0922';
                    if (col.vantageField === 'loanNumber') val = 'ENC-994102';
                    if (col.vantageField === 'loanAmount') val = '$540,000';
                    if (col.vantageField === 'tags' && selectedCrm === 'boldtrail') val = 'Realtor|Buyer|DPA-Grant';
                    return (
                      <td key={col.id} className="p-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                        {val || '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  {enabledColumns.map(col => {
                    let val = col.sampleValue;
                    if (col.vantageField === 'firstName') val = 'Jessica';
                    if (col.vantageField === 'lastName') val = 'Torres';
                    if (col.vantageField === 'email') val = 'jessica.t@pacificnw.io';
                    if (col.vantageField === 'phone' || col.vantageField === 'cellPhone') val = '(503) 555-4819';
                    if (col.vantageField === 'loanNumber') val = 'ENC-773190';
                    if (col.vantageField === 'loanAmount') val = '$415,000';
                    if (col.vantageField === 'tags' && selectedCrm === 'boldtrail') val = 'FHA|Oregon-DownPayment';
                    return (
                      <td key={col.id} className="p-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                        {val || '—'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CSV BATCH PROCESSOR & MULTI-FILE MERGER VIEW */}
      {previewMode === 'batch_processor' && (
        <CrmBatchProcessor
          targetCrm={selectedCrm}
          onCrmChange={(newCrm) => setSelectedCrm(newCrm)}
          crmName={currentCrmConfig.name}
        />
      )}

      {/* 4. CSV HYGIENE VALIDATOR TOOL VIEW */}
      {previewMode === 'validator' && (
        <CsvHygieneValidatorTool
          targetCrm={selectedCrm}
          crmName={currentCrmConfig.name}
          activeGeneratedCsv={rawCsvContent}
          exportFilename={currentCrmConfig.exportFilename}
          onDownloadCsv={(content, filename) => handleDownloadCsv(content, filename)}
        />
      )}

      {/* 4. RAW CSV OUTPUT VIEW */}
      {previewMode === 'raw_csv' && (
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300 font-semibold">{currentCrmConfig.exportFilename}</span>
              <span className="text-[10px] text-slate-400">({enabledColumns.length} columns)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(rawCsvContent, 'raw_csv')}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                {copiedKey === 'raw_csv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'raw_csv' ? 'Copied CSV!' : 'Copy CSV'}</span>
              </button>
              <button
                onClick={() => handleDownloadCsv(rawCsvContent, currentCrmConfig.exportFilename)}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .csv</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[400px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {rawCsvContent}
          </pre>
        </div>
      )}

      {/* 4. JSON SCHEMA MAPPING VIEW */}
      {previewMode === 'json_schema' && (
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300 font-semibold">crm-column-mapping.json</span>
              <span className="text-[10px] text-slate-400">({enabledColumns.length} fields configured)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(jsonSchemaContent, 'json_schema')}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                {copiedKey === 'json_schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'json_schema' ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[400px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            {jsonSchemaContent}
          </pre>
        </div>
      )}
    </div>
  );
};
