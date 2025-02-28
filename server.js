const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { SessionsClient } = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for frontend-backend communication
app.use(bodyParser.json());

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'amar01',
    password: 'Familylover@123',
    database: 'college_info'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
    console.log('MySQL connected...');
});

// Set up Dialogflow
const sessionClient = new SessionsClient({
    keyFilename: process.env.DIALOGFLOW_KEY_PATH
});
const projectId = process.env.PROJECT_ID;

async function detectIntentText(sessionId, text, languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: text,
                languageCode: languageCode,
            },
        },
    };
    return sessionClient.detectIntent(request);
}

// Handle user messages
app.post('/message', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = uuid.v4();

    try {
        const dialogflowResponse = await detectIntentText(sessionId, userMessage, 'en-US');
        let responseText = dialogflowResponse[0].queryResult.fulfillmentText;

        // Database queries based on user message
        if (/admission/i.test(userMessage)) {
            db.query('SELECT * FROM admissions LIMIT 1', (err, results) => {
                if (err) {
                    console.error('MySQL query error:', err);
                    return res.status(500).send({ reply: 'Database error occurred!' });
                }
                const admission = results[0];
                responseText = `Admission Requirements: ${admission.requirements}\n` +
                    `Deadlines: ${admission.deadlines}\n` +
                    `Process: ${admission.process}`;
                return res.json({ reply: responseText });
            });
        } else if (/course/i.test(userMessage)) {
            db.query('SELECT * FROM courses', (err, results) => {
                if (err) {
                    console.error('MySQL query error:', err);
                    return res.status(500).send({ reply: 'Database error occurred!' });
                }
                responseText = 'Available Courses:\n';
                results.forEach(course => {
                    responseText += `${course.name}: ${course.description} (Prerequisites: ${course.prerequisites})\n`;
                });
                return res.json({ reply: responseText });
            });
        } else if (/fee/i.test(userMessage)) {
            db.query('SELECT * FROM fees LIMIT 1', (err, results) => {
                if (err) {
                    console.error('MySQL query error:', err);
                    return res.status(500).send({ reply: 'Database error occurred!' });
                }
                const fee = results[0];
                responseText = `Tuition: ${fee.tuition}\n` +
                    `Payment Deadline: ${fee.payment_deadline}\n` +
                    `Scholarships: ${fee.scholarships}`;
                return res.json({ reply: responseText });
            });
        } else if (/contact/i.test(userMessage)) {
            db.query('SELECT * FROM contact LIMIT 1', (err, results) => {
                if (err) {
                    console.error('MySQL query error:', err);
                    return res.status(500).send({ reply: 'Database error occurred!' });
                }
                const contact = results[0];
                responseText = `Email: ${contact.email}\n` +
                    `Phone: ${contact.phone}\n` +
                    `Address: ${contact.address}`;
                return res.json({ reply: responseText });
            });
        } else {
            return res.json({ reply: responseText });
        }

    } catch (error) {
        console.error('ERROR:', error);
        return res.status(500).send({ reply: 'Something went wrong with the server!' });
    }
});

// Serve static frontend files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
