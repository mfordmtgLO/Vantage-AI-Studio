# 📦 Vantage AI Studio • Export Wizard & Delivery Guide: Blank 2nd Brain + Real Estate Geomap
**Author & Commercial Licensor:** Mike Ford (`fordmj@gmail.com`)  
**Product Bundle:** Vantage AI Studio Blank 2nd Brain Base + Real Estate Geomap Spatial Intelligence Plugin  
**Target Delivery:** Turnkey Digital Download Package for Real Estate Brokerages, PropTech Startups, & Enterprise Developers  

---

## 📑 Executive Overview

This delivery package is designed for customers who purchased:
1. **Vantage AI Studio 2nd Brain Engine (Blank-Slate Base / Untrained Tabula Rasa)**: A clean cognitive memory layer, continuous knowledge ingestion daemon, semantic recall engine, and autonomous guardrails that the client can train from scratch on their own proprietary documents, internal SOPs, and company knowledge.
2. **Vantage AI Studio Real Estate Geomap Spatial Intelligence Plugin**: An interactive geospatial mapping and parcel intelligence module featuring census-tract DPA grant qualification, neighborhood boundary layers, property marker clustering, school ratings, hazard/flood overlays, and GIS spatial search.
3. **Turnkey BYOK (Bring Your Own Key) Configuration**: Complete instructions for provisioning **Google Gemini API**, **DeepSeek API**, and **Google Maps Platform API** keys.

---

# 🛠️ Part 1: Commercial Export Wizard Walkthrough

When configuring this specific bundle inside Vantage AI Studio:

### Step 1: Configure the Product Bundle in the Export Wizard
1. Open the **Flagship Studio Suite / Commercial License Protection Studio** or click **"Export Plugin Archetype"** from the top navigation.
2. Select the core products for the customer's order:
   - ✅ **Vantage AI 2nd Brain Engine** (`vantage-2ndbrain-core-v2.5`)
   - 🔘 **Industry Profile Setting**: Select **`Blank Slate / Untrained Base (Tabula Rasa)`** *(No pre-seeded industry rules or mock personas included — ready for custom client training)*.
   - ✅ **Vantage Real Estate Geomap Plugin Module** (`vantage-geomap-spatial-v2.5` including census tract lookup, marker clustering, spatial bounds filtering, and MLS coordinates geocoding).
3. **Set Guardrail Defaults**:
   - Persona: `Clean Enterprise Assistant / Unassigned Base`
   - Memory Architecture: Dynamic Vector Ingestion enabled
   - Execution Boundary: `Require Confirmation` (User can adjust to Autonomous post-install)

### Step 2: Set Commercial Licensing & Attribution
- **Creator & Licensor:** `Mike Ford <fordmj@gmail.com>`
- **License Type:** `Single-Organization Commercial License` or `PropTech Enterprise License`
- **Customer / Organization Name:** *[Purchasing Brokerage / PropTech Client Name]*
- **Watermark & License Seal:** Embedded into `license_manifest.json` and module headers.

### Step 3: Generate the Digital Distribution Package
Click **"Generate & Download Commercial Distribution Package (.ZIP)"**.

---

# 📁 Part 2: Structure of the Digital Delivery Package (.ZIP)

The exported archive provides a clean, modular file structure:

```text
📦 Vantage_AI_BlankBrain_and_RealEstateGeomap_Suite_v2.5.zip
├── 📄 README.md                                  <-- Master onboarding & quickstart guide
├── 📄 SETUP_AND_INSTALLATION_GUIDE.pdf           <-- Formatted executive guide
├── 📄 LICENSE.txt                                <-- Single-organization license from Mike Ford
├── 📁 plugin_modules/
│   ├── 📁 2nd_brain_blank_engine/
│   │   ├── 📄 brain_core_manifest.json           <-- Empty cognitive memory schema & vector config
│   │   ├── 📄 custom_training_template.json      <-- Blank template for customer to ingest their SOPs
│   │   ├── 📄 guardrails_config.json             <-- Configurable tone, boundaries, and data airgaps
│   │   └── 📄 brain_runtime.js                   <-- Standalone 2nd Brain execution engine
│   └── 📁 real_estate_geomap_plugin/
│       ├── 📄 geomap_bundle.js                   <-- Interactive Google Maps / Leaflet parcel UI component
│       ├── 📄 census_dpa_tracts_layer.json       <-- Fannie Mae HomeReady & USDA 100% boundary overlay
│       ├── 📄 styles.css                         <-- High-contrast responsive styling
│       └── 📄 sample_property_pins.json          <-- Sample parcel schema for custom CRM data feeds
└── 📁 byok_configuration/
    ├── 📄 .env.example                           <-- Environment file template (Gemini, DeepSeek, Google Maps)
    └── 📄 BYOK_3_MINUTE_QUICKSTART.md           <-- Step-by-step key acquisition instructions
```

---

# 📋 Part 3: Customer-Facing Onboarding & BYOK Setup Guide
*(This section is included directly inside the customer package `README.md` and `SETUP_AND_INSTALLATION_GUIDE.pdf`)*

```markdown
# 🚀 Vantage AI Studio • Blank 2nd Brain + Real Estate Geomap Suite
### Installation, Training & Bring Your Own Key (BYOK) Guide
**Licensed by:** Mike Ford (fordmj@gmail.com)  
**Modules Included:** Vantage AI 2nd Brain (Untrained Base) + Real Estate Geomap Spatial Plugin

---

## 🌟 What You Have Received
Your purchase includes:
1. **Vantage AI 2nd Brain Engine (Blank Base)**: An empty, high-performance cognitive memory layer ready to ingest and memorize your company's proprietary documents, employee training manuals, underwriting rules, and private SOPs.
2. **Vantage Real Estate Geomap Plugin**: An interactive geospatial mapping tool that visualizes property listings, calculates census-tract down payment grant eligibility (Fannie Mae HomeReady/Freddie Mac Home Possible), and overlays school districts and hazard zones.

---

## 🔑 Phase 1: 3-Minute Bring Your Own Key (BYOK) Setup
Vantage operates on a **zero-markup BYOK architecture**. You connect your own API accounts directly, guaranteeing 100% data privacy and direct wholesale API pricing.

### 1. Google Gemini API Key (Required for 2nd Brain Memory & Spatial AI Reasoning)
1. Visit **[Google AI Studio](https://aistudio.google.com/)** and sign in.
2. Click **"Get API Key"** in the top navigation bar.
3. Click **"Create API Key in new project"** and copy your key (`AIzaSy...`).
4. *Tier:* Generous free tier provided; paid requests cost pennies per thousand interactions.

### 2. DeepSeek API Key (Optional / Analytical Reasoning Fallback)
1. Visit the **[DeepSeek Platform](https://platform.deepseek.com/)** and sign in.
2. Navigate to **API Keys** -> click **"Create new API key"**.
3. Name it `Vantage Real Estate AI` and copy your secret key (`sk-...`).
4. Fund with $2.00–$5.00 for tens of thousands of complex property data analyses.

### 3. Google Maps Platform API Key (Required for Interactive Geomap & Geocoding)
1. Go to the **[Google Cloud Console - Maps Platform](https://console.cloud.google.com/google/maps-apis/)**.
2. Create a project or select an existing one.
3. Enable the following APIs:
   - **Maps JavaScript API** (for interactive rendering and marker clustering)
   - **Geocoding API** (for converting street addresses to lat/long coordinates)
   - **Places API** (for neighborhood amenities, schools, and transit lookup)
4. Go to **Credentials** -> **Create Credentials** -> **API Key**.
5. *(Best Practice)* Restrict your key to your production website domain (e.g., `*.yourdomain.com/*`).
*(Note: Google provides a recurring $200.00 monthly free tier for Maps Platform, sufficient for over 28,000 map loads per month).*

---

## ⚡ Phase 2: Activating Your Keys in the Application

### Option A: Via the In-App Settings Wizard (Zero-Code Method)
1. Open the Vantage Studio application in your browser.
2. Click the **Key Icon 🔑 ("API Settings / BYOK")** in the top header.
3. Paste your **Gemini API Key**, **DeepSeek API Key**, and **Google Maps API Key**.
4. Click **"Test & Save Keys"**. The status badges will light up **Green (Active)**.

### Option B: Via Server Environment (.env) for Self-Hosted Deployments
If running on Docker, Cloud Run, AWS, or an on-prem server, copy `.env.example` to `.env`:

```bash
# Core AI Engines
GEMINI_API_KEY=AIzaSyYourGoogleGeminiKeyHere
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# Geospatial Intelligence
GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsPlatformKeyHere
VITE_GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsPlatformKeyHere

# Server Configuration
PORT=3000
NODE_ENV=production
```

---

## 🧠 Phase 3: Training Your Blank 2nd Brain on Day 1

Because this package comes as an untrained blank slate, training your 2nd Brain on your proprietary data takes under 60 seconds:

### Method 1: Continuous Ingestion Daemon (Bulk Document Upload)
1. Open **2nd Brain Studio** -> Click **"Continuous Ingestion Daemon"**.
2. Drag and drop your company's PDF, DOCX, TXT, or CSV files (e.g., *Employee Handbook*, *Buyer Representation Agreements*, *Underwriting Overlay Sheets*).
3. The engine automatically vectorizes, chunks, and indexes the content with semantic tagging.

### Method 2: Live "Remember This" Knowledge Capture
1. In the chat interface, type:
   > *"Remember this rule: All buyers with FICO below 640 must have a minimum of 2 months PITI reserves before submitting offers in Travis County."*
2. The 2nd Brain confirms storage with a live memory badge and references this rule in all future spatial and property queries.

---

## 🗺️ Phase 4: Embedding the Real Estate Geomap into Your CRM or Website

### Method 1: Iframe Drop-In Embed
```html
<!-- Vantage Real Estate Geomap Spatial Intelligence Embed -->
<iframe 
  src="https://your-domain.com/geomap" 
  width="100%" 
  height="750px" 
  frameborder="0" 
  allow="geolocation; camera; clipboard-write;"
  style="border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"
></iframe>
```

### Method 2: React Component Integration
```tsx
import React from 'react';
import { RealEstateGeomap } from '@vantage/geomap-spatial';
import { Blank2ndBrainProvider } from '@vantage/2ndbrain-core';

export default function BrokeragePropertyPortal() {
  return (
    <Blank2ndBrainProvider storageNamespace="my_custom_brokerage">
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900">Live Parcel & DPA Map</h1>
        <RealEstateGeomap 
          defaultCenter={{ lat: 30.2672, lng: -97.7431 }} 
          zoom={12}
          enableCensusDpaTracts={true}
          enableFloodZoneLayer={true}
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        />
      </div>
    </Blank2ndBrainProvider>
  );
}
```

---

## 💡 Verified Capabilities Active on Day 1
- **Custom Cognitive Memory**: Vector search and contextual grounding based 100% on your uploaded business files.
- **Interactive Geospatial Parcel Map**: Instant visual pinning, cluster grouping, and parcel metadata inspection.
- **Fannie Mae & Freddie Mac Census Tract Grants**: Instant overlay highlighting census tracts that qualify for $2,500–$7,500 HomeReady closing cost credits.
- **Neighborhood AI Insights**: Gemini Grounded analysis of school rankings, transit access, and historical price comps directly on clicked map markers.
```

---

# 📊 Part 4: Digital Delivery Summary Matrix

| Milestone | Deliverable Component | Target File / Artifact | Responsible Party |
| :--- | :--- | :--- | :--- |
| **1. Package Export** | Export Blank 2nd Brain + Real Estate Geomap bundle | `Vantage_AI_BlankBrain_and_RealEstateGeomap_Suite_v2.5.zip` | Licensor (Mike Ford) |
| **2. Commercial Stamping** | Apply proprietary single-organization license | `LICENSE.txt` & `license_manifest.json` | Licensor (Mike Ford) |
| **3. API Provisioning** | Generate Gemini, DeepSeek, and Google Maps keys | `BYOK_3_MINUTE_QUICKSTART.md` | Customer IT / Admin |
| **4. Knowledge Ingestion** | Upload internal company SOPs and files | Continuous Ingestion Daemon / UI | Customer Operations Lead |
| **5. Map Deployment** | Embed Geomap into internal CRM or public listings site | Iframe or React Component | Customer Web Developer |

---
*Document Version: 2.5.0 • Copyright (c) 2025-2026 Mike Ford (`fordmj@gmail.com`). All Rights Reserved.*
