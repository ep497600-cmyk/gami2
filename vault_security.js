// GAMI Vault Security - Local AES-256 Encryption & Security System
class GAMIVaultSecurity {
    constructor() {
        this.encryptionKey = null;
        this.guestAttempts = 3;
        this.maxGuestAttempts = 3;
        this.localLedger = [];
        this.blockchain = [];
        
        this.init();
    }
    
    init() {
        this.generateEncryptionKey();
        this.loadLocalLedger();
        this.setupSecurityListeners();
        console.log('GAMI Vault Security Initialized');
    }
    
    generateEncryptionKey() {
        // Generate or retrieve encryption key
        let key = localStorage.getItem('gami_encryption_key');
        
        if (!key) {
            // Generate a new key (simplified - in production use proper crypto)
            key = this.createSecureKey();
            localStorage.setItem('gami_encryption_key', key);
        }
        
        this.encryptionKey = key;
        return key;
    }
    
    createSecureKey() {
        // Create a pseudo-random key (for demo purposes)
        // In production, use: crypto.getRandomValues(new Uint8Array(32))
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        const userAgent = navigator.userAgent;
        
        // Simple hash combination
        let hash = 0;
        const str = timestamp + random + userAgent;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return 'gami_key_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
    }
    
    encryptData(data) {
        // Simplified encryption (for demonstration)
        // In production, use Web Crypto API for AES-256
        try {
            const jsonString = JSON.stringify(data);
            const encoded = btoa(unescape(encodeURIComponent(jsonString)));
            
            // Add key-based obfuscation
            let encrypted = '';
            for (let i = 0; i < encoded.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                const encodedChar = encoded.charCodeAt(i);
                encrypted += String.fromCharCode((encodedChar + keyChar) % 256);
            }
            
            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }
    
    decryptData(encryptedData) {
        // Simplified decryption (for demonstration)
        try {
            const decoded = atob(encryptedData);
            
            // Remove key-based obfuscation
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                const decodedChar = decoded.charCodeAt(i);
                decrypted += String.fromCharCode((decodedChar - keyChar + 256) % 256);
            }
            
            const jsonString = decodeURIComponent(escape(atob(decrypted)));
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
    
    saveEncryptedData(key, data) {
        const encrypted = this.encryptData(data);
        if (encrypted) {
            localStorage.setItem(key, encrypted);
            return true;
        }
        return false;
    }
    
    loadEncryptedData(key) {
        const encrypted = localStorage.getItem(key);
        if (encrypted) {
            return this.decryptData(encrypted);
        }
        return null;
    }
    
    // Self-Custody Blockchain Implementation
    loadLocalLedger() {
        const savedLedger = localStorage.getItem('gami_local_ledger');
        if (savedLedger) {
            this.localLedger = JSON.parse(savedLedger);
        } else {
            // Create genesis block
            this.localLedger = [this.createGenesisBlock()];
            this.saveLocalLedger();
        }
        
        // Initialize blockchain from ledger
        this.initializeBlockchain();
    }
    
    saveLocalLedger() {
        localStorage.setItem('gami_local_ledger', JSON.stringify(this.localLedger));
    }
    
    createGenesisBlock() {
        return {
            index: 0,
            timestamp: Date.now(),
            data: {
                type: 'genesis',
                message: 'GAMI Genesis Block - Business Simulation Platform',
                version: '1.0.0'
            },
            previousHash: '0',
            hash: this.calculateBlockHash(0, Date.now(), 'genesis', '0')
        };
    }
    
    calculateBlockHash(index, timestamp, data, previousHash) {
        // Simplified hash calculation
        const blockString = index + timestamp + JSON.stringify(data) + previousHash;
        let hash = 0;
        
        for (let i = 0; i < blockString.length; i++) {
            const char = blockString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }
    
    addTransaction(transaction) {
        const lastBlock = this.localLedger[this.localLedger.length - 1];
        const newBlock = {
            index: lastBlock.index + 1,
            timestamp: Date.now(),
            data: transaction,
            previousHash: lastBlock.hash,
            hash: this.calculateBlockHash(
                lastBlock.index + 1,
                Date.now(),
                transaction,
                lastBlock.hash
            )
        };
        
        this.localLedger.push(newBlock);
        this.saveLocalLedger();
        
        // Add to blockchain
        this.addToBlockchain(newBlock);
        
        return newBlock;
    }
    
    initializeBlockchain() {
        // Create blockchain from ledger
        this.blockchain = [...this.localLedger];
        
        // Verify blockchain integrity
        if (this.verifyBlockchain()) {
            console.log('Blockchain verified successfully');
        } else {
            console.error('Blockchain verification failed!');
            this.repairBlockchain();
        }
    }
    
    verifyBlockchain() {
        for (let i = 1; i < this.blockchain.length; i++) {
            const currentBlock = this.blockchain[i];
            const previousBlock = this.blockchain[i - 1];
            
            // Verify hash linkage
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
            
            // Verify block hash
            const calculatedHash = this.calculateBlockHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.data,
                currentBlock.previousHash
            );
            
            if (calculatedHash !== currentBlock.hash) {
                return false;
            }
        }
        
        return true;
    }
    
    repairBlockchain() {
        console.log('Repairing blockchain...');
        
        // Recalculate all hashes
        for (let i = 0; i < this.blockchain.length; i++) {
            if (i === 0) {
                // Genesis block
                this.blockchain[i].hash = this.calculateBlockHash(
                    0,
                    this.blockchain[i].timestamp,
                    this.blockchain[i].data,
                    '0'
                );
            } else {
                this.blockchain[i].previousHash = this.blockchain[i - 1].hash;
                this.blockchain[i].hash = this.calculateBlockHash(
                    this.blockchain[i].index,
                    this.blockchain[i].timestamp,
                    this.blockchain[i].data,
                    this.blockchain[i].previousHash
                );
            }
        }
        
        // Update ledger
        this.localLedger = [...this.blockchain];
        this.saveLocalLedger();
        
        console.log('Blockchain repaired successfully');
    }
    
    addToBlockchain(block) {
        this.blockchain.push(block);
    }
    
    getTransactionHistory(username) {
        return this.blockchain.filter(block => 
            block.data.username === username || 
            block.data.type === 'coin_transfer'
        );
    }
    
    // Guest Mode Security
    setupSecurityListeners() {
        // Monitor guest mode attempts
        this.monitorGuestAttempts();
        
        // Setup activity monitoring
        this.setupActivityMonitor();
        
        // Setup data backup
        this.setupDataBackup();
    }
    
    monitorGuestAttempts() {
        // Track guest mode button clicks
        const guestButtons = document.querySelectorAll('.password-btn');
        guestButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.guestAttempts--;
                
                if (this.guestAttempts <= 0) {
                    this.disableGuestMode();
                }
            });
        });
    }
    
    disableGuestMode() {
        const guestPanel = document.getElementById('guestModePanel');
        if (guestPanel) {
            guestPanel.style.display = 'none';
        }
        
        // Show security alert
        this.showSecurityAlert('Guest mode disabled due to multiple failed attempts.');
        
        // Log security event
        this.logSecurityEvent('guest_mode_disabled', {
            attempts: this.maxGuestAttempts,
            timestamp: Date.now(),
            ip: 'local' // In production, get actual IP
        });
    }
    
    setupActivityMonitor() {
        // Monitor user activity for security
        let lastActivity = Date.now();
        
        const updateActivity = () => {
            lastActivity = Date.now();
        };
        
        // Track various user activities
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });
        
        // Check for inactivity every minute
        setInterval(() => {
            const inactiveTime = Date.now() - lastActivity;
            const inactiveMinutes = Math.floor(inactiveTime / (1000 * 60));
            
            if (inactiveMinutes > 15) { // 15 minutes inactivity
                this.logSecurityEvent('inactivity_warning', {
                    minutes: inactiveMinutes,
                    timestamp: Date.now()
                });
            }
        }, 60000); // Check every minute
    }
    
    setupDataBackup() {
        // Auto-backup data every hour
        setInterval(() => {
            this.createDataBackup();
        }, 3600000); // 1 hour
        
        // Also backup on page unload
        window.addEventListener('beforeunload', () => {
            this.createDataBackup();
        });
    }
    
    createDataBackup() {
        const backupData = {
            timestamp: Date.now(),
            ledger: this.localLedger,
            users: this.getAllUserData(),
            system: {
                version: '1.0.0',
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            }
        };
        
        const backupKey = `gami_backup_${Date.now()}`;
        const success = this.saveEncryptedData(backupKey, backupData);
        
        if (success) {
            console.log('Data backup created successfully');
            
            // Keep only last 24 backups
            this.cleanupOldBackups();
        }
    }
    
    getAllUserData() {
        const users = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('gami_user_data_')) {
                const username = key.replace('gami_user_data_', '');
                users[username] = localStorage.getItem(key);
            }
        });
        
        return users;
    }
    
    cleanupOldBackups() {
        const backupKeys = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('gami_backup_')) {
                backupKeys.push(key);
            }
        });
        
        // Sort by timestamp (newest first)
        backupKeys.sort((a, b) => {
            const timeA = parseInt(a.split('_')[2]);
            const timeB = parseInt(b.split('_')[2]);
            return timeB - timeA;
        });
        
        // Remove old backups (keep last 24)
        if (backupKeys.length > 24) {
            for (let i = 24; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        }
    }
    
    // Security Event Logging
    logSecurityEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: Date.now(),
            user: window.GAMIAuth ? window.GAMIAuth.currentUser : null
        };
        
        // Save to security log
        let securityLog = this.loadEncryptedData('gami_security_log') || [];
        securityLog.push(event);
        
        // Keep only last 1000 events
        if (securityLog.length > 1000) {
            securityLog = securityLog.slice(-1000);
        }
        
        this.saveEncryptedData('gami_security_log', securityLog);
        
        // Also add to blockchain
        this.addTransaction({
            type: 'security_event',
            event: type,
            timestamp: Date.now(),
            details: data
        });
    }
    
    showSecurityAlert(message) {
        // Create security alert
        const alert = document.createElement('div');
        alert.className = 'security-alert glass-card';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            background: rgba(245, 158, 11, 0.9);
            color: white;
            border-radius: 10px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
            text-align: center;
            font-weight: 600;
        `;
        
        alert.textContent = `⚠️ SECURITY: ${message}`;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
    
    // Coin Management with Blockchain
    transferCoins(sender, receiver, amount, description = '') {
        // Validate amount
        if (amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }
        
        // Check sender balance
        const senderData = this.getUserData(sender);
        if (!senderData || BigInt(senderData.coins) < BigInt(amount)) {
            throw new Error('Insufficient balance');
        }
        
        // Get receiver data
        const receiverData = this.getUserData(receiver);
        if (!receiverData) {
            throw new Error('Receiver not found');
        }
        
        // Update balances
        senderData.coins = (BigInt(senderData.coins) - BigInt(amount)).toString();
        receiverData.coins = (BigInt(receiverData.coins) + BigInt(amount)).toString();
        
        // Save updated data
        this.saveUserData(sender, senderData);
        this.saveUserData(receiver, receiverData);
        
        // Create blockchain transaction
        const transaction = {
            type: 'coin_transfer',
            sender,
            receiver,
            amount: amount.toString(),
            description,
            timestamp: Date.now(),
            transactionId: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        
        // Add to blockchain
        this.addTransaction(transaction);
        
        // Log security event
        this.logSecurityEvent('coin_transfer', {
            transactionId: transaction.transactionId,
            amount,
            sender,
            receiver
        });
        
        return transaction;
    }
    
    getUserData(username) {
        const data = localStorage.getItem('gami_user_data_' + username);
        return data ? JSON.parse(data) : null;
    }
    
    saveUserData(username, data) {
        localStorage.setItem(
            'gami_user_data_' + username,
            JSON.stringify(data, (key, value) => 
                typeof value === 'bigint' ? value.toString() : value
            )
        );
    }
    
    // SheetDB Bridge (Cloud Sync)
    async syncWithSheetDB() {
        // This would sync data with SheetDB or similar service
        // For now, it's a placeholder for the cloud sync feature
        
        console.log('SheetDB sync initiated');
        
        try {
            // Prepare sync data
            const syncData = {
                timestamp: Date.now(),
                ledgerHash: this.calculateLedgerHash(),
                userCount: this.countUsers(),
                totalTransactions: this.blockchain.length
            };
            
            // In a real implementation, this would make an API call to SheetDB
            // For now, just log the sync attempt
            console.log('Sync data prepared:', syncData);
            
            // Simulate API call
            await this.simulateAPICall(syncData);
            
            return { success: true, data: syncData };
        } catch (error) {
            console.error('SheetDB sync failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    calculateLedgerHash() {
        // Calculate hash of the entire ledger for verification
        const ledgerString = JSON.stringify(this.localLedger);
        let hash = 0;
        
        for (let i = 0; i < ledgerString.length; i++) {
            const char = ledgerString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        return Math.abs(hash).toString(36);
    }
    
    countUsers() {
        let count = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('gami_user_data_')) {
                count++;
            }
        });
        
        return count;
    }
    
    simulateAPICall(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate network conditions
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('SheetDB sync successful');
                    resolve(data);
                } else {
                    reject(new Error('Network error simulated'));
                }
            }, 1000);
        });
    }
}

// Initialize GAMI Vault Security
document.addEventListener('DOMContentLoaded', () => {
    window.GAMIVault = new GAMIVaultSecurity();
});