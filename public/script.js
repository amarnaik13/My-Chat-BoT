// Function to navigate between stages
function goToStage(stageId) {
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => stage.classList.remove('active', 'hidden'));
    document.getElementById(stageId).classList.add('active');
}

// Show Intro stage when the page loads and check login status
document.addEventListener('DOMContentLoaded', () => {
    goToStage('stage-intro');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    if (isLoggedIn === 'true' && currentUser) {
        document.getElementById('profile-btn').classList.remove('hidden');
    }
});

// Query count to track number of queries sent by user
let queryCount = 0;

// Initialize Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

// Function to start listening to user voice
function startListening() {
    recognition.start();
    console.log("Voice recognition activated. Listening...");
}

// Capture the recognized text and send it to the chatbot
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    console.log(`You said: ${transcript}`);
    document.getElementById('user-input').value = transcript;
    sendMessage(); // Send message as usual
});

// Handle recognition errors
recognition.addEventListener('error', (event) => {
    console.error("Speech recognition error: ", event.error);
});

// Function to make the chatbot speak
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
}

// Function to handle selected function in Guide stage
function selectFunction(functionName) {
    goToStage('stage-chat');
    document.getElementById('user-input').value = functionName;
    sendMessage();
}

let isVoiceInput = false; // Flag to track if the input is from voice

// Function to start listening to user voice
function startListening() {
    isVoiceInput = true; // Set flag to true for voice input
    recognition.start();
    console.log("Voice recognition activated. Listening...");
}

// Function to send messages and increment query count
function sendMessage() {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const userMessage = userInput.value.trim();

    if (userMessage === '') return;

    // Display user message
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.innerText = userMessage;
    chatBody.appendChild(userMessageElement);

    chatBody.scrollTop = chatBody.scrollHeight;
    userInput.value = '';
    queryCount++;

    // Check if the user asked "Who built you and when?"
    const creatorName = "Amar Kumar Naik, Shiba Baskey, Mahi Lal Badseth, and Sripati Randhari, Under the guidance of Asst. Prof. Subhashis Mishra";
    const creationDate = "09.11.2024"; // Date of creation
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes("who built you") || lowerCaseMessage.includes("who are you built by") || lowerCaseMessage.includes("Who designed you") || lowerCaseMessage.includes("Who created you?") || lowerCaseMessage.includes("when were you built")){
        const response = `I was built by ${creatorName} on ${creationDate}.`;

        // Display bot response for the creator query
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.innerText = response;
        chatBody.appendChild(botMessageElement);

        chatBody.scrollTop = chatBody.scrollHeight;

        // Speak the response only if it was voice input
        if (isVoiceInput) {
            speak(response);
        }

        // Reset the isVoiceInput flag after responding
        isVoiceInput = false;
        return; // Exit function early to avoid sending the query to the server
    }

    // Function to handle click on suggestion and populate the input box
function handleSuggestionClick(event) {
    const suggestionText = event.target.innerText; // Get text of clicked suggestion
    const userInput = document.getElementById('user-input'); // Reference to the input box
    userInput.value = suggestionText; // Set input box value to suggestion text
    }

    // Attach event listeners to all suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(button => {
    button.addEventListener('click', handleSuggestionClick);
    });


    

    // Show login modal if user is not logged in after five queries
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (queryCount >= 5 && isLoggedIn !== 'true') {
        showLoginModal();
    }

    // Send user message to server
    fetch('/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        const botMessage = data.reply;

        // Display bot response
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.innerText = botMessage;
        chatBody.appendChild(botMessageElement);

        chatBody.scrollTop = chatBody.scrollHeight;

        // Speak the bot message only if it was voice input
        if (isVoiceInput) {
            speak(botMessage);
        }

        // Reset the isVoiceInput flag after responding
        isVoiceInput = false;
    })
    .catch(error => console.error('Error:', error));
}



// Function to show the login modal if not logged in
function showLoginModal() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') return;
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';
}

// Function to toggle between login and register views
function toggleLoginRegister() {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const toggleButton = document.getElementById('toggle-login-register');

    if (loginSection.style.display === 'block') {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        toggleButton.textContent = 'Switch to Login';
    } else {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        toggleButton.textContent = 'Switch to Register';
    }
}

// Function to register a new user
function register() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email) || !password) {
        alert('Please enter a valid email and password.');
        return;
    }

    localStorage.setItem(`user_${email}`, password);
    alert('Registration successful! You can now log in.');
    toggleLoginRegister();
}

// Function to log in the user
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const storedPassword = localStorage.getItem(`user_${email}`);
    
    if (storedPassword && storedPassword === password) {
        alert('Login successful!');
        closeLoginModal();
        document.getElementById('profile-btn').classList.remove('hidden');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);
    } else {
        alert('Incorrect email or password.');
    }
}

// Function to close the login modal
function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Function to log out the user
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    document.getElementById('profile-btn').classList.add('hidden');
    toggleDashboard();
    alert('You have been logged out.');
}

// Function to toggle the dashboard visibility
function toggleDashboard() {
    const dashboard = document.getElementById('dashboard-popup');
    if (dashboard.classList.contains('hidden')) {
        dashboard.classList.remove('hidden');
        dashboard.style.display = 'flex';
    } else {
        dashboard.classList.add('hidden');
        dashboard.style.display = 'none';
    }
}

// Event listener for profile picture upload and preview
document.getElementById('profile-pic').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('profile-pic-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Function to change theme
function changeTheme(theme) {
    if (theme === 'light') {
        document.body.style.backgroundColor = '#fff';
        document.body.style.color = '#000';
    } else if (theme === 'dark') {
        document.body.style.backgroundColor = '#333';
        document.body.style.color = '#fff';
    }
}
