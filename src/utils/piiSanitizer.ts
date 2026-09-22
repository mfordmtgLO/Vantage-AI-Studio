import { PiiMaskingConfig, PiiAuditRecord } from '../types';

export const DEFAULT_PII_CONFIG: PiiMaskingConfig = {
  mode: 'partial_mask',
  maskSsn: true,
  maskCreditCards: true,
  maskBankAccounts: true,
  maskPhoneNumbers: true,
  maskEmails: true,
  maskApiKeys: true,
  maskHipaaMedical: true,
  complianceStandards: ['HIPAA', 'GLBA', 'GDPR', 'SOC2'],
  autoSanitizeOnIngest: true,
};

// Regex patterns for sensitive identifiers
const SSN_REGEX = /\b(?!000|666|9\d{2})\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[- ]?){3}\d{4}\b|\b\d{15,16}\b/g;
const BANK_ROUTING_ACCOUNT_REGEX = /\b(?:Routing|RTN|ABA|Acct|Account)[:#\s]+([0-9]{8,17})\b/gi;
const PHONE_REGEX = /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
const API_KEY_REGEX = /\b(?:sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36}|key-[a-zA-Z0-9]{24,})\b/g;
const HIPAA_MEDICAL_KEYWORDS = /\b(?:HIV|Diabetes|Cancer|Depression|Prescription|Biopsy|Diagnosis|Patient ID|Medical Record #|MRN[:\s]+[0-9A-Za-z]+)\b/gi;

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

export function sanitizePiiContent(
  text: string,
  config: PiiMaskingConfig = DEFAULT_PII_CONFIG,
  sourceTitle: string = 'Untitled Memory'
): {
  sanitizedText: string;
  auditRecords: PiiAuditRecord[];
  isClean: boolean;
  blockedDueToAirgap: boolean;
} {
  let result = text;
  const auditRecords: PiiAuditRecord[] = [];

  const processReplacement = (
    match: string,
    type: PiiAuditRecord['detectedType'],
    maskFn: (m: string) => string
  ) => {
    let masked = '';
    if (config.mode === 'redact') {
      masked = `[REDACTED_${type}]`;
    } else if (config.mode === 'hash_token') {
      masked = `[TOKEN_${type}_${simpleHash(match)}]`;
    } else if (config.mode === 'strict_block') {
      masked = `[BLOCKED_AIRGAP_${type}]`;
    } else {
      masked = maskFn(match);
    }

    auditRecords.push({
      id: 'pii_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      detectedType: type,
      originalSnippet: match,
      maskedSnippet: masked,
      sourceMemoryTitle: sourceTitle,
      actionTaken: config.mode === 'redact' ? 'redacted' : config.mode === 'hash_token' ? 'tokenized' : config.mode === 'strict_block' ? 'blocked' : 'partially_masked',
    });

    return masked;
  };

  // 1. SSN
  if (config.maskSsn) {
    result = result.replace(SSN_REGEX, (m) =>
      processReplacement(m, 'SSN', (raw) => {
        const clean = raw.replace(/\D/g, '');
        return `***-**-${clean.slice(-4)}`;
      })
    );
  }

  // 2. Credit Cards
  if (config.maskCreditCards) {
    result = result.replace(CREDIT_CARD_REGEX, (m) =>
      processReplacement(m, 'CREDIT_CARD', (raw) => {
        const clean = raw.replace(/\D/g, '');
        return `****-****-****-${clean.slice(-4)}`;
      })
    );
  }

  // 3. API Keys
  if (config.maskApiKeys) {
    result = result.replace(API_KEY_REGEX, (m) =>
      processReplacement(m, 'API_KEY', (raw) => `${raw.substring(0, 4)}...[MASKED_KEY]`)
    );
  }

  // 4. Bank Accounts
  if (config.maskBankAccounts) {
    result = result.replace(BANK_ROUTING_ACCOUNT_REGEX, (full, acct) =>
      processReplacement(full, 'BANK_ACCOUNT', () => `Account: *****${acct.slice(-4)}`)
    );
  }

  // 5. Phone Numbers
  if (config.maskPhoneNumbers) {
    result = result.replace(PHONE_REGEX, (m, p1, p2, p3) =>
      processReplacement(m, 'PHONE', () => `(${p1}) ***-${p3}`)
    );
  }

  // 6. Emails
  if (config.maskEmails) {
    result = result.replace(EMAIL_REGEX, (m) =>
      processReplacement(m, 'EMAIL', (raw) => {
        const parts = raw.split('@');
        const user = parts[0];
        const domain = parts[1];
        return `${user.substring(0, 2)}***@${domain}`;
      })
    );
  }

  // 7. HIPAA Medical Keywords
  if (config.maskHipaaMedical) {
    result = result.replace(HIPAA_MEDICAL_KEYWORDS, (m) =>
      processReplacement(m, 'HIPAA_MEDICAL', () => `[HIPAA_PROTECTED_HEALTH_INFO]`)
    );
  }

  return {
    sanitizedText: result,
    auditRecords,
    isClean: auditRecords.length === 0,
    blockedDueToAirgap: config.mode === 'strict_block' && auditRecords.length > 0,
  };
}
