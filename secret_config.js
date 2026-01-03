// GAMI SECRET CONFIG - Hidden Configuration System
// File: /js/secret_config.js (Absolute Path)

class GAMISecretConfig {
    constructor() {
        this.systemName = "KHUFIYA_CONFIG";
        this.version = "7.0.0";
        this.isInitialized = false;
        this.ownerName = "mak_07s__ mr asif khan"; // Permanent engraved owner name
        this.configLocked = true; // Configuration starts locked
        
        // 200 Secret Settings organized by category
        this.settings = {
            // VISUAL MODES (10 Modes connected to master_style.css)
            visual: {
                activeTheme: "liquid_glass", // Default theme
                themes: {
                    liquid_glass: {
                        id: "liquid_glass",
                        name: "LIQUID GLASS",
                        description: "Pure white glass morphism",
                        variables: {
                            "--glass-primary": "rgba(255, 255, 255, 0.95)",
                            "--glass-secondary": "rgba(255, 255, 255, 0.85)",
                            "--glass-border": "rgba(255, 255, 255, 0.25)",
                            "--text-primary": "rgba(10, 10, 10, 0.95)",
                            "--background-base": "linear-gradient(135deg, #f0f5ff 0%, #ffffff 50%, #f8fbff 100%)",
                            "--accent-color": "rgba(100, 150, 255, 0.7)"
                        }
                    },
                    royal_gold: {
                        id: "royal_gold",
                        name: "ROYAL GOLD",
                        description: "Luxurious gold and black theme",
                        variables: {
                            "--glass-primary": "rgba(255, 215, 0, 0.15)",
                            "--glass-secondary": "rgba(255, 215, 0, 0.1)",
                            "--glass-border": "rgba(255, 215, 0, 0.3)",
                            "--text-primary": "rgba(255, 245, 200, 0.95)",
                            "--background-base": "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                            "--accent-color": "rgba(255, 215, 0, 0.7)"
                        }
                    },
                    midnight_blue: {
                        id: "midnight_blue",
                        name: "MIDNIGHT BLUE",
                        description: "Deep blue professional theme",
                        variables: {
                            "--glass-primary": "rgba(30, 60, 120, 0.15)",
                            "--glass-secondary": "rgba(30, 60, 120, 0.1)",
                            "--glass-border": "rgba(100, 150, 255, 0.3)",
                            "--text-primary": "rgba(220, 230, 255, 0.95)",
                            "--background-base": "linear-gradient(135deg, #0a0a1a 0%, #1a1a2a 100%)",
                            "--accent-color": "rgba(100, 150, 255, 0.7)"
                        }
                    },
                    dark: {
                        id: "dark",
                        name: "DARK MATRIX",
                        description: "Pure dark theme with neon accents",
                        variables: {
                            "--glass-primary": "rgba(20, 20, 20, 0.95)",
                            "--glass-secondary": "rgba(30, 30, 30, 0.85)",
                            "--glass-border": "rgba(255, 255, 255, 0.1)",
                            "--text-primary": "rgba(255, 255, 255, 0.95)",
                            "--background-base": "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                            "--accent-color": "rgba(150, 150, 255, 0.7)"
                        }
                    },
                    ice: {
                        id: "ice",
                        name: "ICE PRISM",
                        description: "Cool blue icy theme",
                        variables: {
                            "--glass-primary": "rgba(220, 240, 255, 0.95)",
                            "--glass-secondary": "rgba(200, 230, 255, 0.85)",
                            "--glass-border": "rgba(100, 180, 255, 0.3)",
                            "--text-primary": "rgba(10, 30, 50, 0.95)",
                            "--background-base": "linear-gradient(135deg, #e6f2ff 0%, #f0f8ff 100%)",
                            "--accent-color": "rgba(100, 180, 255, 0.7)"
                        }
                    },
                    forest: {
                        id: "forest",
                        name: "DEEP FOREST",
                        description: "Green forest theme",
                        variables: {
                            "--glass-primary": "rgba(30, 60, 40, 0.15)",
                            "--glass-secondary": "rgba(40, 80, 50, 0.1)",
                            "--glass-border": "rgba(100, 200, 120, 0.3)",
                            "--text-primary": "rgba(200, 240, 200, 0.95)",
                            "--background-base": "linear-gradient(135deg, #0a1a0a 0%, #1a2a1a 100%)",
                            "--accent-color": "rgba(100, 200, 120, 0.7)"
                        }
                    },
                    crimson: {
                        id: "crimson",
                        name: "CRIMSON BLOOD",
                        description: "Red and black intense theme",
                        variables: {
                            "--glass-primary": "rgba(80, 0, 20, 0.15)",
                            "--glass-secondary": "rgba(100, 0, 30, 0.1)",
                            "--glass-border": "rgba(255, 50, 100, 0.3)",
                            "--text-primary": "rgba(255, 200, 210, 0.95)",
                            "--background-base": "linear-gradient(135deg, #1a0a0a 0%, #2a1a1a 100%)",
                            "--accent-color": "rgba(255, 50, 100, 0.7)"
                        }
                    },
                    purple: {
                        id: "purple",
                        name: "PURPLE NEXUS",
                        description: "Purple cosmic theme",
                        variables: {
                            "--glass-primary": "rgba(60, 0, 80, 0.15)",
                            "--glass-secondary": "rgba(80, 0, 100, 0.1)",
                            "--glass-border": "rgba(180, 100, 255, 0.3)",
                            "--text-primary": "rgba(240, 200, 255, 0.95)",
                            "--background-base": "linear-gradient(135deg, #1a0a2a 0%, #2a1a3a 100%)",
                            "--accent-color": "rgba(180, 100, 255, 0.7)"
                        }
                    },
                    cyber: {
                        id: "cyber",
                        name: "CYBER PUNK",
                        description: "Neon cyberpunk theme",
                        variables: {
                            "--glass-primary": "rgba(0, 40, 40, 0.15)",
                            "--glass-secondary": "rgba(0, 60, 60, 0.1)",
                            "--glass-border": "rgba(0, 255, 200, 0.3)",
                            "--text-primary": "rgba(200, 255, 250, 0.95)",
                            "--background-base": "linear-gradient(135deg, #001a1a 0%, #002a2a 100%)",
                            "--accent-color": "rgba(0, 255, 200, 0.7)"
                        }
                    },
                    sunset: {
                        id: "sunset",
                        name: "SUNSET ORANGE",
                        description: "Warm sunset theme",
                        variables: {
                            "--glass-primary": "rgba(255, 100, 0, 0.1)",
                            "--glass-secondary": "rgba(255, 150, 0, 0.08)",
                            "--glass-border": "rgba(255, 200, 0, 0.3)",
                            "--text-primary": "rgba(255, 240, 200, 0.95)",
                            "--background-base": "linear-gradient(135deg, #2a1a00 0%, #4a2a00 100%)",
                            "--accent-color": "rgba(255, 200, 0, 0.7)"
                        }
                    }
                },
                animationSpeed: 1.0, // 0.5x to 3.0x
                glassBlur: 20, // px
                glassOpacity: 0.95,
                enableShadows: true,
                enableGlows: true,
                particleDensity: 100, // 0-200
                enableParallax: true
            },
            
            // SALES & ECONOMY TOGGLES
            sales: {
                enableAutoSales: false,
                salesCommission: 0.05, // 5%
                minimumPrice: 100,
                maximumPrice: 1000000,
                taxRate: 0.18, // 18%
                enablePriceFluctuation: true,
                fluctuationRange: 0.2, // ±20%
                salesNotifications: true,
                autoRestock: true,
                restockThreshold: 20, // %
                enableBulkDiscount: true,
                bulkDiscountTiers: [0.95, 0.90, 0.85], // 5%, 10%, 15%
                enableSeasonalPricing: false,
                seasonalMultiplier: 1.5,
                enableDynamicPricing: true,
                priceUpdateInterval: 3600, // seconds
                enableMarketAnalysis: true,
                competitorTracking: false,
                salesPrediction: true,
                enablePromotions: true,
                promotionFrequency: 7, // days
                enableLoyaltyProgram: false,
                loyaltyPointsRate: 0.01 // 1% as points
            },
            
            // PHYSICS ENGINE SETTINGS
            physics: {
                gravity: 9.8, // m/s²
                friction: 0.8, // coefficient
                restitution: 0.6, // bounciness
                airResistance: 0.1,
                terminalVelocity: 50, // m/s
                enableBuoyancy: true,
                fluidDensity: 1000, // kg/m³
                enableWind: false,
                windForce: 0.5,
                windDirection: 0, // degrees
                enableTemperature: false,
                temperature: 20, // °C
                enablePressure: false,
                atmosphericPressure: 101.325, // kPa
                collisionPrecision: "high", // low, medium, high
                collisionMargin: 0.01,
                enableSleeping: true,
                sleepThreshold: 0.2,
                enableCCD: false, // Continuous Collision Detection
                solverIterations: 10,
                enableFrictionAnchor: true,
                enableGyroscopicForce: false,
                enableConstraint: true,
                constraintIterations: 10
            },
            
            // MAUSAM (WEATHER) SYSTEM
            weather: {
                currentWeather: "clear", // clear, rainy, snowy, stormy, foggy
                temperature: 25, // °C
                humidity: 60, // %
                windSpeed: 5, // km/h
                windDirection: 90, // degrees
                precipitation: 0, // mm
                cloudCover: 20, // %
                visibility: 10, // km
                pressure: 1013, // hPa
                uvIndex: 5,
                pollenCount: 30, // low, medium, high
                airQuality: 50, // AQI
                enableDynamicWeather: true,
                weatherChangeInterval: 300, // seconds
                weatherSeverity: "normal", // light, normal, severe
                enableSeasons: true,
                currentSeason: "autumn", // spring, summer, autumn, winter
                seasonLength: 90, // days
                enableDayNightCycle: true,
                dayLength: 12, // hours
                nightLength: 12, // hours
                enableWeatherEffects: true,
                rainIntensity: 0.5, // 0-1
                snowIntensity: 0.3,
                fogDensity: 0.2,
                stormIntensity: 0.1,
                enableLightning: true,
                lightningFrequency: 0.01,
                enableRainbows: true,
                rainbowProbability: 0.05
            },
            
            // GADI (VEHICLE) SPEED & CONTROLS
            vehicle: {
                maxSpeed: 100, // km/h
                acceleration: 2.5, // m/s²
                brakingForce: 4.0, // m/s²
                steeringSensitivity: 1.0,
                tractionControl: 0.8, // 0-1
                antiLockBrakes: true,
                stabilityControl: true,
                fuelConsumption: 8.5, // L/100km
                fuelCapacity: 60, // liters
                enginePower: 150, // HP
                torque: 200, // Nm
                transmissionType: "automatic", // manual, automatic
                gearRatios: [3.5, 2.0, 1.5, 1.0, 0.8, 0.6],
                finalDriveRatio: 3.2,
                tireGrip: 0.9,
                tireWearRate: 0.001,
                suspensionStiffness: 1.0,
                suspensionTravel: 0.2, // m
                dampingRatio: 0.7,
                enableABS: true,
                enableTCS: true,
                enableESP: true,
                enableCruiseControl: true,
                cruiseSpeed: 80, // km/h
                enableLaneAssist: false,
                enableParkingSensors: true,
                enableAutoBraking: false,
                collisionWarning: true,
                enableNightVision: false,
                enableRainSensingWipers: true,
                enableAutoHeadlights: true,
                enableClimateControl: true,
                targetTemperature: 22 // °C
            },
            
            // PERFORMANCE OPTIMIZATION
            performance: {
                targetFPS: 60,
                vsyncEnabled: true,
                antiAliasing: "msaa4x", // none, fxaa, msaa2x, msaa4x, msaa8x
                textureQuality: "high", // low, medium, high, ultra
                shadowQuality: "high",
                reflectionQuality: "medium",
                waterQuality: "high",
                particleQuality: "medium",
                drawDistance: 1000, // meters
                lodBias: 1.0,
                enableOcclusionCulling: true,
                enableFrustumCulling: true,
                enableInstancing: true,
                enableMipMapping: true,
                anisotropicFiltering: 4, // 1x, 2x, 4x, 8x, 16x
                textureFiltering: "trilinear",
                enableBloom: true,
                bloomIntensity: 0.5,
                enableMotionBlur: false,
                motionBlurStrength: 0.5,
                enableDepthOfField: false,
                dofStrength: 0.3,
                enableSSAO: true,
                ssaoStrength: 0.8,
                enableGodRays: false,
                godRayStrength: 0.3,
                enableLensFlare: true,
                lensFlareStrength: 0.4
            },
            
            // AUDIO SETTINGS
            audio: {
                masterVolume: 0.8,
                musicVolume: 0.6,
                sfxVolume: 0.7,
                voiceVolume: 0.9,
                ambientVolume: 0.5,
                enable3DAudio: true,
                audioQuality: "high", // low, medium, high
                reverbEnabled: true,
                reverbPreset: "hall",
                enableEqualizer: false,
                equalizerPresets: ["flat", "bass", "treble", "vocal"],
                enableCompression: true,
                compressionThreshold: -20, // dB
                compressionRatio: 4,
                enableLimiter: true,
                limiterThreshold: 0, // dB
                spatialAudio: true,
                dopplerEffect: true,
                occlusionEnabled: true,
                hrtfEnabled: true
            },
            
            // NETWORK & CONNECTIVITY
            network: {
                connectionType: "auto", // auto, wifi, cellular, ethernet
                dataSaver: false,
                maxBandwidth: 0, // 0 = unlimited, in kbps
                enableCompression: true,
                compressionLevel: 6, // 1-9
                enableEncryption: true,
                encryptionMethod: "aes256",
                enableProxy: false,
                proxyAddress: "",
                proxyPort: 8080,
                proxyAuth: false,
                enableVPN: false,
                vpnProtocol: "openvpn",
                enableFirewall: true,
                firewallLevel: "medium", // low, medium, high
                enableDDoSProtection: true,
                enableQoS: false,
                qosPriority: "normal", // low, normal, high, critical
                packetLossRecovery: true,
                latencyOptimization: true,
                enableCaching: true,
                cacheSize: 100, // MB
                enablePrefetching: true,
                prefetchDistance: 50 // meters
            },
            
            // SECURITY & PRIVACY
            security: {
                enableBiometrics: false,
                biometricType: "none", // fingerprint, face, iris
                requirePIN: false,
                pinLength: 6,
                enableTwoFactor: false,
                twoFactorMethod: "none", // sms, email, authenticator
                sessionTimeout: 30, // minutes
                maxLoginAttempts: 5,
                lockoutDuration: 15, // minutes
                enableAutoLogout: true,
                enableActivityLog: true,
                logRetention: 30, // days
                enableEncryptedStorage: true,
                encryptionKeyLength: 256, // bits
                enableSecureBoot: false,
                enableMemoryProtection: true,
                enableNetworkIsolation: false,
                enableAppSandbox: true,
                enablePermissionControl: true,
                enablePrivacyMode: false,
                enableIncognito: false,
                dataCollection: "minimal" // none, minimal, standard, full
            },
            
            // AI & AUTOMATION
            ai: {
                enableAI: true,
                aiIntelligence: "high", // low, medium, high, ultra
                learningRate: 0.01,
                trainingIterations: 1000,
                enableNeuralNetwork: true,
                networkLayers: 3,
                neuronsPerLayer: 128,
                activationFunction: "relu",
                enableBackpropagation: true,
                enableReinforcementLearning: false,
                rewardFunction: "custom",
                enableGeneticAlgorithms: false,
                populationSize: 100,
                mutationRate: 0.01,
                enableSwarmIntelligence: false,
                swarmSize: 50,
                enablePredictiveAnalytics: true,
                predictionAccuracy: 0.85,
                enableNaturalLanguage: false,
                languageModel: "none",
                enableComputerVision: false,
                visionAccuracy: 0.9,
                enableSpeechRecognition: false,
                speechAccuracy: 0.8,
                enableGestureControl: false,
                gestureSensitivity: 0.7
            },
            
            // EXPERIMENTAL FEATURES
            experimental: {
                enableQuantumMode: false,
                quantumEntanglement: false,
                enableTimeDilation: false,
                timeScale: 1.0,
                enableParallelUniverses: false,
                universeCount: 2,
                enableWormholes: false,
                wormholeStability: 0.5,
                enableTeleportation: false,
                teleportAccuracy: 0.95,
                enableCloning: false,
                cloneLimit: 1,
                enableInvisibility: false,
                invisibilityDuration: 10, // seconds
                enableLevitation: false,
                levitationHeight: 1.0, // meters
                enableMindControl: false,
                controlRange: 10, // meters
                enableRealityBending: false,
                bendingIntensity: 0.1,
                enableDimensionalShift: false,
                dimensionOffset: 0,
                enableChronomancy: false,
                timeManipulation: 0
            }
        };
        
        // UI Elements
        this.ui = {
            container: null,
            isOpen: false,
            currentCategory: "visual",
            searchQuery: ""
        };
        
        // Configuration History
        this.history = [];
        this.maxHistorySize = 50;
        
        // Initialize
        this.initialize();
    }

    // ============ INITIALIZATION ============
    
    initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Load saved configuration
        this.loadConfig();
        
        // Apply current theme
        this.applyTheme(this.settings.visual.activeTheme);
        
        // Create hidden menu interface
        this.createSecretMenu();
        
        // Add to main menu
        this.addToMainMenu();
        
        // Apply initial settings to other modules
        this.applyToOtherModules();
        
        this.isInitialized = true;
        console.log(`${this.systemName} v${this.version} initialized`);
        console.log(`Owner: ${this.ownerName}`);
    }

    // ============ SECRET MENU CREATION ============
    
    createSecretMenu() {
        // Create main container
        this.ui.container = document.createElement('div');
        this.ui.container.className = 'secret-config-container';
        this.ui.container.style.cssText = `
            position: fixed;
            top: 0;
            left: -550px;
            width: 500px;
            height: 100vh;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(30px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1001;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            box-shadow: 20px 0 40px rgba(0, 0, 0, 0.5);
            overflow: hidden;
        `;
        
        // Create menu with engraved owner name
        this.ui.container.innerHTML = `
            <!-- Header with Engraved Owner Name -->
            <div class="config-header">
                <div class="header-content">
                    <div class="owner-engraving">
                        <svg class="engraving-border" width="100%" height="60" viewBox="0 0 400 60">
                            <defs>
                                <linearGradient id="engravingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="#FFD700" stop-opacity="0.8"/>
                                    <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.9"/>
                                    <stop offset="100%" stop-color="#FFD700" stop-opacity="0.8"/>
                                </linearGradient>
                                <filter id="engravingShadow">
                                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
                                </filter>
                            </defs>
                            <path d="M20,30 Q10,20 20,10 L380,10 Q390,20 380,30 Q390,40 380,50 L20,50 Q10,40 20,30" 
                                  fill="none" stroke="url(#engravingGradient)" stroke-width="2" 
                                  filter="url(#engravingShadow)"/>
                        </svg>
                        <div class="owner-name">${this.ownerName.toUpperCase()}</div>
                    </div>
                    <div class="header-title">
                        <svg class="lock-icon" width="24" height="24" viewBox="0 0 24 24">
                            <rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                            <path d="M8,11 L8,7 A4,4 0 0,1 16,7 L16,11" fill="none" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <h3>KHUFIYA CONFIG</h3>
                        <div class="version">v${this.version}</div>
                    </div>
                </div>
                <button class="close-btn" id="configCloseBtn">&times;</button>
            </div>
            
            <!-- Search Bar -->
            <div class="config-search">
                <div class="search-wrapper">
                    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M21,21 L16,16" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <input type="text" class="search-input" id="configSearch" 
                           placeholder="Search 200 settings...">
                    <button class="search-clear" id="searchClear">&times;</button>
                </div>
                <div class="search-stats">
                    <span class="stat">Total: <strong>200</strong></span>
                    <span class="stat">Modified: <strong id="modifiedCount">0</strong></span>
                    <span class="stat">Locked: <strong id="lockStatus">${this.configLocked ? 'YES' : 'NO'}</strong></span>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="config-main">
                <!-- Sidebar Categories -->
                <div class="config-sidebar">
                    <div class="category-list" id="categoryList"></div>
                    
                    <!-- Lock/Unlock Button -->
                    <div class="lock-control">
                        <button class="lock-btn ${this.configLocked ? 'locked' : 'unlocked'}" id="toggleLock">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                ${this.configLocked ? 
                                    '<path d="M12,2 C15,2 17,5 17,7 L17,10 L19,10 L19,20 L5,20 L5,10 L7,10 L7,7 C7,5 9,2 12,2 Z M12,4 C10,4 9,6 9,7 L9,10 L15,10 L15,7 C15,6 14,4 12,4 Z M12,14 C13,14 14,15 14,16 C14,17 13,18 12,18 C11,18 10,17 10,16 C10,15 11,14 12,14 Z" fill="currentColor"/>' :
                                    '<path d="M12,2 C15,2 17,5 17,7 L17,10 L19,10 L19,20 L5,20 L5,10 L7,10 L7,7 C7,5 9,2 12,2 Z M12,14 C13,14 14,15 14,16 C14,17 13,18 12,18 C11,18 10,17 10,16 C10,15 11,14 12,14 Z" fill="currentColor"/>'
                                }
                            </svg>
                            ${this.configLocked ? 'UNLOCK CONFIG' : 'LOCK CONFIG'}
                        </button>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button class="quick-btn" id="saveConfigBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path d="M17,3 L21,3 L21,21 L3,21 L3,3 L7,3 M7,1 L17,1 L17,7 L7,7 L7,1 Z M12,12 C14,12 15,13 15,15 C15,17 14,18 12,18 C10,18 9,17 9,15 C9,13 10,12 12,12 Z" 
                                      fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            SAVE
                        </button>
                        <button class="quick-btn" id="resetConfigBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path d="M12,2 C17,2 21,6 21,11 C21,16 17,20 12,20 C7,20 3,16 3,11 C3,8 4,5 6,3 M12,8 L12,12 L16,12" 
                                      fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            RESET
                        </button>
                        <button class="quick-btn" id="exportConfigBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path d="M12,2 L12,16 M7,11 L12,16 L17,11 M2,20 L22,20" 
                                      fill="none" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            EXPORT
                        </button>
                    </div>
                </div>
                
                <!-- Settings Panel -->
                <div class="settings-panel">
                    <div class="panel-header">
                        <h4 id="categoryTitle">VISUAL SETTINGS</h4>
                        <div class="header-actions">
                            <button class="action-btn" id="expandAllBtn">EXPAND ALL</button>
                            <button class="action-btn" id="collapseAllBtn">COLLAPSE ALL</button>
                        </div>
                    </div>
                    
                    <div class="settings-container" id="settingsContainer">
                        <!-- Settings will be dynamically loaded here -->
                    </div>
                    
                    <div class="panel-footer">
                        <div class="status-indicator">
                            <span class="status-dot" id="configStatus"></span>
                            <span class="status-text">CONFIG READY</span>
                        </div>
                        <div class="hotkey-hint">
                            <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>C</kbd> to toggle
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.ui.container);
        
        // Add styles
        this.addSecretStyles();
        
        // Setup event listeners
        this.setupConfigEvents();
        
        // Populate categories
        this.populateCategories();
        
        // Load current category settings
        this.loadCategorySettings(this.ui.currentCategory);
    }

    addSecretStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Secret Config Container */
            .secret-config-container {
                font-family: 'SF Mono', 'Cascadia Code', monospace;
                color: #fff;
            }
            
            /* Header with Engraving */
            .config-header {
                padding: 16px 20px;
                background: rgba(20, 20, 20, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
            }
            
            .header-content {
                flex: 1;
            }
            
            .owner-engraving {
                position: relative;
                margin-bottom: 12px;
            }
            
            .engraving-border {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }
            
            .owner-name {
                position: relative;
                text-align: center;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 3px;
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                padding: 16px 0;
                text-transform: uppercase;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 215, 0, 0.1) 50%, 
                    transparent 100%);
            }
            
            .header-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .lock-icon {
                color: #FFD700;
            }
            
            .header-title h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 2px;
                color: #fff;
            }
            
            .version {
                margin-left: auto;
                font-size: 11px;
                color: #666;
                letter-spacing: 1px;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #fff;
                font-size: 24px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            /* Search Area */
            .config-search {
                padding: 12px 20px;
                background: rgba(30, 30, 30, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .search-wrapper {
                position: relative;
                margin-bottom: 8px;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #666;
            }
            
            .search-input {
                width: 100%;
                padding: 10px 40px 10px 40px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #fff;
                font-family: 'SF Mono', monospace;
                font-size: 13px;
                outline: none;
                transition: all 0.3s ease;
            }
            
            .search-input:focus {
                border-color: #4A90E2;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
            }
            
            .search-clear {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-size: 20px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .search-stats {
                display: flex;
                gap: 16px;
                font-size: 11px;
                color: #666;
            }
            
            .search-stats .stat {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .search-stats strong {
                color: #fff;
                font-weight: 700;
            }
            
            /* Main Layout */
            .config-main {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            /* Sidebar */
            .config-sidebar {
                width: 180px;
                background: rgba(20, 20, 20, 0.95);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                padding: 16px 0;
            }
            
            .category-list {
                flex: 1;
                overflow-y: auto;
                padding: 0 12px;
            }
            
            .category-item {
                padding: 10px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: #999;
            }
            
            .category-item:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #fff;
            }
            
            .category-item.active {
                background: rgba(74, 144, 226, 0.2);
                color: #4A90E2;
                font-weight: 700;
            }
            
            .category-icon {
                width: 16px;
                height: 16px;
            }
            
            .lock-control {
                padding: 16px 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .lock-btn {
                width: 100%;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: #fff;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .lock-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }
            
            .lock-btn.locked {
                background: rgba(239, 71, 111, 0.2);
                border-color: rgba(239, 71, 111, 0.3);
                color: #EF476F;
            }
            
            .lock-btn.unlocked {
                background: rgba(6, 214, 160, 0.2);
                border-color: rgba(6, 214, 160, 0.3);
                color: #06D6A0;
            }
            
            .quick-actions {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .quick-btn {
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #999;
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            
            .quick-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            /* Settings Panel */
            .settings-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .panel-header {
                padding: 16px 20px;
                background: rgba(30, 30, 30, 0.95);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .panel-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #fff;
            }
            
            .header-actions {
                display: flex;
                gap: 8px;
            }
            
            .action-btn {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #999;
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .action-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .settings-container {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            /* Setting Groups */
            .setting-group {
                margin-bottom: 24px;
                background: rgba(40, 40, 40, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .group-header {
                padding: 14px 16px;
                background: rgba(50, 50, 50, 0.8);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .group-header:hover {
                background: rgba(60, 60, 60, 0.8);
            }
            
            .group-title {
                font-size: 13px;
                font-weight: 700;
                color: #fff;
                letter-spacing: 1px;
            }
            
            .group-toggle {
                color: #666;
                transition: transform 0.3s ease;
            }
            
            .group-toggle.expanded {
                transform: rotate(180deg);
            }
            
            .group-content {
                padding: 16px;
                display: none;
            }
            
            .group-content.expanded {
                display: block;
            }
            
            /* Individual Settings */
            .setting-item {
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .setting-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }
            
            .setting-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .setting-name {
                font-size: 12px;
                color: #ccc;
                font-weight: 600;
            }
            
            .setting-value {
                font-size: 11px;
                color: #4A90E2;
                font-weight: 700;
                background: rgba(74, 144, 226, 0.1);
                padding: 2px 8px;
                border-radius: 10px;
            }
            
            .setting-description {
                font-size: 11px;
                color: #666;
                line-height: 1.4;
                margin-bottom: 8px;
            }
            
            /* Different Control Types */
            .toggle-control {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .toggle-switch {
                position: relative;
                width: 40px;
                height: 20px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                transition: .3s;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 2px;
                bottom: 2px;
                background: #666;
                border-radius: 50%;
                transition: .3s;
            }
            
            input:checked + .toggle-slider {
                background: rgba(6, 214, 160, 0.5);
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(20px);
                background: #06D6A0;
            }
            
            .slider-control {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .slider-track {
                flex: 1;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                position: relative;
            }
            
            .slider-fill {
                position: absolute;
                height: 100%;
                background: #4A90E2;
                border-radius: 2px;
            }
            
            .slider-thumb {
                position: absolute;
                width: 16px;
                height: 16px;
                background: #fff;
                border-radius: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .slider-value {
                min-width: 40px;
                text-align: right;
                font-size: 11px;
                color: #fff;
                font-weight: 700;
            }
            
            .select-control {
                width: 100%;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #fff;
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                outline: none;
                cursor: pointer;
            }
            
            .select-control:focus {
                border-color: #4A90E2;
            }
            
            .color-control {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .color-preview {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
            }
            
            .color-input {
                flex: 1;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #fff;
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                outline: none;
            }
            
            /* Theme Cards */
            .theme-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-top: 8px;
            }
            
            .theme-card {
                padding: 12px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: rgba(0, 0, 0, 0.3);
            }
            
            .theme-card:hover {
                transform: translateY(-2px);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .theme-card.active {
                border-color: #4A90E2;
                background: rgba(74, 144, 226, 0.1);
            }
            
            .theme-preview {
                height: 40px;
                border-radius: 4px;
                margin-bottom: 8px;
                position: relative;
                overflow: hidden;
            }
            
            .theme-name {
                font-size: 11px;
                font-weight: 700;
                color: #fff;
                margin-bottom: 2px;
            }
            
            .theme-desc {
                font-size: 9px;
                color: #666;
                line-height: 1.2;
            }
            
            /* Panel Footer */
            .panel-footer {
                padding: 12px 20px;
                background: rgba(20, 20, 20, 0.95);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #06D6A0;
                animation: statusPulse 2s infinite;
            }
            
            .status-text {
                font-size: 11px;
                color: #666;
                letter-spacing: 1px;
            }
            
            .hotkey-hint {
                font-size: 11px;
                color: #666;
            }
            
            .hotkey-hint kbd {
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'SF Mono', monospace;
                font-size: 10px;
                color: #fff;
            }
            
            @keyframes statusPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* Search Results */
            .search-results {
                max-height: 400px;
                overflow-y: auto;
                margin-top: 16px;
                background: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            
            .search-result-item {
                padding: 12px 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .search-result-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .result-category {
                font-size: 10px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 4px;
            }
            
            .result-setting {
                font-size: 12px;
                color: #fff;
                font-weight: 600;
            }
            
            .result-path {
                font-size: 10px;
                color: #4A90E2;
                margin-top: 2px;
            }
            
            /* Responsive */
            @media (max-width: 600px) {
                .secret-config-container {
                    width: 100%;
                    left: -100%;
                }
                
                .config-sidebar {
                    width: 150px;
                }
                
                .theme-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // ============ CATEGORY MANAGEMENT ============
    
    populateCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;
        
        const categories = [
            { id: "visual", name: "VISUAL MODES", icon: "eye" },
            { id: "sales", name: "SALES TOGGLES", icon: "currency" },
            { id: "physics", name: "PHYSICS ENGINE", icon: "atom" },
            { id: "weather", name: "MAUSAM SYSTEM", icon: "cloud" },
            { id: "vehicle", name: "GADI CONTROLS", icon: "car" },
            { id: "performance", name: "PERFORMANCE", icon: "speed" },
            { id: "audio", name: "AUDIO SETTINGS", icon: "volume" },
            { id: "network", name: "NETWORK", icon: "wifi" },
            { id: "security", name: "SECURITY", icon: "shield" },
            { id: "ai", name: "AI & AUTOMATION", icon: "brain" },
            { id: "experimental", name: "EXPERIMENTAL", icon: "flask" }
        ];
        
        categoryList.innerHTML = '';
        
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = `category-item ${category.id === this.ui.currentCategory ? 'active' : ''}`;
            categoryItem.dataset.category = category.id;
            
            categoryItem.innerHTML = `
                <svg class="category-icon" width="16" height="16" viewBox="0 0 24 24">
                    ${this.getCategoryIcon(category.icon)}
                </svg>
                <span>${category.name}</span>
            `;
            
            categoryItem.addEventListener('click', () => {
                this.selectCategory(category.id);
            });
            
            categoryList.appendChild(categoryItem);
        });
    }

    getCategoryIcon(iconName) {
        const icons = {
            eye: '<path d="M12,4 C7,4 2,7 2,12 C2,17 7,20 12,20 C17,20 22,17 22,12 C22,7 17,4 12,4 Z M12,8 C14,8 16,10 16,12 C16,14 14,16 12,16 C10,16 8,14 8,12 C8,10 10,8 12,8 Z M12,10 C11,10 10,11 10,12 C10,13 11,14 12,14 C13,14 14,13 14,12 C14,11 13,10 12,10 Z" fill="currentColor"/>',
            currency: '<path d="M12,2 C17,2 21,6 21,11 C21,16 17,20 12,20 C7,20 3,16 3,11 C3,6 7,2 12,2 Z M12,4 C8,4 5,7 5,11 C5,15 8,18 12,18 C16,18 19,15 19,11 C19,7 16,4 12,4 Z M11,7 L13,7 L13,9 L15,9 L15,11 L13,11 L13,13 L15,13 L15,15 L13,15 L13,17 L11,17 L11,15 L9,15 L9,13 L11,13 L11,11 L9,11 L9,9 L11,9 L11,7 Z" fill="currentColor"/>',
            atom: '<path d="M12,2 C15,2 18,4 18,7 C18,10 15,12 12,12 C9,12 6,10 6,7 C6,4 9,2 12,2 Z M12,4 C10,4 8,5 8,7 C8,9 10,10 12,10 C14,10 16,9 16,7 C16,5 14,4 12,4 Z M3,12 C6,12 9,14 9,17 C9,20 6,22 3,22 C0,22 0,20 0,17 C0,14 0,12 3,12 Z M21,12 C24,12 24,14 24,17 C24,20 24,22 21,22 C18,22 15,20 15,17 C15,14 18,12 21,12 Z" fill="currentColor"/>',
            cloud: '<path d="M19,14 C21,14 23,16 23,18 C23,20 21,22 19,22 L5,22 C3,22 1,20 1,18 C1,16 3,14 5,14 C5,11 7,9 10,9 C12,9 14,10 15,12 C16,10 18,9 20,9 C23,9 25,11 25,14 C25,14 25,14 25,14 Z" fill="currentColor"/>',
            car: '<path d="M5,14 L19,14 L19,18 L5,18 L5,14 Z M7,10 L17,10 L17,12 L7,12 L7,10 Z M4,8 L20,8 L20,10 L4,10 L4,8 Z M2,6 L22,6 L22,8 L2,8 L2,6 Z M0,4 L24,4 L24,6 L0,6 L0,4 Z" fill="currentColor"/>',
            speed: '<path d="M12,2 C17,2 21,6 21,11 C21,16 17,20 12,20 C7,20 3,16 3,11 C3,6 7,2 12,2 Z M12,4 C8,4 5,7 5,11 C5,15 8,18 12,18 C16,18 19,15 19,11 C19,7 16,4 12,4 Z M12,6 L12,11 L16,11" fill="currentColor"/>',
            volume: '<path d="M15,4 L9,4 L4,9 L1,9 L1,15 L4,15 L9,20 L15,20 L15,4 Z M15,6 L15,18 L10,18 L6,14 L3,14 L3,10 L6,10 L10,6 L15,6 Z M19,8 L17,10 C18,11 19,12 19,14 C19,16 18,17 17,18 L19,20 C21,18 22,16 22,14 C22,12 21,10 19,8 Z" fill="currentColor"/>',
            wifi: '<path d="M12,2 C16,2 20,4 23,7 L21,9 C19,7 16,6 12,6 C8,6 5,7 3,9 L1,7 C4,4 8,2 12,2 Z M12,10 C14,10 16,11 17,13 L15,15 C14,14 13,13 12,13 C11,13 10,14 9,15 L7,13 C8,11 10,10 12,10 Z M12,18 C13,18 14,19 14,20 C14,21 13,22 12,22 C11,22 10,21 10,20 C10,19 11,18 12,18 Z" fill="currentColor"/>',
            shield: '<path d="M12,2 L22,6 L22,12 C22,17 18,21 12,22 C6,21 2,17 2,12 L2,6 L12,2 Z M12,4 L4,7 L4,12 C4,16 7,19 12,20 C17,19 20,16 20,12 L20,7 L12,4 Z" fill="currentColor"/>',
            brain: '<path d="M12,2 C15,2 18,4 18,7 C18,10 15,12 12,12 C9,12 6,10 6,7 C6,4 9,2 12,2 Z M3,12 C6,12 9,14 9,17 C9,20 6,22 3,22 C0,22 0,20 0,17 C0,14 0,12 3,12 Z M21,12 C24,12 24,14 24,17 C24,20 24,22 21,22 C18,22 15,20 15,17 C15,14 18,12 21,12 Z" fill="currentColor"/>',
            flask: '<path d="M14,2 L10,2 L10,8 L7,8 L7,10 L17,10 L17,8 L14,8 L14,2 Z M8,12 L16,12 L19,20 L5,20 L8,12 Z" fill="currentColor"/>'
        };
        
        return icons[iconName] || icons.eye;
    }

    selectCategory(categoryId) {
        this.ui.currentCategory = categoryId;
        
        // Update active category in UI
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === categoryId) {
                item.classList.add('active');
            }
        });
        
        // Update category title
        const categoryTitle = document.getElementById('categoryTitle');
        if (categoryTitle) {
            const categoryNames = {
                visual: "VISUAL MODES",
                sales: "SALES TOGGLES", 
                physics: "PHYSICS ENGINE",
                weather: "MAUSAM SYSTEM",
                vehicle: "GADI CONTROLS",
                performance: "PERFORMANCE OPTIMIZATION",
                audio: "AUDIO SETTINGS",
                network: "NETWORK & CONNECTIVITY",
                security: "SECURITY & PRIVACY",
                ai: "AI & AUTOMATION",
                experimental: "EXPERIMENTAL FEATURES"
            };
            categoryTitle.textContent = categoryNames[categoryId] || categoryId.toUpperCase();
        }
        
        // Load settings for this category
        this.loadCategorySettings(categoryId);
    }

    // ============ SETTINGS RENDERING ============
    
    loadCategorySettings(categoryId) {
        const settingsContainer = document.getElementById('settingsContainer');
        if (!settingsContainer) return;
        
        const categorySettings = this.settings[categoryId];
        if (!categorySettings) return;
        
        // Clear container
        settingsContainer.innerHTML = '';
        
        // Create setting groups based on category
        const groups = this.getSettingGroups(categoryId, categorySettings);
        
        groups.forEach(group => {
            const groupElement = this.createSettingGroup(group);
            settingsContainer.appendChild(groupElement);
        });
        
        // Initialize all controls
        this.initializeControls();
    }

    getSettingGroups(categoryId, settings) {
        // Organize settings into logical groups
        const groups = [];
        
        switch (categoryId) {
            case "visual":
                groups.push(
                    {
                        id: "themes",
                        title: "THEME SELECTION",
                        settings: {
                            activeTheme: {
                                type: "theme",
                                value: settings.activeTheme,
                                description: "Select active visual theme",
                                options: Object.values(settings.themes)
                            }
                        }
                    },
                    {
                        id: "glass_effects",
                        title: "GLASS EFFECTS",
                        settings: {
                            glassBlur: {
                                type: "slider",
                                value: settings.glassBlur,
                                min: 5,
                                max: 50,
                                step: 1,
                                unit: "px",
                                description: "Adjust glass blur intensity"
                            },
                            glassOpacity: {
                                type: "slider",
                                value: settings.glassOpacity,
                                min: 0.5,
                                max: 1,
                                step: 0.05,
                                description: "Adjust glass opacity"
                            },
                            enableShadows: {
                                type: "toggle",
                                value: settings.enableShadows,
                                description: "Enable shadow effects"
                            },
                            enableGlows: {
                                type: "toggle",
                                value: settings.enableGlows,
                                description: "Enable glow effects"
                            }
                        }
                    },
                    {
                        id: "animations",
                        title: "ANIMATIONS",
                        settings: {
                            animationSpeed: {
                                type: "slider",
                                value: settings.animationSpeed,
                                min: 0.5,
                                max: 3,
                                step: 0.1,
                                description: "Global animation speed multiplier"
                            },
                            particleDensity: {
                                type: "slider",
                                value: settings.particleDensity,
                                min: 0,
                                max: 200,
                                step: 10,
                                description: "Particle effect density"
                            },
                            enableParallax: {
                                type: "toggle",
                                value: settings.enableParallax,
                                description: "Enable parallax scrolling effects"
                            }
                        }
                    }
                );
                break;
                
            case "sales":
                groups.push(
                    {
                        id: "sales_basic",
                        title: "BASIC SALES SETTINGS",
                        settings: {
                            enableAutoSales: {
                                type: "toggle",
                                value: settings.enableAutoSales,
                                description: "Enable automatic sales system"
                            },
                            salesCommission: {
                                type: "slider",
                                value: settings.salesCommission,
                                min: 0,
                                max: 0.5,
                                step: 0.01,
                                format: "percent",
                                description: "Sales commission rate"
                            },
                            taxRate: {
                                type: "slider",
                                value: settings.taxRate,
                                min: 0,
                                max: 0.5,
                                step: 0.01,
                                format: "percent",
                                description: "Tax rate on sales"
                            }
                        }
                    },
                    {
                        id: "pricing",
                        title: "PRICING STRATEGY",
                        settings: {
                            enablePriceFluctuation: {
                                type: "toggle",
                                value: settings.enablePriceFluctuation,
                                description: "Enable dynamic price fluctuations"
                            },
                            fluctuationRange: {
                                type: "slider",
                                value: settings.fluctuationRange,
                                min: 0,
                                max: 1,
                                step: 0.05,
                                format: "percent",
                                description: "Price fluctuation range"
                            },
                            enableDynamicPricing: {
                                type: "toggle",
                                value: settings.enableDynamicPricing,
                                description: "Enable AI-powered dynamic pricing"
                            },
                            enableBulkDiscount: {
                                type: "toggle",
                                value: settings.enableBulkDiscount,
                                description: "Enable bulk purchase discounts"
                            }
                        }
                    }
                );
                break;
                
            case "physics":
                groups.push(
                    {
                        id: "basic_physics",
                        title: "BASIC PHYSICS",
                        settings: {
                            gravity: {
                                type: "slider",
                                value: settings.gravity,
                                min: 1,
                                max: 20,
                                step: 0.1,
                                unit: "m/s²",
                                description: "Gravity strength"
                            },
                            friction: {
                                type: "slider",
                                value: settings.friction,
                                min: 0,
                                max: 1,
                                step: 0.05,
                                description: "Surface friction coefficient"
                            },
                            restitution: {
                                type: "slider",
                                value: settings.restitution,
                                min: 0,
                                max: 1,
                                step: 0.05,
                                description: "Object bounciness"
                            }
                        }
                    },
                    {
                        id: "environment",
                        title: "ENVIRONMENT PHYSICS",
                        settings: {
                            enableWind: {
                                type: "toggle",
                                value: settings.enableWind,
                                description: "Enable wind effects"
                            },
                            windForce: {
                                type: "slider",
                                value: settings.windForce,
                                min: 0,
                                max: 10,
                                step: 0.1,
                                description: "Wind force strength"
                            },
                            enableBuoyancy: {
                                type: "toggle",
                                value: settings.enableBuoyancy,
                                description: "Enable buoyancy in fluids"
                            },
                            fluidDensity: {
                                type: "slider",
                                value: settings.fluidDensity,
                                min: 500,
                                max: 1500,
                                step: 10,
                                unit: "kg/m³",
                                description: "Fluid density for buoyancy"
                            }
                        }
                    }
                );
                break;
                
            case "weather":
                groups.push(
                    {
                        id: "current_weather",
                        title: "CURRENT WEATHER",
                        settings: {
                            currentWeather: {
                                type: "select",
                                value: settings.currentWeather,
                                options: [
                                    { value: "clear", label: "Clear Sky" },
                                    { value: "rainy", label: "Rainy" },
                                    { value: "snowy", label: "Snowy" },
                                    { value: "stormy", label: "Stormy" },
                                    { value: "foggy", label: "Foggy" }
                                ],
                                description: "Current weather condition"
                            },
                            temperature: {
                                type: "slider",
                                value: settings.temperature,
                                min: -20,
                                max: 50,
                                step: 1,
                                unit: "°C",
                                description: "Temperature"
                            },
                            humidity: {
                                type: "slider",
                                value: settings.humidity,
                                min: 0,
                                max: 100,
                                step: 1,
                                unit: "%",
                                description: "Humidity level"
                            }
                        }
                    },
                    {
                        id: "weather_effects",
                        title: "WEATHER EFFECTS",
                        settings: {
                            enableDynamicWeather: {
                                type: "toggle",
                                value: settings.enableDynamicWeather,
                                description: "Enable dynamic weather changes"
                            },
                            weatherChangeInterval: {
                                type: "slider",
                                value: settings.weatherChangeInterval,
                                min: 60,
                                max: 3600,
                                step: 60,
                                unit: "seconds",
                                description: "Weather change frequency"
                            },
                            enableLightning: {
                                type: "toggle",
                                value: settings.enableLightning,
                                description: "Enable lightning effects during storms"
                            },
                            enableRainbows: {
                                type: "toggle",
                                value: settings.enableRainbows,
                                description: "Enable rainbow effects after rain"
                            }
                        }
                    }
                );
                break;
                
            case "vehicle":
                groups.push(
                    {
                        id: "speed_controls",
                        title: "SPEED & PERFORMANCE",
                        settings: {
                            maxSpeed: {
                                type: "slider",
                                value: settings.maxSpeed,
                                min: 10,
                                max: 300,
                                step: 5,
                                unit: "km/h",
                                description: "Maximum vehicle speed"
                            },
                            acceleration: {
                                type: "slider",
                                value: settings.acceleration,
                                min: 1,
                                max: 10,
                                step: 0.1,
                                unit: "m/s²",
                                description: "Acceleration rate"
                            },
                            brakingForce: {
                                type: "slider",
                                value: settings.brakingForce,
                                min: 1,
                                max: 10,
                                step: 0.1,
                                unit: "m/s²",
                                description: "Braking force"
                            }
                        }
                    },
                    {
                        id: "safety_features",
                        title: "SAFETY FEATURES",
                        settings: {
                            antiLockBrakes: {
                                type: "toggle",
                                value: settings.antiLockBrakes,
                                description: "Enable anti-lock braking system"
                            },
                            stabilityControl: {
                                type: "toggle",
                                value: settings.stabilityControl,
                                description: "Enable electronic stability control"
                            },
                            tractionControl: {
                                type: "slider",
                                value: settings.tractionControl,
                                min: 0,
                                max: 1,
                                step: 0.1,
                                description: "Traction control strength"
                            },
                            collisionWarning: {
                                type: "toggle",
                                value: settings.collisionWarning,
                                description: "Enable collision warning system"
                            }
                        }
                    }
                );
                break;
                
            default:
                // Generic settings display for other categories
                groups.push({
                    id: categoryId,
                    title: `${categoryId.toUpperCase()} SETTINGS`,
                    settings: categorySettings
                });
        }
        
        return groups;
    }

    createSettingGroup(group) {
        const groupElement = document.createElement('div');
        groupElement.className = 'setting-group';
        groupElement.dataset.groupId = group.id;
        
        let settingsHTML = '';
        
        Object.entries(group.settings).forEach(([key, setting]) => {
            settingsHTML += this.createSettingControl(key, setting);
        });
        
        groupElement.innerHTML = `
            <div class="group-header" data-toggle-group="${group.id}">
                <div class="group-title">${group.title}</div>
                <div class="group-toggle">▼</div>
            </div>
            <div class="group-content" id="group-${group.id}">
                ${settingsHTML}
            </div>
        `;
        
        return groupElement;
    }

    createSettingControl(key, setting) {
        let controlHTML = '';
        const value = setting.value;
        const formattedValue = this.formatValue(value, setting.format);
        
        switch (setting.type) {
            case "toggle":
                controlHTML = `
                    <div class="toggle-control">
                        <label class="toggle-switch">
                            <input type="checkbox" data-setting="${key}" ${value ? 'checked' : ''} 
                                   ${this.configLocked ? 'disabled' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span>${value ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                `;
                break;
                
            case "slider":
                const min = setting.min || 0;
                const max = setting.max || 100;
                const step = setting.step || 1;
                const percentage = ((value - min) / (max - min)) * 100;
                
                controlHTML = `
                    <div class="slider-control">
                        <div class="slider-track" data-setting="${key}">
                            <div class="slider-fill" style="width: ${percentage}%"></div>
                            <div class="slider-thumb" style="left: ${percentage}%"></div>
                        </div>
                        <div class="slider-value">${formattedValue}${setting.unit || ''}</div>
                        <input type="range" min="${min}" max="${max}" step="${step}" 
                               value="${value}" data-setting="${key}" 
                               ${this.configLocked ? 'disabled' : ''} style="display: none">
                    </div>
                `;
                break;
                
            case "select":
                let optionsHTML = '';
                setting.options.forEach(option => {
                    const optionValue = option.value || option;
                    const optionLabel = option.label || option;
                    optionsHTML += `<option value="${optionValue}" ${value === optionValue ? 'selected' : ''}>${optionLabel}</option>`;
                });
                
                controlHTML = `
                    <select class="select-control" data-setting="${key}" ${this.configLocked ? 'disabled' : ''}>
                        ${optionsHTML}
                    </select>
                `;
                break;
                
            case "theme":
                let themesHTML = '';
                setting.options.forEach(theme => {
                    const isActive = value === theme.id;
                    themesHTML += `
                        <div class="theme-card ${isActive ? 'active' : ''}" data-theme="${theme.id}">
                            <div class="theme-preview" style="background: ${this.getThemePreview(theme.variables)}"></div>
                            <div class="theme-name">${theme.name}</div>
                            <div class="theme-desc">${theme.description}</div>
                        </div>
                    `;
                });
                
                controlHTML = `<div class="theme-grid">${themesHTML}</div>`;
                break;
                
            default:
                controlHTML = `<div>Unknown control type: ${setting.type}</div>`;
        }
        
        return `
            <div class="setting-item" data-setting-key="${key}">
                <div class="setting-header">
                    <div class="setting-name">${this.formatSettingName(key)}</div>
                    <div class="setting-value">${formattedValue}${setting.unit || ''}</div>
                </div>
                <div class="setting-description">${setting.description || 'No description available'}</div>
                ${controlHTML}
            </div>
        `;
    }

    formatSettingName(key) {
        // Convert camelCase to Title Case with spaces
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
    }

    formatValue(value, format) {
        if (format === "percent") {
            return `${(value * 100).toFixed(1)}%`;
        }
        
        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                return value.toString();
            } else {
                return value.toFixed(2);
            }
        }
        
        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }
        
        return value;
    }

    getThemePreview(variables) {
        // Create a gradient preview from theme variables
        const bg = variables["--background-base"] || "linear-gradient(135deg, #f0f5ff 0%, #ffffff 50%, #f8fbff 100%)";
        return bg;
    }

    // ============ CONTROL INITIALIZATION ============
    
    initializeControls() {
        // Group toggle events
        document.querySelectorAll('.group-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const groupId = header.dataset.toggleGroup;
                const content = document.getElementById(`group-${groupId}`);
                const toggle = header.querySelector('.group-toggle');
                
                if (content.classList.contains('expanded')) {
                    content.classList.remove('expanded');
                    toggle.classList.remove('expanded');
                } else {
                    content.classList.add('expanded');
                    toggle.classList.add('expanded');
                }
            });
        });
        
        // Toggle controls
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                if (this.configLocked) {
                    e.preventDefault();
                    this.showLockedMessage();
                    return;
                }
                
                const key = toggle.dataset.setting;
                const category = this.ui.currentCategory;
                const value = toggle.checked;
                
                this.updateSetting(category, key, value);
                
                // Update toggle label
                const label = toggle.parentElement.nextElementSibling;
                if (label) {
                    label.textContent = value ? 'ENABLED' : 'DISABLED';
                }
            });
        });
        
        // Slider controls
        document.querySelectorAll('.slider-track').forEach(track => {
            const input = track.nextElementSibling?.nextElementSibling;
            if (!input) return;
            
            let isDragging = false;
            
            const updateSlider = (clientX) => {
                const rect = track.getBoundingClientRect();
                const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                const step = parseFloat(input.step) || 1;
                
                let value = min + (max - min) * percentage;
                value = Math.round(value / step) * step;
                value = Math.max(min, Math.min(max, value));
                
                input.value = value;
                
                // Update visual
                const thumb = track.querySelector('.slider-thumb');
                const fill = track.querySelector('.slider-fill');
                const valueDisplay = track.nextElementSibling;
                
                const percentageDisplay = ((value - min) / (max - min)) * 100;
                
                if (thumb) thumb.style.left = `${percentageDisplay}%`;
                if (fill) fill.style.width = `${percentageDisplay}%`;
                if (valueDisplay) {
                    const setting = this.getSettingFromKey(track.dataset.setting);
                    valueDisplay.textContent = this.formatValue(value, setting?.format) + (setting?.unit || '');
                }
                
                // Update setting
                if (!this.configLocked) {
                    this.updateSetting(this.ui.currentCategory, track.dataset.setting, value);
                }
            };
            
            track.addEventListener('mousedown', (e) => {
                if (this.configLocked) {
                    this.showLockedMessage();
                    return;
                }
                isDragging = true;
                updateSlider(e.clientX);
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    updateSlider(e.clientX);
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
            
            // Touch support
            track.addEventListener('touchstart', (e) => {
                if (this.configLocked) {
                    this.showLockedMessage();
                    return;
                }
                isDragging = true;
                updateSlider(e.touches[0].clientX);
            });
            
            document.addEventListener('touchmove', (e) => {
                if (isDragging) {
                    updateSlider(e.touches[0].clientX);
                }
            });
            
            document.addEventListener('touchend', () => {
                isDragging = false;
            });
        });
        
        // Select controls
        document.querySelectorAll('.select-control').forEach(select => {
            select.addEventListener('change', (e) => {
                if (this.configLocked) {
                    e.preventDefault();
                    this.showLockedMessage();
                    return;
                }
                
                const key = select.dataset.setting;
                const value = select.value;
                
                this.updateSetting(this.ui.currentCategory, key, value);
            });
        });
        
        // Theme selection
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                if (this.configLocked) {
                    this.showLockedMessage();
                    return;
                }
                
                const themeId = card.dataset.theme;
                
                // Update active theme
                document.querySelectorAll('.theme-card').forEach(c => {
                    c.classList.remove('active');
                });
                card.classList.add('active');
                
                // Update setting
                this.updateSetting('visual', 'activeTheme', themeId);
                
                // Apply theme immediately
                this.applyTheme(themeId);
            });
        });
    }

    getSettingFromKey(key) {
        const category = this.settings[this.ui.currentCategory];
        if (!category) return null;
        
        // Search through nested settings
        const search = (obj, path) => {
            for (const [k, v] of Object.entries(obj)) {
                if (k === key && v && typeof v === 'object' && v.type) {
                    return v;
                }
                if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                    const result = search(v, [...path, k]);
                    if (result) return result;
                }
            }
            return null;
        };
        
        return search(category, []);
    }

    // ============ SETTING UPDATES ============
    
    updateSetting(category, key, value) {
        // Save to history before change
        this.saveToHistory(category, key, this.getSettingValue(category, key));
        
        // Update the setting
        this.setSettingValue(category, key, value);
        
        // Apply changes if needed
        this.applySettingChange(category, key, value);
        
        // Update modified count
        this.updateModifiedCount();
        
        // Show status update
        this.showStatusUpdate(`${this.formatSettingName(key)} updated to ${this.formatValue(value)}`);
    }

    getSettingValue(category, key) {
        const categorySettings = this.settings[category];
        if (!categorySettings) return null;
        
        // Handle nested keys
        const keys = key.split('.');
        let current = categorySettings;
        
        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return null;
            }
        }
        
        return current;
    }

    setSettingValue(category, key, value) {
        const categorySettings = this.settings[category];
        if (!categorySettings) return false;
        
        // Handle nested keys
        const keys = key.split('.');
        let current = categorySettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!current[k] || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        
        return true;
    }

    applySettingChange(category, key, value) {
        // Apply specific setting changes
        switch (category) {
            case "visual":
                this.applyVisualSetting(key, value);
                break;
                
            case "physics":
                this.applyPhysicsSetting(key, value);
                break;
                
            case "weather":
                this.applyWeatherSetting(key, value);
                break;
                
            case "vehicle":
                this.applyVehicleSetting(key, value);
                break;
        }
    }

    applyVisualSetting(key, value) {
        if (key === "activeTheme") {
            this.applyTheme(value);
        } else if (key === "glassBlur") {
            this.updateCSSVariable("--glass-blur", `${value}px`);
        } else if (key === "animationSpeed") {
            document.documentElement.style.setProperty('--animation-speed', value);
        }
    }

    applyTheme(themeId) {
        const theme = this.settings.visual.themes[themeId];
        if (!theme) return;
        
        // Apply all CSS variables from theme
        Object.entries(theme.variables).forEach(([variable, value]) => {
            this.updateCSSVariable(variable, value);
        });
        
        // Update active theme in settings
        this.settings.visual.activeTheme = themeId;
        
        // Show notification
        this.showStatusUpdate(`Theme changed to ${theme.name}`);
    }

    updateCSSVariable(variable, value) {
        document.documentElement.style.setProperty(variable, value);
    }

    applyPhysicsSetting(key, value) {
        // Apply physics settings to World 3D if available
        if (typeof window.world3D !== 'undefined') {
            window.world3D.updatePhysicsSetting(key, value);
        }
    }

    applyWeatherSetting(key, value) {
        // Apply weather settings to World 3D if available
        if (typeof window.world3D !== 'undefined') {
            window.world3D.updateWeatherSetting(key, value);
        }
    }

    applyVehicleSetting(key, value) {
        // Apply vehicle settings to World 3D if available
        if (typeof window.world3D !== 'undefined') {
            window.world3D.updateVehicleSetting(key, value);
        }
    }

    // ============ CONFIG EVENTS ============
    
    setupConfigEvents() {
        // Close button
        document.getElementById('configCloseBtn').addEventListener('click', () => this.closeConfig());
        
        // Search functionality
        const searchInput = document.getElementById('configSearch');
        searchInput.addEventListener('input', (e) => this.handleConfigSearch(e.target.value));
        
        document.getElementById('searchClear').addEventListener('click', () => {
            searchInput.value = '';
            this.handleConfigSearch('');
        });
        
        // Lock toggle
        document.getElementById('toggleLock').addEventListener('click', () => this.toggleConfigLock());
        
        // Quick actions
        document.getElementById('saveConfigBtn').addEventListener('click', () => this.saveConfig());
        document.getElementById('resetConfigBtn').addEventListener('click', () => this.resetConfig());
        document.getElementById('exportConfigBtn').addEventListener('click', () => this.exportConfig());
        
        // Expand/Collapse all
        document.getElementById('expandAllBtn').addEventListener('click', () => this.expandAllGroups());
        document.getElementById('collapseAllBtn').addEventListener('click', () => this.collapseAllGroups());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.toggleConfig();
            }
            
            if (e.key === 'Escape' && this.ui.isOpen) {
                this.closeConfig();
            }
        });
    }

    handleConfigSearch(query) {
        if (!query.trim()) {
            // Hide search results and show normal settings
            const searchResults = document.querySelector('.search-results');
            if (searchResults) searchResults.remove();
            
            const settingsContainer = document.getElementById('settingsContainer');
            if (settingsContainer) settingsContainer.style.display = 'block';
            
            return;
        }
        
        // Perform search across all settings
        const results = this.searchSettings(query.toLowerCase());
        this.displaySearchResults(results);
    }

    searchSettings(query) {
        const results = [];
        
        Object.entries(this.settings).forEach(([category, categorySettings]) => {
            this.searchInCategory(category, categorySettings, query, results);
        });
        
        return results;
    }

    searchInCategory(category, settings, query, results, path = []) {
        if (!settings || typeof settings !== 'object') return;
        
        Object.entries(settings).forEach(([key, value]) => {
            const currentPath = [...path, key];
            const fullPath = currentPath.join('.');
            
            // Check if key matches query
            if (key.toLowerCase().includes(query)) {
                results.push({
                    category,
                    path: fullPath,
                    key,
                    value,
                    displayName: this.formatSettingName(key)
                });
            }
            
            // Recursively search nested objects
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                this.searchInCategory(category, value, query, results, currentPath);
            }
        });
    }

    displaySearchResults(results) {
        const settingsContainer = document.getElementById('settingsContainer');
        if (!settingsContainer) return;
        
        // Hide normal settings
        settingsContainer.style.display = 'none';
        
        // Remove existing results
        const existingResults = document.querySelector('.search-results');
        if (existingResults) existingResults.remove();
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No settings found</div>';
        } else {
            results.slice(0, 20).forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.dataset.category = result.category;
                resultItem.dataset.path = result.path;
                
                resultItem.innerHTML = `
                    <div class="result-category">${result.category.toUpperCase()}</div>
                    <div class="result-setting">${result.displayName}</div>
                    <div class="result-path">${result.path}</div>
                `;
                
                resultItem.addEventListener('click', () => {
                    this.navigateToSetting(result.category, result.path);
                });
                
                resultsContainer.appendChild(resultItem);
            });
        }
        
        settingsContainer.parentNode.insertBefore(resultsContainer, settingsContainer.nextSibling);
    }

    navigateToSetting(category, path) {
        // Switch to category
        this.selectCategory(category);
        
        // Clear search
        document.getElementById('configSearch').value = '';
        this.handleConfigSearch('');
        
        // Find and expand the setting group
        const keys = path.split('.');
        const mainKey = keys[0];
        
        // Find and expand the group containing this setting
        const groups = document.querySelectorAll('.setting-group');
        groups.forEach(group => {
            const settingItem = group.querySelector(`[data-setting-key="${mainKey}"]`);
            if (settingItem) {
                const groupHeader = group.querySelector('.group-header');
                const groupContent = group.querySelector('.group-content');
                
                if (groupHeader && groupContent) {
                    groupContent.classList.add('expanded');
                    groupHeader.querySelector('.group-toggle').classList.add('expanded');
                    
                    // Scroll to setting
                    settingItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight setting
                    settingItem.style.background = 'rgba(74, 144, 226, 0.1)';
                    setTimeout(() => {
                        settingItem.style.background = '';
                    }, 2000);
                }
            }
        });
    }

    // ============ CONFIG MANAGEMENT ============
    
    toggleConfigLock() {
        this.configLocked = !this.configLocked;
        
        const lockBtn = document.getElementById('toggleLock');
        const lockStatus = document.getElementById('lockStatus');
        
        if (this.configLocked) {
            lockBtn.classList.remove('unlocked');
            lockBtn.classList.add('locked');
            lockBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12,2 C15,2 17,5 17,7 L17,10 L19,10 L19,20 L5,20 L5,10 L7,10 L7,7 C7,5 9,2 12,2 Z M12,4 C10,4 9,6 9,7 L9,10 L15,10 L15,7 C15,6 14,4 12,4 Z M12,14 C13,14 14,15 14,16 C14,17 13,18 12,18 C11,18 10,17 10,16 C10,15 11,14 12,14 Z" fill="currentColor"/>
                </svg>
                UNLOCK CONFIG
            `;
            lockStatus.textContent = 'YES';
            lockStatus.style.color = '#EF476F';
        } else {
            lockBtn.classList.remove('locked');
            lockBtn.classList.add('unlocked');
            lockBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12,2 C15,2 17,5 17,7 L17,10 L19,10 L19,20 L5,20 L5,10 L7,10 L7,7 C7,5 9,2 12,2 Z M12,14 C13,14 14,15 14,16 C14,17 13,18 12,18 C11,18 10,17 10,16 C10,15 11,14 12,14 Z" fill="currentColor"/>
                </svg>
                LOCK CONFIG
            `;
            lockStatus.textContent = 'NO';
            lockStatus.style.color = '#06D6A0';
        }
        
        // Enable/disable all controls
        this.updateControlsLockState();
        
        this.showStatusUpdate(`Configuration ${this.configLocked ? 'locked' : 'unlocked'}`);
    }

    updateControlsLockState() {
        const controls = document.querySelectorAll('input, select, .slider-track, .theme-card');
        controls.forEach(control => {
            if (control.classList.contains('theme-card') || control.classList.contains('slider-track')) {
                control.style.opacity = this.configLocked ? '0.5' : '1';
                control.style.pointerEvents = this.configLocked ? 'none' : 'auto';
            } else {
                control.disabled = this.configLocked;
            }
        });
    }

    saveConfig() {
        try {
            const configData = {
                settings: this.settings,
                owner: this.ownerName,
                version: this.version,
                savedAt: Date.now()
            };
            
            localStorage.setItem('gami_secret_config', JSON.stringify(configData));
            this.showStatusUpdate('Configuration saved successfully');
            
        } catch (error) {
            console.error('Failed to save configuration:', error);
            this.showStatusUpdate('Failed to save configuration', 'error');
        }
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem('gami_secret_config');
            if (saved) {
                const configData = JSON.parse(saved);
                
                // Merge saved settings with defaults
                this.settings = this.mergeSettings(this.settings, configData.settings);
                
                console.log('Loaded saved configuration');
                this.updateModifiedCount();
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    mergeSettings(defaults, saved) {
        const result = { ...defaults };
        
        Object.keys(saved).forEach(category => {
            if (result[category]) {
                result[category] = this.mergeCategory(result[category], saved[category]);
            }
        });
        
        return result;
    }

    mergeCategory(defaultCategory, savedCategory) {
        if (typeof defaultCategory !== 'object' || typeof savedCategory !== 'object') {
            return savedCategory || defaultCategory;
        }
        
        const result = { ...defaultCategory };
        
        Object.keys(savedCategory).forEach(key => {
            if (typeof savedCategory[key] === 'object' && savedCategory[key] !== null) {
                result[key] = this.mergeCategory(result[key] || {}, savedCategory[key]);
            } else {
                result[key] = savedCategory[key];
            }
        });
        
        return result;
    }

    resetConfig() {
        if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
            return;
        }
        
        // Reset to original defaults
        const originalDefaults = new GAMISecretConfig().settings;
        this.settings = this.mergeSettings(originalDefaults, {});
        
        // Re-apply current theme
        this.applyTheme(this.settings.visual.activeTheme);
        
        // Reload current category
        this.loadCategorySettings(this.ui.currentCategory);
        
        // Clear history
        this.history = [];
        
        this.showStatusUpdate('All settings reset to defaults');
    }

    exportConfig() {
        const configData = {
            settings: this.settings,
            owner: this.ownerName,
            version: this.version,
            exportedAt: Date.now()
        };
        
        const dataStr = JSON.stringify(configData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `gami_config_${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showStatusUpdate('Configuration exported');
    }

    saveToHistory(category, key, oldValue) {
        this.history.push({
            category,
            key,
            oldValue,
            newValue: this.getSettingValue(category, key),
            timestamp: Date.now()
        });
        
        // Keep history size limited
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    updateModifiedCount() {
        const modifiedCount = this.countModifiedSettings();
        const modifiedElement = document.getElementById('modifiedCount');
        if (modifiedElement) {
            modifiedElement.textContent = modifiedCount;
            modifiedElement.style.color = modifiedCount > 0 ? '#FFD700' : '#fff';
        }
    }

    countModifiedSettings() {
        // Compare with defaults to count modified settings
        const defaults = new GAMISecretConfig().settings;
        let count = 0;
        
        const compare = (obj1, obj2, path = []) => {
            for (const key in obj1) {
                if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
                    compare(obj1[key], obj2[key] || {}, [...path, key]);
                } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                    count++;
                }
            }
        };
        
        compare(this.settings, defaults);
        return count;
    }

    // ============ UI CONTROLS ============
    
    expandAllGroups() {
        document.querySelectorAll('.group-content').forEach(content => {
            content.classList.add('expanded');
        });
        document.querySelectorAll('.group-toggle').forEach(toggle => {
            toggle.classList.add('expanded');
        });
    }

    collapseAllGroups() {
        document.querySelectorAll('.group-content').forEach(content => {
            content.classList.remove('expanded');
        });
        document.querySelectorAll('.group-toggle').forEach(toggle => {
            toggle.classList.remove('expanded');
        });
    }

    showStatusUpdate(message, type = 'success') {
        const statusElement = document.getElementById('configStatus');
        const statusText = document.querySelector('.status-text');
        
        if (!statusElement || !statusText) return;
        
        // Update status dot color
        statusElement.style.background = type === 'success' ? '#06D6A0' : 
                                       type === 'error' ? '#EF476F' : '#FFD700';
        
        // Update status text
        statusText.textContent = message;
        statusText.style.color = '#fff';
        
        // Reset after delay
        setTimeout(() => {
            statusText.textContent = 'CONFIG READY';
            statusText.style.color = '#666';
        }, 3000);
    }

    showLockedMessage() {
        this.showStatusUpdate('Configuration is locked', 'error');
    }

    // ============ MENU INTEGRATION ============
    
    addToMainMenu() {
        const mainMenu = document.querySelector('.menu-list');
        if (!mainMenu) {
            console.warn('Main menu not found for config integration');
            return;
        }
        
        // Check if already exists
        if (document.querySelector('.menu-item[data-action="secret_config"]')) {
            return;
        }
        
        const menuItem = document.createElement('li');
        menuItem.className = 'menu-item secret-item';
        menuItem.setAttribute('data-action', 'secret_config');
        menuItem.innerHTML = `
            <svg class="menu-item-icon" width="20" height="20" viewBox="0 0 20 20">
                <path d="M10,2 L18,6 L18,14 L10,18 L2,14 L2,6 L10,2 M6,8 L14,8 M6,12 L14,12" 
                      fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>SECRET CONFIG</span>
        `;
        
        menuItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleConfig();
        });
        
        // Insert at the bottom, before logout
        const logoutItem = mainMenu.querySelector('.logout-button')?.parentElement;
        if (logoutItem) {
            mainMenu.insertBefore(menuItem, logoutItem);
        } else {
            mainMenu.appendChild(menuItem);
        }
    }

    toggleConfig() {
        if (this.ui.isOpen) {
            this.closeConfig();
        } else {
            this.openConfig();
        }
    }

    openConfig() {
        this.ui.container.style.transform = 'translateX(550px)';
        this.ui.isOpen = true;
        
        // Update stats
        this.updateModifiedCount();
    }

    closeConfig() {
        this.ui.container.style.transform = 'translateX(0)';
        this.ui.isOpen = false;
    }

    // ============ MODULE INTEGRATION ============
    
    applyToOtherModules() {
        // Apply settings to other modules when they're available
        setTimeout(() => {
            if (typeof window.world3D !== 'undefined') {
                this.applyPhysicsToWorld3D();
                this.applyWeatherToWorld3D();
                this.applyVehicleToWorld3D();
            }
            
            if (typeof window.economySystem !== 'undefined') {
                this.applySalesToEconomy();
            }
        }, 1000);
    }

    applyPhysicsToWorld3D() {
        const physics = this.settings.physics;
        Object.entries(physics).forEach(([key, value]) => {
            if (typeof window.world3D.updatePhysicsSetting === 'function') {
                window.world3D.updatePhysicsSetting(key, value);
            }
        });
    }

    applyWeatherToWorld3D() {
        const weather = this.settings.weather;
        Object.entries(weather).forEach(([key, value]) => {
            if (typeof window.world3D.updateWeatherSetting === 'function') {
                window.world3D.updateWeatherSetting(key, value);
            }
        });
    }

    applyVehicleToWorld3D() {
        const vehicle = this.settings.vehicle;
        Object.entries(vehicle).forEach(([key, value]) => {
            if (typeof window.world3D.updateVehicleSetting === 'function') {
                window.world3D.updateVehicleSetting(key, value);
            }
        });
    }

    applySalesToEconomy() {
        const sales = this.settings.sales;
        Object.entries(sales).forEach(([key, value]) => {
            if (typeof window.economySystem.updateSalesSetting === 'function') {
                window.economySystem.updateSalesSetting(key, value);
            }
        });
    }

    // ============ PUBLIC API ============
    
    getConfig() {
        return {
            settings: this.settings,
            owner: this.ownerName,
            version: this.version,
            locked: this.configLocked,
            modified: this.countModifiedSettings()
        };
    }

    getSetting(category, key) {
        return this.getSettingValue(category, key);
    }

    updateSettingFromExternal(category, key, value) {
        if (this.configLocked) {
            console.warn('Cannot update setting: Configuration is locked');
            return false;
        }
        
        return this.updateSetting(category, key, value);
    }

    getCurrentTheme() {
        return this.settings.visual.themes[this.settings.visual.activeTheme];
    }

    getAllThemes() {
        return Object.values(this.settings.visual.themes);
    }
}

// Initialize and expose globally
window.GAMISecretConfig = GAMISecretConfig;
window.secretConfig = new GAMISecretConfig();

// Auto-save configuration periodically
setInterval(() => {
    if (window.secretConfig) {
        window.secretConfig.saveConfig();
    }
}, 60000); // Every minute

// Auto-save before page unload
window.addEventListener('beforeunload', () => {
    if (window.secretConfig) {
        window.secretConfig.saveConfig();
    }
});

console.log('GAMI Secret Configuration System loaded - 200 Khufiya Settings ready');