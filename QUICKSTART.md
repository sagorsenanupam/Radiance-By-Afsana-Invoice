# Quick Start Guide - Radiance Invoice System

## First Time Setup (5 minutes)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Set Up Environment
```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Open .env in notepad to edit
notepad .env
```

Fill in these required values in .env:
- `EMAIL_USER` - Your Gmail address
- `EMAIL_APP_PASSWORD` - Gmail app password (see README.md)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console  
- `GOOGLE_SHEET_ID` - Your spreadsheet ID

### 3. Start Server & Authorize
```powershell
# Start the server
npm start

# In browser, visit:
# http://localhost:3000/api/auth
# Follow the authorization steps and copy the refresh token to .env
```

### 4. Restart Server
```powershell
# Press Ctrl+C to stop, then:
npm start
```

---

## Daily Usage

### Start the Server
```powershell
npm start
```

### Open Invoice Generator
Open `invoice.html` in your browser or double-click the file.

### Stop the Server
Press `Ctrl+C` in the PowerShell window

---

## Quick Checklist

Before using the system, make sure:
- [ ] Node.js is installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file is configured
- [ ] Google APIs are authorized
- [ ] Server is running (`npm start`)
- [ ] Google Sheets has "Invoices" sheet with headers

---

## Common Commands

```powershell
# Install dependencies
npm install

# Start server
npm start

# Start with auto-restart (development mode)
npm run dev
```

---

For detailed setup instructions, see [README.md](README.md)
