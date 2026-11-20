const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Root route - serve invoice.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'invoice.html'));
});

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo.png'));
});

// Chrome DevTools quiet handler
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).end();
});

// OAuth2 Client Setup for Google APIs
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Set credentials if refresh token exists
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
}

// Email Configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// ========== ROUTES ==========

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// OAuth2 Authorization URL
app.get('/api/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/calendar'
        ],
        prompt: 'consent'
    });
    res.json({ authUrl });
});

// OAuth2 Callback
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        res.send(`
            <h2>Authorization Successful!</h2>
            <p>Please add this refresh token to your .env file:</p>
            <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
            <p>You can close this window now.</p>
        `);
    } catch (error) {
        res.status(500).send('Error during authentication: ' + error.message);
    }
});

// Save Invoice to Google Sheets
app.post('/api/sheets/save', async (req, res) => {
    try {
        const invoiceData = req.body;

        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        // Prepare row data
        const values = [[
            new Date().toISOString(),
            invoiceData.invoiceNumber,
            invoiceData.clientName,
            invoiceData.clientPhone,
            invoiceData.clientAddress,
            invoiceData.eventDate,
            invoiceData.eventTime,
            invoiceData.eventVenue,
            JSON.stringify(invoiceData.services),
            invoiceData.subtotal,
            invoiceData.discount,
            invoiceData.transport,
            invoiceData.homeService,
            invoiceData.advance,
            invoiceData.grandTotal,
            invoiceData.status || 'Pending'
        ]];

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Invoices!A:P',
            valueInputOption: 'RAW',
            resource: { values }
        });

        res.json({
            success: true,
            message: 'Invoice saved to Google Sheets',
            data: response.data
        });
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save to Google Sheets',
            error: error.message
        });
    }
});

// Create Calendar Event
app.post('/api/calendar/create', async (req, res) => {
    try {
        const { eventDate, eventTime, eventVenue, clientName, services } = req.body;

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Parse date and time
        const eventDateTime = new Date(`${eventDate} ${eventTime}`);
        const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000); // +4 hours

        const event = {
            summary: `Radiance by Afsana - ${clientName}`,
            location: eventVenue,
            description: `Services: ${services.map(s => s.name).join(', ')}\nClient: ${clientName}`,
            start: {
                dateTime: eventDateTime.toISOString(),
                timeZone: 'Asia/Dhaka'
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Asia/Dhaka'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 },       // 1 hour before
                    { method: 'popup', minutes: 10 }        // 10 minutes before
                ]
            }
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            resource: event
        });

        res.json({
            success: true,
            message: 'Calendar event created',
            eventId: response.data.id,
            eventLink: response.data.htmlLink
        });
    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create calendar event',
            error: error.message
        });
    }
});

// Send Email
app.post('/api/email/send', async (req, res) => {
    try {
        const { clientEmail, clientName, invoiceNumber, invoiceHTML } = req.body;

        const mailOptions = {
            from: `Radiance by Afsana <${process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Invoice #${invoiceNumber} - Radiance by Afsana`,
            html: invoiceHTML,
            attachments: []
        };

        const info = await emailTransporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Combined endpoint to save everything at once
app.post('/api/invoice/save-all', async (req, res) => {
    const results = {
        sheets: null,
        calendar: null,
        email: null
    };

    try {
        // Save to Google Sheets
        if (req.body.saveToSheets) {
            try {
                const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
                const values = [[
                    new Date().toISOString(),
                    req.body.invoiceNumber,
                    req.body.clientName,
                    req.body.clientPhone,
                    req.body.clientAddress,
                    req.body.eventDate,
                    req.body.eventTime,
                    req.body.eventVenue,
                    JSON.stringify(req.body.services),
                    req.body.subtotal,
                    req.body.discount,
                    req.body.transport,
                    req.body.homeService,
                    req.body.advance,
                    req.body.grandTotal,
                    req.body.status || 'Pending'
                ]];

                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: 'Invoices!A:P',
                    valueInputOption: 'RAW',
                    resource: { values }
                });

                results.sheets = { success: true };
            } catch (error) {
                results.sheets = { success: false, error: error.message };
            }
        }

        // Create Calendar Event
        if (req.body.createCalendarEvent) {
            try {
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                const eventDateTime = new Date(`${req.body.eventDate} ${req.body.eventTime}`);
                const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);

                const event = {
                    summary: `Radiance by Afsana - ${req.body.clientName}`,
                    location: req.body.eventVenue,
                    description: `Services: ${req.body.services.map(s => s.name).join(', ')}\nClient: ${req.body.clientName}`,
                    start: {
                        dateTime: eventDateTime.toISOString(),
                        timeZone: 'Asia/Dhaka'
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: 'Asia/Dhaka'
                    },
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 60 },
                            { method: 'popup', minutes: 10 }
                        ]
                    }
                };

                const response = await calendar.events.insert({
                    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
                    resource: event
                });

                results.calendar = { success: true, eventLink: response.data.htmlLink };
            } catch (error) {
                results.calendar = { success: false, error: error.message };
            }
        }

        // Send Email
        if (req.body.sendEmail && req.body.clientEmail) {
            try {
                const mailOptions = {
                    from: `Radiance by Afsana <${process.env.EMAIL_USER}>`,
                    to: req.body.clientEmail,
                    subject: `Invoice #${req.body.invoiceNumber} - Radiance by Afsana`,
                    html: req.body.invoiceHTML
                };

                await emailTransporter.sendMail(mailOptions);
                results.email = { success: true };
            } catch (error) {
                results.email = { success: false, error: error.message };
            }
        }

        res.json({
            success: true,
            message: 'Operations completed',
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message,
            results
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🚀 Radiance by Afsana Server running on http://localhost:${PORT}`);
    console.log(`📊 Make sure to configure your .env file before using the API`);
    console.log(`🔐 Visit http://localhost:${PORT}/api/auth to authorize Google APIs\n`);
});
