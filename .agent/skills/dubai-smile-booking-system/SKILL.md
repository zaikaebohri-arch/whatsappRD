---
name: dubai-smile-booking-system
description: A complete WhatsApp-based AI booking agent and admin dashboard system for dental clinics.
---

# Dubai Smile Booking System

This skill encapsulates the entire architecture, implementation details, and business logic for a WhatsApp AI Agent that handles dental clinic bookings using the WhatsApp Cloud API and Supabase.

## 🏗️ Architecture Overview

The system consists of three main components:
1.  **AI Agent (Backend)**: A Node.js Express server that receives WhatsApp messages via webhooks and uses OpenAI's function calling to manage bookings.
2.  **Database (Supabase)**: Stores `bookings` and `blocked_slots`.
3.  **Admin Dashboard (Frontend)**: A Next.js 15 application for clinic staff to view bookings and manage blocked time slots.

## 🛠️ Tech Stack
- **Node.js (Express)**: Backend server.
- **OpenAI (GPT-4o)**: AI reasoning and tool calling.
- **Supabase**: PostgreSQL database and client SDK.
- **WhatsApp Cloud API**: Official Graph API for messaging.
- **Next.js 15 (App Router)**: Admin dashboard.
- **Tailwind CSS**: Dashboard styling.

## 🗄️ Database Schema

The system requires two tables in a Supabase project. See `resources/schema.sql` for the full DDL.

### `bookings` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `phone` | Text | Patient's WhatsApp number |
| `summary` | Text | Appointment title (e.g., "Consultation") |
| `description` | Text | Additional details |
| `start_time` | TIMESTAMPTZ | Appointment start (IST preferred) |
| `end_time` | TIMESTAMPTZ | Appointment end |

### `blocked_slots` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `reason` | Text | Reason for blocking (e.g., "Staff Meeting") |
| `start_time` | TIMESTAMPTZ | Block start |
| `end_time` | TIMESTAMPTZ | Block end |

## 🧠 AI Agent Instruction (System Prompt)

The AI Agent follows a strict persona and conversational flow. Key rules include:
- **Identity**: Ava, professional and friendly dental assistant.
- **Tool Calling**:
    - `check_availability(dateTime)`: Must be run before any booking.
    - `book_appointment(summary, description, startTime, endTime)`: Run only after user confirmation.
- **Availability Logic**: The agent checks a window of 8 hours before and after the requested time to provide smart alternatives.

## 🖥️ Admin Dashboard Features
- **Client Bookings**: Real-time view of all appointments with search and date range filtering.
- **Blocked Slots Management**: 
    - Full-day blocking toggle.
    - Manual time range blocking.
    - Real-time updates via Supabase.

## 🚀 Deployment Guide
- Deploy the **Backend Bot** as a permanent service (e.g., Render.com).
- Deploy the **Admin Dashboard** as a separate frontend service (e.g., Vercel or Render).
- Ensure environment variables for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, and `WHATSAPP_ACCESS_TOKEN` are set in both environments.
