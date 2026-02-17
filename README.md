# Radiance by Afsana - Invoice System Setup Guide

## 🚀 Complete Integration Setup

This guide will help you set up the invoice system with Google Sheets, Google Calendar, and Email integration.

---

## 📋 Prerequisites

1. **Node.js** installed (version 14 or higher)
   - Download from: https://nodejs.org/
   
2. **Google Account** with Gmail access

3. **Google Cloud Project** (we'll create this below)

---

## 🔧 Step 1: Install Dependencies

1. Open PowerShell in the invoice folder
2. Run the following command:

```powershell
npm install
```

---

## 🔐 Step 2: Set Up Google Cloud Project

### 2.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Create Project"**
3. Name it: `Radiance Invoice System`
4. Click **"Create"**

### 2.2 Enable Required APIs

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search and enable the following APIs:
   - **Google Sheets API**
   - **Google Calendar API**
   - **Gmail API** (optional, for email)

### 2.3 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Radiance Invoice`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - On "Scopes" page, click **"Save and Continue"**
   - On "Test users" page, add your email address
   - Click **"Save and Continue"**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Radiance Invoice Client`
   - Authorized redirect URIs: `http://localhost:3000/oauth2callback`
   - Click **"Create"**

5. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these!

---

## 📊 Step 3: Create Google Sheet

1. Go to: https://sheets.google.com/
2. Create a new spreadsheet
3. Name it: `Radiance Invoices Database`
4. Rename the first sheet to: `Invoices`
5. Add these column headers in the first row:
   - A1: `Timestamp`
   - B1: `Invoice Number`
   - C1: `Client Name`
   - D1: `Client Phone`
   - E1: `Client Address`
   - F1: `Event Date`
   - G1: `Event Time`
   - H1: `Event Venue`
   - I1: `Services`
   - J1: `Subtotal`
   - K1: `Discount`
   - L1: `Transport`
   - M1: `Home Service`
   - N1: `Advance`
   - O1: `Grand Total`
   - P1: `Status`

6. **Copy the Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Copy the part after `/d/` and before `/edit`

---

## 📧 Step 4: Set Up Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **"2-Step Verification"** if not already enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Create a new App Password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Name it: `Radiance Invoice`
   - Click **"Generate"**
5. **Copy the 16-character password** - you'll need this!

---

## ⚙️ Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

2. Open `.env` file and fill in the values:

```env
PORT=3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password

# Google API Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# Google Sheets Configuration
GOOGLE_SHEET_ID=your-spreadsheet-id

# Google Calendar Configuration
GOOGLE_CALENDAR_ID=primary

# Leave this empty for now - we'll fill it in next step
GOOGLE_REFRESH_TOKEN=
```

---

## 🔑 Step 6: Authorize Google APIs

1. Start the server:

```powershell
npm start
```

2. Open your browser and go to: http://localhost:3000/api/auth

3. The browser will show a JSON response with an `authUrl`. Copy that URL.

4. Paste the URL in a new browser tab and press Enter

5. Sign in with your Google account

6. Grant permissions for Sheets and Calendar access

7. After authorization, you'll see a page with your **REFRESH_TOKEN**

8. Copy the refresh token and add it to your `.env` file:

```env
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
```

9. Restart the server (Press Ctrl+C, then run `npm start` again)

---

## 🎯 Step 7: Test the System

1. Make sure the server is running (`npm start`)

2. Open `invoice.html` in your browser

3. Fill in the invoice details:
   - Client name
   - Client email
   - Event date and time
   - Event venue
   - Services

4. Check the options you want:
   - ✅ Save to Google Sheets
   - ✅ Create Calendar Event with Reminders
   - ✅ Send Invoice via Email

5. Click **"💾 Save Invoice & Sync"**

6. Check the status message for success confirmation

7. Verify:
   - Google Sheets should have a new row
   - Google Calendar should have a new event
   - Email should be sent to the client

---

## 📝 Usage Instructions

### Starting the Server

```powershell
npm start
```

The server will run on: http://localhost:3000

### Using the Invoice System

1. Open `invoice.html` in your browser
2. Fill in all required fields
3. Add services using the "+ Add Service Item" button
4. Select which integrations you want to use
5. Click "Save Invoice & Sync"

### Calendar Reminders

When you create a calendar event, it will automatically set reminders:
- **1 day before** the event (email)
- **1 hour before** the event (popup)
- **10 minutes before** the event (popup)

### Viewing Data

- **Google Sheets**: All invoices are saved with timestamps
- **Google Calendar**: Events show up in your primary calendar
- **Email**: Clients receive a formatted invoice via email

---

## 🔍 Troubleshooting

### "Failed to connect to server"
- Make sure the server is running (`npm start`)
- Check if the API_URL in invoice.html matches your server (default: http://localhost:3000/api)

### "Failed to save to Google Sheets"
- Verify your GOOGLE_SHEET_ID in .env
- Make sure you've authorized the Google APIs
- Check that the spreadsheet has a sheet named "Invoices"

### "Failed to create calendar event"
- Make sure Event Date and Time are filled in
- Verify your GOOGLE_REFRESH_TOKEN is set
- Check that Calendar API is enabled

### "Failed to send email"
- Verify your EMAIL_USER and EMAIL_APP_PASSWORD
- Make sure 2-Step Verification is enabled on your Google account
- Check that the client email is valid

### Authorization Issues
- Re-run the authorization: http://localhost:3000/api/auth
- Make sure you've added yourself as a test user in Google Cloud Console
- Check that redirect URI is exactly: http://localhost:3000/oauth2callback

---

## 🎨 Customization

### Change Email Template
Edit the `invoiceHTML` being sent in `server.js` > `/api/email/send` route

### Modify Google Sheets Columns
Update the `values` array in `server.js` > `/api/sheets/save` route

### Adjust Calendar Reminders
Modify the `reminders` object in `server.js` > `/api/calendar/create` route

---

## 🔒 Security Notes

1. **Never commit `.env` file** to version control
2. Keep your Google credentials secure
3. Don't share your App Password
4. Regularly review Google Cloud Console permissions

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the server terminal for error messages
3. Verify all environment variables are set correctly
4. Make sure all Google APIs are enabled

---

## 🎉 You're All Set!

Your invoice system is now fully integrated with:
- ✅ Google Sheets (automatic database)
- ✅ Google Calendar (automatic reminders)
- ✅ Email (automatic invoice delivery)

Enjoy your automated invoice management system! 🚀
