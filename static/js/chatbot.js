/* ═══════════════════════════════════════════════════════════
   GEMINI AI CHATBOT - JavaScript Logic
   ═══════════════════════════════════════════════════════════ */

// Configuration
const CHATBOT_CONFIG = {
    apiKey: '', // Add your Gemini API key here
    model: 'gemini-2.5-flash-preview-09-2025',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    systemPrompt: 'Bạn là trợ lý AI thân thiện và chuyên nghiệp. Trả lời ngắn gọn, sử dụng Markdown cho code, luôn dùng tiếng Việt. Giúp người dùng với lập trình và học tập.'
};

// State
let chatbotState = {
    isOpen: false,
    isSending: false,
    selectedImage: null,
    messages: []
};

// DOM Elements
const chatbotElements = {
    toggleBtn: document.getElementById('chatbot-toggle'),
    window: document.getElementById('chatbot-window'),
    closeBtn: document.getElementById('chatbot-close'),
    messagesContainer: document.getElementById('chatbot-messages'),
    input: document.getElementById('chatbot-input'),
    sendBtn: document.getElementById('chatbot-send-btn'),
    imageUpload: document.getElementById('chatbot-image-upload'),
    imagePreview: document.getElementById('chatbot-image-preview'),
    previewImg: document.getElementById('chatbot-preview-img')
};

/**
 * Initialize Chatbot
 */
function initializeChatbot() {
    chatbotElements.toggleBtn?.addEventListener('click', toggleChatbot);
    chatbotElements.closeBtn?.addEventListener('click', toggleChatbot);
    chatbotElements.sendBtn?.addEventListener('click', sendChatbotMessage);
    chatbotElements.input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatbotMessage();
        }
    });
    chatbotElements.imageUpload?.addEventListener('change', handleChatbotImageUpload);
}

/**
 * Toggle Chat Window
 */
function toggleChatbot() {
    chatbotState.isOpen = !chatbotState.isOpen;
    
    if (chatbotState.isOpen) {
        chatbotElements.window.classList.remove('chatbot-hidden');
        chatbotElements.toggleBtn?.classList.add('active');
        chatbotElements.input?.focus();
    } else {
        chatbotElements.window.classList.add('chatbot-hidden');
        chatbotElements.toggleBtn?.classList.remove('active');
    }
}

/**
 * Handle Image Upload
 */
function handleChatbotImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target?.result?.split(',')[1];
        if (base64) {
            chatbotState.selectedImage = base64;
            displayChatbotImagePreview(event.target?.result);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Display Image Preview
 */
function displayChatbotImagePreview(src) {
    if (chatbotElements.previewImg) {
        chatbotElements.previewImg.src = src;
        chatbotElements.imagePreview?.classList.remove('chatbot-hidden');
    }
}

/**
 * Remove Image
 */
function removeChatbotImage() {
    chatbotState.selectedImage = null;
    chatbotElements.imagePreview?.classList.add('chatbot-hidden');
    if (chatbotElements.imageUpload) {
        chatbotElements.imageUpload.value = '';
    }
}

/**
 * Quick Ask
 */
async function quickChatbotAsk(text) {
    if (chatbotElements.input) {
        chatbotElements.input.value = text;
    }
    await sendChatbotMessage();
}

/**
 * Generate Roadmap
 */
function generateChatbotRoadmap() {
    const topic = prompt('Chủ đề bạn quan tâm? (VD: React, Python, etc)', 'Web Development');
    if (topic && chatbotElements.input) {
        chatbotElements.input.value = `Xây dựng lộ trình học ${topic} chi tiết và thực tế trong 8 tuần.`;
        sendChatbotMessage();
    }
}

/**
 * Add Message to Chat
 */
function addChatbotMessage(text, isUser = false, imageData = null) {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${isUser ? 'chatbot-message-user' : 'chatbot-message-ai'}`;
    
    if (!isUser) {
        messageEl.innerHTML = `
            <div class="chatbot-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-message-content">
                <div class="chatbot-message-bubble">${escapeHtml(text)}</div>
            </div>
        `;
    } else {
        let contentHtml = '';
        if (imageData) {
            contentHtml = `<img src="${imageData}" style="border-radius: 8px; margin-bottom: 8px; max-width: 100%; max-height: 150px;">`;
        }
        contentHtml += `<div class="chatbot-message-bubble">${escapeHtml(text)}</div>`;
        
        messageEl.innerHTML = `
            <div class="chatbot-message-content" style="text-align: right;">
                ${contentHtml}
            </div>
            <div class="chatbot-message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    }
    
    chatbotElements.messagesContainer?.appendChild(messageEl);
    scrollChatbotToBottom();
}

/**
 * Add Typing Indicator
 */
function addChatbotTyping() {
    const messageEl = document.createElement('div');
    messageEl.className = 'chatbot-message chatbot-message-ai';
    messageEl.id = 'chatbot-typing-indicator';
    messageEl.innerHTML = `
        <div class="chatbot-message-avatar">
            <i class="fas fa-sparkles"></i>
        </div>
        <div class="chatbot-message-content">
            <div class="chatbot-message-bubble">
                <div class="chatbot-typing">
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                    <div class="chatbot-typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    chatbotElements.messagesContainer?.appendChild(messageEl);
    scrollChatbotToBottom();
}

/**
 * Remove Typing Indicator
 */
function removeChatbotTyping() {
    const typing = document.getElementById('chatbot-typing-indicator');
    typing?.remove();
}

/**
 * Scroll to Bottom
 */
function scrollChatbotToBottom() {
    if (chatbotElements.messagesContainer) {
        setTimeout(() => {
            chatbotElements.messagesContainer.scrollTop = chatbotElements.messagesContainer.scrollHeight;
        }, 0);
    }
}

/**
 * Format Message with Markdown
 */
function formatChatbotMessage(text) {
    // Escape HTML first
    let formatted = escapeHtml(text);
    
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Call Gemini API
 */
async function callChatbotGemini(prompt, imageBase64 = null) {
    if (!CHATBOT_CONFIG.apiKey) {
        return 'Lỗi: Chưa cấu hình API key. Vui lòng thêm Gemini API key vào file chatbot.js';
    }

    const url = `${CHATBOT_CONFIG.apiUrl}/${CHATBOT_CONFIG.model}:generateContent?key=${CHATBOT_CONFIG.apiKey}`;
    
    const parts = [{ text: prompt }];
    
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
            }
        });
    }

    const payload = {
        contents: [{ parts }],
        systemInstruction: {
            parts: [{ text: CHATBOT_CONFIG.systemPrompt }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            return `Lỗi API: ${error.error?.message || 'Không xác định'}`;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi.';
    } catch (error) {
        console.error('Chatbot Error:', error);
        return 'Lỗi kết nối. Vui lòng thử lại.';
    }
}

/**
 * Send Message
 */
async function sendChatbotMessage() {
    const text = chatbotElements.input?.value?.trim();
    
    if (!text && !chatbotState.selectedImage) return;
    if (chatbotState.isSending) return;

    // Get image preview for display
    const imagePreview = chatbotState.selectedImage 
        ? chatbotElements.previewImg?.src 
        : null;

    // Add user message
    addChatbotMessage(text || '(Hình ảnh)', true, imagePreview);

    // Clear input
    if (chatbotElements.input) {
        chatbotElements.input.value = '';
    }
    removeChatbotImage();

    // Set sending state
    chatbotState.isSending = true;
    addChatbotTyping();

    try {
        // Call API
        const response = await callChatbotGemini(text, chatbotState.selectedImage);
        
        // Remove typing indicator
        removeChatbotTyping();
        
        // Format and display response
        const formatted = formatChatbotMessage(response);
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chatbot-message chatbot-message-ai';
        messageEl.innerHTML = `
            <div class="chatbot-message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-message-content">
                <div class="chatbot-message-bubble">${formatted}</div>
            </div>
        `;
        
        chatbotElements.messagesContainer?.appendChild(messageEl);
        scrollChatbotToBottom();
        
    } catch (error) {
        removeChatbotTyping();
        addChatbotMessage('Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.', false);
        console.error('Chatbot Error:', error);
    } finally {
        chatbotState.isSending = false;
        chatbotElements.input?.focus();
    }
}

/**
 * Verify API Key Status
 */
function verifyChatbotApiKey() {
    if (!CHATBOT_CONFIG.apiKey || CHATBOT_CONFIG.apiKey === '') {
        console.warn('⚠️ Chatbot: Chưa cấu hình Gemini API key. Hãy thêm key vào static/js/chatbot.js');
    } else {
        console.log('✅ Chatbot: API key đã được cấu hình.');
    }
}

/**
 * Initialize on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeChatbot();
    verifyChatbotApiKey();
});

// Support for dynamic loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeChatbot();
        verifyChatbotApiKey();
    });
} else {
    initializeChatbot();
    verifyChatbotApiKey();
}
