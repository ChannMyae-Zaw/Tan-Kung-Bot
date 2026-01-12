// 1. Showdown Converter setup (Global scope)
const converter = new showdown.Converter({
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    smoothLivePreview: true,
    smartIndentationFix: true,
    simpleLineBreaks: true 
});

document.addEventListener("DOMContentLoaded", () => {
    // 2. Session & Timer State
    let sessionID = "tk-" + Math.random().toString(36).substring(2, 12);
    let startTime = Date.now();
    let timerInterval;

    // 3. Timer Logic
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval); // Reset if already running
        
        timerInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTime;

            const minutes = Math.floor((elapsed / 1000 / 60) % 60);
            const seconds = Math.floor((elapsed / 1000) % 60);

            const displayMin = String(minutes).padStart(2, '0');
            const displaySec = String(seconds).padStart(2, '0');

            const timerElement = document.getElementById('timerDisplay');
            if (timerElement) {
                timerElement.innerText = `${displayMin}:${displaySec}`;
            }
        }, 1000);
    }

    // Start the clock immediately
    startTimer();

    // 4. Send Message Function
    window.sendMessage = async function() {
        
        const input = document.getElementById('userInput');
        const userMsg = input.value.trim();
        if (!userMsg) return;

        addMessageToUI('user', userMsg);
        input.value = '';

        const typingId = showTyping();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    session_id: sessionID 
                })
            });
            const data = await response.json();

            hideTyping(typingId);
            addMessageToUI('bot', data.reply);
        } catch (error) {
            hideTyping(typingId);
            addMessageToUI('bot', "I'm having trouble connecting to Google HQ.");
        }
    };

    // 5. New Conversation (Reset)
    window.resetConversation = function() {
        if (confirm("Reset conversation and timer?")) {
            // Clear chatbox
            const chatbox = document.getElementById('chatbox');
            chatbox.innerHTML = `
                <div class="message-row bot-row">
                    <img class="avatar" src="static/bot_avater.png">
                    <div class="bubble bot-bubble">Hello! I am Tan-kung. Before we proceed, could you please tell me your <strong>company name</strong>?</div>
                </div>`;
            
            // Reset Session and Clock
            sessionID = "tk-" + Math.random().toString(36).substring(2, 12);
            startTime = Date.now();
            startTimer();
        }
    };

    function addMessageToUI(role, text) {
        const chatbox = document.getElementById('chatbox');
        const isBot = role === 'bot';
        const avatar = isBot ? "static/bot_avater.png" : "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
        const messageContent = isBot ? converter.makeHtml(text) : text;
        
        const html = `
            <div class="message-row ${isBot ? 'bot-row' : 'user-row'}">
                <img class="avatar" src="${avatar}">
                <div class="bubble ${isBot ? 'bot-bubble' : 'user-bubble'}">${messageContent}</div>
            </div>`;
        chatbox.insertAdjacentHTML('beforeend', html);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    function showTyping() {
        const id = "typing-" + Date.now();
        const html = `<div id="${id}" class="message-row bot-row"><img class="avatar" src="static/bot_avater.png"><div class="bubble bot-bubble">...</div></div>`;
        document.getElementById('chatbox').insertAdjacentHTML('beforeend', html);
        return id;
    }

    function hideTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
});