# 📦 Vantage AI Studio • Commercial Export Wizard & Customer BYOK Delivery Guide
**Author & Commercial Licensor:** Mike Ford (`fordmj@gmail.com`)  
**Product Line:** Vantage AI Workspace Studio • 2nd Brain Engine & Workspace UI Plugin Modules  
**Target Delivery:** Digital Download / Customer Handoff Package for Enterprise & Professional Clients  

---

## 📑 Executive Overview

This master guide provides the complete operational blueprint for exporting, packaging, licensing, and delivering **Vantage AI Studio** plugin modules to purchasing customers.

Specifically tailored for customer sales scenarios such as:
1. **Vantage AI Studio 2nd Brain Engine** with the selected **Mortgage & Real Estate Industry + Career Focus**.
2. **Vantage AI Studio Workspace UI Plugin Module** (with the 7 Free Google Apps rotating suggestions suite).
3. **Turnkey Customer Onboarding & BYOK (Bring Your Own Key)** directions for Google Gemini API and DeepSeek API keys.

---

# 🛠️ Part 1: Commercial Export Wizard Walkthrough

When preparing a customer bundle from the Vantage AI Studio Flagship Suite:

### Step 1: Launch the Export Wizard in Vantage AI Studio
1. Open the **Flagship Studio Suite / Commercial License Protection Studio** or click **"Export Plugin Archetype"** from the navigation bar.
2. Select the core products for the customer's purchase:
   - ✅ **Vantage AI 2nd Brain Engine** (`vantage-2ndbrain-core-v2.5`)
   - ✅ **Industry Profile**: `Mortgage, Lending & Real Estate` (Active presets: *Mortgage Loan Officer*, *Real Estate Broker*, *Escrow & Title Officer*)
   - ✅ **Vantage AI Workspace UI Module** (`vantage-workspace-ui-v2.5` with 7 Google App rotating cards)
   - ✅ **Domain Knowledge Seeds**: Pre-loaded with CFPB TRID 3-day rules, Fannie Mae/Freddie Mac AUS guidelines, USDA 100% & Lakeview DPA programs, and RESPA Section 8 compliance guardrails.

### Step 2: Set Commercial Licensing & Attribution
- **Creator & Licensor:** `Mike Ford <fordmj@gmail.com>`
- **License Type:** `Single-Organization Commercial License` or `Multi-Seat Enterprise Distribution`
- **Customer / Organization Name:** *[Purchasing Brokerage / Client Company]*
- **Attribution Watermark:** Retained across system headers and export manifests.

### Step 3: Generate the Digital Distribution Package
Click **"Generate & Download Commercial Distribution Package (.ZIP)"**.

---

# 📁 Part 2: Structure of the Digital Delivery Package (.ZIP)

The generated archive contains everything the customer needs to deploy the solution immediately:

```text
📦 Vantage_AI_Mortgage_Workspace_Suite_v2.5.zip
├── 📄 README.md                                  <-- Customer setup & quickstart guide
├── 📄 SETUP_AND_INSTALLATION_GUIDE.pdf           <-- Formatted executive guide
├── 📄 LICENSE.txt                                <-- Single-organization license from Mike Ford
├── 📁 plugin_modules/
│   ├── 📁 2nd_brain_mortgage_engine/
│   │   ├── 📄 brain_manifest.json                <-- Mortgage persona, TRID guardrails & knowledge seeds
│   │   ├── 📄 memory_rules.json                  <-- DTI ratio logic, FHA/VA/USDA matrices
│   │   └── 📄 persona_directives.txt
│   └── 📁 workspace_ui_module/
│       ├── 📄 component_bundle.js                <-- Standalone or embedded React/Vue UI widget
│       ├── 📄 rotating_actions_matrix.json       <-- 28 Mortgage-tailored rotating actions for 7 Google Apps
│       └── 📄 styles.css
└── 📁 byok_configuration/
    ├── 📄 .env.example                           <-- Template with GEMINI_API_KEY & DEEPSEEK_API_KEY
    └── 📄 BYOK_3_MINUTE_QUICKSTART.md           <-- Customer guide to obtain free/low-cost API keys
```

---

# 📋 Part 3: Customer-Facing Onboarding & BYOK Setup Guide
*(This section is included directly inside the customer package `README.md` and `SETUP_AND_INSTALLATION_GUIDE.pdf`)*

```markdown
# 🚀 Vantage AI Studio • Mortgage & Real Estate Workspace Suite
### Installation, Integration & Bring Your Own Key (BYOK) Guide
**Licensed by:** Mike Ford (fordmj@gmail.com)  
**Modules Included:** Vantage AI 2nd Brain (Mortgage Focus) + Vantage Workspace UI Plugin

---

## 🌟 What You Have Received
Your purchase includes the specialized **Mortgage & Real Estate 2nd Brain Intelligence Engine** and the **Vantage Workspace UI Hub** with real-time rotating action workflows for all 7 free Google Apps (Gmail, Calendar, Drive, Docs, Sheets, Tasks, Contacts).

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
3. Click **"Create new API key"**, name it `Vantage Mortgage Assistant`, and copy the token (`sk-...`).
4. Fund your account with $2.00–$5.00 (enough for tens of thousands of loan scenario analyses).

---

## ⚡ Phase 2: Activating Your Keys in the Application

### Option A: Via the In-App Settings Wizard (Easiest — Zero Coding)
1. Open the Vantage Workspace UI in your browser or iframe.
2. Click the **Key Icon 🔑 ("API Settings / BYOK")** in the top right header.
3. Paste your **Gemini API Key** and **DeepSeek API Key** into the secure input fields.
4. Click **"Test & Save Keys"**. The indicator will turn **Green (Active)**.
*(Keys are stored in your secure local browser sandbox and never sent to third-party tracking servers).*

### Option B: Via Server Environment (.env) for Self-Hosted Deployments
If hosting on Cloud Run, Docker, or your company VPS, copy `.env.example` to `.env`:

```bash
# Server Environment Configuration
GEMINI_API_KEY=AIzaSyYourGoogleGeminiKeyHere
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEFAULT_ACTIVE_INDUSTRY=mortgage_real_estate
PORT=3000
```

---

## 🛠️ Phase 3: Embedding the Workspace UI into Your Existing Website/CRM

### Method 1: Drop-In Iframe Integration
Embed the full Vantage Workspace Hub directly into your internal loan origination dashboard, company intranet, or CRM:

```html
<!-- Vantage AI Workspace Studio Embed -->
<iframe 
  src="https://your-domain.com/workspace" 
  width="100%" 
  height="900px" 
  frameborder="0" 
  allow="camera; microphone; clipboard-write;"
  style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"
></iframe>
```

### Method 2: React Component Import
If integrating directly into a React / Next.js application:

```tsx
import { WorkspaceHub } from '@vantage/workspace-ui';
import { Mortgage2ndBrainProvider } from '@vantage/2ndbrain-mortgage';

export default function LoanOfficerPortal() {
  return (
    <Mortgage2ndBrainProvider defaultRole="LoanOfficer">
      <WorkspaceHub 
        theme="light" 
        enableRotatingActions={true} 
        rotationIntervalSeconds={30}
      />
    </Mortgage2ndBrainProvider>
  );
}
```

---

## 💡 Verified Mortgage & Real Estate Capabilities Active on Day 1
- **TRID 3-Day Rule Tracking**: Automated countdowns and tasks for Initial Loan Estimate disclosures.
- **DTI & Purchase Power Calculations**: Instant front-end and back-end debt ratio simulations.
- **Rotating Actions across 7 Google Apps**: 4 pre-programmed actions per app (28 total) auto-cycling every 30 seconds for drafting rate locks, scheduling escrow signings, creating loan vault folders, and updating Realtor referral sheets.
```

---

# 📊 Part 4: Digital Delivery Summary Matrix

| Delivery Milestone | Component / Action | Deliverable File | Responsible Party |
| :--- | :--- | :--- | :--- |
| **1. Package Generation** | Bundle 2nd Brain + Workspace UI with Mortgage focus | `Vantage_AI_Mortgage_Workspace_Suite_v2.5.zip` | Licensor (Mike Ford) |
| **2. Commercial Stamp** | License text & commercial ownership attribution | `LICENSE.txt` & Manifests | Licensor (Mike Ford) |
| **3. Key Provisioning** | Generate Gemini API Key & DeepSeek API Key | `BYOK_3_MINUTE_QUICKSTART.md` | Customer IT / Admin |
| **4. Deployment** | Embed via Iframe or React Component | `component_bundle.js` / HTML Embed | Customer Developer |
| **5. Operational Verification** | Test 7 Google Apps rotating actions & TRID rules | In-App System Health Indicator | Customer End User |

---
*Document Version: 2.5.0 • Copyright (c) 2025-2026 Mike Ford (`fordmj@gmail.com`). All Rights Reserved.*
