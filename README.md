# GraminSarthi AI (ग्रामीण सारथी AI)

> **Empowering Rural Bharat with AI-Powered Financial Advisory, Real-Time Digital Khata, and a Hyperlocal Village Marketplace.**

GraminSarthi AI bridges the digital and financial divide for rural micro-merchants (kirana stores, dairy booths, tea stalls, farm seed suppliers) and village customers. It combines multilingual voice/chat interfaces, digital ledger (उधार) accounting, AI cash flow & inventory feasibility simulation, creditworthiness scoring for PMMY Mudra loans, and a direct WhatsApp-integrated village marketplace.

---

## 🌟 Key Features

### 🏪 1. Merchant Portal (दुकानदार पोर्टल)
- **Digital Khata & Ledger**: Track daily sales, expenses, and customer credit balance (उधार) in real time.
- **AI Financial & Business Advisor**:
  - Net profit & margin calculations.
  - Cash flow leak detection and margin optimization.
  - Product swap recommendations (high-margin alternatives for staples).
  - *What-If* revenue & expense simulator.
- **PMMY Mudra & KCC Loan Eligibility**: Instant creditworthiness score based on verified transaction history and timely repayments.
- **Multilingual Support**: English, हिन्दी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), and മലയാളം (Malayalam).

### 🛒 2. Customer Interface & Village Market (गांव बाज़ार)
- **Verified Local Shop Directory**: Discover neighborhood shops with exact distance (e.g. Kirana, Dairy, Seeds & Produce, Tea Stall) and 1-tap call & WhatsApp links.
- **Product Catalog & Cart**: Browse daily staples with transparent per-unit pricing (Atta, Milk, Ghee, Dal, Oil, Seeds).
- **Direct WhatsApp Ordering**: Automatically transforms cart items into itemized orders sent directly to the local merchant's WhatsApp.
- **My Digital Khata (उधार खाता)**: Villagers can monitor their pending balances across local shops and inspect past bills.
- **UPI QR Repayment**: Scan-and-pay UPI modal (`merchant@okaxis`) for instant credit settlement that builds a formal credit score.

---

## 🚀 Quick Start (Running the Website)

### Option A: One-Click Launcher (Windows)
Double-click `start-website.bat` in the project root folder.
This automatically:
1. Starts the Backend Node.js server on `http://localhost:5000`.
2. Starts the Frontend Next.js website on `http://localhost:3000`.
3. Opens your default web browser to `http://localhost:3000`.

---

### Option B: Manual Terminal Execution

#### 1. Backend Server
```bash
cd BACKEND
npm install
npm run dev
```
- Backend runs at: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`
- Database Health Check: `http://localhost:5000/api/health/db`

#### 2. Frontend Web Application
```bash
cd FRONTEND
npm install
npm run dev
```
- Website runs at: `http://localhost:3000`

---

## 🏗️ Architecture & Tech Stack

```
GraminSarthi-AI/
├── BACKEND/                  # Node.js + TypeScript REST API
│   ├── routes/               # Merchant, Business, Ledger, Auth, Dashboard, AI
│   ├── db/                   # PostgreSQL (Neon) Pool & Schema Harmonization
│   ├── database/             # Direct DB connectivity & health check
│   ├── services/             # Twilio Verify / MSG91 SMS OTP services
│   └── server.ts             # Express HTTP server with CORS & dynamic origin
├── FRONTEND/                 # Next.js 16 + React 19 + Tailwind CSS
│   ├── app/                  # Next.js App Router (Single-Page Experience)
│   ├── components/graminsarthi/
│   │   ├── splash-screen.tsx    # Dual-entry landing page (Merchant / Customer)
│   │   ├── auth-screen.tsx      # Phone OTP login & Quick Demo accounts
│   │   ├── dashboard.tsx        # Merchant ledger, inventory & AI feasibility
│   │   ├── customer-portal.tsx  # Village marketplace, digital khata & UPI
│   │   ├── whatif-simulator.tsx # Scenario forecasting
│   │   └── scheme-matcher.tsx   # Government scheme matching (Mudra, KCC)
│   └── lib/graminsarthi/     # Multilingual translations (i18n) & mock data
├── start-website.bat         # Single-click launcher for Windows
└── package.json              # Root workspace definitions
```

---

## 🔑 Authentication & Quick Demo

For development and demonstration without third-party SMS gateway credentials (Twilio/MSG91), the portal provides **1-Click Quick Demo Accounts**:
- **Ramesh Kumar**: Kirana & General Store (`+919876543210`)
- **Gopal Yadav**: Dairy Booth & Milk Point (`+919876543211`)
- **Suresh Sharma**: Tea Stall & Snacks (`+919876543212`)

---

## 📄 License
MIT License. Built for Rural Bharat.
