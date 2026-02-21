# Reusable Skill: WhatsApp Service Bot Builder

To recreate this project in the future, simply **paste the following prompt** to your AI Assistant. It contains all the architectural decisions and boilerplate requirements we discovered.

---

## 🤖 **AI Prompt for New Project**

**Goal**: Build a standalone **Node.js** backend for a WhatsApp AI Agent using the **Official WhatsApp Cloud API** (Graph API).

**Tech Stack**:
- **Runtime**: Node.js (Express)
- **AI**: OpenAI (GPT-4) with Tool Calling
- **Database**: Supabase (`@supabase/supabase-js`) for bookings and blocks
- **WhatsApp**: Official Cloud API (Webhooks for receiving, Graph API for sending)
- **Deployment**: Render/Railway compatible (Health check endpoint `/`)

**Core Architecture**:
1.  **`src/index.js`**: Express server mounting `routes/webhook.js`.
2.  **`src/routes/webhook.js`**:
    - `GET`: Handle Meta verification (Hub Challenge).
    - `POST`: Receive messages, extract `text.body`, call `openaiService`.
3.  **`src/services/whatsapp.js`**:
    - `sendMessage(to, text)`: Use `axios` to POST to `https://graph.facebook.com/v17.0/...`.
    - headers: `Authorization: Bearer process.env.WHATSAPP_ACCESS_TOKEN`.
4.  **`src/services/openai.js`**:
    - Maintain ephemeral session history.
    - System Prompt: "You are [Persona]..."
    - Tools: `check_availability`, `book_appointment`.
5.  **`src/services/supabase.js`**:
    - Manage connections to Supabase.
    - Methods: `isSlotAvailable`, `getSlotsInWindow`, `createBooking`.

**Immediate Checklist for AI**:
1.  Create `package.json` with `express`, `axios`, `dotenv`, `@supabase/supabase-js`, `openai`, `date-fns`, `date-fns-tz`.
2.  Scaffold the file structure.
3.  Do NOT suggest `whatsapp-web.js` (we want the Official API).
4.  Do NOT suggest `puppeteer`.

---

## 🛠️ **Prerequisites for You (The Developer)**

Before running the generated code, you must:
1.  **Meta Developers**: Create App -> Add WhatsApp -> Get `Phone Number ID` & `Access Token`.
2.  **Supabase**: Create a project and run the DDL (stored in `walkthrough.md`) to create `bookings` and `blocked_slots` tables.
3.  **Tunnel**: Install `ngrok` for localhost webhook testing.
