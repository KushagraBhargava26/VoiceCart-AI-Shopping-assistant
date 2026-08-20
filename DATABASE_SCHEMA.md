# VoiceCart — Database Schema

## 1. Purpose

This document defines the PostgreSQL database structure for VoiceCart.

The database must support:

- Shopping list management
- Item quantities and units
- Item categorization
- Shopping history
- User preferences
- Smart suggestions
- Product information
- Future multilingual and recommendation features

PostgreSQL is the primary persistent data store.

Prisma ORM will be used by the backend to communicate with PostgreSQL.

---

# 2. Database Architecture

High-level relationship:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
ShoppingList   UserPreference
 │
 ▼
ShoppingItem
 │
 ▼
ShoppingHistory

Product
 │
 └── ProductCategory
```

A simplified relational view:

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌────────────────┐
│ ShoppingList │  │ UserPreference │
└──────┬───────┘  └────────────────┘
       │
       ▼
┌──────────────┐
│ ShoppingItem │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ ShoppingHistory  │
└──────────────────┘


┌────────────────┐
│    Product     │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│ ProductCategory    │
└────────────────────┘
```

---

# 3. Design Principles

The database must follow these principles:

1. PostgreSQL is the source of truth.
2. Prisma is the database access layer.
3. Frontend never connects directly to PostgreSQL.
4. AI never directly modifies PostgreSQL.
5. Foreign keys must maintain data integrity.
6. Important fields should have appropriate constraints.
7. Timestamps should be stored for important entities.
8. The schema should avoid unnecessary duplication.
9. The schema should support future expansion without premature complexity.
10. Sensitive data should not be stored unless required.

---

# 4. Entity Overview

The initial schema contains:

```text
User
ShoppingList
ShoppingItem
ShoppingHistory
UserPreference
Product
ProductCategory
```

Authentication may initially be optional.

If authentication is not implemented in the MVP, the `User` model can still be retained as the foundation for future multi-user support.

---

# 5. User

## Purpose

Represents a VoiceCart user.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| name | String | No | User's display name |
| email | String | No | User email |
| createdAt | DateTime | Yes | Account creation time |
| updatedAt | DateTime | Yes | Last update time |

Conceptual model:

```text
User
├── id
├── name
├── email
├── createdAt
└── updatedAt
```

### Constraints

- `id` is the primary key.
- `email` should be unique if authentication is implemented.
- Email should not be mandatory for anonymous MVP usage.

---

# 6. ShoppingList

## Purpose

Represents a user's shopping list.

A user may eventually have multiple lists such as:

```text
Groceries
Weekend Shopping
Monthly Shopping
Party
```

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| name | String | Yes | List name |
| userId | UUID | Yes | Owner |
| createdAt | DateTime | Yes | Creation time |
| updatedAt | DateTime | Yes | Last modification |

Conceptual model:

```text
ShoppingList
├── id
├── name
├── userId
├── createdAt
└── updatedAt
```

### Relationship

```text
User 1 ──────── N ShoppingList
```

---

# 7. ShoppingItem

## Purpose

Represents an item inside a shopping list.

This is one of the most important entities in VoiceCart.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| name | String | Yes | Product/item name |
| quantity | Decimal | Yes | Requested quantity |
| unit | String | Yes | Unit such as kg, litre, pieces |
| category | String | No | Item category |
| brand | String | No | Requested brand |
| status | Enum | Yes | Pending/completed |
| shoppingListId | UUID | Yes | Parent list |
| createdAt | DateTime | Yes | Creation time |
| updatedAt | DateTime | Yes | Last update |

Example:

```text
ShoppingItem
├── id
├── name
├── quantity
├── unit
├── category
├── brand
├── status
├── shoppingListId
├── createdAt
└── updatedAt
```

---

# 8. Shopping Item Status

Initial status values:

```text
PENDING
COMPLETED
```

Example:

```text
Milk      → PENDING
Apples    → COMPLETED
Bread     → PENDING
```

Future statuses may be added if required.

---

# 9. ShoppingItem Relationship

```text
ShoppingList 1 ──────── N ShoppingItem
```

Example:

```text
Shopping List: Groceries

    ├── Milk
    ├── Bread
    ├── Apples
    └── Rice
```

Deleting a shopping list should remove its associated items.

This relationship should use appropriate cascade behavior.

---

# 10. ShoppingHistory

## Purpose

Shopping history enables VoiceCart to understand recurring purchasing behavior.

Example:

```text
User frequently purchases:

Milk → every 7 days
Bread → every 5 days
Eggs → every 10 days
```

This information can support smart suggestions.

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| userId | UUID | Yes | User |
| itemName | String | Yes | Purchased item |
| quantity | Decimal | Yes | Purchased quantity |
| unit | String | Yes | Unit |
| category | String | No | Category |
| purchasedAt | DateTime | Yes | Purchase time |

Conceptual model:

```text
ShoppingHistory
├── id
├── userId
├── itemName
├── quantity
├── unit
├── category
└── purchasedAt
```

---

# 11. Shopping History Relationship

```text
User 1 ──────── N ShoppingHistory
```

When a shopping item is marked as completed, the application may create a corresponding history record.

Example:

```text
ShoppingItem
      │
      │ COMPLETED
      ▼
ShoppingHistory
```

This behavior belongs to the backend service layer.

---

# 12. UserPreference

## Purpose

Stores optional user preferences that can improve suggestions.

Possible preferences include:

```text
Preferred brands
Dietary/product preferences
Frequently purchased categories
Preferred units
Preferred language
```

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| userId | UUID | Yes | User |
| preferredLanguage | String | No | Example: en-US |
| preferredCurrency | String | No | Example: INR |
| preferences | JSON | No | Flexible preference data |
| createdAt | DateTime | Yes | Creation time |
| updatedAt | DateTime | Yes | Last update |

---

# 13. Why JSON for Preferences?

Preferences may evolve.

Instead of creating a new database column for every possible preference, PostgreSQL's JSON/JSONB support can store flexible preference information.

Example:

```json
{
  "preferredBrands": [
    "Amul",
    "Colgate"
  ],
  "preferredCategories": [
    "Dairy",
    "Personal Care"
  ]
}
```

This should be used only for genuinely flexible data.

Important relational information should remain in normal columns/tables.

---

# 14. Product

## Purpose

Represents products that can be searched or recommended.

The initial product database may be populated from:

- Public datasets
- Public APIs
- Mock/test data

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| id | UUID | Yes | Primary key |
| name | String | Yes | Product name |
| brand | String | No | Brand |
| categoryId | UUID | No | Category |
| description | String | No | Product description |
| price | Decimal | No | Product price |
| currency | String | No | Currency |
| size | String | No | Package/product size |
| available | Boolean | Yes | Availability |
| createdAt | DateTime | Yes | Creation time |
| updatedAt | DateTime | Yes | Last update |

Conceptual model:

```text
Product
├── id
├── name
├── brand
├── categoryId
├── description
├── price
├── currency
├── size
├── available
├── createdAt
└── updatedAt
```

---

# 15. ProductCategory

## Purpose

Provides consistent product categorization.

Examples:

```text
Dairy
Fruits
Vegetables
Beverages
Snacks
Grains
Personal Care
Household
```

### Fields

| Field | Type | Required |
|---|---|---:|
| id | UUID | Yes |
| name | String | Yes |
| createdAt | DateTime | Yes |

---

# 16. Product Relationship

```text
ProductCategory 1 ──────── N Product
```

Example:

```text
Dairy
 │
 ├── Milk
 ├── Cheese
 ├── Butter
 └── Curd
```

---

# 17. Item Category vs Product Category

These concepts should not be confused.

### Product Category

Used for products stored in the product catalog.

Example:

```text
Product:
Amul Taaza Milk

Category:
Dairy
```

### Shopping Item Category

Represents how an item is organized in the user's shopping list.

Example:

```text
Milk → Dairy
Apples → Fruits
Chips → Snacks
```

For the MVP, the shopping item's category may be stored directly as a string.

This avoids unnecessary complexity.

---

# 18. Database Relationships

Complete relationship map:

```text
                    ┌──────────────────┐
                    │       User       │
                    └────────┬─────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
     │ ShoppingList │ │ UserPreference│ │ ShoppingHistory │
     └──────┬───────┘ └──────────────┘ └─────────────────┘
            │
            ▼
     ┌──────────────┐
     │ ShoppingItem │
     └──────────────┘


     ┌──────────────────┐
     │ ProductCategory  │
     └────────┬─────────┘
              │
              ▼
        ┌────────────┐
        │  Product   │
        └────────────┘
```

---

# 19. Cardinality

| Relationship | Type |
|---|---|
| User → ShoppingList | 1:N |
| ShoppingList → ShoppingItem | 1:N |
| User → ShoppingHistory | 1:N |
| User → UserPreference | 1:1 |
| ProductCategory → Product | 1:N |

---

# 20. IDs

UUIDs should be preferred for primary keys.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

Benefits:

- Harder to guess than sequential IDs
- Suitable for distributed systems
- Works well with PostgreSQL
- Prisma supports UUID generation

---

# 21. Timestamps

Important entities should contain:

```text
createdAt
updatedAt
```

History records additionally require:

```text
purchasedAt
```

Example:

```text
ShoppingItem
├── createdAt
└── updatedAt

ShoppingHistory
└── purchasedAt
```

---

# 22. Quantity Data Type

Quantity should not always be an integer.

Examples:

```text
5 apples
2 bottles
1.5 kg rice
0.5 litre milk
```

Therefore quantity should use a decimal-capable PostgreSQL type.

Conceptually:

```text
Decimal
```

rather than:

```text
Integer
```

---

# 23. Price Data Type

Prices should use a decimal-compatible database type.

Do not use floating-point numbers for financial values when avoidable.

Example:

```text
Decimal(10,2)
```

Possible values:

```text
99.00
149.50
1299.99
```

---

# 24. Indexing Strategy

Indexes should be added to frequently queried fields.

Initial candidates:

```text
ShoppingList.userId
ShoppingItem.shoppingListId
ShoppingHistory.userId
ShoppingHistory.itemName
Product.name
Product.brand
Product.categoryId
```

Additional indexes should only be introduced when justified by actual query patterns.

---

# 25. Uniqueness

Potential uniqueness constraints:

### User

```text
email
```

only if authentication is implemented.

### ProductCategory

```text
name
```

should generally be unique.

Other entities should not receive uniqueness constraints unless the business logic requires them.

---

# 26. Delete Behavior

Relationships should have intentional delete behavior.

### User → ShoppingList

Deleting a user may cascade to their shopping lists.

### ShoppingList → ShoppingItem

Deleting a list should cascade to its items.

### User → ShoppingHistory

History may either:

- Cascade on account deletion
- Or be retained/anonymized depending on future privacy requirements

The MVP should choose a consistent strategy before implementation.

---

# 27. Data Flow Into Database

Example voice command:

```text
"Add 2 litres of milk"
```

Flow:

```text
Voice
 ↓
Transcript
 ↓
AI
 ↓
Structured Command
 ↓
Backend Validation
 ↓
Shopping Service
 ↓
Prisma
 ↓
PostgreSQL
```

Database record:

```text
name      = milk
quantity  = 2
unit      = litres
status    = PENDING
category  = Dairy
```

---

# 28. Completing a Shopping Item

When the user marks an item as purchased:

```text
ShoppingItem
status = COMPLETED
```

The backend may create:

```text
ShoppingHistory
```

Example:

```text
ShoppingItem:
Milk
2 litres
COMPLETED

        ↓

ShoppingHistory:
Milk
2 litres
purchasedAt = current timestamp
```

This historical information can later be used for recommendations.

---

# 29. Smart Suggestion Data Flow

The recommendation system can use:

```text
ShoppingHistory
       +
UserPreference
       +
Current ShoppingList
       +
Product Data
       +
Seasonal Information
       ↓
Suggestion Service
       ↓
Suggestions
```

Example:

```text
History:
Milk purchased frequently

Current date:
Expected purchase interval reached

Suggestion:
"You may need milk."
```

The database stores the underlying information; recommendation logic belongs in the backend/service layer.

---

# 30. Substitution Data

The initial database does not require a dedicated `Substitute` table.

For MVP:

```text
Product
   ↓
Search / Recommendation Service
   ↓
Alternative Products
```

A dedicated substitution relationship can be added later if the product dataset requires it.

This keeps the initial schema simple.

---

# 31. Seasonal Data

Seasonal recommendations do not require a dedicated database table in the first MVP.

Seasonal information may initially come from:

- Static configuration
- Public datasets
- Product metadata
- External APIs

If the feature becomes more complex, a dedicated seasonal-product model can be introduced later.

---

# 32. Multilingual Data

The database should store normalized product/item names rather than storing a separate database record for every spoken language.

Example:

```text
User says:
"दूध add करो"

AI normalizes:
milk

Database:
milk
```

The original transcript may optionally be logged separately if the project later requires analytics or debugging.

Raw voice/audio should not be stored unless explicitly required.

---

# 33. MVP vs Future Schema

## MVP

The initial implementation should focus on:

```text
User
ShoppingList
ShoppingItem
ShoppingHistory
UserPreference
Product
ProductCategory
```

## Future

Possible additions:

```text
VoiceCommandLog
Recommendation
ProductSubstitute
SeasonalProduct
Store
Inventory
PriceHistory
```

These should only be introduced when actual functionality requires them.

---

# 34. Avoiding Overengineering

The database should not contain tables simply because they might be useful someday.

Before adding a new table, ask:

1. Is it required by a current feature?
2. Does it represent persistent data?
3. Is a JSON field sufficient?
4. Can an existing table support the requirement?
5. Will the additional relationship make the system unnecessarily complex?

If not required, postpone it.

---

# 35. Prisma Mapping

The PostgreSQL database will be represented through Prisma.

Expected structure:

```text
prisma/
│
├── schema.prisma
└── migrations/
```

`schema.prisma` will be generated/implemented based on this document.

This document defines the conceptual database contract.

`schema.prisma` defines the actual implementation.

---

# 36. Database Environment

The backend will connect using:

```text
DATABASE_URL
```

Example:

```text
DATABASE_URL="postgresql://..."
```

The real database URL must never be committed to GitHub.

Only the variable name should exist in:

```text
.env.example
```

---

# 37. Database Security

The application must:

- Keep database credentials server-side
- Never expose `DATABASE_URL` to the frontend
- Use environment variables
- Validate input before database operations
- Use Prisma parameterized queries
- Avoid raw SQL unless absolutely necessary
- Avoid storing unnecessary sensitive information

---

# 38. Source of Truth

The database hierarchy is:

```text
CONTRACT.md
      ↓
ARCHITECTURE.md
      ↓
API_CONTRACT.md
      ↓
AI_CONTRACT.md
      ↓
DATABASE_SCHEMA.md
      ↓
prisma/schema.prisma
      ↓
PostgreSQL
```

If the implementation differs from this document, the documentation must be updated or the implementation corrected.

---

# 39. Final Database Goal

The VoiceCart database must provide a reliable foundation for:

```text
Shopping List
      ↓
Shopping History
      ↓
User Preferences
      ↓
Smart Suggestions

Product Catalog
      ↓
Voice Search
      ↓
Product Recommendations
      ↓
Substitutes
```

The database should remain:

**Simple → Consistent → Validated → Queryable → Extensible**

without introducing unnecessary complexity for the MVP.