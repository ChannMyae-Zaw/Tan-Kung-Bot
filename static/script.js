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
    const companyInput = document.getElementById('companyInput');
    const phoneInput = document.getElementById('phoneInput');
    const emailInput = document.getElementById('emailInput');
    const saveBtn = document.getElementById('saveNameBtn');

    const userName = nameInput.value.trim();
    const companyName = companyInput.value.trim();

    // Basic validation: Name and Company are usually mandatory
    if (!userName || !companyName) {
        if (!userName) nameInput.style.borderColor = "red";
        if (!companyName) companyInput.style.borderColor = "red";
        alert("Please fill in your Name and Company Name.");
        return;
    }

    // UI Cleanup: Lock all sidebar fields
    document.getElementById('chatLockOverlay').classList.add('hidden');
    nameInput.disabled = true;
    companyInput.disabled = true;
    phoneInput.disabled = true;
    emailInput.disabled = true;
    
    saveBtn.disabled = true;
    saveBtn.innerText = "Saved";
    saveBtn.style.opacity = "0.6";

    // Enable Chat Input Area
    document.getElementById('userInput').disabled = false;
    document.getElementById('userInput').placeholder = "Ask Tan-kung...";
    document.querySelector('.input-area button').disabled = false;

    startTimer();
    
    // Personalized greeting using the new info
    addMessageToUI('bot', `Hello **${userName}** from **${companyName}**! I am Tan-kung. How can I assist you with Google Workspace today?`);
};

// 3. DEFINE SENDMESSAGE
window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const userMsg = input.value.trim();

    // Collect values from the sidebar
    const userName = document.getElementById('userNameInput').value || "Guest";
    const companyName = document.getElementById('companyInput').value || "Unknown";
    const phone = document.getElementById('phoneInput').value || "N/A";
    const email = document.getElementById('emailInput').value || "N/A";

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
                user_name: userName,
                company_name: companyName, // Must match Python class exactly
                phone: phone,              // Must match Python class exactly
                email: email               // Must match Python class exactly
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Validation Error Details:", data.detail);
            throw new Error("Validation Failed");
        }

        hideTyping(typingId);
        addMessageToUI('bot', data.reply);
    } catch (error) {
        hideTyping(typingId);
        addMessageToUI('bot', "I'm having trouble connecting or validating your data.");
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