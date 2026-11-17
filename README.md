# ReturnShield AI — Modern E-Commerce Return Fraud Defense Platform

ReturnShield AI is an independent, seller-centric web application designed for small and medium-sized e-commerce sellers (such as independent merchants selling on platforms like Meesho, Amazon, or Flipkart) to preserve photographic dispatch evidence, conduct side-by-side return inspections, calculate return-related financial loss, and export verifiable dispute dossiers.

---

## 🏗️ Folder Structure Overview

```
ReturnShield-AI/
│
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # Reusable UI widgets
│   │   │   ├── Navbar.jsx        # Sticky top navigation with mobile responsive drawer
│   │   │   ├── Footer.jsx        # Footer with platform disclaimers & project links
│   │   │   ├── Sidebar.jsx       # Collapsible SaaS sidebar with active routing
│   │   │   ├── StatCard.jsx      # Metric stat cards with trend indicators
│   │   │   └── RiskBadge.jsx     # Normalized Risk badge (Low, Med, High)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Public marketing & conversion page
│   │   │   └── LandingPage.css   # Hero, Problem, Workflow & Feature styles
│   │   ├── styles/
│   │   │   ├── variables.css     # Design tokens (Deep Navy, Electric Indigo)
│   │   │   ├── global.css        # Base reset, typography, and utility classes
│   │   │   └── components.css    # Buttons, cards, inputs, and tables
│   │   ├── App.jsx               # React Router configuration
│   │   └── main.jsx              # React 18 DOM mount entrypoint
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration
│
├── backend/                      # Python Flask Backend
│   ├── app/
│   │   ├── routes/               # API route blueprints (Auth, Orders, Returns, Claims)
│   │   ├── models/               # SQLAlchemy modular database models
│   │   ├── services/             # Business logic & evidence generation
│   │   ├── ai/                   # Rule-based scoring & OpenCV comparison
│   │   └── utils/                # Token generators, validators, and file handlers
│   ├── uploads/                  # Upload directories (dispatch, returns, products)
│   ├── config.py                 # Application configuration
│   ├── run.py                    # Flask server entrypoint
│   └── requirements.txt          # Python dependencies
│
├── database/                     # SQL schema and seed scripts
│   ├── schema.sql                # Complete relational schema
│   └── seed_data.py              # Demo mock data generator
│
├── docs/                         # In-depth architectural documentation
│   ├── PROJECT_OVERVIEW.md       # Architecture specification and design roadmap
│   ├── DATABASE_DESIGN.md        # Table schema and ERD
│   ├── API_DOCUMENTATION.md      # REST endpoints specification
│   └── HOW_IT_WORKS.md           # Step-by-step dispatch to claims pipeline
│
├── .gitignore                    # Git ignore file
└── README.md                     # Project quickstart and setup guide
```

---

## 🚀 How to Run the Platform

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Launch Backend API Server
```bash
# In the project root, activate virtual environment:
.\venv\Scripts\Activate.ps1

# Navigate to backend and launch Flask API (port 5000):
cd backend
python run.py
```
Backend API will be accessible at [http://127.0.0.1:5000/api](http://127.0.0.1:5000/api).

Default Demo Seller Credentials (populated by `database/seed_data.py`):
- **Email:** `seller@returnshield.ai`
- **Password:** `seller123`

### 2. Launch Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📌 Phase Progress
- [x] **Phase 1**: Project Architecture, Folder Structure, Design System, Navigation, and Landing Page.
- [x] **Phase 2**: Authentication (JWT) & Seller Command Dashboard.
- [x] **Phase 3**: Product & Order Management with Database and Seed Data.
- [x] **Phase 4**: Dispatch Evidence, Multi-Photo Upload & Cryptographic QR Verification Tokens.
- [x] **Phase 5**: Return Requests Intake & Side-by-Side Inspection Studio with OpenCV Histogram & SSIM Disparity.
- [x] **Phase 6**: Explainable AI Risk Engine with Transparent Heuristic Breakdown (0-100 score).
- [x] **Phase 7**: Dispute Claims & ReportLab Tamper-Evident PDF Dossier Export with Deep Loss Telemetry.
- [x] **Phase 8**: Production Bundle Validation & End-to-End Route Integration.
