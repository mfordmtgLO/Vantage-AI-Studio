# 📦 Vantage AI Studio • Commercial Export Wizard & Customer BYOK Delivery Guide
**Author & Commercial Licensor:** Mike Ford (`fordmj@gmail.com`)  
**Product Line:** Vantage AI Workspace Studio • 6-Plugin Modular Archetype Suite  
**Target Delivery:** Digital Download / Customer Handoff Package for Enterprise & Professional Clients  

---

## 📑 Executive Overview

This master guide provides the complete operational blueprint for exporting, packaging, licensing, and delivering **Vantage AI Studio** plugin modules to purchasing customers.

Specifically tailored for customer sales scenarios across all **6 Modular Plugin Archetypes**:
1. **Cognitive 2nd Brain Engine** (`VantageBrainHarnessPlugin`): Autonomous DeepSeek & Gemini agent harness with web search, cron task scheduler, and persistent vector memory.
2. **Real Estate GeoMap & MLS Intelligence Plugin** (`VantageGeoMapPlugin`): Geospatial MLS property search with GIS boundary overlays, USDA 0% down rural zones, CRA LMI subsidy grant tracts, and live P&I mortgage estimators.
3. **Voice Orchestrator Plugin Module** (`VantageVoiceAssistantPlugin`): Speech-to-action macro engine with live audio waveform equalizer visualizer, hotword detection ("Hey Copilot", "Good morning briefing"), and verbal airgap confirmations.
4. **Google Workspace UI Plugin Module** (`VantageWorkplaceUIPlugin`): Embeddable cockpit with interactive tabs (Studio, Logic Orchestrator, Gmail Drafts, Drive Explorer, Sheets SQL, Tasks, Calendar, and Contacts).
5. **Commercial Enterprise Suite (All-in-One)** (`VantageEnterpriseSuitePlugin`): Master commercial enterprise package unifying all standalone plugins into a single multi-tenant workspace with license key validation and domain-locking.
6. **Mobile Micro-Apps & Add-to-Home-Screen PWA Plugin** (`VantageMobileMicroAppsPlugin`): Zero-install Progressive Web App (PWA) client portal with Add-to-Home-Screen prompts, biometric authentication, offline cache, and shareable magic lead links.

---

# 🛠️ Part 1: Commercial Export Wizard Walkthrough

When preparing a customer bundle from the Vantage AI Studio Flagship Suite:

### Step 1: Launch the Export Wizard in Vantage AI Studio
1. Open the **Flagship Studio Suite / Standalone Plugin Archetype Generator** or click **"Export Plugin Archetype"** from the navigation bar.
2. Select from the **6 Modular Plugin Archetypes**:
   - 🧠 **Vantage AI 2nd Brain Engine** (`vantage-2ndbrain-core-v2.5`)
   - 🗺️ **Vantage Real Estate GeoMap & MLS** (`vantage-geomap-spatial-v2.5`)
   - 🎙️ **Vantage Voice Orchestrator** (`vantage-voice-macros-v2.5`)
   - 🏢 **Vantage Google Workspace UI Cockpit** (`vantage-workspace-ui-v2.5`)
   - 📦 **Commercial Enterprise All-in-One Suite** (`vantage-enterprise-suite-v2.5`)
   - 📱 **Mobile Micro-Apps & PWA Portal** (`vantage-mobile-pwa-v2.5`)
3. **Configure Archetype Specific Parameters**:
   - Industry & Persona Focus (Mortgage & Real Estate, Healthcare, Legal, Tech SaaS, or Blank Slate)
   - Execution Boundaries (`Autonomous Background` vs. `Require User Confirmation`)
   - Allowed Domain Locks (e.g., `*.clientdomain.com`, `localhost`)

### Step 2: Set Commercial Licensing & Attribution
- **Creator & Licensor:** `Mike Ford <fordmj@gmail.com>`
- **License Type:** `Single-Organization Commercial License` or `Multi-Seat Enterprise Distribution`
- **Customer / Organization Name:** *[Purchasing Brokerage / Client Company]*
- **License Key:** Auto-generated `VAN-{PREFIX}-{HASH}-2026`
- **Attribution Watermark:** Retained across all TypeScript source files, manifests, and ZIP exports.

### Step 3: Generate the Digital Distribution Package
Click **"Generate & Download Watermarked Distribution Package (.ZIP)"** or copy individual artifacts:
- Complete Standalone React Component (`.tsx`)
- Headless React Hook (`useVantage*`)
- Express Backend Router (`vantage*Router.ts`)
- DSH CLI / Manifest Profile (`.yaml` / `.json`)
- Universal HTML `<script>` Embed Snippet

---

# 📁 Part 2: Structure of the Digital Delivery Package (.ZIP)

The generated archive contains everything the customer needs to deploy the solution immediately:

```text
📦 Vantage_AI_Commercial_Plugin_Suite_v2.5.zip
├── 📄 README.md                                  <-- Customer setup & quickstart guide
├── 📄 SETUP_AND_INSTALLATION_GUIDE.pdf           <-- Formatted executive guide
├── 📄 LICENSE.txt                                <-- Commercial license from Mike Ford
├── 📄 distribution_manifest.json                 <-- SHA256-MF Anti-tamper license metadata
├── 📁 plugin_modules/
│   ├── 📁 01_second_brain_engine/
│   │   ├── 📄 VantageBrainHarnessPlugin.tsx      <-- Standalone React UI widget
│   │   ├── 📄 useVantageBrainHarness.ts          <-- Headless React hook
│   │   ├── 📄 vantageHarnessRouter.ts            <-- Express / Node.js backend router
│   │   └── 📄 dsh-profile.yaml                   <-- DSH CLI configuration
│   ├── 📁 02_real_estate_geomap/
│   │   ├── 📄 VantageGeoMapPlugin.tsx            <-- Interactive GIS & MLS React widget
│   │   ├── 📄 useVantageGeoMap.ts                <-- Headless GeoMap hook
│   │   ├── 📄 vantageGeoMapRouter.ts             <-- Parcel geocoding & DPA API router
│   │   └── 📄 geomap-manifest.json               <-- GIS layer configuration
│   ├── 📁 03_voice_orchestrator/
│   │   ├── 📄 VantageVoiceAssistantPlugin.tsx    <-- Voice macro equalizer widget
│   │   ├── 📄 useVantageVoiceAssistant.ts        <-- Speech synthesis & recognition hook
│   │   ├── 📄 vantageVoiceRouter.ts              <-- Voice macro execution backend
│   │   └── 📄 voice-manifest.json                <-- Intent recognition schema
│   ├── 📁 04_workspace_ui_cockpit/
│   │   ├── 📄 VantageWorkplaceUIPlugin.tsx       <-- Google Workspace UI widget
│   │   ├── 📄 useVantageWorkplaceUI.ts           <-- Google Workspace API hook
│   │   ├── 📄 vantageWorkplaceRouter.ts          <-- OAuth & GSI backend router
│   │   └── 📄 workplace-manifest.json            <-- 7 Google Apps action matrix
│   ├── 📁 05_enterprise_suite/
│   │   ├── 📄 VantageEnterpriseSuitePlugin.tsx   <-- Unified 6-in-1 Master Cockpit
│   │   ├── 📄 useVantageEnterpriseSuite.ts       <-- Multi-tenant license hook
│   │   ├── 📄 vantageEnterpriseRouter.ts         <-- Enterprise gateway router
│   │   └── 📄 enterprise-manifest.json           <-- Master suite configuration
│   └── 📁 06_mobile_microapps_pwa/
│       ├── 📄 VantageMobileMicroAppsPlugin.tsx   <-- Add-to-Home-Screen PWA widget
│       ├── 📄 useVantageMobileMicroApp.ts        <-- PWA install prompt & offline hook
│       ├── 📄 vantageMobileRouter.ts             <-- Magic link & lead capture router
│       └── 📄 manifest.webmanifest               <-- Web App Manifest for mobile install
└── 📁 byok_configuration/
    ├── 📄 .env.example                           <-- Template with GEMINI, DEEPSEEK, & MAPS keys
    └── 📄 BYOK_3_MINUTE_QUICKSTART.md           <-- Customer guide to obtain free/low-cost API keys
```

---

# 📋 Part 3: Customer-Facing Onboarding & BYOK Setup Guide
*(This section is included directly inside the customer package `README.md` and `SETUP_AND_INSTALLATION_GUIDE.pdf`)*

```markdown
# 🚀 Vantage AI Studio • Commercial Plugin Suite
### Installation, Integration & Bring Your Own Key (BYOK) Guide
**Licensed by:** Mike Ford (fordmj@gmail.com)  
**Modules Included:** 6 Standalone Modular Plugin Archetypes

---

## 🌟 What You Have Received
Your purchase includes the full **Vantage AI Studio Commercial Suite**, giving your organization instant access to cognitive memory agents, real estate spatial mapping, voice-to-action macros, Google Workspace integration, enterprise master cockpits, and mobile PWA client portals.

---

## 🔑 Phase 1: 3-Minute Bring Your Own Key (BYOK) Setup
To provide direct, zero-markup AI execution, Vantage AI Studio operates on a **BYOK model**. Your data is never shared, and requests route directly between your browser and the underlying AI providers.

### 1. Google Gemini API Key (Required for 2nd Brain Reasoning & Ground Search)
1. Navigate to **[Google AI Studio](https://aistudio.google.com/)** and sign in with your Google account.
2. Click **"Get API Key"** in the top navigation bar.
3. Click **"Create API Key in new project"** (or select an existing Google Cloud project).
4. Copy your key (starts with `AIzaSy...`).
5. *Tier & Pricing:* Google AI Studio includes generous free tiers; standard usage typically costs fractions of a cent per day.

### 2. DeepSeek API Key (Optional / Recommended for DeepThink Analytical Fallback)
1. Go to the **[DeepSeek Open Platform](https://platform.deepseek.com/)** and create an account.
2. Navigate to **API Keys** in the left sidebar.
3. Click **"Create new API key"**, name it `Vantage Assistant`, and copy the token (`sk-...`).
4. Fund your account with $2.00–$5.00 (enough for tens of thousands of complex analyses).

### 3. Google Maps Platform API Key (Required for Real Estate GeoMap)
1. Go to **[Google Cloud Console - Maps Platform](https://console.cloud.google.com/google/maps-apis/)**.
2. Enable **Maps JavaScript API**, **Geocoding API**, and **Places API**.
3. Create an API key and restrict it to your website domain.
4. *Tier & Pricing:* Google provides a recurring $200/month free credit (covers 28,000+ map loads/month).

---

## ⚡ Phase 2: Activating Your Keys in the Application

### Option A: Via the In-App Settings Wizard (Zero Coding)
1. Open the Vantage Workspace UI in your browser.
2. Click the **Key Icon 🔑 ("API Settings / BYOK")** in the top right header.
3. Paste your **Gemini API Key**, **DeepSeek API Key**, and **Google Maps API Key**.
4. Click **"Test & Save Keys"**. The status indicator will turn **Green (Active)**.

### Option B: Via Server Environment (.env) for Self-Hosted Deployments
If hosting on Cloud Run, Docker, or your company VPS, copy `.env.example` to `.env`:

```bash
# Server Environment Configuration
GEMINI_API_KEY=AIzaSyYourGoogleGeminiKeyHere
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsPlatformKeyHere
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsPlatformKeyHere
PORT=3000
NODE_ENV=production
```

---

## 🛠️ Phase 3: Embedding Plugins into Your Existing Website/CRM

### Method 1: Drop-In Iframe Integration
```html
<!-- Vantage Real Estate GeoMap & MLS Embed -->
<iframe 
  src="https://your-domain.com/plugins/geomap" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  allow="geolocation; camera; microphone; clipboard-write;"
  style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"
></iframe>
```

### Method 2: React Component Import
```tsx
import { VantageGeoMapPlugin } from '@vantage/geomap-plugin';
import { VantageBrainHarnessPlugin } from '@vantage/brain-plugin';

export default function EnterprisePortal() {
  return (
    <div className="p-6 space-y-6">
      <VantageBrainHarnessPlugin defaultEngine="hybrid" />
      <VantageGeoMapPlugin 
        enableUsdaEligibleLayer={true}
        enableCraGrantLayer={true}
        defaultInterestRate={6.5}
      />
    </div>
  );
}
```

---

## 💡 Verified Capabilities Active on Day 1
- **Cognitive 2nd Brain**: Dynamic vector recall with DeepSeek R1 and Gemini 2.5 Flash hybrid reasoning.
- **Geospatial Real Estate**: Instant USDA 100% zero-down checks, CRA $5,000–$10,000 grant tract matches, and live P&I mortgage estimators.
- **Voice Macro Orchestration**: Hands-free verbal task execution with safety confirmation airgaps and audio waveform feedback.
- **Google Workspace Cockpit**: 7 Google Apps rotating actions, live Gmail draft generator, and Google Sheets relational database cleaner.
- **Enterprise All-in-One Suite**: Centralized multi-tenant admin console with domain-locked licensing.
- **Mobile Micro-Apps**: Add-to-Home-Screen PWA install triggers, biometric sign-in, and shareable magic lead links.
```

---

# 📊 Part 4: Digital Delivery Summary Matrix

| Delivery Milestone | Component / Action | Deliverable File | Responsible Party |
| :--- | :--- | :--- | :--- |
| **1. Package Generation** | Bundle chosen plugins or all 6 archetypes | `Vantage_AI_Commercial_Plugin_Suite_v2.5.zip` | Licensor (Mike Ford) |
| **2. Commercial Stamp** | License text & commercial ownership attribution | `LICENSE.txt` & `distribution_manifest.json` | Licensor (Mike Ford) |
| **3. Key Provisioning** | Generate Gemini, DeepSeek, and Google Maps API keys | `BYOK_3_MINUTE_QUICKSTART.md` | Customer IT / Admin |
| **4. Deployment** | Embed via Iframe, React Component, or Script Tag | `.tsx` component / HTML Embed | Customer Developer |
| **5. Operational Verification** | Test interactive sandboxes and live tools | In-App System Health Indicator | Customer End User |

---
*Document Version: 2.6.0 • Copyright (c) 2025-2026 Mike Ford (`fordmj@gmail.com`). All Rights Reserved.*

