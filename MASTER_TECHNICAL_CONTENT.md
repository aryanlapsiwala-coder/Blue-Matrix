# 🏛️ KnowPass: Master Technical Dossier & Implementation Methodology

This document contains exhaustive, in-depth technical documentation covering the two key topics:
1. **Technologies to be used** (Programming languages, frameworks, AI/ML models, databases, hardware, security, protocols).
2. **Methodology and process for implementation** (System lifecycle, verification pipelines, RAG algorithms, data flow diagrams, flow charts, and working prototype breakdown).

---

# SECTION 1: TECHNOLOGIES TO BE USED

## 1.1 Core Programming Languages & Runtime Environments
* **JavaScript (ECMAScript 2023+ / Modern JS):** Primary language powering both client-side logic and asynchronous service workers. Utilizes modern asynchronous paradigms (sync/await, Promises, ES Modules, Destructuring, Optional Chaining, Nullish Coalescing).
* **HTML5 & CSS3:** Semantic markup structure ensuring accessibility (WCAG 2.1 compliance), coupled with advanced CSS3 features (CSS Custom Properties, Flexbox, Grid, Backdrop-filter blur, CSS Animations).
* **Structured Query Language (SQL):** Standard PostgreSQL relational query dialect used for complex multi-table joins, JSONB payload querying, full-text indexing, and row-level security policy definitions.
* **Markdown (CommonMark & GitHub Flavored Markdown - GFM):** The standard storage and interchange format for all technical runbooks, laboratory SOPs, code snippets, and generated institutional certificates.
* **Shell Scripting (Bash / POSIX / PowerShell):** Automation scripts and terminal commands documented in lab runbooks for toolchains such as SLURM, PyTorch, Cadence, and Linux kernel maintenance.

---

## 1.2 Frontend Frameworks, UI Libraries & Tooling
* **React.js 18.x (Component-Driven Architecture):**
  * Employs functional components with advanced React Hooks (useState, useEffect, useMemo, useCallback, useRef).
  * Utilizes React Context API (AuthContext) for global state propagation (authenticated user sessions, permissions, points accrual, and live notifications) without prop drilling.
  * Virtual DOM reconciliation for high rendering performance across large document catalogs.
* **Vite 6.x (Next-Generation Frontend Build Tool):**
  * Leverages native ES Modules (ESM) for instantaneous Hot Module Replacement (HMR < 50ms).
  * Uses Rollup for optimized production bundling with dynamic chunking and tree-shaking.
* **Tailwind CSS 3.4+ (Utility-First Design System):**
  * Custom design token palette with CSS variables for dynamic theme switching and institutional styling.
  * Responsive utility classes (sm, md, lg, xl) delivering seamless experiences on mobile, tablet, laptop, and ultra-wide laboratory displays.
  * Modern Glassmorphism styling (ackdrop-blur-md, subtle translucent borders, micro-shadows).
* **React Router DOM v6.x (Declarative Client-Side Routing):**
  * Client-side SPA routing with protected route guards (ProtectedRoute.jsx) validating user authentication and Role-Based Access Control (RBAC) before page mounting.
  * Dynamic URL search parameter synchronization (useSearchParams) for shareable deep links to specific search queries, tags, and articles.
* **Lucide-React:** Enterprise scalable vector iconography suite providing SVG icons across all modules.

---

## 1.3 Backend, Database & Cloud Data Infrastructure
* **PostgreSQL (Relational Database Management System):**
  * ACID-compliant relational data store hosted on Supabase enterprise cloud infrastructure.
  * Relational tables: profiles, knowledge_entries, lab_equipment, curriculum_skill_gaps, knowledge_comments, udit_logs.
  * Support for JSONB columns enabling flexible storage of attached files, code snippets, and vendor contracts.
* **Supabase Backend-as-a-Service (BaaS):**
  * Auto-generated RESTful API endpoints via PostgREST for high-speed data transactions.
  * Row Level Security (RLS) enforcing multi-tenant data isolation and role-restricted writes.
* **Real-Time WebSocket Engine:**
  * Supabase Realtime subscriptions capturing PostgreSQL Change Data Capture (CDC) events for live comment streams and document upvotes.
* **Client-Side Reactive Event Bus:**
  * In-browser event broadcasting via native window.dispatchEvent and CustomEvent('knowpass-new-notification') for instant notifications without page refreshes.
* **Resilient Multi-Tier Storage Strategy:**
  * Hybrid persistence architecture combining cloud PostgreSQL with automatic browser localStorage fallbacks, ensuring offline resilience if campus network connectivity is interrupted.

---

## 1.4 Artificial Intelligence, Machine Learning & NLP Architecture
* **Google Gemini 2.0 (Foundation Large Language Model):**
  * High-throughput reasoning and comprehension model utilized for deep semantic search, multi-document summarization, and natural language technical Q&A.
* **Retrieval-Augmented Generation (RAG) Pipeline:**
  * Ingests verified institutional documents, research runbooks, and equipment manuals.
  * Matches user queries against the knowledge corpus, retrieves top-k relevant chunks, and injects them into the LLM context window.
  * Produces hallucination-free answers with exact source citations, author credits, and percentage match scores.
* **Automated AI Quality & Academic Integrity Inspection Engine:**
  * Runs pre-publication heuristic and syntactic analysis on Step 4 of the Contribution Studio.
  * Evaluates Clarity Index, Code Block Reproducibility, Prerequisite Specification, and Cross-Campus Redundancy (0% duplicate guarantee).

---

## 1.5 Hardware & Laboratory Infrastructure Integration
* **High-Performance Computing (HPC) AI SuperPODs:**
  * Integration with NVIDIA DGX A100 / H100 multi-GPU clusters managed via SLURM Workload Manager.
  * SOP runbooks for CUDA out-of-memory remediation, PyTorch multi-GPU DDP training, InfiniBand 200Gbps QSFP56 transceiver maintenance, and liquid cooling pressure regulation.
* **Electronic & Radio Frequency (RF) Test Hardware:**
  * Keysight 4-Channel Infiniium Mixed Signal Oscilloscopes (4 GHz), function generators, and spectrum analyzers.
  * Calibration checklists, DC offset self-tests, active differential probe handling, and 50-Ohm BNC termination runbooks.
* **Mechanical & Materials Structural Testing Hardware:**
  * Instron Universal Testing Machines (UTM 100kN) for tensile, compressive, and three-point bend testing.
  * Hydro-mechanical maintenance SOPs, extensometer strain gauge re-zeroing, and emergency limit-switch validation.
* **Microelectronics & Silicon IC Design Workstations:**
  * Cadence Virtuoso, Synopsys Custom Compiler, and Mentor Graphics EDA suites operating on Enterprise Linux hosts.
  * FlexLM license daemon troubleshooting (lmgrd), TSMC PDK techfile linking (~/.cdsinit), and DRC/LVS rule decks.
* **Wet-Lab & Bio-Instrumentation:**
  * High-temperature digital dual-chamber autoclaves (50L) with pressure seal maintenance, citric acid descaling, and spore test validation protocols.

---

## 1.6 Security, Cryptography & Institutional Standards
* **Role-Based Access Control (RBAC):** Strict permissions matrix for STUDENT, FACULTY, TECHNICIAN, and ADMIN.
* **Cryptographic Verification Hashing:** Generates tamper-proof verification UIDs (CERT-KP-2026-XXXXXX) embedded into exported Dean Certificates of Contribution.
* **Global Accreditation Compatibility:** Architecture mapped directly to international engineering criteria:
  * **ABET & Washington Accord:** Lifelong learning, modern engineering tool usage, knowledge transfer.
  * **NBA / NAAC Criteria 3 & 4:** Research continuity, infrastructure utilization, institutional knowledge loss prevention.

---

# SECTION 2: METHODOLOGY AND PROCESS FOR IMPLEMENTATION

## 2.1 The 4 Life-Cycles of Campus Knowledge Retention

`
+-----------------------------------------------------------------------------+
|               THE 4 LIFE-CYCLES OF CAMPUS KNOWLEDGE RETENTION               |
+-----------------------------------------------------------------------------+
   1. CAPTURE              2. VERIFY              3. RETRIEVE           4. SUSTAIN
+---------------+      +---------------+      +---------------+     +---------------+
| • ERP Ingest  | ───> | • AI Integrity| ───> | • Gemini RAG  | ──> | • Gap Voting  |
| • Exit Capture|      | • Peer Review |      | • Ctrl+K Find |     | • Dean LOR    |
| • Lab SOPs    |      | • Faculty Seal|      | • Source Att. |     | • Audit Export|
+---------------+      +---------------+      +---------------+     +---------------+
`

---

## 2.2 Detailed Step-by-Step Implementation Pipeline

### Phase 1: Automated Knowledge Ingestion & Exit Capture
1. **Graduating Cohort ERP Synchronization:**
   * Department administrators upload graduating senior rosters (.csv / .xlsx exported from university ERP systems such as SAP, PeopleSoft, or Banner).
   * The platform parses student records (Name, Email, Roll Number, Department, Capstone Title) and dispatches automated exit knowledge capture invitations.
2. **Multi-Category Contribution Studio:**
   * Guided 4-step authoring workflow:
     * **Step 1 (Metadata):** Title, Department, Knowledge Category, Year Level, Tags.
     * **Step 2 (Prerequisites & Assets):** Tools required, hardware models, dataset links, GitHub repos, YouTube walkthroughs.
     * **Step 3 (Runbook Content):** Full technical markdown body, code blocks, circuit diagrams, and terminal commands.
     * **Step 4 (AI Quality Scoring):** Instant automated pre-flight integrity analysis.

---

### Phase 2: Tri-Tier Peer & Faculty Verification Framework
To eliminate the faculty review bottleneck where professors cannot review hundreds of notes weekly, KnowPass enforces a 3-tier trust hierarchy:

* **🤖 Tier 1 (Automated AI Academic Integrity Scan):**
  * Automated checks verify formatting quality, code syntax completeness, and redundancy against the existing corpus.
  * Scores are generated instantly (e.g., 96/100 Quality Score • 0% Campus Redundancy).
* **👥 Tier 2 (Senior Peer Consensus & Review):**
  * Students and senior researchers validate practical reproducibility in university labs.
  * Upon reaching **5+ community endorsements/upvotes**, the document automatically upgrades to 👥 Peer Reviewed.
* **🛡️ Tier 3 (Institutional Faculty / HOD Endorsement):**
  * Faculty and Lab Technicians only need to review pre-filtered, peer-approved Tier-2 assets.
  * A 1-click verification seal stamps the document as 🛡️ Faculty Endorsed (with the verifier's title, e.g., *Prof. Sarah Jenkins, HOD*), awards the author **+50 KnowPoints**, and issues an institutional notification.

---

### Phase 3: KnowBot RAG Grounded Retrieval & Spotlight Search
1. **Multi-Modal Query Ingestion:**
   * Users search via the Navbar Search, the Global Spotlight Command Palette (<kbd>Ctrl+K</kbd> / <kbd>Cmd+K</kbd>), or the **KnowBot AI Assistant**.
2. **Semantic Matching & Chunk Retrieval:**
   * Queries are matched against PostgreSQL indexes and the Gemini 2.0 AI context cache.
3. **Context-Grounded Synthesis:**
   * KnowBot synthesizes concise, actionable answers containing step-by-step terminal commands, troubleshooting steps, and direct source document citations with match percentages.

---

### Phase 4: Institutional Feedback Loop & Accreditation Governance
1. **Curriculum Industry Skill Gap Feedback Loop:**
   * Students and alumni vote on emerging skill gaps (e.g. Distributed Systems, Kubernetes, Generative AI).
   * Students can submit official "+ Request Missing Skill" proposals to Academic Deans (+25 pts).
2. **1-Click Executive Knowledge Audit Report Exporter:**
   * Admin console compiles live metrics into an official accreditation audit document (.md / PDF).
   * Quantifies engineering troubleshooting hours saved (~1,480+ hrs), prevented hardware downtime (,000+ / ₹12.4 Lakhs), and departmental coverage index for NBA/NAAC/ABET compliance.

---

## 2.3 System Architecture & Data Flow Diagrams

### Diagram 1: Comprehensive System Architecture

`
+-----------------------------------------------------------------------------+
|                             USER ACTOR PERSONAS                             |
|      [ Student / Scholar ]      [ Faculty / Dean ]      [ Lab Technician ]  |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                        PRESENTATION LAYER (React 18)                        |
|  - Contribution Studio (Step 1-4)       - KnowBot Grounded RAG Drawer       |
|  - Lab Equipment Wiki & Tacit Quirks    - Global Command Palette (Ctrl+K)   |
|  - Industry Skill Gap Matrix & Voting   - Dean LOR & Certificate Exporter   |
|  - Admin Console & ERP Ingestion Hub    - Real-Time Notification Bell       |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     APPLICATION & AI ENGINE SERVICES                        |
|  - Automated AI Quality Inspection Service (Clarity, Syntax, Duplicate)     |
|  - Google Gemini 2.0 RAG Retrieval & Citation Synthesis Engine              |
|  - Tri-Tier Verification State Machine (AI ➔ Peer Review ➔ Faculty Seal)    |
|  - Event-Driven Reactive Notification Dispatcher                            |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                        DATA PERSISTENCE & CLOUD LAYER                       |
|  - PostgreSQL Database (Supabase Enterprise Infrastructure)                 |
|  - Tables: profiles, knowledge_entries, lab_equipment, skill_gaps, comments  |
|  - Row Level Security (RLS) & Role-Based Access Control (RBAC)              |
|  - LocalStorage Resilient Fallback Cache                                    |
+-----------------------------------------------------------------------------+
`

---

### Diagram 2: Tri-Tier Verification Sequence Flow

`
Student Contributor          AI Quality Scorer       Senior Community       Faculty / Dean
         |                          |                       |                     |
         |--- 1. Submit Note ------>|                       |                     |
         |                          |--- 2. Syntax & ------|                     |
         |                          |    Clarity Check      |                     |
         |<-- 3. Tier-1 Passed -----|                       |                     |
         |    (96/100 AI Score)     |                       |                     |
         |                          |                       |                     |
         |------------------------------------------------->|                     |
         |               4. Lab Validation & Upvotes        |                     |
         |<-- 5. Tier-2 Passed (5+ Community Upvotes) ------|                     |
         |                                                  |                     |
         |----------------------------------------------------------------------->|
         |                                  6. Final Milestone Review             |
         |<-- 7. Tier-3 Certified (+50 pts & Dean LOR Credit) -------------------|
`

---

### Diagram 3: KnowBot Grounded RAG Query Execution Pipeline

`
User Query ("How to fix CUDA OOM on DGX?")
                  |
                  v
       Query Normalization & Intent
                  |
                  v
       Semantic Context Retrieval
 (Scans PostgreSQL Knowledge Assets & Equipment SOPs)
                  |
                  v
       Grounded Context Injection
   (Relevant Document Chunks + Query)
                  |
                  v
       Google Gemini 2.0 LLM
                  |
                  v
    Source-Grounded Synthesized Answer
  (Step-by-step fix + 98% Match Source Citation)
`

---

## 2.4 Working Prototype Deep Dive (Module-by-Module)

| # | Feature Module | Working Implementation | Institutional Impact |
|---|---|---|---|
| **1** | **Knowledge Catalog** | Real-time faceted filtering by department, type, year, tags, and rating with instant keyword search. | Eliminates hours spent searching across disorganized drives and folders. |
| **2** | **Contribution Studio** | 4-step authoring workflow with integrated AI Academic Integrity and Code Reproducibility analysis. | Enforces high documentation standards before publication. |
| **3** | **Tri-Tier Verification** | Automated AI score + 5-upvote senior consensus threshold + 1-click faculty seal. | Guarantees technical accuracy while completely eliminating faculty burnout. |
| **4** | **Lab Equipment Wiki** | Detailed runbooks for DGX SuperPODs, UTMs, and Oscilloscopes with **Tacit Tribal Knowledge & Hardware Quirks**. | Prevents student hardware mistakes and saves ₹12.4 Lakhs (,000+) in repair SLAs. |
| **5** | **Placement & Skill Gap Hub** | Company-wise interview playbooks + interactive curriculum skill gap voting (+ Request Skill modal). | Connects student placement experiences directly to Dean curriculum updates. |
| **6** | **KnowBot RAG Assistant** | 24/7 AI chatbot with clickable campus quick-prompt pills delivering grounded answers with source citations. | Provides 24/7 technical assistance for late-night lab and coding blockers. |
| **7** | **Command Palette (<kbd>Ctrl+K</kbd>)** | Spotlight search modal providing sub-second fuzzy navigation across all knowledge entries, mentors, and tools. | Enterprise-grade productivity for power users. |
| **8** | **Dean's Certificate Exporter** | 1-click generator for official Dean's Letter of Recommendation & Contribution Certificate (.md/PDF). | Gives students real academic rewards (LORs + GPU compute hours) for contributing. |
| **9** | **Admin Governance & Audit** | Graduating cohort ERP roster ingestion + 1-click NAAC/NBA/ABET Executive Audit Report exporter. | Automated compliance evidence for university leadership and accreditation boards. |

---

# SECTION 3: KEY DIFFERENTIATORS & COMPETITIVE ADVANTAGES

1. **Not Just Another Wiki:** Unlike static wikis (Confluence, Notion) that become obsolete dumping grounds, KnowPass integrates automated ERP exit capture, AI quality scoring, and living skill gap feedback loops.
2. **Solves the Faculty Bottleneck:** Tri-Tier verification ensures professors only review peer-validated assets, requiring less than 2 minutes of faculty effort per week.
3. **Tacit Tribal Knowledge Focus:** Specifically captures what vendor manuals omit—physical adapter storage drawers, OS driver quirks, and past batch failure logs.
4. **Real Academic Incentives:** Converts gamified KnowPoints into tangible institutional benefits (Dean LORs, GPU cluster compute quota, 24/7 prototyping lab keycard access).
5. **Globally Accredited Architecture:** Mapped to international standards (ABET, Washington Accord, NBA/NAAC Criteria 3 & 4) for multi-institution cross-campus deployment.
