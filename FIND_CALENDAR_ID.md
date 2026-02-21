# How to find your Google Calendar ID

1.  **Open Google Calendar** on your computer (calendar.google.com).
2.  On the left sidebar, find **"My calendars"**.
3.  Hover over the calendar you want to use (e.g., "Architech Solutions" or your main calendar) and clicking the **three dots** (options menu).
4.  Select **Settings and sharing**.
5.  Scroll down to the section called **Integrate calendar**.
6.  Copy the value under **Calendar ID**.
    - For your primary calendar, it is usually just your **email address** (e.g., `architechsoln@gmail.com`).
    - For other calendars, it might look like `long_string@group.calendar.google.com`.

**Paste this ID into your `.env` file:**
```env
GOOGLE_CALENDAR_ID=architechsoln@gmail.com
```

> [!TIP]
> Make sure your **Service Account** (the email inside your `service-account.json` file) has been given permission to access this calendar. You can do this by going to "Share with specific people" in the same Settings menu and adding the Service Account email address with "Make changes to events" permission.
