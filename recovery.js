// recovery.js - GAMI Project
// Version: 1.0.0
// Description: Password recovery system with 3-step security verification
// No email, purely based on user activity and memory verification
// Integrates with auth_vault.js for token-based password reset

const GAMIRecovery = {
    // Configuration
    config: {
        maxAttempts: 3,
        lockoutTime: 300000, // 5 minutes in milliseconds
        recoveryCooldown: 86400000, // 24 hours
        securityLevels: 3,
        minAnswerLength: 2,
        answerFuzziness: 0.7, // 70% match required
        isRecoveryActive: false,
        lockedUsers: new Map(),
        recoveryLogs: []
    },

    // Security questions database (linked to user profile)
    securityData: {
        // Template structure - actual data loaded from user profile
        lastActivity: '',
        friendNames: [],
        lastUpgrade: '',
        backupQuestions: []
    },

    // User session tracker
    userSessions: new Map(),

    // System initialization
    initialize: function() {
        console.log('GAMI Recovery System Initializing...');
        
        // Check dependencies
        if (!this.checkDependencies()) {
            console.error('Recovery system: Required dependencies not found');
            return false;
        }
        
        // Load user recovery data
        this.loadUserRecoveryData();
        
        // Setup recovery UI
        this.setupRecoveryInterface();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        this.config.isRecoveryActive = true;
        console.log('GAMI Recovery System Ready');
        return true;
    },

    // Check for required systems
    checkDependencies: function() {
        const requiredSystems = [
            'GAMIAuthVault',  // auth_vault.js
            'GAMIUserProfile', // user_profile.js (assumed)
            'GAMIActivityLog', // activity_log.js (assumed)
            'GAMIDataStore'    // data_store.js (assumed)
        ];
        
        // Check which systems are available
        const availableSystems = requiredSystems.filter(sys => window[sys] !== undefined);
        
        if (availableSystems.length < 2) {
            console.warn('Recovery: Some dependencies missing, limited functionality');
        }
        
        return window.GAMIAuthVault !== undefined;
    },

    // Load user recovery data from various sources
    loadUserRecoveryData: function() {
        try {
            // Try to get data from user profile
            if (window.GAMIUserProfile && window.GAMIUserProfile.getCurrentUser) {
                const userProfile = window.GAMIUserProfile.getCurrentUser();
                if (userProfile) {
                    this.securityData.friendNames = userProfile.friends || [];
                    this.securityData.lastUpgrade = userProfile.lastUpgrade || '';
                }
            }
            
            // Try to get activity data
            if (window.GAMIActivityLog && window.GAMIActivityLog.getRecentActivity) {
                const recentActivity = window.GAMIActivityLog.getRecentActivity(5); // Last 5 activities
                if (recentActivity && recentActivity.length > 0) {
                    this.securityData.lastActivity = recentActivity[0].description || '';
                    this.securityData.backupQuestions = this.generateBackupQuestions(recentActivity);
                }
            }
            
            // Try to get from data store
            if (window.GAMIDataStore && window.GAMIDataStore.get) {
                const storedData = window.GAMIDataStore.get('recovery_security_data');
                if (storedData) {
                    this.securityData = { ...this.securityData, ...storedData };
                }
            }
            
            console.log('Recovery: User security data loaded');
        } catch (error) {
            console.error('Recovery: Failed to load user data:', error);
        }
    },

    // Generate backup questions from activity history
    generateBackupQuestions: function(activityLog) {
        const questions = [];
        
        if (!activityLog || activityLog.length === 0) {
            return questions;
        }
        
        // Extract unique activities for questions
        const uniqueActivities = [];
        activityLog.forEach(activity => {
            if (activity.description && !uniqueActivities.includes(activity.description)) {
                uniqueActivities.push(activity.description);
            }
        });
        
        // Create questions from activities (excluding the most recent)
        for (let i = 1; i < Math.min(uniqueActivities.length, 4); i++) {
            if (uniqueActivities[i]) {
                questions.push({
                    question: `Did you recently: ${uniqueActivities[i]}?`,
                    expectedAnswer: 'yes',
                    type: 'activity_verification'
                });
            }
        }
        
        return questions;
    },

    // Setup recovery user interface
    setupRecoveryInterface: function() {
        // Create recovery modal if it doesn't exist
        if (!document.getElementById('gami-recovery-modal')) {
            this.createRecoveryModal();
        }
        
        // Add recovery link/button to login page
        this.addRecoveryTrigger();
    },

    // Create recovery modal HTML
    createRecoveryModal: function() {
        const modalHTML = `
            <div id="gami-recovery-modal" class="gami-recovery-modal" style="display: none;">
                <div class="recovery-modal-content">
                    <div class="recovery-header">
                        <h2>Password Recovery</h2>
                        <span class="recovery-close">&times;</span>
                    </div>
                    
                    <div class="recovery-progress">
                        <div class="progress-step active" data-step="1">Step 1</div>
                        <div class="progress-step" data-step="2">Step 2</div>
                        <div class="progress-step" data-step="3">Step 3</div>
                    </div>
                    
                    <div class="recovery-body">
                        <!-- Step 1: Last Activity -->
                        <div class="recovery-step active" id="step-1">
                            <h3>Security Verification - Step 1</h3>
                            <div class="security-question" id="question-1">
                                <p>What was your last major activity in GAMI?</p>
                                <div class="activity-hint" id="activity-hint"></div>
                            </div>
                            <div class="recovery-answer">
                                <input type="text" id="answer-1" placeholder="Describe your last activity..." 
                                       maxlength="100" autocomplete="off">
                                <div class="answer-feedback" id="feedback-1"></div>
                            </div>
                            <div class="recovery-actions">
                                <button class="recovery-next" onclick="GAMIRecovery.validateStep(1)">Next</button>
                            </div>
                        </div>
                        
                        <!-- Step 2: Friend Names -->
                        <div class="recovery-step" id="step-2">
                            <h3>Security Verification - Step 2</h3>
                            <div class="security-question" id="question-2">
                                <p>Name at least 2 friends from your GAMI connections</p>
                                <div class="friends-hint" id="friends-hint"></div>
                            </div>
                            <div class="recovery-answer">
                                <input type="text" id="answer-2" placeholder="Enter friend names (comma separated)..." 
                                       maxlength="200" autocomplete="off">
                                <div class="answer-feedback" id="feedback-2"></div>
                            </div>
                            <div class="recovery-actions">
                                <button class="recovery-prev" onclick="GAMIRecovery.previousStep(2)">Previous</button>
                                <button class="recovery-next" onclick="GAMIRecovery.validateStep(2)">Next</button>
                            </div>
                        </div>
                        
                        <!-- Step 3: Last Upgrade -->
                        <div class="recovery-step" id="step-3">
                            <h3>Security Verification - Step 3</h3>
                            <div class="security-question" id="question-3">
                                <p>When was your last upgrade/purchase in GAMI?</p>
                                <div class="upgrade-hint" id="upgrade-hint"></div>
                            </div>
                            <div class="recovery-answer">
                                <div class="date-options">
                                    <select id="upgrade-period">
                                        <option value="">Select period</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="this_week">This Week</option>
                                        <option value="last_week">Last Week</option>
                                        <option value="this_month">This Month</option>
                                        <option value="last_month">Last Month</option>
                                        <option value="older">Older</option>
                                    </select>
                                    <input type="text" id="answer-3-details" placeholder="Additional details (optional)" 
                                           maxlength="100">
                                </div>
                                <div class="answer-feedback" id="feedback-3"></div>
                            </div>
                            <div class="recovery-actions">
                                <button class="recovery-prev" onclick="GAMIRecovery.previousStep(3)">Previous</button>
                                <button class="recovery-submit" onclick="GAMIRecovery.validateStep(3)">Verify & Reset</button>
                            </div>
                        </div>
                        
                        <!-- Backup Verification (if primary fails) -->
                        <div class="recovery-step" id="step-backup" style="display: none;">
                            <h3>Additional Verification Required</h3>
                            <div class="security-question" id="question-backup"></div>
                            <div class="recovery-answer">
                                <input type="text" id="answer-backup" placeholder="Your answer..." 
                                       maxlength="100" autocomplete="off">
                                <div class="answer-feedback" id="feedback-backup"></div>
                            </div>
                            <div class="recovery-actions">
                                <button class="recovery-submit" onclick="GAMIRecovery.validateBackupStep()">Submit</button>
                            </div>
                        </div>
                        
                        <!-- Success/Failure Messages -->
                        <div class="recovery-result" id="recovery-success" style="display: none;">
                            <div class="success-icon">✓</div>
                            <h3>Verification Successful!</h3>
                            <p>Password reset token has been generated.</p>
                            <div class="token-display" id="token-display"></div>
                            <p class="token-instruction">Use this token in the password reset form.</p>
                            <button class="recovery-done" onclick="GAMIRecovery.closeModal()">Continue</button>
                        </div>
                        
                        <div class="recovery-result" id="recovery-failure" style="display: none;">
                            <div class="failure-icon">✗</div>
                            <h3>Verification Failed</h3>
                            <p id="failure-message"></p>
                            <div class="lockout-info" id="lockout-info"></div>
                            <button class="recovery-try-again" onclick="GAMIRecovery.restartRecovery()">Try Again</button>
                            <button class="recovery-done" onclick="GAMIRecovery.closeModal()">Cancel</button>
                        </div>
                        
                        <!-- Attempts Counter -->
                        <div class="recovery-status">
                            <p id="attempts-remaining">Attempts remaining: 3</p>
                            <div class="security-level">
                                Security Level: <span id="security-level-indicator">●●●</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS styles
        const recoveryCSS = `
            <style>
                .gami-recovery-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                
                .recovery-modal-content {
                    background: #1a1a2e;
                    border-radius: 10px;
                    width: 90%;
                    max-width: 500px;
                    border: 2px solid #00ffff;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                }
                
                .recovery-header {
                    background: #0f3460;
                    color: white;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .recovery-close {
                    font-size: 28px;
                    cursor: pointer;
                    color: #ff4d4d;
                }
                
                .recovery-progress {
                    display: flex;
                    background: #16213e;
                    padding: 10px;
                }
                
                .progress-step {
                    flex: 1;
                    text-align: center;
                    padding: 10px;
                    background: #2d4059;
                    margin: 0 5px;
                    border-radius: 5px;
                    color: #888;
                    font-weight: bold;
                }
                
                .progress-step.active {
                    background: #00adb5;
                    color: white;
                    box-shadow: 0 0 10px rgba(0, 173, 181, 0.5);
                }
                
                .recovery-body {
                    padding: 20px;
                    min-height: 300px;
                }
                
                .recovery-step {
                    display: none;
                }
                
                .recovery-step.active {
                    display: block;
                }
                
                .security-question {
                    background: #16213e;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border-left: 4px solid #00adb5;
                }
                
                .recovery-answer input, .recovery-answer select {
                    width: 100%;
                    padding: 12px;
                    margin: 10px 0;
                    background: #0f3460;
                    border: 1px solid #00adb5;
                    border-radius: 5px;
                    color: white;
                    font-size: 14px;
                }
                
                .recovery-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
                
                .recovery-actions button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                
                .recovery-prev {
                    background: #2d4059;
                    color: white;
                }
                
                .recovery-next, .recovery-submit {
                    background: #00adb5;
                    color: white;
                }
                
                .recovery-done {
                    background: #00b894;
                    color: white;
                    width: 100%;
                }
                
                .recovery-try-again {
                    background: #fdcb6e;
                    color: #2d3436;
                    margin-right: 10px;
                }
                
                .answer-feedback {
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                    display: none;
                }
                
                .answer-feedback.valid {
                    background: rgba(0, 184, 148, 0.2);
                    border: 1px solid #00b894;
                    color: #00b894;
                    display: block;
                }
                
                .answer-feedback.invalid {
                    background: rgba(255, 77, 77, 0.2);
                    border: 1px solid #ff4d4d;
                    color: #ff4d4d;
                    display: block;
                }
                
                .recovery-result {
                    text-align: center;
                    padding: 30px;
                }
                
                .success-icon, .failure-icon {
                    font-size: 60px;
                    margin-bottom: 20px;
                }
                
                .success-icon {
                    color: #00b894;
                }
                
                .failure-icon {
                    color: #ff4d4d;
                }
                
                .token-display {
                    background: #0f3460;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    font-family: monospace;
                    font-size: 16px;
                    letter-spacing: 2px;
                    border: 1px dashed #00adb5;
                }
                
                .recovery-status {
                    margin-top: 20px;
                    padding: 10px;
                    background: #16213e;
                    border-radius: 5px;
                    font-size: 12px;
                    display: flex;
                    justify-content: space-between;
                    color: #888;
                }
                
                .security-level span {
                    color: #00adb5;
                    letter-spacing: 5px;
                }
            </style>
        `;
        
        // Add to document
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.head.insertAdjacentHTML('beforeend', recoveryCSS);
    },

    // Add recovery trigger to login page
    addRecoveryTrigger: function() {
        // Look for login form or create recovery link
        const loginForm = document.querySelector('#login-form, .login-form, form[action*="login"]');
        
        if (loginForm) {
            const recoveryLink = document.createElement('a');
            recoveryLink.href = '#';
            recoveryLink.className = 'forgot-password-link';
            recoveryLink.textContent = 'Forgot Password?';
            recoveryLink.onclick = (e) => {
                e.preventDefault();
                this.startRecoveryProcess();
            };
            
            // Insert after password field or at the end of form
            const passwordField = loginForm.querySelector('input[type="password"]');
            if (passwordField) {
                passwordField.parentNode.appendChild(document.createElement('br'));
                passwordField.parentNode.appendChild(recoveryLink);
            } else {
                loginForm.appendChild(recoveryLink);
            }
        }
    },

    // Setup event listeners
    setupEventListeners: function() {
        // Close modal when clicking X
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('recovery-close')) {
                this.closeModal();
            }
        });
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.id === 'gami-recovery-modal') {
                this.closeModal();
            }
        });
        
        // Enter key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.config.isRecoveryActive) {
                const activeStep = document.querySelector('.recovery-step.active');
                if (activeStep) {
                    const stepNum = activeStep.id.split('-')[1];
                    if (stepNum && !isNaN(stepNum)) {
                        this.validateStep(parseInt(stepNum));
                    }
                }
            }
        });
    },

    // Start recovery process
    startRecoveryProcess: function(username = '') {
        // Check if user is locked out
        if (this.isUserLocked(username)) {
            this.showLockoutMessage(username);
            return;
        }
        
        // Reset recovery state
        this.resetRecoveryState();
        
        // Load fresh data for this recovery attempt
        this.loadUserRecoveryData();
        
        // Update UI with hints
        this.updateSecurityHints();
        
        // Show modal
        const modal = document.getElementById('gami-recovery-modal');
        modal.style.display = 'flex';
        
        // Set focus to first input
        setTimeout(() => {
            const firstInput = document.getElementById('answer-1');
            if (firstInput) firstInput.focus();
        }, 100);
        
        // Log recovery attempt
        this.logRecoveryAttempt('started', username);
    },

    // Update security hints in UI
    updateSecurityHints: function() {
        // Activity hint
        const activityHint = document.getElementById('activity-hint');
        if (activityHint && this.securityData.lastActivity) {
            const hintText = this.generateActivityHint(this.securityData.lastActivity);
            activityHint.innerHTML = `<small>Hint: ${hintText}</small>`;
        }
        
        // Friends hint
        const friendsHint = document.getElementById('friends-hint');
        if (friendsHint && this.securityData.friendNames.length > 0) {
            const sampleFriends = this.securityData.friendNames.slice(0, 3).join(', ');
            friendsHint.innerHTML = `<small>You have friends like: ${sampleFriends}...</small>`;
        }
        
        // Upgrade hint
        const upgradeHint = document.getElementById('upgrade-hint');
        if (upgradeHint && this.securityData.lastUpgrade) {
            upgradeHint.innerHTML = `<small>Your last upgrade was related to: ${this.securityData.lastUpgrade}</small>`;
        }
    },

    // Generate hint from activity (partial reveal)
    generateActivityHint: function(activity) {
        if (!activity || activity.length < 10) return 'Recent activity in GAMI';
        
        // Show first 30% of activity, mask the rest
        const revealLength = Math.floor(activity.length * 0.3);
        const revealed = activity.substring(0, revealLength);
        const masked = '●'.repeat(activity.length - revealLength);
        
        return revealed + masked;
    },

    // Validate step answer
    validateStep: function(stepNumber) {
        const answerInput = document.getElementById(`answer-${stepNumber}`);
        const feedbackElement = document.getElementById(`feedback-${stepNumber}`);
        
        if (!answerInput) return false;
        
        const userAnswer = answerInput.value.trim();
        
        // Basic validation
        if (!userAnswer || userAnswer.length < this.config.minAnswerLength) {
            this.showFeedback(feedbackElement, 'Please provide a valid answer', false);
            return false;
        }
        
        // Validate based on step
        let isValid = false;
        let validationMessage = '';
        
        switch(stepNumber) {
            case 1: // Last Activity
                isValid = this.validateLastActivity(userAnswer);
                validationMessage = isValid ? 
                    'Activity verified' : 
                    'Activity does not match recent records';
                break;
                
            case 2: // Friend Names
                isValid = this.validateFriendNames(userAnswer);
                validationMessage = isValid ?
                    'Friend verification successful' :
                    'Could not verify these friends';
                break;
                
            case 3: // Last Upgrade
                isValid = this.validateLastUpgrade(userAnswer);
                validationMessage = isValid ?
                    'Upgrade timeline verified' :
                    'Upgrade timeline does not match records';
                break;
        }
        
        // Show feedback
        this.showFeedback(feedbackElement, validationMessage, isValid);
        
        if (isValid) {
            // Store validated answer
            this.userSessions.set(`step_${stepNumber}_answer`, userAnswer);
            
            // Move to next step or complete
            setTimeout(() => {
                if (stepNumber < 3) {
                    this.goToStep(stepNumber + 1);
                } else {
                    this.completeVerification();
                }
            }, 1000);
        } else {
            // Record failed attempt
            this.recordFailedAttempt(stepNumber);
        }
        
        return isValid;
    },

    // Validate last activity answer
    validateLastActivity: function(userAnswer) {
        if (!this.securityData.lastActivity) {
            // If no activity data, check backup questions
            return this.validateWithBackupQuestions(userAnswer);
        }
        
        // Fuzzy matching for activity description
        const similarity = this.calculateSimilarity(
            userAnswer.toLowerCase(),
            this.securityData.lastActivity.toLowerCase()
        );
        
        return similarity >= this.config.answerFuzziness;
    },

    // Validate friend names
    validateFriendNames: function(userAnswer) {
        const providedNames = userAnswer.split(',')
            .map(name => name.trim().toLowerCase())
            .filter(name => name.length > 0);
        
        if (providedNames.length < 2) {
            return false;
        }
        
        // Check if at least 2 names match known friends
        const knownFriends = this.securityData.friendNames.map(name => name.toLowerCase());
        let matchCount = 0;
        
        providedNames.forEach(name => {
            // Check for exact or partial matches
            if (knownFriends.some(friend => 
                friend.includes(name) || name.includes(friend))) {
                matchCount++;
            }
        });
        
        return matchCount >= 2;
    },

    // Validate last upgrade
    validateLastUpgrade: function(userAnswer) {
        const periodSelect = document.getElementById('upgrade-period');
        const selectedPeriod = periodSelect ? periodSelect.value : '';
        const details = document.getElementById('answer-3-details').value.trim();
        
        // Basic period validation
        if (!selectedPeriod) {
            return false;
        }
        
        // If we have last upgrade data, validate against it
        if (this.securityData.lastUpgrade) {
            const answerToCheck = details || selectedPeriod;
            const similarity = this.calculateSimilarity(
                answerToCheck.toLowerCase(),
                this.securityData.lastUpgrade.toLowerCase()
            );
            
            return similarity >= (this.config.answerFuzziness - 0.2);
        }
        
        // If no data, accept reasonable answers
        return selectedPeriod !== '' && 
               ['today', 'yesterday', 'this_week', 'last_week'].includes(selectedPeriod);
    },

    // Calculate string similarity (simple implementation)
    calculateSimilarity: function(str1, str2) {
        if (!str1 || !str2) return 0;
        
        // Convert to arrays of words
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);
        
        // Count matching words
        let matches = 0;
        words1.forEach(word1 => {
            if (words2.some(word2 => 
                word2.includes(word1) || word1.includes(word2))) {
                matches++;
            }
        });
        
        // Calculate similarity ratio
        const maxWords = Math.max(words1.length, words2.length);
        return matches / maxWords;
    },

    // Validate with backup questions
    validateWithBackupQuestions: function(userAnswer) {
        if (!this.securityData.backupQuestions || 
            this.securityData.backupQuestions.length === 0) {
            return false;
        }
        
        // Use first backup question
        const backupQuestion = this.securityData.backupQuestions[0];
        
        if (backupQuestion.type === 'activity_verification') {
            const answerLower = userAnswer.toLowerCase();
            return answerLower.includes('yes') || answerLower.includes('yeah');
        }
        
        return false;
    },

    // Record failed attempt
    recordFailedAttempt: function(stepNumber) {
        const currentAttempts = this.userSessions.get('failed_attempts') || 0;
        const newAttempts = currentAttempts + 1;
        this.userSessions.set('failed_attempts', newAttempts);
        
        // Update UI
        const attemptsElement = document.getElementById('attempts-remaining');
        if (attemptsElement) {
            const remaining = this.config.maxAttempts - newAttempts;
            attemptsElement.textContent = `Attempts remaining: ${remaining}`;
            
            if (remaining <= 1) {
                attemptsElement.style.color = '#ff4d4d';
            }
        }
        
        // Check if max attempts reached
        if (newAttempts >= this.config.maxAttempts) {
            this.lockUserRecovery();
        }
    },

    // Lock user recovery
    lockUserRecovery: function() {
        const username = this.getCurrentUsername();
        const lockoutUntil = Date.now() + this.config.lockoutTime;
        
        this.config.lockedUsers.set(username, {
            lockedAt: Date.now(),
            unlockAt: lockoutUntil,
            reason: 'max_attempts_reached'
        });
        
        // Save to storage
        this.saveLockedUsers();
        
        // Show lockout message
        this.showVerificationFailed('Maximum attempts reached. Please try again later.');
    },

    // Check if user is locked out
    isUserLocked: function(username) {
        if (!this.config.lockedUsers.has(username)) {
            return false;
        }
        
        const lockInfo = this.config.lockedUsers.get(username);
        if (Date.now() >= lockInfo.unlockAt) {
            // Lock expired
            this.config.lockedUsers.delete(username);
            this.saveLockedUsers();
            return false;
        }
        
        return true;
    },

    // Show lockout message
    showLockoutMessage: function(username) {
        const lockInfo = this.config.lockedUsers.get(username);
        if (!lockInfo) return;
        
        const timeLeft = Math.ceil((lockInfo.unlockAt - Date.now()) / 60000); // minutes
        
        alert(`Recovery is temporarily locked. Please try again in ${timeLeft} minute(s).`);
    },

    // Go to specific step
    goToStep: function(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.recovery-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById(`step-${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // Set focus
        setTimeout(() => {
            const input = document.getElementById(`answer-${stepNumber}`);
            if (input) input.focus();
        }, 100);
    },

    // Go to previous step
    previousStep: function(currentStep) {
        if (currentStep > 1) {
            this.goToStep(currentStep - 1);
        }
    },

    // Complete verification process
    completeVerification: function() {
        // All steps validated successfully
        console.log('Recovery: All security steps passed');
        
        // Generate reset token via auth_vault.js
        this.generateResetToken();
    },

    // Generate password reset token
    generateResetToken: function() {
        if (!window.GAMIAuthVault) {
            this.showVerificationFailed('Authentication system unavailable');
            return;
        }
        
        try {
            const username = this.getCurrentUsername();
            const userAnswers = {
                activity: this.userSessions.get('step_1_answer'),
                friends: this.userSessions.get('step_2_answer'),
                upgrade: this.userSessions.get('step_3_answer')
            };
            
            // Generate recovery token
            const recoveryToken = window.GAMIAuthVault.generateRecoveryToken(
                username,
                userAnswers,
                {
                    ip: this.getClientIP(),
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                }
            );
            
            if (recoveryToken) {
                this.showVerificationSuccess(recoveryToken);
                this.logRecoveryAttempt('success', username);
            } else {
                throw new Error('Token generation failed');
            }
            
        } catch (error) {
            console.error('Recovery: Token generation error:', error);
            this.showVerificationFailed('Unable to generate reset token');
            this.logRecoveryAttempt('token_error', this.getCurrentUsername(), error.message);
        }
    },

    // Show verification success
    showVerificationSuccess: function(token) {
        // Hide all steps
        document.querySelectorAll('.recovery-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show success message
        const successElement = document.getElementById('recovery-success');
        const tokenDisplay = document.getElementById('token-display');
        
        if (successElement && tokenDisplay) {
            tokenDisplay.textContent = token;
            successElement.style.display = 'block';
        }
        
        // Store token in session for immediate use
        sessionStorage.setItem('gami_recovery_token', token);
        sessionStorage.setItem('gami_recovery_time', Date.now().toString());
    },

    // Show verification failed
    showVerificationFailed: function(message) {
        // Hide all steps
        document.querySelectorAll('.recovery-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show failure message
        const failureElement = document.getElementById('recovery-failure');
        const failureMessage = document.getElementById('failure-message');
        
        if (failureElement && failureMessage) {
            failureMessage.textContent = message;
            failureElement.style.display = 'block';
        }
        
        this.logRecoveryAttempt('failed', this.getCurrentUsername(), message);
    },

    // Restart recovery process
    restartRecovery: function() {
        this.resetRecoveryState();
        this.startRecoveryProcess(this.getCurrentUsername());
    },

    // Reset recovery state
    resetRecoveryState: function() {
        this.userSessions.clear();
        
        // Reset UI
        document.querySelectorAll('.recovery-step').forEach(step => {
            step.style.display = 'none';
        });
        
        document.getElementById('step-1').style.display = 'block';
        document.getElementById('step-1').classList.add('active');
        
        // Reset progress
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.toggle('active', index === 0);
        });
        
        // Clear inputs
        document.querySelectorAll('.recovery-answer input, .recovery-answer select').forEach(input => {
            input.value = '';
        });
        
        // Clear feedback
        document.querySelectorAll('.answer-feedback').forEach(feedback => {
            feedback.className = 'answer-feedback';
            feedback.style.display = 'none';
        });
        
        // Hide results
        document.getElementById('recovery-success').style.display = 'none';
        document.getElementById('recovery-failure').style.display = 'none';
        
        // Reset attempts display
        const attemptsElement = document.getElementById('attempts-remaining');
        if (attemptsElement) {
            attemptsElement.textContent = `Attempts remaining: ${this.config.maxAttempts}`;
            attemptsElement.style.color = '';
        }
    },

    // Show feedback message
    showFeedback: function(element, message, isValid) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `answer-feedback ${isValid ? 'valid' : 'invalid'}`;
        element.style.display = 'block';
    },

    // Close recovery modal
    closeModal: function() {
        const modal = document.getElementById('gami-recovery-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.resetRecoveryState();
    },

    // Get current username (from various sources)
    getCurrentUsername: function() {
        // Try to get from login form
        const usernameInput = document.querySelector('input[type="text"], input[name="username"]');
        if (usernameInput && usernameInput.value) {
            return usernameInput.value;
        }
        
        // Try to get from user profile
        if (window.GAMIUserProfile && window.GAMIUserProfile.getCurrentUser) {
            const user = window.GAMIUserProfile.getCurrentUser();
            if (user && user.username) {
                return user.username;
            }
        }
        
        // Try to get from auth vault
        if (window.GAMIAuthVault && window.GAMIAuthVault.getCurrentUser) {
            return window.GAMIAuthVault.getCurrentUser();
        }
        
        return 'unknown_user';
    },

    // Get client IP (simplified)
    getClientIP: function() {
        // This is a simplified version
        // In production, this would come from server-side
        return 'local_' + Math.random().toString(36).substr(2, 9);
    },

    // Save locked users to storage
    saveLockedUsers: function() {
        try {
            const lockedData = Array.from(this.config.lockedUsers.entries());
            localStorage.setItem('gami_recovery_locks', JSON.stringify(lockedData));
        } catch (error) {
            console.error('Recovery: Failed to save lock data:', error);
        }
    },

    // Load locked users from storage
    loadLockedUsers: function() {
        try {
            const lockedData = localStorage.getItem('gami_recovery_locks');
            if (lockedData) {
                const parsed = JSON.parse(lockedData);
                this.config.lockedUsers = new Map(parsed);
            }
        } catch (error) {
            console.error('Recovery: Failed to load lock data:', error);
        }
    },

    // Log recovery attempt
    logRecoveryAttempt: function(status, username, details = '') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            username: username || 'unknown',
            status: status,
            details: details,
            ip: this.getClientIP(),
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        this.config.recoveryLogs.push(logEntry);
        
        // Keep only last 100 logs
        if (this.config.recoveryLogs.length > 100) {
            this.config.recoveryLogs.shift();
        }
        
        // Save logs
        this.saveRecoveryLogs();
        
        // Also log to console for debugging
        console.log(`Recovery attempt: ${status} for user ${username}`, details);
    },

    // Save recovery logs
    saveRecoveryLogs: function() {
        try {
            localStorage.setItem('gami_recovery_logs', 
                JSON.stringify(this.config.recoveryLogs));
        } catch (error) {
            console.error('Recovery: Failed to save logs:', error);
        }
    },

    // Load recovery logs
    loadRecoveryLogs: function() {
        try {
            const logs = localStorage.getItem('gami_recovery_logs');
            if (logs) {
                this.config.recoveryLogs = JSON.parse(logs);
            }
        } catch (error) {
            console.error('Recovery: Failed to load logs:', error);
        }
    },

    // Public API methods
    API: {
        // Start recovery for specific user
        startRecovery: function(username) {
            return GAMIRecovery.startRecoveryProcess(username);
        },
        
        // Validate recovery token
        validateRecoveryToken: function(token) {
            if (!window.GAMIAuthVault) return false;
            return window.GAMIAuthVault.validateRecoveryToken(token);
        },
        
        // Get recovery status
        getStatus: function() {
            return {
                isActive: GAMIRecovery.config.isRecoveryActive,
                lockedUsers: GAMIRecovery.config.lockedUsers.size,
                recentLogs: GAMIRecovery.config.recoveryLogs.slice(-5)
            };
        },
        
        // Clear recovery locks for user
        clearUserLock: function(username) {
            return GAMIRecovery.config.lockedUsers.delete(username);
        },
        
        // Get security questions for user
        getUserSecurityProfile: function(username) {
            // Return sanitized version (no actual answers)
            return {
                hasActivityData: !!GAMIRecovery.securityData.lastActivity,
                hasFriends: GAMIRecovery.securityData.friendNames.length > 0,
                hasUpgradeData: !!GAMIRecovery.securityData.lastUpgrade,
                backupQuestions: GAMIRecovery.securityData.backupQuestions.length
            };
        }
    }
};

// Initialize on load
window.addEventListener('load', () => {
    // Wait for dependencies
    const checkDependencies = () => {
        if (typeof window.GAMIAuthVault !== 'undefined') {
            GAMIRecovery.initialize();
        } else {
            setTimeout(checkDependencies, 1000);
        }
    };
    
    setTimeout(checkDependencies, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAMIRecovery;
}

// Make API available globally
if (typeof window !== 'undefined') {
    window.GAMIRecovery = GAMIRecovery.API;
}

console.log('GAMI Recovery System loaded');