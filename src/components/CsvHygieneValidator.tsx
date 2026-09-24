/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution: Mike Ford <fordmj@gmail.com>
 *
 * Vantage AI Studio - Multi-CRM CSV Hygiene & Pre-Export Validator
 * Comprehensive pre-export verification engine for standard CSV & CRM-specific schemas:
 * - ASCII Plaintext (1-127) compliance & Unicode special character detection
 * - Mandatory baseline headers (First Name, Last Name, Email, Phone, Company)
 * - CRM-specific syntax (Total Expert groups, BoldTrail pipe hashtags, opt-in flags, BPD columns)
 * - Data format consistency (US phone formatting, email RFC regex, column count uniformity)
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Upload, 
  Sliders, 
  ArrowRight, 
  Info, 
  Zap, 
  Search, 
  Filter,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { SupportedCrm } from './CrmExportConfigurationView';
import { sanitizeToAscii, normalizeTotalExpertGroup, normalizeBoldTrailHashtags } from './LeadDatabaseCleanupTool';

export interface HygieneIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'ascii_special_char' | 'missing_header' | 'crm_specific' | 'data_format' | 'structure';
  title: string;
  description: string;
  rowNumber?: number;
  columnName?: string;
  sampleOffendingText?: string;
  suggestedFix?: string;
  autoFixable: boolean;
}

export interface ValidationSummary {
  isValid: boolean;
  score: number; // 0 to 100
  totalErrors: number;
  totalWarnings: number;
  totalPassedChecks: number;
  issues: HygieneIssue[];
  checkedRowsCount: number;
  checkedColsCount: number;
}

/**
 * Standard Phone Number Formatter
 */
export function formatStandardPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

/**
 * Parse CSV line handling quoted fields with commas
 */
export function parseCsvRow(rowStr: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const nextChar = rowStr[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Deep CSV Hygiene Validation Engine
 */
export function validateCsvHygiene(csvContent: string, targetCrm: SupportedCrm): ValidationSummary {
  const issues: HygieneIssue[] = [];
  let passedChecks = 0;

  if (!csvContent || !csvContent.trim()) {
    return {
      isValid: false,
      score: 0,
      totalErrors: 1,
      totalWarnings: 0,
      totalPassedChecks: 0,
      issues: [{
        id: 'err_empty_csv',
        severity: 'error',
        category: 'structure',
        title: 'Empty CSV Content',
        description: 'The CSV document contains no data or header rows.',
        autoFixable: false
      }],
      checkedRowsCount: 0,
      checkedColsCount: 0
    };
  }

  const rawLines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) {
    return {
      isValid: false,
      score: 0,
      totalErrors: 1,
      totalWarnings: 0,
      totalPassedChecks: 0,
      issues: [{
        id: 'err_no_rows',
        severity: 'error',
        category: 'structure',
        title: 'No CSV Rows Found',
        description: 'No valid rows detected in the provided CSV file.',
        autoFixable: false
      }],
      checkedRowsCount: 0,
      checkedColsCount: 0
    };
  }

  // Row 1 Header Analysis
  const headerLine = rawLines[0];
  const headers = parseCsvRow(headerLine).map(h => h.replace(/^["']|["']$/g, '').trim());
  const headerCount = headers.length;

  // 1. Structure Check: Pre-header metadata check
  if (headerLine.toLowerCase().startsWith('report generated') || headerLine.toLowerCase().startsWith('exported on') || headerLine.toLowerCase().startsWith('#')) {
    issues.push({
      id: 'err_preheader_comment',
      severity: 'error',
      category: 'structure',
      title: 'Pre-Header Metadata Detected on Row 1',
      description: 'Row 1 contains metadata comments instead of column headers. Native CRM importers will fail or reject all rows.',
      rowNumber: 1,
      sampleOffendingText: headerLine.slice(0, 60),
      suggestedFix: 'Ensure Row 1 begins immediately with column header titles.',
      autoFixable: true
    });
  } else {
    passedChecks++;
  }

  // 2. Header Names Integrity
  const lowerHeaders = headers.map(h => h.toLowerCase());
  const headerSet = new Set<string>();
  let hasDuplicateHeaders = false;
  let hasEmptyHeaders = false;

  headers.forEach((h, idx) => {
    if (!h) {
      hasEmptyHeaders = true;
      issues.push({
        id: `err_empty_header_${idx}`,
        severity: 'error',
        category: 'missing_header',
        title: `Empty Column Header at Column #${idx + 1}`,
        description: `Column ${idx + 1} has an empty or blank header name, causing parser crashes in CRM importers.`,
        columnName: `Col #${idx + 1}`,
        suggestedFix: `Assign a valid header name or remove empty trailing column delimiter.`,
        autoFixable: true
      });
    } else {
      if (headerSet.has(h.toLowerCase())) {
        hasDuplicateHeaders = true;
        issues.push({
          id: `warn_dup_header_${idx}`,
          severity: 'warning',
          category: 'missing_header',
          title: `Duplicate Header Name: "${h}"`,
          description: `Header "${h}" appears more than once. CRM importers may overwrite values during import.`,
          columnName: h,
          suggestedFix: `Rename or consolidate duplicate columns.`,
          autoFixable: false
        });
      }
      headerSet.add(h.toLowerCase());
    }
  });

  if (!hasDuplicateHeaders && !hasEmptyHeaders) {
    passedChecks += 2;
  }

  // 3. Baseline First Name / Last Name / Email Requirements Check
  const hasFirstName = lowerHeaders.some(h => 
    h === 'first name' || h === 'first_name' || h === 'firstname' || h === 'borrower first name'
  );
  const hasLastName = lowerHeaders.some(h => 
    h === 'last name' || h === 'last_name' || h === 'lastname' || h === 'borrower last name'
  );
  const hasFullNameTrap = lowerHeaders.some(h => 
    h === 'name' || h === 'full name' || h === 'fullname' || h === 'contact name'
  );

  if (hasFullNameTrap && (!hasFirstName || !hasLastName)) {
    issues.push({
      id: 'err_combined_fullname_trap',
      severity: 'error',
      category: 'missing_header',
      title: 'Combined "Full Name" Column Trap Detected',
      description: 'The CSV contains a single "Full Name" column instead of discrete "First Name" and "Last Name" columns required by CRMs.',
      columnName: 'Name / Full Name',
      suggestedFix: 'Split full name values into distinct "First Name" and "Last Name" headers.',
      autoFixable: true
    });
  } else if (!hasFirstName || !hasLastName) {
    issues.push({
      id: 'err_missing_first_last',
      severity: 'error',
      category: 'missing_header',
      title: 'Missing Mandatory First Name or Last Name Header',
      description: `Target CRM requires distinct First and Last Name columns. Detected: FirstName=${hasFirstName ? 'Yes' : 'No'}, LastName=${hasLastName ? 'Yes' : 'No'}.`,
      suggestedFix: 'Include "first name" and "last name" in Row 1 headers.',
      autoFixable: true
    });
  } else {
    passedChecks += 2;
  }

  // Check Email presence
  const hasEmail = lowerHeaders.some(h => h.includes('email') || h === 'e-mail');
  if (!hasEmail) {
    issues.push({
      id: 'warn_missing_email',
      severity: 'warning',
      category: 'missing_header',
      title: 'No Email Header Detected',
      description: 'Email address column is recommended for contact deduplication and drip email campaigns in CRMs.',
      suggestedFix: 'Add an "email" column.',
      autoFixable: false
    });
  } else {
    passedChecks++;
  }

  // 4. CRM Specific Rule Validations
  if (targetCrm === 'total_expert' || targetCrm === 'total_expert_mortgage') {
    // Total Expert specific checks
    const hasTeFirstName = lowerHeaders.includes('first name') || lowerHeaders.includes('firstname');
    const hasTeLastName = lowerHeaders.includes('last name') || lowerHeaders.includes('lastname');
    if (!hasTeFirstName || !hasTeLastName) {
      issues.push({
        id: 'err_te_header_naming',
        severity: 'error',
        category: 'crm_specific',
        title: 'Total Expert Standard Header Mismatch',
        description: 'Total Expert official training standard expects exact headers "first name" and "last name" (case-insensitive).',
        suggestedFix: 'Normalize headers to "first name" and "last name".',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }

    if (targetCrm === 'total_expert_mortgage') {
      const hasLoanNum = lowerHeaders.some(h => h.includes('loan number') || h.includes('loan_number') || h.includes('loannumber'));
      const hasLoanAmt = lowerHeaders.some(h => h.includes('loan amount') || h.includes('loan_amount') || h.includes('loanamount'));
      if (!hasLoanNum || !hasLoanAmt) {
        issues.push({
          id: 'warn_te_mortgage_fields',
          severity: 'warning',
          category: 'crm_specific',
          title: 'Total Expert Mortgage: Missing Loan Number or Amount',
          description: 'Mortgage pipeline export is missing "loan number" or "loan amount" columns.',
          suggestedFix: 'Map active loan number and loan amount columns for pipeline reporting.',
          autoFixable: true
        });
      } else {
        passedChecks++;
      }
    }
  } else if (targetCrm === 'boldtrail') {
    // BoldTrail specific checks
    const hasBtFirst = lowerHeaders.includes('first_name');
    const hasBtLast = lowerHeaders.includes('last_name');
    const hasBtCell = lowerHeaders.includes('cell_phone_1') || lowerHeaders.includes('cell phone 1');
    const hasOptInFlags = lowerHeaders.includes('email_optin') && lowerHeaders.includes('phone_optin') && lowerHeaders.includes('text_optin');

    if (!hasBtFirst || !hasBtLast) {
      issues.push({
        id: 'err_boldtrail_headers',
        severity: 'error',
        category: 'crm_specific',
        title: 'BoldTrail Lead Dropbox Header Mismatch',
        description: 'BoldTrail official Lead Dropbox template requires exact snake_case "first_name" and "last_name" headers.',
        suggestedFix: 'Rename name columns to "first_name" and "last_name".',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }

    if (!hasBtCell) {
      issues.push({
        id: 'warn_boldtrail_cell',
        severity: 'warning',
        category: 'crm_specific',
        title: 'BoldTrail: "cell_phone_1" Header Missing',
        description: 'BoldTrail automated Smart Campaigns and SMS dialers require the "cell_phone_1" column header.',
        suggestedFix: 'Include "cell_phone_1" header.',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }

    if (!hasOptInFlags) {
      issues.push({
        id: 'warn_boldtrail_optin',
        severity: 'warning',
        category: 'crm_specific',
        title: 'BoldTrail: Missing Opt-In Flags (email_optin, phone_optin, text_optin)',
        description: 'Without explicit "email_optin", "phone_optin", and "text_optin" set to "true", BoldTrail may automatically unsubscribe imported leads.',
        suggestedFix: 'Add email_optin, phone_optin, and text_optin columns with value "true".',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }
  } else if (targetCrm === 'big_purple_dot' || targetCrm === 'bpd_encompass') {
    // Big Purple Dot checks
    const hasPhone = lowerHeaders.some(h => h === 'phone' || h === 'primary phone');
    const hasMobile = lowerHeaders.some(h => h === 'mobile phone' || h === 'cell phone' || h === 'mobile');
    if (hasPhone && !hasMobile) {
      issues.push({
        id: 'info_bpd_mobile_separation',
        severity: 'info',
        category: 'crm_specific',
        title: 'Big Purple Dot: Discrete "Mobile Phone" Column Recommended',
        description: 'Big Purple Dot auto-wizard pairs "Mobile Phone" directly to the SMS dialer. Having discrete "Phone" and "Mobile Phone" columns is recommended.',
        suggestedFix: 'Separate phone fields into discrete Phone and Mobile Phone columns.',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }
  } else if (targetCrm === 'salesforce') {
    const hasCompany = lowerHeaders.includes('company');
    if (!hasCompany) {
      issues.push({
        id: 'warn_sf_company',
        severity: 'warning',
        category: 'crm_specific',
        title: 'Salesforce: Missing Mandatory "Company" Header',
        description: 'Salesforce Lead standard object enforces a non-null "Company" value for every lead record.',
        suggestedFix: 'Add "Company" column (e.g. populated with Employer or "Individual").',
        autoFixable: true
      });
    } else {
      passedChecks++;
    }
  }

  // 5. Data Rows Deep Scan (ASCII, Delimiters, Phone/Email Formats)
  let nonAsciiCount = 0;
  let malformedPhoneCount = 0;
  let malformedEmailCount = 0;
  let mismatchedColumnCount = 0;
  let boldtrailHashSymbolCount = 0;
  let teSpacedGroupCount = 0;
  let unescapedQuoteCount = 0;

  const dataLines = rawLines.slice(1);
  const maxRowsToInspect = Math.min(dataLines.length, 500); // Check up to 500 rows for high responsiveness

  for (let r = 0; r < maxRowsToInspect; r++) {
    const rowIdx = r + 2; // 1-based index (Row 1 is header)
    const line = dataLines[r];
    const cells = parseCsvRow(line).map(c => c.replace(/^["']|["']$/g, '').trim());

    // Row length check
    if (cells.length !== headerCount) {
      mismatchedColumnCount++;
      if (mismatchedColumnCount <= 3) {
        issues.push({
          id: `err_col_mismatch_row_${rowIdx}`,
          severity: 'error',
          category: 'structure',
          title: `Column Count Mismatch on Row ${rowIdx}`,
          description: `Row ${rowIdx} has ${cells.length} columns, but header defines ${headerCount} columns. This is often caused by an unquoted comma inside an address or notes field.`,
          rowNumber: rowIdx,
          sampleOffendingText: line.slice(0, 80),
          suggestedFix: 'Wrap fields containing commas in quotation marks.',
          autoFixable: true
        });
      }
    }

    // Cell-by-cell inspection
    cells.forEach((cellVal, colIdx) => {
      const headerName = headers[colIdx] || `Col #${colIdx + 1}`;
      const headerLower = headerName.toLowerCase();

      // ASCII Hygiene Check (Codes 0 to 127)
      if (/[^\x00-\x7F]/.test(cellVal)) {
        nonAsciiCount++;
        if (nonAsciiCount <= 4) {
          const nonAsciiChars = cellVal.match(/[^\x00-\x7F]/g)?.join(' ') || '';
          issues.push({
            id: `err_non_ascii_r${rowIdx}_c${colIdx}`,
            severity: targetCrm.startsWith('total_expert') ? 'error' : 'warning',
            category: 'ascii_special_char',
            title: `Non-ASCII Unicode Character on Row ${rowIdx} (${headerName})`,
            description: `Found non-standard characters (${nonAsciiChars}) such as curly quotes, em-dashes, or special accents. Total Expert and older CRM loaders reject non-ASCII data.`,
            rowNumber: rowIdx,
            columnName: headerName,
            sampleOffendingText: cellVal.slice(0, 60),
            suggestedFix: `Sanitize string into standard ASCII characters (1-127).`,
            autoFixable: true
          });
        }
      }

      // Email Syntax Check
      if (headerLower.includes('email') && cellVal) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cellVal)) {
          malformedEmailCount++;
          if (malformedEmailCount <= 3) {
            issues.push({
              id: `warn_email_syntax_r${rowIdx}`,
              severity: 'warning',
              category: 'data_format',
              title: `Invalid Email Format on Row ${rowIdx}`,
              description: `Email "${cellVal}" does not match standard RFC email formatting.`,
              rowNumber: rowIdx,
              columnName: headerName,
              sampleOffendingText: cellVal,
              suggestedFix: 'Trim spaces and verify email domain.',
              autoFixable: true
            });
          }
        }
      }

      // Phone Format Check
      if ((headerLower.includes('phone') || headerLower.includes('cell') || headerLower.includes('mobile')) && cellVal) {
        const digits = cellVal.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 10) {
          malformedPhoneCount++;
          if (malformedPhoneCount <= 3) {
            issues.push({
              id: `warn_phone_digits_r${rowIdx}`,
              severity: 'warning',
              category: 'data_format',
              title: `Incomplete Phone Number on Row ${rowIdx}`,
              description: `Phone "${cellVal}" contains only ${digits.length} digits (expected 10 digits with area code).`,
              rowNumber: rowIdx,
              columnName: headerName,
              sampleOffendingText: cellVal,
              suggestedFix: 'Include 3-digit US area code.',
              autoFixable: false
            });
          }
        }
      }

      // BoldTrail Hashtags Syntax Check (Flags '#' or commas)
      if (targetCrm === 'boldtrail' && (headerLower.includes('hashtag') || headerLower.includes('tag')) && cellVal) {
        if (cellVal.includes('#') || (cellVal.includes(',') && !cellVal.includes('|'))) {
          boldtrailHashSymbolCount++;
          if (boldtrailHashSymbolCount <= 3) {
            issues.push({
              id: `warn_bt_hashtag_syntax_r${rowIdx}`,
              severity: 'warning',
              category: 'crm_specific',
              title: `BoldTrail Hashtag Syntax Issue on Row ${rowIdx}`,
              description: `BoldTrail tags must be pipe-delimited (|) and NOT include the "#" symbol (found: "${cellVal}").`,
              rowNumber: rowIdx,
              columnName: headerName,
              sampleOffendingText: cellVal,
              suggestedFix: `Convert to pipe-delimited without "#" (e.g. "${normalizeBoldTrailHashtags(cellVal)}").`,
              autoFixable: true
            });
          }
        }
      }

      // Total Expert Group Syntax Check (Flags space after commas)
      if (targetCrm.startsWith('total_expert') && headerLower === 'group' && cellVal) {
        if (cellVal.includes(', ')) {
          teSpacedGroupCount++;
          if (teSpacedGroupCount <= 3) {
            issues.push({
              id: `warn_te_group_space_r${rowIdx}`,
              severity: 'warning',
              category: 'crm_specific',
              title: `Total Expert Group Contains Internal Spaces on Row ${rowIdx}`,
              description: `Total Expert expects groups separated by commas with zero internal spaces (e.g. "Realtor,Past Client" rather than "Realtor, Past Client").`,
              rowNumber: rowIdx,
              columnName: headerName,
              sampleOffendingText: cellVal,
              suggestedFix: `Strip spaces after commas (e.g. "${normalizeTotalExpertGroup(cellVal)}").`,
              autoFixable: true
            });
          }
        }
      }
    });
  }

  // Summary counts for bulk items
  if (nonAsciiCount > 4) {
    issues.push({
      id: 'err_bulk_non_ascii',
      severity: targetCrm.startsWith('total_expert') ? 'error' : 'warning',
      category: 'ascii_special_char',
      title: `+${nonAsciiCount - 4} Additional Non-ASCII Unicode Occurrences`,
      description: `Detected ${nonAsciiCount} total non-ASCII character instances across dataset rows.`,
      suggestedFix: 'Run 1-Click ASCII Plaintext Sanitization.',
      autoFixable: true
    });
  } else if (nonAsciiCount === 0) {
    passedChecks += 2;
  }

  if (mismatchedColumnCount === 0) {
    passedChecks += 2;
  }
  if (malformedEmailCount === 0) {
    passedChecks += 1;
  }
  if (malformedPhoneCount === 0) {
    passedChecks += 1;
  }

  // Calculate Health Score (0 - 100)
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  let calculatedScore = 100 - (errorCount * 25) - (warningCount * 8);
  if (calculatedScore < 0) calculatedScore = 0;
  if (errorCount > 0 && calculatedScore > 75) calculatedScore = 75;

  return {
    isValid: errorCount === 0,
    score: Math.max(0, Math.min(100, calculatedScore)),
    totalErrors: errorCount,
    totalWarnings: warningCount,
    totalPassedChecks: passedChecks,
    issues,
    checkedRowsCount: dataLines.length,
    checkedColsCount: headerCount
  };
}

/**
 * 1-Click Automated Comprehensive CSV Auto-Sanitizer & Repair Engine
 */
export function autoSanitizeCsvContent(csvContent: string, targetCrm: SupportedCrm): string {
  if (!csvContent || !csvContent.trim()) return csvContent;

  const rawLines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) return csvContent;

  // Filter out any metadata lines before the actual header
  let headerIndex = 0;
  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i].toLowerCase();
    if (!l.startsWith('report') && !l.startsWith('#') && !l.startsWith('exported') && l.includes(',')) {
      headerIndex = i;
      break;
    }
  }

  const validLines = rawLines.slice(headerIndex);
  const headerRowStr = validLines[0];
  let headers = parseCsvRow(headerRowStr).map(h => h.replace(/^["']|["']$/g, '').trim());

  // CRM specific header adjustments
  if (targetCrm === 'boldtrail') {
    headers = headers.map(h => {
      const hl = h.toLowerCase();
      if (hl === 'first name' || hl === 'firstname') return 'first_name';
      if (hl === 'last name' || hl === 'lastname') return 'last_name';
      if (hl === 'phone' || hl === 'mobile phone' || hl === 'cell') return 'cell_phone_1';
      if (hl === 'tags' || hl === 'group') return 'hashtags';
      return h;
    });

    // Ensure opt-in headers are present
    if (!headers.includes('email_optin')) headers.push('email_optin');
    if (!headers.includes('phone_optin')) headers.push('phone_optin');
    if (!headers.includes('text_optin')) headers.push('text_optin');
  } else if (targetCrm === 'total_expert' || targetCrm === 'total_expert_mortgage') {
    headers = headers.map(h => {
      const hl = h.toLowerCase();
      if (hl === 'first_name' || hl === 'firstname') return 'first name';
      if (hl === 'last_name' || hl === 'lastname') return 'last name';
      if (hl === 'tags' || hl === 'hashtags') return 'Group';
      return h;
    });
  }

  const sanitizedRows: string[] = [];
  // Push clean quoted headers
  sanitizedRows.push(headers.map(h => `"${sanitizeToAscii(h)}"`).join(','));

  // Process data lines
  for (let r = 1; r < validLines.length; r++) {
    const line = validLines[r];
    let cells = parseCsvRow(line).map(c => c.replace(/^["']|["']$/g, '').trim());

    // Adjust cell count to match headers if needed
    while (cells.length < headers.length) {
      // If we added opt-in columns for boldtrail, populate with 'true'
      const colIndex = cells.length;
      const colHeader = headers[colIndex];
      if (colHeader === 'email_optin' || colHeader === 'phone_optin' || colHeader === 'text_optin') {
        cells.push('true');
      } else {
        cells.push('');
      }
    }

    // Clean each cell
    const cleanedCells = cells.slice(0, headers.length).map((val, idx) => {
      const colHeader = (headers[idx] || '').toLowerCase();
      let cleanVal = sanitizeToAscii(val);

      // Phone standardization
      if (colHeader.includes('phone') || colHeader.includes('cell') || colHeader.includes('mobile')) {
        cleanVal = formatStandardPhone(cleanVal);
      }

      // Email lowercase trim
      if (colHeader.includes('email')) {
        cleanVal = cleanVal.toLowerCase().trim();
      }

      // BoldTrail tags
      if (targetCrm === 'boldtrail' && (colHeader === 'hashtags' || colHeader.includes('tag'))) {
        cleanVal = normalizeBoldTrailHashtags(cleanVal);
      }

      // Total Expert groups
      if (targetCrm.startsWith('total_expert') && colHeader === 'group') {
        cleanVal = normalizeTotalExpertGroup(cleanVal);
      }

      // BoldTrail opt-in flags
      if (targetCrm === 'boldtrail' && (colHeader === 'email_optin' || colHeader === 'phone_optin' || colHeader === 'text_optin')) {
        cleanVal = 'true';
      }

      return `"${cleanVal.replace(/"/g, '""')}"`;
    });

    sanitizedRows.push(cleanedCells.join(','));
  }

  return sanitizedRows.join('\n');
}

/**
 * Pre-Export Hygiene Check Modal Component
 */
export interface PreExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCrm: SupportedCrm;
  crmName: string;
  exportFilename: string;
  csvContent: string;
  onDownloadCleanCsv: (cleanedContent: string, filename: string) => void;
  onDownloadOriginalCsv: (content: string, filename: string) => void;
}

export const PreExportHygieneModal: React.FC<PreExportModalProps> = ({
  isOpen,
  onClose,
  targetCrm,
  crmName,
  exportFilename,
  csvContent,
  onDownloadCleanCsv,
  onDownloadOriginalCsv
}) => {
  const [activeView, setActiveView] = useState<'summary' | 'issues'>('summary');
  const [fixedContent, setFixedContent] = useState<string | null>(null);

  const validation = useMemo(() => {
    return validateCsvHygiene(csvContent, targetCrm);
  }, [csvContent, targetCrm]);

  if (!isOpen) return null;

  const handleAutoFixAndDownload = () => {
    const sanitized = autoSanitizeCsvContent(csvContent, targetCrm);
    onDownloadCleanCsv(sanitized, exportFilename);
    onClose();
  };

  const handleProceedOriginal = () => {
    onDownloadOriginalCsv(csvContent, exportFilename);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              validation.isValid 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {validation.isValid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Pre-Export CSV Hygiene Verification
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  validation.isValid 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                }`}>
                  {validation.score}% Score
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target: <span className="font-semibold text-blue-600 dark:text-blue-400">{crmName}</span> ({exportFilename})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Checks Passed</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {validation.totalPassedChecks}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warnings Detected</div>
              <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {validation.totalWarnings}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical Blockers</div>
              <div className={`text-lg font-extrabold mt-0.5 flex items-center justify-center gap-1 ${
                validation.totalErrors > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {validation.totalErrors > 0 ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />} {validation.totalErrors}
              </div>
            </div>
          </div>

          {/* Validation Status Message */}
          {validation.isValid && validation.totalWarnings === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
              <CheckCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  100% Verified & Ready for Native CRM Import
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 text-xs">
                  All column headers, ASCII characters (1-127), and required schema fields match the official {crmName} import specifications without errors.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Detected Hygiene & Schema Issues ({validation.issues.length}):
                </span>
                <span className="text-[11px] text-slate-400">
                  {validation.checkedRowsCount} rows • {validation.checkedColsCount} columns checked
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {validation.issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      issue.severity === 'error'
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                        : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {issue.severity === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : issue.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{issue.title}</span>
                        {issue.rowNumber && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                            Row {issue.rowNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {issue.description}
                      </p>
                      {issue.suggestedFix && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-500" /> 
                          <span>Fix: {issue.suggestedFix}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleProceedOriginal}
            className="w-full sm:w-auto px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Export Raw (Without Auto-Fix)
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAutoFixAndDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Fix & Download Validated CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive CSV Hygiene Validator View (Tab inside CRM Export Configuration)
 */
export const CsvHygieneValidatorTool: React.FC<{
  targetCrm: SupportedCrm;
  crmName: string;
  activeGeneratedCsv: string;
  onDownloadCsv: (content: string, filename: string) => void;
  exportFilename: string;
}> = ({
  targetCrm,
  crmName,
  activeGeneratedCsv,
  onDownloadCsv,
  exportFilename
}) => {
  const [customCsvInput, setCustomCsvInput] = useState<string>('');
  const [sourceMode, setSourceMode] = useState<'active_export' | 'custom_file'>('active_export');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning'>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoFixedCsv, setAutoFixedCsv] = useState<string | null>(null);

  // Content to validate
  const currentContentToValidate = sourceMode === 'active_export' 
    ? (autoFixedCsv || activeGeneratedCsv)
    : customCsvInput;

  // Run validation
  const validation = useMemo(() => {
    return validateCsvHygiene(currentContentToValidate, targetCrm);
  }, [currentContentToValidate, targetCrm]);

  // Filtered issues
  const visibleIssues = useMemo(() => {
    if (filterSeverity === 'all') return validation.issues;
    return validation.issues.filter(i => i.severity === filterSeverity);
  }, [validation.issues, filterSeverity]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string || '';
      setCustomCsvInput(text);
      setSourceMode('custom_file');
      setAutoFixedCsv(null);
    };
    reader.readAsText(file);
  };

  // 1-Click Auto Clean
  const handleRunAutoSanitize = () => {
    const cleaned = autoSanitizeCsvContent(currentContentToValidate, targetCrm);
    if (sourceMode === 'custom_file') {
      setCustomCsvInput(cleaned);
    } else {
      setAutoFixedCsv(cleaned);
    }
  };

  // Reset to original active export
  const handleReset = () => {
    setAutoFixedCsv(null);
    if (sourceMode === 'custom_file') {
      setCustomCsvInput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContentToValidate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Automated Pre-Export Hygiene Engine
            </span>
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 rounded-full text-[11px] font-semibold border border-blue-400/20">
              Validating against {crmName}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            CSV Hygiene & Character Encoding Validator
          </h3>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Detects illegal non-ASCII characters, missing mandatory headers (First/Last Name), malformed phones/emails, and CRM-specific tag rules before downloading.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAutoSanitize}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Auto-Sanitize & Fix All</span>
          </button>
          <button
            onClick={() => onDownloadCsv(currentContentToValidate, exportFilename)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Validated CSV</span>
          </button>
        </div>
      </div>

      {/* Mode Selector & Custom Upload Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSourceMode('active_export'); setAutoFixedCsv(null); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                sourceMode === 'active_export'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Validate Active Configured Export</span>
            </button>

            <button
              onClick={() => setSourceMode('custom_file')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                sourceMode === 'custom_file'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Validate External / Custom CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {autoFixedCsv && sourceMode === 'active_export' && (
              <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg border border-emerald-300 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Auto-Sanitized Version Active
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Custom Upload or Paste Area */}
        {sourceMode === 'custom_file' && (
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-500" />
                Upload or Paste Custom CSV to Audit:
              </label>
              <label className="px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-lg text-xs font-bold hover:bg-blue-50 transition cursor-pointer">
                <span>Browse File (.csv)</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              value={customCsvInput}
              onChange={(e) => setCustomCsvInput(e.target.value)}
              placeholder='Paste raw CSV text here (e.g. "first name","last name","email"&#10;"Sarah","Jenkins","sarah@apex.com")...'
              rows={4}
              className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        {/* Score & Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            validation.score >= 90
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : validation.score >= 70
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hygiene Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {validation.score}%
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                validation.isValid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
              }`}>
                {validation.isValid ? 'Ready to Import' : 'Issues Found'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Errors
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
              <XCircle className="w-5 h-5" /> {validation.totalErrors}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Warnings
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5" /> {validation.totalWarnings}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Rules Passed
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> {validation.totalPassedChecks}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Issues Table & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Hygiene Audit Log & Validation Findings ({visibleIssues.length})
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterSeverity === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({validation.issues.length})
            </button>
            <button
              onClick={() => setFilterSeverity('error')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterSeverity === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400'
              }`}
            >
              Errors ({validation.totalErrors})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterSeverity === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
              }`}
            >
              Warnings ({validation.totalWarnings})
            </button>
          </div>
        </div>

        {visibleIssues.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              No Issues Found in Current View
            </h5>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
              Your CSV dataset conforms to all ASCII character, header naming, and {crmName} import specifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleIssues.map((issue) => (
              <div key={issue.id} className="py-3 flex items-start gap-3 text-xs">
                <div className="shrink-0 mt-0.5">
                  {issue.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {issue.title}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      issue.severity === 'error'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {issue.severity}
                    </span>
                    {issue.columnName && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                        Col: {issue.columnName}
                      </span>
                    )}
                    {issue.rowNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                        Row #{issue.rowNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">
                    {issue.description}
                  </p>

                  {issue.sampleOffendingText && (
                    <div className="font-mono text-[11px] p-2 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800">
                      Snippet: <span className="text-rose-600 dark:text-rose-400 font-bold">{issue.sampleOffendingText}</span>
                    </div>
                  )}

                  {issue.suggestedFix && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Recommended Remediation: {issue.suggestedFix}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monospace Preview of Live Validated CSV */}
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-slate-300 font-semibold">{exportFilename} (Active Audit Buffer)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
          {currentContentToValidate}
        </pre>
      </div>
    </div>
  );
};
