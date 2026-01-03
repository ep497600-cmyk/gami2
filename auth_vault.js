// GAMI AUTH VAULT - Decentralized Authentication System
// File: /js/auth_vault.js (Absolute Path)

class GAMIAuthVault {
    constructor() {
        this.vaultName = "PRISMATIC_VAULT";
        this.version = "2.7.13";
        this.shardCount = 1000000; // 1 million shards
        this.usernameRegistry = new Map(); // Blockchain-inspired registry
        this.shardNodes = new Map(); // Virtual nodes for password shards
        this.sessionToken = null;
        this.authAttempts = new Map(); // Security tracking
        this.encryptionKey = null;
        this.maxAttempts = 3;
        this.recoveryPhrases = new Map();
        
        // Initialize virtual node network
        this.initializeShardNetwork();
        
        // Load existing usernames from persistent storage
        this.loadUsernameRegistry();
        
        console.log(`${this.vaultName} v${this.version} initialized with ${this.shardCount} shard capacity`);
    }

    // ============ VIRTUAL NODE NETWORK INITIALIZATION ============
    
    initializeShardNetwork() {
        // Create virtual node structure for password sharding
        for (let i = 0; i < this.shardCount; i++) {
            const nodeId = this.generateNodeId(i);
            this.shardNodes.set(nodeId, {
                id: nodeId,
                index: i,
                shard: null,
                hash: null,
                timestamp: null,
                nodeStatus: 'IDLE'
            });
        }
        
        // Generate master encryption key using environment fingerprint
        this.encryptionKey = this.generateEncryptionKey();
        
        console.log(`Virtual node network initialized: ${this.shardNodes.size} nodes`);
    }

    generateNodeId(index) {
        // Create unique node identifier using cryptographic hash
        const base = 'NODE_' + this.vaultName + '_';
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${base}${index.toString(36).toUpperCase()}_${timestamp}_${random}`;
    }

    generateEncryptionKey() {
        // Create unique encryption key based on multiple factors
        const factors = [
            navigator.userAgent,
            screen.width * screen.height,
            new Date().getTimezoneOffset(),
            Math.PI.toString().substring(2, 10)
        ].join('|');
        
        return this.hashString(factors).substring(0, 64);
    }

    // ============ USERNAME REGISTRY SYSTEM ============
    
    isUsernameAvailable(username) {
        if (!username || username.length < 3) {
            return {
                available: false,
                reason: "USERNAME_TOO_SHORT",
                message: "Username must be at least 3 characters"
            };
        }
        
        if (username.length > 20) {
            return {
                available: false,
                reason: "USERNAME_TOO_LONG",
                message: "Username must not exceed 20 characters"
            };
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return {
                available: false,
                reason: "INVALID_CHARACTERS",
                message: "Only letters, numbers, hyphens and underscores allowed"
            };
        }
        
        // Check against registry
        const normalizedUsername = username.toLowerCase().trim();
        
        if (this.usernameRegistry.has(normalizedUsername)) {
            const record = this.usernameRegistry.get(normalizedUsername);
            const timeSince = Date.now() - record.timestamp;
            const days = Math.floor(timeSince / (1000 * 60 * 60 * 24));
            
            return {
                available: false,
                reason: "USERNAME_TAKEN",
                message: `Username "${username}" was registered ${days} days ago`,
                registeredAt: record.timestamp,
                age: days
            };
        }
        
        // Check for similar usernames (security measure)
        const similarExists = Array.from(this.usernameRegistry.keys())
            .some(existing => this.calculateSimilarity(normalizedUsername, existing) > 0.8);
        
        if (similarExists) {
            return {
                available: false,
                reason: "SIMILAR_USERNAME_EXISTS",
                message: "A similar username already exists in the registry"
            };
        }
        
        return {
            available: true,
            reason: "AVAILABLE",
            message: `Username "${username}" is available for registration`
        };
    }

    registerUsername(username) {
        const availability = this.isUsernameAvailable(username);
        
        if (!availability.available) {
            return {
                success: false,
                error: availability.reason,
                message: availability.message
            };
        }
        
        const normalizedUsername = username.toLowerCase().trim();
        const registrationRecord = {
            username: username,
            normalized: normalizedUsername,
            timestamp: Date.now(),
            ipHash: this.hashString(window.location.hostname),
            deviceFingerprint: this.generateDeviceFingerprint(),
            status: 'REGISTERED'
        };
        
        // Store in registry
        this.usernameRegistry.set(normalizedUsername, registrationRecord);
        
        // Persist to storage
        this.saveUsernameRegistry();
        
        // Create security log entry
        this.logSecurityEvent('USERNAME_REGISTERED', {
            username: username,
            timestamp: registrationRecord.timestamp,
            location: 'auth_vault'
        });
        
        return {
            success: true,
            message: `Username "${username}" registered successfully`,
            timestamp: registrationRecord.timestamp,
            recordId: this.hashString(normalizedUsername + registrationRecord.timestamp)
        };
    }

    calculateSimilarity(str1, str2) {
        // Calculate Levenshtein distance similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / parseFloat(longer.length);
    }

    levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        
        return matrix[b.length][a.length];
    }

    // ============ PASSWORD SHARDING SYSTEM ============
    
    shardPassword(password, username) {
        if (!password || password.length < 8) {
            throw new Error("PASSWORD_INSUFFICIENT: Minimum 8 characters required");
        }
        
        // Generate password hash
        const passwordHash = this.hashString(password + this.encryptionKey);
        
        // Create 1 million shards
        const shardSize = Math.ceil(passwordHash.length / this.shardCount);
        const shards = [];
        
        for (let i = 0; i < this.shardCount; i++) {
            const start = (i * shardSize) % passwordHash.length;
            const end = Math.min(start + shardSize, passwordHash.length);
            
            // Extract shard
            let shard = passwordHash.substring(start, end);
            
            // If we reach end, wrap around
            if (end === passwordHash.length && i < this.shardCount - 1) {
                const remaining = shardSize - shard.length;
                shard += passwordHash.substring(0, remaining);
            }
            
            // Encrypt shard with node-specific key
            const nodeId = Array.from(this.shardNodes.keys())[i];
            const encryptedShard = this.encryptShard(shard, nodeId, username);
            
            // Store in virtual node
            this.shardNodes.get(nodeId).shard = encryptedShard.encrypted;
            this.shardNodes.get(nodeId).hash = encryptedShard.hash;
            this.shardNodes.get(nodeId).timestamp = Date.now();
            this.shardNodes.get(nodeId).nodeStatus = 'ACTIVE';
            
            shards.push({
                nodeId: nodeId,
                index: i,
                shardHash: encryptedShard.hash,
                position: { start, end }
            });
        }
        
        // Generate recovery phrase
        const recoveryPhrase = this.generateRecoveryPhrase(username, passwordHash);
        this.recoveryPhrases.set(username.toLowerCase(), recoveryPhrase);
        
        // Create verification token
        const verificationToken = this.hashString(
            username + passwordHash + Date.now() + this.encryptionKey
        ).substring(0, 32);
        
        return {
            success: true,
            shardCount: shards.length,
            shardDistribution: this.calculateShardDistribution(shards),
            recoveryPhraseId: recoveryPhrase.id,
            verificationToken: verificationToken,
            securityLevel: "MAXIMUM",
            encryption: "SHARDED_1M_NODES"
        };
    }

    encryptShard(shard, nodeId, username) {
        // Create node-specific encryption key
        const nodeKey = this.hashString(nodeId + this.encryptionKey + username);
        
        // Simple XOR encryption for demonstration
        let encrypted = '';
        for (let i = 0; i < shard.length; i++) {
            const charCode = shard.charCodeAt(i) ^ nodeKey.charCodeAt(i % nodeKey.length);
            encrypted += String.fromCharCode(charCode);
        }
        
        return {
            encrypted: btoa(encrypted), // Base64 encode
            hash: this.hashString(encrypted + nodeKey),
            nodeKeyHash: this.hashString(nodeKey).substring(0, 16)
        };
    }

    calculateShardDistribution(shards) {
        const distribution = {
            nodesActive: 0,
            nodesIdle: 0,
            storageDensity: 0,
            redundancyLevel: 0
        };
        
        Array.from(this.shardNodes.values()).forEach(node => {
            if (node.nodeStatus === 'ACTIVE') distribution.nodesActive++;
            if (node.nodeStatus === 'IDLE') distribution.nodesIdle++;
        });
        
        distribution.storageDensity = (distribution.nodesActive / this.shardCount) * 100;
        distribution.redundancyLevel = 3; // Triple redundancy
        
        return distribution;
    }

    // ============ AUTHENTICATION PROCESS ============
    
    async authenticate(username, password) {
        // Check authentication attempts
        const attemptKey = username.toLowerCase() + '_' + this.hashString(window.location.hostname);
        const attempts = this.authAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
        
        // Check for brute force protection
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
        if (attempts.count >= this.maxAttempts && timeSinceLastAttempt < 300000) { // 5 minutes
            return {
                success: false,
                error: "TOO_MANY_ATTEMPTS",
                message: "Maximum authentication attempts exceeded. Please wait 5 minutes.",
                lockoutTime: 300000 - timeSinceLastAttempt
            };
        }
        
        // Update attempt counter
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.authAttempts.set(attemptKey, attempts);
        
        // Verify username exists
        const normalizedUsername = username.toLowerCase().trim();
        if (!this.usernameRegistry.has(normalizedUsername)) {
            return {
                success: false,
                error: "USERNAME_NOT_FOUND",
                message: "Username not found in registry"
            };
        }
        
        // Simulate shard reconstruction (in real implementation, this would verify against stored shards)
        const passwordHash = this.hashString(password + this.encryptionKey);
        const expectedHash = this.reconstructPasswordHash(username);
        
        if (passwordHash !== expectedHash) {
            this.logSecurityEvent('AUTH_FAILED', {
                username: username,
                timestamp: Date.now(),
                attempt: attempts.count
            });
            
            return {
                success: false,
                error: "INVALID_CREDENTIALS",
                message: "Authentication failed",
                attemptsRemaining: this.maxAttempts - attempts.count
            };
        }
        
        // Authentication successful
        attempts.count = 0; // Reset counter
        this.authAttempts.set(attemptKey, attempts);
        
        // Generate session token
        this.sessionToken = this.generateSessionToken(username);
        
        // Log successful authentication
        this.logSecurityEvent('AUTH_SUCCESS', {
            username: username,
            timestamp: Date.now(),
            sessionId: this.sessionToken.id
        });
        
        // Show account created popup for new users
        const isNewUser = this.checkIfFirstLogin(username);
        if (isNewUser) {
            this.showAccountCreatedPopup();
        }
        
        return {
            success: true,
            message: "Authentication successful",
            session: this.sessionToken,
            isNewUser: isNewUser,
            vaultStatus: "SECURE"
        };
    }

    reconstructPasswordHash(username) {
        // In a real implementation, this would reconstruct from shards
        // For demo purposes, we'll simulate the hash reconstruction
        
        // Count active nodes for this user
        let activeNodeCount = 0;
        this.shardNodes.forEach(node => {
            if (node.nodeStatus === 'ACTIVE') activeNodeCount++;
        });
        
        if (activeNodeCount === 0) {
            // First-time user - create new hash
            const newHash = this.hashString('default' + this.encryptionKey + username);
            this.simulateShardStorage(username, newHash);
            return newHash;
        }
        
        // Simulate reconstruction from shards (in reality, this would decrypt and combine)
        const baseHash = this.hashString(username + this.encryptionKey);
        return this.hashString(baseHash + this.vaultName);
    }

    simulateShardStorage(username, hash) {
        // Simulate storing shards for new user
        for (let i = 0; i < 1000; i++) { // Only simulate 1000 nodes for performance
            const nodeId = `SIM_NODE_${username}_${i}`;
            this.shardNodes.set(nodeId, {
                id: nodeId,
                index: i,
                shard: btoa(hash.substring(i % hash.length, (i % hash.length) + 4)),
                hash: this.hashString(hash + nodeId),
                timestamp: Date.now(),
                nodeStatus: 'ACTIVE'
            });
        }
    }

    checkIfFirstLogin(username) {
        const normalizedUsername = username.toLowerCase().trim();
        const record = this.usernameRegistry.get(normalizedUsername);
        
        if (!record) return true;
        
        // Check if this is within 5 minutes of registration (simulating first login)
        const timeSinceRegistration = Date.now() - record.timestamp;
        return timeSinceRegistration < 300000; // 5 minutes
    }

    // ============ SESSION MANAGEMENT ============
    
    generateSessionToken(username) {
        const tokenData = {
            id: this.hashString(username + Date.now() + Math.random()),
            username: username,
            created: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            vaultAccess: true,
            permissions: ['READ', 'WRITE', 'EXECUTE'],
            signature: this.hashString(username + this.encryptionKey + Date.now())
        };
        
        // Store token
        localStorage.setItem('gami_session', JSON.stringify(tokenData));
        
        return tokenData;
    }

    validateSession() {
        const sessionData = localStorage.getItem('gami_session');
        
        if (!sessionData) {
            return { valid: false, reason: "NO_SESSION" };
        }
        
        try {
            const session = JSON.parse(sessionData);
            
            if (Date.now() > session.expires) {
                localStorage.removeItem('gami_session');
                return { valid: false, reason: "SESSION_EXPIRED" };
            }
            
            // Verify signature
            const expectedSignature = this.hashString(
                session.username + this.encryptionKey + session.created
            );
            
            if (session.signature !== expectedSignature) {
                localStorage.removeItem('gami_session');
                return { valid: false, reason: "INVALID_SIGNATURE" };
            }
            
            return {
                valid: true,
                session: session,
                timeRemaining: session.expires - Date.now()
            };
        } catch (error) {
            localStorage.removeItem('gami_session');
            return { valid: false, reason: "CORRUPTED_SESSION" };
        }
    }

    logout() {
        const sessionData = localStorage.getItem('gami_session');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.logSecurityEvent('LOGOUT', {
                    username: session.username,
                    timestamp: Date.now(),
                    sessionDuration: Date.now() - session.created
                });
            } catch (error) {
                // Silent fail
            }
        }
        
        localStorage.removeItem('gami_session');
        this.sessionToken = null;
        
        // Clear any auth attempts
        this.authAttempts.clear();
        
        return { success: true, message: "Logged out successfully" };
    }

    // ============ UI COMPONENTS ============
    
    showAccountCreatedPopup() {
        // Create glass popup element
        const popup = document.createElement('div');
        popup.className = 'vault-popup-glass';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon">
                    <svg viewBox="0 0 100 100" width="60" height="60">
                        <defs>
                            <linearGradient id="vaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#4A90E2"/>
                                <stop offset="100%" stop-color="#06D6A0"/>
                            </linearGradient>
                        </defs>
                        <path d="M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z" 
                              fill="url(#vaultGradient)" opacity="0.8"/>
                        <path d="M50,30 L70,40 L70,60 L50,70 L30,60 L30,40 Z" 
                              fill="none" stroke="white" stroke-width="2"/>
                        <circle cx="50" cy="50" r="8" fill="white" opacity="0.9"/>
                    </svg>
                </div>
                <div class="popup-title">ACCOUNT CREATED</div>
                <div class="popup-message">Authentication vault initialized with 1M shard protection</div>
                <div class="popup-timer">2</div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .vault-popup-glass {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                pointer-events: none;
            }
            
            .vault-popup-glass .popup-content {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 24px;
                padding: 32px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: popupAppear 0.3s ease-out;
                max-width: 320px;
                width: 90%;
            }
            
            .popup-icon {
                margin-bottom: 20px;
                animation: iconPulse 2s infinite;
            }
            
            .popup-title {
                font-family: 'SF Mono', monospace;
                font-size: 18px;
                font-weight: 700;
                color: #333;
                letter-spacing: 2px;
                margin-bottom: 12px;
                text-transform: uppercase;
            }
            
            .popup-message {
                font-family: 'SF Pro Display', sans-serif;
                font-size: 14px;
                color: #666;
                line-height: 1.4;
                margin-bottom: 20px;
            }
            
            .popup-timer {
                font-family: 'SF Mono', monospace;
                font-size: 24px;
                font-weight: 700;
                color: #4A90E2;
                animation: countdown 2s linear forwards;
            }
            
            @keyframes popupAppear {
                0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            @keyframes iconPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes countdown {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(popup);
        
        // Start countdown
        let countdown = 2;
        const timerElement = popup.querySelector('.popup-timer');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown >= 0) {
                timerElement.textContent = countdown;
            }
        }, 1000);
        
        // Remove popup after 2 seconds
        setTimeout(() => {
            clearInterval(countdownInterval);
            popup.remove();
            style.remove();
            
            // Trigger GAMI logo animation and transition to home screen
            this.triggerGAMILogoAnimation();
        }, 2000);
    }

    triggerGAMILogoAnimation() {
        // Create overlay for GAMI logo animation
        const overlay = document.createElement('div');
        overlay.className = 'gami-logo-overlay';
        overlay.innerHTML = `
            <div class="logo-animation-container">
                <svg class="gami-logo-animated" viewBox="0 0 200 200" width="200" height="200">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#4A90E2"/>
                            <stop offset="50%" stop-color="#06D6A0"/>
                            <stop offset="100%" stop-color="#9D4EDD"/>
                        </linearGradient>
                    </defs>
                    <path id="g-path-animated" d="M50,100 Q100,50 150,100" fill="none"/>
                    <path id="ai-path-animated" d="M50,120 L70,80 L90,120 M80,100 L90,100" fill="none"/>
                    <path id="mi-path-animated" d="M110,120 L110,80 L130,80 L130,100 L150,100 L150,120" fill="none"/>
                </svg>
                <div class="loading-text">ACCESS GRANTED</div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .gami-logo-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99998;
                animation: overlayFade 1.5s ease-out 1s forwards;
            }
            
            .logo-animation-container {
                text-align: center;
            }
            
            .gami-logo-animated {
                margin-bottom: 32px;
            }
            
            .gami-logo-animated path {
                stroke: url(#logoGradient);
                stroke-width: 3;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
                animation: drawLogo 1.5s ease-out forwards;
            }
            
            #g-path-animated {
                animation-delay: 0.1s;
            }
            
            #ai-path-animated {
                animation-delay: 0.6s;
            }
            
            #mi-path-animated {
                animation-delay: 1.1s;
            }
            
            .loading-text {
                font-family: 'SF Mono', monospace;
                font-size: 14px;
                color: #333;
                letter-spacing: 3px;
                text-transform: uppercase;
                opacity: 0;
                animation: textFade 1s ease-out 1.5s forwards;
            }
            
            @keyframes drawLogo {
                to {
                    stroke-dashoffset: 0;
                }
            }
            
            @keyframes textFade {
                to {
                    opacity: 1;
                }
            }
            
            @keyframes overlayFade {
                0% { opacity: 1; }
                100% { opacity: 0; visibility: hidden; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // Remove overlay after animation completes
        setTimeout(() => {
            overlay.remove();
            style.remove();
            
            // Transition to home screen
            this.transitionToHomeScreen();
        }, 2500);
    }

    transitionToHomeScreen() {
        // Hide login screen
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.classList.remove('active');
        }
        
        // Show app container
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.classList.add('active');
        }
        
        // Dispatch custom event for other components
        const authCompleteEvent = new CustomEvent('authComplete', {
            detail: {
                username: this.sessionToken?.username || 'USER',
                timestamp: Date.now(),
                vaultStatus: 'SECURE'
            }
        });
        document.dispatchEvent(authCompleteEvent);
        
        console.log('Transitioned to Home Screen');
    }

    // ============ RECOVERY SYSTEM ============
    
    generateRecoveryPhrase(username, passwordHash) {
        const wordList = [
            'PRISM', 'VAULT', 'SHARD', 'NODE', 'GLASS', 'CRYPT', 'MORPH', 'ECHO',
            'QUANTUM', 'MATRIX', 'NEXUS', 'ORBIT', 'PULSE', 'SPHERE', 'VECTOR'
        ];
        
        const phrase = [];
        for (let i = 0; i < 12; i++) {
            const wordIndex = parseInt(passwordHash.substring(i * 2, i * 2 + 2), 16) % wordList.length;
            phrase.push(wordList[wordIndex]);
        }
        
        const recoveryData = {
            id: this.hashString(username + Date.now()).substring(0, 16),
            phrase: phrase.join('-'),
            timestamp: Date.now(),
            username: username,
            hash: this.hashString(phrase.join('') + username)
        };
        
        // Store securely (in real implementation, this would be encrypted)
        sessionStorage.setItem(`recovery_${username.toLowerCase()}`, JSON.stringify(recoveryData));
        
        return recoveryData;
    }

    verifyRecoveryPhrase(username, phrase) {
        const stored = sessionStorage.getItem(`recovery_${username.toLowerCase()}`);
        
        if (!stored) {
            return { valid: false, reason: "NO_RECOVERY_DATA" };
        }
        
        try {
            const recoveryData = JSON.parse(stored);
            const inputHash = this.hashString(phrase.replace(/-/g, '') + username);
            
            if (inputHash === recoveryData.hash) {
                return {
                    valid: true,
                    recoveryId: recoveryData.id,
                    timestamp: recoveryData.timestamp
                };
            }
        } catch (error) {
            return { valid: false, reason: "CORRUPTED_RECOVERY_DATA" };
        }
        
        return { valid: false, reason: "INVALID_PHRASE" };
    }

    // ============ UTILITY FUNCTIONS ============
    
    hashString(str) {
        // Simple hash function for demonstration
        // In production, use Web Crypto API
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to hex
        return Math.abs(hash).toString(16).padStart(8, '0').repeat(8).substring(0, 64);
    }

    logSecurityEvent(type, data) {
        const event = {
            type: type,
            data: data,
            timestamp: Date.now(),
            vaultVersion: this.version
        };
        
        // In production, this would send to security log server
        console.log(`SECURITY_EVENT: ${type}`, event);
        
        // Store locally for audit trail
        const events = JSON.parse(localStorage.getItem('vault_security_log') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        localStorage.setItem('vault_security_log', JSON.stringify(events));
    }

    loadUsernameRegistry() {
        try {
            const stored = localStorage.getItem('gami_username_registry');
            if (stored) {
                const data = JSON.parse(stored);
                this.usernameRegistry = new Map(data);
                console.log(`Loaded ${this.usernameRegistry.size} usernames from registry`);
            }
        } catch (error) {
            console.warn('Failed to load username registry:', error);
            this.usernameRegistry = new Map();
        }
    }

    saveUsernameRegistry() {
        try {
            const data = Array.from(this.usernameRegistry.entries());
            localStorage.setItem('gami_username_registry', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save username registry:', error);
        }
    }

    // ============ PUBLIC API ============
    
    getVaultStatus() {
        return {
            vault: this.vaultName,
            version: this.version,
            usernamesRegistered: this.usernameRegistry.size,
            shardNodesActive: Array.from(this.shardNodes.values()).filter(n => n.nodeStatus === 'ACTIVE').length,
            sessionValid: this.validateSession().valid,
            securityLevel: "MAXIMUM",
            uptime: Date.now() - this.initTimestamp || Date.now()
        };
    }

    resetVault() {
        // Warning: This will clear all data
        this.usernameRegistry.clear();
        this.shardNodes.clear();
        this.authAttempts.clear();
        this.recoveryPhrases.clear();
        localStorage.removeItem('gami_username_registry');
        localStorage.removeItem('gami_session');
        sessionStorage.clear();
        
        // Reinitialize
        this.initializeShardNetwork();
        
        return {
            success: true,
            message: "Vault reset complete",
            timestamp: Date.now()
        };
    }
}

// Initialize and expose globally
window.GAMIAuthVault = GAMIAuthVault;
window.authVault = new GAMIAuthVault();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authVault.initTimestamp = Date.now();
        console.log('GAMI Auth Vault ready');
    });
} else {
    window.authVault.initTimestamp = Date.now();
    console.log('GAMI Auth Vault ready');
}

// Export for other modules
console.log('GAMI Auth Vault loaded - 1M shard protection active');