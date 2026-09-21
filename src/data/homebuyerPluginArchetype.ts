/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FIRST-TIME HOMEBUYER PLUGIN ARCHETYPE & TOOL SCHEMA
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Zero BYOK Specification & OpenAPI Tool Definition
 * ============================================================================
 */

export const FIRST_TIME_HOMEBUYER_PLUGIN_MARKDOWN_SPEC = `
# 🏛️ First-Time Homebuyer GeoMap & Low/No Down Payment Plugin Module

## Architecture: Managed Master Feed Sync (Zero BYOK)
The plugin eliminates all raw API key requirements for end-users. All RentCast API querying, batch pagination (\`limit=500\`), and Census Tract/USDA enrichment are managed through Mike Ford's Master GeoSphere Hub.

### Features
- **Zero API Key Setup**: Turnkey operation on any React / Next.js / Vite web application.
- **1-Click "Sync GeoMap Saved Listings"**: Instantly imports refreshed properties and price drops from Mike Ford's GeoSphere Master Feed.
- **Borrower Area Request Dispatcher**: Leads can submit custom target city/budget requests directly to Mike's admin queue.
- **Interactive DTI Affordability Engine**: Live sliders for income, debt, and down payment calculating front/back-end DTI (up to 50% max).
- **1-Click Zillow URL Geocoder**: Geocodes consumer-supplied Zillow links into map pins.

## Installation
\`\`\`bash
npm install lucide-react clsx tailwind-merge
\`\`\`

## Quick Start
\`\`\`tsx
import React from 'react';
import { FirstTimeHomebuyerGeoPlugin } from './components/FirstTimeHomebuyerGeoPlugin';

export default function MyPortal() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <FirstTimeHomebuyerGeoPlugin
        masterConfig={{
          adminContactEmail: "fordmj@gmail.com",
          assignedLoanOfficerName: "Mike Ford",
          assignedAgentName: "Kanndice Ford",
          autoSyncOnLoad: true
        }}
      />
    </div>
  );
}
\`\`\`

---
*Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.*
`;

export const FIRST_TIME_HOMEBUYER_PLUGIN_OPENAPI_TOOL_SCHEMA = {
  name: "first_time_homebuyer_geo_plugin_tool",
  description: "Evaluates property coordinates, 11-digit Census Tract GEOID, USDA 100% Rural Development status, CRA Down Payment Grants, and calculates lead buyer Front-End and Back-End DTI prequalification envelopes.",
  parameters: {
    type: "object",
    properties: {
      geoid: {
        type: "string",
        description: "11-digit Census Tract FIPS code (e.g. 41051001202)"
      },
      propertyPrice: {
        type: "number",
        description: "Purchase price of target property in USD"
      },
      buyerGrossMonthlyIncome: {
        type: "number",
        description: "Gross monthly income of buyer in USD"
      },
      buyerMonthlyDebt: {
        type: "number",
        description: "Total recurring monthly debt obligations in USD"
      },
      buyerDownPayment: {
        type: "number",
        description: "Available liquid down payment savings in USD"
      },
      targetInterestRate: {
        type: "number",
        description: "Target note rate (e.g. 6.25)"
      }
    },
    required: ["propertyPrice", "buyerGrossMonthlyIncome", "buyerMonthlyDebt"]
  }
};

export const HOMEBUYER_GEO_OPENAPI_SCHEMA = {
  openapi: '3.1.0',
  info: {
    title: 'Vantage Flagship Real Estate & Mortgage GeoMap API',
    version: '2.0.0',
    description: 'Autonomous GeoMap, RentCast Investment Valuation, USDA 100% Financing, and DTI Affordability Tool Engine by Mike Ford (fordmj@gmail.com)'
  },
  paths: {
    '/api/realestate/evaluate-affordability': {
      post: {
        summary: 'Calculate Front-End & Back-End DTI with Max Purchase Envelope',
        operationId: 'evaluatePropertyAffordability',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  grossMonthlyIncome: { type: 'number', description: 'Gross monthly pre-tax income' },
                  recurringMonthlyDebts: { type: 'number', description: 'Total monthly liabilities (auto, credit, student loans)' },
                  downPayment: { type: 'number', description: 'Cash available for down payment' },
                  targetInterestRate: { type: 'number', description: 'Note interest rate (e.g. 6.375)' },
                  targetPurchasePrice: { type: 'number', description: 'Property asking price' }
                },
                required: ['grossMonthlyIncome', 'recurringMonthlyDebts', 'targetPurchasePrice']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Affordability metrics and DTI qualification status'
          }
        }
      }
    },
    '/api/realestate/check-fips-geoid': {
      post: {
        summary: 'Verify USDA Rural 100% Financing & Census Tract CRA $10k LMI Grant',
        operationId: 'checkFipsGeoIdPrograms',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fipsGeoId: { type: 'string', description: '11-digit FIPS Census GeoID (SSCCCTTTTTT)' },
                  coordinates: {
                    type: 'object',
                    properties: {
                      lat: { type: 'number' },
                      lng: { type: 'number' }
                    }
                  }
                },
                required: ['fipsGeoId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Program eligibility flags and grant amount'
          }
        }
      }
    }
  }
};
