const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'amar01', // Your MySQL username
    password: 'Familylover@123', // Your MySQL password
    database: 'college_info' // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        process.exit(1); // Stop the server if MySQL connection fails
    }
    console.log('MySQL connected...');
});

// Set up Dialogflow
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'C:\\Code\\My Projects\\ChatBot\\config\\hi-tech-bot-femy-05244d06b243.json'
});
const projectId = 'hi-tech-bot-femy';

async function detectIntentText(sessionId, text, languageCode) {
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
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

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to handle user messages
app.post('/message', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = uuid.v4();

    try {
        const dialogflowResponse = await detectIntentText(sessionId, userMessage, 'en-US');
        let responseText = dialogflowResponse[0].queryResult.fulfillmentText;

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
                return res.send({ reply: responseText });
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
                return res.send({ reply: responseText });
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
                return res.send({ reply: responseText });
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
                return res.send({ reply: responseText });
            });
        } else {
            // Default response if no specific keywords are found
            return res.send({ reply: responseText });
        }

    } catch (error) {
        console.error('ERROR:', error);
        return res.status(500).send({ reply: 'Something went wrong with the server!' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
