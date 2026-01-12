// 1. SETUP TOOLS (Top level)
const converter = new showdown.Converter({
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    simpleLineBreaks: true 
});

let sessionID = "tk-" + Math.random().toString(36).substring(2, 12);
let startTime;
let timerInterval;

// 2. DEFINE UNLOCKCHAT FIRST (To ensure it's registered)
window.unlockChat = function() {
    const nameInput = document.getElementById('userNameInput');
    const userName = nameInput.value.trim();

    if (!userName) {
        alert("Please enter your name in the sidebar!");
        return;
    }

    // 1. Hide the Lock Overlay
    const overlay = document.getElementById('chatLockOverlay');
    if (overlay) overlay.classList.add('hidden');

    // 2. Enable Chat Inputs
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.placeholder = "Ask about Gmail, Drive...";

    // 3. Lock the Sidebar Name (Optional, prevents changing name mid-chat)
    nameInput.disabled = true;
    document.getElementById('saveNameBtn').style.display = 'none';

    // 4. Start Timer and Greeting
    startTimer();
    addMessageToUI('bot', `Hello **${userName}**! I am Tan-kung. Before we proceed, could you please tell me your **company name**?`);
};

// 3. DEFINE SENDMESSAGE
window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const userMsg = input.value.trim();
    const userName = document.getElementById('userNameInput').value || "Guest";

    if (!userMsg || input.disabled) return;

    addMessageToUI('user', userMsg);
    input.value = '';

    const typingId = showTyping();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMsg,
                session_id: sessionID,
                user_name: userName 
            })
        });
        const data = await response.json();
        hideTyping(typingId);
        addMessageToUI('bot', data.reply);
    } catch (error) {
        hideTyping(typingId);
        addMessageToUI('bot', "I'm having trouble connecting.");
    }
};

// 4. TIMER & UI HELPERS (Defined as standard functions)
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const min = String(Math.floor(elapsed / 60000)).padStart(2, '0');
        const sec = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
        const timerElement = document.getElementById('timerDisplay');
        if (timerElement) timerElement.innerText = `${min}:${sec}`;
    }, 1000);
}

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

window.resetConversation = function() {
    if (confirm("Reset conversation?")) location.reload();
};