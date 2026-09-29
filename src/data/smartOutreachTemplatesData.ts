/**
 * @file smartOutreachTemplatesData.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Pre-Written, 100% APR-Compliant Smart Outreach Templates & Scripts
 * Focuses on 2-1 temporary rate buydowns, seller concessions, and low/no-down benefit stacking.
 * Guarantees zero ungrounded interest rate or monthly payment quotes for TILA-RESPA compliance.
 */

export type StrategyFilterKey = 'all' | '2-1 Buydown Strategies' | 'Seller Credit Tactics' | 'Zero Down Payment Options';

export interface SmartOutreachTemplate {
  id: string;
  title: string;
  scenario: string;
  channel: 'sms' | 'email' | 'forum' | 'realtor';
  strategyFilter: '2-1 Buydown Strategies' | 'Seller Credit Tactics' | 'Zero Down Payment Options';
  complianceCategory: string;
  hookSummary: string;
  templateBody: string;
  complianceNotes: string;
  strategicTip: string;
  recommendedAudience: string;
  tags: string[];
}

export const STRATEGY_FILTER_OPTIONS: { id: StrategyFilterKey; label: string; icon: string; badgeColor: string; description: string }[] = [
  {
    id: 'all',
    label: 'All Strategies',
    icon: '🌟',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Complete library of 100% APR-compliant outreach scripts'
  },
  {
    id: '2-1 Buydown Strategies',
    label: '2-1 Buydown Strategies',
    icon: '⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Stepped rate discounts (2% yr 1, 1% yr 2) funded by seller escrow accounts'
  },
  {
    id: 'Seller Credit Tactics',
    label: 'Seller Credit Tactics',
    icon: '🏷️',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Negotiating closing cost credits and co-marketing with listing agents'
  },
  {
    id: 'Zero Down Payment Options',
    label: 'Zero Down Payment Options',
    icon: '🌾',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'USDA 100% RD, Lakeview National DPA, and zero-down benefit stacking'
  }
];

export const SMART_OUTREACH_TEMPLATES: SmartOutreachTemplate[] = [
  // ==========================================
  // 1. 2-1 BUYDOWN STRATEGIES
  // ==========================================
  {
    id: 'sms_21_buydown_intro',
    title: '📱 SMS: 2-1 Rate Buydown Strategy vs Price Drop',
    scenario: 'Initial SMS reply to buyer concerned about current interest rates',
    channel: 'sms',
    strategyFilter: '2-1 Buydown Strategies',
    complianceCategory: '2-1 Rate Buydown',
    hookSummary: 'Shows how seller credits fund 2 years of lower payments without price drop friction',
    templateBody: `Hi {{buyerName}}, saw your question on {{city}} home buying! Instead of waiting on market rates, have you looked into a seller-paid 2-1 temporary rate buydown? The seller funds 2% off the rate in Year 1 and 1% in Year 2. Let's review how this works on {{propertyAddress}}! — {{loName}}, NMLS #{{nmls}} {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Explains buydown structure (2% yr 1, 1% yr 2) funded by seller credits without quoting specific APR or dollar payments.',
    strategicTip: 'Use for instant SMS replies when a lead expresses hesitation about monthly affordability.',
    recommendedAudience: 'First-time homebuyers, tech workers, young families feeling payment strain',
    tags: ['SMS', '2-1 Buydown', 'Seller Concessions', 'Fast Outreach']
  },
  {
    id: 'email_21_buydown_master',
    title: '📧 Email: Complete 2-1 Temporary Rate Buydown Master Blueprint',
    scenario: 'In-depth consultative email explaining the math and strategy of seller buydowns',
    channel: 'email',
    strategyFilter: '2-1 Buydown Strategies',
    complianceCategory: '2-1 Rate Buydown',
    hookSummary: 'Comprehensive explanation of seller buydowns, escrow subsidies, and future refinancing flexibility',
    templateBody: `Subject: Smarter financing strategy for your {{city}} home search: The Seller-Paid 2-1 Buydown

Hi {{buyerName}},

I noticed your inquiry regarding mortgage options and home affordability in {{city}}. With today's market dynamics, many first-time buyers feel caught between wanting to own a home and wanting a comfortable initial monthly budget.

Here is a strategy we are using successfully for buyers across {{city}}: The Seller-Funded 2-1 Temporary Rate Buydown.

Here is how it works:
1. We negotiate a 2% to 3% seller concession into your purchase contract on {{propertyAddress}} (at zero extra cost to you).
2. The seller funds an upfront escrow account at closing that subsidizes your interest rate:
   • Year 1: Your effective note rate is discounted by 2.00%
   • Year 2: Your effective note rate is discounted by 1.00%
   • Year 3+: Your loan settles into the permanent fixed note rate
3. If market rates improve during Years 1 or 2, any remaining seller funds in your buydown escrow account are credited directly toward reducing your principal balance upon refinancing!

This gives you the best of both worlds: you lock in today's home price while enjoying 2 full years of stepped-down payment comfort.

Would you have 10 minutes this week for a custom financing strategy session? I can prepare a side-by-side comparison tailored to your target price range.

Best regards,

{{loName}}
Managing Loan Officer | NMLS #{{nmls}}
Direct: {{loPhone}}
Licensed Mortgage Specialist`,
    complianceNotes: '100% APR Compliant: Explains legal escrow mechanics and stepped percentage adjustments without trigger APR figures.',
    strategicTip: 'Send to leads who have downloaded a buyer guide or inquired about affordability on MLS listings.',
    recommendedAudience: 'Engaged buyers looking for clear financial mechanics',
    tags: ['Email', 'In-Depth', '2-1 Buydown', 'Escrow Subsidy', 'Refi Credit']
  },
  {
    id: 'forum_reddit_buydown_reply',
    title: '💬 Forum/Reddit: Compliant Consultative Reply on 2-1 Buydown',
    scenario: 'Replying to Reddit or BiggerPockets threads discussing rate worries and affordability',
    channel: 'forum',
    strategyFilter: '2-1 Buydown Strategies',
    complianceCategory: '2-1 Rate Buydown',
    hookSummary: 'Educates the community on seller buydowns, builds LO credibility, and invites compliant 1-on-1 strategy',
    templateBody: `Great discussion on {{city}} home affordability! As a licensed loan officer with 26 years in the local market, one tool that is making a huge difference right now is structuring offers with a Seller-Funded 2-1 Temporary Buydown.

Rather than asking the seller to drop the price by $10k (which only changes monthly cash flow by roughly $50–$60), having the seller contribute that same amount toward a 2-1 buydown discounts your interest rate by 2% for Year 1 and 1% for Year 2. 

Key benefits to ask your lender about:
1. It is 100% funded by seller concessions — zero extra cash from you.
2. If rates drop and you refinance in Year 1 or 2, unspent seller subsidy funds reduce your loan payoff.
3. It can be stacked with zero-down programs like USDA RD or low-down assistance where allowed.

If anyone wants to see the scenario modeling for {{city}} neighborhoods, feel free to shoot me a DM! — {{loName}} (NMLS #{{nmls}})`,
    complianceNotes: '100% APR Compliant: Community-first educational tone with zero rate quotes and full NMLS transparency.',
    strategicTip: 'Post on high-intent Reddit/forum threads to generate organic inbound DMs.',
    recommendedAudience: 'Reddit r/FirstTimeHomeBuyer, r/Portland, BiggerPockets members',
    tags: ['Reddit', 'Forum', 'BiggerPockets', 'Social Outreach', 'Authority Building']
  },
  {
    id: 'objection_waiting_for_rates',
    title: '📉 Objection Handler: "I\'m Waiting for Interest Rates to Drop"',
    scenario: 'Overcoming the objection of buyers delaying their purchase until rates drop',
    channel: 'email',
    strategyFilter: '2-1 Buydown Strategies',
    complianceCategory: '2-1 Rate Buydown',
    hookSummary: 'Reframes waiting as a risk: buy at today\'s price with 2 years of lower payments and free future refi',
    templateBody: `Subject: Why waiting for interest rates to drop could cost more than buying today in {{city}}

Hi {{buyerName}},

A lot of buyers I talk with in {{city}} tell me: "I think I'll wait until interest rates come down before buying."

It's an understandable thought, but here is the hidden trap in that strategy:
When rates drop, millions of sidelined buyers rush back into the market simultaneously, triggering bidding wars and rapid home price appreciation.

A much safer strategy is: "Marry the home, date the rate, and let the seller pay for the date."

With a Seller-Funded 2-1 Temporary Buydown:
1. You purchase {{propertyAddress}} now while seller concessions are readily available.
2. The seller pays for your payment discount for the first 2 years (2% lower yr 1, 1% lower yr 2).
3. When rates eventually adjust, you refinance into a lower permanent rate — and any unused seller subsidy funds go toward paying down your loan balance!

You get today's negotiated purchase price AND lower initial payments.

Let's do a quick 10-minute strategy call this week to review your numbers.

Best,

{{loName}}
NMLS #{{nmls}} | {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Strategic objection handling without committing to unverified interest rates.',
    strategicTip: 'Extremely effective at moving stalled prospects from hesitation into active prequalification.',
    recommendedAudience: 'Stalled leads, inactive database prospects, hesitant first-time buyers',
    tags: ['Objection Buster', 'Market Timing', 'Refi Strategy', '2-1 Buydown']
  },

  // ==========================================
  // 2. SELLER CREDIT TACTICS
  // ==========================================
  {
    id: 'sms_seller_credits_strategy',
    title: '🏷️ SMS: Seller Closing Credits vs Cutting Purchase Price',
    scenario: 'Buyer negotiating an offer or asking for a price reduction',
    channel: 'sms',
    strategyFilter: 'Seller Credit Tactics',
    complianceCategory: 'Seller Credits',
    hookSummary: 'Explains why $10k in seller closing concessions helps cash flow 3x more than a $10k price cut',
    templateBody: `Hi {{buyerName}}! Quick strategy note on {{propertyAddress}}: asking the seller for a $10k closing credit to fund a temporary rate buydown lowers your initial monthly cash outflow significantly more than just shaving $10k off the price. Happy to model both for you today! — {{loName}} {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Focuses on comparative loan structuring and cash flow impact.',
    strategicTip: 'Great for active shoppers who have already found a property with lingering market days.',
    recommendedAudience: 'Active home shoppers putting in purchase offers',
    tags: ['SMS', 'Seller Credits', 'Negotiation', 'Closing Costs']
  },
  {
    id: 'realtor_copitch_listing_agent',
    title: '🤝 Realtor: Script for Listing Agents & Co-Branded Marketing',
    scenario: 'Pitching listing agents on advertising a 2-1 buydown on their sluggish listings',
    channel: 'realtor',
    strategyFilter: 'Seller Credit Tactics',
    complianceCategory: 'Seller Credits',
    hookSummary: 'Shows listing agents how a 2-1 buydown sells listings faster without cutting the list price',
    templateBody: `Subject: Listing Strategy for {{propertyAddress}}: Attract 3x more qualified buyers with a 2-1 Buydown

Hi {{realtorPartner}},

I noticed your listing at {{propertyAddress}} in {{city}}. With today's buyer rate sensitivity, standard price drops often get overlooked.

Instead of reducing the listing price by $15,000, what if we advertise: "Seller Offering 2-1 Rate Buydown — Enjoy a 2% Discount on Year 1 Payments!"

Why this benefits your seller:
• Preserves the neighborhood comp and top-line sales price.
• Provides buyers 3x to 4x greater initial monthly payment relief than a price cut.
• Expands the buyer pool to first-time buyers who were previously on the fence.

I can provide co-branded open house flyers and social graphics modeling this strategy for {{propertyAddress}}. Let me know if you'd like me to send a sample over!

Best,

{{loName}}
Managing Loan Officer | NMLS #{{nmls}} • {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Focuses on B2B listing marketing economics and co-branded flyer generation.',
    strategicTip: 'Send to real estate agents with active listings on market for 21+ days.',
    recommendedAudience: 'Listing agents, buyer agents, real estate brokerages',
    tags: ['Realtor', 'Listing Strategy', 'Co-Marketing', 'Open House Flyers']
  },
  {
    id: 'email_offer_concession_framework',
    title: '📧 Email: How to Structure Offers with 3% Seller Concessions',
    scenario: 'Coaching buyers on writing strong purchase offers with built-in seller credit addenda',
    channel: 'email',
    strategyFilter: 'Seller Credit Tactics',
    complianceCategory: 'Seller Credits',
    hookSummary: 'Guides the buyer and buyer agent on structuring purchase contracts with maximum allowable seller credits',
    templateBody: `Subject: Structuring your purchase offer on {{propertyAddress}}: Maximize Seller Credits

Hi {{buyerName}},

As you prepare to make an offer with {{realtorPartner}} on {{propertyAddress}} in {{city}}, here is our strategic recommendation to protect your out-of-pocket cash:

Instead of offering below asking price, structure the offer at full market value with a request for 2.5% to 3.0% in Seller Closing Concessions.

How we allocate these seller credits at closing:
1. We fund a 2-1 Temporary Rate Buydown (reducing your Year 1 rate by 2% and Year 2 rate by 1%).
2. Any remaining credit covers non-recurring closing costs, title, and escrow fees.
3. Your seller nets their target price, while your initial monthly outlay drops significantly.

I am available to coordinate directly with {{realtorPartner}} to ensure the exact contract wording complies with agency underwriting limits.

Best regards,

{{loName}}
Managing Loan Officer | NMLS #{{nmls}} • {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Focuses on contract structuring, closing fee offsets, and LO-Agent coordination.',
    strategicTip: 'Send to buyers right before they write a purchase agreement.',
    recommendedAudience: 'Pre-approved buyers actively touring properties',
    tags: ['Email', 'Seller Credits', 'Purchase Contract', 'Offer Structuring']
  },

  // ==========================================
  // 3. ZERO DOWN PAYMENT OPTIONS
  // ==========================================
  {
    id: 'sms_usda_buydown_stack',
    title: '🌾 SMS: USDA 100% Zero-Down + 2-1 Buydown Stack',
    scenario: 'SMS outreach to suburban/rural homebuyer looking for 0% down options',
    channel: 'sms',
    strategyFilter: 'Zero Down Payment Options',
    complianceCategory: 'Zero Down Payment',
    hookSummary: 'Pairs 100% zero down financing with seller-funded 2-1 temporary buydown',
    templateBody: `Hi {{buyerName}}! Great news: properties in {{city}} qualify for USDA 100% zero-down financing. Even better, we can stack a seller-funded 2-1 temporary rate buydown so you bring $0 down AND enjoy a 2-year stepped payment discount. Free 10-min consultation? — {{loName}} {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Highlights 100% financing eligibility and benefit stacking without unverified rate promises.',
    strategicTip: 'Highest conversion rate for outer-suburban and rural corridor buyers.',
    recommendedAudience: 'Buyers shopping in USDA designated rural tracts',
    tags: ['SMS', 'USDA RD', 'Zero Down', '2-1 Buydown', 'Benefit Stacking']
  },
  {
    id: 'email_dpa_buydown_stack',
    title: '🏞️ Email: Stacking Down Payment Assistance (DPA) with Seller Buydowns',
    scenario: 'First-time buyer needing both down payment help and payment relief',
    channel: 'email',
    strategyFilter: 'Zero Down Payment Options',
    complianceCategory: 'Zero Down Payment',
    hookSummary: 'Shows how to combine Lakeview 100% or state bond grants with seller-paid rate buydowns',
    templateBody: `Subject: Maximizing benefits: Stacking Low/No Down Payment + 2-1 Seller Buydowns in {{city}}

Hi {{buyerName}},

When shopping for your first home, you don't have to choose between keeping your cash in the bank and getting a manageable monthly payment. We allow strategic Benefit Stacking!

Here is the exact framework we structure for buyers in {{city}}:
• Program 1 (Upfront Cash Assistance): We pair your purchase with Lakeview National 100% DPA, OHCS Flex FirstHome, or Fannie Mae HomeReady 3% to eliminate or minimize upfront down payment requirements.
• Program 2 (Monthly Payment Relief): We write a seller concession request into your offer to fund a 2-1 temporary rate buydown (2% lower in Year 1, 1% lower in Year 2).

The result: You keep your emergency reserves intact while easing into homeownership with two years of reduced monthly payments.

Let's schedule a brief 15-minute phone review to confirm which programs match your preferred neighborhoods in {{city}}.

Warm regards,

{{loName}}
NMLS #{{nmls}} • Direct: {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Focuses on combining DPA programs with seller concession buydowns.',
    strategicTip: 'Ideal for prospective buyers who have modest savings but solid household income.',
    recommendedAudience: 'First-time buyers needing both low cash out of pocket and low initial payments',
    tags: ['Email', 'DPA Stacking', 'Lakeview 100%', 'OHCS', '2-1 Buydown']
  },
  {
    id: 'sms_reengage_rent_hike',
    title: '🏠 SMS: Re-Engage Renter with 0-Down + Buydown Stack',
    scenario: 'Re-engaging a past renter prospect whose lease is renewing',
    channel: 'sms',
    strategyFilter: 'Zero Down Payment Options',
    complianceCategory: 'Zero Down Payment',
    hookSummary: 'Turns rent inflation into a reason to explore seller-funded rate buydowns and 0-down programs',
    templateBody: `Hi {{buyerName}}, {{loName}} here! With rent prices climbing across {{city}}, wanted to share that many sellers are currently funding 2-1 temporary rate buydowns (2% lower Year 1) plus USDA/DPA zero-down options. Would you be open to a quick check to see what your homebuying numbers look like? — {{loPhone}}`,
    complianceNotes: '100% APR Compliant: Pure conversational engagement focused on homeownership transition.',
    strategicTip: 'Perfect for 60-day lease renewal re-engagement campaigns.',
    recommendedAudience: 'Current renters facing lease renewal or rent increases',
    tags: ['SMS', 'Renters', 'Re-Engagement', '2-1 Buydown', 'Zero Down']
  },
  {
    id: 'forum_zero_down_pmi_bypass',
    title: '💬 Forum/Reddit: Zero Down Financing & PMI Elimination Strategy',
    scenario: 'Community post explaining USDA 0% down and Lakeview 100% DPA without ungrounded payment claims',
    channel: 'forum',
    strategyFilter: 'Zero Down Payment Options',
    complianceCategory: 'Zero Down Payment',
    hookSummary: 'Explains how 100% zero-down programs work in local census tracts and pairs with seller credits',
    templateBody: `For anyone shopping for homes in {{city}} who thinks you still need 20% down: You don't! 

In many parts of {{city}} and surrounding counties, we have two 100% financing avenues:
1. USDA Rural Housing (0% Down): 100% financing for eligible areas, often paired with low monthly guarantee fees instead of standard private mortgage insurance.
2. Lakeview National 100% DPA: Provides a 100% first + second loan combo across all 50 states for eligible credit tiers.

Even better, we can stack these zero-down programs with seller-paid closing credits or a 2-1 temporary rate buydown.

Happy to check tract eligibility for anyone looking in {{city}}! — {{loName}} (NMLS #{{nmls}})`,
    complianceNotes: '100% APR Compliant: Educational overview of 100% USDA & DPA eligibility with full NMLS transparency.',
    strategicTip: 'Post on first-time homebuyer community threads to capture high-intent leads.',
    recommendedAudience: 'Renters and buyers seeking 100% financing options',
    tags: ['Forum', 'Reddit', 'USDA RD', 'Lakeview 100%', 'Zero Down']
  }
];
