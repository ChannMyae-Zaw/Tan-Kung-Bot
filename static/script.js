document.addEventListener("DOMContentLoaded", () => {
    const sessionID = "tk-" + Math.random().toString(36).substring(2, 12);

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

            // 3. Replace Typing with Bot Bubble
            hideTyping(typingId);
            addMessageToUI('bot', data.reply);
        } catch (error) {
            hideTyping(typingId);
            addMessageToUI('bot', "I'm having trouble connecting to Google HQ.");
        }
    };

    function addMessageToUI(role, text) {
        const chatbox = document.getElementById('chatbox');
        const isBot = role === 'bot';
        const avatar = isBot ? "static/bot_avater.png" : "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";

        const html = `
            <div class="message-row ${isBot ? 'bot-row' : 'user-row'}">
                <img class="avatar" src="${avatar}">
                <div class="bubble ${isBot ? 'bot-bubble' : 'user-bubble'}">${text}</div>
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