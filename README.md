<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" />
</p>

<h1 align="center">🩸 LabLink — Intelligent Blood Bank & Lab Management Platform</h1>

<p align="center">
  <strong>A production-grade, full-stack healthcare platform that digitizes end-to-end blood bank operations, lab diagnostics, patient management, and emergency response — built for real-world hospital networks.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

---

## 🔥 Why LabLink?

India's blood banking infrastructure still relies heavily on manual registers and phone calls. **LabLink** bridges that gap with a unified digital platform that connects **blood banks**, **hospitals**, **donors**, **lab technicians**, and **patients** in real time — enabling faster emergency response, smarter inventory management, and complete traceability from donation to transfusion.

---

## ✨ Features

### 🏥 Multi-Portal Architecture
| Portal | Description |
|--------|-------------|
| **Admin Dashboard** | Centralized control — manage inventory, donors, recipients, hospitals, analytics, and system-wide settings |
| **Hospital Portal** | Independent hospital login with dedicated dashboard, inventory view, blood requests, donor management, lab technician tools, and SOS broadcasting |
| **Patient Portal** | Self-service patient registration (Smart Panjikaran), lab test booking, medical records, and order tracking |
| **Lab Technician View** | Sample collection workflows, barcode generation, result entry, critical value flagging, and payment recording |

### 🩸 Blood Bank Management
- **Specimen Lifecycle Tracking** — Create, track, and manage blood specimens from collection → testing → storage → transfusion with auto-expiry detection
- **8 Blood Group Support** — Full ABO-Rh classification (A±, B±, AB±, O±) with real-time availability counts
- **Blood Compatibility Calculator** — Interactive tool showing donor/recipient compatibility for all blood types
- **Inventory Analytics** — Live stock levels with low-stock alerts, usage trends, and expiry warnings
- **Donor Impact Tracker** — Visualize lives saved, donation streaks, and gamified reward points

### 🚨 Emergency SOS System
- **One-Click Emergency Broadcast** — Hospitals can broadcast urgent blood needs to all matching donors within a configurable radius
- **Geolocation-Aware Matching** — GeoJSON-indexed donor coordinates for proximity-based notifications
- **Real-Time Donor Responses** — Track accepted/declined responses with ETA and distance
- **Urgency Levels** — Critical vs. Urgent classification with 2-hour auto-expiry
- **Multi-Channel Notifications** — In-app, SMS, and push notification support

### 🔬 Lab Management System (LIS)
- **Test Catalog** — Searchable catalog with categories (Hematology, Biochemistry, Radiology, etc.), pricing, prerequisites, fasting requirements, and turnaround times
- **Patient Cart & Checkout** — E-commerce style add-to-cart → checkout flow for lab test orders
- **Sample Collection Workflow** — Barcode-based sample identification, collection timestamps, and chain-of-custody tracking
- **Result Entry & Verification** — Structured result fields with normal ranges, critical value flagging, and dual verification (technician → pathologist)
- **Payment Tracking** — Multi-mode payment recording (Cash, Card, UPI, Insurance, Online)
- **Lab Inventory Management** — Reagent and consumable tracking

### 🏕️ Donation Camps
- **Camp Creation & Management** — Schedule camps with location, organizer details, expected donors, and time slots
- **Donor Registration** — Pre-register donors for upcoming camps with attendance and donation tracking
- **Real-Time Camp Dashboard** — Live units collected, registration counts, and camp status management

### 🎖️ Donor Rewards & Gamification
- **Points System** — Earn points for donations, emergency responses, referrals, streak bonuses, and camp attendance
- **Rank Progression** — Beginner → Contributor → Hero → Legend → Lifesaver
- **Badge System** — Bronze, Silver, Gold, and Platinum badges based on milestones
- **Leaderboard** — Competitive ranking to drive engagement
- **Lives Saved Counter** — Visual impact tracker (each donation = up to 3 lives)

### 💬 Real-Time Chat
- **Hospital ↔ Admin Messaging** — Per-hospital chat threads with read/unread tracking
- **Unread Count Badges** — Separate counters for admin and hospital sides
- **Message History** — Persistent, searchable conversation history

### 📊 Advanced Analytics Dashboard
- **Blood Inventory Distribution** — Bar/Pie charts by blood group (available, reserved, used)
- **Donation Trends** — 12-month line charts with monthly donation counts
- **Top Donors Leaderboard** — Ranked by donation count and reward points
- **Emergency Response Metrics** — Average response time, fulfillment rate, active emergencies
- **Hospital Request Analytics** — Pending/fulfilled/rejected breakdown with fulfillment rate
- **Appointment Statistics** — Booking trends and slot utilization

### 🌍 Blood Stock Map (eRaktKosh Integration)
- **Nearby Blood Banks** — Location-aware search showing real-time stock levels across blood banks
- **Stock Level Indicators** — High / Medium / Low / Critical visual badges
- **Healthcare Facility Directory** — Hospital details with contact, distance, and facility type

### 🔐 Authentication & Authorization
- **Dual Auth Flow** — Separate JWT-based authentication for Admin/Staff and Hospitals
- **Passport.js Strategies** — Local (email/password) + JWT bearer token
- **Role-Based Access** — Staff, Manager, Patient roles with middleware-enforced route protection
- **Hospital Approval System** — Admin must approve new hospital registrations before access is granted
- **Password Hashing** — bcrypt with configurable salt rounds

### 🌐 Internationalization (i18n)
- **Multi-Language Support** — English and Hindi translations for all UI strings
- **react-i18next** — Runtime language switching without page reload

### 📱 QR Code System
- **Donor QR Codes** — Generate scannable QR codes containing donor identity and blood group
- **Specimen QR Codes** — QR-based specimen identification for contactless verification
- **Client-Side Scanning** — In-browser QR/barcode scanning via `html5-qrcode` and `jsQR`
- **Barcode Generation** — Lab order barcodes for sample tracking

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Admin    │  │ Hospital  │  │ Patient  │  │    Lab     │ │
│  │ Dashboard │  │  Portal   │  │  Portal  │  │ Technician │ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └─────┬──────┘ │
│       │              │              │               │        │
│  ┌────┴──────────────┴──────────────┴───────────────┴────┐  │
│  │              Axios API Layer + JWT Interceptors         │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │ REST API (JSON)
┌───────────────────────────┼──────────────────────────────────┐
│                    BACKEND (Express 5)                        │
│  ┌────────────────────────┴───────────────────────────────┐  │
│  │         Passport.js (Local + JWT) Middleware            │  │
│  └────────────────────────┬───────────────────────────────┘  │
│  ┌────────┐ ┌───────────┐ │ ┌───────────┐ ┌──────────────┐  │
│  │  Auth  │ │ Blood Inv │ │ │ Emergency │ │   Lab LIS    │  │
│  │ Routes │ │  Routes   │ │ │  Routes   │ │   Routes     │  │
│  └───┬────┘ └─────┬─────┘ │ └─────┬─────┘ └──────┬───────┘  │
│      │            │       │       │               │          │
│  ┌───┴────────────┴───────┴───────┴───────────────┴───────┐  │
│  │              21 Controllers + 23 Mongoose Models        │  │
│  └────────────────────────┬───────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │   MongoDB Atlas     │
                 │   (Mongoose 8.x)    │
                 └─────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with hooks and context API |
| **React Router 7** | Client-side routing with nested layouts and protected routes |
| **Tailwind CSS 3.4** | Utility-first responsive styling |
| **Recharts** | Data visualization — Bar, Line, Pie charts for analytics |
| **Lucide React** | Modern icon library |
| **Axios** | HTTP client with JWT interceptors |
| **react-i18next** | Multi-language internationalization |
| **qrcode.react** | QR code generation component |
| **html5-qrcode / jsQR** | Client-side QR & barcode scanning |
| **react-barcode** | Barcode rendering for lab samples |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework with middleware pipeline |
| **MongoDB + Mongoose 8** | NoSQL database with schema validation, virtuals, and aggregation pipelines |
| **Passport.js** | Authentication (Local + JWT strategies) |
| **jsonwebtoken** | JWT token generation and verification |
| **bcryptjs** | Password hashing |
| **qrcode** | Server-side QR code generation |
| **CORS** | Cross-origin resource sharing with whitelist |

### DevOps & Deployment
| Technology | Purpose |
|-----------|---------|
| **Netlify** | Frontend hosting with `_redirects` SPA support |
| **Render** | Backend hosting with health checks |
| **Vercel** | Alternative frontend deployment |
| **gh-pages** | GitHub Pages deployment pipeline |
| **nodemon** | Hot-reload dev server |

---

## 📂 Project Structure

```
LabLink/
├── blood-bank-app/                 # React Frontend (67 source files)
│   ├── public/                     # Static assets & SPA redirect config
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # Sidebar, Header, HospitalLayout
│   │   │   ├── shared/             # BloodCompatibilityCalculator, DonorImpactTracker,
│   │   │   │                       #   DataTable, QRCodeDisplay, QRScanner, Toast
│   │   │   └── ui/                 # StatCard, StatusBadge
│   │   ├── context/                # AuthContext, HospitalAuthContext, ThemeContext, ToastContext
│   │   ├── pages/
│   │   │   ├── hospital/           # 10 hospital portal pages
│   │   │   ├── DashboardPage.jsx   # Admin dashboard
│   │   │   ├── EmergencySOSPageNew.jsx
│   │   │   ├── EnhancedAnalyticsPage.jsx
│   │   │   ├── LabTechnicianPage.js
│   │   │   ├── LabPatientPage.js
│   │   │   ├── PatientRegistrationPage.jsx
│   │   │   ├── BloodStockMapPage.jsx
│   │   │   └── ...                 # 25+ pages total
│   │   ├── services/               # api.js, labService.js, patientService.js, eRaktKoshService.js
│   │   ├── i18n.js                 # English + Hindi translations
│   │   └── App.js                  # Root router with protected routes
│   ├── tailwind.config.js
│   └── package.json
│
├── blood-bank-backend/             # Express Backend (79 source files)
│   ├── config/                     # database.js, passport.js
│   ├── controllers/                # 21 controllers
│   ├── middleware/                  # isAuthenticated, isAuthorized, isHospitalAuthenticated, isAdminOrHospital
│   ├── models/                     # 23 Mongoose models
│   ├── routes/                     # 21 route files
│   ├── server.js                   # Entry point — Express app config, CORS, routes, health check
│   ├── seedDatabase.js             # Database seeder scripts
│   └── package.json
│
├── documentation/                  # Postman collection + deployment guides
├── netlify.toml                    # Netlify build config
├── render.yaml                     # Render deployment blueprint
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) URI)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/LabLink.git
cd LabLink
```

### 2. Backend Setup

```bash
cd blood-bank-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lablink
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Seed the database (optional):

```bash
node seedDatabase.js
node seedHospitals.js
node seedDonationCamps.js
node addAdminUser.js
```

Start the server:

```bash
# Development (hot-reload)
npm run dev

# Production
npm start
```

> Server runs on `http://localhost:5000` with health check at `/health`

### 3. Frontend Setup

```bash
cd blood-bank-app
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm start
```

> App runs on `http://localhost:3000`

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

| Module | Endpoint | Methods | Auth |
|--------|----------|---------|------|
| **Auth** | `/auth` | POST login, register | Public |
| **Donors** | `/donors` | GET, POST, PUT, DELETE | JWT |
| **Recipients** | `/recipients` | GET, POST, PUT, DELETE | JWT |
| **Blood Specimens** | `/blood-specimens` | GET, POST, PUT, DELETE | JWT |
| **Hospitals** | `/hospitals` | GET, POST, PUT, DELETE | JWT |
| **Hospital Auth** | `/hospital/auth` | POST login, register | Public |
| **Blood Requests** | `/requests` | GET, POST, PUT | JWT |
| **Emergency SOS** | `/emergency` | POST broadcast, GET active, PUT respond | JWT / Hospital |
| **Appointments** | `/appointments` | GET, POST, PUT | JWT |
| **Donation Camps** | `/camps` | GET, POST, PUT, DELETE | JWT |
| **Rewards** | `/rewards` | GET profile, GET leaderboard | JWT |
| **QR Codes** | `/qr` | GET donor/:id, GET specimen/:id, POST verify | Public / JWT |
| **Chat** | `/chat` | GET, POST, PUT | JWT / Hospital |
| **Analytics** | `/analytics` | GET dashboard, GET blood-groups | JWT |
| **Lab Tests** | `/lab/tests` | GET, POST | JWT |
| **Lab Orders** | `/lab/orders` | GET, POST cart, POST checkout | JWT |
| **Lab Technician** | `/lab/technician` | GET requests, PUT approve, POST barcode, POST results | JWT |
| **Patients** | `/patients` | POST register, POST login, GET | JWT |
| **Cities** | `/cities` | GET, POST | JWT |
| **Managers** | `/managers` | GET, POST, PUT, DELETE | JWT |
| **Recording Staff** | `/recording-staff` | GET, POST, PUT, DELETE | JWT |
| **eRaktKosh** | `/eraktkosh` | GET blood-stock, GET facilities | Public |

> Full Postman collection available at `documentation/BloodLink_API.postman_collection.json`

---

## 🌐 Deployment

### Frontend → Netlify

```bash
cd blood-bank-app
npm run build
# Deploy via Netlify CLI or connect GitHub repo
```

### Backend → Render

The `render.yaml` blueprint is pre-configured:

```yaml
# Auto-deploys from GitHub with health check at /health
```

### Environment Variables (Production)

| Variable | Where | Value |
|----------|-------|-------|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Strong random secret |
| `NODE_ENV` | Backend | `production` |
| `FRONTEND_URL` | Backend | `https://your-app.netlify.app` |
| `REACT_APP_API_URL` | Frontend | `https://your-api.onrender.com/api` |

---

## 📊 Codebase Stats

| Metric | Count |
|--------|-------|
| Backend source files | **79** |
| Frontend source files | **67** |
| Mongoose models | **23** |
| API controllers | **21** |
| REST route files | **21** |
| React pages | **25+** |
| Reusable components | **12+** |
| API endpoints | **60+** |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for details.

---

<p align="center">
  <strong>Built with ❤️ for healthcare innovation</strong><br/>
  <sub>If this project helped you, consider giving it a ⭐</sub>
</p>
