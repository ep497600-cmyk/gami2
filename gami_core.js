// gami_core.js - GAMI Project
// Ultimate Controller and Central Nervous System
// Creator: mak_07s__ mr asif khan
// Version: 1.0.0 - The Final Connector
// Description: Central traffic controller for all 14 modules
// Synchronizes state, manages scenes, and ensures system integrity

"use strict";

// Main GAMI Core Controller Class
class GamiCore {
    constructor() {
        // Central State Management
        this.state = {
            // System Status
            initialized: false,
            currentScene: 'loading',
            previousScene: null,
            systemReady: false,
            modulesLoaded: 0,
            totalModules: 14,
            
            // User State
            user: {
                authenticated: false,
                username: null,
                sessionId: null,
                loginTime: null,
                privileges: 'user'
            },
            
            // Game State
            game: {
                active: false,
                worldLoaded: false,
                evolutionStage: 0,
                coins: 0n,
                reputation: 0,
                level: 1,
                experience: 0
            },
            
            // UI State
            ui: {
                theme: 'royal',
                glassEffect: true,
                prismActive: true,
                notifications: [],
                modalOpen: false
            },
            
            // Network State
            network: {
                connected: true,
                p2pActive: false,
                chatConnected: false,
                latency: 0
            },
            
            // Security State
            security: {
                trapActive: false,
                mirrorWorld: false,
                lastSecurityCheck: null,
                violations: 0
            },
            
            // Module Health
            modules: {
                ai_brain: { loaded: false, healthy: true, lastCheck: null },
                auth_vault: { loaded: false, healthy: true, lastCheck: null },
                world_3d: { loaded: false, healthy: true, lastCheck: null },
                evolution: { loaded: false, healthy: true, lastCheck: null },
                economy: { loaded: false, healthy: true, lastCheck: null },
                worker_manager: { loaded: false, healthy: true, lastCheck: null },
                p2p_chat: { loaded: false, healthy: true, lastCheck: null },
                secret_config: { loaded: false, healthy: true, lastCheck: null },
                branding: { loaded: false, healthy: true, lastCheck: null },
                logistics: { loaded: false, healthy: true, lastCheck: null },
                recovery: { loaded: false, healthy: true, lastCheck: null },
                hacker_trap: { loaded: false, healthy: true, lastCheck: null }
            },
            
            // Performance Metrics
            performance: {
                fps: 0,
                memoryUsage: 0,
                loadTime: 0,
                lastUpdate: null
            }
        };
        
        // Module Connectors
        this.connectors = new Map();
        
        // Event System
        this.events = new Map();
        
        // Mobile Sensors
        this.sensors = {
            orientation: null,
            motion: null,
            touch: null
        };
        
        // Initialize
        this.init();
    }
    
    // Core Initialization
    init() {
        console.log('GAMI Core Initializing...');
        console.log('Establishing Central Control System');
        
        // Create Global GAMI Object
        this.createGlobalObject();
        
        // Setup Security First
        this.setupSecurityLayer();
        
        // Initialize Event System
        this.setupEventSystem();
        
        // Setup Scene Management
        this.setupSceneManagement();
        
        // Setup Mobile Optimization
        this.setupMobileOptimization();
        
        // Setup Error Handling
        this.setupErrorHandling();
        
        // Setup Performance Monitoring
        this.setupPerformanceMonitoring();
        
        // Load Modules Sequentially
        this.loadModules();
        
        console.log('GAMI Core: System Initialized');
    }
    
    // Create Global GAMI Object
    createGlobalObject() {
        window.GamiMaster = {
            // State Access
            getState: (key) => this.getState(key),
            setState: (key, value) => this.setState(key, value),
            updateState: (updates) => this.updateState(updates),
            
            // Module Control
            getModule: (module) => this.getModule(module),
            callModule: (module, method, ...args) => this.callModule(module, method, ...args),
            
            // Event System
            on: (event, callback) => this.on(event, callback),
            off: (event, callback) => this.off(event, callback),
            emit: (event, data) => this.emit(event, data),
            
            // Scene Control
            switchScene: (scene) => this.switchScene(scene),
            getCurrentScene: () => this.state.currentScene,
            
            // Utility
            isMobile: () => this.isMobile(),
            isSecure: () => this.checkSecurity(),
            getPerformance: () => this.state.performance,
            
            // Debug
            debug: {
                state: () => ({ ...this.state }),
                modules: () => ({ ...this.state.modules }),
                events: () => Array.from(this.events.keys())
            }
        };
        
        // Also create window.GAMI for backward compatibility
        window.GAMI = window.GamiMaster;
        
        console.log('GAMI Master Object: Created');
    }
    
    // Setup Security Layer
    setupSecurityLayer() {
        // First priority: Check if hacker_trap is needed
        const securityCheck = () => {
            try {
                // Detect dev tools
                const threshold = 160;
                const devToolsOpen = 
                    window.outerWidth - window.innerWidth > threshold ||
                    window.outerHeight - window.innerHeight > threshold;
                
                if (devToolsOpen && !this.state.security.trapActive) {
                    console.warn('GAMI Core: Security violation detected');
                    this.triggerSecurityProtocol();
                }
            } catch (error) {
                // Silent security check
            }
        };
        
        // Continuous security monitoring
        setInterval(securityCheck, 1000);
        
        // Also check on resize
        window.addEventListener('resize', securityCheck);
        
        console.log('GAMI Core: Security Layer Established');
    }
    
    // Trigger Security Protocol
    triggerSecurityProtocol() {
        // Notify hacker_trap.js if loaded
        if (window.GAMIHackerTrap) {
            window.GAMIHackerTrap.testTrap();
            this.state.security.trapActive = true;
            this.emit('security_violation', { type: 'devtools_detected' });
        }
    }
    
    // Setup Event System
    setupEventSystem() {
        // Core Events
        this.registerCoreEvents();
        
        // Module Events
        this.registerModuleEvents();
        
        // UI Events
        this.registerUIEvents();
        
        console.log('GAMI Core: Event System Ready');
    }
    
    registerCoreEvents() {
        // System Events
        this.events.set('system_ready', []);
        this.events.set('module_loaded', []);
        this.events.set('module_error', []);
        this.events.set('scene_changed', []);
        this.events.set('user_authenticated', []);
        this.events.set('game_started', []);
        this.events.set('security_alert', []);
        this.events.set('performance_warning', []);
        
        // State Events
        this.events.set('state_updated', []);
        this.events.set('coins_updated', []);
        this.events.set('theme_changed', []);
        this.events.set('notification_added', []);
    }
    
    registerModuleEvents() {
        // AI Brain Events
        this.events.set('ai_prism_ready', []);
        this.events.set('ai_command_received', []);
        this.events.set('ai_error_detected', []);
        
        // Auth Events
        this.events.set('login_success', []);
        this.events.set('login_failed', []);
        this.events.set('logout', []);
        
        // World 3D Events
        this.events.set('world_loaded', []);
        this.events.set('world_error', []);
        this.events.set('object_interacted', []);
        
        // Evolution Events
        this.events.set('evolution_started', []);
        this.events.set('evolution_completed', []);
        this.events.set('morphing_update', []);
        
        // Economy Events
        this.events.set('transaction_completed', []);
        this.events.set('coins_changed', []);
        this.events.set('market_update', []);
        
        // Worker Events
        this.events.set('worker_hired', []);
        this.events.set('worker_task_completed', []);
        this.events.set('worker_error', []);
        
        // Chat Events
        this.events.set('chat_connected', []);
        this.events.set('message_received', []);
        this.events.set('story_generated', []);
        
        // Logistics Events
        this.events.set('delivery_arrived', []);
        this.events.set('stock_updated', []);
        this.events.set('shop_glow_changed', []);
        
        // Branding Events
        this.events.set('branding_applied', []);
        this.events.set('user_name_updated', []);
        
        // Recovery Events
        this.events.set('recovery_initiated', []);
        this.events.set('recovery_completed', []);
        this.events.set('recovery_failed', []);
    }
    
    registerUIEvents() {
        // Touch Events
        this.events.set('touch_start', []);
        this.events.set('touch_move', []);
        this.events.set('touch_end', []);
        this.events.set('gesture_detected', []);
        
        // Button Events
        this.events.set('button_pressed', []);
        this.events.set('modal_opened', []);
        this.events.set('modal_closed', []);
        
        // Theme Events
        this.events.set('theme_changing', []);
        this.events.set('theme_changed', []);
    }
    
    // Event System Methods
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        return this;
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }
    
    emit(event, data) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`GAMI Core: Event handler error for ${event}:`, error);
                }
            });
        }
        return this;
    }
    
    // Setup Scene Management
    setupSceneManagement() {
        // Scene Definitions
        this.scenes = {
            loading: {
                name: 'loading',
                duration: 2000, // 2 seconds
                next: 'login',
                template: 'loading-screen',
                requires: []
            },
            login: {
                name: 'login',
                template: 'login-screen',
                next: 'home',
                requires: ['auth_vault', 'master_style']
            },
            home: {
                name: 'home',
                template: 'home-screen',
                next: 'game',
                requires: ['ai_brain', 'branding', 'p2p_chat']
            },
            game: {
                name: 'game',
                template: 'game-world',
                next: null,
                requires: ['world_3d', 'evolution', 'economy', 'worker_manager', 'logistics']
            },
            recovery: {
                name: 'recovery',
                template: 'recovery-screen',
                next: 'login',
                requires: ['recovery']
            }
        };
        
        // Scene Transition Logic
        this.sceneTransitions = new Map();
        
        console.log('GAMI Core: Scene Management Ready');
    }
    
    // Switch Scene
    switchScene(targetScene) {
        if (!this.scenes[targetScene]) {
            console.error(`GAMI Core: Unknown scene ${targetScene}`);
            return false;
        }
        
        const currentScene = this.state.currentScene;
        const scene = this.scenes[targetScene];
        
        // Check requirements
        const missingModules = scene.requires.filter(module => 
            !this.state.modules[module]?.loaded
        );
        
        if (missingModules.length > 0) {
            console.error(`GAMI Core: Missing modules for ${targetScene}:`, missingModules);
            return false;
        }
        
        // Store previous scene
        this.state.previousScene = currentScene;
        
        // Execute scene transition
        this.executeSceneTransition(currentScene, targetScene);
        
        // Update state
        this.state.currentScene = targetScene;
        
        // Emit event
        this.emit('scene_changed', {
            from: currentScene,
            to: targetScene,
            timestamp: Date.now()
        });
        
        console.log(`GAMI Core: Scene changed from ${currentScene} to ${targetScene}`);
        return true;
    }
    
    // Execute Scene Transition
    executeSceneTransition(fromScene, toScene) {
        // Hide current scene
        this.hideScene(fromScene);
        
        // Show new scene
        this.showScene(toScene);
        
        // Execute transition effects
        this.playTransitionEffect(fromScene, toScene);
        
        // Initialize scene-specific systems
        this.initializeSceneSystems(toScene);
    }
    
    hideScene(scene) {
        const sceneElement = document.getElementById(`${scene}-scene`);
        if (sceneElement) {
            sceneElement.style.display = 'none';
            sceneElement.style.opacity = '0';
            sceneElement.style.pointerEvents = 'none';
        }
        
        // Deactivate scene-specific modules
        this.deactivateSceneModules(scene);
    }
    
    showScene(scene) {
        const sceneElement = document.getElementById(`${scene}-scene`);
        if (sceneElement) {
            sceneElement.style.display = 'block';
            sceneElement.style.opacity = '1';
            sceneElement.style.pointerEvents = 'auto';
            
            // Add active class
            sceneElement.classList.add('active-scene');
            
            // Remove from other scenes
            document.querySelectorAll('.scene-container').forEach(el => {
                if (el.id !== `${scene}-scene`) {
                    el.classList.remove('active-scene');
                }
            });
        }
        
        // Activate scene-specific modules
        this.activateSceneModules(scene);
    }
    
    deactivateSceneModules(scene) {
        switch(scene) {
            case 'loading':
                // Nothing to deactivate
                break;
            case 'login':
                // Deactivate auth vault animations
                if (window.GAMIAuthVault && window.GAMIAuthVault.deactivate) {
                    window.GAMIAuthVault.deactivate();
                }
                break;
            case 'home':
                // Deactivate AI Prism animations
                if (window.GAMIAIBrain && window.GAMIAIBrain.deactivate) {
                    window.GAMIAIBrain.deactivate();
                }
                break;
            case 'game':
                // Deactivate 3D world
                if (window.WORLD_3D && window.WORLD_3D.pause) {
                    window.WORLD_3D.pause();
                }
                break;
        }
    }
    
    activateSceneModules(scene) {
        switch(scene) {
            case 'loading':
                // Start loading animation
                this.playLoadingAnimation();
                break;
            case 'login':
                // Activate auth vault
                if (window.GAMIAuthVault && window.GAMIAuthVault.activate) {
                    window.GAMIAuthVault.activate();
                }
                break;
            case 'home':
                // Activate AI Prism
                if (window.GAMIAIBrain && window.GAMIAIBrain.activate) {
                    window.GAMIAIBrain.activate();
                }
                // Activate branding
                if (window.GAMIBranding && window.GAMIBranding.updateDisplay) {
                    window.GAMIBranding.updateDisplay();
                }
                break;
            case 'game':
                // Activate 3D world
                if (window.WORLD_3D && window.WORLD_3D.resume) {
                    window.WORLD_3D.resume();
                }
                // Activate economy
                if (window.GAMIEconomy && window.GAMIEconomy.start) {
                    window.GAMIEconomy.start();
                }
                // Activate logistics
                if (window.GAMILogistics && window.GAMILogistics.checkAllShopStock) {
                    window.GAMILogistics.checkAllShopStock();
                }
                break;
        }
    }
    
    playTransitionEffect(fromScene, toScene) {
        // Create transition overlay
        const overlay = document.createElement('div');
        overlay.className = 'scene-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        
        // Animate
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            }, 300);
        });
    }
    
    playLoadingAnimation() {
        // G-A-I-M-I animation
        const letters = ['G', 'A', 'I', 'M', 'I'];
        let index = 0;
        
        const animate = () => {
            if (index < letters.length) {
                const letter = letters[index];
                this.emit('loading_letter', { letter, index });
                index++;
                setTimeout(animate, 200);
            } else {
                this.emit('loading_complete', {});
                
                // Auto-switch to login after 2 seconds
                setTimeout(() => {
                    this.switchScene('login');
                }, 2000);
            }
        };
        
        animate();
    }
    
    // Setup Mobile Optimization
    setupMobileOptimization() {
        // Check if mobile
        this.isMobileDevice = this.detectMobile();
        
        if (this.isMobileDevice) {
            this.setupTouchGestures();
            this.setupMobileSensors();
            this.optimizeForMobile();
        }
        
        console.log(`GAMI Core: Mobile Optimization ${this.isMobileDevice ? 'Active' : 'Inactive'}`);
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            
            this.emit('touch_start', {
                x: touchStartX,
                y: touchStartY,
                target: e.target
            });
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            this.emit('touch_move', {
                x: e.changedTouches[0].screenX,
                y: e.changedTouches[0].screenY,
                target: e.target
            });
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            this.emit('touch_end', {
                x: touchEndX,
                y: touchEndY,
                target: e.target
            });
            
            // Detect swipe
            this.handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }
    
    handleSwipeGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Minimum swipe distance
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.emit('gesture_detected', { type: 'swipe_right', deltaX, deltaY });
                } else {
                    this.emit('gesture_detected', { type: 'swipe_left', deltaX, deltaY });
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.emit('gesture_detected', { type: 'swipe_down', deltaX, deltaY });
                } else {
                    this.emit('gesture_detected', { type: 'swipe_up', deltaX, deltaY });
                }
            }
        }
    }
    
    setupMobileSensors() {
        // Device Orientation
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                this.sensors.orientation = {
                    alpha: e.alpha,
                    beta: e.beta,
                    gamma: e.gamma
                };
                
                // Emit for 3D world adjustments
                this.emit('device_orientation', this.sensors.orientation);
            }, true);
        }
        
        // Device Motion
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                this.sensors.motion = {
                    acceleration: e.acceleration,
                    accelerationIncludingGravity: e.accelerationIncludingGravity,
                    rotationRate: e.rotationRate,
                    interval: e.interval
                };
            }, true);
        }
    }
    
    optimizeForMobile() {
        // Adjust viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        }
        
        // Prevent zoom on double-tap
        document.addEventListener('dblclick', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Prevent text selection
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }
    
    // Setup Error Handling
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error || event);
        });
        
        // Unhandled promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason);
        });
        
        // Module-specific error handling
        this.setupModuleErrorHandling();
        
        console.log('GAMI Core: Error Handling System Ready');
    }
    
    handleGlobalError(error) {
        console.error('GAMI Core: Global Error:', error);
        
        // Log error
        this.logError({
            type: 'global_error',
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            scene: this.state.currentScene
        });
        
        // Notify AI Brain for auto-fix
        this.notifyAIBrainForFix(error);
        
        // If critical, switch to safe scene
        if (this.isCriticalError(error)) {
            this.switchToSafeMode();
        }
    }
    
    handlePromiseRejection(reason) {
        console.error('GAMI Core: Unhandled Promise Rejection:', reason);
        
        this.logError({
            type: 'promise_rejection',
            reason: reason?.message || String(reason),
            timestamp: Date.now()
        });
    }
    
    setupModuleErrorHandling() {
        // Monitor module health
        setInterval(() => {
            this.checkModuleHealth();
        }, 10000); // Every 10 seconds
    }
    
    checkModuleHealth() {
        Object.keys(this.state.modules).forEach(moduleName => {
            const module = this.state.modules[moduleName];
            if (module.loaded && module.healthy) {
                // Check if module is responsive
                this.testModuleHealth(moduleName);
            }
        });
    }
    
    testModuleHealth(moduleName) {
        try {
            switch(moduleName) {
                case 'ai_brain':
                    if (window.GAMIAIBrain && window.GAMIAIBrain.getStatus) {
                        const status = window.GAMIAIBrain.getStatus();
                        if (!status || status.error) {
                            this.markModuleUnhealthy(moduleName, 'No response from AI Brain');
                        }
                    }
                    break;
                case 'world_3d':
                    if (window.WORLD_3D && window.WORLD_3D.getScene) {
                        const scene = window.WORLD_3D.getScene();
                        if (!scene) {
                            this.markModuleUnhealthy(moduleName, '3D scene not available');
                        }
                    }
                    break;
                case 'economy':
                    if (window.GAMIEconomy && window.GAMIEconomy.getBalance) {
                        try {
                            window.GAMIEconomy.getBalance();
                        } catch (error) {
                            this.markModuleUnhealthy(moduleName, error.message);
                        }
                    }
                    break;
            }
        } catch (error) {
            this.markModuleUnhealthy(moduleName, error.message);
        }
    }
    
    markModuleUnhealthy(moduleName, reason) {
        this.state.modules[moduleName].healthy = false;
        this.state.modules[moduleName].lastCheck = Date.now();
        
        console.warn(`GAMI Core: Module ${moduleName} marked unhealthy:`, reason);
        
        this.emit('module_error', {
            module: moduleName,
            reason: reason,
            timestamp: Date.now()
        });
        
        // Notify AI Brain
        this.notifyAIBrainForModuleFix(moduleName, reason);
    }
    
    notifyAIBrainForFix(error) {
        if (window.GAMIAIBrain && window.GAMIAIBrain.fixError) {
            try {
                window.GAMIAIBrain.fixError({
                    error: error.message,
                    stack: error.stack,
                    context: {
                        scene: this.state.currentScene,
                        user: this.state.user.username,
                        timestamp: Date.now()
                    }
                });
            } catch (fixError) {
                console.error('GAMI Core: AI Brain fix failed:', fixError);
            }
        }
    }
    
    notifyAIBrainForModuleFix(moduleName, reason) {
        if (window.GAMIAIBrain && window.GAMIAIBrain.fixModule) {
            try {
                window.GAMIAIBrain.fixModule({
                    module: moduleName,
                    reason: reason,
                    timestamp: Date.now()
                });
            } catch (fixError) {
                console.error('GAMI Core: AI Brain module fix failed:', fixError);
            }
        }
    }
    
    isCriticalError(error) {
        const criticalErrors = [
            'Out of memory',
            'WebGL not supported',
            'Security violation',
            'Module initialization failed'
        ];
        
        return criticalErrors.some(critical => 
            error.message && error.message.includes(critical)
        );
    }
    
    switchToSafeMode() {
        console.warn('GAMI Core: Switching to Safe Mode');
        
        // Switch to home scene
        this.switchScene('home');
        
        // Disable non-essential modules
        this.disableNonEssentialModules();
        
        // Show safe mode notification
        this.showNotification({
            type: 'warning',
            title: 'Safe Mode Activated',
            message: 'System detected critical error. Some features disabled.',
            duration: 5000
        });
    }
    
    disableNonEssentialModules() {
        // Keep only essential modules
        const essentialModules = ['ai_brain', 'auth_vault', 'master_style'];
        
        Object.keys(this.state.modules).forEach(moduleName => {
            if (!essentialModules.includes(moduleName)) {
                this.deactivateModule(moduleName);
            }
        });
    }
    
    logError(errorData) {
        // Store in state
        if (!this.state.errorLog) {
            this.state.errorLog = [];
        }
        
        this.state.errorLog.push(errorData);
        
        // Keep only last 100 errors
        if (this.state.errorLog.length > 100) {
            this.state.errorLog.shift();
        }
        
        // Send to server if available
        this.reportErrorToServer(errorData);
    }
    
    reportErrorToServer(errorData) {
        // Implementation for error reporting
        try {
            if (navigator.sendBeacon) {
                const data = new Blob([JSON.stringify({
                    ...errorData,
                    app: 'GAMI',
                    version: '1.0.0',
                    userAgent: navigator.userAgent
                })], { type: 'application/json' });
                
                navigator.sendBeacon('/api/error/log', data);
            }
        } catch (e) {
            // Silent fail
        }
    }
    
    // Setup Performance Monitoring
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                this.state.performance.fps = Math.round(
                    (frameCount * 1000) / (currentTime - lastTime)
                );
                frameCount = 0;
                lastTime = currentTime;
                
                // Check for low FPS
                if (this.state.performance.fps < 30) {
                    this.emit('performance_warning', {
                        fps: this.state.performance.fps,
                        timestamp: Date.now()
                    });
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        // Start FPS monitoring
        requestAnimationFrame(measureFPS);
        
        // Monitor memory
        if (performance.memory) {
            setInterval(() => {
                this.state.performance.memoryUsage = 
                    performance.memory.usedJSHeapSize / 1024 / 1024; // MB
            }, 5000);
        }
        
        // Monitor load time
        window.addEventListener('load', () => {
            this.state.performance.loadTime = performance.now();
        });
        
        console.log('GAMI Core: Performance Monitoring Active');
    }
    
    // Load Modules
    loadModules() {
        console.log('GAMI Core: Loading Modules...');
        
        // Load in specific order for dependencies
        const loadOrder = [
            'secret_config',    // First: Settings
            'master_style',     // Second: UI Framework
            'hacker_trap',      // Third: Security
            'auth_vault',       // Fourth: Authentication
            'ai_brain',         // Fifth: AI System
            'economy',          // Sixth: Economy
            'world_3d',         // Seventh: 3D Engine
            'evolution',        // Eighth: Evolution System
            'worker_manager',   // Ninth: Workers
            'p2p_chat',         // Tenth: Chat
            'branding',         // Eleventh: Branding
            'logistics',        // Twelfth: Logistics
            'recovery'          // Thirteenth: Recovery
        ];
        
        let currentIndex = 0;
        
        const loadNextModule = () => {
            if (currentIndex >= loadOrder.length) {
                this.allModulesLoaded();
                return;
            }
            
            const moduleName = loadOrder[currentIndex];
            this.loadModule(moduleName).then(() => {
                currentIndex++;
                loadNextModule();
            }).catch(error => {
                console.error(`GAMI Core: Failed to load ${moduleName}:`, error);
                currentIndex++;
                loadNextModule(); // Continue with next module
            });
        };
        
        loadNextModule();
    }
    
    async loadModule(moduleName) {
        return new Promise((resolve, reject) => {
            // Check if module already loaded
            if (this.state.modules[moduleName]?.loaded) {
                console.log(`GAMI Core: ${moduleName} already loaded`);
                resolve();
                return;
            }
            
            // Module-specific initialization
            switch(moduleName) {
                case 'secret_config':
                    this.initializeSecretConfig();
                    break;
                case 'master_style':
                    this.initializeMasterStyle();
                    break;
                case 'hacker_trap':
                    this.initializeHackerTrap();
                    break;
                case 'auth_vault':
                    this.initializeAuthVault();
                    break;
                case 'ai_brain':
                    this.initializeAIBrain();
                    break;
                case 'economy':
                    this.initializeEconomy();
                    break;
                case 'world_3d':
                    this.initializeWorld3D();
                    break;
                case 'evolution':
                    this.initializeEvolution();
                    break;
                case 'worker_manager':
                    this.initializeWorkerManager();
                    break;
                case 'p2p_chat':
                    this.initializeP2PChat();
                    break;
                case 'branding':
                    this.initializeBranding();
                    break;
                case 'logistics':
                    this.initializeLogistics();
                    break;
                case 'recovery':
                    this.initializeRecovery();
                    break;
            }
            
            // Mark as loaded
            this.state.modules[moduleName] = {
                loaded: true,
                healthy: true,
                lastCheck: Date.now()
            };
            
            this.state.modulesLoaded++;
            
            // Emit event
            this.emit('module_loaded', {
                module: moduleName,
                index: this.state.modulesLoaded,
                total: this.state.totalModules
            });
            
            console.log(`GAMI Core: ${moduleName} loaded (${this.state.modulesLoaded}/${this.state.totalModules})`);
            resolve();
        });
    }
    
    // Module Initialization Methods
    initializeSecretConfig() {
        if (window.SecretConfig && window.SecretConfig.initialize) {
            try {
                window.SecretConfig.initialize();
                console.log('GAMI Core: Secret Config Initialized');
            } catch (error) {
                console.error('GAMI Core: Secret Config Initialization failed:', error);
            }
        }
    }
    
    initializeMasterStyle() {
        // Apply initial theme
        const savedTheme = localStorage.getItem('gami_theme') || 'royal';
        this.setState('ui.theme', savedTheme);
        
        // Apply theme class to body
        document.body.className = `theme-${savedTheme} glass-ui`;
        
        console.log('GAMI Core: Master Style Initialized');
    }
    
    initializeHackerTrap() {
        if (window.GAMIHackerTrap && window.GAMIHackerTrap.getStatus) {
            const status = window.GAMIHackerTrap.getStatus();
            this.state.security.trapActive = status.active;
            console.log('GAMI Core: Hacker Trap Initialized');
        }
    }
    
    initializeAuthVault() {
        // Check for existing session
        const savedUsername = localStorage.getItem('gami_username');
        if (savedUsername) {
            this.state.user.username = savedUsername;
            this.state.user.authenticated = true;
            this.state.user.loginTime = Date.now();
            
            // Generate session ID
            this.state.user.sessionId = this.generateSessionId();
            
            console.log(`GAMI Core: Auto-login for ${savedUsername}`);
        }
        
        console.log('GAMI Core: Auth Vault Initialized');
    }
    
    initializeAIBrain() {
        if (window.GAMIAIBrain && window.GAMIAIBrain.activate) {
            window.GAMIAIBrain.activate();
            console.log('GAMI Core: AI Brain Initialized');
        }
    }
    
    initializeEconomy() {
        if (window.GAMIEconomy && window.GAMIEconomy.initialize) {
            try {
                window.GAMIEconomy.initialize();
                
                // Get initial balance
                if (window.GAMIEconomy.getBalance) {
                    this.state.game.coins = window.GAMIEconomy.getBalance() || 0n;
                }
                
                console.log('GAMI Core: Economy System Initialized');
            } catch (error) {
                console.error('GAMI Core: Economy Initialization failed:', error);
            }
        }
    }
    
    initializeWorld3D() {
        if (window.WORLD_3D && window.WORLD_3D.initialize) {
            try {
                window.WORLD_3D.initialize();
                console.log('GAMI Core: World 3D Initialized');
            } catch (error) {
                console.error('GAMI Core: World 3D Initialization failed:', error);
            }
        }
    }
    
    initializeEvolution() {
        if (window.GAMIEvolution && window.GAMIEvolution.initialize) {
            try {
                window.GAMIEvolution.initialize();
                console.log('GAMI Core: Evolution System Initialized');
            } catch (error) {
                console.error('GAMI Core: Evolution Initialization failed:', error);
            }
        }
    }
    
    initializeWorkerManager() {
        if (window.WorkerManager && window.WorkerManager.initialize) {
            try {
                window.WorkerManager.initialize();
                console.log('GAMI Core: Worker Manager Initialized');
            } catch (error) {
                console.error('GAMI Core: Worker Manager Initialization failed:', error);
            }
        }
    }
    
    initializeP2PChat() {
        if (window.GAMIP2PChat && window.GAMIP2PChat.initialize) {
            try {
                window.GAMIP2PChat.initialize();
                console.log('GAMI Core: P2P Chat Initialized');
            } catch (error) {
                console.error('GAMI Core: P2P Chat Initialization failed:', error);
            }
        }
    }
    
    initializeBranding() {
        if (window.GAMIBranding && window.GAMIBranding.initialize) {
            try {
                window.GAMIBranding.initialize();
                
                // Apply branding if user is logged in
                if (this.state.user.username) {
                    window.GAMIBranding.setUser(this.state.user.username);
                }
                
                console.log('GAMI Core: Branding System Initialized');
            } catch (error) {
                console.error('GAMI Core: Branding Initialization failed:', error);
            }
        }
    }
    
    initializeLogistics() {
        if (window.GAMILogistics && window.GAMILogistics.initialize) {
            try {
                window.GAMILogistics.initialize();
                console.log('GAMI Core: Logistics System Initialized');
            } catch (error) {
                console.error('GAMI Core: Logistics Initialization failed:', error);
            }
        }
    }
    
    initializeRecovery() {
        if (window.GAMIRecovery && window.GAMIRecovery.initialize) {
            try {
                window.GAMIRecovery.initialize();
                console.log('GAMI Core: Recovery System Initialized');
            } catch (error) {
                console.error('GAMI Core: Recovery Initialization failed:', error);
            }
        }
    }
    
    allModulesLoaded() {
        this.state.systemReady = true;
        this.state.initialized = true;
        
        console.log('GAMI Core: All Modules Loaded');
        console.log('GAMI Core: System Ready');
        
        // Emit system ready event
        this.emit('system_ready', {
            timestamp: Date.now(),
            modules: this.state.modulesLoaded,
            scene: this.state.currentScene
        });
        
        // Start with loading scene
        this.switchScene('loading');
    }
    
    // Utility Methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getState(key) {
        if (!key) return { ...this.state };
        
        const keys = key.split('.');
        let value = this.state;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    setState(key, value) {
        const keys = key.split('.');
        let obj = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in obj)) {
                obj[keys[i]] = {};
            }
            obj = obj[keys[i]];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = obj[lastKey];
        obj[lastKey] = value;
        
        // Emit state change event
        this.emit('state_updated', {
            key: key,
            oldValue: oldValue,
            newValue: value,
            timestamp: Date.now()
        });
        
        // Special handling for certain state changes
        if (key === 'game.coins') {
            this.emit('coins_updated', {
                oldValue: oldValue,
                newValue: value,
                difference: value - oldValue
            });
        } else if (key === 'ui.theme') {
            this.emit('theme_changed', {
                oldTheme: oldValue,
                newTheme: value
            });
            
            // Update body class
            document.body.classList.remove(`theme-${oldValue}`);
            document.body.classList.add(`theme-${value}`);
            
            // Save to localStorage
            localStorage.setItem('gami_theme', value);
        } else if (key === 'user.username') {
            this.emit('user_name_updated', {
                oldName: oldValue,
                newName: value
            });
        }
        
        return true;
    }
    
    updateState(updates) {
        Object.keys(updates).forEach(key => {
            this.setState(key, updates[key]);
        });
    }
    
    getModule(moduleName) {
        if (this.state.modules[moduleName]?.loaded) {
            switch(moduleName) {
                case 'ai_brain': return window.GAMIAIBrain;
                case 'auth_vault': return window.GAMIAuthVault;
                case 'world_3d': return window.WORLD_3D;
                case 'evolution': return window.GAMIEvolution;
                case 'economy': return window.GAMIEconomy;
                case 'worker_manager': return window.WorkerManager;
                case 'p2p_chat': return window.GAMIP2PChat;
                case 'secret_config': return window.SecretConfig;
                case 'branding': return window.GAMIBranding;
                case 'logistics': return window.GAMILogistics;
                case 'recovery': return window.GAMIRecovery;
                case 'hacker_trap': return window.GAMIHackerTrap;
                default: return null;
            }
        }
        return null;
    }
    
    callModule(moduleName, method, ...args) {
        const module = this.getModule(moduleName);
        if (module && typeof module[method] === 'function') {
            try {
                // Security check before calling
                if (this.checkSecurityBeforeAction(moduleName, method)) {
                    return module[method](...args);
                } else {
                    throw new Error(`Security check failed for ${moduleName}.${method}`);
                }
            } catch (error) {
                console.error(`GAMI Core: Error calling ${moduleName}.${method}:`, error);
                this.handleGlobalError(error);
                throw error;
            }
        } else {
            throw new Error(`Module ${moduleName} or method ${method} not available`);
        }
    }
    
    checkSecurityBeforeAction(moduleName, method) {
        // Check with hacker_trap first
        if (window.GAMIHackerTrap && window.GAMIHackerTrap.getStatus) {
            const status = window.GAMIHackerTrap.getStatus();
            if (status.trapActive || status.mirrorWorldActive) {
                console.warn('GAMI Core: Security trap active, blocking action');
                return false;
            }
        }
        
        // Additional security checks based on module and method
        const sensitiveActions = {
            'auth_vault': ['storePassword', 'getPassword'],
            'economy': ['transferCoins', 'withdraw'],
            'secret_config': ['getConfig', 'updateConfig']
        };
        
        if (sensitiveActions[moduleName]?.includes(method)) {
            // Check if user is authenticated
            if (!this.state.user.authenticated) {
                console.warn('GAMI Core: Authentication required for sensitive action');
                return false;
            }
            
            // Check session validity
            if (this.isSessionExpired()) {
                console.warn('GAMI Core: Session expired');
                return false;
            }
        }
        
        return true;
    }
    
    isSessionExpired() {
        if (!this.state.user.loginTime) return true;
        
        const sessionDuration = Date.now() - this.state.user.loginTime;
        const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        return sessionDuration > maxSessionDuration;
    }
    
    isMobile() {
        return this.isMobileDevice;
    }
    
    checkSecurity() {
        return !this.state.security.trapActive && 
               !this.state.security.mirrorWorld &&
               this.state.security.violations === 0;
    }
    
    deactivateModule(moduleName) {
        const module = this.getModule(moduleName);
        if (module && module.deactivate) {
            try {
                module.deactivate();
                console.log(`GAMI Core: Module ${moduleName} deactivated`);
            } catch (error) {
                console.error(`GAMI Core: Failed to deactivate ${moduleName}:`, error);
            }
        }
    }
    
    showNotification(notification) {
        if (!this.state.ui.notifications) {
            this.state.ui.notifications = [];
        }
        
        // Add notification
        this.state.ui.notifications.push({
            ...notification,
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            read: false
        });
        
        // Emit event
        this.emit('notification_added', notification);
        
        // Auto-remove after duration
        if (notification.duration) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }
    }
    
    removeNotification(notificationId) {
        const index = this.state.ui.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            this.state.ui.notifications.splice(index, 1);
        }
    }
    
    // Public API Methods
    login(username, password) {
        return new Promise((resolve, reject) => {
            // Security check
            if (!this.checkSecurityBeforeAction('auth_vault', 'login')) {
                reject(new Error('Security check failed'));
                return;
            }
            
            // Call auth_vault
            try {
                const result = this.callModule('auth_vault', 'login', username, password);
                
                if (result.success) {
                    // Update state
                    this.setState('user.authenticated', true);
                    this.setState('user.username', username);
                    this.setState('user.loginTime', Date.now());
                    this.setState('user.sessionId', this.generateSessionId());
                    
                    // Save to localStorage
                    localStorage.setItem('gami_username', username);
                    
                    // Apply branding
                    if (window.GAMIBranding && window.GAMIBranding.setUser) {
                        window.GAMIBranding.setUser(username);
                    }
                    
                    // Emit event
                    this.emit('login_success', {
                        username: username,
                        timestamp: Date.now()
                    });
                    
                    // Switch to home scene
                    this.switchScene('home');
                    
                    resolve({ success: true, username });
                } else {
                    this.emit('login_failed', {
                        username: username,
                        reason: result.reason,
                        timestamp: Date.now()
                    });
                    
                    reject(new Error(result.reason || 'Login failed'));
                }
            } catch (error) {
                this.emit('login_failed', {
                    username: username,
                    reason: error.message,
                    timestamp: Date.now()
                });
                
                reject(error);
            }
        });
    }
    
    logout() {
        // Clear user state
        this.setState('user.authenticated', false);
        this.setState('user.username', null);
        this.setState('user.sessionId', null);
        this.setState('user.loginTime', null);
        
        // Clear localStorage
        localStorage.removeItem('gami_username');
        
        // Emit event
        this.emit('logout', {
            timestamp: Date.now()
        });
        
        // Switch to login scene
        this.switchScene('login');
        
        return true;
    }
    
    startGame() {
        // Check if all game modules are ready
        const gameModules = ['world_3d', 'economy', 'evolution', 'worker_manager', 'logistics'];
        const ready = gameModules.every(module => 
            this.state.modules[module]?.loaded && this.state.modules[module]?.healthy
        );
        
        if (!ready) {
            this.showNotification({
                type: 'error',
                title: 'Game Not Ready',
                message: 'Some game systems are still initializing',
                duration: 3000
            });
            return false;
        }
        
        // Update game state
        this.setState('game.active', true);
        
        // Switch to game scene
        this.switchScene('game');
        
        // Emit event
        this.emit('game_started', {
            timestamp: Date.now(),
            scene: 'game'
        });
        
        return true;
    }
    
    changeTheme(themeName) {
        const availableThemes = ['royal', 'dark', 'light', 'cyber', 'nature', 'ocean', 'fire', 'ice', 'vintage', 'future'];
        
        if (!availableThemes.includes(themeName)) {
            console.error(`GAMI Core: Unknown theme ${themeName}`);
            return false;
        }
        
        // Emit theme changing event
        this.emit('theme_changing', {
            from: this.state.ui.theme,
            to: themeName
        });
        
        // Update state (will trigger theme_changed event)
        this.setState('ui.theme', themeName);
        
        return true;
    }
    
    getPerformanceMetrics() {
        return {
            ...this.state.performance,
            memory: this.state.performance.memoryUsage ? 
                `${this.state.performance.memoryUsage.toFixed(2)} MB` : 'N/A',
            modulesHealthy: Object.values(this.state.modules).filter(m => m.healthy).length,
            modulesTotal: Object.keys(this.state.modules).length
        };
    }
}

// Initialize GAMI Core
(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gamiCore = new GamiCore();
        });
    } else {
        window.gamiCore = new GamiCore();
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamiCore;
}

console.log('GAMI Core: Controller System Loaded');
console.log('Created by: mak_07s__ mr asif khan');
console.log('Version: 1.0.0 - The Final Connector');
console.log('All 14 Modules Will Connect Through This Core');