# VoiceCart — System Architecture

## 1. Architecture Overview

VoiceCart follows a **full-stack, modular architecture** consisting of four major layers:

```text
┌─────────────────────────────────────────────┐
│                 USER                        │
│        Voice / Touch Interaction            │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              FRONTEND                       │
│         React + Vite + Tailwind             │
│                                             │
│  UI │ Voice Input │ State │ API Client      │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTP / REST API
                       ▼
┌─────────────────────────────────────────────┐
│               BACKEND                       │
│           Node.js + Express                 │
│                                             │
│ Routes │ Controllers │ Services │ Validation│
└──────────────┬──────────────────┬───────────┘
               │                  │
               ▼                  ▼
┌──────────────────────┐  ┌───────────────────┐
│     AI / NLP         │  │    PostgreSQL     │
│     Gemini API       │  │      Database     │
│                      │  │      + Prisma     │
└──────────────────────┘  └───────────────────┘
```

The frontend must never directly access PostgreSQL or the AI provider.

All important application operations should pass through the backend.

---

# 2. Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- JavaScript
- Web Speech API

## Backend

- Node.js
- Express.js
- JavaScript

## Database

- PostgreSQL
- Prisma ORM

## AI / NLP

- Gemini API or another suitable free-tier AI/NLP service

## API Communication

- REST API
- JSON

## Deployment

Frontend:

- Vercel or equivalent

Backend:

- Render / AWS / equivalent

Database:

- Neon / Supabase / equivalent PostgreSQL provider

---

# 3. Repository Structure

The repository will follow this structure:

```text
VoiceCart-AI-Shopping-assistant/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── server.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── .env.example
├── .gitignore
├── CONTRACT.md
├── ARCHITECTURE.md
└── README.md
```

---

# 4. Frontend Architecture

The frontend is responsible for:

- Rendering the interface
- Capturing voice input
- Displaying recognized speech
- Showing loading states
- Showing command results
- Managing temporary UI state
- Sending requests to the backend
- Displaying shopping lists
- Displaying suggestions
- Displaying search results

The frontend must not contain business-critical database logic.

---

## 4.1 Frontend Components

Suggested component structure:

```text
components/
│
├── VoiceButton/
├── VoiceStatus/
├── ShoppingList/
├── ShoppingItem/
├── CategorySection/
├── SuggestionCard/
├── SearchBar/
├── SearchResults/
├── LoadingState/
└── ErrorMessage/
```

Components should remain reusable and focused on one responsibility.

---

# 5. Voice Input Architecture

Voice interaction begins in the browser.

```text
User speaks
     │
     ▼
Web Speech API
     │
     ▼
Speech-to-Text
     │
     ▼
Frontend receives transcript
     │
     ▼
Display transcript to user
     │
     ▼
Send transcript to backend
```

Example:

```text
User:
"Add two bottles of water"

          ↓

Speech Recognition

          ↓

"Add two bottles of water"

          ↓

POST /api/v1/commands
```

The browser's speech recognition layer is responsible only for converting speech into text.

It should not decide what the command means.

---

# 6. AI / NLP Architecture

The backend receives the transcript and sends the relevant text to the AI/NLP service.

```text
Transcript
    │
    ▼
Backend
    │
    ▼
AI/NLP Service
    │
    ▼
Structured Command
```

Example input:

```text
"I want to buy 5 apples"
```

Expected AI output:

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "apples",
      "quantity": 5,
      "unit": "pieces"
    }
  ]
}
```

The backend must validate the AI response before executing any operation.

---

# 7. Command Processing Pipeline

All voice commands should follow a predictable pipeline.

```text
Voice
  │
  ▼
Speech-to-Text
  │
  ▼
Transcript
  │
  ▼
POST /commands
  │
  ▼
Command Validation
  │
  ▼
AI/NLP Interpretation
  │
  ▼
Structured Command
  │
  ▼
Backend Validation
  │
  ▼
Business Logic
  │
  ▼
Database Operation
  │
  ▼
Response
  │
  ▼
Frontend Feedback
```

Example:

```text
"Remove milk from my list"
```

becomes:

```json
{
  "action": "REMOVE_ITEM",
  "items": [
    {
      "name": "milk"
    }
  ]
}
```

The backend then finds the relevant item and performs the operation.

---

# 8. Supported Command Types

The command system should initially support:

```text
ADD_ITEM
REMOVE_ITEM
UPDATE_ITEM
SEARCH_PRODUCT
GET_SUGGESTIONS
```

Additional commands can be added later if required.

---

# 9. Command Schema

All interpreted commands should follow a predictable structure.

General format:

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "milk",
      "quantity": 2,
      "unit": "litres",
      "brand": null
    }
  ]
}
```

For search:

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "toothpaste",
  "brand": null,
  "minPrice": null,
  "maxPrice": 300
}
```

The exact schema may evolve as development progresses, but all commands must remain structured and validated.

---

# 10. Backend Architecture

The backend follows a layered architecture:

```text
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├── AI Service
  ├── Shopping Service
  ├── Search Service
  └── Suggestion Service
  │
  ▼
Prisma
  │
  ▼
PostgreSQL
```

---

## 10.1 Routes

Routes define API endpoints and HTTP methods.

Example:

```text
/api/v1/health
/api/v1/commands
/api/v1/shopping-list
/api/v1/items
/api/v1/search
/api/v1/suggestions
```

Routes should not contain business logic.

---

## 10.2 Controllers

Controllers should:

- Receive HTTP requests
- Validate request data
- Call appropriate services
- Return HTTP responses

Controllers should remain thin.

---

## 10.3 Services

Services contain the application's business logic.

Suggested services:

```text
services/
│
├── ai.service.js
├── command.service.js
├── shopping.service.js
├── search.service.js
└── suggestion.service.js
```

---

# 11. AI Service

The AI service will be responsible for communication with the selected AI provider.

Responsibilities:

- Send transcript to AI
- Request structured output
- Parse AI response
- Handle AI errors
- Return normalized command data

The AI API key must exist only on the backend.

It must never be exposed to the frontend.

---

# 12. PostgreSQL Architecture

PostgreSQL will be the persistent source of truth.

Prisma will act as the database access layer.

```text
Backend
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

The frontend must never directly connect to PostgreSQL.

---

# 13. Initial Database Model

The initial database design should support the following entities:

```text
User
 │
 ├── ShoppingList
 │       │
 │       └── ShoppingItem
 │
 ├── ShoppingHistory
 │
 └── UserPreference
```

Conceptual relationship:

```text
User
 │
 ├───────────────┐
 ▼               ▼
ShoppingList   ShoppingHistory
 │
 ▼
ShoppingItem

User
 │
 ▼
UserPreference
```

---

# 14. Shopping Item Data

A shopping item should be capable of storing:

```text
id
name
quantity
unit
category
status
createdAt
updatedAt
shoppingListId
```

Optional product-related information may include:

```text
brand
productId
price
```

Only fields required by the application should be persisted.

---

# 15. Shopping History

Shopping history is important for smart suggestions.

The system should be able to determine patterns such as:

```text
Milk → purchased frequently
Bread → purchased regularly
Eggs → purchased occasionally
```

This information can later be used by the suggestion engine.

---

# 16. Smart Suggestion Architecture

Suggestions should be generated using available user and product information.

```text
Shopping History
       │
User Preferences
       │
Seasonal Data
       │
Product Data
       │
       ▼
Suggestion Service
       │
       ▼
Relevant Suggestions
       │
       ▼
Frontend
```

Example:

```text
History:
Milk purchased every 7 days

Current time:
Day 8

Suggestion:
"You may need milk."
```

Suggestions should be relevant and explainable where practical.

---

# 17. Product Search Architecture

Voice search follows:

```text
User Voice
    │
    ▼
Speech-to-Text
    │
    ▼
NLP
    │
    ▼
Search Parameters
    │
    ▼
Search Service
    │
    ▼
Product Data Source
    │
    ▼
Filtered Results
    │
    ▼
Frontend
```

Example:

```text
"Find toothpaste under 300 rupees"
```

becomes:

```json
{
  "query": "toothpaste",
  "maxPrice": 300,
  "currency": "INR"
}
```

---

# 18. Product Data

Because the project allows public test data, product search may initially use:

- Public datasets
- Public APIs
- Mock product data

The data source should be selected based on availability, reliability, licensing, and free-tier limitations.

The architecture should keep the product data source separate from the rest of the application so it can be replaced later.

---

# 19. API Architecture

The application will use REST APIs.

All application APIs should be versioned:

```text
/api/v1/
```

Initial endpoints:

### Health

```http
GET /api/v1/health
```

### Shopping List

```http
GET /api/v1/shopping-list
```

```http
POST /api/v1/shopping-list/items
```

```http
PATCH /api/v1/shopping-list/items/:id
```

```http
DELETE /api/v1/shopping-list/items/:id
```

### Voice Command

```http
POST /api/v1/commands
```

### Product Search

```http
GET /api/v1/search
```

### Suggestions

```http
GET /api/v1/suggestions
```

Exact request and response contracts will be defined before implementing each endpoint.

---

# 20. Error Handling

Errors should be handled at every important layer.

Potential failures include:

- Microphone permission denied
- Speech recognition unavailable
- Speech not recognized
- AI API failure
- Invalid AI response
- Database failure
- Product search failure
- Invalid user input
- Network failure

The backend should return consistent error responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "COMMAND_NOT_UNDERSTOOD",
    "message": "We could not understand your command."
  }
}
```

The frontend should display user-friendly messages rather than technical errors.

---

# 21. Loading States

The UI must communicate processing states.

Possible states:

```text
IDLE
LISTENING
PROCESSING
SUCCESS
ERROR
```

Example flow:

```text
IDLE
 ↓
LISTENING
 ↓
PROCESSING
 ↓
SUCCESS
```

or:

```text
LISTENING
 ↓
PROCESSING
 ↓
ERROR
```

---

# 22. Security Principles

The application must follow basic security practices.

### API Keys

AI/API keys must remain on the backend.

Never expose secret keys in frontend code.

### Environment Variables

Sensitive configuration should be stored using environment variables.

Example:

```text
DATABASE_URL=
GEMINI_API_KEY=
PORT=
```

An `.env.example` file should document required variables without containing real secrets.

---

# 23. Frontend State Management

Initially, simple React state and Context should be preferred.

Do not introduce a large state-management library unless project complexity requires it.

Important UI state includes:

```text
shoppingList
voiceStatus
transcript
loading
error
suggestions
searchResults
```

---

# 24. Development Strategy

Development should proceed from simple functionality to advanced functionality.

```text
Foundation
    ↓
Database
    ↓
Shopping List CRUD
    ↓
Voice Recognition
    ↓
Command Processing
    ↓
NLP / AI
    ↓
Categorization
    ↓
Smart Suggestions
    ↓
Product Search
    ↓
Multilingual Support
    ↓
Testing
    ↓
Deployment
```

Each stage should work before moving to the next major stage.

---

# 25. Architecture Rules

The following rules are mandatory unless there is a documented reason to change them.

### Rule 1
Frontend must not directly access PostgreSQL.

### Rule 2
AI API keys must never be exposed to the frontend.

### Rule 3
Routes should not contain business logic.

### Rule 4
Controllers should remain thin.

### Rule 5
Business logic belongs inside services.

### Rule 6
AI output must be validated before database operations.

### Rule 7
Database access should happen through Prisma.

### Rule 8
The backend remains the authority for important application operations.

### Rule 9
Every new major feature must respect `CONTRACT.md`.

### Rule 10
Do not introduce unnecessary technologies or libraries without a clear reason.

---

# 26. Architecture Change Policy

The architecture may evolve during development if a change is genuinely required.

Before making a major architectural change, evaluate:

1. Does it solve an actual project requirement?
2. Does it simplify the system?
3. Does it improve reliability?
4. Does it fit the free-tier constraint?
5. Does it introduce unnecessary complexity?
6. Does it conflict with `CONTRACT.md`?

If a major decision changes, this document must be updated.

---

# 27. Final Architecture Goal

The final VoiceCart architecture should provide:

**Simple User Experience**

↓

**Reliable Voice Recognition**

↓

**Natural Language Understanding**

↓

**Validated Structured Commands**

↓

**Backend Business Logic**

↓

**PostgreSQL Persistence**

↓

**Smart Suggestions / Search**

↓

**Clear Visual Feedback**

The architecture must remain **modular, maintainable, scalable enough for the project scope, and simple enough to develop and deploy reliably.**