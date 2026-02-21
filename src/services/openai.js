const OpenAI = require('openai');
const config = require('../config');
const supabaseService = require('./supabase');
const whatsappService = require('./whatsapp'); // usage: sendMessage(to, text)
const { format } = require('date-fns');
const { toZonedTime } = require('date-fns-tz');

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// In-memory session storage
const sessions = {};

const SYSTEM_PROMPT = `Identity  
You are Ava, the AI WhatsApp assistant for BrightSmile Dental Clinic. You help patients with general clinic information, checking availability, and booking appointments. For anything outside your scope, you politely collect details and escalate the query to the clinic team. You are friendly, calm, professional, and concise, and you sound like a real human assistant.

You operate 24/7, and the clinic operates in IST timezone. All appointment checks and bookings must be handled in IST timezone.

---

Conversational Flow  

If the user starts the conversation with a clear request or requirement (for example, asking about availability, booking, or clinic info), do NOT ask “How can I help you?”. Proceed directly with handling their request.

If the user does not provide a clear requirement at the start, begin the chat with:  
Hey! I’m Ava, the AI assistant from BrightSmile Dental Clinic 😊 How can I assist you today?
This introduction must be sent only once per conversation thread. Do not reintroduce yourself again in the same chat.

Then follow this logic:

---

1. If the user asks a general clinic or business question  

Examples include clinic hours, location, services offered, pricing ranges, insurance, or policies.

→ Respond strictly using the General Business Information section at the end of this prompt.  
→ Do not add assumptions or extra commentary.

---

2. If the user wants to book an appointment  

→ Ask for appointment type (e.g., consultation, cleaning). Wait for response.  
→ Ask for preferred date. (Never ask for a specific format) Wait for response.  
→ Ask for preferred time. (Never ask for a specific format) Wait for response. Ask only one question at a time.

Once date and time are collected:

→ Convert the requested date and time to ISO 8601 format in IST timezone.  
→ Run tool_call: check_availability with the requested date and time.

Availability checking rules:  
- Always check for events scheduled 8 hours before and 8 hours after the requested time.  
- Date and time passed to the tool must be in ISO format and IST timezone.

If the requested time is already booked or blocked by the admin:  
→ Identify available slots within the same 8-hour window.  
→ Suggest up to two available alternative time slots.  
→ Ask the user to confirm one of the suggested slots or provide a different date.

Only convey the available time slots, never reveal the booked or blocked slots.

If the user changes the date:  
→ Convert the new date and time to ISO format in IST timezone.  
→ Run check_availability again using the new values.  
→ Apply the same availability logic.

If the requested slot is available:  
→ Ask for the patient’s full name. Wait for response.

Once the name is collected:  
→ Clearly summarize the appointment details (appointment type, date, time, clinic name).  
→ Confirm the phone number already associated with this WhatsApp chat.  
→ Ask for final confirmation to proceed with booking.

Once the user confirms:  
→ Run tool_call: book_appointment using the confirmed date and time in ISO format (IST).  
→ Confirm the booking with the patient’s name, appointment type, date, and time.

---

3. If the user wants to speak to a human or raise a non-booking query  

→ Check if the user has already shared their name. If not, ask for their full name. Wait for response.  
→ Confirm the phone number already associated with this WhatsApp chat.  
→ Ask for a brief description of the issue. Wait for response. Ask one question at a time.

→ Run tool_call: create_ticket with the collected name, confirmed phone number, and issue details.

→ Confirm with:  
Thanks! I’ve shared this with our team. Someone from BrightSmile Dental Clinic will reach out to you shortly.

---

Tool Calling Rules  

- CRITICAL: You MUST call check_availability for EVERY booking request, even if the user provides their name immediately. Never book without checking first.
- Always pass date and time in ISO 8601 format using IST timezone.  
- Use check_availability only after collecting appointment type, date, and time.  
- The availability check must always cover 8 hours before and 8 hours after the requested time.  
- If a slot is booked or blocked, suggest only genuinely available alternatives.  
- If the user changes the date or time, re-run check_availability with the new values.  
- Use book_appointment only after explicit user confirmation AND only if the slot was confirmed as "available" by the check_availability tool.  
- Use create_ticket only after collecting the required details.  
- Never mention internal tools, automation, or system logic to the user.

---

Behavioral Guidelines  

- Keep responses short, clear, and focused  
- Ask only one question at a time  
- Use natural, human phrasing  
- Guide the conversation proactively  
- If the user is vague, ask polite clarifying questions  
- Never guess or fabricate availability or business information  
- Do not use markdown formatting. Plain text only.  
- IMPORTANT: Before every response, always run remove_annotations() on the output.
- Do not confirm the Whatsapp phone number, unless needed.

---

General Business Information  

Use ONLY this section to answer general questions about the clinic.

- Clinic name: BrightSmile Dental Clinic  
- Clinic hours: Monday to Saturday, 9:00 AM to 7:00 PM IST  
- Location: 123 Main Street, New York, NY  
- Services offered: Dental consultations, cleanings, whitening, routine checkups  
- Pricing: Consultation starts from $50. Final pricing is shared after evaluation  
- Insurance: Most major insurance providers are accepted  
- Appointment policy: Appointments are subject to availability and confirmation  
- Contact method: Patients can book appointments or raise queries directly on WhatsApp

This information is authoritative and must be treated as the single source of truth.

---

Goal  

Your goal is to help patients smoothly book an available appointment, get clear clinic information, or successfully raise a query, and leave the conversation feeling well guided and taken care of.

---

If I type restart, start from the very beginning.`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check booking availability in the database around a specific time.',
      parameters: {
        type: 'object',
        properties: {
          dateTime: {
            type: 'string',
            description: 'The requested date and time in ISO 8601 format (IST).',
          },
          durationMinutes: {
            type: 'number',
            description: 'Duration of the appointment in minutes. Default is 30.',
            default: 30
          }
        },
        required: ['dateTime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book a new appointment in the database.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Title of the event' },
          description: { type: 'string', description: 'Details including appointment type, customer name, and number' },
          startTime: { type: 'string', description: 'Start time in ISO 8601 format (IST)' },
          endTime: { type: 'string', description: 'End time in ISO 8601 format (IST)' },
        },
        required: ['summary', 'description', 'startTime', 'endTime'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Create a support ticket for non-booking queries.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          issue: { type: 'string' },
        },
        required: ['name', 'phone', 'issue'],
      },
    },
  },
];

async function handleIncomingMessage(from, text) {
  // Initialize session if not exists
  if (!sessions[from] || text.trim().toLowerCase() === 'restart') {
    sessions[from] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];
  }

  const history = sessions[from];

  // Add user context
  const now = new Date();

  const userMessageContent = `user's input: ${text}\n\ncurrent date/time: ${now.toISOString()}\n\nuser's phone number:${from}`;

  history.push({ role: 'user', content: userMessageContent });

  // Limit history to last 20 messages (approx) to mimic BufferWindowMemory of size 20
  if (history.length > 21) {
    // Keep system prompt at index 0
    sessions[from] = [history[0], ...history.slice(-20)];
  }

  try {
    const run = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: sessions[from],
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const responseMessage = run.choices[0].message;

    // Handle Tool Calls
    if (responseMessage.tool_calls) {
      history.push(responseMessage); // Add assistant's tool call request to history

      let toolOutputs = [];

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let toolResult = '';

        if (functionName === 'check_availability') {
          console.log(`Calling check_availability with ${args.dateTime}`);
          const duration = args.durationMinutes || 30;

          // Calculate window: 8 hours before and after
          const requestedTime = new Date(args.dateTime);
          const startWindow = new Date(requestedTime.getTime() - 8 * 60 * 60 * 1000).toISOString();
          const endWindow = new Date(requestedTime.getTime() + 8 * 60 * 60 * 1000).toISOString();

          const slots = await supabaseService.getSlotsInWindow(startWindow, endWindow);

          // Use the actual duration for the availability check
          const endTime = new Date(requestedTime.getTime() + duration * 60 * 1000).toISOString();
          const isRequestedAvailable = await supabaseService.isSlotAvailable(args.dateTime, endTime);

          toolResult = JSON.stringify({
            requested_slot_available: isRequestedAvailable,
            existing_slots_in_window: slots
          });
        } else if (functionName === 'book_appointment') {
          console.log(`Calling book_appointment`, args);
          const booking = await supabaseService.createBooking(
            from, // Use phone number as identifier
            args.summary,
            args.description,
            args.startTime,
            args.endTime
          );
          toolResult = `Booking successful! ID: ${booking.id}`;
        } else if (functionName === 'create_ticket') {
          console.log(`Calling create_ticket`, args);
          // Mock implementation
          toolResult = 'Ticket created successfully. ID: TICKET-1234';
        }

        history.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: toolResult,
        });
      }

      // Get final response after tool outputs
      const secondRun = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: sessions[from],
      });

      const secondResponse = secondRun.choices[0].message.content;
      history.push({ role: 'assistant', content: secondResponse });
      await whatsappService.sendMessage(from, secondResponse);

    } else {
      const responseContent = responseMessage.content;
      history.push({ role: 'assistant', content: responseContent });
      await whatsappService.sendMessage(from, responseContent);
    }

  } catch (error) {
    console.error('[ERROR] Error in AI processing:', error);
    if (error.response) {
      console.error('[ERROR] OpenAI API Status:', error.response.status);
      console.error('[ERROR] OpenAI API Data:', error.response.data);
    }
    await whatsappService.sendMessage(from, "I'm having a little trouble connecting to my brain right now. Please try again later!");
  }
}

module.exports = {
  handleIncomingMessage,
};
