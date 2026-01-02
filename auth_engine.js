// GAMI Authentication Engine - 3-Tier Security System
class GAMIAuthEngine {
    constructor() {
        this.currentUser = null;
        this.authTier = 'static';
        this.alphaUsernames = new Set();
        this.ownerMode = false;
        this.logoPressTimer = null;
        this.logoPressStart = 0;
        
        this.init();
    }
    
    init() {
        this.loadAlphaUsernames();
        this.setupEventListeners();
        this.setupOwnerMode();
        console.log('GAMI Auth Engine Initialized');
    }
    
    loadAlphaUsernames() {
        // Load existing usernames from localStorage
        const savedUsernames = localStorage.getItem('gami_alpha_usernames');
        if (savedUsernames) {
            this.alphaUsernames = new Set(JSON.parse(savedUsernames));
        }
        
        // Add some demo usernames
        const demoUsernames = [
            'alpha_executive',
            'business_master',
            'market_leader',
            'trade_tycoon',
            'finance_guru'
        ];
        
        demoUsernames.forEach(username => {
            this.alphaUsernames.add(username);
        });
    }
    
    saveAlphaUsernames() {
        localStorage.setItem('gami_alpha_usernames', 
            JSON.stringify(Array.from(this.alphaUsernames)));
    }
    
    setupEventListeners() {
        // Username validation
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                this.validateUsername(e.target.value);
            });
        }
        
        // Password strength check
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }
        
        // Login form submission
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Guest mode button
        const guestModeBtn = document.getElementById('guestModeBtn');
        if (guestModeBtn) {
            guestModeBtn.addEventListener('click', () => {
                this.toggleGuestMode();
            });
        }
        
        // Master password buttons
        document.querySelectorAll('.password-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const password = e.target.dataset.password;
                this.handleMasterPassword(password);
            });
        });
        
        // Authentication tier selection
        const authTierSelect = document.getElementById('authTier');
        if (authTierSelect) {
            authTierSelect.addEventListener('change', (e) => {
                this.authTier = e.target.value;
                this.showTierInstructions();
            });
        }
        
        // Logo press for owner mode
        const logoContainer = document.getElementById('logoContainer');
        if (logoContainer) {
            logoContainer.addEventListener('mousedown', this.startLogoPress.bind(this));
            logoContainer.addEventListener('touchstart', this.startLogoPress.bind(this));
            
            logoContainer.addEventListener('mouseup', this.endLogoPress.bind(this));
            logoContainer.addEventListener('touchend', this.endLogoPress.bind(this));
            logoContainer.addEventListener('mouseleave', this.cancelLogoPress.bind(this));
        }
        
        // Logo small click for omega console
        const logoSmall = document.getElementById('logoSmall');
        if (logoSmall) {
            let tapCount = 0;
            let tapTimer = null;
            
            logoSmall.addEventListener('click', () => {
                tapCount++;
                
                if (tapCount === 1) {
                    tapTimer = setTimeout(() => {
                        tapCount = 0;
                    }, 500);
                } else if (tapCount === 3) {
                    clearTimeout(tapTimer);
                    tapCount = 0;
                    this.showOmegaConsole();
                }
            });
        }
        
        // Omega console trigger
        const omegaTrigger = document.getElementById('omegaConsoleTrigger');
        if (omegaTrigger) {
            omegaTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOmegaConsole();
            });
        }
        
        // Close omega console
        const closeOmegaBtn = document.getElementById('closeOmegaBtn');
        if (closeOmegaBtn) {
            closeOmegaBtn.addEventListener('click', () => {
                this.hideOmegaConsole();
            });
        }
        
        // Neural Link button
        const neuralLinkBtn = document.getElementById('neuralLinkBtn');
        if (neuralLinkBtn) {
            neuralLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNeuralLink();
            });
        }
        
        // Floating neural link button
        const floatingNeuralBtn = document.getElementById('floatingNeuralBtn');
        if (floatingNeuralBtn) {
            floatingNeuralBtn.addEventListener('click', () => {
                this.showNeuralLink();
            });
        }
        
        // Close neural link
        const closeNeuralBtn = document.getElementById('closeNeuralBtn');
        if (closeNeuralBtn) {
            closeNeuralBtn.addEventListener('click', () => {
                this.hideNeuralLink();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Profile dropdown toggle
        const profileToggle = document.getElementById('profileToggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', () => {
                this.toggleProfileDropdown();
            });
        }
    }
    
    setupOwnerMode() {
        // Create owner mode settings if they don't exist
        if (!localStorage.getItem('gami_owner_mode')) {
            localStorage.setItem('gami_owner_mode', JSON.stringify({
                unlocked: false,
                features: [],
                accessLevel: 0
            }));
        }
        
        // Check if owner mode is unlocked
        const ownerModeData = JSON.parse(localStorage.getItem('gami_owner_mode'));
        this.ownerMode = ownerModeData.unlocked;
    }
    
    validateUsername(username) {
        const statusElement = document.getElementById('usernameStatus');
        if (!statusElement) return;
        
        // Clear previous status
        statusElement.className = 'username-status';
        statusElement.textContent = '';
        
        if (username.length < 4) {
            statusElement.textContent = 'Username must be at least 4 characters';
            return;
        }
        
        if (!/^[A-Za-z][A-Za-z0-9_]{3,19}$/.test(username)) {
            statusElement.textContent = 'Must start with letter, only letters, numbers, underscore';
            return;
        }
        
        if (this.alphaUsernames.has(username)) {
            statusElement.textContent = 'Username already taken';
            statusElement.classList.add('taken');
        } else {
            statusElement.textContent = 'Username available';
            statusElement.classList.add('available');
        }
    }
    
    checkPasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        if (!strengthElement) return;
        
        let strength = 0;
        let feedback = '';
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        strengthElement.className = 'password-strength';
        
        switch(strength) {
            case 0:
            case 1:
                feedback = 'Weak password';
                strengthElement.classList.add('weak');
                break;
            case 2:
                feedback = 'Moderate password';
                break;
            case 3:
                feedback = 'Strong password';
                strengthElement.classList.add('strong');
                break;
            case 4:
                feedback = 'Very strong password';
                strengthElement.classList.add('strong');
                break;
        }
        
        strengthElement.textContent = feedback;
    }
    
    showTierInstructions() {
        // This would show specific instructions for each auth tier
        console.log(`Switched to ${this.authTier} authentication`);
        
        // In a full implementation, this would update UI elements
        // to show tier-specific instructions and requirements
    }
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }
        
        // Validate username format
        if (!/^[A-Za-z][A-Za-z0-9_]{3,19}$/.test(username)) {
            this.showAuthError('Invalid username format');
            return;
        }
        
        // Check if username is taken
        if (this.alphaUsernames.has(username)) {
            this.showAuthError('Username already exists. Please choose another.');
            return;
        }
        
        // Process based on auth tier
        switch(this.authTier) {
            case 'static':
                this.processStaticAuth(username, password);
                break;
            case 'time':
                this.processTimeBasedAuth(username, password);
                break;
            case 'behavioral':
                this.processBehavioralAuth(username, password);
                break;
        }
    }
    
    processStaticAuth(username, password) {
        // Generate user hash for local storage
        const userHash = this.generateUserHash(username, password);
        
        // Create user object
        this.currentUser = {
            username,
            authTier: 'static',
            userHash,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Add to alpha usernames
        this.alphaUsernames.add(username);
        this.saveAlphaUsernames();
        
        // Save user data
        this.saveUserData();
        
        // Proceed to home
        this.enterHome();
    }
    
    processTimeBasedAuth(username, password) {
        // Get current time factors
        const now = new Date();
        const timeFactor = now.getHours() * 100 + now.getMinutes();
        
        // Create time-based password hash
        const timePassword = password + timeFactor.toString();
        const userHash = this.generateUserHash(username, timePassword);
        
        this.currentUser = {
            username,
            authTier: 'time',
            userHash,
            timeFactor,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.alphaUsernames.add(username);
        this.saveAlphaUsernames();
        this.saveUserData();
        this.enterHome();
    }
    
    processBehavioralAuth(username, password) {
        // For behavioral auth, we would track mouse movements, typing patterns, etc.
        // This is a simplified version
        const behavioralData = {
            timestamp: Date.now(),
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            userAgent: navigator.userAgent
        };
        
        const behavioralHash = this.generateUserHash(
            username + password,
            JSON.stringify(behavioralData)
        );
        
        this.currentUser = {
            username,
            authTier: 'behavioral',
            userHash: behavioralHash,
            behavioralData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.alphaUsernames.add(username);
        this.saveAlphaUsernames();
        this.saveUserData();
        this.enterHome();
    }
    
    generateUserHash(username, password) {
        // Simple hash function for demonstration
        // In production, use a proper cryptographic hash
        let hash = 0;
        const str = username + ':' + password + ':' + Date.now();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
    
    saveUserData() {
        if (!this.currentUser) return;
        
        const userData = {
            ...this.currentUser,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('gami_current_user', JSON.stringify(userData));
    }
    
    loadUserData() {
        const savedUser = localStorage.getItem('gami_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            return true;
        }
        return false;
    }
    
    enterHome() {
        // Hide logo and auth layers
        const logoContainer = document.getElementById('logoContainer');
        const authLayer = document.getElementById('authLayer');
        const homeLayer = document.getElementById('homeLayer');
        
        if (logoContainer) logoContainer.style.display = 'none';
        if (authLayer) authLayer.classList.remove('active');
        if (homeLayer) homeLayer.classList.add('active');
        
        // Update profile display
        this.updateProfileDisplay();
        
        // Initialize user data
        this.initializeUserData();
        
        // Log successful login
        console.log(`User ${this.currentUser.username} logged in via ${this.currentUser.authTier} auth`);
    }
    
    updateProfileDisplay() {
        if (!this.currentUser) return;
        
        // Update profile elements
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        const dropdownUsername = document.getElementById('dropdownUsername');
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        
        if (profileName) {
            profileName.textContent = this.currentUser.username;
        }
        
        if (profileAvatar) {
            profileAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
        }
        
        if (dropdownUsername) {
            dropdownUsername.textContent = this.currentUser.username;
        }
        
        if (dropdownAvatar) {
            dropdownAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
        }
    }
    
    initializeUserData() {
        // Initialize user's business data
        if (!localStorage.getItem('gami_user_data_' + this.currentUser.username)) {
            const initialData = {
                coins: BigInt(1000), // Starting capital
                businesses: [],
                employees: [],
                properties: [],
                level: 1,
                experience: 0,
                lastUpdate: Date.now()
            };
            
            localStorage.setItem(
                'gami_user_data_' + this.currentUser.username,
                JSON.stringify(initialData, (key, value) => 
                    typeof value === 'bigint' ? value.toString() : value
                )
            );
        }
        
        // Update coin display
        this.updateCoinDisplay();
    }
    
    updateCoinDisplay() {
        const coinCount = document.getElementById('coinCount');
        if (!coinCount || !this.currentUser) return;
        
        const userData = localStorage.getItem('gami_user_data_' + this.currentUser.username);
        if (userData) {
            const data = JSON.parse(userData);
            coinCount.textContent = data.coins;
        }
    }
    
    toggleGuestMode() {
        const guestPanel = document.getElementById('guestModePanel');
        if (guestPanel) {
            guestPanel.classList.toggle('active');
        }
    }
    
    handleMasterPassword(password) {
        const attemptCountElement = document.getElementById('attemptCount');
        let attempts = parseInt(attemptCountElement.textContent);
        
        // Check password
        const validPasswords = [
            'GAMI_DEMO_2024',
            'TIME_TRAVEL_ACCESS',
            'OMEGA_SETTINGS_KEY'
        ];
        
        if (validPasswords.includes(password)) {
            // Successful guest login
            this.currentUser = {
                username: 'guest_' + Date.now(),
                authTier: 'guest',
                guestPassword: password,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            
            this.enterHome();
            
            // Special features based on password
            if (password === 'OMEGA_SETTINGS_KEY') {
                this.unlockOwnerMode();
            }
        } else {
            // Failed attempt
            attempts--;
            attemptCountElement.textContent = attempts;
            
            if (attempts <= 0) {
                // Hide guest mode panel after 3 failed attempts
                const guestPanel = document.getElementById('guestModePanel');
                if (guestPanel) {
                    guestPanel.style.display = 'none';
                }
                
                // Show error message
                this.showAuthError('Guest mode disabled due to multiple failed attempts');
            } else {
                this.showAuthError(`Incorrect master password. ${attempts} attempts remaining.`);
            }
        }
    }
    
    unlockOwnerMode() {
        this.ownerMode = true;
        
        const ownerModeData = {
            unlocked: true,
            unlockedAt: new Date().toISOString(),
            features: ['time_skip', 'interest_compounder', 'world_editor'],
            accessLevel: 100
        };
        
        localStorage.setItem('gami_owner_mode', JSON.stringify(ownerModeData));
        
        // Show notification
        this.showNotification('Owner Mode Unlocked!', 'All Omega Console features are now available.');
    }
    
    startLogoPress(e) {
        this.logoPressStart = Date.now();
        this.logoPressTimer = setTimeout(() => {
            this.activateOwnerMode();
        }, 3000); // 3 second long press
    }
    
    endLogoPress() {
        if (this.logoPressTimer) {
            clearTimeout(this.logoPressTimer);
            this.logoPressTimer = null;
        }
    }
    
    cancelLogoPress() {
        if (this.logoPressTimer) {
            clearTimeout(this.logoPressTimer);
            this.logoPressTimer = null;
        }
    }
    
    activateOwnerMode() {
        if (!this.ownerMode) {
            this.unlockOwnerMode();
            this.showNotification('Owner Mode Activated', 'Long press detected. Omega Console unlocked.');
        }
    }
    
    showOmegaConsole() {
        if (!this.ownerMode) {
            this.showAuthError('Owner Mode required to access Omega Console');
            return;
        }
        
        const omegaConsole = document.getElementById('omegaConsole');
        if (omegaConsole) {
            omegaConsole.classList.add('active');
        }
    }
    
    hideOmegaConsole() {
        const omegaConsole = document.getElementById('omegaConsole');
        if (omegaConsole) {
            omegaConsole.classList.remove('active');
        }
    }
    
    showNeuralLink() {
        const neuralLinkLayer = document.getElementById('neuralLinkLayer');
        if (neuralLinkLayer) {
            neuralLinkLayer.classList.add('active');
            
            // Initialize neural link data
            this.initializeNeuralLink();
        }
    }
    
    hideNeuralLink() {
        const neuralLinkLayer = document.getElementById('neuralLinkLayer');
        if (neuralLinkLayer) {
            neuralLinkLayer.classList.remove('active');
        }
    }
    
    initializeNeuralLink() {
        // Count buttons in the system
        const buttons = document.querySelectorAll('button');
        const buttonCount = document.getElementById('buttonCount');
        if (buttonCount) {
            buttonCount.textContent = buttons.length;
        }
        
        // Count variables (simplified)
        const variableCount = document.getElementById('variableCount');
        if (variableCount) {
            // This would be populated by scanning the actual code
            variableCount.textContent = '24'; // Placeholder
        }
        
        // Initialize memory log
        const memoryLog = document.getElementById('memoryLog');
        if (memoryLog) {
            memoryLog.innerHTML = `
                <div class="log-entry">[${new Date().toISOString()}] Neural Link Initialized</div>
                <div class="log-entry">[${new Date().toISOString()}] Scanning system components...</div>
                <div class="log-entry">[${new Date().toISOString()}] Found ${buttons.length} interactive elements</div>
                <div class="log-entry">[${new Date().toISOString()}] Auth Engine: ${this.authTier} mode active</div>
                <div class="log-entry">[${new Date().toISOString()}] User: ${this.currentUser ? this.currentUser.username : 'None'}</div>
                <div class="log-entry">[${new Date().toISOString()}] Owner Mode: ${this.ownerMode ? 'ACTIVE' : 'INACTIVE'}</div>
            `;
        }
        
        // Setup AI command execution
        const executeAiBtn = document.getElementById('executeAiBtn');
        if (executeAiBtn) {
            executeAiBtn.addEventListener('click', () => {
                this.executeAICommand();
            });
        }
        
        // Setup system scan
        const scanSystemBtn = document.getElementById('scanSystemBtn');
        if (scanSystemBtn) {
            scanSystemBtn.addEventListener('click', () => {
                this.scanSystem();
            });
        }
    }
    
    executeAICommand() {
        const commandInput = document.getElementById('aiCommand');
        const memoryLog = document.getElementById('memoryLog');
        
        if (!commandInput || !memoryLog) return;
        
        const command = commandInput.value.trim();
        if (!command) return;
        
        // Add command to log
        const timestamp = new Date().toISOString();
        memoryLog.innerHTML += `
            <div class="log-entry command">[${timestamp}] COMMAND: ${command}</div>
        `;
        
        // Process command (simplified for this example)
        let response = '';
        
        if (command.toLowerCase().includes('count buttons')) {
            const buttons = document.querySelectorAll('button').length;
            response = `System contains ${buttons} buttons.`;
        } else if (command.toLowerCase().includes('current user')) {
            response = `Current user: ${this.currentUser ? this.currentUser.username : 'None'}`;
        } else if (command.toLowerCase().includes('toggle theme')) {
            response = 'Theme modification commands are logged but not executed in this demo.';
        } else {
            response = `Command processed: "${command}"`;
        }
        
        memoryLog.innerHTML += `
            <div class="log-entry response">[${timestamp}] RESPONSE: ${response}</div>
        `;
        
        // Clear input
        commandInput.value = '';
        
        // Scroll to bottom
        memoryLog.scrollTop = memoryLog.scrollHeight;
    }
    
    scanSystem() {
        const memoryLog = document.getElementById('memoryLog');
        if (!memoryLog) return;
        
        const timestamp = new Date().toISOString();
        
        // Collect system information
        const systemInfo = {
            screenSize: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent.substring(0, 50) + '...',
            online: navigator.onLine,
            localStorageKeys: Object.keys(localStorage).length,
            buttons: document.querySelectorAll('button').length,
            inputs: document.querySelectorAll('input, textarea, select').length,
            divs: document.querySelectorAll('div').length
        };
        
        let scanResult = `[${timestamp}] SYSTEM SCAN RESULTS:\n`;
        for (const [key, value] of Object.entries(systemInfo)) {
            scanResult += `  ${key}: ${value}\n`;
        }
        
        memoryLog.innerHTML += `
            <div class="log-entry scan">${scanResult.replace(/\n/g, '<br>')}</div>
        `;
        
        memoryLog.scrollTop = memoryLog.scrollHeight;
    }
    
    toggleProfileDropdown() {
        const profileContainer = document.querySelector('.profile-container');
        if (profileContainer) {
            profileContainer.classList.toggle('active');
        }
    }
    
    handleLogout() {
        // Clear current user
        this.currentUser = null;
        
        // Hide home layer
        const homeLayer = document.getElementById('homeLayer');
        if (homeLayer) {
            homeLayer.classList.remove('active');
        }
        
        // Show logo container again
        const logoContainer = document.getElementById('logoContainer');
        if (logoContainer) {
            logoContainer.style.display = 'flex';
        }
        
        // Reset auth form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.reset();
        }
        
        // Close profile dropdown
        const profileContainer = document.querySelector('.profile-container');
        if (profileContainer) {
            profileContainer.classList.remove('active');
        }
        
        // Show logout notification
        this.showNotification('Logged Out', 'You have been successfully logged out.');
    }
    
    showAuthError(message) {
        // Create error element if it doesn't exist
        let errorElement = document.querySelector('.auth-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'auth-error glass-card';
            errorElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: rgba(220, 38, 38, 0.9);
                color: white;
                border-radius: 10px;
                z-index: 10000;
                display: none;
            `;
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    showNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'gami-notification glass-card';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px;
            background: rgba(37, 99, 235, 0.9);
            color: white;
            border-radius: 12px;
            z-index: 10000;
            max-width: 300px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
        `;
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px; font-size: 1.1rem;">${title}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Start logo animation function (called from HTML)
window.startLogoAnimation = function() {
    // This function is called from the HTML to start the logo animation
    // The actual animation is handled by CSS animations
    console.log('GAMI Logo animation started');
    
    // After animation completes, show auth layer
    setTimeout(() => {
        const authLayer = document.getElementById('authLayer');
        if (authLayer) {
            authLayer.classList.add('active');
        }
    }, 4500); // Match the total animation duration
};

// Initialize GAMI Auth Engine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GAMIAuth = new GAMIAuthEngine();
});