document.addEventListener("DOMContentLoaded", () => {
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");
    const chatContent = document.querySelector(".chat-content");
  
    // Render messages in chat
    function renderMessage(sender, message) {
      const messageBubble = document.createElement("div");
      messageBubble.classList.add("message", sender);
      messageBubble.textContent = message;
      chatContent.appendChild(messageBubble);
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  
    // Handle form submit
    messageForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const userMessage = messageInput.value.trim();
  
      if (!userMessage) return;
  
      // Render user message
      renderMessage("user", userMessage);
      messageInput.value = "";
  
      // Show bot typing indicator
      renderMessage("bot", "...");
  
      try {
        // Send message to the server
        const response = await fetch('/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });
  
        const data = await response.json();
        const botResponse = data.reply || "I'm sorry, I didn't understand that.";
  
        // Update bot message
        chatContent.lastChild.textContent = botResponse;
      } catch (error) {
        console.error('Error:', error);
        chatContent.lastChild.textContent = "Sorry, something went wrong. Please try again later.";
      }
    });
  
    // Initial bot greeting
    renderMessage("bot", "Hello! Welcome to Hi-Tech-BoT. How can I assist you today?");
});
