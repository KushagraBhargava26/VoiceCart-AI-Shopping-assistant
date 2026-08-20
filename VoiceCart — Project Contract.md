# VoiceCart — Project Contract

## 1. Project Overview

### Project Name
**VoiceCart — Voice Command Shopping Assistant**

### Project Goal

VoiceCart is a voice-based shopping list manager that allows users to manage their shopping activities using natural voice commands.

The application should combine:

- Voice Command Recognition
- Natural Language Processing
- Multilingual Support
- Shopping List Management
- Smart Suggestions
- Voice-Activated Product Search

The primary goal is to create a simple and intelligent shopping assistant where users can interact naturally instead of manually typing every action.

---

# 2. Core Objective

The main objective of VoiceCart is:

> **Allow users to create, manage, search, and improve their shopping list using natural voice commands while providing intelligent recommendations based on shopping history, preferences, seasonal relevance, and product availability.**

The application should understand different ways of expressing the same intent.

For example:

- "Add milk"
- "I need milk"
- "Put milk on my shopping list"
- "I want to buy some milk"

These commands should result in the same action: adding milk to the user's shopping list.

---

# 3. Required Features

## 3.1 Voice Input

### Voice Command Recognition

Users must be able to perform shopping-related actions using voice commands.

Examples:

- "Add milk"
- "I need apples"
- "Remove bread"
- "Add two bottles of water"
- "Buy five oranges"

The system should convert the user's speech into text and process the command.

---

### Natural Language Processing

The application must understand different natural language variations.

Example:

```text
"I want to buy bananas"
"Add bananas to my list"
"I need some bananas"
"Put bananas on my shopping list"
```

The system should understand that all these commands represent an intention to add bananas.

The NLP/AI layer should identify relevant information such as:

- User intent or action
- Product or item name
- Quantity
- Unit
- Brand, when provided
- Price range, when provided

Example:

```text
User: "Add 2 bottles of water"
```

Expected structured understanding:

```json
{
  "action": "ADD",
  "item": "water",
  "quantity": 2,
  "unit": "bottles"
}
```

---

### Multilingual Support

VoiceCart should support voice commands in multiple languages.

The initial implementation should focus on supporting:

- English
- Hindi

Examples:

- "Add milk"
- "Doodh add karo"
- "मुझे दो किलो चावल चाहिए"

The architecture should allow additional languages to be supported in the future.

---

# 4. Smart Suggestions

VoiceCart should provide intelligent recommendations to improve the user's shopping experience.

## 4.1 Product Recommendations

Suggestions should be based on:

- Previous shopping history
- Frequently purchased items
- User preferences

Example:

> "It looks like you may need bread."

The system should use available user data to make relevant suggestions rather than displaying completely random products.

---

## 4.2 Seasonal Recommendations

The application should suggest products that are:

- Relevant to the current season
- In season
- Available on sale, when suitable data is available

Examples may include seasonal fruits, vegetables, or commonly required products.

This feature may depend on available public or external product data.

---

## 4.3 Product Substitutes

VoiceCart should provide alternatives when:

- A requested product is unavailable
- A similar product may be suitable
- The user prefers a different option

Example:

```text
Requested Product: Regular Milk

Suggested Alternatives:
- Almond Milk
- Soy Milk
- Oat Milk
```

Substitute suggestions should be relevant to the requested product.

---

# 5. Shopping List Management

Users should be able to manage their shopping list through voice commands and the application interface.

## Supported Operations

### Add Items

Example:

> "Add milk"

The item should be added to the shopping list.

---

### Remove Items

Example:

> "Remove milk from my list"

The specified item should be removed from the shopping list.

---

### Modify Items

Users should be able to update existing items.

Example:

> "Change the quantity of apples to 5"

The application should update the existing item.

---

### Quantity Management

Users should be able to specify quantities using natural voice commands.

Examples:

- "Add 2 bottles of water"
- "Buy 5 oranges"
- "Add 1 kilogram of rice"

The application should extract and store:

- Item name
- Quantity
- Unit

---

### Automatic Categorization

Items should automatically be categorized for better organization.

Examples:

```text
Milk       → Dairy
Apple      → Produce / Fruits
Tomato     → Produce / Vegetables
Chips      → Snacks
Rice       → Grains
```

The user should not be required to manually categorize every item.

---

# 6. Voice-Activated Product Search

VoiceCart should allow users to search for products using voice.

## Item Search

Examples:

- "Find organic apples"
- "Find Colgate toothpaste"
- "Find a one litre water bottle"

The system should extract relevant search information where available.

Possible search attributes include:

- Product name
- Brand
- Size
- Product type
- Other relevant details

---

## Price Range Filtering

Users should be able to specify price ranges using voice.

Examples:

- "Find toothpaste under 5 dollars"
- "Show me shampoo under 500 rupees"
- "Find Colgate toothpaste between 100 and 300 rupees"

The application should identify and apply the requested filters when product data is available.

---

# 7. User Interface and User Experience

VoiceCart must provide a clean and easy-to-use interface.

## UI Principles

The interface should be:

- Minimalist
- Easy to understand
- Mobile-friendly
- Responsive
- Optimized for voice interaction

The shopping list should be clearly visible and easy to manage.

---

## Visual Feedback

The application must provide real-time feedback to the user.

The user should be able to see:

- When the application is listening
- The recognized speech or command
- The action being processed
- The result of the action
- Errors when the command cannot be understood

Example:

```text
Listening...
```

```text
You said: "Add 2 bottles of water"
```

```text
Processing command...
```

```text
✓ Added 2 bottles of water
```

If an error occurs:

```text
Sorry, I couldn't understand that command.
Please try again.
```

---

## Mobile and Voice-First Experience

The application should be optimized for mobile devices and voice-based interactions.

Typing may still be supported where useful, but the primary interaction model should focus on voice commands.

The user should be able to perform important shopping actions without depending entirely on manual typing.

---

# 8. Technical Approach

The project has technical freedom, meaning suitable technologies can be selected based on development requirements.

The currently approved technology stack is:

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL

## ORM

- Prisma

## Voice Recognition

- Web Speech API or another suitable speech recognition service

## AI / NLP

- A suitable AI/ML or NLP service with a free tier

The AI/NLP layer will be responsible for understanding natural language commands and converting them into structured actions.

---

# 9. High-Level System Flow

The expected application flow is:

```text
User
  │
  ▼
Voice Input
  │
  ▼
Speech Recognition
  │
  ▼
Speech → Text
  │
  ▼
NLP / AI Processing
  │
  ▼
Understand User Intent
  │
  ├── Add Item
  ├── Remove Item
  ├── Modify Item
  ├── Search Product
  └── Request Suggestions
  │
  ▼
Backend Processing
  │
  ▼
PostgreSQL Database
  │
  ▼
Updated List / Search Results / Suggestions
  │
  ▼
Visual Feedback to User
```

---

# 10. Database Responsibilities

PostgreSQL will act as the persistent data source for the application.

The database may store information such as:

- Users
- Shopping lists
- Shopping items
- Item quantities
- Categories
- Shopping history
- User preferences
- Suggestion-related data

The exact database schema will be designed separately based on the requirements defined in this contract.

---

# 11. Development Priorities

Development should follow this order.

## Phase 1 — Project Foundation

- Set up frontend
- Set up backend
- Configure PostgreSQL
- Configure Prisma
- Create basic application structure

---

## Phase 2 — Shopping List Management

Implement:

- Add items
- Remove items
- Modify items
- Quantity management
- Persistent storage

---

## Phase 3 — Voice Recognition

Implement:

- Voice input
- Speech-to-text
- Voice command processing
- Real-time visual feedback
- Basic error handling

---

## Phase 4 — NLP and Natural Language Understanding

Implement:

- Intent detection
- Item extraction
- Quantity extraction
- Unit extraction
- Flexible natural language command understanding
- Multilingual support

---

## Phase 5 — Automatic Categorization

Implement automatic product categorization.

Examples:

```text
Milk → Dairy
Apple → Fruits
Chips → Snacks
```

---

## Phase 6 — Smart Suggestions

Implement:

- Shopping history-based recommendations
- Preference-based recommendations
- Seasonal recommendations
- Product substitutes

---

## Phase 7 — Voice-Activated Search

Implement:

- Product search
- Brand filtering
- Size filtering
- Price range filtering

---

## Phase 8 — Final Quality and Deployment

Complete:

- Error handling
- Loading states
- Responsive UI
- Mobile optimization
- Documentation
- Testing
- Deployment

---

# 12. MVP Definition

The Minimum Viable Product should demonstrate the most important functionality of the project.

The MVP must include:

1. Voice input
2. Speech-to-text
3. Natural language command understanding
4. Add items using voice
5. Remove items using voice
6. Quantity recognition
7. Automatic item categorization
8. PostgreSQL data persistence
9. Basic smart recommendations
10. Clean responsive user interface
11. Loading states
12. Basic error handling

Advanced features should be developed after the core MVP is working reliably.

---

# 13. Development Principles

All development decisions should follow these principles.

## Voice-First

The primary purpose of VoiceCart is voice-based interaction.

Important shopping actions should support voice commands whenever practical.

---

## Natural Interaction

Users should not need to memorize fixed commands.

The system should understand natural variations in language.

---

## Reliable Data Processing

AI-generated or NLP-generated information should be converted into structured data before important actions are performed.

The backend should validate the extracted information before storing or processing it.

---

## Clean Architecture

Responsibilities should remain separated.

### Frontend

Responsible for:

- User interface
- Voice interaction
- Visual feedback
- Displaying shopping data

### Backend

Responsible for:

- Business logic
- Command processing
- API handling
- Data validation
- Suggestions

### AI / NLP Layer

Responsible for:

- Understanding natural language
- Extracting intent
- Extracting shopping information

### Database

Responsible for:

- Persistent application data
- Shopping lists
- Shopping history
- Preferences

---

## Production Quality

The project should maintain:

- Clean code
- Modular structure
- Readable naming
- Basic error handling
- Loading states
- Maintainable architecture
- Clear documentation

---

# 14. Scope Boundaries

The primary purpose of VoiceCart is to manage shopping lists and provide intelligent shopping assistance.

The initial project does not need to become a complete e-commerce platform.

The project does not require:

- Payment processing
- Order placement
- Delivery management
- Seller management
- Full inventory systems
- Complete checkout functionality

The focus must remain on:

> **Voice-based shopping list management, natural language understanding, smart suggestions, and voice-activated product search.**

---

# 15. Data Sources

Publicly available data sources may be used for:

- Product information
- Categories
- Seasonal products
- Product prices
- Substitute recommendations

External APIs or datasets may be used when appropriate.

The project should prefer free-tier or publicly available services where possible.

---

# 16. Hosting and Deployment

The final application must be deployed on a reliable platform.

Possible services include:

- AWS
- Firebase
- Google Cloud
- Vercel
- Render
- Other suitable hosting platforms

The final deployment must provide a working application URL.

The database and backend must also be configured appropriately for production use.

---

# 17. Required Deliverables

The final project must provide:

## 1. Working Application URL

A publicly accessible deployed version of VoiceCart.

## 2. GitHub Repository

The repository must include:

- Complete source code
- Proper project structure
- README.md
- Setup instructions
- Technology information
- Feature overview

## 3. Brief Project Write-Up

A short explanation of the approach used to build the project.

The write-up must not exceed:

> **200 words**

---

# 18. Definition of Success

VoiceCart will be considered successful if a user can naturally interact with the application using voice.

For example:

> "Add two bottles of water and five apples."

The application should understand the command, extract the products and quantities, and update the shopping list.

The user should also be able to say:

> "Remove one bottle of water."

The application should understand and modify the shopping list accordingly.

The application should organize items into categories and provide useful recommendations based on available shopping history, preferences, seasonal information, or product alternatives.

---

# 19. Final Vision

VoiceCart aims to create a simple, intelligent, and voice-first shopping assistant.

The final application should demonstrate the integration of:

**Voice Recognition + Natural Language Processing + Artificial Intelligence + Smart Recommendations + Product Search + Full-Stack Development**

Every future feature, architectural decision, and development task should support this central goal:

> **Make shopping list management natural and effortless by allowing users to interact with the application through voice while receiving intelligent and relevant assistance.**