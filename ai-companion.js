// ============================================
// 🎬 MOVIEPAL - Your Friendly AI Movie Companion
// ============================================
// Perfect Layout • Menu System • Smart Responses

class MovieCompanionBot {
    constructor() {
        this.botName = "MoviePal";
        this.isOpen = false;
        this.moviesData = [];
        this.userName = "";
        this.conversationCount = 0;
        this.lastInteraction = Date.now();
        this.isDragging = false;
        this.waitingFor = null; // Track what user is waiting for
        
        this.init();
    }
    
    init() {
        console.log('🎬 MoviePal is initializing...');
        this.createBotInterface();
        this.loadMoviesFromGitHub();
        this.setupEventListeners();
        this.setupDraggable();
        console.log('✅ MoviePal is ready to chat!');
    }
    
    createBotInterface() {
        const botHTML = `
            <div class="moviepal-wrapper" id="moviepalWrapper">
                <!-- Chat Window -->
                <div class="moviepal-chat-window" id="moviepalChatWindow" style="display: none;">
                    <!-- Header -->
                    <div class="chat-header">
                        <div class="header-left">
                            <div class="bot-avatar-large">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="bot-info-detailed">
                                <div class="bot-name-status">
                                    <span class="bot-name-large">${this.botName}</span>
                                    <span class="online-indicator">
                                        <span class="online-dot"></span>
                                        Online
                                    </span>
                                </div>
                                <div class="bot-description">Your Personal Movie Assistant</div>
                            </div>
                        </div>
                        <div class="header-right">
                            <button class="chat-header-btn" id="moviepalClearChat" title="Clear conversation">
                                <i class="fas fa-broom"></i>
                            </button>
                            <button class="chat-header-btn" id="moviepalClose" title="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Messages Area -->
                    <div class="chat-messages" id="moviepalMessages">
                        <!-- Welcome message will be inserted here -->
                    </div>
                    
                    <!-- Input Area -->
                    <div class="chat-input-area">
                        <div class="input-wrapper">
                            <input 
                                type="text" 
                                class="chat-input" 
                                id="moviepalInput" 
                                placeholder="Type your message..."
                                autocomplete="off"
                            />
                        </div>
                        <button class="send-btn" id="moviepalSend">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                
                <!-- AI Icon Button -->
                <div class="moviepal-icon-container" id="moviepalIconContainer">
                    <div class="moviepal-icon-glow"></div>
                    <button class="moviepal-icon-btn" id="moviepalIconBtn">
                        <div class="icon-content">
                            <i class="fas fa-robot"></i>
                        </div>
                        <span class="icon-label">AI HELP</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', botHTML);
        this.addStyles();
    }
    
    addStyles() {
        const styles = `
            <style>
                /* ============================================ */
                /* MOVIEPAL - Premium AI Chat Bot Styles         */
                /* ============================================ */
                
                .moviepal-wrapper {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    z-index: 999;
                    font-family: 'Poppins', 'Segoe UI', sans-serif;
                }
                
                /* ============================================ */
                /* AI Icon Button                               */
                /* ============================================ */
                
                .moviepal-icon-container {
                    position: relative;
                    cursor: grab;
                    user-select: none;
                    z-index: 1000;
                }
                
                .moviepal-icon-container:active {
                    cursor: grabbing;
                }
                
                .moviepal-icon-glow {
                    position: absolute;
                    width: 65px;
                    height: 65px;
                    background: radial-gradient(circle, rgba(103, 126, 234, 0.4) 0%, transparent 70%);
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulseGlow 3s ease-in-out infinite;
                    pointer-events: none;
                }
                
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.15); }
                }
                
                .moviepal-icon-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: 3px solid rgba(255, 255, 255, 0.95);
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 25px rgba(103, 126, 234, 0.5);
                    transition: all 0.3s ease;
                    animation: gentlePulse 2s ease-in-out infinite;
                }
                
                @keyframes gentlePulse {
                    0%, 100% { box-shadow: 0 8px 25px rgba(103, 126, 234, 0.5); transform: scale(1); }
                    50% { box-shadow: 0 12px 35px rgba(103, 126, 234, 0.7); transform: scale(1.05); }
                }
                
                .moviepal-icon-btn:hover {
                    transform: scale(1.1);
                    animation: none;
                }
                
                .icon-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2px;
                }
                
                .icon-content .fa-robot {
                    font-size: 28px;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
                }
                
                .icon-label {
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 2px 5px;
                    border-radius: 8px;
                }
                
                /* ============================================ */
                /* Chat Window - Fixed Size & Position          */
                /* ============================================ */
                
                .moviepal-chat-window {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 380px;
                    height: 520px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: windowPop 0.3s ease;
                    border: 1px solid #e0e0e0;
                }
                
                @keyframes windowPop {
                    from { opacity: 0; transform: translateY(15px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                
                /* Chat Header */
                .chat-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .bot-avatar-large {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .bot-name-large {
                    font-size: 15px;
                    font-weight: 700;
                }
                
                .online-indicator {
                    font-size: 9px;
                    background: rgba(74, 222, 128, 0.2);
                    padding: 2px 6px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    margin-left: 6px;
                }
                
                .online-dot {
                    width: 5px;
                    height: 5px;
                    background: #4ade80;
                    border-radius: 50%;
                }
                
                .bot-description {
                    font-size: 10px;
                    opacity: 0.9;
                }
                
                .header-right {
                    display: flex;
                    gap: 4px;
                }
                
                .chat-header-btn {
                    background: rgba(255, 255, 255, 0.15);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                }
                
                .chat-header-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
                
                /* Messages Area */
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    background: #f5f7ff;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .chat-messages::-webkit-scrollbar {
                    width: 4px;
                }
                
                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(103, 126, 234, 0.3);
                    border-radius: 10px;
                }
                
                /* Message Styles */
                .message {
                    display: flex;
                    gap: 8px;
                    animation: messageSlideIn 0.3s ease;
                }
                
                @keyframes messageSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .user-message {
                    flex-direction: row-reverse;
                }
                
                .message-avatar-bot {
                    width: 30px;
                    height: 30px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .user-message .message-avatar-bot {
                    background: #e0e0e0;
                    color: #666;
                }
                
                .message-content-wrapper {
                    flex: 1;
                    max-width: 85%;
                }
                
                .message-bubble {
                    padding: 10px 12px;
                    border-radius: 14px;
                    word-wrap: break-word;
                }
                
                .bot-bubble {
                    background: white;
                    color: #353B48;
                    border-top-left-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                
                .user-bubble {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-top-right-radius: 4px;
                }
                
                .message-text {
                    font-size: 13px;
                    line-height: 1.5;
                }
                
                .message-time {
                    font-size: 9px;
                    opacity: 0.5;
                    margin-top: 3px;
                }
                
                /* Menu Options */
                .menu-options {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-top: 8px;
                }
                
                .menu-option {
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #353B48;
                }
                
                .menu-option:hover {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-color: transparent;
                    transform: translateX(3px);
                }
                
                .menu-option i {
                    width: 20px;
                    color: #667eea;
                }
                
                .menu-option:hover i {
                    color: white;
                }
                
                /* Movie Card */
                .movie-chat-card {
                    background: white;
                    border-radius: 10px;
                    padding: 10px;
                    margin-top: 6px;
                    border: 1px solid #e8e8e8;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                
                .movie-chat-card:hover {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }
                
                .movie-card-emoji {
                    font-size: 24px;
                }
                
                .movie-card-info {
                    flex: 1;
                }
                
                .movie-card-title {
                    font-weight: 600;
                    font-size: 13px;
                    margin-bottom: 2px;
                }
                
                .movie-card-details {
                    font-size: 10px;
                    opacity: 0.8;
                }
                
                .movie-card-category {
                    background: rgba(103, 126, 234, 0.1);
                    color: #667eea;
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 9px;
                    display: inline-block;
                    margin-top: 3px;
                }
                
                .movie-chat-card:hover .movie-card-category {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                /* Input Area */
                .chat-input-area {
                    padding: 10px 12px;
                    background: white;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-shrink: 0;
                }
                
                .input-wrapper {
                    flex: 1;
                    background: #f5f7ff;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    padding: 0 12px;
                }
                
                .input-wrapper:focus-within {
                    border-color: #667eea;
                }
                
                .chat-input {
                    width: 100%;
                    padding: 10px 0;
                    border: none;
                    background: transparent;
                    font-size: 13px;
                    outline: none;
                    font-family: 'Poppins', sans-serif;
                }
                
                .send-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                
                .send-btn:hover {
                    transform: scale(1.05);
                }
                
                /* Typing Indicator */
                .typing-indicator {
                    display: flex;
                    gap: 3px;
                    padding: 4px 0;
                }
                
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #667eea;
                    border-radius: 50%;
                    animation: typingBounce 1.4s infinite;
                }
                
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
                
                /* Contact Info Card */
                .contact-card {
                    background: linear-gradient(135deg, #f8f9ff, white);
                    border-radius: 10px;
                    padding: 12px;
                    margin-top: 6px;
                    border: 1px solid #e0e0e0;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 0;
                    font-size: 12px;
                }
                
                .contact-item i {
                    width: 20px;
                    color: #667eea;
                }
                
                /* Back Button */
                .back-btn {
                    background: #f0f0f0;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-top: 8px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .back-btn:hover {
                    background: #e0e0e0;
                }
                
                /* Mobile */
                @media (max-width: 768px) {
                    .moviepal-wrapper {
                        bottom: 80px;
                        right: 15px;
                    }
                    
                    .moviepal-chat-window {
                        width: 340px;
                        height: 480px;
                    }
                    
                    .moviepal-icon-btn {
                        width: 55px;
                        height: 55px;
                    }
                }
                
                @media (max-width: 380px) {
                    .moviepal-chat-window {
                        width: 300px;
                        height: 450px;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    setupDraggable() {
        const icon = document.getElementById('moviepalIconContainer');
        const wrapper = document.getElementById('moviepalWrapper');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const newLeft = startLeft + dx;
            const newTop = startTop + dy;
            
            const maxX = window.innerWidth - icon.offsetWidth - 20;
            const maxY = window.innerHeight - icon.offsetHeight - 20;
            
            const boundedLeft = Math.max(20, Math.min(newLeft, maxX));
            const boundedTop = Math.max(20, Math.min(newTop, maxY));
            
            wrapper.style.left = boundedLeft + 'px';
            wrapper.style.top = boundedTop + 'px';
            wrapper.style.right = 'auto';
            wrapper.style.bottom = 'auto';
        };
        
        const onMouseUp = () => {
            isDragging = false;
            icon.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        icon.addEventListener('mousedown', (e) => {
            isDragging = true;
            icon.style.cursor = 'grabbing';
            
            const rect = wrapper.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
    
    async loadMoviesFromGitHub() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Tartilpz/Tartilpz.github.io/main/movies.json');
            if (!response.ok) throw new Error('Could not load movies');
            const data = await response.json();
            this.moviesData = data.movies;
            console.log(`✅ Loaded ${this.moviesData.length} movies`);
        } catch (error) {
            console.log('⚠️ Using fallback data...');
            if (typeof allMovies !== 'undefined' && allMovies.length > 0) {
                this.moviesData = allMovies;
            } else {
                this.moviesData = [];
            }
        }
    }
    
    setupEventListeners() {
        const iconBtn = document.getElementById('moviepalIconBtn');
        const iconContainer = document.getElementById('moviepalIconContainer');
        const closeBtn = document.getElementById('moviepalClose');
        const clearBtn = document.getElementById('moviepalClearChat');
        const sendBtn = document.getElementById('moviepalSend');
        const input = document.getElementById('moviepalInput');
        const chatWindow = document.getElementById('moviepalChatWindow');
        
        iconBtn.addEventListener('click', () => {
            if (!this.isDragging) {
                this.isOpen = true;
                chatWindow.style.display = 'flex';
                iconContainer.style.display = 'none';
                this.showWelcomeMessage();
                input.focus();
            }
            this.isDragging = false;
        });
        
        closeBtn.addEventListener('click', () => {
            this.isOpen = false;
            chatWindow.style.display = 'none';
            iconContainer.style.display = 'block';
            this.waitingFor = null;
        });
        
        clearBtn.addEventListener('click', () => {
            this.showWelcomeMessage();
            this.waitingFor = null;
        });
        
        sendBtn.addEventListener('click', () => this.handleUserInput());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.isOpen = false;
                chatWindow.style.display = 'none';
                iconContainer.style.display = 'block';
                this.waitingFor = null;
            }
        });
    }
    
    showWelcomeMessage() {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        messagesContainer.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble bot-bubble">
                        <div class="message-text">
                            <strong>👋 Hey there! I'm MoviePal!</strong><br>
                            I'm here to help you find amazing movies and series. What would you like to do today?
                        </div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.showMainMenu();
        }, 300);
    }
    
    showMainMenu() {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const menuHTML = `
            <div class="message bot-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble bot-bubble">
                        <div class="message-text">
                            <div class="menu-options">
                                <div class="menu-option" data-action="new">
                                    <i class="fas fa-fire"></i> 🔥 New Released
                                </div>
                                <div class="menu-option" data-action="recommend">
                                    <i class="fas fa-star"></i> 🎯 Recommend Something
                                </div>
                                <div class="menu-option" data-action="find">
                                    <i class="fas fa-search"></i> 🔍 Find Movie
                                </div>
                                <div class="menu-option" data-action="request">
                                    <i class="fas fa-plus-circle"></i> 📝 Request Movie
                                </div>
                                <div class="menu-option" data-action="contact">
                                    <i class="fas fa-headset"></i> 📞 Contact With Admin
                                </div>
                            </div>
                        </div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', menuHTML);
        this.scrollToBottom();
        
        // Add click listeners to menu options
        document.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = option.dataset.action;
                this.handleMenuAction(action);
            });
        });
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'new':
                this.showNewReleases();
                break;
            case 'recommend':
                this.showRecommendations();
                break;
            case 'find':
                this.startFindMovie();
                break;
            case 'request':
                this.openRequestModal();
                break;
            case 'contact':
                this.showContactInfo();
                break;
        }
    }
    
    showNewReleases() {
        this.addUserMessage('New Released');
        
        const newMovies = this.moviesData
            .filter(m => m.isNew)
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
        
        setTimeout(() => {
            if (newMovies.length > 0) {
                this.addBotMessage(`Here are the 5 latest releases! 🔥`, false);
                setTimeout(() => this.addMovieCards(newMovies), 300);
            } else {
                this.addBotMessage(`No new releases found at the moment. Check back soon! 🎬`, true);
            }
            setTimeout(() => this.addBackToMenuButton(), 500);
        }, 800);
    }
    
    showRecommendations() {
        this.addUserMessage('Recommend Something');
        
        const shuffled = [...this.moviesData].sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, 3);
        
        setTimeout(() => {
            if (recommendations.length > 0) {
                this.addBotMessage(`Here are 3 movies/series I think you'll love! 🎯`, false);
                setTimeout(() => this.addMovieCards(recommendations), 300);
            } else {
                this.addBotMessage(`No recommendations available right now.`, true);
            }
            setTimeout(() => this.addBackToMenuButton(), 500);
        }, 800);
    }
    
    startFindMovie() {
        this.addUserMessage('Find Movie');
        this.waitingFor = 'find_movie';
        
        setTimeout(() => {
            this.addBotMessage(`Sure! 🎬 What movie or series are you looking for? Just type the title!`, true);
        }, 500);
    }
    
    openRequestModal() {
        this.addUserMessage('Request Movie');
        
        setTimeout(() => {
            this.addBotMessage(`Opening request form... 📝`, false);
            
            // Try to open the request modal
            if (typeof requestMovieBtn !== 'undefined') {
                requestMovieBtn.click();
            } else {
                document.getElementById('requestMovieBtn')?.click();
            }
            
            setTimeout(() => {
                document.getElementById('moviepalChatWindow').style.display = 'none';
                document.getElementById('moviepalIconContainer').style.display = 'block';
                this.isOpen = false;
            }, 500);
        }, 500);
    }
    
    showContactInfo() {
        this.addUserMessage('Contact With Admin');
        
        setTimeout(() => {
            const contactHTML = `
                <div class="contact-card">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span><strong>Phone:</strong> +880 1715-783544</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span><strong>Email:</strong> tartil.bdlink@gmail.com</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>Available:</strong> 24/7 Support</span>
                    </div>
                </div>
            `;
            
            this.addBotMessage(`Here's how you can reach the admin: 📞`, false);
            
            setTimeout(() => {
                const messagesContainer = document.getElementById('moviepalMessages');
                const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                const contactMsgHTML = `
                    <div class="message bot-message">
                        <div class="message-avatar-bot">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content-wrapper">
                            <div class="message-bubble bot-bubble">
                                <div class="message-text">${contactHTML}</div>
                                <div class="message-time">${time}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                messagesContainer.insertAdjacentHTML('beforeend', contactMsgHTML);
                this.scrollToBottom();
                setTimeout(() => this.addBackToMenuButton(), 300);
            }, 300);
        }, 500);
    }
    
    addBackToMenuButton() {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const backHTML = `
            <div class="message bot-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble bot-bubble">
                        <div class="message-text">
                            <button class="back-btn" id="backToMenuBtn">
                                <i class="fas fa-arrow-left"></i> Back to Main Menu
                            </button>
                        </div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', backHTML);
        this.scrollToBottom();
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.waitingFor = null;
            this.showMainMenu();
        });
    }
    
    handleUserInput() {
        const input = document.getElementById('moviepalInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addUserMessage(message);
        
        if (this.waitingFor === 'find_movie') {
            this.searchAndShowMovie(message);
        } else {
            // If not waiting for specific input, show menu
            setTimeout(() => {
                this.addBotMessage(`I didn't understand that. Let me show you the menu again:`, false);
                setTimeout(() => this.showMainMenu(), 300);
            }, 500);
        }
        
        input.value = '';
        this.waitingFor = null;
    }
    
    searchAndShowMovie(query) {
        const results = this.moviesData.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        
        setTimeout(() => {
            if (results.length > 0) {
                this.addBotMessage(`I found these matching your search: 🎬`, false);
                setTimeout(() => this.addMovieCards(results), 300);
            } else {
                this.addBotMessage(`Sorry, I couldn't find "${query}". Try another title or check back later! 😕`, true);
            }
            setTimeout(() => this.addBackToMenuButton(), 500);
        }, 800);
    }
    
    addUserMessage(message) {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const messageHTML = `
            <div class="message user-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble user-bubble">
                        <div class="message-text">${this.escapeHtml(message)}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }
    
    addBotMessage(message, showTyping = true) {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        if (showTyping) {
            const typingId = 'typing-' + Date.now();
            const typingHTML = `
                <div class="message bot-message" id="${typingId}">
                    <div class="message-avatar-bot">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-bubble bot-bubble">
                            <div class="typing-indicator">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
            this.scrollToBottom();
            
            setTimeout(() => {
                const typingElement = document.getElementById(typingId);
                if (typingElement) typingElement.remove();
                this.addBotMessageContent(message, time);
            }, 600 + Math.random() * 600);
        } else {
            this.addBotMessageContent(message, time);
        }
    }
    
    addBotMessageContent(message, time) {
        const messagesContainer = document.getElementById('moviepalMessages');
        
        const messageHTML = `
            <div class="message bot-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble bot-bubble">
                        <div class="message-text">${message}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }
    
    addMovieCards(movies) {
        const messagesContainer = document.getElementById('moviepalMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        let cardsHTML = `
            <div class="message bot-message">
                <div class="message-avatar-bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content-wrapper">
                    <div class="message-bubble bot-bubble">
                        <div class="message-text">
        `;
        
        movies.forEach(movie => {
            const emoji = movie.contentType === 'series' ? '📺' : '🎬';
            cardsHTML += `
                <div class="movie-chat-card" onclick="window.movieBot.openMovieById(${movie.id})">
                    <div class="movie-card-emoji">${emoji}</div>
                    <div class="movie-card-info">
                        <div class="movie-card-title">${this.escapeHtml(movie.title)}</div>
                        <div class="movie-card-details">${movie.year} • ${movie.category}</div>
                        <span class="movie-card-category">${movie.contentType === 'series' ? 'Series' : 'Movie'}</span>
                    </div>
                </div>
            `;
        });
        
        cardsHTML += `
                        </div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', cardsHTML);
        this.scrollToBottom();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('moviepalMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
    
    openMovieById(movieId) {
        if (typeof allMovies !== 'undefined') {
            const movie = allMovies.find(m => m.id === movieId);
            if (movie && typeof openMovieModal === 'function') {
                openMovieModal(movie);
                document.getElementById('moviepalChatWindow').style.display = 'none';
                document.getElementById('moviepalIconContainer').style.display = 'block';
                this.isOpen = false;
            }
        }
    }
}

// Initialize bot when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Starting MoviePal...');
    window.movieBot = new MovieCompanionBot();
});
