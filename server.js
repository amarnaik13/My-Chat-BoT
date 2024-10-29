const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// User Registration Route
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    
    // Check if the user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length > 0) {
            return res.json({ success: false, message: 'Email already registered!' });
        } else {
            // Hash the password (you should use bcrypt for hashing in production)
            const hashedPassword = password; // Use bcrypt for real applications
            
            // Insert new user into database
            db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.json({ success: false, message: 'Registration failed!' });
                }
                return res.json({ success: true });
            });
        }
    });
});

// User Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length === 0) {
            return res.json({ success: false, message: 'Email not found!' });
        }

        const user = results[0];
        
        // Compare passwords (use bcrypt.compare in production)
        if (password === user.password) { // bcrypt.compare(password, user.password) in real use
            // Login successful
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'Incorrect password!' });
        }
    });
});

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
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: process.env.DIALOGFLOW_KEY_PATH
});
const projectId = process.env.PROJECT_ID;

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


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    // Here you can verify if the user exists in your database
    db.query('SELECT * FROM users WHERE google_id = ?', [profile.id], (err, results) => {
        if (err) {
            return done(err);
        }
        if (results.length === 0) {
            // User not found, insert new user into the database
            db.query('INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)', 
                [profile.id, profile.emails[0].value, profile.displayName], (err) => {
                if (err) {
                    return done(err);
                }
                return done(null, profile); // Pass profile if successful
            });
        } else {
            // User exists, proceed
            return done(null, results[0]);
        }
    });
}));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Secure cookie in production
        httpOnly: true // Prevent client-side JavaScript from accessing cookies
    }
}));


app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login', // Redirect to login page on failure
    failureMessage: 'Google login failed. Please try again.'
}), (req, res) => {
    // Successful authentication, redirect to dashboard or home
    res.redirect('/dashboard'); // Redirect to dashboard or preferred route
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/'); // Redirect to home or login page after logout
    });
});




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
