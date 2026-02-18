// js/chat.js – AI Chatbot for Altivon Holdings using OpenRouter

(function() {
  // Configuration
  const ASSETS_PATH = 'https://altivonholdings.github.io/assets/chat/';
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL = 'openai/gpt-3.5-turbo'; // or any model you prefer

  let apiKey = '';
  let systemPrompt = '';

  // DOM elements
  let chatButton, chatWindow, messagesContainer, userInput, sendButton;

  // Conversation history
  let messages = [];

  // Initialize: fetch credentials and create UI
  async function initChat() {
    try {
      // Fetch API key and system prompt in parallel
      const [keyRes, promptRes] = await Promise.all([
        fetch(ASSETS_PATH + 'api_key.txt'),
        fetch(ASSETS_PATH + 'system-prompt.txt')
      ]);
      if (!keyRes.ok || !promptRes.ok) throw new Error('Failed to load chat assets');
      apiKey = (await keyRes.text()).trim();
      systemPrompt = (await promptRes.text()).trim();

      // Set initial system message
      messages.push({ role: 'system', content: systemPrompt });

      // Build the UI
      createUI();
    } catch (error) {
      console.error('Chat init error:', error);
    }
  }

  function createUI() {
    // Create button
    chatButton = document.createElement('div');
    chatButton.id = 'chat-button';
    chatButton.innerHTML = '<i class="fas fa-comment"></i>';
    document.body.appendChild(chatButton);

    // Create chat window (hidden initially)
    chatWindow = document.createElement('div');
    chatWindow.id = 'chat-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <span>Altivon Assistant</span>
        <button id="chat-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" placeholder="Ask about our services...">
        <button id="chat-send"><i class="fas fa-paper-plane"></i></button>
      </div>
    `;
    document.body.appendChild(chatWindow);

    // Get references
    messagesContainer = chatWindow.querySelector('.chat-messages');
    userInput = chatWindow.querySelector('#chat-input');
    sendButton = chatWindow.querySelector('#chat-send');
    const closeButton = chatWindow.querySelector('#chat-close');

    // Event listeners
    chatButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Add a welcome message
    addMessage('assistant', '👋 Hi! How can I help you with Altivon Holdings?');
  }

  function toggleChat() {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      userInput.focus();
    }
  }

  function addMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.textContent = content;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Disable input while waiting
    userInput.disabled = true;
    sendButton.disabled = true;

    // Add user message to UI and history
    addMessage('user', text);
    messages.push({ role: 'user', content: text });
    userInput.value = '';

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.innerHTML = '<i>typing...</i>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin, // required by OpenRouter
          'X-Title': 'Altivon Holdings Chat'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messages
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const reply = data.choices[0].message.content;

      // Remove typing indicator
      typingDiv.remove();

      // Add assistant reply
      addMessage('assistant', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch (error) {
      typingDiv.remove();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again later.');
      console.error(error);
    } finally {
      userInput.disabled = false;
      sendButton.disabled = false;
      userInput.focus();
    }
  }

  // Start the chat when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();