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
