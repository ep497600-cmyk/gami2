class DatabaseSystem {
    constructor() {
        this.apiEndpoint = 'https://sheetdb.io/api/v1/denkvsthq9mvf';
        this.encryptionKey = 'GAMI_SECURE_KEY_2024';
        this.userData = null;
    }
    
    async getUser(username) {
        try {
            const response = await fetch(`${this.apiEndpoint}/search?username=${username}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const user = data[0];
                // Decrypt sensitive data
                if (user.password) {
                    user.password = this.decryptData(user.password);
                }
                return user;
            }
            return null;
        } catch (error) {
            console.error('Database error:', error);
            return null;
        }
    }
    
    async checkUserExists(username) {
        const user = await this.getUser(username);
        return user !== null;
    }
    
    async createUser(userData) {
        try {
            // Encrypt password before sending
            const encryptedData = {
                ...userData,
                password: this.encryptData(userData.password),
                coins: 100,
                stars: 0,
                helpers: 0,
                created_at: new Date().toISOString()
            };
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: [encryptedData] })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Create user error:', error);
            return null;
        }
    }
    
    async updateUserData(updatedData) {
        if (!window.authSystem.currentUser || window.authSystem.currentUser.isGuest) {
            return; // Don't update for guest users
        }
        
        try {
            const username = window.authSystem.currentUser.username;
            
            // Get current user data
            const currentUser = await this.getUser(username);
            if (!currentUser) return;
            
            // Merge updates
            const mergedData = {
                ...currentUser,
                ...updatedData,
                last_updated: new Date().toISOString()
            };
            
            // Encrypt sensitive data
            if (mergedData.password) {
                mergedData.password = this.encryptData(mergedData.password);
            }
            
            // Update via API
            const response = await fetch(`${this.apiEndpoint}/username/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: mergedData })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
        }
    }
    
    async syncUserData(user) {
        if (user.isGuest) {
            // For guest users, use local storage
            localStorage.setItem('gami_guest_data', JSON.stringify({
                coins: user.coins,
                lastSync: new Date().toISOString()
            }));
            return;
        }
        
        try {
            const userData = await this.getUser(user.username);
            if (userData) {
                this.userData = userData;
                
                // Update local game state
                if (window.gameSystem) {
                    window.gameSystem.gameState.coins = userData.coins || 0;
                    window.gameSystem.gameState.stars = userData.stars || 0;
                    window.gameSystem.gameState.helpers = userData.helpers || 0;
                    window.gameSystem.updateGameStats();
                }
                
                return userData;
            }
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    async pushExpansionData(expansionData) {
        try {
            // Create expansion record
            const record = {
                type: 'expansion',
                level: expansionData.level,
                feature: expansionData.feature,
                timestamp: expansionData.timestamp,
                user: window.authSystem.currentUser?.username || 'system'
            };
            
            // Push to separate sheet or log
            const expansionEndpoint = 'https://sheetdb.io/api/v1/denkvsthq9mvf/expansion';
            await fetch(expansionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: [record] })
            });
        } catch (error) {
            console.error('Expansion data push error:', error);
        }
    }
    
    async logInteraction(interactionType, details) {
        try {
            const logData = {
                type: interactionType,
                details: JSON.stringify(details),
                user: window.authSystem.currentUser?.username || 'guest',
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent
            };
            
            const logEndpoint = 'https://sheetdb.io/api/v1/denkvsthq9mvf/logs';
            await fetch(logEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: [logData] })
            });
        } catch (error) {
            console.error('Logging error:', error);
        }
    }
    
    encryptData(data) {
        // Simple encryption for demo
        return btoa(data + this.encryptionKey);
    }
    
    decryptData(encryptedData) {
        try {
            const decrypted = atob(encryptedData);
            return decrypted.replace(this.encryptionKey, '');
        } catch (error) {
            return encryptedData;
        }
    }
    
    // Backup and recovery functions
    async createBackup() {
        try {
            const allData = await fetch(this.apiEndpoint);
            const data = await allData.json();
            
            // Store backup in localStorage
            localStorage.setItem('gami_backup_' + Date.now(), JSON.stringify(data));
            
            return true;
        } catch (error) {
            console.error('Backup error:', error);
            return false;
        }
    }
    
    // Data validation
    validateUserData(data) {
        const requiredFields = ['username', 'password'];
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!data[field]) {
                errors.push(`${field} is required`);
            }
        });
        
        if (data.username && data.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        
        if (data.password && data.password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Statistics and analytics
    async getSystemStats() {
        try {
            const response = await fetch(this.apiEndpoint);
            const allUsers = await response.json();
            
            const stats = {
                totalUsers: allUsers.length,
                totalCoins: allUsers.reduce((sum, user) => sum + (user.coins || 0), 0),
                activeToday: allUsers.filter(user => {
                    const lastActive = new Date(user.last_updated || user.created_at);
                    const today = new Date();
                    return lastActive.toDateString() === today.toDateString();
                }).length,
                averageStars: allUsers.reduce((sum, user) => sum + (user.stars || 0), 0) / allUsers.length
            };
            
            return stats;
        } catch (error) {
            console.error('Stats error:', error);
            return null;
        }
    }
}

// Initialize Database System
let db = new DatabaseSystem();