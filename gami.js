// Gami Login System - Pure JavaScript Implementation
// Strict Architecture: No HTML, Pure DOM Manipulation

class GamiSecuritySystem {
    constructor() {
        // Global Ledger - Blocked Usernames
        this.blockedUsernames = new Set(['asif']);
        
        // Atomic-Double-Entry Database
        this.usernameLedger = new Map();
        
        // Security Configuration
        this.maxAttempts = 3;
        this.failedAttempts = 0;
        this.isLocked = false;
        this.isReadOnly = false;
        
        // Prison Database
        this.prisonDatabase = new Set();
        
        // Device Fingerprinting
        this.deviceFingerprint = this.generateDeviceFingerprint();
        
        // Initialize the system
        this.init();
    }
    
    // Generate Device Fingerprint
    generateDeviceFingerprint() {
        const fingerprintData = {
            screenWidth: screen.width,
            screenHeight: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown'
        };
        
        // Create hash from fingerprint data
        const fingerprintString = JSON.stringify(fingerprintData);
        let hash = 0;
        for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(16);
    }
    
    // Initialize the entire UI
    init() {
        // Prevent right-click and F12
        this.setupSecurityProtocols();
        
        // Create main container
        this.createContainer();
        
        // Create UI elements
        this.createLogo();
        this.createForm();
        this.createEmergencyOverlay();
        this.createDiamondEffect();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Initialize VKG system
        this.initVKGSystem();
    }
    
    // Setup Security Protocols
    setupSecurityProtocols() {
        // Block common developer tools shortcuts
        const blockedKeys = new Set([
            'F12', 'F8', 'F5',
            'Control+Shift+I', 'Control+Shift+J', 'Control+Shift+C',
            'Control+U', 'Control+S', 'Control+P'
        ]);
        
        let currentKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            currentKeys.add(key);
            
            // Check for blocked key combinations
            const keysArray = Array.from(currentKeys);
            const keyCombination = keysArray.sort().join('+');
            
            if (blockedKeys.has(key) || blockedKeys.has(keyCombination)) {
                e.preventDefault();
                e.stopPropagation();
                this.handleSecurityBreach('keyboard_shortcut');
            }
            
            // Block Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.handleSecurityBreach('dev_tools');
            }
            
            // Block Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                this.handleSecurityBreach('console');
            }
            
            // Block Ctrl+U
            if (e.ctrlKey && e.key === 'U') {
                e.preventDefault();
                this.handleSecurityBreach('view_source');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            currentKeys.delete(e.key);
        });
        
        // Block right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleSecurityBreach('right_click');
        });
        
        // Prevent text selection
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        // Block iframe embedding
        if (window.self !== window.top) {
            this.handleSecurityBreach('iframe_embedding');
        }
    }
    
    // Create Main Container
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'gami-container';
        document.body.appendChild(this.container);
    }
    
    // Create Gami Logo
    createLogo() {
        this.logo = document.createElement('div');
        this.logo.className = 'gami-logo';
        this.logo.textContent = 'GAMI';
        this.container.appendChild(this.logo);
    }
    
    // Create Login Form
    createForm() {
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'gami-form-container';
        this.container.appendChild(this.formContainer);
        
        // Username Field
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'gami-form-group';
        
        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'gami-label';
        usernameLabel.textContent = 'Username';
        usernameLabel.htmlFor = 'gami-username';
        
        this.usernameInput = document.createElement('input');
        this.usernameInput.type = 'text';
        this.usernameInput.id = 'gami-username';
        this.usernameInput.className = 'gami-input';
        this.usernameInput.placeholder = 'Enter your username';
        
        this.usernameStatus = document.createElement('div');
        this.usernameStatus.className = 'gami-availability';
        
        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameInput);
        usernameGroup.appendChild(this.usernameStatus);
        
        // Password Field
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'gami-form-group';
        
        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'gami-label';
        passwordLabel.textContent = 'Password';
        passwordLabel.htmlFor = 'gami-password';
        
        this.passwordInput = document.createElement('input');
        this.passwordInput.type = 'password';
        this.passwordInput.id = 'gami-password';
        this.passwordInput.className = 'gami-input';
        this.passwordInput.placeholder = 'Enter your password';
        
        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordInput);
        
        // Subscribe Button
        this.subscribeButton = document.createElement('button');
        this.subscribeButton.className = 'gami-subscribe-btn';
        this.subscribeButton.textContent = 'Subscribe';
        
        // Forgot Password Link
        this.forgotLink = document.createElement('a');
        this.forgotLink.className = 'gami-forgot-link';
        this.forgotLink.textContent = 'Forgot Password?';
        
        // Success Message
        this.successMessage = document.createElement('div');
        this.successMessage.className = 'gami-success-message';
        this.successMessage.textContent = 'SUCCESSFULLY: GAMI APP ACCOUNT CREATED';
        
        // Assemble Form
        this.formContainer.appendChild(usernameGroup);
        this.formContainer.appendChild(passwordGroup);
        this.formContainer.appendChild(this.subscribeButton);
        this.formContainer.appendChild(this.forgotLink);
        this.formContainer.appendChild(this.successMessage);
    }
    
    // Create Emergency Overlay
    createEmergencyOverlay() {
        this.emergencyOverlay = document.createElement('div');
        this.emergencyOverlay.className = 'gami-emergency-overlay';
        
        const hyperVoxel = document.createElement('div');
        hyperVoxel.className = 'gami-hyper-voxel';
        
        const warningIcon = document.createElement('div');
        warningIcon.className = 'vkg-warning';
        
        const glitchText = document.createElement('div');
        glitchText.className = 'gami-glitch-text';
        glitchText.innerHTML = `
            UNAUTHORIZED ACCESS DETECTED!<br><br>
            Aapka Device ID (${this.deviceFingerprint})<br>
            Gami Master Server par broadcast kar diya gaya hai.<br><br>
            Security Lockdown 100% complete.<br>
            Ab ye account sirf Admin reset se khulega.
        `;
        
        hyperVoxel.appendChild(warningIcon);
        hyperVoxel.appendChild(glitchText);
        this.emergencyOverlay.appendChild(hyperVoxel);
        document.body.appendChild(this.emergencyOverlay);
    }
    
    // Create Diamond Effect
    createDiamondEffect() {
        this.diamondEffect = document.createElement('div');
        this.diamondEffect.className = 'gami-diamond-effect';
        document.body.appendChild(this.diamondEffect);
    }
    
    // Initialize VKG System
    initVKGSystem() {
        // Replace any emoji elements with VKG
        this.replaceEmojisWithVKG();
    }
    
    // Replace Emojis with VKG
    replaceEmojisWithVKG() {
        // Global emoji suppression
        document.querySelectorAll('*').forEach(element => {
            if (element.nodeType === Node.TEXT_NODE) {
                const text = element.nodeValue;
                if (/\p{Emoji}/u.test(text)) {
                    const parent = element.parentNode;
                    const newText = document.createTextNode(
                        text.replace(/\p{Emoji}/gu, '')
                    );
                    parent.replaceChild(newText, element);
                }
            }
        });
    }
    
    // Setup Event Listeners
    setupEventListeners() {
        // Username real-time validation
        this.usernameInput.addEventListener('input', () => {
            this.checkUsernameAvailability();
        });
        
        // Subscribe button
        this.subscribeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSubscribe();
        });
        
        // Forgot password
        this.forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
        
        // Prevent form submission
        this.formContainer.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
    
    // Check Username Availability
    checkUsernameAvailability() {
        const username = this.usernameInput.value.trim().toLowerCase();
        
        if (!username) {
            this.usernameStatus.className = 'gami-availability';
            return;
        }
        
        // Check against blocked usernames
        if (this.blockedUsernames.has(username)) {
            this.usernameStatus.className = 'gami-availability gami-taken';
            this.usernameStatus.textContent = 'Username blocked by system';
            return;
        }
        
        // Check atomic double-entry ledger
        if (this.usernameLedger.has(username)) {
            this.usernameStatus.className = 'gami-availability gami-taken';
            this.usernameStatus.textContent = 'Username already taken';
        } else {
            this.usernameStatus.className = 'gami-availability gami-available';
            this.usernameStatus.textContent = 'Username available';
        }
    }
    
    // Handle Subscribe
    handleSubscribe() {
        if (this.isLocked || this.isReadOnly) {
            return;
        }
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        // Validate inputs
        if (!username || !password) {
            this.showVKG('warning', 'Please fill all fields');
            return;
        }
        
        // Check if username is blocked
        if (this.blockedUsernames.has(username.toLowerCase())) {
            this.handleFailedAttempt();
            return;
        }
        
        // Check if username already exists
        if (this.usernameLedger.has(username)) {
            this.showVKG('warning', 'Username already exists');
            return;
        }
        
        // Quantum-Shield-AES-512 simulation
        const encryptedPassword = this.quantumShieldEncrypt(password);
        
        // Check password uniqueness
        if (this.isPasswordDuplicate(encryptedPassword)) {
            this.showVKG('warning', 'Password security threat detected');
            this.handleFailedAttempt();
            return;
        }
        
        // Successful subscription
        this.usernameLedger.set(username, {
            password: encryptedPassword,
            timestamp: Date.now(),
            deviceFingerprint: this.deviceFingerprint
        });
        
        this.showSuccessAnimation();
    }
    
    // Quantum Shield Encryption Simulation
    quantumShieldEncrypt(password) {
        // Simulated quantum encryption
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        // Add quantum noise
        const quantumNoise = Math.random().toString(36).substring(2, 15);
        return (Math.abs(hash) + quantumNoise).toString(36);
    }
    
    // Check for duplicate passwords
    isPasswordDuplicate(encryptedPassword) {
        for (const [username, data] of this.usernameLedger) {
            if (data.password === encryptedPassword) {
                return true;
            }
        }
        return false;
    }
    
    // Show Success Animation
    showSuccessAnimation() {
        // Show success message
        this.successMessage.style.display = 'block';
        this.formContainer.style.display = 'none';
        
        // Show VKG success animation
        this.showVKG('success', 'Account created successfully');
        
        // Phase 2: Transition after 2 seconds
        setTimeout(() => {
            this.successMessage.style.display = 'none';
            this.startGamiTransition();
        }, 2000);
    }
    
    // Start Gami Transition
    startGamiTransition() {
        // Create animated logo
        this.animatedLogo = document.createElement('div');
        this.animatedLogo.className = 'gami-logo gami-logo-animate';
        this.animatedLogo.textContent = 'GAMI';
        this.animatedLogo.style.display = 'block';
        
        // Clear container and show animated logo
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.container.appendChild(this.animatedLogo);
        
        // Phase 3: 3-second initialization
        setTimeout(() => {
            // Phase 4: Enter the World
            this.enterGamiWorld();
        }, 3000);
    }
    
    // Enter Gami World
    enterGamiWorld() {
        // Remove animated logo
        this.animatedLogo.style.opacity = '0';
        this.animatedLogo.style.transform = 'translate(-50%, -50%) scale(1.5)';
        this.animatedLogo.style.transition = 'all 0.5s ease';
        
        // After transition, load the next screen
        setTimeout(() => {
            this.loadDashboard();
        }, 500);
    }
    
    // Load Dashboard (Placeholder)
    loadDashboard() {
        this.container.innerHTML = '';
        this.container.style.background = '#FFFFFF';
        
        const welcomeMessage = document.createElement('div');
        welcomeMessage.style.cssText = `
            text-align: center;
            padding: 40px;
            font-size: 2rem;
            color: #666;
            font-weight: 700;
        `;
        welcomeMessage.textContent = 'Welcome to Gami World';
        
        this.container.appendChild(welcomeMessage);
    }
    
    // Handle Forgot Password
    handleForgotPassword() {
        const username = prompt('Enter your username for password recovery:');
        
        if (!username) {
            return;
        }
        
        if (this.usernameLedger.has(username)) {
            // Generate lockdown password
            const lockdownPassword = this.generateLockdownPassword();
            
            alert(`Your account has been locked for security.\nTemporary Password: ${lockdownPassword}\n\nThis password will only work after admin reset.`);
            
            // Add to prison database
            this.prisonDatabase.add(this.deviceFingerprint);
            
            // Lock the account
            this.isLocked = true;
            this.showVKG('warning', 'Account locked for security');
        } else {
            alert('Username not found in system.');
        }
    }
    
    // Generate Lockdown Password
    generateLockdownPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    
    // Handle Failed Attempt
    handleFailedAttempt() {
        this.failedAttempts++;
        
        if (this.failedAttempts >= this.maxAttempts) {
            // Trigger emergency overlay
            this.triggerEmergencyOverlay();
            
            // Add to prison database
            this.prisonDatabase.add(this.deviceFingerprint);
            
            // Lock the system
            this.isLocked = true;
            this.isReadOnly = true;
            
            // Trigger vibration if available
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
        } else {
            this.showVKG('warning', `Invalid attempt. ${this.maxAttempts - this.failedAttempts} attempts remaining`);
        }
    }
    
    // Trigger Emergency Overlay
    triggerEmergencyOverlay() {
        this.emergencyOverlay.classList.add('gami-emergency-active');
        document.body.classList.add('gami-lockdown');
        
        // Broadcast to "Master Server" (simulated)
        this.broadcastToMasterServer();
    }
    
    // Broadcast to Master Server
    broadcastToMasterServer() {
        const breachData = {
            deviceId: this.deviceFingerprint,
            timestamp: Date.now(),
            breachType: 'multiple_failed_attempts',
            userAgent: navigator.userAgent,
            ip: 'Fetching...' // In real implementation, this would fetch actual IP
        };
        
        // Simulate broadcast
        console.warn('SECURITY BREACH BROADCAST:', breachData);
        
        // Store in local storage as simulation
        localStorage.setItem('gami_security_breach', JSON.stringify(breachData));
    }
    
    // Handle Security Breach
    handleSecurityBreach(breachType) {
        // Add to prison database
        this.prisonDatabase.add(this.deviceFingerprint);
        
        // Trigger immediate lockdown
        this.isLocked = true;
        this.isReadOnly = true;
        
        // Update emergency message
        const glitchText = this.emergencyOverlay.querySelector('.gami-glitch-text');
        glitchText.innerHTML = `
            CRITICAL WARNING: System Unauthorized Access Detected.<br><br>
            Breach Type: ${breachType.replace('_', ' ').toUpperCase()}<br>
            Your Device ID (${this.deviceFingerprint}) is now being broadcasted to the Master Server.<br>
            Mobile Lockdown Initiated.<br><br>
            All local data is being monitored by Gami Security Core.
        `;
        
        // Show emergency overlay
        this.triggerEmergencyOverlay();
    }
    
    // Show VKG (Vocalic Kinetic Glyphs)
    showVKG(type, message) {
        // Remove existing VKG
        const existingVKG = document.querySelector('.gami-vkg-notification');
        if (existingVKG) {
            existingVKG.remove();
        }
        
        // Create VKG container
        const vkgContainer = document.createElement('div');
        vkgContainer.className = 'gami-vkg-notification';
        vkgContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FFFFFF;
            padding: 15px;
            border-radius: 15px;
            box-shadow: 10px 10px 20px #e8e8e8, -10px -10px 20px #ffffff;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            min-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Create VKG icon
        const vkgIcon = document.createElement('div');
        vkgIcon.className = type === 'success' ? 'vkg-success' : 'vkg-warning';
        
        // Create message
        const vkgMessage = document.createElement('div');
        vkgMessage.style.cssText = `
            color: #666;
            font-weight: 600;
            font-size: 0.9rem;
        `;
        vkgMessage.textContent = message;
        
        vkgContainer.appendChild(vkgIcon);
        vkgContainer.appendChild(vkgMessage);
        document.body.appendChild(vkgContainer);
        
        // Animate in
        setTimeout(() => {
            vkgContainer.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            vkgContainer.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (vkgContainer.parentNode) {
                    vkgContainer.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the Gami Security System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the system
    window.gamiSystem = new GamiSecuritySystem();
    
    // Apply global styles
    document.body.style.cssText = `
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #FFFFFF;
        height: 100vh;
        width: 100vw;
    `;
    
    // Disable zoom
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Disable touch zoom
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Prevent loading in iframes
if (window.self !== window.top) {
    window.top.location = window.self.location;
}