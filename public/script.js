// Function to navigate between stages
function goToStage(stageId) {
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => stage.classList.remove('active', 'hidden')); // Hide all stages
    document.getElementById(stageId).classList.add('active'); // Show the selected stage
}

// Initially show the Intro stage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    goToStage('stage-intro');
    
});

// Function to handle selected function in Guide stage
function selectFunction(functionName) {
    goToStage('stage-chat'); // Move to conversation stage
    // Automatically send the selected function as the first message
    document.getElementById('user-input').value = functionName;
    sendMessage();
}

// Function to send messages (already provided in your existing script.js)
function sendMessage() {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const userMessage = userInput.value.trim();

    if (userMessage === '') return;

    // Append user message to chat
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.innerText = userMessage;
    chatBody.appendChild(userMessageElement);

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear the input box
    userInput.value = '';

    // Send user message to server
    fetch('/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
    })
    .then(response => response.json())
    .then(data => {
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.innerText = data.reply;
        chatBody.appendChild(botMessageElement);

        // Scroll to the bottom of the chat
        chatBody.scrollTop = chatBody.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function goToStage(stageId) {
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => stage.classList.remove('active', 'hidden')); 
    document.getElementById(stageId).classList.add('active'); 
}

document.addEventListener('DOMContentLoaded', () => {
    goToStage('stage-intro');
    // Check login status on page load
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    if (isLoggedIn === 'true' && currentUser) {
        document.getElementById('profile-btn').classList.remove('hidden');
    }
});

// Function to navigate between stages
function goToStage(stageId) {
    const stages = document.querySelectorAll('.stage');
    stages.forEach(stage => stage.classList.remove('active', 'hidden'));
    document.getElementById(stageId).classList.add('active');
}

// Show Intro stage when the page loads and check login status
document.addEventListener('DOMContentLoaded', () => {
    goToStage('stage-intro');

    // Check login status on page load
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    if (isLoggedIn === 'true' && currentUser) {
        document.getElementById('profile-btn').classList.remove('hidden');
    }
});

// Query count to track number of queries sent by user
let queryCount = 0;

// Function to handle selected function in Guide stage
function selectFunction(functionName) {
    goToStage('stage-chat');
    document.getElementById('user-input').value = functionName;
    sendMessage();
}

// Function to send messages and increment query count
function sendMessage() {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const userMessage = userInput.value.trim();

    if (userMessage === '') return;

    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.innerText = userMessage;
    chatBody.appendChild(userMessageElement);

    chatBody.scrollTop = chatBody.scrollHeight;
    userInput.value = '';
    queryCount++;

    // Show login modal if user is not logged in after five queries
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (queryCount >= 5 && isLoggedIn !== 'true') {
        showLoginModal();
    }

    fetch('/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        const botMessageElement = document.createElement('div');
        botMessageElement.classList.add('chat-message', 'bot-message');
        botMessageElement.innerText = data.reply;
        chatBody.appendChild(botMessageElement);

        chatBody.scrollTop = chatBody.scrollHeight;
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

        // Display the profile button after successful login
        document.getElementById('profile-btn').classList.remove('hidden');

        // Store login status and current user in localStorage
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
