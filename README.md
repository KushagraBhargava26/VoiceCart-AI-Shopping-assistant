# VoiceCart — AI-Powered Voice Shopping Assistant

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)

VoiceCart is an intelligent, voice-first shopping assistant designed to simplify how users manage groceries and household lists. Powered by the **Browser Web Speech API** and **Google Gemini AI**, VoiceCart understands conversational voice instructions in both English and Hindi/Hinglish to automatically manage shopping lists, search products, generate smart reorder suggestions, and track purchase history.

---

## 🌟 Key Features

- **🎙️ Conversational Voice Commands:** Add, update, remove items, or search products using natural spoken language (e.g., *"Add 2 litres of milk"*, *"I need 12 eggs"*, *"Remove bread"*).
- **🌐 Multilingual Voice Recognition:** Supports both Indian English (`en-IN`) and Hindi (`hi-IN`).
- **🧠 Gemini AI NLP Parsing:** Real-time intent extraction and structured entity resolution powered by Google Gemini.
- **🧺 Interactive Shopping List:** Real-time quantity adjustment, item deletion, custom manual add forms, and context-aware emoji icons for over 400+ grocery items.
- **✨ Smart AI Suggestions:** Proactive replenishment recommendations based on purchase frequency, complementary items, and seasonal essentials.
- **🔍 Full Product Catalog Search:** Instant debounce search across product names, brands, categories, and prices.
- **↺ Purchase History:** Comprehensive historical log of all purchased and removed items with timestamps.
- **▦ Category Browser:** Visual category grid covering Dairy, Fruits, Vegetables, Beverages, Snacks, Grains, Personal Care, and Bakery.
- **🎨 Sleek Dark-Mode UI:** Clean dark aesthetic with responsive layout (desktop sidebar + mobile slide-out drawer) and zero unnecessary heavy dependencies.

---

## 🏗️ Architecture & Tech Stack

```
VoiceCart/
├── client/                     # Frontend (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/         # Modular UI Cards (voice, shopping, suggestions, etc.)
│   │   ├── hooks/              # Custom React Hooks (useVoiceRecognition)
│   │   ├── services/           # API Client & Service layer
│   │   ├── utils/              # Keyword-based context emoji mapper (itemIcons.js)
│   │   ├── App.jsx             # Main Layout & View State Manager
│   │   └── main.jsx            # Application Entry Point
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema & Relations
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── routes/             # RESTful API Endpoints (/api/v1/*)
│   │   ├── services/           # Gemini AI & Business Logic services
│   │   └── server.js           # Express App Server Entry Point
│   └── package.json
│
└── README.md
```

### Technology Highlights

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 | Ultra-fast SPA with modern dark-mode theme |
| **Backend** | Node.js, Express 5 | Modular REST API service |
| **Database** | PostgreSQL (Neon), Prisma ORM | Scalable relational schema with migrations |
| **AI / NLP** | Google Gemini API | Natural language understanding & JSON action parser |
| **Voice Engine**| Web Speech API (`SpeechRecognition`) | Zero-latency in-browser audio transcription |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **PostgreSQL Database:** A local PostgreSQL instance or a free cloud database on [Neon.tech](https://neon.tech/)
- **Google Gemini API Key:** Get a free API key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/KushagraBhargava26/VoiceCart-AI-Shopping-assistant.git
cd VoiceCart-AI-Shopping-assistant
```

---

### 2. Configure Backend (`server/`)

1. Navigate to the server folder and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/neondb?sslmode=require"
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

3. Initialize the database schema & seed sample products:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### 3. Configure Frontend (`client/`)

1. Open a new terminal window, navigate to the client folder and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Create a `.env` file inside the `client/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 📡 REST API Reference

All backend routes are versioned under `/api/v1/*`:

### Shopping List (`/api/v1/shopping-list`)
- `GET /` — Fetch the active shopping list items
- `POST /` — Add a new item to the shopping list (`{ name, quantity, unit, brand, category }`)
- `PATCH /:id` — Update quantity, unit, or details of an existing item
- `DELETE /:id` — Remove an item from the shopping list (automatically archived to history)

### Voice Commands (`/api/v1/commands`)
- `POST /` — Process natural language transcript using Gemini AI (`{ transcript, language }`)

### Smart Suggestions (`/api/v1/suggestions`)
- `GET /` — Retrieve AI-generated smart replenishment recommendations

### Products & Search (`/api/v1/search`)
- `GET /?query=...` — Search products by keyword
- `GET /?category=...` — Filter products by category name

### Purchase History (`/api/v1/history`)
- `GET /` — Retrieve chronological purchase and removal history

### Categories (`/api/v1/categories`)
- `GET /` — List all product categories with live item counts

---

## 🗣️ Supported Voice Commands

You can speak naturally in English or Hindi:

| Goal | English Example | Hindi Example |
|---|---|---|
| **Add Items** | *"Add 2 litres of Amul milk and 12 eggs"* | *"2 packet dahi aur 1kg chawal add kar do"* |
| **Remove Items** | *"Remove bread from my shopping list"* | *"Bread list se hata do"* |
| **Update Quantity** | *"Change bananas quantity to 2 dozen"* | *"Kele ki quantity 2 dozen kar do"* |
| **Product Search** | *"Find toothpaste under 150 rupees"* | *"Chai patti search karo"* |
| **Get Suggestions**| *"What should I buy today?"* | *"Mujhe kya kharidna chahiye?"* |

---

## 📦 Production Build

To create an optimized production build for deployment:

```bash
# Build Frontend
cd client
npm run build

# Preview Production Build
npm run preview
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 👨‍💻 Author

**Kushagra Bhargava**
- GitHub: [@KushagraBhargava26](https://github.com/KushagraBhargava26)
- Repository: [VoiceCart-AI-Shopping-assistant](https://github.com/KushagraBhargava26/VoiceCart-AI-Shopping-assistant)
