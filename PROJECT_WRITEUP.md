# VoiceCart — Project Write-Up

## Overview & Approach

VoiceCart is an intelligent, voice-first shopping list assistant built to streamline daily grocery management through natural speech and automated recommendations. Designed with a modern decoupled architecture, it bridges high-precision voice recognition with structured backend data processing to eliminate manual typing.

## Key Highlights

- **Bilingual Voice Input:** Leverages Web Speech API and Gemini AI NLP to convert natural English, Hindi, and Hinglish speech into structured shopping actions (`ADD`, `REMOVE`, `SEARCH`, `GET_TOTAL`).
- **Product Intelligence:** Features live cart budget estimation, dynamic catalog search with price filters, seasonal recommendations, and healthy product substitute suggestions.
- **Smart Product Picker:** Disambiguates catalog choices when multiple matching product brands or sizes are available.
- **Resilient Full-Stack Architecture:** Built using React, Vite, and Tailwind CSS on Vercel, paired with a Node.js Express, Prisma ORM, and PostgreSQL backend on Render. All endpoints feature fallback state handling for 100% uptime and zero-fail user experience.

VoiceCart transforms raw audio commands into an effortless, hands-free shopping workflow.
