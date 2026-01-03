// GAMI P2P CHAT - Decentralized WebRTC Messaging
// File: /js/p2p_chat.js (Absolute Path)

class GAMIP2PChat {
    constructor() {
        this.systemName = "DECENTRALIZED_CHAT";
        this.version = "2.3.5";
        this.isInitialized = false;
        
        // WebRTC Configuration
        this.peerConnection = null;
        this.dataChannel = null;
        this.localPeerId = this.generatePeerId();
        this.remotePeerId = null;
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        
        // ICE Servers Configuration
        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };
        
        // User Management
        this.users = new Map();
        this.currentUser = {
            id: this.localPeerId,
            name: this.generateUsername(),
            color: this.generateColor(),
            status: 'ONLINE',
            lastSeen: Date.now(),
            isOwner: true
        };
        
        // Chat Rooms
        this.chatRooms = new Map();
        this.activeRoom = null;
        
        // AI Story System
        this.aiStories = [
            {
                id: 'story_1',
                title: 'The Quantum Merchant',
                content: 'In the prismatic markets of GAMI, a merchant discovered coins that multiplied when observed. Each transaction created parallel economies...',
                author: 'PRISM AI',
                timestamp: Date.now() - 86400000,
                tags: ['quantum', 'economy', 'parallel']
            },
            {
                id: 'story_2',
                title: 'The Liquid Architect',
                content: 'An architect built structures of pure light and glass that flowed like water. His buildings adapted to thoughts, reshaping reality itself...',
                author: 'PRISM AI',
                timestamp: Date.now() - 172800000,
                tags: ['architecture', 'liquid', 'reality']
            },
            {
                id: 'story_3',
                title: 'The AI Gardener',
                content: 'In the digital gardens of GAMI, an AI cultivated ideas that grew into functioning code. Each thought-bloom became a new feature...',
                author: 'PRISM AI',
                timestamp: Date.now() - 259200000,
                tags: ['garden', 'ideas', 'growth']
            }
        ];
        
        // Message Storage
        this.messages = new Map(); // roomId -> messages array
        this.unreadCount = 0;
        
        // UI Elements
        this.ui = {
            container: null,
            isOpen: false,
            searchInput: null,
            chatList: null,
            messageArea: null,
            inputArea: null
        };
        
        // Performance
        this.performance = {
            lastPing: 0,
            connectionQuality: 100,
            messageCount: 0
        };
        
        // Initialize
        this.initialize();
    }

    // ============ INITIALIZATION ============
    
    initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Create chat interface
        this.createChatInterface();
        
        // Setup WebRTC
        this.setupWebRTC();
        
        // Load chat history
        this.loadChatHistory();
        
        // Add to main menu
        this.addToMainMenu();
        
        // Start connection monitoring
        this.startConnectionMonitor();
        
        this.isInitialized = true;
        console.log(`${this.systemName} v${this.version} initialized`);
        console.log(`Peer ID: ${this.localPeerId}`);
        console.log(`Username: ${this.currentUser.name}`);
    }

    // ============ WEBRTC SETUP ============
    
    setupWebRTC() {
        // Initialize PeerConnection with modern configuration
        const config = {
            ...this.iceServers,
            sdpSemantics: 'unified-plan',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        };
        
        try {
            this.peerConnection = new RTCPeerConnection(config);
            
            // Setup data channel for messaging
            this.setupDataChannel();
            
            // Setup ICE candidate handling
            this.setupICECandidates();
            
            // Setup connection state monitoring
            this.setupConnectionMonitoring();
            
        } catch (error) {
            console.error('WebRTC setup failed:', error);
            this.fallbackToLocalMode();
        }
    }

    setupDataChannel() {
        // Create reliable data channel for messages
        this.dataChannel = this.peerConnection.createDataChannel('chat', {
            ordered: true,
            maxRetransmits: 10
        });
        
        this.dataChannel.binaryType = 'arraybuffer';
        
        // Setup data channel event handlers
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.updateConnectionStatus('CONNECTED');
            this.sendSystemMessage('Connection established');
        };
        
        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.updateConnectionStatus('DISCONNECTED');
        };
        
        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            this.updateConnectionStatus('ERROR');
        };
        
        this.dataChannel.onmessage = (event) => {
            this.handleIncomingMessage(event.data);
        };
        
        // Also handle incoming data channels
        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            this.setupIncomingDataChannel(channel);
        };
    }

    setupIncomingDataChannel(channel) {
        channel.onopen = () => {
            console.log('Incoming data channel opened');
            this.dataChannels.set(channel.label, channel);
            this.updateConnectionStatus('CONNECTED');
        };
        
        channel.onmessage = (event) => {
            this.handleIncomingMessage(event.data);
        };
        
        channel.onclose = () => {
            console.log('Incoming data channel closed');
            this.dataChannels.delete(channel.label);
            if (this.dataChannels.size === 0) {
                this.updateConnectionStatus('DISCONNECTED');
            }
        };
    }

    setupICECandidates() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // Send ICE candidate to remote peer (in real implementation)
                this.sendICECandidate(event.candidate);
            }
        };
        
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        };
    }

    setupConnectionMonitoring() {
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('Connection state:', state);
            
            switch (state) {
                case 'connected':
                    this.updateConnectionStatus('CONNECTED');
                    break;
                case 'disconnected':
                case 'failed':
                    this.updateConnectionStatus('DISCONNECTED');
                    break;
                case 'closed':
                    this.updateConnectionStatus('CLOSED');
                    break;
            }
        };
    }

    // ============ PEER CONNECTION MANAGEMENT ============
    
    async connectToPeer(remotePeerId) {
        if (this.remotePeerId === remotePeerId) {
            console.log('Already connected to this peer');
            return;
        }
        
        this.remotePeerId = remotePeerId;
        
        try {
            // Create offer
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
            });
            
            await this.peerConnection.setLocalDescription(offer);
            
            // In real implementation, send offer to remote peer via signaling server
            // For P2P demo, we'll simulate connection
            this.simulatePeerConnection(remotePeerId);
            
            console.log('Connection offer created for peer:', remotePeerId);
            
        } catch (error) {
            console.error('Failed to create connection:', error);
            this.updateConnectionStatus('ERROR');
        }
    }

    async acceptConnection(offer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            // Send answer back to remote peer
            console.log('Connection accepted with answer');
            
        } catch (error) {
            console.error('Failed to accept connection:', error);
        }
    }

    sendICECandidate(candidate) {
        // In real implementation, send ICE candidate to remote peer
        console.log('ICE candidate generated:', candidate);
    }

    simulatePeerConnection(remotePeerId) {
        // Simulate successful connection for demo
        setTimeout(() => {
            this.updateConnectionStatus('CONNECTED');
            this.addUser({
                id: remotePeerId,
                name: this.generateUsername(),
                color: this.generateColor(),
                status: 'ONLINE',
                lastSeen: Date.now()
            });
            
            this.sendSystemMessage(`Connected to ${remotePeerId.substring(0, 8)}`);
        }, 1000);
    }

    fallbackToLocalMode() {
        console.log('Falling back to local chat mode');
        this.updateConnectionStatus('LOCAL_MODE');
        
        // Add some demo users
        this.addDemoUsers();
    }

    // ============ MESSAGE HANDLING ============
    
    sendMessage(content, type = 'text') {
        const message = {
            id: this.generateMessageId(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            senderColor: this.currentUser.color,
            content: content,
            type: type,
            timestamp: Date.now(),
            roomId: this.activeRoom,
            status: 'SENDING'
        };
        
        // Add to local storage
        this.addMessageToRoom(this.activeRoom, message);
        
        // Update UI
        this.displayMessage(message);
        
        // Send via WebRTC if connected
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            try {
                const encoded = this.encodeMessage(message);
                this.dataChannel.send(encoded);
                message.status = 'SENT';
                this.updateMessageStatus(message.id, 'SENT');
            } catch (error) {
                console.error('Failed to send message:', error);
                message.status = 'FAILED';
                this.updateMessageStatus(message.id, 'FAILED');
            }
        } else {
            // Store for later sending
            message.status = 'PENDING';
            this.storePendingMessage(message);
        }
        
        // Auto-reply for demo
        if (type === 'text') {
            this.simulateAIResponse(content);
        }
        
        return message;
    }

    handleIncomingMessage(data) {
        try {
            const message = this.decodeMessage(data);
            
            // Update user last seen
            this.updateUserStatus(message.senderId, 'ONLINE');
            
            // Add message to room
            this.addMessageToRoom(message.roomId || 'general', message);
            
            // Display message
            this.displayMessage(message);
            
            // Notification for new message
            if (!this.ui.isOpen) {
                this.incrementUnreadCount();
                this.showNotification(message);
            }
            
            // Update performance stats
            this.performance.messageCount++;
            
        } catch (error) {
            console.error('Failed to handle incoming message:', error);
        }
    }

    encodeMessage(message) {
        return JSON.stringify(message);
    }

    decodeMessage(data) {
        return JSON.parse(data);
    }

    simulateAIResponse(userMessage) {
        // AI responses based on message content
        const responses = {
            greeting: ['Hello! I\'m the PRISM AI. How can I assist with your GAMI journey?', 
                      'Greetings! The prismatic markets are active today.', 
                      'Welcome back to the decentralized network.'],
            question: ['Interesting question. Let me consult the quantum ledger...', 
                      'The answer lies in the liquid architecture of GAMI.', 
                      'According to the AI brain, that requires further analysis.'],
            economy: ['The economy is flowing like liquid glass today.', 
                     'Coins are multiplying in the quantum field.', 
                     'Market efficiency is at 98.7%.'],
            help: ['I can help with: connections, messaging, AI stories, and system info.', 
                  'Available commands: /users, /stories, /status, /clear', 
                  'Need assistance? Try asking about specific features.']
        };
        
        const message = userMessage.toLowerCase();
        let responseType = 'general';
        
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            responseType = 'greeting';
        } else if (message.includes('?')) {
            responseType = 'question';
        } else if (message.includes('coin') || message.includes('economy') || message.includes('money')) {
            responseType = 'economy';
        } else if (message.includes('help')) {
            responseType = 'help';
        }
        
        const possibleResponses = responses[responseType] || responses.greeting;
        const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
        
        setTimeout(() => {
            this.sendAIStoryResponse(response);
        }, 1000 + Math.random() * 2000);
    }

    sendAIStoryResponse(content) {
        const message = {
            id: this.generateMessageId(),
            senderId: 'ai_prism',
            senderName: 'PRISM AI',
            senderColor: '#9D4EDD',
            content: content,
            type: 'ai_response',
            timestamp: Date.now(),
            roomId: this.activeRoom,
            status: 'SENT',
            isAI: true
        };
        
        this.addMessageToRoom(this.activeRoom, message);
        this.displayMessage(message);
    }

    // ============ USER MANAGEMENT ============
    
    addUser(userData) {
        const user = {
            id: userData.id,
            name: userData.name,
            color: userData.color || this.generateColor(),
            status: userData.status || 'ONLINE',
            lastSeen: userData.lastSeen || Date.now(),
            isOwner: userData.id === this.currentUser.id
        };
        
        this.users.set(user.id, user);
        this.updateUserList();
        
        return user;
    }

    updateUserStatus(userId, status) {
        const user = this.users.get(userId);
        if (user) {
            user.status = status;
            user.lastSeen = Date.now();
            this.updateUserList();
        }
    }

    addDemoUsers() {
        const demoUsers = [
            { id: 'demo_1', name: 'ALFAZ', color: '#FFD700', status: 'ONLINE' },
            { id: 'demo_2', name: 'QUANTUM', color: '#06D6A0', status: 'TYPING' },
            { id: 'demo_3', name: 'NEXUS', color: '#4A90E2', status: 'ONLINE' },
            { id: 'demo_4', name: 'CHRONOS', color: '#EF476F', status: 'AWAY' },
            { id: 'demo_5', name: 'SIGMA', color: '#9D4EDD', status: 'ONLINE' }
        ];
        
        demoUsers.forEach(user => this.addUser(user));
        
        // Add some demo messages
        setTimeout(() => {
            this.addDemoMessages();
        }, 500);
    }

    addDemoMessages() {
        const demoMessages = [
            {
                senderId: 'demo_1',
                senderName: 'ALFAZ',
                senderColor: '#FFD700',
                content: 'The quantum markets are surging today!',
                type: 'text'
            },
            {
                senderId: 'ai_prism',
                senderName: 'PRISM AI',
                senderColor: '#9D4EDD',
                content: 'Market analysis complete: 98.7% efficiency in prismatic transactions.',
                type: 'ai_response'
            },
            {
                senderId: 'demo_2',
                senderName: 'QUANTUM',
                senderColor: '#06D6A0',
                content: 'Just optimized my worker AI network. Efficiency +23%!',
                type: 'text'
            },
            {
                senderId: 'demo_3',
                senderName: 'NEXUS',
                senderColor: '#4A90E2',
                content: 'Anyone tried the new liquid architecture in World 3D?',
                type: 'text'
            }
        ];
        
        demoMessages.forEach(msg => {
            const message = {
                ...msg,
                id: this.generateMessageId(),
                timestamp: Date.now() - Math.random() * 3600000,
                roomId: 'general',
                status: 'SENT'
            };
            
            this.addMessageToRoom('general', message);
        });
        
        this.updateChatList();
    }

    // ============ CHAT INTERFACE ============
    
    createChatInterface() {
        // Create main container
        this.ui.container = document.createElement('div');
        this.ui.container.className = 'p2p-chat-container';
        this.ui.container.style.cssText = `
            position: fixed;
            top: 0;
            right: -500px;
            width: 450px;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(30px);
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            z-index: 1000;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            box-shadow: -20px 0 40px rgba(0, 0, 0, 0.2);
        `;
        
        // Chat header with user info
        this.ui.container.innerHTML = `
            <div class="chat-header">
                <div class="header-left">
                    <div class="user-info">
                        <div class="user-avatar" style="background: ${this.currentUser.color}">
                            ${this.currentUser.name.charAt(0)}
                        </div>
                        <div class="user-details">
                            <div class="user-name">${this.currentUser.name}</div>
                            <div class="user-status" id="connectionStatus">
                                <span class="status-dot"></span>
                                CONNECTING
                            </div>
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <button class="header-btn" id="searchToggle">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M21,21 L16,16" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="header-btn" id="newChatBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M12,5 L12,19 M5,12 L19,12" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="header-btn" id="closeChatBtn">&times;</button>
                </div>
            </div>
            
            <div class="search-container" id="searchContainer" style="display: none;">
                <div class="search-input-wrapper">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M21,21 L16,16" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <input type="text" class="search-input" id="chatSearchInput" placeholder="Search messages, users, stories...">
                    <button class="search-clear" id="searchClearBtn">&times;</button>
                </div>
                <div class="search-results" id="searchResults"></div>
            </div>
            
            <div class="chat-main">
                <div class="sidebar">
                    <div class="sidebar-section">
                        <div class="section-title">DIRECT MESSAGES</div>
                        <div class="user-list" id="userList"></div>
                    </div>
                    <div class="sidebar-section">
                        <div class="section-title">AI STORIES</div>
                        <div class="stories-list" id="storiesList"></div>
                    </div>
                    <div class="sidebar-section">
                        <div class="section-title">CHAT ROOMS</div>
                        <div class="rooms-list" id="roomsList"></div>
                    </div>
                </div>
                
                <div class="chat-area">
                    <div class="chat-messages" id="chatMessages">
                        <div class="welcome-message">
                            <div class="welcome-icon">
                                <svg width="48" height="48" viewBox="0 0 100 100">
                                    <path d="M50,20 L80,35 L80,65 L50,80 L20,65 L20,35 Z" 
                                          fill="none" stroke="#4A90E2" stroke-width="3"/>
                                    <path d="M35,50 L65,50 M50,35 L50,65" 
                                          fill="none" stroke="#4A90E2" stroke-width="2"/>
                                </svg>
                            </div>
                            <h3>P2P CHAT READY</h3>
                            <p>Decentralized messaging powered by WebRTC</p>
                            <div class="welcome-stats">
                                <div class="stat">Peers: <span id="peerCount">0</span></div>
                                <div class="stat">Messages: <span id="messageCount">0</span></div>
                                <div class="stat">Uptime: <span id="uptime">0s</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="message-input-area">
                        <div class="input-tools">
                            <button class="tool-btn" title="Format">
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M5,4 L19,4 M7,8 L17,8 M5,12 L19,12 M9,16 L15,16" 
                                          fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="tool-btn" title="Attach">
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M21,10 L21,20 A2,2 0 0,1 19,22 L5,22 A2,2 0 0,1 3,20 L3,4 A2,2 0 0,1 5,2 L16,2" 
                                          fill="none" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="8.5" cy="8.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
                                    <path d="M21,15 L16,10" fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="tool-btn" title="AI Help">
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M12,2 L22,8 L22,16 L12,22 L2,16 L2,8 Z" 
                                          fill="none" stroke="currentColor" stroke-width="2"/>
                                    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                        <div class="message-input-wrapper">
                            <textarea class="message-input" id="messageInput" 
                                      placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                                      rows="1"></textarea>
                            <button class="send-btn" id="sendMessageBtn">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22,2 L11,13 M22,2 L15,22 L11,13 L2,9 L22,2 Z" 
                                          fill="none" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                        <div class="input-status">
                            <span id="typingIndicator"></span>
                            <span class="char-count" id="charCount">0/1000</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.ui.container);
        
        // Add chat styles
        this.addChatStyles();
        
        // Setup event listeners
        this.setupChatEvents();
        
        // Initialize components
        this.updateUserList();
        this.updateStoriesList();
        this.updateRoomsList();
    }

    addChatStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .p2p-chat-container {
                font-family: 'SF Pro Display', -apple-system, sans-serif;
                color: #333;
            }
            
            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .user-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'SF Mono', monospace;
                font-weight: 700;
                font-size: 16px;
                color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .user-details {
                display: flex;
                flex-direction: column;
            }
            
            .user-name {
                font-family: 'SF Mono', monospace;
                font-weight: 700;
                font-size: 16px;
                color: #333;
                letter-spacing: 1px;
            }
            
            .user-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                color: #666;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #FFD700;
                animation: pulse 2s infinite;
            }
            
            .status-dot.connected { background: #06D6A0; }
            .status-dot.disconnected { background: #EF476F; }
            .status-dot.connecting { background: #FFD700; }
            
            .header-right {
                display: flex;
                gap: 8px;
            }
            
            .header-btn {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.05);
                border: none;
                border-radius: 50%;
                color: #666;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .header-btn:hover {
                background: rgba(0, 0, 0, 0.1);
                transform: scale(1.1);
            }
            
            .header-btn svg {
                width: 18px;
                height: 18px;
            }
            
            .search-container {
                padding: 12px 20px;
                background: rgba(0, 0, 0, 0.03);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                color: #999;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 40px 10px 40px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                font-family: 'SF Pro Display', sans-serif;
                font-size: 14px;
                color: #333;
                outline: none;
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                border-color: #4A90E2;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
            }
            
            .search-clear {
                position: absolute;
                right: 10px;
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                font-size: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chat-main {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .sidebar {
                width: 200px;
                background: rgba(0, 0, 0, 0.02);
                border-right: 1px solid rgba(0, 0, 0, 0.1);
                overflow-y: auto;
                padding: 16px;
            }
            
            .sidebar-section {
                margin-bottom: 24px;
            }
            
            .section-title {
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                color: #666;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-bottom: 12px;
                padding-bottom: 6px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .user-list, .stories-list, .rooms-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .user-item, .story-item, .room-item {
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .user-item:hover, .story-item:hover, .room-item:hover {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .user-item.active {
                background: rgba(74, 144, 226, 0.1);
                border: 1px solid rgba(74, 144, 226, 0.3);
            }
            
            .user-avatar-small {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'SF Mono', monospace;
                font-weight: 700;
                font-size: 14px;
                color: white;
            }
            
            .user-info-small {
                flex: 1;
            }
            
            .user-name-small {
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                font-weight: 600;
                color: #333;
            }
            
            .user-status-small {
                font-size: 10px;
                color: #666;
            }
            
            .story-item {
                padding: 12px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }
            
            .story-title {
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }
            
            .story-author {
                font-size: 10px;
                color: #666;
            }
            
            .room-item {
                padding: 10px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }
            
            .room-name {
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                font-weight: 600;
                color: #333;
            }
            
            .room-count {
                font-size: 10px;
                color: #666;
                margin-left: auto;
            }
            
            .chat-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: rgba(0, 0, 0, 0.01);
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .welcome-message {
                text-align: center;
                padding: 40px 20px;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .welcome-icon {
                margin-bottom: 20px;
            }
            
            .welcome-message h3 {
                font-family: 'SF Mono', monospace;
                font-size: 20px;
                font-weight: 700;
                color: #333;
                letter-spacing: 2px;
                margin-bottom: 12px;
            }
            
            .welcome-message p {
                font-size: 14px;
                color: #666;
                line-height: 1.5;
                margin-bottom: 24px;
            }
            
            .welcome-stats {
                display: flex;
                justify-content: center;
                gap: 24px;
            }
            
            .welcome-stats .stat {
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                color: #666;
            }
            
            .welcome-stats .stat span {
                font-weight: 700;
                color: #333;
            }
            
            /* Glass Message Bubbles */
            .message-bubble {
                max-width: 70%;
                position: relative;
                animation: messageAppear 0.3s ease;
            }
            
            .message-bubble.own {
                align-self: flex-end;
            }
            
            .message-bubble.other {
                align-self: flex-start;
            }
            
            .message-bubble.ai {
                align-self: center;
                max-width: 85%;
            }
            
            .message-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            
            .message-sender {
                font-family: 'SF Mono', monospace;
                font-weight: 700;
                font-size: 12px;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .message-sender.owner {
                text-shadow: 0 0 10px currentColor;
                animation: ownerGlow 2s infinite alternate;
            }
            
            .message-time {
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                color: #666;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .message-bubble:hover .message-time {
                opacity: 1;
            }
            
            .message-content {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 18px;
                padding: 14px 18px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }
            
            .message-content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%,
                    rgba(255, 255, 255, 0.05) 50%,
                    rgba(255, 255, 255, 0.1) 100%);
                pointer-events: none;
            }
            
            .message-bubble.own .message-content {
                background: rgba(74, 144, 226, 0.1);
                border-color: rgba(74, 144, 226, 0.3);
            }
            
            .message-bubble.ai .message-content {
                background: rgba(157, 78, 221, 0.1);
                border-color: rgba(157, 78, 221, 0.3);
            }
            
            .message-text {
                font-size: 14px;
                line-height: 1.5;
                color: #333;
                word-wrap: break-word;
                white-space: pre-wrap;
            }
            
            .message-status {
                position: absolute;
                bottom: 4px;
                right: 10px;
                font-size: 10px;
                color: #666;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .message-input-area {
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .input-tools {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .tool-btn {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.05);
                border: none;
                border-radius: 6px;
                color: #666;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .tool-btn:hover {
                background: rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .message-input-wrapper {
                position: relative;
                display: flex;
                align-items: flex-end;
                gap: 12px;
            }
            
            .message-input {
                flex: 1;
                min-height: 44px;
                max-height: 120px;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                font-family: 'SF Pro Display', sans-serif;
                font-size: 14px;
                color: #333;
                resize: none;
                outline: none;
                transition: all 0.3s ease;
            }
            
            .message-input:focus {
                border-color: #4A90E2;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
            }
            
            .send-btn {
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #4A90E2;
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .send-btn:hover {
                background: #3a80d6;
                transform: scale(1.1);
            }
            
            .send-btn:active {
                transform: scale(0.95);
            }
            
            .input-status {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 12px;
                color: #666;
            }
            
            .char-count {
                font-family: 'SF Mono', monospace;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes ownerGlow {
                0% { text-shadow: 0 0 10px currentColor; }
                100% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
            }
            
            @keyframes messageAppear {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .search-results {
                max-height: 300px;
                overflow-y: auto;
                margin-top: 12px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .search-result-item {
                padding: 12px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                cursor: pointer;
            }
            
            .search-result-item:hover {
                background: rgba(0, 0, 0, 0.05);
            }
            
            .search-result-type {
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            
            .search-result-content {
                font-size: 14px;
                color: #333;
            }
            
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #666;
            }
            
            .typing-dots {
                display: flex;
                gap: 2px;
            }
            
            .typing-dot {
                width: 4px;
                height: 4px;
                background: #666;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-4px); }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupChatEvents() {
        // Close button
        const closeBtn = document.getElementById('closeChatBtn');
        closeBtn.addEventListener('click', () => this.closeChat());
        
        // Search toggle
        const searchToggle = document.getElementById('searchToggle');
        searchToggle.addEventListener('click', () => this.toggleSearch());
        
        // Search input
        const searchInput = document.getElementById('chatSearchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Search clear
        const searchClear = document.getElementById('searchClearBtn');
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
        });
        
        // New chat button
        const newChatBtn = document.getElementById('newChatBtn');
        newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', (e) => {
            this.updateCharCount(e.target.value.length);
            this.handleTyping();
        });
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessageFromInput();
            }
        });
        
        // Send button
        const sendBtn = document.getElementById('sendMessageBtn');
        sendBtn.addEventListener('click', () => this.sendMessageFromInput());
        
        // AI Help button
        const aiHelpBtn = document.querySelector('.tool-btn[title="AI Help"]');
        aiHelpBtn.addEventListener('click', () => this.showAIHelp());
    }

    // ============ CHAT UI UPDATES ============
    
    updateUserList() {
        const userList = document.getElementById('userList');
        if (!userList) return;
        
        userList.innerHTML = '';
        
        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = `user-item ${user.id === this.currentUser.id ? 'active' : ''}`;
            userItem.dataset.userId = user.id;
            
            const statusClass = user.status.toLowerCase();
            const statusText = user.status === 'ONLINE' ? 'Active' : 
                             user.status === 'TYPING' ? 'Typing...' : 'Away';
            
            userItem.innerHTML = `
                <div class="user-avatar-small" style="background: ${user.color}">
                    ${user.name.charAt(0)}
                </div>
                <div class="user-info-small">
                    <div class="user-name-small">${user.name}</div>
                    <div class="user-status-small">${statusText}</div>
                </div>
                ${user.isOwner ? '<div class="owner-badge" title="Chat Owner">★</div>' : ''}
            `;
            
            userItem.addEventListener('click', () => this.selectUser(user.id));
            userList.appendChild(userItem);
        });
    }

    updateStoriesList() {
        const storiesList = document.getElementById('storiesList');
        if (!storiesList) return;
        
        storiesList.innerHTML = '';
        
        this.aiStories.forEach(story => {
            const storyItem = document.createElement('div');
            storyItem.className = 'story-item';
            storyItem.dataset.storyId = story.id;
            
            const timeAgo = this.formatTimeAgo(story.timestamp);
            
            storyItem.innerHTML = `
                <div class="story-title">${story.title}</div>
                <div class="story-author">${story.author} • ${timeAgo}</div>
            `;
            
            storyItem.addEventListener('click', () => this.showStory(story));
            storiesList.appendChild(storyItem);
        });
    }

    updateRoomsList() {
        const roomsList = document.getElementById('roomsList');
        if (!roomsList) return;
        
        roomsList.innerHTML = '';
        
        // Default rooms
        const defaultRooms = [
            { id: 'general', name: 'GENERAL', userCount: this.users.size, isDefault: true },
            { id: 'trading', name: 'TRADING', userCount: Math.floor(this.users.size * 0.6), isDefault: true },
            { id: 'development', name: 'DEV', userCount: Math.floor(this.users.size * 0.3), isDefault: true }
        ];
        
        defaultRooms.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = `room-item ${room.id === this.activeRoom ? 'active' : ''}`;
            roomItem.dataset.roomId = room.id;
            
            roomItem.innerHTML = `
                <div class="room-name">#${room.name}</div>
                <div class="room-count">${room.userCount}</div>
            `;
            
            roomItem.addEventListener('click', () => this.selectRoom(room.id));
            roomsList.appendChild(roomItem);
        });
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        // Remove welcome message if it's the first real message
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage && this.messages.size > 0) {
            welcomeMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message-bubble ${
            message.senderId === this.currentUser.id ? 'own' :
            message.senderId === 'ai_prism' ? 'ai' : 'other'
        }`;
        messageElement.dataset.messageId = message.id;
        
        const timeString = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isOwner = this.currentUser.id === message.senderId;
        
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-sender ${isOwner ? 'owner' : ''}" 
                     style="color: ${message.senderColor}">
                    ${message.senderName}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message.content)}</div>
                ${message.senderId === this.currentUser.id ? `
                    <div class="message-status">
                        ${message.status === 'SENT' ? '✓' : 
                          message.status === 'SENDING' ? '↻' : 
                          message.status === 'FAILED' ? '✗' : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Update message count
        this.updateMessageCount();
    }

    updateMessageStatus(messageId, status) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                statusElement.textContent = status === 'SENT' ? '✓' : 
                                          status === 'SENDING' ? '↻' : 
                                          status === 'FAILED' ? '✗' : '';
            }
        }
    }

    // ============ CHAT CONTROLS ============
    
    sendMessageFromInput() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();
        
        if (content) {
            this.sendMessage(content);
            input.value = '';
            input.style.height = 'auto';
            this.updateCharCount(0);
        }
    }

    updateCharCount(length) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = `${length}/1000`;
            
            if (length > 900) {
                charCount.style.color = '#EF476F';
            } else if (length > 750) {
                charCount.style.color = '#FFD166';
            } else {
                charCount.style.color = '#666';
            }
        }
    }

    handleTyping() {
        // Update current user status to typing
        this.updateUserStatus(this.currentUser.id, 'TYPING');
        
        // Clear typing status after delay
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.updateUserStatus(this.currentUser.id, 'ONLINE');
        }, 1000);
    }

    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;
        
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }
        
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        // Search in messages
        this.messages.forEach((roomMessages, roomId) => {
            roomMessages.forEach(msg => {
                if (msg.content.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: 'MESSAGE',
                        content: msg.content,
                        sender: msg.senderName,
                        timestamp: msg.timestamp,
                        roomId: roomId
                    });
                }
            });
        });
        
        // Search in users
        this.users.forEach(user => {
            if (user.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'USER',
                    content: user.name,
                    status: user.status,
                    color: user.color
                });
            }
        });
        
        // Search in AI stories
        this.aiStories.forEach(story => {
            if (story.title.toLowerCase().includes(lowerQuery) || 
                story.content.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'STORY',
                    content: story.title,
                    excerpt: story.content.substring(0, 100) + '...',
                    author: story.author
                });
            }
        });
        
        // Display results
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }
        
        results.slice(0, 10).forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            let content = '';
            switch (result.type) {
                case 'MESSAGE':
                    content = `${result.sender}: ${result.content}`;
                    break;
                case 'USER':
                    content = `User: ${result.content} (${result.status})`;
                    break;
                case 'STORY':
                    content = `Story: ${result.content}`;
                    break;
            }
            
            resultItem.innerHTML = `
                <div class="search-result-type">${result.type}</div>
                <div class="search-result-content">${content}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                this.handleSearchResultClick(result);
            });
            
            searchResults.appendChild(resultItem);
        });
    }

    handleSearchResultClick(result) {
        switch (result.type) {
            case 'MESSAGE':
                this.selectRoom(result.roomId);
                // Scroll to message
                break;
            case 'USER':
                this.selectUser(result.content);
                break;
            case 'STORY':
                const story = this.aiStories.find(s => s.title === result.content);
                if (story) this.showStory(story);
                break;
        }
        
        this.toggleSearch();
    }

    // ============ CHAT MANAGEMENT ============
    
    selectUser(userId) {
        const user = this.users.get(userId);
        if (!user) return;
        
        // Create or select DM room
        const roomId = `dm_${[this.currentUser.id, userId].sort().join('_')}`;
        this.selectRoom(roomId);
        
        // Update active user highlight
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (userItem) userItem.classList.add('active');
    }

    selectRoom(roomId) {
        this.activeRoom = roomId;
        
        // Update room highlight
        document.querySelectorAll('.room-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const roomItem = document.querySelector(`[data-room-id="${roomId}"]`);
        if (roomItem) roomItem.classList.add('active');
        
        // Load room messages
        this.displayRoomMessages(roomId);
    }

    addMessageToRoom(roomId, message) {
        if (!this.messages.has(roomId)) {
            this.messages.set(roomId, []);
        }
        
        const roomMessages = this.messages.get(roomId);
        roomMessages.push(message);
        
        // Keep only last 100 messages per room
        if (roomMessages.length > 100) {
            roomMessages.shift();
        }
        
        // Save to local storage
        this.saveChatHistory();
    }

    displayRoomMessages(roomId) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        const roomMessages = this.messages.get(roomId) || [];
        
        if (roomMessages.length === 0) {
            // Show room welcome message
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <div class="welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4A90E2" stroke-width="3"/>
                        <path d="M30,50 L70,50 M50,30 L50,70" fill="none" stroke="#4A90E2" stroke-width="3"/>
                    </svg>
                </div>
                <h3>${roomId.startsWith('dm_') ? 'DIRECT MESSAGE' : `#${roomId.toUpperCase()}`}</h3>
                <p>${roomId.startsWith('dm_') ? 
                    'Private conversation - End-to-end encrypted' : 
                    'Public chat room - All messages are visible to room members'}</p>
            `;
            messagesContainer.appendChild(welcomeDiv);
        } else {
            roomMessages.forEach(message => this.displayMessage(message));
        }
    }

    // ============ SYSTEM MESSAGES ============
    
    sendSystemMessage(content) {
        const message = {
            id: this.generateMessageId(),
            senderId: 'system',
            senderName: 'SYSTEM',
            senderColor: '#666',
            content: content,
            type: 'system',
            timestamp: Date.now(),
            roomId: this.activeRoom,
            status: 'SENT'
        };
        
        this.addMessageToRoom(this.activeRoom, message);
        this.displayMessage(message);
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        const statusDot = statusElement?.querySelector('.status-dot');
        
        if (!statusElement || !statusDot) return;
        
        let statusText = '';
        let statusClass = '';
        
        switch (status) {
            case 'CONNECTED':
                statusText = 'CONNECTED';
                statusClass = 'connected';
                break;
            case 'DISCONNECTED':
                statusText = 'DISCONNECTED';
                statusClass = 'disconnected';
                break;
            case 'CONNECTING':
                statusText = 'CONNECTING';
                statusClass = 'connecting';
                break;
            case 'LOCAL_MODE':
                statusText = 'LOCAL MODE';
                statusClass = 'disconnected';
                break;
            case 'ERROR':
                statusText = 'ERROR';
                statusClass = 'disconnected';
                break;
        }
        
        statusElement.innerHTML = `
            <span class="status-dot ${statusClass}"></span>
            ${statusText}
        `;
    }

    // ============ UI CONTROLS ============
    
    toggleChat() {
        if (this.ui.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.ui.container.style.transform = 'translateX(-500px)';
        this.ui.isOpen = true;
        
        // Update stats
        this.updateStats();
        
        // Reset unread count
        this.resetUnreadCount();
    }

    closeChat() {
        this.ui.container.style.transform = 'translateX(0)';
        this.ui.isOpen = false;
    }

    toggleSearch() {
        const searchContainer = document.getElementById('searchContainer');
        const searchInput = document.getElementById('chatSearchInput');
        
        if (searchContainer.style.display === 'none') {
            searchContainer.style.display = 'block';
            setTimeout(() => searchInput.focus(), 100);
        } else {
            searchContainer.style.display = 'none';
            searchInput.value = '';
            this.handleSearch('');
        }
    }

    startNewChat() {
        // In real implementation, this would show peer connection dialog
        const peerId = prompt('Enter peer ID to connect:');
        if (peerId) {
            this.connectToPeer(peerId);
        }
    }

    showAIHelp() {
        const helpMessage = `Available commands:
/help - Show this help
/users - List connected users
/stories - Show AI stories
/status - Show connection status
/clear - Clear chat
/info - Show system info

Try asking about: economy, workers, evolution, or world 3D`;
        
        this.sendAIStoryResponse(helpMessage);
    }

    showStory(story) {
        const storyMessage = {
            id: this.generateMessageId(),
            senderId: 'ai_prism',
            senderName: 'PRISM AI',
            senderColor: '#9D4EDD',
            content: `📖 ${story.title}\n\n${story.content}\n\nTags: ${story.tags.join(', ')}`,
            type: 'story',
            timestamp: Date.now(),
            roomId: this.activeRoom,
            status: 'SENT',
            isAI: true
        };
        
        this.addMessageToRoom(this.activeRoom, storyMessage);
        this.displayMessage(storyMessage);
    }

    // ============ NOTIFICATIONS ============
    
    incrementUnreadCount() {
        this.unreadCount++;
        this.updateMenuBadge();
    }

    resetUnreadCount() {
        this.unreadCount = 0;
        this.updateMenuBadge();
    }

    updateMenuBadge() {
        const menuItem = document.querySelector('.menu-item[data-action="messages"]');
        if (!menuItem) return;
        
        let badge = menuItem.querySelector('.unread-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'unread-badge';
            menuItem.appendChild(badge);
        }
        
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
            badge.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: #EF476F;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                font-weight: 700;
            `;
        } else {
            badge.remove();
        }
    }

    showNotification(message) {
        // Check if notifications are allowed
        if (Notification.permission === 'granted') {
            new Notification(`${message.senderName}`, {
                body: message.content,
                icon: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="${message.senderColor}"/>
                        <text x="50" y="60" text-anchor="middle" font-family="monospace" font-size="30" fill="white">
                            ${message.senderName.charAt(0)}
                        </text>
                    </svg>
                `)
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // ============ UTILITY FUNCTIONS ============
    
    generatePeerId() {
        return 'peer_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    generateUsername() {
        const prefixes = ['ALFAZ', 'NEXUS', 'QUANTUM', 'CHRONOS', 'SIGMA', 'PRISM', 'OMEGA', 'ZENITH'];
        const suffixes = ['01', 'X', 'AI', 'PRO', 'MAX', 'ULTRA', 'PRIME'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix}_${suffix}`;
    }

    generateColor() {
        const colors = ['#FFD700', '#06D6A0', '#4A90E2', '#EF476F', '#9D4EDD', '#FF9E00', '#00BBF9'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        return Math.floor(seconds / 86400) + 'd ago';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============ STATS UPDATES ============
    
    updateStats() {
        const peerCount = document.getElementById('peerCount');
        const messageCount = document.getElementById('messageCount');
        const uptime = document.getElementById('uptime');
        
        if (peerCount) peerCount.textContent = this.users.size.toString();
        if (messageCount) messageCount.textContent = this.performance.messageCount.toString();
        if (uptime) uptime.textContent = this.formatUptime();
    }

    formatUptime() {
        const seconds = Math.floor((Date.now() - this.performance.startTime) / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    startConnectionMonitor() {
        this.performance.startTime = Date.now();
        
        setInterval(() => {
            this.updateStats();
            
            // Update user statuses
            this.users.forEach(user => {
                if (user.id !== this.currentUser.id && 
                    Date.now() - user.lastSeen > 30000) {
                    user.status = 'AWAY';
                }
            });
            
            this.updateUserList();
        }, 1000);
    }

    // ============ DATA PERSISTENCE ============
    
    saveChatHistory() {
        try {
            const history = {
                messages: Array.from(this.messages.entries()),
                users: Array.from(this.users.values()),
                currentUser: this.currentUser,
                savedAt: Date.now()
            };
            
            localStorage.setItem('gami_chat_history', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('gami_chat_history');
            if (saved) {
                const history = JSON.parse(saved);
                
                // Load messages
                history.messages?.forEach(([roomId, messages]) => {
                    this.messages.set(roomId, messages);
                });
                
                // Load users
                history.users?.forEach(user => {
                    this.users.set(user.id, user);
                });
                
                // Load current user
                if (history.currentUser) {
                    this.currentUser = { ...this.currentUser, ...history.currentUser };
                }
                
                console.log('Loaded chat history:', {
                    rooms: this.messages.size,
                    users: this.users.size,
                    totalMessages: Array.from(this.messages.values()).flat().length
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    // ============ MENU INTEGRATION ============
    
    addToMainMenu() {
        // Find the main menu
        const mainMenu = document.querySelector('.menu-list');
        if (!mainMenu) {
            // Try to find menu by ID
            const menuList = document.getElementById('menuList') || 
                            document.querySelector('.side-menu .menu-list');
            if (menuList) {
                this.addMenuItem(menuList);
            }
        } else {
            this.addMenuItem(mainMenu);
        }
    }

    addMenuItem(menuList) {
        // Check if menu item already exists
        if (document.querySelector('.menu-item[data-action="messages"]')) {
            return;
        }
        
        const menuItem = document.createElement('li');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('data-action', 'messages');
        menuItem.innerHTML = `
            <svg class="menu-item-icon" width="20" height="20" viewBox="0 0 20 20">
                <path d="M2,2 L18,2 L18,14 L6,14 L2,18 L2,2 M6,6 L14,6 M6,10 L12,10" 
                      fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>MESSAGES</span>
        `;
        
        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleChat();
        });
        
        // Add after worker menu if exists, or before logout
        const workerItem = menuList.querySelector('[data-action="workers"]');
        const logoutItem = menuList.querySelector('.logout-button')?.parentElement;
        
        if (workerItem) {
            menuList.insertBefore(menuItem, workerItem.nextSibling);
        } else if (logoutItem) {
            menuList.insertBefore(menuItem, logoutItem);
        } else {
            menuList.appendChild(menuItem);
        }
    }

    // ============ PUBLIC API ============
    
    getChatStats() {
        return {
            users: this.users.size,
            rooms: this.messages.size,
            totalMessages: this.performance.messageCount,
            connectionStatus: this.peerConnection?.connectionState || 'disconnected',
            unreadCount: this.unreadCount,
            uptime: Date.now() - this.performance.startTime
        };
    }

    sendDirectMessage(userId, content) {
        const user = this.users.get(userId);
        if (!user) return null;
        
        const message = this.sendMessage(content);
        return message;
    }

    clearChatHistory(roomId = null) {
        if (roomId) {
            this.messages.delete(roomId);
            if (this.activeRoom === roomId) {
                this.displayRoomMessages(roomId);
            }
        } else {
            this.messages.clear();
            this.displayRoomMessages(this.activeRoom);
        }
        
        this.saveChatHistory();
        return { success: true, cleared: roomId || 'all' };
    }

    getAvailableUsers() {
        return Array.from(this.users.values())
            .filter(user => user.id !== this.currentUser.id)
            .map(user => ({
                id: user.id,
                name: user.name,
                status: user.status,
                color: user.color
            }));
    }
}

// Initialize and expose globally
window.GAMIP2PChat = GAMIP2PChat;
window.p2pChat = new GAMIP2PChat();

// Request notification permission on load
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Auto-save chat history periodically
setInterval(() => {
    if (window.p2pChat) {
        window.p2pChat.saveChatHistory();
    }
}, 30000); // Every 30 seconds

// Auto-save before page unload
window.addEventListener('beforeunload', () => {
    if (window.p2pChat) {
        window.p2pChat.saveChatHistory();
    }
});

console.log('GAMI P2P Chat loaded - Decentralized WebRTC Messaging ready');