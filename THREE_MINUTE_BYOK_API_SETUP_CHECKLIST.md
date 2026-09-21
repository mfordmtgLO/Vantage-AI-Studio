# ⚡ 3-Minute BYOK API Key Setup Checklist
### Turnkey Setup Guide for Vantage AI Workspace V2 & Standalone Plugins
**Author:** Mike Ford (`fordmj@gmail.com`) • **Version:** 2.4 Commercial Ready

Welcome to **Vantage AI Workspace V2**! Your plugins are engineered with **BYOK (Bring Your Own Key)** architecture. This gives you 100% data sovereignty, direct wholesale API pricing, and zero markup.

You can configure your keys in **two easy ways**:
1. **Instant In-App Setup (Recommended for Etsy / Solopreneurs):** Click the **"API Keys (BYOK)"** key icon in your top navigation or within any plugin, paste your keys, and click **"Save Credentials"**. Your keys are encrypted locally in your browser session.
2. **Server `.env` File (Recommended for GitHub / Developers / Vercel):** Copy `.env.example` to `.env` and enter your keys.

---

## 🔑 1. Google Gemini API Key (Required for 2nd Brain & AI Assistants)
* **What it powers:** Multimodal document extraction, Google Search grounding, prompt engineering, and intelligent drafts.
* **Cost:** **100% FREE** tier available on Google AI Studio (generous free rate limits).
* **Step-by-step (Takes ~60 seconds):**
  1. Go to [Google AI Studio](https://aistudio.google.com/).
  2. Sign in with any standard Google account.
  3. Click **"Get API key"** in the top left navigation.
  4. Click **"Create API key in new project"** (or select an existing Google Cloud project).
  5. Copy your key (starts with `AIzaSy...`).
  6. Paste it into your **Vantage BYOK Drawer** under **Gemini API Key** (or `GEMINI_API_KEY=` in `.env`).

---

## 🔑 2. RentCast API Key (Required for Live Real Estate MLS Comps & Valuations)
* **What it powers:** Real-time nationwide MLS active listings, RentCast valuation score (0–100), estimated rent, and price-cut tracking.
* *Note:* USDA 100% zero-down boundaries, 11-digit Census FIPS geocoding, and DTI affordability sliders work **100% free out-of-the-box** without a key using built-in verified benchmark MLS data!
* **Cost:** **FREE** tier provides 50 property queries/month. Paid tiers scale affordably.
* **Step-by-step (Takes ~90 seconds):**
  1. Go to [RentCast API Portal](https://www.rentcast.io/api).
  2. Click **"Get Free API Key"** and create your account.
  3. Navigate to your Developer Dashboard / API Keys tab.
  4. Copy your API Key.
  5. Paste it into your **Vantage BYOK Drawer** under **RentCast API Key** (or `RENTCAST_API_KEY=` in `.env`).

---

## 🔑 3. DeepSeek API Key (Optional — For DeepThink R1 Autonomous Agents)
* **What it powers:** DeepThink reasoning model and autonomous tool chaining (`dsh-tool-web` → `dsh-agent-sdk` → `dsh-cron` unattended scheduler).
* *Note:* If omitted, the system seamlessly auto-fails over to Google Gemini reasoning.
* **Cost:** Ultra-low cost per million tokens (~$0.14–$0.55 / 1M tokens) with free trial credits upon signup.
* **Step-by-step (Takes ~60 seconds):**
  1. Visit [DeepSeek Open Platform](https://platform.deepseek.com/).
  2. Sign up and click **"API Keys"** in the sidebar.
  3. Click **"Create API Key"**, give it a name (e.g. `Vantage-2ndBrain`), and copy it (`sk-...`).
  4. Paste it into your **Vantage BYOK Drawer** under **DeepSeek API Key** (or `DEEPSEEK_API_KEY=` in `.env`).

---

## 🚀 4. Google Workspace & Voice Macros (Zero Secret Keys Required!)
* **Google Workspace Dual-Pathway UI:** Requires **NO** secret API keys! Simply click **"Workspace Active / Google Apps"** in the top bar to connect via Google Identity Services (OAuth Token Client).
* **Voice Macro Orchestration:** Runs 100% client-side in Google Chrome / Safari / Edge using the standard browser Web Speech API. **Zero API setup, zero monthly cost.**

---

### Quick Troubleshooting & Support
* **"Are my keys secure?"** Yes! When entered through the in-app BYOK Drawer, keys are stored locally on your device (`localStorage`) and sent over encrypted HTTPS headers only to your private proxy endpoints.
* **Need technical support or custom branding?** Reach out directly to **Mike Ford** at `fordmj@gmail.com`.
