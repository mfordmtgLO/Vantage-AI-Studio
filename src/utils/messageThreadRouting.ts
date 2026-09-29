/**
 * @file messageThreadRouting.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Lead Outreach MessageThreadID Mapping & AI 2nd Brain Direct Comment Anchor Engine
 * Ensures each discovery scrape lead has a unique persistent MessageThreadID and TargetCommentID
 * so AI 2nd brain email and SMS replies include explicit header metadata anchoring them
 * directly to the specific prospect's comment rather than the general forum/blog thread.
 */

export interface MessageThreadMetadata {
  messageThreadId: string;      // Unique conversation thread identifier (e.g., th_lead_pdx_renter_99_a7b2)
  targetCommentId: string;      // Specific original user comment identifier (e.g., cmt_pdx_99_f812)
  parentMessageId?: string;     // Direct parent message ID
  leadId: string;               // Scrape lead identifier
  author: string;               // Lead username / author handle
  platform: string;             // Reddit / Blog / Chat / Forum
  routeTarget: 'direct_user_comment';
  createdAt: string;
  updatedAt: string;
}

export interface FormattedOutreachPayload {
  messageThreadId: string;
  targetCommentId: string;
  rfc2822Headers: Record<string, string>;
  emailSubject: string;
  emailBodyWithHeaders: string;
  smsPayloadWithRef: string;
  directCommentPayload: string;
  webComposeUrl: string;
  iphoneSmsUrl: string;
}

const STORAGE_THREAD_MAPPING_KEY = 'vantage_lead_message_thread_mappings_v1';

/**
 * Generate a deterministic hash snippet from a string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16);
  return hex.padStart(6, '0').slice(0, 6);
}

/**
 * Sanitize an author handle for use in thread tokens
 */
function sanitizeToken(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16);
}

/**
 * Retrieve all registered thread mappings from localStorage
 */
export function getAllMessageThreadMappings(): Record<string, MessageThreadMetadata> {
  try {
    const raw = localStorage.getItem(STORAGE_THREAD_MAPPING_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load message thread mappings:', err);
    return {};
  }
}

/**
 * Persist thread mappings to localStorage
 */
function saveAllMessageThreadMappings(mappings: Record<string, MessageThreadMetadata>): void {
  try {
    localStorage.setItem(STORAGE_THREAD_MAPPING_KEY, JSON.stringify(mappings));
  } catch (err) {
    console.warn('Failed to persist message thread mappings:', err);
  }
}

/**
 * Get or register a unique MessageThreadID and TargetCommentID for a given lead.
 * Guarantees idempotency and persistence across app turns.
 */
export function getOrRegisterMessageThread(
  leadId: string,
  author: string = 'prospect',
  platform: string = 'forum',
  explicitCommentId?: string
): MessageThreadMetadata {
  const mappings = getAllMessageThreadMappings();

  if (mappings[leadId]) {
    const existing = mappings[leadId];
    if (explicitCommentId && existing.targetCommentId !== explicitCommentId) {
      existing.targetCommentId = explicitCommentId;
      existing.updatedAt = new Date().toISOString();
      mappings[leadId] = existing;
      saveAllMessageThreadMappings(mappings);
    }
    return existing;
  }

  const cleanAuthor = sanitizeToken(author);
  const cleanPlatform = sanitizeToken(platform);
  const hashKey = simpleHash(`${leadId}_${cleanAuthor}_${cleanPlatform}`);
  const now = new Date().toISOString();

  const generatedThreadId = `th_${cleanAuthor}_${hashKey}`;
  const generatedCommentId = explicitCommentId || `cmt_${cleanAuthor}_${simpleHash(`${hashKey}_comment`)}`;

  const newMetadata: MessageThreadMetadata = {
    messageThreadId: generatedThreadId,
    targetCommentId: generatedCommentId,
    parentMessageId: generatedCommentId,
    leadId,
    author,
    platform,
    routeTarget: 'direct_user_comment',
    createdAt: now,
    updatedAt: now
  };

  mappings[leadId] = newMetadata;
  saveAllMessageThreadMappings(mappings);

  return newMetadata;
}

/**
 * Generate complete AI 2nd Brain header metadata formatting for an email or SMS reply.
 * This guarantees the reply is anchored directly to the user's specific comment ID.
 */
export function formatAiBrainOutreachHeaders(
  metadata: MessageThreadMetadata,
  baseSubject: string,
  bodyText: string,
  recipientEmail: string = 'fordmj@gmail.com',
  toPhoneDigits: string = '5417292097'
): FormattedOutreachPayload {
  const { messageThreadId, targetCommentId, author, platform } = metadata;

  // Domain token for RFC 2822 Message-ID standards
  const platformDomain = platform.toLowerCase().includes('reddit')
    ? 'reddit.internal'
    : platform.toLowerCase().includes('pnw') || platform.toLowerCase().includes('blog')
    ? 'pnwrealestateblog.org'
    : 'vantageai.internal';

  // 1. RFC 2822 Email Headers
  const rfc2822Headers: Record<string, string> = {
    'X-Message-Thread-ID': messageThreadId,
    'X-Target-Comment-ID': targetCommentId,
    'X-Direct-Reply-Target': author,
    'X-Route-Mode': 'direct_parent_comment_anchor',
    'In-Reply-To': `<${targetCommentId}@${platformDomain}>`,
    'References': `<${messageThreadId}@${platformDomain}>`
  };

  // 2. Email Subject Line tagged with Thread Reference
  const emailSubject = baseSubject.includes(messageThreadId)
    ? baseSubject
    : `${baseSubject} [Thread: #${messageThreadId}]`;

  // 3. Visible AI 2nd Brain Routing Header Block in Email Body
  const headerBlock = [
    `// ─── VANTAGE AI 2ND BRAIN • DIRECT COMMENT ROUTING METADATA ───`,
    `// MessageThreadID: ${messageThreadId}`,
    `// Target-Comment-ID: #${targetCommentId} (In-Reply-To Direct Parent)`,
    `// Direct-Recipient: @${author} (${platform})`,
    `// Routing-Anchor: Direct User Comment (Isolated from general thread noise)`,
    `// ───────────────────────────────────────────────────────────────`,
    ``
  ].join('\n');

  const emailBodyWithHeaders = bodyText.includes(messageThreadId)
    ? bodyText
    : `${headerBlock}${bodyText}`;

  // 4. SMS Payload with embedded Header Reference Tag
  const smsTag = `[Thread: #${messageThreadId} -> @${author}]`;
  const cleanBodyText = bodyText
    .replace(/\/\/\s*───[\s\S]*?───\s*\n\n?/g, '') // strip header block if present in body
    .trim();
  const smsPayloadWithRef = cleanBodyText.includes(messageThreadId)
    ? cleanBodyText
    : `${smsTag} ${cleanBodyText}`;

  // 5. Direct Forum / Blog Comment Payload with Explicit Tagging
  const directCommentPayload = `@${author} (In-Reply-To #${targetCommentId}):\n${cleanBodyText}`;

  // 6. 1-Click URLs
  const webComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyWithHeaders)}`;
  const iphoneSmsUrl = `sms:+1${toPhoneDigits}?body=${encodeURIComponent(smsPayloadWithRef.slice(0, 300))}`;

  return {
    messageThreadId,
    targetCommentId,
    rfc2822Headers,
    emailSubject,
    emailBodyWithHeaders,
    smsPayloadWithRef,
    directCommentPayload,
    webComposeUrl,
    iphoneSmsUrl
  };
}
