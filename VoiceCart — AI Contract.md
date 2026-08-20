# VoiceCart — AI Contract

## 1. Purpose

This document defines the responsibilities, behavior, input/output format, validation requirements, and boundaries of the AI/NLP layer in VoiceCart.

The AI layer exists to understand natural human language and convert it into **predictable, structured data** that the backend can safely process.

The AI is **not** responsible for directly modifying the database.

The backend remains responsible for:

- Validation
- Business logic
- Database operations
- Product search execution
- Final application decisions

---

# 2. AI's Primary Responsibility

The AI/NLP layer must convert natural language into structured commands.

The core flow is:

```text
User Voice
    ↓
Speech-to-Text
    ↓
Raw Transcript
    ↓
AI / NLP
    ↓
Structured Command
    ↓
Backend Validation
    ↓
Business Logic
    ↓
Database / Search / Suggestions
```

Example:

```text
User:
"I want to buy 2 bottles of water"

             ↓

AI

             ↓

Structured Command
```

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

---

# 3. AI Must NOT Perform These Actions

The AI must never directly:

- Execute SQL
- Access PostgreSQL
- Modify database records
- Delete database records
- Call protected internal APIs directly
- Generate executable code
- Return arbitrary database queries
- Decide authentication or authorization
- Expose API keys or secrets

The AI only produces structured information.

The backend decides whether and how that information is executed.

---

# 4. Supported Actions

The initial AI command system supports:

```text
ADD_ITEM
REMOVE_ITEM
UPDATE_ITEM
SEARCH_PRODUCT
GET_SUGGESTIONS
CLARIFICATION_REQUIRED
UNKNOWN
```

These actions may be extended later if the project requirements change.

---

# 5. General AI Output Format

Every AI response must follow a predictable JSON structure.

General format:

```json
{
  "action": "ACTION_NAME"
}
```

For item operations:

```json
{
  "action": "ADD_ITEM",
  "items": []
}
```

For search:

```json
{
  "action": "SEARCH_PRODUCT",
  "query": ""
}
```

For clarification:

```json
{
  "action": "CLARIFICATION_REQUIRED",
  "message": ""
}
```

The AI must not return explanatory paragraphs outside the required JSON structure when structured output is requested.

---

# 6. ADD_ITEM

## Purpose

Used when the user wants to add one or more products to the shopping list.

### Examples

```text
"Add milk"

"I need apples"

"Put bread on my list"

"I want to buy 2 packets of chips"

"Add 5 oranges"
```

### Output

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

---

# 7. Multiple ADD_ITEM Products

The AI must support multiple products in one command.

### Input

```text
"Add 2 litres of milk and 5 apples"
```

### Output

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

Each item must be represented independently.

---

# 8. Quantity Extraction

The AI should extract quantities when the user provides them.

Examples:

```text
"Add 5 apples"
```

```json
{
  "quantity": 5,
  "unit": "pieces"
}
```

---

### Quantity With Units

Input:

```text
"Add 2 bottles of water"
```

Output:

```json
{
  "quantity": 2,
  "unit": "bottles"
}
```

Input:

```text
"Add 3 kg rice"
```

Output:

```json
{
  "quantity": 3,
  "unit": "kg"
}
```

---

# 9. Missing Quantity

If the user does not specify a quantity, the AI may use:

```text
quantity: 1
```

with an appropriate generic unit.

Example:

```text
"Add milk"
```

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

The backend may normalize units where necessary.

---

# 10. REMOVE_ITEM

## Purpose

Used when the user wants to remove an item from the shopping list.

### Input

```text
"Remove milk from my list"
```

### Output

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

---

# 11. UPDATE_ITEM

## Purpose

Used when the user wants to modify an existing shopping-list item.

### Input

```text
"Change apples to 5"
```

### Output

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

Another example:

```text
"Change milk quantity to 3 litres"
```

```json
{
  "action": "UPDATE_ITEM",
  "items": [
    {
      "name": "milk",
      "quantity": 3,
      "unit": "litres"
    }
  ]
}
```

---

# 12. SEARCH_PRODUCT

## Purpose

Used when the user wants to find a product.

The AI should extract search criteria from natural language.

### Input

```text
"Find organic apples"
```

### Output

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "apples",
  "filters": {
    "organic": true
  }
}
```

---

# 13. Product Search Filters

The AI may extract:

- Product name
- Brand
- Size
- Category
- Minimum price
- Maximum price
- Other supported product attributes

Example:

```text
"Find Colgate toothpaste under 300 rupees"
```

Output:

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "toothpaste",
  "filters": {
    "brand": "Colgate",
    "maxPrice": 300,
    "currency": "INR"
  }
}
```

---

# 14. Price Range Understanding

The AI must understand common price expressions.

Examples:

```text
"under 300"
"below 300"
"less than 300"
"between 100 and 300"
"from 100 to 300"
```

Example:

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "toothpaste",
  "filters": {
    "minPrice": 100,
    "maxPrice": 300,
    "currency": "INR"
  }
}
```

The AI must not invent a price when the user did not provide one.

---

# 15. GET_SUGGESTIONS

This action is used when the user explicitly requests shopping recommendations.

Examples:

```text
"What should I buy?"

"What am I likely to need?"

"Suggest something for my shopping list"
```

Output:

```json
{
  "action": "GET_SUGGESTIONS"
}
```

The backend suggestion service is responsible for generating the actual recommendations.

The AI should not invent the user's shopping history.

---

# 16. CLARIFICATION_REQUIRED

If the user's command is ambiguous and cannot be safely interpreted, the AI should request clarification.

Example:

```text
"Add that thing"
```

If the referenced item is unknown:

```json
{
  "action": "CLARIFICATION_REQUIRED",
  "message": "Which item would you like to add?"
}
```

Another example:

```text
"Change the quantity"
```

```json
{
  "action": "CLARIFICATION_REQUIRED",
  "message": "Which item's quantity would you like to change?"
}
```

The AI should prefer clarification over guessing when an incorrect action could modify the wrong item.

---

# 17. UNKNOWN

If the input is unrelated to shopping-list management or supported VoiceCart functionality:

```json
{
  "action": "UNKNOWN"
}
```

Example:

```text
"What is the weather today?"
```

The AI should not attempt to answer unrelated questions unless that functionality is explicitly added to the project later.

---

# 18. Natural Language Understanding

The AI must understand variations in phrasing.

For example:

```text
"Add milk"
"I need milk"
"I want milk"
"Put milk on my list"
"I want to buy milk"
"Please add milk"
```

All should map to:

```text
ADD_ITEM
```

The system must focus on **intent**, not exact keywords.

---

# 19. Multilingual Processing

VoiceCart must support multiple languages.

Initial target languages:

```text
English
Hindi
```

Examples:

```text
"Add milk"
"Doodh add karo"
"मुझे दूध चाहिए"
"दूध मेरी लिस्ट में डाल दो"
```

These should be normalized into the same internal action where appropriate.

Example:

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

The internal command schema must remain language-independent.

---

# 20. Hinglish Support

Because users may naturally mix Hindi and English, the AI should attempt to understand Hinglish where practical.

Examples:

```text
"2 packet Maggi add karo"

"Milk hata do"

"5 apples leke list mein add kar do"
```

Expected behavior:

```text
Understand intent
+
Extract product
+
Extract quantity
+
Extract unit
```

Hinglish support should not require users to follow a rigid language format.

---

# 21. Product Name Normalization

The AI should extract the actual product name without unnecessary conversational words.

Example:

```text
"I want to buy some fresh apples"
```

Should produce:

```json
{
  "name": "apples"
}
```

The AI should not store:

```text
"I want to buy some fresh apples"
```

as the product name.

---

# 22. Brand Extraction

If a brand is explicitly mentioned, it should be extracted.

Example:

```text
"Add Amul milk"
```

Output:

```json
{
  "name": "milk",
  "brand": "Amul"
}
```

If no brand is mentioned:

```json
{
  "brand": null
}
```

The AI must not invent brands.

---

# 23. Size Extraction

If the user specifies product size, it should be extracted where supported.

Example:

```text
"Find a 1 litre bottle of water"
```

Possible output:

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "water",
  "filters": {
    "size": {
      "value": 1,
      "unit": "litre"
    }
  }
}
```

---

# 24. Category Understanding

The AI may identify an item's category when obvious.

Example:

```text
"Add apples"
```

Possible category:

```text
Fruits
```

However, category assignment should preferably be validated or normalized by backend logic.

The AI must not create arbitrary categories unnecessarily.

---

# 25. Smart Suggestion Context

When generating or supporting suggestions, the AI may receive structured context such as:

```json
{
  "shoppingHistory": [],
  "preferences": [],
  "seasonalProducts": []
}
```

The AI must use only the supplied context.

It must not claim that the user previously purchased something unless that information exists in the provided context.

---

# 26. Substitute Suggestions

When handling substitute-related requests, the AI may identify relevant alternatives.

Example:

```text
"Regular milk is unavailable. What can I use instead?"
```

Possible result:

```json
{
  "action": "GET_SUGGESTIONS",
  "type": "SUBSTITUTE",
  "item": "milk"
}
```

The backend or product service should determine actual available alternatives where possible.

The AI must not claim that a specific product is available unless the product data confirms it.

---

# 27. Seasonal Suggestions

The AI may assist with seasonal recommendations when provided with appropriate seasonal/product context.

The AI must not fabricate:

- Current availability
- Current prices
- Sale status
- Store inventory

If real-time data is required, the backend should obtain that information from an appropriate data source.

---

# 28. AI Prompt Requirements

The system prompt used for command interpretation should clearly define:

1. VoiceCart's purpose
2. Supported actions
3. Required JSON schema
4. Field definitions
5. Language handling
6. Quantity and unit extraction
7. Search filters
8. Clarification behavior
9. Unknown command behavior
10. Prohibition against inventing information

The prompt should instruct the AI to return structured output only.

---

# 29. Structured Output Requirement

The AI provider should be configured to return JSON/structured output whenever the selected provider supports reliable structured generation.

The application should avoid parsing arbitrary natural-language AI responses using fragile string matching.

Preferred:

```json
{
  "action": "ADD_ITEM",
  "items": [...]
}
```

Avoid relying on:

```text
"Sure! I've added the milk to your list."
```

for backend processing.

---

# 30. Backend Validation of AI Output

AI output is considered **untrusted input**.

Before execution, the backend must validate:

### Action

Must be one of:

```text
ADD_ITEM
REMOVE_ITEM
UPDATE_ITEM
SEARCH_PRODUCT
GET_SUGGESTIONS
CLARIFICATION_REQUIRED
UNKNOWN
```

### Item Name

Must be present when required.

### Quantity

Must be:

- Numeric when present
- Greater than zero
- Reasonably bounded

### Price

Must be:

- Numeric when present
- Greater than or equal to zero

### Filters

Must use supported fields.

Invalid output must be rejected or converted into a safe error/clarification response.

---

# 31. AI Hallucination Prevention

The AI must not invent:

- User shopping history
- Product availability
- Product prices
- Discounts
- Store inventory
- Brand information
- User preferences

unless the information is explicitly available in the provided context or product data.

Example:

The AI must not say:

> "Your local store has no milk."

unless the application has actual store/product data supporting that statement.

---

# 32. Context Management

The backend may provide limited context to the AI when required.

Possible context:

```json
{
  "existingShoppingItems": [],
  "userPreferences": [],
  "recentHistory": []
}
```

Only relevant context should be sent.

The system should avoid unnecessarily sending large amounts of user data to the AI provider.

---

# 33. Command Idempotency Considerations

The backend must distinguish between commands that add items and commands that modify existing items.

For example:

```text
"Add milk"
```

should not accidentally delete or replace an existing milk item.

The final behavior for duplicate items should be defined by backend business logic.

Possible MVP behavior:

- Merge quantities for the same item
- Or create separate entries

The selected behavior must remain consistent throughout the application.

---

# 34. AI Failure Handling

If the AI provider fails:

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "The assistant is temporarily unavailable. Please try again."
  }
}
```

The backend should not perform a database action if command interpretation failed.

---

# 35. Invalid AI Response

If the AI returns malformed or invalid structured data:

```text
AI
 ↓
Invalid JSON / Invalid Schema
 ↓
Backend Validation
 ↓
Reject
```

The system should safely handle the failure.

It must never execute an unvalidated AI response.

---

# 36. AI Security Rules

The AI layer must follow these rules:

- Never receive secret API keys as prompt content.
- Never receive unnecessary sensitive user information.
- Never receive database credentials.
- Never execute generated code.
- Never generate SQL for execution.
- Never bypass backend validation.
- Never directly modify persistent data.

---

# 37. AI Responsibilities vs Backend Responsibilities

| Responsibility | AI | Backend |
|---|---:|---:|
| Understand natural language | ✅ | |
| Detect intent | ✅ | Validate |
| Extract item name | ✅ | Validate |
| Extract quantity | ✅ | Validate |
| Extract brand | ✅ | Validate |
| Extract price filters | ✅ | Validate |
| Decide database mutation | ❌ | ✅ |
| Execute database operation | ❌ | ✅ |
| Access PostgreSQL | ❌ | ✅ |
| Search product data | Interpret | Execute |
| Generate suggestions | Assist | Execute/Validate |
| Authentication | ❌ | ✅ |
| Authorization | ❌ | ✅ |
| API key management | ❌ | ✅ |

---

# 38. Example End-to-End Scenarios

## Scenario 1 — Add Item

### User

```text
"Add 2 bottles of water"
```

### AI

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

### Backend

Validates → Stores → Returns result.

---

## Scenario 2 — Remove Item

### User

```text
"Remove milk"
```

### AI

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

### Backend

Finds matching item → Removes/updates it → Returns result.

---

## Scenario 3 — Search

### User

```text
"Find Colgate toothpaste under 300 rupees"
```

### AI

```json
{
  "action": "SEARCH_PRODUCT",
  "query": "toothpaste",
  "filters": {
    "brand": "Colgate",
    "maxPrice": 300,
    "currency": "INR"
  }
}
```

### Backend

Validates → Calls Search Service → Returns products.

---

## Scenario 4 — Ambiguous Request

### User

```text
"Add that one"
```

### AI

```json
{
  "action": "CLARIFICATION_REQUIRED",
  "message": "Which item would you like to add?"
}
```

No database mutation should occur.

---

## Scenario 5 — Unsupported Request

### User

```text
"Tell me a joke"
```

### AI

```json
{
  "action": "UNKNOWN"
}
```

The application should respond appropriately without pretending to support unrelated functionality.

---

# 39. Definition of AI Success

The AI layer is successful when it can reliably transform natural user language into validated structured commands.

For example:

```text
"I need 2 packets of chips and 1 litre of milk"
```

must become:

```json
{
  "action": "ADD_ITEM",
  "items": [
    {
      "name": "chips",
      "quantity": 2,
      "unit": "packets"
    },
    {
      "name": "milk",
      "quantity": 1,
      "unit": "litre"
    }
  ]
}
```

The system should achieve this across supported languages and natural phrasing while avoiding unsupported assumptions.

---

# 40. Final AI Principle

The central principle of VoiceCart's AI architecture is:

> **AI understands. Backend validates. Backend executes. Database stores.**

AI should make VoiceCart feel natural and intelligent, but it must never become an uncontrolled source of application logic or data mutation.

All future AI implementation must remain consistent with:

- `CONTRACT.md`
- `ARCHITECTURE.md`
- `API_CONTRACT.md`
- This `AI_CONTRACT.md`