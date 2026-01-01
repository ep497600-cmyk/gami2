class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.guestAttempts = 3;
        this.guestPassword = "GAMI_GUEST_ACCESS_2024";
        this.isGuestMode = false;
        this.db = new DatabaseSystem();
        
        this.initializeEvents();
    }
    
    initializeEvents() {
        // Splash screen sequence
        setTimeout(() => {
            document.getElementById('splashScreen').classList.add('hidden');
            document.getElementById('loginScreen').classList.remove('hidden');
        }, 3000);
        
        // Login button
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        
        // Guest button
        document.getElementById('guestBtn').addEventListener('click', () => this.showGuestGate());
        
        // Guest access
        document.getElementById('guestAccessBtn').addEventListener('click', () => this.accessGuestMode());
        
        // New account toggle
        document.getElementById('toggleNewAccount').addEventListener('click', () => this.toggleNewAccount());
        
        // Create account
        document.getElementById('createAccountBtn').addEventListener('click', () => this.createAccount());
        
        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('guestGate').classList.contains('hidden')) {
                    this.login();
                } else {
                    this.accessGuestMode();
                }
            }
        });
    }
    
    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            this.showMessage("Please enter username and password", "error");
            return;
        }
        
        const user = await this.db.getUser(username);
        
        if (user && user.password === this.hashPassword(password)) {
            await this.successfulLogin(username, false);
        } else {
            this.showMessage("Invalid credentials", "error");
        }
    }
    
    showGuestGate() {
        document.getElementById('guestGate').classList.remove('hidden');
        document.getElementById('attemptCount').textContent = this.guestAttempts;
    }
    
    accessGuestMode() {
        const enteredPassword = document.getElementById('guestPassword').value;
        
        if (enteredPassword === this.guestPassword) {
            this.isGuestMode = true;
            this.successfulLogin("Guest_User_" + Math.random().toString(36).substr(2, 6), true);
        } else {
            this.guestAttempts--;
            document.getElementById('attemptCount').textContent = this.guestAttempts;
            
            if (this.guestAttempts <= 0) {
                document.getElementById('guestBtn').classList.add('hidden');
                document.getElementById('guestGate').classList.add('hidden');
                this.showMessage("Guest access disabled", "error");
            } else {
                this.showMessage("Incorrect password", "error");
            }
        }
    }
    
    async successfulLogin(username, isGuest) {
        this.currentUser = {
            username,
            isGuest,
            coins: isGuest ? 1000 : await this.getUserCoins(username)
        };
        
        // Show welcome message
        const loginScreen = document.getElementById('loginScreen');
        loginScreen.innerHTML = `
            <div class="glass-container">
                <h2 style="text-align: center; margin-bottom: 30px;">Welcome ${username}</h2>
                <p style="text-align: center;">Loading your GAMI experience...</p>
            </div>
        `;
        
        // Transition to game
        setTimeout(async () => {
            loginScreen.classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            document.getElementById('welcomeUser').textContent = username;
            
            // Initialize game systems
            await this.db.syncUserData(this.currentUser);
            window.gameSystem.initialize();
            window.aiEngine.initialize();
            
            // Update coin display
            this.updateCoinDisplay();
        }, 2000);
    }
    
    toggleNewAccount() {
        const section = document.getElementById('newAccountSection');
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            document.getElementById('toggleNewAccount').textContent = "Back to Login";
        } else {
            section.classList.add('hidden');
            document.getElementById('toggleNewAccount').textContent = "Create New Account";
        }
    }
    
    async createAccount() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !password || !confirmPassword) {
            this.showMessage("All fields are required", "error");
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage("Passwords do not match", "error");
            return;
        }
        
        if (password.length < 8) {
            this.showMessage("Password must be at least 8 characters", "error");
            return;
        }
        
        const userExists = await this.db.checkUserExists(username);
        
        if (userExists) {
            this.showMessage("Username already exists", "error");
            return;
        }
        
        const newUser = {
            username,
            password: this.hashPassword(password),
            coins: 100,
            stars: 0,
            helpers: 0,
            createdAt: new Date().toISOString()
        };
        
        await this.db.createUser(newUser);
        this.showMessage("Account created successfully! Please login.", "success");
        this.toggleNewAccount();
    }
    
    hashPassword(password) {
        // Simple hash for demo - in production use bcrypt
        return btoa(password + "GAMI_SALT_2024");
    }
    
    showMessage(message, type) {
        const div = document.createElement('div');
        div.className = `message ${type}`;
        div.textContent = message;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.remove();
        }, 3000);
    }
    
    updateCoinDisplay() {
        if (this.currentUser) {
            const coinCount = document.getElementById('coinCount');
            coinCount.textContent = this.formatNumber(this.currentUser.coins);
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
    
    async getUserCoins(username) {
        const data = await this.db.getUser(username);
        return data ? data.coins : 100;
    }
}

// Initialize auth system
let authSystem = new AuthSystem();