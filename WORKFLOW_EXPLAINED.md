# How It Works (Official API Flow)

You are absolutely correct. Here is the step-by-step journey of a single message in your current system:

### 1. User Sends Message 📲
- **Action**: You send "Hi" from your personal WhatsApp to your Business Number.
- **System**: Meta (WhatsApp Cloud) receives this message.

### 2. Meta Calls Webhook (The Trigger) ⚡
- **Action**: Meta sends an HTTP POST request to your `Callback URL` (your ngrok address).
- **Code**: `src/routes/webhook.js` receives this data.
- **Log**: You will see `[Webhook] Received message from...` in your terminal.

### 3. AI Processing 🧠
- **Action**: The webhook handler calls `openaiService.handleIncomingMessage()`.
- **Code**: `src/services/openai.js`.
- **Logic**:
    1.  Adds the user's message to conversation history.
    2.  Sends the history to **OpenAI GPT-4**.
    3.  GPT-4 decides what to do (Answer directly OR Call a Tool).

### 4. Tool Execution (Optional) 🛠️
- **Scenario**: If the user asked "Book an appointment for tomorrow at 10am".
- **Action**: GPT-4 tells the code to run `book_appointment`.
- **Code**: `src/services/google.js`.
- **Logic**: The code uses your `service-account.json` to create an event in your Google Calendar.
- **Result**: "Appointment booked successfully." returns to GPT-4.

### 5. AI Response Generation 📝
- **Action**: GPT-4 takes the tool result and generates a friendly confirmation message: "Using your dental clinic persona".
- **Example**: "Great! I've booked your appointment for tomorrow at 10 AM."

### 6. Sending Reply (The Output) 📤
- **Action**: `openaiService` calls `whatsappService.sendMessage()`.
- **Code**: `src/services/whatsapp.js`.
- **Logic**: Uses `axios` to send a POST request to the **WhatsApp Graph API**.
- **System**: Meta receives this request and pushes the notification to the user's phone.

### Summary
User ➡️ Meta ➡️ Webhook ➡️ OpenAI 🔄 (Tools) ➡️ WhatsApp API ➡️ User
