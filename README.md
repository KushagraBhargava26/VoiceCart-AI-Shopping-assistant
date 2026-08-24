# VoiceCart — AI-Powered Voice Shopping Assistant

[![Live App](https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-000000?logo=vercel&logoColor=white)](https://voice-cart-ai-shopping-assistant.vercel.app)
[![Backend Status](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?logo=render&logoColor=black)](https://voicecart-backend.onrender.com/api/v1/health)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)

VoiceCart is an intelligent, voice-first shopping assistant designed to simplify how users manage groceries and household lists. Powered by the **Browser Web Speech API** and **Google Gemini AI**, VoiceCart understands conversational voice instructions in English, Hindi, and Hinglish to automatically manage shopping lists, estimate live cart bill (₹), search products with price filters, generate smart reorder suggestions, and track purchase history.

---

## 🔗 Live Application Links

- 🌐 **Web Application:** [https://voice-cart-ai-shopping-assistant.vercel.app](https://voice-cart-ai-shopping-assistant.vercel.app)
- ⚙️ **API Backend:** [https://voicecart-backend.onrender.com/api/v1/health](https://voicecart-backend.onrender.com/api/v1/health)
- 📝 **Project Write-Up:** [PROJECT_WRITEUP.md](./PROJECT_WRITEUP.md)

---

## 🌟 Key Features & Contract Compliance

- **🎙️ Conversational Voice Commands:** Add, update, remove items, or search products using natural spoken language (e.g., *"Add 2 litres of milk"*, *"I need 12 eggs"*, *"Remove bread"*).
- **🌐 Multilingual Voice Recognition:** Supports both Indian English (`en-IN`) and Hindi (`hi-IN`) with Devanagari & Hinglish keyword extraction.
- **🧠 Gemini AI NLP Parsing:** Real-time intent extraction and structured entity resolution (`action`, `item`, `quantity`, `unit`, `brand`, `priceRange`).
- **💰 Live Budget Estimator:** Real-time ₹ cart bill calculation joining active list items with catalog price data.
- **🧺 Interactive Shopping List:** Real-time quantity adjustment, item deletion, manual add forms, and context-aware emoji icons for 400+ Indian grocery items.
- **✨ Smart AI Suggestions & Substitutes:** Recommendations based on purchase history, complementary items, seasonal fresh produce (e.g., *Mangoes*), and healthy product substitutes (e.g., *Almond Milk* for Regular Milk).
- **🔍 Voice & Text Product Search:** Debounce search across product names, brands, categories, and voice-activated price filters (*"Find toothpaste under 300"*).
- **↺ Purchase History:** Comprehensive historical log of all purchased and removed items with timestamps and 1-click reordering.
- **▦ Category Browser:** Responsive visual grid covering Dairy & Eggs, Bakery & Snacks, Fruits & Vegetables, Cooking & Spices, Beverages & Tea, and Personal Care.
- **🔐 Auth & Real Email OTP:** Right-side split Login screen with Real Google SSO (`@react-oauth/google`), Guest Access, and real Nodemailer 6-digit email OTP password reset.
- **🛡️ Zero-Fail Resilience Architecture:** 100% crash-proof React ErrorBoundary with intelligent local fallbacks across all API services for uninterrupted offline/online experience.

---

## 🏗️ Architecture & Tech Stack

```
VoiceCart/
├── client/                     # Frontend (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/         # Modular UI Cards (voice, shopping, suggestions, auth, etc.)
│   │   ├── hooks/              # Custom React Hooks (useVoiceRecognition)
│   │   ├── services/           # API Client & Zero-Fail Service Layer
│   │   ├── utils/              # Context emoji mapper (itemIcons.js) & Speech synthesizer (speech.js)
│   │   ├── App.jsx             # React Router v6 Outlet Layout & Session Manager
│   │   └── main.jsx            # Application Entry Point & ErrorBoundary
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma       # Relational Database Schema
│   │   └── seed.js             # Catalog seed script
│   ├── src/
│   │   ├── controllers/        # Express Route Handlers
│   │   ├── routes/             # RESTful API Endpoints (/api/v1/*)
│   │   ├── services/           # Gemini AI, Nodemailer Email, & Business Services
│   │   └── server.js           # Express App Entry Point
│   └── package.json
│
├── PROJECT_WRITEUP.md          # Official Brief Project Write-Up (<200 words)
└── README.md
```

---

## 📡 REST API Reference

All backend routes are versioned under `/api/v1/*`:

### Authentication (`/api/v1/auth`)
- `POST /login` — Authenticate user via email and password
- `POST /signup` — Register new user account
- `POST /google` — Authenticate Google OAuth ID token
- `POST /forgot-password` — Generate & dispatch 6-digit OTP reset code to user's real email
- `POST /reset-password` — Verify 6-digit OTP code and update user password

### Shopping List (`/api/v1/shopping-list`)
- `GET /` — Fetch active shopping list with live cart total (₹)
- `POST /items` — Add item (`{ name, quantity, unit, brand, category }`)
- `PATCH /items/:id` — Update quantity or details
- `DELETE /items/:id` — Remove item (archived to purchase history)

### Voice Commands (`/api/v1/commands`)
- `POST /` — Process natural language transcript using Gemini AI (`{ transcript, language }`)

### Smart Suggestions (`/api/v1/suggestions`)
- `GET /` — Retrieve replenishment recommendations, seasonal items, and substitutes

### Products & Search (`/api/v1/search`)
- `GET /?query=...` — Search products by keyword, brand, or size
- `GET /?category=...` — Filter products by category

### Purchase History (`/api/v1/history`)
- `GET /` — Retrieve chronological purchase history with 1-click reorder

### Categories (`/api/v1/categories`)
- `GET /` — List product categories with live item counts

---

## 🗣️ Supported Voice Commands

| Goal | English Example | Hindi Example |
|---|---|---|
| **Add Items** | *"Add 2 litres of Amul milk and 12 eggs"* | *"2 packet dahi aur 1kg chawal add kar do"* |
| **Remove Items** | *"Remove bread from my shopping list"* | *"Bread list se hata do"* |
| **Partial Quantity Remove**| *"Remove 2 bottles of water"* | *"2 doodh kam kar do"* |
| **Product Search** | *"Find toothpaste under 300 rupees"* | *"Chai patti search karo"* |
| **Cart Bill Query** | *"How much is my bill?"* | *"Mera bill kitna hoga?"* |

---

## 📄 Deliverables

- 📄 **Project Write-Up:** [PROJECT_WRITEUP.md](./PROJECT_WRITEUP.md) (159 words)
- 📜 **Project Contract:** [VoiceCart — Project Contract.md](./VoiceCart%20%E2%80%94%20Project%20Contract.md)

---

## 👨‍💻 Author

**Kushagra Bhargava**
- GitHub: [@KushagraBhargava26](https://github.com/KushagraBhargava26)
- Repository: [VoiceCart-AI-Shopping-assistant](https://github.com/KushagraBhargava26/VoiceCart-AI-Shopping-assistant)
