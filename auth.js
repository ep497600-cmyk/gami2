class FaceAuth {
    constructor() {
        this.identityKey = null;
        this.hardwareId = this.generateHardwareId();
        this.attempts = 0;
        this.maxAttempts = 5;
        this.isScanning = false;
        this.faceModel = null;
        this.videoStream = null;
        this.scanInterval = null;
    }
    
    generateHardwareId() {
        const navigatorInfo = [
            navigator.userAgent,
            navigator.platform,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ].join('|');
        
        const hash = this.hashString(navigatorInfo);
        return 'HW-' + hash.substring(0, 16);
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    
    async initializeFaceModel() {
        try {
            await tf.setBackend('webgl');
            this.faceModel = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1 }
            );
            return true;
        } catch (error) {
            console.error('Face model loading failed:', error);
            return false;
        }
    }
    
    async startFaceScan(isRecovery = false) {
        if (this.isScanning) return false;
        
        const termsAccepted = document.getElementById('termsCheck').checked;
        if (!termsAccepted) {
            alert('Please accept the terms to continue. Camera access is required for security verification.');
            return false;
        }
        
        this.isScanning = true;
        this.showScanOverlay();
        
        try {
            // Request camera with specific constraints for better face detection
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: false
            });
            
            const video = document.getElementById('faceVideo');
            const canvas = document.getElementById('faceCanvas');
            video.srcObject = this.videoStream;
            
            await video.play();
            
            // Initialize face model if not already loaded
            if (!this.faceModel) {
                await this.initializeFaceModel();
            }
            
            // Start scanning process
            return new Promise((resolve, reject) => {
                let scanProgress = 0;
                const progressBar = document.getElementById('scanProgress');
                
                this.scanInterval = setInterval(async () => {
                    try {
                        scanProgress += 10;
                        progressBar.style.width = scanProgress + '%';
                        
                        if (scanProgress >= 30) {
                            // Capture face data every interval
                            const faceData = await this.captureFaceData(video, canvas);
                            
                            if (faceData && scanProgress >= 100) {
                                clearInterval(this.scanInterval);
                                await this.processFaceData(faceData, isRecovery);
                                this.hideScanOverlay();
                                this.isScanning = false;
                                resolve(true);
                            }
                        }
                    } catch (error) {
                        clearInterval(this.scanInterval);
                        this.isScanning = false;
                        reject(error);
                    }
                }, 200);
                
                // Set timeout for scan
                setTimeout(() => {
                    if (this.isScanning) {
                        clearInterval(this.scanInterval);
                        this.isScanning = false;
                        reject(new Error('Face scan timeout'));
                    }
                }, 10000);
            });
            
        } catch (error) {
            console.error('Face scan error:', error);
            this.isScanning = false;
            this.hideScanOverlay();
            
            if (error.name === 'NotAllowedError') {
                alert('Camera access is required for face verification. Please allow camera access and try again.');
            }
            
            return false;
        }
    }
    
    async captureFaceData(video, canvas) {
        try {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Use TensorFlow.js for face detection
            const predictions = await this.faceModel.estimateFaces({
                input: canvas
            });
            
            if (predictions.length === 0) {
                throw new Error('No face detected');
            }
            
            // Extract face landmarks
            const face = predictions[0];
            const landmarks = face.scaledMesh;
            
            // Calculate face metrics for verification
            const faceMetrics = this.calculateFaceMetrics(landmarks);
            
            // Create face signature
            const faceSignature = this.createFaceSignature(faceMetrics, canvas);
            
            return {
                imageData: canvas.toDataURL('image/jpeg', 0.7),
                landmarks: landmarks,
                metrics: faceMetrics,
                signature: faceSignature,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('Face capture error:', error);
            return null;
        }
    }
    
    calculateFaceMetrics(landmarks) {
        // Calculate facial proportions and geometry
        const leftEye = landmarks[33];  // Left eye center
        const rightEye = landmarks[263]; // Right eye center
        const noseTip = landmarks[1];    // Nose tip
        const mouthLeft = landmarks[61];  // Mouth left corner
        const mouthRight = landmarks[291]; // Mouth right corner
        
        // Calculate distances and ratios
        const eyeDistance = this.calculateDistance(leftEye, rightEye);
        const faceWidth = this.calculateDistance(landmarks[234], landmarks[454]); // Face width
        const faceHeight = this.calculateDistance(landmarks[10], landmarks[152]); // Face height
        
        // Calculate facial ratios (golden ratio approximations)
        const eyeToFaceRatio = eyeDistance / faceWidth;
        const facialSymmetry = this.calculateSymmetry(landmarks);
        
        return {
            eyeDistance,
            faceWidth,
            faceHeight,
            eyeToFaceRatio,
            facialSymmetry,
            landmarkCount: landmarks.length
        };
    }
    
    calculateDistance(point1, point2) {
        const dx = point1[0] - point2[0];
        const dy = point1[1] - point2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    calculateSymmetry(landmarks) {
        // Calculate facial symmetry score
        let symmetryScore = 0;
        const midPoints = [168, 197, 2, 326, 423]; // Center face points
        
        for (const point of midPoints) {
            const leftIndex = point - 1;
            const rightIndex = point + 1;
            
            if (landmarks[leftIndex] && landmarks[rightIndex]) {
                const leftPoint = landmarks[leftIndex];
                const rightPoint = landmarks[rightIndex];
                
                // Mirror right point across vertical axis
                const mirroredRight = [512 - rightPoint[0], rightPoint[1]];
                const distance = this.calculateDistance(leftPoint, mirroredRight);
                symmetryScore += (1 - distance / 100);
            }
        }
        
        return symmetryScore / midPoints.length;
    }
    
    createFaceSignature(metrics, canvas) {
        // Create unique face signature
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        
        let pixelHash = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            pixelHash = ((pixelHash << 5) - pixelHash) + imageData[i];
            pixelHash = pixelHash & pixelHash;
        }
        
        const metricString = [
            metrics.eyeDistance.toFixed(2),
            metrics.faceWidth.toFixed(2),
            metrics.eyeToFaceRatio.toFixed(4),
            metrics.facialSymmetry.toFixed(4)
        ].join('-');
        
        const combinedHash = this.hashString(metricString + pixelHash + this.hardwareId);
        return 'FS-' + combinedHash.substring(0, 32);
    }
    
    async processFaceData(faceData, isRecovery) {
        if (isRecovery) {
            return this.handleRecovery(faceData);
        } else {
            return this.handleNewIdentity(faceData);
        }
    }
    
    async handleNewIdentity(faceData) {
        // Check if face already exists in system
        const existingFaces = this.getStoredFaces();
        
        // Check for duplicate faces
        for (const storedFace of existingFaces) {
            const similarity = this.compareFaces(faceData, storedFace);
            if (similarity > 0.8) { // 80% similarity threshold
                throw new Error('Face already registered in system');
            }
        }
        
        // Create new identity
        this.identityKey = faceData.signature;
        
        // Generate username based on face metrics
        const username = this.generateUsername(faceData.metrics);
        
        // Store identity data
        this.storeIdentity(faceData, username);
        
        // Initialize user profile
        this.initializeUserProfile(username);
        
        return true;
    }
    
    async handleRecovery(faceData) {
        this.attempts++;
        
        if (this.attempts >= this.maxAttempts) {
            this.triggerPermanentBlock();
            return false;
        }
        
        const existingFaces = this.getStoredFaces();
        
        for (const storedFace of existingFaces) {
            const similarity = this.compareFaces(faceData, storedFace);
            
            if (similarity > 0.7) { // 70% similarity for recovery
                this.identityKey = storedFace.signature;
                
                // Restore user data
                this.restoreUserData(storedFace.username);
                
                this.attempts = 0; // Reset attempts on successful recovery
                return true;
            }
        }
        
        if (this.attempts >= 3) {
            this.showRecoveryWarning();
        }
        
        throw new Error('No matching face found');
    }
    
    compareFaces(face1, face2) {
        // Compare facial metrics
        let similarity = 0;
        
        const metrics1 = face1.metrics;
        const metrics2 = face2.metrics;
        
        // Compare key metrics
        const eyeRatioDiff = Math.abs(metrics1.eyeToFaceRatio - metrics2.eyeToFaceRatio);
        const symmetryDiff = Math.abs(metrics1.facialSymmetry - metrics2.facialSymmetry);
        
        similarity += (1 - eyeRatioDiff) * 0.4;
        similarity += (1 - symmetryDiff) * 0.4;
        
        // Compare landmark count
        if (metrics1.landmarkCount === metrics2.landmarkCount) {
            similarity += 0.2;
        }
        
        return similarity;
    }
    
    generateUsername(metrics) {
        const adjectives = ['Digital', 'Prismatic', 'Liquid', 'Secure', 'Verified', 'Global'];
        const nouns = ['Explorer', 'Traveler', 'Creator', 'Connector', 'Visionary', 'Human'];
        
        const adjIndex = Math.floor(Math.abs(metrics.eyeToFaceRatio) * adjectives.length) % adjectives.length;
        const nounIndex = Math.floor(Math.abs(metrics.facialSymmetry) * nouns.length) % nouns.length;
        
        const randomNum = Math.floor(Math.abs(metrics.faceWidth) % 999);
        
        return `${adjectives[adjIndex]}${nouns[nounIndex]}${randomNum}`;
    }
    
    storeIdentity(faceData, username) {
        const identityData = {
            signature: faceData.signature,
            username: username,
            hardwareId: this.hardwareId,
            faceMetrics: faceData.metrics,
            registrationDate: new Date().toISOString(),
            trustScore: 100,
            recoveryAttempts: 0
        };
        
        // Store in localStorage (in production, this would be encrypted)
        localStorage.setItem('aura_identity', JSON.stringify(identityData));
        localStorage.setItem('aura_username', username);
        localStorage.setItem('aura_hardware', this.hardwareId);
        localStorage.setItem('aura_avatarColor', this.generateAvatarColor(faceData.metrics));
        
        // Add to faces registry
        const facesRegistry = JSON.parse(localStorage.getItem('aura_faces') || '[]');
        facesRegistry.push({
            signature: faceData.signature,
            username: username,
            timestamp: Date.now()
        });
        localStorage.setItem('aura_faces', JSON.stringify(facesRegistry));
    }
    
    generateAvatarColor(metrics) {
        // Generate unique color based on face metrics
        const hue = Math.floor((metrics.eyeToFaceRatio * 360) % 360);
        const saturation = 70 + Math.floor(metrics.facialSymmetry * 30);
        const lightness = 50 + Math.floor((metrics.faceWidth % 100) / 4);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    restoreUserData(username) {
        // Restore user session
        localStorage.setItem('aura_username', username);
        
        // Update UI
        document.getElementById('usernameDisplay').textContent = username;
        
        // Show success message
        this.showRecoverySuccess();
    }
    
    initializeUserProfile(username) {
        // Set initial user settings
        const userSettings = {
            isPublic: true,
            preferredCategories: ['all'],
            language: navigator.language || 'en-US',
            lastActive: Date.now(),
            connections: [],
            blockList: []
        };
        
        localStorage.setItem('aura_settings', JSON.stringify(userSettings));
    }
    
    getStoredFaces() {
        try {
            const facesRegistry = JSON.parse(localStorage.getItem('aura_faces') || '[]');
            return facesRegistry;
        } catch (error) {
            console.error('Error reading faces registry:', error);
            return [];
        }
    }
    
    showScanOverlay() {
        document.getElementById('faceScanOverlay').classList.remove('hidden');
        document.getElementById('scanProgress').style.width = '0%';
    }
    
    hideScanOverlay() {
        document.getElementById('faceScanOverlay').classList.add('hidden');
        
        // Stop video stream
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        
        // Clear scan interval
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }
    
    showRecoveryWarning() {
        const remainingAttempts = this.maxAttempts - this.attempts;
        alert(`Warning: ${remainingAttempts} recovery attempts remaining. After ${this.maxAttempts} failed attempts, your device will be permanently blocked.`);
    }
    
    showRecoverySuccess() {
        alert('✅ Identity recovered successfully! Welcome back.');
    }
    
    triggerPermanentBlock() {
        // Store ban record
        const banRecord = {
            hardwareId: this.hardwareId,
            bannedAt: new Date().toISOString(),
            reason: 'Excessive failed recovery attempts',
            attempts: this.attempts
        };
        
        localStorage.setItem('aura_banned', 'true');
        localStorage.setItem('aura_ban_record', JSON.stringify(banRecord));
        
        // Clear all user data
        this.clearUserData();
        
        // Show warning screen
        this.showBanScreen(banRecord);
    }
    
    clearUserData() {
        // Clear all authentication data
        const keysToRemove = [
            'aura_identity',
            'aura_username',
            'aura_hardware',
            'aura_settings',
            'aura_avatarColor'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    showBanScreen(banRecord) {
        const warningMessage = `
            ⚠️ SECURITY ALERT ⚠️
            
            Your device has been permanently banned from AURA.
            
            Reason: ${banRecord.reason}
            Failed Attempts: ${banRecord.attempts}
            Device ID: ${banRecord.hardwareId}
            Time: ${new Date(banRecord.bannedAt).toLocaleString()}
            
            This action is irreversible. The device cannot create new accounts.
        `;
        
        document.getElementById('warningMessage').textContent = warningMessage;
        document.getElementById('deviceInfo').textContent = `Device ID: ${banRecord.hardwareId}`;
        
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('warningScreen').classList.remove('hidden');
    }
    
    async validateSession() {
        const identity = localStorage.getItem('aura_identity');
        const storedHardware = localStorage.getItem('aura_hardware');
        
        if (!identity || !storedHardware) {
            return false;
        }
        
        // Check hardware match
        if (storedHardware !== this.hardwareId) {
            console.warn('Hardware ID mismatch');
            return false;
        }
        
        // Check if banned
        if (localStorage.getItem('aura_banned') === 'true') {
            return false;
        }
        
        return true;
    }
    
    getCurrentUser() {
        try {
            const identity = JSON.parse(localStorage.getItem('aura_identity') || '{}');
            return {
                username: localStorage.getItem('aura_username') || 'User',
                hardwareId: this.hardwareId,
                trustScore: identity.trustScore || 100,
                isPublic: identity.isPublic !== false
            };
        } catch (error) {
            return {
                username: 'User',
                hardwareId: this.hardwareId,
                trustScore: 100,
                isPublic: true
            };
        }
    }
}

// Initialize FaceAuth
const faceAuth = new FaceAuth();

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const newIdentityBtn = document.getElementById('newIdentity');
    const recoverAccountBtn = document.getElementById('recoverAccount');
    const cancelScanBtn = document.getElementById('cancelScan');
    const warningOkBtn = document.getElementById('warningOk');
    
    if (newIdentityBtn) {
        newIdentityBtn.addEventListener('click', async () => {
            const success = await faceAuth.startFaceScan(false);
            if (success) {
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('homeScreen').classList.remove('hidden');
                loadUserProfile();
            }
        });
    }
    
    if (recoverAccountBtn) {
        recoverAccountBtn.addEventListener('click', async () => {
            const success = await faceAuth.startFaceScan(true);
            if (success) {
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('homeScreen').classList.remove('hidden');
                loadUserProfile();
            } else {
                alert('Recovery failed. Please try again or create a new identity.');
            }
        });
    }
    
    if (cancelScanBtn) {
        cancelScanBtn.addEventListener('click', () => {
            faceAuth.hideScanOverlay();
            faceAuth.isScanning = false;
        });
    }
    
    if (warningOkBtn) {
        warningOkBtn.addEventListener('click', () => {
            // Clear everything and reload
            localStorage.clear();
            location.reload();
        });
    }
});

function loadUserProfile() {
    const user = faceAuth.getCurrentUser();
    
    document.getElementById('usernameDisplay').textContent = user.username;
    document.getElementById('userStatus').textContent = '● Online';
    
    const avatarColor = localStorage.getItem('aura_avatarColor') || '#667eea';
    document.getElementById('userAvatar').style.background = 
        `linear-gradient(45deg, ${avatarColor}, #764ba2)`;
}

// Export for other modules
window.faceAuth = faceAuth;