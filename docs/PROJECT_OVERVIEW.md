# ReturnShield AI — Project Architecture & Overview

## 1. System Mission
ReturnShield AI is an independent, seller-centric intelligence and evidence verification platform. It enables small and medium-sized e-commerce sellers (such as independent merchants and sellers on open marketplaces) to:
- Document and preserve verifiable dispatch evidence with unique cryptographic tokens and QR codes.
- Systematically inspect returned parcels against original dispatch photographs.
- Detect abnormal return frequency and suspicious patterns using rule-based explainable risk scoring.
- Generate tamper-evident PDF dispute dossiers ready for platform claims submission.

---

## 2. Technology Stack & Architectural Roles

| Layer | Technology | Role & Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | High-performance SPA with fast hot-reloading and modular components |
| **Design System** | Custom CSS3 + Lucide Icons | Clean modern SaaS design inspired by Linear & Stripe (Deep Navy & Electric Indigo) |
| **Charts** | Recharts / Chart.js | Visual return rates, risk trends, and loss distributions |
| **Backend** | Python Flask (RESTful) | Lightweight, modular Python backend easily connecting to data science libraries |
| **ORM & DB** | SQLAlchemy + SQLite (migratable to MySQL) | Clean data models, migrations, foreign key constraints |
| **Evidence & Vision** | OpenCV + Pillow + QRCodegen | Image comparison metrics (histogram, SSIM) & QR verification tags |
| **Risk Engine** | Scikit-learn + Rule-Based Engine | Transparent, explainable risk scoring (0-100) with clear reasoning |
| **Dossier Engine** | ReportLab | PDF generation containing order details, dispatch photos, and inspection notes |

---

## 3. High-Level Architecture Diagram

```
+--------------------------------------------------------------------------+
|                        ReturnShield AI Client (React)                    |
|  [Landing Page] -> [Auth (JWT)] -> [Dashboard] -> [Orders & Products]     |
|  [Dispatch Evidence Generator] -> [Inspection Studio] -> [Claims/PDF]    |
+--------------------------------------------------------------------------+
                                     |  HTTP REST / JSON
                                     v
+--------------------------------------------------------------------------+
|                        Flask Backend API (Python)                        |
|  - routes/auth.py         - routes/products.py     - routes/orders.py    |
|  - routes/dispatch.py     - routes/returns.py      - routes/claims.py    |
|  - routes/analytics.py    - ai/risk_engine.py      - ai/image_compare.py |
+--------------------------------------------------------------------------+
          |                                            |
          v                                            v
+------------------------+                  +-------------------------+
| SQLite / MySQL DB      |                  | Static Media & Uploads  |
| - Users & Products     |                  | - dispatch/             |
| - Orders & Evidence    |                  | - returns/              |
| - Inspections & Claims |                  | - products/             |
+------------------------+                  +-------------------------+
```

---

## 4. Multi-Phase Implementation Plan

- **Phase 1 (Current)**: Architecture design, folder structure, UI design system, navigation bar, footer, landing page, and responsive layouts.
- **Phase 2**: Authentication (register/login with JWT & password hashing), protected route structure, and the main Seller Dashboard.
- **Phase 3**: Product and Order management modules with active database integration.
- **Phase 4**: Dispatch verification with multi-photo upload, unique token generation, and QR code creation.
- **Phase 5**: Return management and side-by-side Return Inspection Studio with OpenCV image comparison metrics.
- **Phase 6**: Explainable AI risk assessment engine with transparent score breakdowns.
- **Phase 7**: Claims management, tamper-evident PDF dossier export (ReportLab), and analytics.
- **Phase 8**: End-to-end testing, documentation, and demo dataset initialization.
