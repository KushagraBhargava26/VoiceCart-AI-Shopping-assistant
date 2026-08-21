# VoiceCart — API Contract

## 1. Purpose

This document defines the communication contract between the VoiceCart frontend, backend, AI/NLP layer, and external product data sources.

The purpose of this contract is to ensure that:

- Frontend and backend use consistent request/response formats.
- AI-generated commands follow a predictable structure.
- API behavior remains consistent during development.
- Errors are handled consistently.
- Future developers or AI assistants can understand the API without inspecting the entire codebase.

All APIs should follow the versioned base path:

```text
/api/v1
```

---

# 2. API Design Principles

VoiceCart APIs must follow these principles:

1. Use REST-style endpoints where practical.
2. Use JSON for request and response bodies.
3. Use HTTP status codes appropriately.
4. Keep API responses predictable.
5. Validate all incoming data on the backend.
6. Never trust AI-generated data without validation.
7. Never expose AI API keys to the frontend.
8. Keep business logic inside backend services rather than routes.
9. Return user-friendly error messages.
10. Maintain backward compatibility when possible.

---

# 3. Standard Response Format

Successful responses should follow a consistent structure.

```json
{
  "success": true,
  "data": {}
}
```

Example:

```json
{
  "success": true,
  "data": {
    "id": "item_123",
    "name": "Milk",
    "quantity": 2,
    "unit": "litres"
  }
}
```

For collection responses:

```json
{
  "success": true,
  "data": [],
  "meta": {}
}
```

---

# 4. Standard Error Format

Errors should follow:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

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

The `code` is intended for application logic.

The `message` is intended for user-facing or developer-friendly feedback.

---

# 5. HTTP Status Codes

The backend should use:

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource successfully created |
| `400` | Invalid request |
| `401` | Authentication required/failed |
| `403` | Access denied |
| `404` | Resource not found |
| `409` | Conflict |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
| `503` | External service unavailable |

Authentication may be introduced depending on the final implementation.

---

# 6. Health Check

## Endpoint

```http
GET /api/v1/health
```

## Purpose

Used to verify that the backend is running.

## Response

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

# 7. Shopping List APIs

## 7.1 Get Shopping List

```http
GET /api/v1/shopping-list
```

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_123",
        "name": "Milk",
        "quantity": 2,
        "unit": "litres",
        "category": "Dairy",
        "status": "PENDING"
      },
      {
        "id": "item_456",
        "name": "Apples",
        "quantity": 5,
        "unit": "pieces",
        "category": "Fruits",
        "status": "PENDING"
      }
    ]
  }
}
```

---

# 8. Add Shopping Item

## Endpoint

```http
POST /api/v1/shopping-list/items
```

## Request

```json
{
  "name": "Milk",
  "quantity": 2,
  "unit": "litres"
}
```

Optional fields:

```json
{
  "name": "Milk",
  "quantity": 2,
  "unit": "litres",
  "category": "Dairy",
  "brand": null
}
```

## Response

```json
{
  "success": true,
  "data": {
    "id": "item_123",
    "name": "Milk",
    "quantity": 2,
    "unit": "litres",
    "category": "Dairy",
    "status": "PENDING"
  }
}
```

The backend should automatically determine the category when the category is not supplied.

---

# 9. Update Shopping Item

## Endpoint

```http
PATCH /api/v1/shopping-list/items/:id
```

## Request

Example:

```json
{
  "quantity": 5
}
```

Another example:

```json
{
  "name": "Almond Milk",
  "quantity": 1,
  "unit": "litre"
}
```

## Response

```json
{
  "success": true,
  "data": {
    "id": "item_123",
    "name": "Almond Milk",
    "quantity": 1,
    "unit": "litre",
    "category": "Dairy Alternatives",
    "status": "PENDING"
  }
}
```

---

# 10. Delete Shopping Item

## Endpoint

```http
DELETE /api/v1/shopping-list/items/:id
```

## Response

```json
{
  "success": true,
  "data": {
    "message": "Item removed successfully."
  }
}
```

---

# 11. Shopping Item Status

Items may have a status such as:

```text
PENDING
COMPLETED
```

Example:

```http
PATCH /api/v1/shopping-list/items/:id
```

```json
{
  "status": "COMPLETED"
}
```

This allows the application to track purchased items and later use that information for shopping history and suggestions.

---

# 12. Voice Command API

This is one of the most important APIs in VoiceCart.

## Endpoint

```http
POST /api/v1/commands
```

## Request

```json
{
  "transcript": "Add 2 bottles of water"
}
```

Optional language information may be provided:

```json
{
  "transcript": "Doodh add karo",
  "language": "hi-IN"
}
```

---

# 13. Voice Command Processing Flow

The backend should process commands using:

```text
Transcript
    ↓
Input Validation
    ↓
AI / NLP Service
    ↓
Structured Command
    ↓
Command Validation
    ↓
Business Logic
    ↓
Database Operation
    ↓
Response
```

The frontend should not directly call the AI provider.

---

# 14. Supported Command Actions

The initial command processor should support:

```text
ADD_ITEM
REMOVE_ITEM
UPDATE_ITEM
SEARCH_PRODUCT
GET_SUGGESTIONS
```

Additional actions may be added later if required.

---

# 15. Add Item Command

### User Input

```text
"Add 2 bottles of water"
```

### AI Interpretation

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "water",
      "quantity": 2,
      "unit": "bottles"
    }
  ]
}
```

### API Response

```json
{
  "success": true,
  "data": {
    "action": "ADD_ITEM",
    "items": [
      {
        "id": "item_123",
        "name": "water",
        "quantity": 2,
        "unit": "bottles",
        "category": "Beverages",
        "status": "PENDING"
      }
    ],
    "message": "Added 2 bottles of water."
  }
}
```

---

# 16. Remove Item Command

### User Input

```text
"Remove milk from my list"
```

### AI Interpretation

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

### API Response

```json
{
  "success": true,
  "data": {
    "action": "REMOVE_ITEM",
    "items": [
      {
        "name": "milk"
      }
    ],
    "message": "Milk was removed from your shopping list."
  }
}
```

---

# 17. Update Item Command

### User Input

```text
"Change apples to 5"
```

### AI Interpretation

```json
{
  "action": "UPDATE_ITEM",
  "items": [
    {
      "name": "apples",
      "quantity": 5,
      "unit": "pieces"
    }
  ]
}
```

The backend should locate the existing item and update it.

---

# 18. Multi-Item Commands

The system must support multiple items in a single voice command.

### User Input

```text
"Add 2 litres of milk and 5 apples"
```

### AI Interpretation

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "milk",
      "quantity": 2,
      "unit": "litres"
    },
    {
      "name": "apples",
      "quantity": 5,
      "unit": "pieces"
    }
  ]
}
```

The backend should process each item safely.

---

# 19. Natural Language Variations

The command processor must not depend on exact phrases.

These should all be interpreted as adding milk:

```text
"Add milk"
"I need milk"
"I want to buy milk"
"Put milk on my shopping list"
"Please add some milk"
```

The frontend sends the transcript exactly as recognized.

The AI/NLP layer determines the intent.

---

# 20. Multilingual Commands

The command API should accept an optional language identifier.

Example:

```json
{
  "transcript": "Doodh add karo",
  "language": "hi-IN"
}
```

The AI/NLP layer should interpret the command and return the same normalized command structure used for English.

For example:

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "milk",
      "quantity": 1,
      "unit": "unit"
    }
  ]
}
```

The internal command format should remain language-independent.

---

# 21. Product Search API

## Endpoint

```http
GET /api/v1/search
```

Possible query parameters:

```text
query
brand
minPrice
maxPrice
size
category
```

Example:

```http
GET /api/v1/search?query=toothpaste&maxPrice=300
```

## Response

```json
{
  "success": true,
  "data": {
    "query": "toothpaste",
    "filters": {
      "maxPrice": 300
    },
    "results": []
  }
}
```

The exact product result structure will depend on the selected product data source.

---

# 22. Voice Search

Voice search should use the same command processing pipeline.

### User

> "Find toothpaste under 300 rupees."

### AI Interpretation

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "toothpaste",
  "brand": null,
  "minPrice": null,
  "maxPrice": 300,
  "currency": "INR"
}
```

The backend then sends these parameters to the Search Service.

---

# 23. Suggestions API

## Endpoint

```http
GET /api/v1/suggestions
```

The backend should return relevant suggestions based on available data.

Possible suggestion types:

```text
FREQUENT_ITEM
LOW_STOCK / DUE_ITEM
SEASONAL
SUBSTITUTE
```

## Example Response

```json
{
  "success": true,
  "data": [
    {
      "type": "FREQUENT_ITEM",
      "item": "Milk",
      "message": "You usually buy milk around this time.",
      "confidence": 0.87
    }
  ]
}
```

The exact recommendation algorithm may evolve.

---

# 24. AI Service Contract

The AI provider must receive enough context to understand the command.

Example internal request:

```json
{
  "transcript": "I want to buy 5 oranges",
  "language": "en-US",
  "context": {
    "existingItems": []
  }
}
```

The AI service should return structured JSON.

Example:

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "oranges",
      "quantity": 5,
      "unit": "pieces"
    }
  ]
}
```

The AI service must not return executable code or database queries.

---

# 25. AI Output Validation

AI output must be validated by the backend.

The backend must verify:

- Action is supported
- Item name exists when required
- Quantity is valid when provided
- Quantity is not negative
- Price values are valid
- Filters have valid formats
- Required fields exist

Invalid AI output must never be directly executed.

---

# 26. Ambiguous Commands

If the system cannot confidently understand a command, it should not make a dangerous assumption.

Example:

```text
User:
"Add that thing I bought yesterday"
```

If the required information cannot be determined, the backend should return a clarification response.

Example:

```json
{
  "success": true,
  "data": {
    "action": "CLARIFICATION_REQUIRED",
    "message": "Which item would you like to add?"
  }
}
```

The frontend should display the clarification request to the user.

---

# 27. Voice Recognition Errors

If speech recognition fails before reaching the backend, the frontend should display:

```text
Sorry, I couldn't hear that.
Please try again.
```

No API request is required when there is no usable transcript.

---

# 28. AI / External Service Errors

If the AI service fails:

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "The assistant is temporarily unavailable. Please try again."
  }
}
```

The frontend should display a simple user-friendly message.

Technical provider details should not be exposed to the user.

---

# 29. Database Errors

If a database operation fails:

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "We could not update your shopping list. Please try again."
  }
}
```

Detailed database errors should be logged on the server and not exposed to the client.

---

# 30. Frontend API Service

All API communication from React should be centralized.

Suggested structure:

```text
client/src/services/

api.js
shoppingList.service.js
command.service.js
search.service.js
suggestion.service.js
```

Components should not contain repeated raw `fetch()` calls.

---

# 31. Environment Variables

The following environment variables may be required.

### Backend

```text
DATABASE_URL=
GEMINI_API_KEY=
PORT=
```

### Frontend

```text
VITE_API_BASE_URL=
```

Only variables intended for frontend use may use the `VITE_` prefix.

Secrets must remain on the backend.

---

# 32. API Versioning

All APIs should use:

```text
/api/v1
```

Example:

```text
/api/v1/commands
/api/v1/shopping-list
/api/v1/search
/api/v1/suggestions
```

Breaking changes should result in a new API version rather than silently changing an existing contract.

---

# 33. Authentication

Authentication is not required for the initial MVP unless the implementation requires multiple users or persistent user-specific accounts.

For the MVP, the backend operates against a single seeded default `User` and default `ShoppingList` (fixed UUID). All shopping-list endpoints implicitly operate on this default user/list. This is documented in `CONTRACT.md` (Section 13.1).

If authentication is added later, user identity should be passed securely through the backend (e.g. via JWT), replacing the hardcoded default `userId` reference used internally by controllers/services. This is expected to be a small, localized change — no changes to the database schema, Prisma models, or endpoint structure are anticipated.

The API contract should then be updated to document authentication requirements.

---

# 34. CORS

The backend should allow requests only from configured frontend origins in production.

Development may allow the local frontend origin.

Example:

```text
Development:
http://localhost:5173

Production:
<deployed frontend URL>
```

The exact production origin will be configured during deployment.

---

# 35. Logging

The backend should log important technical events such as:

- Request failures
- AI service failures
- Database failures
- Invalid AI responses
- Unexpected exceptions

Logs must not expose:

- API keys
- Passwords
- Sensitive user information

---

# 36. API Contract Change Rules

Any change to:

- Endpoint names
- HTTP methods
- Request fields
- Response fields
- Command actions
- Error codes

must be reflected in this document.

Frontend and backend should not independently change the API structure.

---

# 37. Source of Truth

The project documentation hierarchy is:

```text
CONTRACT.md
     │
     ▼
ARCHITECTURE.md
     │
     ▼
API_CONTRACT.md
     │
     ▼
Implementation
```

`CONTRACT.md` defines **what VoiceCart must achieve**.

`ARCHITECTURE.md` defines **how the system is organized**.

`API_CONTRACT.md` defines **how the components communicate**.

All implementation must remain consistent with these documents.

---

# 38. Final API Goal

The API layer should allow VoiceCart to reliably transform:

```text
Natural Voice
     ↓
Transcript
     ↓
AI/NLP Interpretation
     ↓
Validated Structured Command
     ↓
Backend Business Logic
     ↓
Database / Search / Suggestions
     ↓
Clear User Response
```

The API must remain **simple, predictable, secure, validated, and easy for both humans and AI developers to understand.**