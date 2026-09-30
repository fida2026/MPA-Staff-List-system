direct link https://ai.studio/apps/a2b296a8-cd7c-4a62-baf8-0b0502694fc0
# ComplianceCore — Staff & Renewal Registry

> Enterprise People Operations & Legal Contract Renewal Compliance Console with automated mailto routing, broadcast station headcount matrix, cryptographic audit logging, and contract document vault.

---

## 📌 Executive Overview

**ComplianceCore** is a specialized workforce and legal contract compliance system tailored for broadcast network groups and multi-entity enterprises. It provides centralized visibility and compliance enforcement across staff categories—including **HR Permanent**, **HR Contract**, and **Legal Contract (Talent/Freelance)** personnel.

The platform eliminates compliance oversights, lapsed broadcast talent agreements, and delayed HR renewal notices through automated SLA tracking, pre-formatted mailto notification dispatching, station headcount aggregation, and an immutable audit trail with SHA-256 checksum integrity verification.

---

## 🚀 Key Modules & Capabilities

### 1. Staff Registry & Lifecycle Management (`StaffRegistryView`)
- **Centralized Master Roster**: Filter and search across stations, departments, designations, and employment categories.
- **Station-Specific ID Generation**: Automatic prefixing according to station brand codes (e.g., `SSB-1082`, `MAX-2041`, `KFM-4015`).
- **Data Integrity & Fields**: Manages IC numbers, join dates, contract start/end dates, attached document references, and reporting lines (HOD, HR, and Admin emails).
- **Direct CSV Export**: One-click generation of RFC-compliant CSV files containing the complete workforce roster.

### 2. Contract Renewals & Automated Escalation (`ContractRenewalsView`)
- **SLA-Driven Urgency Tiers**:
  - 🚨 **Legal Contract Alert (`<= 14 Days`)**: Strict 14-day legal review window for on-air talent, creative contributors, and corporate legal contracts.
  - ⚠️ **HR Contract Alert (`<= 30 Days`)**: 30-day standard operating procedure (SOP) notification window for fixed-term HR employees.
  - ❌ **Expired**: Explicit flagging of overdue agreements requiring immediate operational attention or regularization.
  - ✅ **Active / Compliant**: Contracts with healthy time-to-expiry buffers.
- **Smart Mailto Routing**: Generates pre-populated email templates addressed directly to the assigned Head of Department (HOD) and CC-ing Group HR, containing staff details, tenure, expiry dates, and action items.
- **Bulk Dispatch Console**: Batch-trigger renewal notifications to multiple HODs simultaneously with a unified escalation briefing.

### 3. Station Headcount Matrix (`StationDirectoryView`)
- **Multi-Station Network Directory**: Headcount aggregation across flagship brands:
  - **Hot FM** (`SSB` prefix)
  - **Fly FM** (`MAX` prefix)
  - **Eight Wuxian** (`OFM` prefix)
  - **Kool FM** (`KFM` prefix)
  - **Molek FM** (`MFM` prefix)
  - **Legal & Corporate** (`CON` prefix)
- **Operational Metrics**: Real-time ratio breakdown between permanent vs. contract headcount, departmental staffing, and active stations.

### 4. Cryptographic Audit Vault (`AuditVaultView`)
- **Tamper-Evident Activity Trail**: Records all system mutations including staff additions, record modifications, deletion operations, PDF document attachments, and mailto triggers.
- **SHA-256 Checksum Verification**: Every audit log record and attached document features an integrity hash. The built-in verification engine validates the chain of custody against tamper simulations.
- **Audit Export**: Export complete compliance audit logs to CSV for regulatory and internal audit filings.

### 5. Document & Contract Vault (`PdfViewerModal`)
- **High-Fidelity Document Viewer**: Preview attached Manpower Requisition Forms (MRF), Legal Talent Agreements, and HR documentation directly within the console.
- **Document Metadata**: Inspect cryptographic SHA-256 hashes, file sizes, upload timestamps, and associated personnel records.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 8](https://vite.dev/) + [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/vite` |
| **Typography & Icons** | Inter, JetBrains Mono, [Lucide React](https://lucide.dev/), Material Symbols |
| **Animation** | [Motion](https://motion.dev/) |
| **Persistence** | LocalStorage state engine with schema versioning (`v25`) |

---

## 📁 Project Structure

```text
├── index.html                   # Application entry point & OpenGraph metadata
├── metadata.json                # AI Studio application metadata & capabilities
├── package.json                 # Dependencies, dev dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4 plugin
├── src/
│   ├── main.tsx                 # React application mounting
│   ├── App.tsx                  # Main layout, routing state & modal container
│   ├── index.css                # Global stylesheet & Tailwind CSS imports
│   ├── types/
│   │   └── compliance.ts        # TypeScript interfaces (StaffRecord, AuditLog, Station, etc.)
│   ├── context/
│   │   └── ComplianceContext.tsx# Centralized state store, persistence & event handlers
│   ├── data/
│   │   └── initialData.ts       # Seed dataset (records, initial logs, utility functions)
│   ├── components/
│   │   ├── TopNavBar.tsx        # Application header, global search & quick stats
│   │   ├── SideNavRail.tsx      # Sidebar navigation & category counters
│   │   ├── ToastContainer.tsx   # Action notifications and alerts
│   │   ├── BulkDispatchModal.tsx# Multi-contact batch renewal notification wizard
│   │   ├── DeleteConfirmModal.tsx# Safe deletion confirmation modal
│   │   ├── PdfViewerModal.tsx   # Contract & MRF document viewer
│   │   └── ProtocolDocsModal.tsx# Legal & HR compliance SOP documentation guide
│   └── views/
│       ├── StaffRegistryView.tsx   # Main staff roster with filters & actions
│       ├── StaffFormView.tsx       # Create & edit staff member profile form
│       ├── ContractRenewalsView.tsx# Renewal SLA dashboard & mailto routing
│       ├── StationDirectoryView.tsx# Station headcount breakdown matrix
│       ├── AuditVaultView.tsx      # Cryptographic audit logs & integrity validator
│       └── SettingsView.tsx        # Local data management & compliance thresholds
```

---

## 📋 Station Prefix Reference

| Station Brand | Prefix Code | Operational Focus |
|---|:---:|---|
| **Hot FM** | `SSB` | Contemporary Malay Radio Network |
| **Fly FM** | `MAX` | Contemporary English Hit Radio Network |
| **Eight Wuxian** | `OFM` | Contemporary Chinese Radio Network |
| **Kool FM** | `KFM` | Adult Contemporary Malay Radio Network |
| **Molek FM** | `MFM` | East Coast Region Malay Radio Network |
| **Legal & Corp** | `CON` | Central Legal, Corporate & Group Services |

---

## ⏱️ Compliance SLA & Escalation Guidelines

| Contract Type | SLA Target | Automated Escalation Trigger | Default Primary Recipient |
|---|:---:|---|---|
| **Legal Contract** (Talent / On-Air) | **14 Days** | `<= 14 Calendar Days to Expiry` | Station HOD (`hodEmail`), CC Legal/Admin |
| **HR Contract** (Fixed-Term Staff) | **30 Days** | `<= 30 Calendar Days to Expiry` | Station HOD (`hodEmail`), CC Group HR |
| **Permanent Staff** | Ongoing | Annual Performance Review Cycles | Department Head |

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn** / **pnpm**

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Running Locally
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Type Checking & Linting
Validate TypeScript types across the codebase:
```bash
npm run lint
```

### Production Build
Compile and bundle the production-ready assets:
```bash
npm run build
```

---

## 🔒 Data Persistence & Privacy
- **Client-Side Persistence**: State is stored in browser `localStorage` using versioned keys (`compliance_core_staff_v25`, `compliance_core_logs_v25`, `compliance_core_pdfs_v25`).
- **No External Data Leaks**: All workforce calculations, mailto generation, and cryptographic hashing take place locally in-memory and client-side.
- **Factory Reset**: A clean-slate reset can be performed at any time from the **Settings** view to restore initial sample data.

---

## 📄 License
Internal Enterprise Compliance Tool — All rights reserved.
