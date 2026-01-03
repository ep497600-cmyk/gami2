class P2PNetwork {
    constructor() {
        this.peerConnections = new Map();
        this.dataChannels = new Map();
        this.activeChats = new Map();
        this.signalingSocket = null;
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ];
        
        this.chatConfig = {
            maxMessageLength: 500,
            maxMessagesPerMinute: 20,
            autoDeleteHours: 48,
            encryptionAlgorithm: 'AES-GCM'
        };
        
        this.messageQueue = [];
        this.isProcessingQueue = false;
        
        this.initializeSignaling();
    }
    
    async initializeSignaling() {
        try {
            // For demo, we'll use a simulated signaling server
            // In production, use Socket.io with your backend
            
            console.log('📡 Initializing P2P network...');
            
            // Simulate connection to signaling server
            this.signalingSocket = {
                emit: (event, data) => {
                    console.log(`[Signaling] ${event}:`, data);
                    this.handleSignalingMessage(event, data);
                },
                on: (event, callback) => {
                    // Store callback for simulated events
                    if (!this.signalingCallbacks) this.signalingCallbacks = {};
                    if (!this.signalingCallbacks[event]) this.signalingCallbacks[event] = [];
                    this.signalingCallbacks[event].push(callback);
                }
            };
            
            // Simulate connection success
            setTimeout(() => {
                this.onSignalingConnected();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Signaling initialization failed:', error);
            this.setupOfflineMode();
        }
    }
    
    setupOfflineMode() {
        console.warn('⚠️ Running in offline/demo mode');
        
        // Load demo users
        this.loadDemoUsers();
        
        // Setup demo chat functionality
        this.setupDemoChat();
    }
    
    loadDemoUsers() {
        const demoUsers = [
            {
                id: 'demo1',
                username: 'AlexTech',
                country: '🇺🇸 USA',
                category: '💻 Tech',
                trustScore: 95,
                isOnline: true,
                avatarColor: '#4facfe'
            },
            {
                id: 'demo2',
                username: 'PriyaMusic',
                country: '🇮🇳 India',
                category: '🎵 Music',
                trustScore: 88,
                isOnline: true,
                avatarColor: '#f093fb'
            },
            {
                id: 'demo3',
                username: 'KenTravel',
                country: '🇯🇵 Japan',
                category: '✈️ Travel',
                trustScore: 92,
                isOnline: false,
                avatarColor: '#667eea'
            },
            {
                id: 'demo4',
                username: 'MariaCoder',
                country: '🇪🇸 Spain',
                category: '💻 Tech',
                trustScore: 85,
                isOnline: true,
                avatarColor: '#f5576c'
            },
            {
                id: 'demo5',
                username: 'DavidGamer',
                country: '🇬🇧 UK',
                category: '🎮 Gaming',
                trustScore: 90,
                isOnline: true,
                avatarColor: '#48bb78'
            }
        ];
        
        this.demoUsers = demoUsers;
        this.updateOnlineUsersList();
    }
    
    updateOnlineUsersList() {
        const userList = document.getElementById('userList');
        if (!userList) return;
        
        userList.innerHTML = '';
        
        const onlineUsers = this.demoUsers.filter(user => user.isOnline);
        
        // Update online count
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = `${onlineUsers.length} online`;
        }
        
        // Add users to list
        onlineUsers.forEach(user => {
            const userCard = this.createUserCard(user);
            userList.appendChild(userCard);
        });
        
        // If no users online, show message
        if (onlineUsers.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <div class="empty-icon">👥</div>
                <p>No users online at the moment</p>
                <small>Try again later or check your connection</small>
            `;
            userList.appendChild(emptyMessage);
        }
    }
    
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.dataset.userId = user.id;
        
        card.innerHTML = `
            <div class="user-avatar" style="background: linear-gradient(45deg, ${user.avatarColor}, #764ba2);"></div>
            <div class="user-details">
                <div class="user-name">${user.username}</div>
                <div class="user-meta">
                    <span class="user-country">${user.country}</span>
                    <span class="user-category">${user.category}</span>
                </div>
            </div>
            <button class="connect-btn" data-user="${user.username}">Connect</button>
            <div class="trust-score" style="background: ${user.trustScore > 70 ? '#38a169' : user.trustScore > 40 ? '#d69e2e' : '#f56565'}">
                ${user.trustScore}
            </div>
        `;
        
        // Add click event for connect button
        const connectBtn = card.querySelector('.connect-btn');
        connectBtn.addEventListener('click', () => {
            this.startChat(user.username, user.id);
        });
        
        return card;
    }
    
    setupDemoChat() {
        // Handle connect button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-btn')) {
                const username = e.target.dataset.user;
                const userId = e.target.closest('.user-card').dataset.userId;
                this.startChat(username, userId);
            }
        });
    }
    
    startChat(username, userId = 'demo') {
        console.log(`💬 Starting chat with ${username}`);
        
        // Hide home screen, show chat screen
        document.getElementById('homeScreen').classList.add('hidden');
        document.getElementById('chatScreen').classList.remove('hidden');
        
        // Update chat header
        document.getElementById('chatPartnerName').textContent = username;
        
        // Create chat session
        const chatId = `chat_${Date.now()}_${userId}`;
        const chatSession = {
            id: chatId,
            partner: username,
            partnerId: userId,
            startTime: Date.now(),
            endTime: Date.now() + (this.chatConfig.autoDeleteHours * 60 * 60 * 1000),
            messages: [],
            isActive: true,
            encryptionKey: this.generateEncryptionKey()
        };
        
        this.activeChats.set(chatId, chatSession);
        
        // Start timer
        this.startChatTimer(chatId);
        
        // Clear message area and add welcome message
        const messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = `
            <div class="system-message">
                Chat started with <strong>${username}</strong><br>
                This chat will self-destruct in <span class="highlight">48 hours</span>
            </div>
        `;
        
        // Focus on message input
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 100);
        
        // Setup message sending
        this.setupMessageHandlers(chatId);
        
        // Simulate partner typing
        this.simulatePartnerActivity(chatId, username);
    }
    
    startChatTimer(chatId) {
        const chatSession = this.activeChats.get(chatId);
        if (!chatSession) return;
        
        const timerElement = document.getElementById('timer');
        
        const updateTimer = () => {
            if (!chatSession.isActive) return;
            
            const now = Date.now();
            const remaining = chatSession.endTime - now;
            
            if (remaining <= 0) {
                this.destroyChat(chatId);
                return;
            }
            
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            
            if (timerElement) {
                timerElement.textContent = 
                    `${hours.toString().padStart(2, '0')}:` +
                    `${minutes.toString().padStart(2, '0')}:` +
                    `${seconds.toString().padStart(2, '0')}`;
                
                // Color coding
                if (hours < 1) {
                    timerElement.style.color = '#f56565'; // Red for last hour
                } else if (hours < 12) {
                    timerElement.style.color = '#ed8936'; // Orange for < 12 hours
                } else {
                    timerElement.style.color = '#48bb78'; // Green for > 12 hours
                }
            }
            
            // Schedule next update
            if (chatSession.isActive) {
                setTimeout(updateTimer, 1000);
            }
        };
        
        updateTimer();
    }
    
    setupMessageHandlers(chatId) {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const backBtn = document.getElementById('backBtn');
        
        if (!messageInput || !sendBtn || !backBtn) return;
        
        // Clear previous event listeners
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        
        // Setup new event listeners
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage(chatId);
        });
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(chatId);
            }
        });
        
        document.getElementById('backBtn').addEventListener('click', () => {
            this.endChat(chatId);
        });
    }
    
    async sendMessage(chatId) {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Check message with AI
        const aiCheck = auraAI.monitorMessage(message, 'You');
        if (!aiCheck.allowed) {
            if (aiCheck.warning) {
                alert(`Message blocked: ${aiCheck.warning}`);
            }
            messageInput.value = '';
            return;
        }
        
        // Add to message queue
        this.messageQueue.push({
            chatId,
            message,
            timestamp: Date.now(),
            sender: 'You'
        });
        
        // Process queue
        if (!this.isProcessingQueue) {
            this.processMessageQueue();
        }
        
        // Clear input
        messageInput.value = '';
        
        // Show sending indicator
        this.showSendingIndicator();
    }
    
    async processMessageQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.messageQueue.length > 0) {
            const messageData = this.messageQueue.shift();
            await this.processSingleMessage(messageData);
            
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessingQueue = false;
    }
    
    async processSingleMessage(messageData) {
        const { chatId, message, timestamp, sender } = messageData;
        const chatSession = this.activeChats.get(chatId);
        
        if (!chatSession || !chatSession.isActive) return;
        
        try {
            // Encrypt message (simulated for demo)
            const encryptedMessage = await this.encryptMessage(message, chatSession.encryptionKey);
            
            // Store message locally
            const messageObj = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: message,
                encrypted: encryptedMessage,
                sender: sender,
                timestamp: timestamp,
                isRead: false,
                isDelivered: true // Simulated for demo
            };
            
            chatSession.messages.push(messageObj);
            
            // Update UI
            this.displayMessage(messageObj, chatId);
            
            // Simulate partner reply (for demo)
            if (sender === 'You') {
                setTimeout(() => {
                    this.simulatePartnerReply(chatId);
                }, 1000 + Math.random() * 3000);
            }
            
            // Save chat to localStorage (encrypted)
            this.saveChatToStorage(chatSession);
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.showError('Failed to send message');
        }
    }
    
    displayMessage(message, chatId) {
        const messageArea = document.getElementById('messageArea');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'You' ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = message.id;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(message.content)}</div>
            <div class="message-meta">
                <span class="message-time">${time}</span>
                ${message.sender === 'You' ? 
                    '<span class="message-status">✓</span>' : 
                    `<span class="message-sender">${message.sender}</span>`
                }
            </div>
        `;
        
        messageArea.appendChild(messageDiv);
        
        // Scroll to bottom
        messageArea.scrollTop = messageArea.scrollHeight;
        
        // Add animation
        messageDiv.style.animation = 'messageSlideIn 0.3s ease';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showSendingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.textContent = 'Sending...';
            setTimeout(() => {
                typingIndicator.textContent = '';
            }, 1000);
        }
    }
    
    simulatePartnerActivity(chatId, username) {
        const chatSession = this.activeChats.get(chatId);
        if (!chatSession) return;
        
        // Random typing simulation
        setInterval(() => {
            if (chatSession.isActive && Math.random() > 0.7) {
                this.showTypingIndicator(username);
            }
        }, 5000);
    }
    
    showTypingIndicator(username) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.textContent = `${username} is typing...`;
            
            setTimeout(() => {
                typingIndicator.textContent = '';
            }, 2000);
        }
    }
    
    simulatePartnerReply(chatId) {
        const chatSession = this.activeChats.get(chatId);
        if (!chatSession || !chatSession.isActive) return;
        
        const replies = [
            "Hello! How are you doing today?",
            "Nice to meet you! What brings you here?",
            "I'm enjoying this app. It feels very secure.",
            "The 48-hour auto-delete is a great feature.",
            "Have you tried the AI verification yet?",
            "What's your favorite thing about this platform?",
            "I appreciate the privacy focus here.",
            "The interface is really smooth, isn't it?",
            "Do you think more people should use apps like this?",
            "Security and privacy matter a lot these days."
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        // Add partner message to queue
        this.messageQueue.push({
            chatId,
            message: randomReply,
            timestamp: Date.now(),
            sender: chatSession.partner
        });
        
        // Process queue
        if (!this.isProcessingQueue) {
            this.processMessageQueue();
        }
    }
    
    async encryptMessage(message, key) {
        // Simplified encryption for demo
        // In production, use Web Crypto API with AES-GCM
        
        // Create a simple hash for demo purposes
        const encoder = new TextEncoder();
        const data = encoder.encode(message + key + Date.now());
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return {
            ciphertext: btoa(message).split('').reverse().join(''), // Simple obfuscation for demo
            iv: hashHex.substring(0, 24),
            tag: hashHex.substring(24, 32),
            timestamp: Date.now()
        };
    }
    
    generateEncryptionKey() {
        // Generate a random key for demo
        const array = new Uint32Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    }
    
    saveChatToStorage(chatSession) {
        try {
            // Only store minimal data
            const storageData = {
                id: chatSession.id,
                partner: chatSession.partner,
                startTime: chatSession.startTime,
                endTime: chatSession.endTime,
                messageCount: chatSession.messages.length,
                lastActivity: Date.now()
            };
            
            // Store in localStorage (in production, use IndexedDB)
            const chats = JSON.parse(localStorage.getItem('aura_active_chats') || '{}');
            chats[chatSession.id] = storageData;
            localStorage.setItem('aura_active_chats', JSON.stringify(chats));
            
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    }
    
    endChat(chatId) {
        const chatSession = this.activeChats.get(chatId);
        if (chatSession) {
            chatSession.isActive = false;
        }
        
        // Show home screen
        document.getElementById('chatScreen').classList.add('hidden');
        document.getElementById('homeScreen').classList.remove('hidden');
        
        // Clear message input
        document.getElementById('messageInput').value = '';
        
        // Update users list
        this.updateOnlineUsersList();
    }
    
    destroyChat(chatId) {
        console.log(`🗑️ Destroying chat ${chatId}`);
        
        const chatSession = this.activeChats.get(chatId);
        if (chatSession) {
            chatSession.isActive = false;
            this.activeChats.delete(chatId);
        }
        
        // Remove from storage
        const chats = JSON.parse(localStorage.getItem('aura_active_chats') || '{}');
        delete chats[chatId];
        localStorage.setItem('aura_active_chats', JSON.stringify(chats));
        
        // Show destruction message
        const messageArea = document.getElementById('messageArea');
        if (messageArea) {
            messageArea.innerHTML = `
                <div class="system-message" style="background: #f56565; color: white;">
                    ⚠️ CHAT DESTROYED ⚠️<br>
                    This chat has been permanently deleted as per 48-hour policy.<br>
                    All messages are gone forever.
                </div>
            `;
        }
        
        // Auto-close after 3 seconds
        setTimeout(() => {
            this.endChat(chatId);
        }, 3000);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `⚠️ ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // WebRTC Implementation (for production)
    async createPeerConnection(userId) {
        try {
            const configuration = {
                iceServers: this.iceServers,
                iceCandidatePoolSize: 10
            };
            
            const peerConnection = new RTCPeerConnection(configuration);
            
            // Add event handlers
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendIceCandidate(userId, event.candidate);
                }
            };
            
            peerConnection.onconnectionstatechange = () => {
                console.log(`Connection state: ${peerConnection.connectionState}`);
                
                if (peerConnection.connectionState === 'connected') {
                    console.log('✅ P2P connection established');
                } else if (peerConnection.connectionState === 'disconnected' ||
                          peerConnection.connectionState === 'failed') {
                    console.warn('❌ P2P connection lost');
                    this.cleanupPeerConnection(userId);
                }
            };
            
            peerConnection.ondatachannel = (event) => {
                const dataChannel = event.channel;
                this.setupDataChannel(dataChannel, userId);
            };
            
            // Create data channel for messaging
            const dataChannel = peerConnection.createDataChannel('aura-chat', {
                ordered: true,
                maxRetransmits: 3
            });
            
            this.setupDataChannel(dataChannel, userId);
            
            this.peerConnections.set(userId, peerConnection);
            this.dataChannels.set(userId, dataChannel);
            
            return peerConnection;
            
        } catch (error) {
            console.error('Error creating peer connection:', error);
            throw error;
        }
    }
    
    setupDataChannel(dataChannel, userId) {
        dataChannel.onopen = () => {
            console.log(`📨 Data channel opened with ${userId}`);
        };
        
        dataChannel.onclose = () => {
            console.log(`📨 Data channel closed with ${userId}`);
            this.cleanupDataChannel(userId);
        };
        
        dataChannel.onerror = (error) => {
            console.error(`📨 Data channel error with ${userId}:`, error);
        };
        
        dataChannel.onmessage = (event) => {
            this.handleDataChannelMessage(userId, event.data);
        };
    }
    
    async handleDataChannelMessage(userId, data) {
        try {
            const message = JSON.parse(data);
            
            // Verify message structure
            if (!message.type || !message.payload) {
                throw new Error('Invalid message format');
            }
            
            switch (message.type) {
                case 'text':
                    // Process text message
                    await this.processIncomingMessage(userId, message.payload);
                    break;
                    
                case 'typing':
                    // Show typing indicator
                    this.showTypingIndicator(message.payload.username);
                    break;
                    
                case 'read':
                    // Mark message as read
                    this.markMessageAsRead(message.payload.messageId);
                    break;
                    
                default:
                    console.warn('Unknown message type:', message.type);
            }
            
        } catch (error) {
            console.error('Error handling data channel message:', error);
        }
    }
    
    async processIncomingMessage(userId, payload) {
        // Check message with AI
        const aiCheck = auraAI.monitorMessage(payload.content, payload.sender);
        
        if (!aiCheck.allowed) {
            // Block abusive messages
            console.warn('Blocked abusive message from:', payload.sender);
            return;
        }
        
        // Display message
        this.displayMessage({
            id: payload.id,
            content: payload.content,
            sender: payload.sender,
            timestamp: payload.timestamp
        }, `chat_${userId}`);
        
        // Send read receipt
        this.sendReadReceipt(userId, payload.id);
    }
    
    sendReadReceipt(userId, messageId) {
        const dataChannel = this.dataChannels.get(userId);
        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify({
                type: 'read',
                payload: { messageId }
            }));
        }
    }
    
    markMessageAsRead(messageId) {
        // Update message status in UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                statusElement.textContent = '✓✓';
                statusElement.style.color = '#48bb78';
            }
        }
    }
    
    async sendIceCandidate(userId, candidate) {
        // Send ICE candidate via signaling server
        if (this.signalingSocket) {
            this.signalingSocket.emit('ice-candidate', {
                to: userId,
                candidate: candidate
            });
        }
    }
    
    cleanupPeerConnection(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(userId);
        }
        
        this.cleanupDataChannel(userId);
    }
    
    cleanupDataChannel(userId) {
        const dataChannel = this.dataChannels.get(userId);
        if (dataChannel) {
            dataChannel.close();
            this.dataChannels.delete(userId);
        }
    }
    
    // Signaling server handlers
    onSignalingConnected() {
        console.log('✅ Connected to signaling server');
        
        // Register current user
        const userIdentity = JSON.parse(localStorage.getItem('aura_identity') || '{}');
        if (userIdentity.signature) {
            this.signalingSocket.emit('register', {
                userId: userIdentity.signature,
                username: userIdentity.username || 'User',
                isPublic: true
            });
        }
    }
    
    handleSignalingMessage(event, data) {
        // Handle different signaling events
        switch (event) {
            case 'offer':
                this.handleOffer(data);
                break;
                
            case 'answer':
                this.handleAnswer(data);
                break;
                
            case 'ice-candidate':
                this.handleRemoteIceCandidate(data);
                break;
                
            case 'user-list':
                this.handleUserList(data);
                break;
                
            case 'chat-request':
                this.handleChatRequest(data);
                break;
                
            default:
                console.warn('Unknown signaling event:', event);
        }
    }
    
    async handleOffer(data) {
        try {
            const { from: userId, offer } = data;
            
            // Create peer connection if not exists
            let peerConnection = this.peerConnections.get(userId);
            if (!peerConnection) {
                peerConnection = await this.createPeerConnection(userId);
            }
            
            // Set remote description
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            // Create answer
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            // Send answer back
            this.signalingSocket.emit('answer', {
                to: userId,
                answer: answer
            });
            
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }
    
    async handleAnswer(data) {
        try {
            const { from: userId, answer } = data;
            const peerConnection = this.peerConnections.get(userId);
            
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
            
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }
    
    async handleRemoteIceCandidate(data) {
        try {
            const { from: userId, candidate } = data;
            const peerConnection = this.peerConnections.get(userId);
            
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
            
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    }
    
    handleUserList(users) {
        // Update online users list
        console.log('Received user list:', users);
        // This would update the UI with real users from signaling server
    }
    
    handleChatRequest(data) {
        const { from: userId, username } = data;
        
        // Ask user to accept/reject chat request
        if (confirm(`${username} wants to chat with you. Accept?`)) {
            this.startChat(username, userId);
            
            // Send acceptance
            this.signalingSocket.emit('chat-accepted', {
                to: userId
            });
        } else {
            // Send rejection
            this.signalingSocket.emit('chat-rejected', {
                to: userId
            });
        }
    }
}

// Initialize P2P Network
const p2pNetwork = new P2PNetwork();

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            console.log('🚀 Starting connection engine...');
            
            // Show loading state
            startBtn.classList.add('loading');
            startBtn.disabled = true;
            
            // Simulate connection process
            setTimeout(() => {
                startBtn.classList.remove('loading');
                startBtn.disabled = false;
                
                // Update users list
                p2pNetwork.updateOnlineUsersList();
                
                // Show success message
                const hint = document.querySelector('.hint');
                if (hint) {
                    hint.textContent = '✅ Connected to network! Browse users above.';
                    hint.style.color = '#48bb78';
                }
            }, 2000);
        });
    }
    
    // Setup video/audio call buttons (demo)
    const videoCallBtn = document.getElementById('videoCallBtn');
    const audioCallBtn = document.getElementById('audioCallBtn');
    
    if (videoCallBtn) {
        videoCallBtn.addEventListener('click', () => {
            alert('🎥 Video call feature would initiate here\n\nIn production, this would start a WebRTC video call with end-to-end encryption.');
        });
    }
    
    if (audioCallBtn) {
        audioCallBtn.addEventListener('click', () => {
            alert('📞 Audio call feature would initiate here\n\nIn production, this would start a WebRTC audio call with end-to-end encryption.');
        });
    }
    
    // Auto-cleanup old chats on startup
    setTimeout(() => {
        p2pNetwork.cleanupOldChats();
    }, 1000);
});

// Export for other modules
window.p2pNetwork = p2pNetwork;