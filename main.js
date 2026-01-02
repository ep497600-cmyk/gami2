/**
 * GAMI - Infinite Empire & AI Growth Engine
 * Main Integration File
 * Professional Implementation - No Emojis
 */

class GAMI {
    constructor() {
        this.world = null;
        this.morph = null;
        this.workers = null;
        this.brain = null;
        
        this.gameState = {
            coins: BigInt(1000),
            level: 1,
            unlockedFeatures: [],
            settings: {},
            achievements: new Map(),
            playerData: {
                name: '',
                sessionId: this.generateSessionId(),
                playTime: 0,
                lastSave: Date.now()
            }
        };
        
        this.cloudDBEndpoint = 'https://sheetdb.io/api/v1/denkvsthq9mvf';
        this.cloudSyncEnabled = false;
        this.syncInterval = 300000; // 5 minutes
        
        this.initComplete = false;
        this.initPromise = null;
        
        this.startup();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    async startup() {
        console.log('GAMI Engine Starting - Infinite Empire System Initialization');
        
        try {
            // Initialize core engines
            await this.initializeEngines();
            
            // Load game state from localStorage
            await this.loadLocalGameState();
            
            // Attempt cloud sync if enabled
            if (this.cloudSyncEnabled) {
                await this.syncWithCloud();
            }
            
            // Start update loops
            this.startGameLoops();
            
            // Apply initial settings
            this.applyInitialSettings();
            
            // Initialize UI
            this.initializeUI();
            
            this.initComplete = true;
            console.log('GAMI Engine Ready - All Systems Operational');
            
            // Dispatch ready event
            this.dispatchEvent('system_ready', {
                timestamp: Date.now(),
                version: '1.0.0',
                sessionId: this.gameState.playerData.sessionId
            });
            
        } catch (error) {
            console.error('GAMI Startup Failed:', error);
            this.dispatchEvent('system_error', { 
                error: error.message,
                phase: 'startup' 
            });
        }
    }
    
    async initializeEngines() {
        // Initialize world engine
        try {
            const { InfiniteWorldEngine } = await import('./world_engine.js');
            this.world = new InfiniteWorldEngine();
            console.log('World Engine Initialized - Procedural Generation Active');
        } catch (error) {
            throw new Error(`World Engine Failed: ${error.message}`);
        }
        
        // Initialize morph engine
        try {
            const { MorphEvolutionEngine } = await import('./morph_evolution.js');
            this.morph = new MorphEvolutionEngine();
            console.log('Morph Engine Initialized - Vector Transformation Ready');
        } catch (error) {
            throw new Error(`Morph Engine Failed: ${error.message}`);
        }
        
        // Initialize worker AI
        try {
            const { WorkerAIEngine } = await import('./worker_ai_logic.js');
            this.workers = new WorkerAIEngine();
            console.log('Worker AI Engine Initialized - Emergent Behavior Active');
        } catch (error) {
            throw new Error(`Worker AI Failed: ${error.message}`);
        }
        
        // Initialize brain executor
        try {
            const { GAMIBrainExecutor } = await import('./gami_brain_executor.js');
            this.brain = new GAMIBrainExecutor();
            console.log('GAMI Brain Initialized - Self-Modification Systems Online');
        } catch (error) {
            throw new Error(`Brain Executor Failed: ${error.message}`);
        }
        
        // Set up inter-engine communication
        this.setupEngineCommunication();
    }
    
    setupEngineCommunication() {
        // World engine updates environmental data for morph shaders
        this.world.environmentUpdate = (environment) => {
            if (this.morph && this.morph.applyProceduralShaders) {
                this.morph.currentEnvironment = environment;
            }
        };
        
        // Worker activity affects world systems
        this.workers.activityUpdate = (workerData) => {
            if (this.world && this.world.updateOxygenSystem) {
                // Workers consume oxygen based on activity level
                const oxygenImpact = workerData.activeWorkers * 0.001;
                this.world.oxygenConsumptionRate = oxygenImpact;
            }
        };
        
        // Brain commands propagate to all systems
        window.addEventListener('gami.brain_command', (event) => {
            const { command, data, source } = event.detail;
            this.executeBrainCommand(command, data, source);
        });
    }
    
    async loadLocalGameState() {
        try {
            const savedState = localStorage.getItem('gami_save_state');
            if (savedState) {
                const parsed = JSON.parse(savedState, (key, value) => {
                    // Handle BigInt serialization
                    if (typeof value === 'string' && value.startsWith('BIGINT:')) {
                        return BigInt(value.slice(7));
                    }
                    // Handle Map serialization
                    if (value && value.__type === 'Map') {
                        return new Map(value.data);
                    }
                    return value;
                });
                
                // Merge with current state
                this.gameState = this.deepMerge(this.gameState, parsed);
                this.gameState.playerData.lastLoad = Date.now();
                
                console.log('Game state loaded from localStorage');
                
                // Update engines with loaded state
                if (this.world && parsed.worldState) {
                    this.world.loadState(parsed.worldState);
                }
                
                return true;
            }
        } catch (error) {
            console.warn('Local storage load failed, using default state:', error);
        }
        return false;
    }
    
    async syncWithCloud() {
        if (!this.cloudSyncEnabled) return;
        
        try {
            const sessionId = this.gameState.playerData.sessionId;
            const playerName = this.gameState.playerData.name || 'Anonymous';
            
            // Prepare sync data
            const syncData = {
                session_id: sessionId,
                player_name: playerName,
                coins: this.gameState.coins.toString(),
                level: this.gameState.level,
                unlocked_features: JSON.stringify(this.gameState.unlockedFeatures),
                achievements: JSON.stringify(Array.from(this.gameState.achievements.entries())),
                play_time: this.gameState.playerData.playTime,
                last_sync: Date.now(),
                world_radius: this.world ? Number(this.world.currentRadius) : 0,
                worker_count: this.workers ? this.workers.getWorkerStats().totalWorkers : 0,
                system_version: '1.0.0'
            };
            
            // Check if session exists
            const checkResponse = await fetch(`${this.cloudDBEndpoint}/search?session_id=${sessionId}`);
            const existingData = await checkResponse.json();
            
            if (existingData && existingData.length > 0) {
                // Update existing record
                await fetch(`${this.cloudDBEndpoint}/session_id/${sessionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(syncData)
                });
                console.log('Cloud sync updated for session:', sessionId);
            } else {
                // Create new record
                await fetch(this.cloudDBEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: [syncData] })
                });
                console.log('Cloud sync created for session:', sessionId);
            }
            
            this.dispatchEvent('cloud_sync_complete', {
                success: true,
                sessionId: sessionId,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Cloud sync failed:', error);
            this.dispatchEvent('cloud_sync_failed', {
                error: error.message,
                timestamp: Date.now()
            });
        }
    }
    
    async loadFromCloud(sessionId) {
        if (!this.cloudSyncEnabled) return null;
        
        try {
            const response = await fetch(`${this.cloudDBEndpoint}/search?session_id=${sessionId}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const cloudSave = data[0];
                
                // Convert back to proper types
                return {
                    coins: BigInt(cloudSave.coins || '1000'),
                    level: parseInt(cloudSave.level) || 1,
                    unlockedFeatures: JSON.parse(cloudSave.unlocked_features || '[]'),
                    achievements: new Map(JSON.parse(cloudSave.achievements || '[]')),
                    playerData: {
                        name: cloudSave.player_name || '',
                        sessionId: cloudSave.session_id,
                        playTime: parseInt(cloudSave.play_time) || 0,
                        lastCloudSave: Date.parse(cloudSave.last_sync) || Date.now()
                    }
                };
            }
        } catch (error) {
            console.error('Cloud load failed:', error);
        }
        return null;
    }
    
    deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else if (key === 'achievements' && source[key] instanceof Map) {
                    output[key] = new Map([...(target[key] || new Map()), ...source[key]]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }
    
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    
    saveLocalGameState() {
        try {
            // Prepare serializable state
            const serializableState = {
                coins: 'BIGINT:' + this.gameState.coins.toString(),
                level: this.gameState.level,
                unlockedFeatures: this.gameState.unlockedFeatures,
                achievements: {
                    __type: 'Map',
                    data: Array.from(this.gameState.achievements.entries())
                },
                settings: this.gameState.settings,
                playerData: {
                    ...this.gameState.playerData,
                    lastSave: Date.now()
                }
            };
            
            // Add world state if available
            if (this.world) {
                serializableState.worldState = this.world.getSaveState();
            }
            
            const stateString = JSON.stringify(serializableState);
            localStorage.setItem('gami_save_state', stateString);
            
            this.gameState.playerData.lastSave = Date.now();
            
            this.dispatchEvent('local_save_complete', {
                timestamp: Date.now(),
                saveSize: stateString.length
            });
            
            return true;
        } catch (error) {
            console.error('Local save failed:', error);
            this.dispatchEvent('local_save_failed', { error: error.message });
            return false;
        }
    }
    
    startGameLoops() {
        // Main game loop (60 FPS target)
        let lastFrameTime = performance.now();
        const targetFrameTime = 16.67; // 60 FPS
        
        const gameLoop = (currentTime) => {
            if (!this.initComplete) {
                requestAnimationFrame(gameLoop);
                return;
            }
            
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            
            // Update player position (would come from input system)
            const playerPosition = this.getPlayerPosition();
            
            // Update world with player position
            if (this.world) {
                const worldUpdate = this.world.update(playerPosition, deltaTime);
                this.dispatchEvent('world_update', worldUpdate);
            }
            
            // Update worker AI
            if (this.workers) {
                const workerUpdate = this.workers.getWorkerStats();
                this.dispatchEvent('worker_update', workerUpdate);
            }
            
            // Update play time
            this.gameState.playerData.playTime += deltaTime / 1000;
            
            // Check for achievements
            this.checkAchievements();
            
            // Schedule next frame
            requestAnimationFrame(gameLoop);
        };
        
        // Autosave loop (every 30 seconds)
        const autosaveLoop = () => {
            this.saveLocalGameState();
            
            // Periodic cloud sync (every 5 minutes if enabled)
            if (this.cloudSyncEnabled) {
                const now = Date.now();
                if (now - (this.gameState.playerData.lastCloudSync || 0) > this.syncInterval) {
                    this.syncWithCloud();
                    this.gameState.playerData.lastCloudSync = now;
                }
            }
            
            setTimeout(autosaveLoop, 30000);
        };
        
        // Start loops
        requestAnimationFrame(gameLoop);
        setTimeout(autosaveLoop, 30000);
    }
    
    getPlayerPosition() {
        // This would integrate with actual player controls
        // For now, return center position
        return { x: 0, y: 0, z: 0 };
    }
    
    applyInitialSettings() {
        // Apply glassmorphism by default
        if (this.brain && this.brain.toggleGlassmorphism) {
            this.brain.toggleGlassmorphism(true);
        }
        
        // Enable core AI systems
        if (this.brain && this.brain.omegaSettings) {
            this.brain.omegaSettings.aiGrowth.learning = true;
            this.brain.omegaSettings.aiGrowth.evolution = true;
        }
        
        // Set up default CSS with glassmorphism
        const defaultCSS = `
            :root {
                --glass-blur: 10px;
                --glass-transparency: 0.15;
                --glass-border: 1px solid rgba(255, 255, 255, 0.2);
                --glass-radius: 12px;
                --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --shadow-intensity: 0.1;
            }
            
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
                background: #0a0a0a;
                color: #ffffff;
            }
            
            .gami-container {
                width: 100vw;
                height: 100vh;
                position: relative;
                overflow: hidden;
            }
            
            .hud-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1000;
            }
            
            .stats-panel {
                position: absolute;
                top: 24px;
                left: 24px;
                background: rgba(255, 255, 255, var(--glass-transparency));
                backdrop-filter: blur(var(--glass-blur));
                -webkit-backdrop-filter: blur(var(--glass-blur));
                border: var(--glass-border);
                border-radius: var(--glass-radius);
                padding: 20px;
                min-width: 280px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, calc(0.18 * var(--shadow-intensity)));
                pointer-events: auto;
            }
            
            .control-panel {
                position: absolute;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                pointer-events: auto;
            }
            
            .glass-button {
                background: var(--primary-gradient);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 0.3px;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            }
            
            .glass-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
            }
            
            .glass-button:active {
                transform: translateY(-1px);
            }
            
            .info-display {
                font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.6;
            }
            
            .info-label {
                color: rgba(255, 255, 255, 0.6);
                font-weight: 500;
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
                margin-bottom: 4px;
            }
            
            .info-value {
                color: #ffffff;
                font-weight: 600;
                font-size: 18px;
                margin-bottom: 12px;
            }
            
            .world-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            
            .notification {
                position: absolute;
                top: 24px;
                right: 24px;
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 16px;
                padding: 20px;
                max-width: 320px;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        
        if (this.brain && this.brain.applyCSSPatch) {
            this.brain.applyCSSPatch({
                id: 'default_system_styles',
                type: 'css',
                content: defaultCSS,
                target: 'css.system_default',
                applyLive: true
            });
        }
    }
    
    initializeUI() {
        // Create main container
        const container = document.createElement('div');
        container.className = 'gami-container';
        container.id = 'gami-container';
        
        // Create canvas for world rendering
        const canvas = document.createElement('canvas');
        canvas.className = 'world-canvas';
        canvas.id = 'gami-canvas';
        container.appendChild(canvas);
        
        // Create HUD overlay
        const hud = document.createElement('div');
        hud.className = 'hud-overlay';
        hud.innerHTML = `
            <div class="stats-panel">
                <div class="info-display">
                    <div class="info-label">World Radius</div>
                    <div class="info-value" id="world-radius">100 units</div>
                    
                    <div class="info-label">Coins</div>
                    <div class="info-value" id="coin-count">1,000</div>
                    
                    <div class="info-label">Oxygen Level</div>
                    <div class="info-value" id="oxygen-level">100%</div>
                    
                    <div class="info-label">Active Workers</div>
                    <div class="info-value" id="worker-count">5</div>
                    
                    <div class="info-label">Play Time</div>
                    <div class="info-value" id="play-time">0:00</div>
                </div>
            </div>
            
            <div class="control-panel">
                <button class="glass-button" id="expand-world">Expand World</button>
                <button class="glass-button" id="evolve-object">Evolve</button>
                <button class="glass-button" id="toggle-overtime">Overtime: OFF</button>
                <button class="glass-button" id="brain-command">AI Command</button>
                <button class="glass-button" id="settings-toggle">Omega Settings</button>
            </div>
            
            <div class="notification" id="system-notification">
                <div class="notification-content"></div>
            </div>
        `;
        container.appendChild(hud);
        
        // Add to document
        document.body.appendChild(container);
        
        // Initialize Three.js or WebGL renderer
        this.initializeRenderer(canvas);
        
        // Set up UI event listeners
        this.setupUIEventListeners();
    }
    
    initializeRenderer(canvas) {
        // This would initialize Three.js or custom WebGL renderer
        // For this example, we'll set up a placeholder
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Initial background
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Render placeholder
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAMI World Renderer Initializing...', canvas.width / 2, canvas.height / 2);
        }
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.dispatchEvent('renderer_resize', {
                width: canvas.width,
                height: canvas.height
            });
        });
    }
    
    setupUIEventListeners() {
        // Expand World button
        document.getElementById('expand-world').addEventListener('click', () => {
            this.expandWorld();
        });
        
        // Evolve button
        document.getElementById('evolve-object').addEventListener('click', () => {
            this.initiateEvolution();
        });
        
        // Overtime toggle
        const overtimeButton = document.getElementById('toggle-overtime');
        overtimeButton.addEventListener('click', () => {
            const current = overtimeButton.textContent.includes('ON');
            this.toggleOvertime(!current);
        });
        
        // Brain command
        document.getElementById('brain-command').addEventListener('click', () => {
            this.openBrainCommandInterface();
        });
        
        // Settings toggle
        document.getElementById('settings-toggle').addEventListener('click', () => {
            this.toggleOmegaSettings();
        });
    }
    
    updateUI() {
        // Update world radius
        const radiusElement = document.getElementById('world-radius');
        if (radiusElement && this.world) {
            radiusElement.textContent = this.formatNumber(Number(this.world.currentRadius)) + ' units';
        }
        
        // Update coins
        const coinsElement = document.getElementById('coin-count');
        if (coinsElement) {
            coinsElement.textContent = this.formatNumber(Number(this.gameState.coins));
        }
        
        // Update oxygen level
        const oxygenElement = document.getElementById('oxygen-level');
        if (oxygenElement && this.world) {
            oxygenElement.textContent = Math.round(this.world.oxygenLevel) + '%';
        }
        
        // Update worker count
        const workersElement = document.getElementById('worker-count');
        if (workersElement && this.workers) {
            const stats = this.workers.getWorkerStats();
            workersElement.textContent = stats.activeWorkers + '/' + stats.totalWorkers;
        }
        
        // Update play time
        const playTimeElement = document.getElementById('play-time');
        if (playTimeElement) {
            const hours = Math.floor(this.gameState.playerData.playTime / 3600);
            const minutes = Math.floor((this.gameState.playerData.playTime % 3600) / 60);
            playTimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // Update overtime button
        const overtimeButton = document.getElementById('toggle-overtime');
        if (overtimeButton && this.workers) {
            const isActive = this.workers.overtimeProtocol?.enabled || false;
            overtimeButton.textContent = `Overtime: ${isActive ? 'ON' : 'OFF'}`;
            overtimeButton.style.background = isActive ? 
                'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' : 
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    expandWorld() {
        if (!this.world || !this.initComplete) return;
        
        const expansionResult = this.world.expandWorld(this.gameState.coins);
        
        if (expansionResult.success) {
            this.gameState.coins -= expansionResult.cost;
            
            this.showNotification(
                `World expanded to radius ${expansionResult.newRadius}`,
                'success'
            );
            
            this.dispatchEvent('world_expanded', expansionResult);
            this.updateUI();
            
            // Check for expansion achievement
            if (Number(expansionResult.newRadius) >= 1000) {
                this.unlockAchievement(
                    'world_expander',
                    'Boundary Breaker',
                    'Expand world beyond 1000 unit radius'
                );
            }
        } else {
            this.showNotification(
                `Need ${this.formatNumber(Number(expansionResult.required))} coins to expand`,
                'error'
            );
        }
    }
    
    initiateEvolution() {
        if (!this.morph || !this.initComplete) return;
        
        // For demo: evolve from current stage to next
        const stages = this.morph.evolutionStages;
        const currentStage = 'thela'; // Would track per object
        const nextStage = this.morph.getNextStage(currentStage);
        
        if (nextStage) {
            const cost = this.morph.calculateEvolutionCost(currentStage, nextStage);
            
            if (this.gameState.coins >= cost.coins) {
                this.gameState.coins -= cost.coins;
                
                // Generate object ID
                const objectId = 'object_' + Date.now();
                
                // Start morphing
                this.morph.startMorphing(objectId, currentStage, nextStage);
                
                this.showNotification(
                    `Evolution started: ${currentStage} → ${nextStage}`,
                    'info'
                );
                
                this.updateUI();
            } else {
                this.showNotification(
                    `Need ${this.formatNumber(Number(cost.coins))} coins to evolve`,
                    'error'
                );
            }
        }
    }
    
    toggleOvertime(enabled) {
        if (!this.workers) return;
        
        this.workers.toggleOvertimeProtocol(enabled);
        
        this.showNotification(
            `Overtime protocol ${enabled ? 'activated' : 'deactivated'}`,
            enabled ? 'warning' : 'info'
        );
        
        this.updateUI();
    }
    
    openBrainCommandInterface() {
        // Create command interface
        const command = prompt('Enter GAMI Brain Command:', 
            'increase code size || change ui || toggle setting auraSensing.enabled');
        
        if (command) {
            const result = this.processBrainCommand(command);
            
            if (result.success) {
                this.showNotification('Brain command executed successfully', 'success');
            } else {
                this.showNotification(`Command failed: ${result.error}`, 'error');
            }
        }
    }
    
    toggleOmegaSettings() {
        // Create settings overlay
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        overlay.innerHTML = `
            <div class="settings-panel" style="
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(40px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 40px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                width: 90%;
            ">
                <h2 style="margin-top: 0; color: white; font-weight: 600;">Omega Settings</h2>
                <div id="settings-list"></div>
                <button id="close-settings" style="
                    margin-top: 30px;
                    padding: 12px 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                ">Close</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Populate settings
        this.populateOmegaSettings(overlay.querySelector('#settings-list'));
        
        // Close button
        overlay.querySelector('#close-settings').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    populateOmegaSettings(container) {
        if (!this.brain || !this.brain.omegaSettings) return;
        
        const settings = this.brain.omegaSettings;
        let html = '<div class="settings-category">';
        
        const renderSettings = (obj, path = '') => {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const fullPath = path ? `${path}.${key}` : key;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    if (key !== '_additionalSettings') {
                        html += `<h3 style="color: rgba(255, 255, 255, 0.7); margin-top: 20px;">${key}</h3>`;
                        renderSettings(value, fullPath);
                    }
                } else if (typeof value !== 'object' || value === null) {
                    html += `
                        <div class="setting-item" style="
                            margin: 12px 0;
                            padding: 16px;
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 12px;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        ">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            ">
                                <div>
                                    <div style="font-weight: 600; color: white;">${key}</div>
                                    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">${fullPath}</div>
                                </div>
                                <div style="color: rgba(255, 255, 255, 0.8);">
                                    ${typeof value === 'boolean' ? 
                                        `<input type="checkbox" ${value ? 'checked' : ''} 
                                            data-path="${fullPath}" 
                                            style="transform: scale(1.3);">` : 
                                        value.toString()
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        };
        
        renderSettings(settings);
        html += '</div>';
        container.innerHTML = html;
        
        // Add event listeners for checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const path = e.target.dataset.path;
                const newValue = e.target.checked;
                this.updateOmegaSetting(path, newValue);
            });
        });
    }
    
    updateOmegaSetting(path, value) {
        if (!this.brain) return;
        
        this.brain.processUserCommand(`toggle setting ${path}`);
        
        this.showNotification(
            `Setting updated: ${path} = ${value}`,
            'info'
        );
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('system-notification');
        if (!notification) return;
        
        const content = notification.querySelector('.notification-content');
        content.textContent = message;
        
        // Set color based on type
        const colors = {
            success: 'rgba(46, 204, 113, 0.2)',
            error: 'rgba(231, 76, 60, 0.2)',
            warning: 'rgba(241, 196, 15, 0.2)',
            info: 'rgba(52, 152, 219, 0.2)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.style.borderColor = colors[type]?.replace('0.2', '0.4') || colors.info;
        
        notification.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
    
    executeBrainCommand(command, data, source = 'ui') {
        console.log(`Executing brain command: ${command}`, data);
        
        let result = { success: false, error: 'Unknown command' };
        
        switch (command.toUpperCase()) {
            case 'EXPAND_WORLD':
                this.expandWorld();
                result = { success: true };
                break;
                
            case 'EVOLVE':
                this.initiateEvolution();
                result = { success: true };
                break;
                
            case 'TOGGLE_OVERTIME':
                this.toggleOvertime(data.enabled);
                result = { success: true };
                break;
                
            case 'SAVE_STATE':
                this.saveLocalGameState();
                if (this.cloudSyncEnabled) {
                    this.syncWithCloud();
                }
                result = { success: true };
                break;
                
            case 'RESET_SYSTEM':
                if (confirm('Reset all systems? This will reload the page.')) {
                    localStorage.removeItem('gami_save_state');
                    location.reload();
                }
                break;
                
            default:
                // Pass to brain processor
                result = this.processBrainCommand(command);
                break;
        }
        
        this.dispatchEvent('command_executed', {
            command,
            result,
            source,
            timestamp: Date.now()
        });
        
        return result;
    }
    
    processBrainCommand(command) {
        if (!this.brain) {
            return { success: false, error: 'Brain not initialized' };
        }
        
        return this.brain.processUserCommand(command);
    }
    
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`gami.${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
        
        // Update UI on relevant events
        if (['world_update', 'worker_update', 'coins_changed'].includes(eventName)) {
            this.updateUI();
        }
    }
    
    unlockAchievement(id, name, description) {
        if (!this.gameState.achievements.has(id)) {
            const achievement = {
                id,
                name,
                description,
                unlocked: Date.now(),
                hidden: false
            };
            
            this.gameState.achievements.set(id, achievement);
            this.gameState.unlockedFeatures.push(id);
            
            this.showNotification(`Achievement Unlocked: ${name}`, 'success');
            
            this.dispatchEvent('achievement_unlocked', achievement);
            this.saveLocalGameState();
            
            return true;
        }
        return false;
    }
    
    checkAchievements() {
        // World expansion achievements
        if (this.world) {
            const radius = Number(this.world.currentRadius);
            
            if (radius >= 500 && !this.gameState.achievements.has('radius_500')) {
                this.unlockAchievement(
                    'radius_500',
                    'Territory Expander',
                    'Expand world to 500 unit radius'
                );
            }
            
            if (radius >= 5000 && !this.gameState.achievements.has('radius_5k')) {
                this.unlockAchievement(
                    'radius_5k',
                    'Domain Master',
                    'Expand world to 5000 unit radius'
                );
            }
        }
        
        // Economic achievements
        if (this.gameState.coins >= BigInt(10000) && !this.gameState.achievements.has('wealthy')) {
            this.unlockAchievement(
                'wealthy',
                'Emerging Tycoon',
                'Accumulate 10,000 coins'
            );
        }
        
        if (this.gameState.coins >= BigInt(1000000) && !this.gameState.achievements.has('millionaire')) {
            this.unlockAchievement(
                'millionaire',
                'Coin Magnate',
                'Accumulate 1,000,000 coins'
            );
        }
        
        // Worker achievements
        if (this.workers) {
            const stats = this.workers.getWorkerStats();
            
            if (stats.totalWorkers >= 20 && !this.gameState.achievements.has('workforce_20')) {
                this.unlockAchievement(
                    'workforce_20',
                    'Labor Leader',
                    'Employ 20 workers'
                );
            }
            
            if (stats.overtimeActive && !this.gameState.achievements.has('overtime_master')) {
                this.unlockAchievement(
                    'overtime_master',
                    'Efficiency Expert',
                    'Activate overtime protocol'
                );
            }
        }
        
        // Time-based achievements
        if (this.gameState.playerData.playTime >= 3600 && !this.gameState.achievements.has('hour_played')) {
            this.unlockAchievement(
                'hour_played',
                'Dedicated Player',
                'Play for 1 hour'
            );
        }
    }
    
    // Public API methods
    getSystemStatus() {
        return {
            initialized: this.initComplete,
            coins: this.gameState.coins,
            level: this.gameState.level,
            achievements: this.gameState.achievements.size,
            playTime: this.gameState.playerData.playTime,
            worldRadius: this.world ? Number(this.world.currentRadius) : 0,
            workerCount: this.workers ? this.workers.getWorkerStats().totalWorkers : 0,
            cloudSync: this.cloudSyncEnabled,
            sessionId: this.gameState.playerData.sessionId
        };
    }
    
    enableCloudSync(enable = true) {
        this.cloudSyncEnabled = enable;
        
        if (enable) {
            this.syncWithCloud();
            this.showNotification('Cloud synchronization enabled', 'success');
        } else {
            this.showNotification('Cloud synchronization disabled', 'warning');
        }
        
        return enable;
    }
    
    exportSaveData() {
        const data = {
            sessionId: this.gameState.playerData.sessionId,
            coins: this.gameState.coins.toString(),
            level: this.gameState.level,
            achievements: Array.from(this.gameState.achievements.entries()),
            unlockedFeatures: this.gameState.unlockedFeatures,
            playTime: this.gameState.playerData.playTime,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gami_save_${this.gameState.playerData.sessionId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Save data exported', 'success');
    }
    
    importSaveData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate import data
                if (!data.sessionId || !data.coins) {
                    throw new Error('Invalid save file format');
                }
                
                // Merge imported data
                this.gameState.coins = BigInt(data.coins);
                this.gameState.level = data.level || 1;
                
                if (data.achievements) {
                    this.gameState.achievements = new Map(data.achievements);
                }
                
                if (data.unlockedFeatures) {
                    this.gameState.unlockedFeatures = data.unlockedFeatures;
                }
                
                if (data.playTime) {
                    this.gameState.playerData.playTime = data.playTime;
                }
                
                // Update session ID if different
                if (data.sessionId !== this.gameState.playerData.sessionId) {
                    console.log('Imported save from different session:', data.sessionId);
                }
                
                this.saveLocalGameState();
                this.updateUI();
                
                this.showNotification('Save data imported successfully', 'success');
                
                this.dispatchEvent('save_imported', {
                    sessionId: data.sessionId,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                this.showNotification(`Import failed: ${error.message}`, 'error');
            }
        };
        
        reader.readAsText(file);
    }
}

// Initialize GAMI when document is ready
let GAMIInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    GAMIInstance = new GAMI();
    
    // Make available globally
    window.GAMI = GAMIInstance;
    
    // Public API
    window.GAMI_API = {
        // System control
        getStatus: () => GAMIInstance.getSystemStatus(),
        saveGame: () => GAMIInstance.saveLocalGameState(),
        exportSave: () => GAMIInstance.exportSaveData(),
        importSave: (file) => GAMIInstance.importSaveData(file),
        
        // Economy
        getCoins: () => GAMIInstance.gameState.coins,
        addCoins: (amount) => {
            GAMIInstance.gameState.coins += BigInt(amount);
            GAMIInstance.updateUI();
            GAMIInstance.dispatchEvent('coins_changed', {
                delta: amount,
                newTotal: GAMIInstance.gameState.coins
            });
        },
        
        // World operations
        expandWorld: () => GAMIInstance.expandWorld(),
        getWorldInfo: () => GAMIInstance.world ? {
            radius: GAMIInstance.world.currentRadius,
            oxygen: GAMIInstance.world.oxygenLevel,
            season: GAMIInstance.world.season,
            temperature: GAMIInstance.world.temperature
        } : null,
        
        // Evolution
        evolve: (fromStage, toStage) => {
            if (!GAMIInstance.morph) return null;
            const objectId = 'object_' + Date.now();
            return GAMIInstance.morph.startMorphing(objectId, fromStage, toStage);
        },
        
        // Worker management
        getWorkers: () => GAMIInstance.workers ? GAMIInstance.workers.getWorkerStats() : null,
        toggleOvertime: (enable) => GAMIInstance.toggleOvertime(enable),
        
        // Brain commands
        sendCommand: (command) => GAMIInstance.processBrainCommand(command),
        toggleCloudSync: (enable) => GAMIInstance.enableCloudSync(enable),
        
        // Settings
        getOmegaSettings: () => GAMIInstance.brain ? GAMIInstance.brain.omegaSettings : null,
        updateSetting: (path, value) => {
            if (GAMIInstance.brain) {
                return GAMIInstance.brain.processUserCommand(`toggle setting ${path}`);
            }
            return null;
        }
    };
    
    // Auto-check achievements every minute
    setInterval(() => {
        if (GAMIInstance && GAMIInstance.initComplete) {
            GAMIInstance.checkAchievements();
        }
    }, 60000);
    
    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
        if (GAMIInstance && GAMIInstance.initComplete) {
            GAMIInstance.saveLocalGameState();
        }
    });
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    if (GAMIInstance) {
        GAMIInstance.dispatchEvent('global_error', {
            error: event.error.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// Export for Node.js/ESM
if (typeof module !== 'undefined') {
    module.exports = { GAMI };
}

console.log('========================================');
console.log('GAMI Engine - Infinite Empire System');
console.log('Version 1.0.0');
console.log('Professional Implementation');
console.log('No Emoji Policy Enforced');
console.log('========================================');
console.log('Systems Initialized:');
console.log('- Procedural World Generation');
console.log('- Vector Morphing Evolution');
console.log('- Emergent AI Workers');
console.log('- Self-Modifying Brain');
console.log('- Cloud Synchronization');
console.log('- Local Storage Integration');
console.log('========================================');
console.log('Access: window.GAMI or window.GAMI_API');
console.log('Endpoint: https://sheetdb.io/api/v1/denkvsthq9mvf');
console.log('========================================');