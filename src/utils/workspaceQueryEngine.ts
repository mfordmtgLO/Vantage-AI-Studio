/**
 * Vantage AI Workspace - Relational Google Sheets Engine & Schema Drift Protector
 * SQL Query Parser, Strict Column Data Type Enforcer, and Atomic Rollback Vault
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

export type ColumnDataType = 'currency' | 'percentage' | 'number' | 'text' | 'state' | 'date' | 'email' | 'phone' | 'formula';

export interface SheetColumnSchema {
  id: string;
  name: string;
  label: string;
  type: ColumnDataType;
  required?: boolean;
  formula?: string;
  description?: string;
}

export interface SheetRowRecord {
  id: string;
  [key: string]: any;
}

export interface SchemaValidationIssue {
  rowId: string;
  columnId: string;
  value: any;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface SheetSnapshot {
  id: string;
  timestamp: string;
  description: string;
  rowCount: number;
  data: SheetRowRecord[];
  columns: SheetColumnSchema[];
}

export interface SheetDataset {
  id: string;
  name: string;
  description: string;
  category: 'mortgage' | 'real_estate' | 'saas_crm';
  columns: SheetColumnSchema[];
  rows: SheetRowRecord[];
}

export const PREBUILT_SHEET_DATASETS: SheetDataset[] = [
  {
    id: 'ds-mortgage-pipeline',
    name: '2026 Active Mortgage Loan Pipeline',
    description: 'Real-time loan origination pipeline with DPA grant verification, LTV ratios, and underwriting milestones.',
    category: 'mortgage',
    columns: [
      { id: 'borrower', name: 'borrower', label: 'Borrower Name', type: 'text', required: true },
      { id: 'property_address', name: 'property_address', label: 'Property Address', type: 'text', required: true },
      { id: 'state', name: 'state', label: 'State', type: 'state', required: true },
      { id: 'loan_type', name: 'loan_type', label: 'Loan Program', type: 'text', required: true },
      { id: 'loan_amount', name: 'loan_amount', label: 'Loan Amount ($)', type: 'currency', required: true },
      { id: 'interest_rate', name: 'interest_rate', label: 'Interest Rate (%)', type: 'percentage', required: true },
      { id: 'ltv', name: 'ltv', label: 'LTV (%)', type: 'percentage', required: true },
      { id: 'dti', name: 'dti', label: 'DTI (%)', type: 'percentage', required: true },
      { id: 'credit_score', name: 'credit_score', label: 'FICO Score', type: 'number', required: true },
      { id: 'dpa_grant_eligible', name: 'dpa_grant_eligible', label: 'DPA Grant ($)', type: 'currency' },
      { id: 'stage', name: 'stage', label: 'Underwriting Stage', type: 'text', required: true },
      { id: 'closing_date', name: 'closing_date', label: 'Target Closing', type: 'date', required: true },
      { id: 'email', name: 'email', label: 'Borrower Email', type: 'email', required: true },
      { id: 'phone', name: 'phone', label: 'Contact Phone', type: 'phone', required: true }
    ],
    rows: [
      {
        id: 'row-1',
        borrower: 'Marcus & Clara Vance',
        property_address: '4820 Lakeview Crest Dr, Austin',
        state: 'TX',
        loan_type: 'Conventional 30Y',
        loan_amount: 540000,
        interest_rate: 6.125,
        ltv: 80.0,
        dti: 34.5,
        credit_score: 765,
        dpa_grant_eligible: 0,
        stage: 'Clear to Close',
        closing_date: '2026-10-02',
        email: 'marcus.vance@gmail.com',
        phone: '(512) 555-8921'
      },
      {
        id: 'row-2',
        borrower: 'Sarah Jenkins',
        property_address: '119 Elmwood St, Dallas',
        state: 'OR',
        loan_type: 'Fannie Mae HomeReady',
        loan_amount: 385000,
        interest_rate: 5.875,
        ltv: 97.0,
        dti: 39.2,
        credit_score: 695,
        dpa_grant_eligible: 12500,
        stage: 'Underwriting Review',
        closing_date: '2026-10-18',
        email: 'sjenkins@oregonhealth.org',
        phone: '(503) 555-1284'
      },
      {
        id: 'row-3',
        borrower: 'David Morales',
        property_address: '742 Highland Terrace, Tampa',
        state: 'FL',
        loan_type: 'VA 100% Zero Down',
        loan_amount: 460000,
        interest_rate: 5.750,
        ltv: 100.0,
        dti: 31.0,
        credit_score: 740,
        dpa_grant_eligible: 5000,
        stage: 'Appraisal Ordered',
        closing_date: '2026-10-24',
        email: 'dmorales.vet@militarymail.us',
        phone: '(813) 555-6732'
      },
      {
        id: 'row-4',
        borrower: 'Chloe & Robert Nguyen',
        property_address: '920 Bellevue Way NE, Seattle',
        state: 'WA',
        loan_type: 'Jumbo Prime',
        loan_amount: 1150000,
        interest_rate: 6.375,
        ltv: 75.0,
        dti: 28.4,
        credit_score: 805,
        dpa_grant_eligible: 0,
        stage: 'Conditional Approval',
        closing_date: '2026-11-05',
        email: 'robert.nguyen@cloudtech.io',
        phone: '(206) 555-4491'
      },
      {
        id: 'row-5',
        borrower: 'Elena Rostova',
        property_address: '310 Sunset Ridge, Phoenix',
        state: 'AZ',
        loan_type: 'FHA 3.5% Down',
        loan_amount: 320000,
        interest_rate: 5.990,
        ltv: 96.5,
        dti: 42.1,
        credit_score: 670,
        dpa_grant_eligible: 15000,
        stage: 'Rate Locked',
        closing_date: '2026-10-14',
        email: 'erostova@pacificcrestcapital.com',
        phone: '(602) 555-9102'
      }
    ]
  },
  {
    id: 'ds-real-estate-properties',
    name: '2026 Real Estate Acquisition & Buyer Inventory',
    description: 'Active client purchase requirements, pre-approval amounts, target zip codes, and contract stages.',
    category: 'real_estate',
    columns: [
      { id: 'client_name', name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { id: 'target_city', name: 'target_city', label: 'Target City', type: 'text', required: true },
      { id: 'state', name: 'state', label: 'State', type: 'state', required: true },
      { id: 'budget_max', name: 'budget_max', label: 'Max Budget ($)', type: 'currency', required: true },
      { id: 'property_type', name: 'property_type', label: 'Property Type', type: 'text', required: true },
      { id: 'pre_approval_status', name: 'pre_approval_status', label: 'Pre-Approval', type: 'text', required: true },
      { id: 'assigned_agent', name: 'assigned_agent', label: 'Assigned Agent', type: 'text', required: true },
      { id: 'days_in_search', name: 'days_in_search', label: 'Search Days', type: 'number' },
      { id: 'contact_email', name: 'contact_email', label: 'Email', type: 'email', required: true }
    ],
    rows: [
      {
        id: 'prop-1',
        client_name: 'Jonathan Baker',
        target_city: 'Austin',
        state: 'TX',
        budget_max: 650000,
        property_type: 'Single Family (3+ Bed)',
        pre_approval_status: 'Fully Verified ($700k)',
        assigned_agent: 'Sarah Miller',
        days_in_search: 14,
        contact_email: 'jbaker@bakerdesigns.com'
      },
      {
        id: 'prop-2',
        client_name: 'Dr. Amanda Chen',
        target_city: 'Portland',
        state: 'OR',
        budget_max: 825000,
        property_type: 'Modern Craftsman',
        pre_approval_status: 'Doctor Loan Verified',
        assigned_agent: 'Mike Ford',
        days_in_search: 7,
        contact_email: 'amanda.chen@ohsu.edu'
      },
      {
        id: 'prop-3',
        client_name: 'Kevin O\'Connor',
        target_city: 'Boise',
        state: 'ID',
        budget_max: 475000,
        property_type: 'Townhome / Condo',
        pre_approval_status: 'Pending Tax Return Verification',
        assigned_agent: 'Sarah Miller',
        days_in_search: 28,
        contact_email: 'kevin.oc@rivervalley.net'
      }
    ]
  }
];

export class RelationalSheetQueryRunner {
  static validateRowAgainstSchema(row: SheetRowRecord, columns: SheetColumnSchema[]): SchemaValidationIssue[] {
    const issues: SchemaValidationIssue[] = [];

    columns.forEach((col) => {
      const val = row[col.id];

      // Required check
      if (col.required && (val === undefined || val === null || val === '')) {
        issues.push({
          rowId: row.id,
          columnId: col.id,
          value: val,
          rule: 'required',
          severity: 'error',
          message: `Field "${col.label}" is required and cannot be empty.`
        });
        return;
      }

      if (val === undefined || val === null || val === '') return;

      // Type checks
      switch (col.type) {
        case 'currency':
        case 'number':
        case 'percentage': {
          const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
          if (isNaN(num)) {
            issues.push({
              rowId: row.id,
              columnId: col.id,
              value: val,
              rule: 'numeric_type',
              severity: 'error',
              message: `Value "${val}" must be a valid numeric number for ${col.label}.`
            });
          }
          break;
        }
        case 'state': {
          const str = String(val).trim().toUpperCase();
          if (str.length !== 2) {
            issues.push({
              rowId: row.id,
              columnId: col.id,
              value: val,
              rule: 'fips_state_code',
              severity: 'warning',
              message: `State code "${val}" should be a 2-letter standard postal code (e.g. TX, OR).`
            });
          }
          break;
        }
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val).trim())) {
            issues.push({
              rowId: row.id,
              columnId: col.id,
              value: val,
              rule: 'email_rfc5322',
              severity: 'error',
              message: `Invalid email address format "${val}".`
            });
          }
          break;
        }
        case 'phone': {
          const digits = String(val).replace(/\D/g, '');
          if (digits.length < 10) {
            issues.push({
              rowId: row.id,
              columnId: col.id,
              value: val,
              rule: 'phone_digits',
              severity: 'warning',
              message: `Phone number "${val}" has fewer than 10 digits.`
            });
          }
          break;
        }
      }
    });

    return issues;
  }

  static executeSqlQuery(
    sqlQuery: string,
    dataset: SheetDataset
  ): { rows: SheetRowRecord[]; error?: string; executionTimeMs: number } {
    const startTime = performance.now();
    try {
      const q = sqlQuery.trim();
      if (!q) {
        return { rows: dataset.rows, executionTimeMs: performance.now() - startTime };
      }

      // Simple, robust SQL-like parser for: SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...
      let filtered = [...dataset.rows];

      // Extract WHERE condition
      const whereMatch = q.match(/WHERE\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|\s*$|;)/i);
      if (whereMatch && whereMatch[1]) {
        const conditionStr = whereMatch[1].trim();
        filtered = filtered.filter((row) => {
          return this.evaluateCondition(conditionStr, row);
        });
      }

      // Extract ORDER BY
      const orderMatch = q.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch && orderMatch[1]) {
        const colName = orderMatch[1];
        const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
        filtered.sort((a, b) => {
          let valA = a[colName];
          let valB = b[colName];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // Extract LIMIT
      const limitMatch = q.match(/LIMIT\s+(\d+)/i);
      if (limitMatch && limitMatch[1]) {
        const limit = parseInt(limitMatch[1], 10);
        filtered = filtered.slice(0, limit);
      }

      return {
        rows: filtered,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    } catch (err: any) {
      return {
        rows: dataset.rows,
        error: `Query Syntax Error: ${err.message || 'Invalid SQL expression'}`,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }
  }

  private static evaluateCondition(conditionStr: string, row: SheetRowRecord): boolean {
    // Split by AND clauses
    const andClauses = conditionStr.split(/\s+AND\s+/i);
    for (const clause of andClauses) {
      const trimmed = clause.trim();
      
      // Match operators: >=, <=, !=, <>, =, >, <, LIKE, CONTAINS
      const match = trimmed.match(/([a-zA-Z0-9_]+)\s*(>=|<=|!=|<>|=|>|<|LIKE|CONTAINS)\s*(.*)/i);
      if (!match) continue;

      const field = match[1].trim();
      const op = match[2].toUpperCase();
      let targetVal: any = match[3].trim().replace(/^['"]|['"]$/g, '');

      const rowVal = row[field];
      if (rowVal === undefined) return false;

      // Numeric comparison if both can be numbers
      const numRow = typeof rowVal === 'number' ? rowVal : parseFloat(String(rowVal).replace(/[^0-9.-]/g, ''));
      const numTarget = parseFloat(targetVal);

      if (!isNaN(numRow) && !isNaN(numTarget) && (op === '>' || op === '>=' || op === '<' || op === '<=' || op === '=' || op === '!=')) {
        if (op === '>' && !(numRow > numTarget)) return false;
        if (op === '>=' && !(numRow >= numTarget)) return false;
        if (op === '<' && !(numRow < numTarget)) return false;
        if (op === '<=' && !(numRow <= numTarget)) return false;
        if (op === '=' && !(numRow === numTarget)) return false;
        if (op === '!=' && !(numRow !== numTarget)) return false;
        continue;
      }

      // String comparison
      const strRow = String(rowVal).toLowerCase();
      const strTarget = String(targetVal).toLowerCase().replace(/%/g, '');

      if (op === '=' && strRow !== strTarget) return false;
      if ((op === '!=' || op === '<>') && strRow === strTarget) return false;
      if ((op === 'LIKE' || op === 'CONTAINS') && !strRow.includes(strTarget)) return false;
    }
    return true;
  }
}
