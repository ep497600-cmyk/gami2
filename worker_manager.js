// GAMI WORKER MANAGER - AI Assistant Workforce System
// File: /js/worker_manager.js (Absolute Path)

class GAMIWorkerManager {
    constructor() {
        this.systemName = "AI_WORKFORCE_MANAGER";
        this.version = "3.1.7";
        this.isInitialized = false;
        
        // Worker Types with progressive unlocking
        this.workerTypes = [
            {
                id: 'loader',
                name: 'LOADER',
                cost: 1000n,
                icon: 'loader',
                color: '#FFD166',
                speed: 1,
                capacity: 10,
                unlocked: true,
                description: 'Basic loading worker',
                physics: { mass: 1, friction: 0.8 }
            },
            {
                id: 'transporter',
                name: 'TRANSPORTER',
                cost: 5000n,
                icon: 'truck',
                color: '#06D6A0',
                speed: 1.5,
                capacity: 25,
                unlocked: false,
                description: 'Medium capacity transport',
                physics: { mass: 1.5, friction: 0.7 }
            },
            {
                id: 'distributor',
                name: 'DISTRIBUTOR',
                cost: 25000n,
                icon: 'forklift',
                color: '#118AB2',
                speed: 2,
                capacity: 50,
                unlocked: false,
                description: 'Fast distribution expert',
                physics: { mass: 2, friction: 0.6 }
            },
            {
                id: 'manager',
                name: 'MANAGER',
                cost: 100000n,
                icon: 'manager',
                color: '#EF476F',
                speed: 1.2,
                capacity: 100,
                unlocked: false,
                description: 'Manages multiple workers',
                physics: { mass: 1.2, friction: 0.9 }
            },
            {
                id: 'quantum',
                name: 'QUANTUM',
                cost: 1000000n,
                icon: 'quantum',
                color: '#9D4EDD',
                speed: 3,
                capacity: 500,
                unlocked: false,
                description: 'Quantum logistics unit',
                physics: { mass: 0.5, friction: 0.3 }
            },
            {
                id: 'ai_overlord',
                name: 'AI OVERLORD',
                cost: 1000000000n,
                icon: 'ai',
                color: '#FF0054',
                speed: 5,
                capacity: 1000,
                unlocked: false,
                description: 'Ultimate AI workforce controller',
                physics: { mass: 0.1, friction: 0.1 }
            }
        ];
        
        // Active Workers
        this.activeWorkers = new Map();
        this.workerCounter = 0;
        
        // Worker States
        this.workerStates = {
            IDLE: 'IDLE',
            MOVING_TO_SOURCE: 'MOVING_TO_SOURCE',
            LOADING: 'LOADING',
            MOVING_TO_TARGET: 'MOVING_TO_TARGET',
            UNLOADING: 'UNLOADING',
            RETURNING: 'RETURNING'
        };
        
        // Physics Integration
        this.physicsWorld = null;
        this.world3DConnection = null;
        
        // Stocking System
        this.stocking = {
            sources: [],    // Supply points
            targets: [],    // Store locations
            items: [],      // Available items
            efficiency: 0.8 // Base efficiency
        };
        
        // Menu System
        this.menu = {
            container: null,
            isOpen: false,
            selectedWorker: null
        };
        
        // Economy Connection
        this.economyConnection = null;
        
        // Performance
        this.lastUpdate = 0;
        this.fps = 60;
        
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
        // Connect to economy
        this.connectToEconomy();
        
        // Connect to World 3D
        this.connectToWorld3D();
        
        // Setup menu system
        this.createWorkerMenu();
        
        // Setup stocking system
        this.initializeStockingSystem();
        
        // Load saved workers
        this.loadWorkers();
        
        // Start update loop
        this.startUpdateLoop();
        
        this.isInitialized = true;
        console.log(`${this.systemName} v${this.version} initialized`);
    }

    // ============ MENU SYSTEM ============
    
    createWorkerMenu() {
        // Create menu container
        this.menu.container = document.createElement('div');
        this.menu.container.className = 'worker-menu-container';
        this.menu.container.style.cssText = `
            position: fixed;
            top: 0;
            left: -400px;
            width: 350px;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(30px);
            border-right: 1px solid rgba(255, 255, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s ease;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 20px 0 40px rgba(0, 0, 0, 0.2);
        `;
        
        // Add menu header
        this.menu.container.innerHTML = `
            <div class="worker-menu-header">
                <div class="menu-title">
                    <svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12,2 L20,6 L20,18 L12,22 L4,18 L4,6 Z" 
                              fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M8,10 L16,10 M8,14 L16,14" 
                              fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <h3>AI WORKFORCE</h3>
                </div>
                <button class="menu-close">&times;</button>
            </div>
            <div class="worker-stats">
                <div class="stat-item">
                    <span class="stat-label">ACTIVE WORKERS</span>
                    <span class="stat-value" id="activeWorkerCount">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">TOTAL EFFICIENCY</span>
                    <span class="stat-value" id="totalEfficiency">0%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">ITEMS/HOUR</span>
                    <span class="stat-value" id="itemsPerHour">0</span>
                </div>
            </div>
            <div class="hire-section">
                <h4>HIRE WORKERS</h4>
                <div class="worker-types-list" id="workerTypesList"></div>
            </div>
            <div class="active-workers-section">
                <h4>ACTIVE WORKFORCE</h4>
                <div class="active-workers-list" id="activeWorkersList"></div>
            </div>
            <div class="menu-footer">
                <button class="menu-btn" id="autoHireBtn">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8,0 L16,8 L8,16 L0,8 Z" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    AUTO HIRE
                </button>
                <button class="menu-btn" id="upgradeAllBtn">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M8,0 L16,8 L8,16 M0,8 L16,8" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    UPGRADE ALL
                </button>
            </div>
        `;
        
        document.body.appendChild(this.menu.container);
        
        // Add menu styles
        this.addMenuStyles();
        
        // Setup event listeners
        this.setupMenuEvents();
        
        // Populate worker types
        this.populateWorkerTypes();
        
        // Update active workers list
        this.updateActiveWorkersList();
    }

    addMenuStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .worker-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .menu-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .menu-icon {
                color: var(--accent-color, #4A90E2);
            }
            
            .menu-title h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                letter-spacing: 1px;
            }
            
            .menu-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .menu-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .worker-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .stat-item {
                background: rgba(0, 0, 0, 0.03);
                border-radius: 8px;
                padding: 12px;
                text-align: center;
            }
            
            .stat-label {
                display: block;
                font-family: 'SF Mono', monospace;
                font-size: 9px;
                color: #666;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            
            .stat-value {
                display: block;
                font-family: 'SF Mono', monospace;
                font-size: 14px;
                font-weight: 700;
                color: #333;
            }
            
            .hire-section, .active-workers-section {
                margin-bottom: 24px;
            }
            
            .hire-section h4, .active-workers-section h4 {
                font-size: 12px;
                font-weight: 600;
                color: #666;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin: 0 0 12px 0;
            }
            
            .worker-types-list, .active-workers-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .worker-type-card, .active-worker-card {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .worker-type-card:hover, .active-worker-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            }
            
            .worker-type-card.unlocked {
                border-color: rgba(74, 144, 226, 0.3);
                background: rgba(74, 144, 226, 0.05);
            }
            
            .worker-type-card.locked {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .worker-type-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .worker-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'SF Mono', monospace;
                font-weight: 700;
                font-size: 14px;
                color: #333;
            }
            
            .worker-icon {
                width: 20px;
                height: 20px;
            }
            
            .worker-cost {
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                font-weight: 600;
                color: #FFD700;
            }
            
            .worker-stats-row {
                display: flex;
                gap: 16px;
                margin-bottom: 8px;
            }
            
            .worker-stat {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                color: #666;
            }
            
            .worker-stat svg {
                width: 12px;
                height: 12px;
            }
            
            .worker-description {
                font-size: 11px;
                color: #888;
                line-height: 1.4;
            }
            
            .hire-btn {
                width: 100%;
                padding: 8px;
                margin-top: 8px;
                background: rgba(74, 144, 226, 0.1);
                border: 1px solid rgba(74, 144, 226, 0.3);
                border-radius: 6px;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                font-weight: 600;
                color: #4A90E2;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .hire-btn:hover:not(:disabled) {
                background: rgba(74, 144, 226, 0.2);
                transform: translateY(-1px);
            }
            
            .hire-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .worker-status {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 10px;
                font-family: 'SF Mono', monospace;
                font-size: 9px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-left: 8px;
            }
            
            .status-idle { background: rgba(255, 215, 0, 0.1); color: #FFD700; }
            .status-loading { background: rgba(74, 144, 226, 0.1); color: #4A90E2; }
            .status-moving { background: rgba(6, 214, 160, 0.1); color: #06D6A0; }
            .status-unloading { background: rgba(239, 71, 111, 0.1); color: #EF476F; }
            
            .menu-footer {
                display: flex;
                gap: 8px;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .menu-btn {
                flex: 1;
                padding: 12px;
                background: rgba(0, 0, 0, 0.03);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                font-weight: 600;
                color: #333;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.3s ease;
            }
            
            .menu-btn:hover {
                background: rgba(0, 0, 0, 0.05);
                transform: translateY(-2px);
            }
            
            .menu-btn svg {
                width: 16px;
                height: 16px;
            }
            
            .worker-type-card.locked .worker-cost {
                color: #666;
            }
        `;
        
        document.head.appendChild(style);
    }

    setupMenuEvents() {
        // Close button
        const closeBtn = this.menu.container.querySelector('.menu-close');
        closeBtn.addEventListener('click', () => this.closeMenu());
        
        // Auto hire button
        const autoHireBtn = document.getElementById('autoHireBtn');
        autoHireBtn.addEventListener('click', () => this.autoHireOptimal());
        
        // Upgrade all button
        const upgradeAllBtn = document.getElementById('upgradeAllBtn');
        upgradeAllBtn.addEventListener('click', () => this.upgradeAllWorkers());
        
        // Add to 3-line menu
        this.addToMainMenu();
    }

    addToMainMenu() {
        // Find the 3-line menu
        const mainMenu = document.querySelector('.menu-list');
        if (!mainMenu) {
            // Try to find menu by ID
            const menuList = document.getElementById('menuList') || 
                            document.querySelector('.side-menu .menu-list');
            if (menuList) {
                this.addWorkerMenuItem(menuList);
            }
        } else {
            this.addWorkerMenuItem(mainMenu);
        }
    }

    addWorkerMenuItem(menuList) {
        // Check if worker menu item already exists
        if (document.querySelector('.menu-item[data-action="workers"]')) {
            return;
        }
        
        const workerMenuItem = document.createElement('li');
        workerMenuItem.className = 'menu-item';
        workerMenuItem.setAttribute('data-action', 'workers');
        workerMenuItem.innerHTML = `
            <svg class="menu-item-icon" width="20" height="20" viewBox="0 0 20 20">
                <path d="M10,0 L20,6 L20,14 L10,20 L0,14 L0,6 L10,0 M6,8 L14,8 M6,12 L14,12" 
                      fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>WORKFORCE</span>
        `;
        
        workerMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });
        
        // Add to menu (near bottom but above logout)
        const logoutItem = menuList.querySelector('.logout-button')?.parentElement;
        if (logoutItem) {
            menuList.insertBefore(workerMenuItem, logoutItem);
        } else {
            menuList.appendChild(workerMenuItem);
        }
    }

    // ============ WORKER MANAGEMENT ============
    
    populateWorkerTypes() {
        const listContainer = document.getElementById('workerTypesList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        this.workerTypes.forEach(workerType => {
            const card = document.createElement('div');
            card.className = `worker-type-card ${workerType.unlocked ? 'unlocked' : 'locked'}`;
            card.dataset.workerId = workerType.id;
            
            const canAfford = this.canAffordWorker(workerType.cost);
            const hireButton = workerType.unlocked ? `
                <button class="hire-btn" ${!canAfford ? 'disabled' : ''}>
                    HIRE - ${this.formatCurrency(workerType.cost)}
                </button>
            ` : `
                <div class="worker-description">
                    Unlock at ${this.formatCurrency(workerType.cost)}
                </div>
            `;
            
            card.innerHTML = `
                <div class="worker-type-header">
                    <div class="worker-name">
                        <div class="worker-icon" style="color: ${workerType.color}">
                            ${this.getWorkerIcon(workerType.icon)}
                        </div>
                        ${workerType.name}
                    </div>
                    <div class="worker-cost">${this.formatCurrency(workerType.cost)}</div>
                </div>
                <div class="worker-stats-row">
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M10,2 L10,10 L14,14" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        ${workerType.speed}x
                    </div>
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8,8 L12,12 M12,8 L8,12" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        ${workerType.capacity}
                    </div>
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <circle cx="10" cy="10" r="3" fill="currentColor"/>
                        </svg>
                        ${workerType.physics.mass}kg
                    </div>
                </div>
                <div class="worker-description">${workerType.description}</div>
                ${hireButton}
            `;
            
            // Add hire event listener
            if (workerType.unlocked) {
                const hireBtn = card.querySelector('.hire-btn');
                if (hireBtn && canAfford) {
                    hireBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.hireWorker(workerType.id);
                    });
                }
            }
            
            // Add selection event
            card.addEventListener('click', () => {
                if (workerType.unlocked) {
                    this.selectWorkerType(workerType.id);
                }
            });
            
            listContainer.appendChild(card);
        });
    }

    getWorkerIcon(iconType) {
        const icons = {
            loader: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect x="20" y="40" width="60" height="20" rx="4" fill="currentColor" opacity="0.8"/>
                    <rect x="30" y="30" width="40" height="10" rx="2" fill="currentColor" opacity="0.6"/>
                    <circle cx="30" cy="70" r="8" fill="currentColor" opacity="0.4"/>
                    <circle cx="70" cy="70" r="8" fill="currentColor" opacity="0.4"/>
                </svg>
            `,
            truck: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect x="10" y="40" width="70" height="25" rx="5" fill="currentColor" opacity="0.8"/>
                    <rect x="15" y="30" width="50" height="15" rx="3" fill="currentColor" opacity="0.6"/>
                    <circle cx="25" cy="70" r="10" fill="currentColor" opacity="0.4"/>
                    <circle cx="65" cy="70" r="10" fill="currentColor" opacity="0.4"/>
                </svg>
            `,
            forklift: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect x="20" y="50" width="40" height="15" rx="3" fill="currentColor" opacity="0.8"/>
                    <rect x="25" y="40" width="20" height="10" rx="2" fill="currentColor" opacity="0.6"/>
                    <rect x="10" y="65" width="60" height="5" fill="currentColor" opacity="0.4"/>
                    <circle cx="25" cy="70" r="5" fill="currentColor" opacity="0.3"/>
                    <circle cx="55" cy="70" r="5" fill="currentColor" opacity="0.3"/>
                </svg>
            `,
            manager: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="30" r="15" fill="currentColor" opacity="0.8"/>
                    <rect x="35" y="45" width="30" height="40" rx="5" fill="currentColor" opacity="0.6"/>
                    <rect x="40" y="55" width="20" height="20" rx="3" fill="currentColor" opacity="0.4"/>
                </svg>
            `,
            quantum: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="3" opacity="0.8"/>
                    <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6">
                        <animate attributeName="r" values="10;15;10" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.4">
                        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            `,
            ai: `
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <path d="M30,30 L70,30 L85,50 L70,70 L30,70 L15,50 Z" 
                          fill="currentColor" opacity="0.8"/>
                    <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.4">
                        <animate attributeName="r" values="10;12;10" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="50" cy="50" r="4" fill="white" opacity="0.8"/>
                </svg>
            `
        };
        
        return icons[iconType] || icons.loader;
    }

    hireWorker(workerTypeId) {
        const workerType = this.workerTypes.find(w => w.id === workerTypeId);
        if (!workerType || !workerType.unlocked) {
            return { success: false, error: 'WORKER_TYPE_LOCKED' };
        }
        
        // Check if we can afford it
        if (!this.canAffordWorker(workerType.cost)) {
            return { success: false, error: 'INSUFFICIENT_FUNDS' };
        }
        
        // Deduct cost
        if (this.economyConnection) {
            this.economyConnection.removeCoins(workerType.cost);
        }
        
        // Create worker instance
        const workerId = `worker_${Date.now()}_${this.workerCounter++}`;
        const worker = {
            id: workerId,
            type: workerTypeId,
            name: `${workerType.name} #${this.workerCounter}`,
            state: this.workerStates.IDLE,
            position: { x: 100, y: 100 },
            target: null,
            inventory: 0,
            capacity: workerType.capacity,
            speed: workerType.speed,
            efficiency: 1.0,
            physics: { ...workerType.physics },
            color: workerType.color,
            experience: 0,
            level: 1,
            hiredAt: Date.now()
        };
        
        // Add to active workers
        this.activeWorkers.set(workerId, worker);
        
        // Create visual representation in World 3D
        this.createWorkerVisual(worker);
        
        // Assign initial task
        this.assignTask(workerId);
        
        // Update menu
        this.updateActiveWorkersList();
        this.updateStats();
        
        console.log(`Hired ${worker.name} for ${this.formatCurrency(workerType.cost)}`);
        
        return { 
            success: true, 
            workerId: workerId,
            worker: worker,
            cost: workerType.cost
        };
    }

    createWorkerVisual(worker) {
        if (!this.world3DConnection) return;
        
        // Create worker element in 3D world
        const workerElement = document.createElement('div');
        workerElement.className = 'ai-worker';
        workerElement.id = `worker_${worker.id}`;
        
        workerElement.innerHTML = `
            <svg viewBox="0 0 100 100" width="40" height="40">
                <defs>
                    <radialGradient id="workerGradient_${worker.id}">
                        <stop offset="0%" stop-color="${worker.color}" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="${worker.color}" stop-opacity="0.3"/>
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#workerGradient_${worker.id})"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="2" stroke-opacity="0.3"/>
                <text x="50" y="55" text-anchor="middle" font-family="'SF Mono', monospace" 
                      font-size="24" font-weight="bold" fill="white" opacity="0.8">${worker.name.charAt(0)}</text>
            </svg>
            <div class="worker-status-indicator"></div>
        `;
        
        workerElement.style.cssText = `
            position: absolute;
            left: ${worker.position.x}px;
            top: ${worker.position.y}px;
            width: 40px;
            height: 40px;
            z-index: 100;
            pointer-events: none;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            transition: transform 0.1s linear;
        `;
        
        // Add to game canvas container
        const gameContainer = document.getElementById('gameCanvas')?.parentElement;
        if (gameContainer) {
            gameContainer.appendChild(workerElement);
        }
        
        // Store reference
        worker.element = workerElement;
    }

    updateWorkerVisual(worker) {
        if (!worker.element) return;
        
        // Update position
        worker.element.style.left = `${worker.position.x}px`;
        worker.element.style.top = `${worker.position.y}px`;
        
        // Update status indicator
        const indicator = worker.element.querySelector('.worker-status-indicator');
        if (indicator) {
            let color = '#888';
            switch (worker.state) {
                case this.workerStates.IDLE: color = '#FFD700'; break;
                case this.workerStates.LOADING: color = '#4A90E2'; break;
                case this.workerStates.MOVING_TO_SOURCE: 
                case this.workerStates.MOVING_TO_TARGET: color = '#06D6A0'; break;
                case this.workerStates.UNLOADING: color = '#EF476F'; break;
            }
            
            indicator.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                width: 10px;
                height: 10px;
                background: ${color};
                border-radius: 50%;
                border: 2px solid white;
                animation: pulse 1s infinite;
            `;
        }
        
        // Add pulsing animation for status
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
            }
        `;
        
        if (!document.querySelector('#workerAnimations')) {
            style.id = 'workerAnimations';
            document.head.appendChild(style);
        }
    }

    // ============ TASK MANAGEMENT ============
    
    assignTask(workerId) {
        const worker = this.activeWorkers.get(workerId);
        if (!worker) return;
        
        // Find available source and target
        const source = this.findNearestSource(worker.position);
        const target = this.findNearestTarget(worker.position);
        
        if (!source || !target) {
            worker.state = this.workerStates.IDLE;
            return;
        }
        
        worker.task = {
            source: source,
            target: target,
            assignedAt: Date.now()
        };
        
        worker.state = this.workerStates.MOVING_TO_SOURCE;
        worker.target = source.position;
        
        console.log(`Assigned task to ${worker.name}: ${source.name} -> ${target.name}`);
    }

    findNearestSource(position) {
        if (this.stocking.sources.length === 0) {
            // Create default sources if none exist
            this.createDefaultStockingPoints();
        }
        
        return this.stocking.sources.reduce((nearest, source) => {
            const distance = this.calculateDistance(position, source.position);
            if (!nearest || distance < nearest.distance) {
                return { ...source, distance };
            }
            return nearest;
        }, null);
    }

    findNearestTarget(position) {
        if (this.stocking.targets.length === 0) {
            // Create default targets if none exist
            this.createDefaultStockingPoints();
        }
        
        return this.stocking.targets.reduce((nearest, target) => {
            const distance = this.calculateDistance(position, target.position);
            if (!nearest || distance < nearest.distance) {
                return { ...target, distance };
            }
            return nearest;
        }, null);
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }

    // ============ STOCKING SYSTEM ============
    
    initializeStockingSystem() {
        this.createDefaultStockingPoints();
        this.generateStockItems();
    }

    createDefaultStockingPoints() {
        // Default warehouse positions
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const width = canvas.width || 800;
        const height = canvas.height || 600;
        
        // Sources (warehouses/supply points)
        this.stocking.sources = [
            {
                id: 'warehouse_north',
                name: 'NORTH WAREHOUSE',
                position: { x: width * 0.2, y: height * 0.2 },
                capacity: 1000,
                stock: 500,
                type: 'source',
                color: '#4A90E2'
            },
            {
                id: 'warehouse_east',
                name: 'EAST WAREHOUSE',
                position: { x: width * 0.8, y: height * 0.3 },
                capacity: 1000,
                stock: 500,
                type: 'source',
                color: '#06D6A0'
            },
            {
                id: 'warehouse_south',
                name: 'SOUTH WAREHOUSE',
                position: { x: width * 0.3, y: height * 0.8 },
                capacity: 1000,
                stock: 500,
                type: 'source',
                color: '#9D4EDD'
            }
        ];
        
        // Targets (stores/shops)
        this.stocking.targets = [
            {
                id: 'store_center',
                name: 'CENTRAL STORE',
                position: { x: width * 0.5, y: height * 0.5 },
                capacity: 500,
                stock: 100,
                type: 'target',
                color: '#FFD700'
            },
            {
                id: 'store_northwest',
                name: 'NW STORE',
                position: { x: width * 0.4, y: height * 0.4 },
                capacity: 500,
                stock: 100,
                type: 'target',
                color: '#EF476F'
            },
            {
                id: 'store_southeast',
                name: 'SE STORE',
                position: { x: width * 0.6, y: height * 0.6 },
                capacity: 500,
                stock: 100,
                type: 'target',
                color: '#118AB2'
            }
        ];
    }

    generateStockItems() {
        this.stocking.items = [
            { id: 'item_1', name: 'ELECTRONICS', value: 100, weight: 1 },
            { id: 'item_2', name: 'APPAREL', value: 50, weight: 0.5 },
            { id: 'item_3', name: 'GROCERIES', value: 20, weight: 2 },
            { id: 'item_4', name: 'FURNITURE', value: 200, weight: 5 },
            { id: 'item_5', name: 'BOOKS', value: 30, weight: 0.3 }
        ];
    }

    // ============ PHYSICS INTEGRATION ============
    
    connectToWorld3D() {
        if (typeof window.world3D !== 'undefined') {
            this.world3DConnection = window.world3D;
            console.log('Worker Manager connected to World 3D');
        } else {
            console.warn('World 3D not available, using simulated physics');
        }
    }

    updateWorkerPhysics(worker, deltaTime) {
        if (!worker.target) return;
        
        const target = worker.target;
        const current = worker.position;
        
        // Calculate direction vector
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            // Reached target
            this.handleTargetReached(worker);
            return;
        }
        
        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Apply speed with physics
        const speed = worker.speed * 2; // pixels per second
        const movement = speed * (deltaTime / 1000);
        
        // Apply friction
        const friction = 1 - (worker.physics.friction * 0.1);
        
        // Update position
        worker.position.x += dirX * movement * friction;
        worker.position.y += dirY * movement * friction;
        
        // Apply World 3D physics if connected
        if (this.world3DConnection) {
            this.applyWorld3DPhysics(worker);
        }
        
        // Update visual
        this.updateWorkerVisual(worker);
    }

    applyWorld3DPhysics(worker) {
        // Integrate with World 3D terrain
        const world = this.world3DConnection;
        
        if (world && world.terrain && world.terrain.heightMap) {
            // Get terrain height at worker position
            const normalizedX = worker.position.x / (world.canvas?.width || 800);
            const normalizedY = worker.position.y / (world.canvas?.height || 600);
            
            // Adjust speed based on terrain
            const terrainHeight = this.getTerrainHeight(normalizedX, normalizedY);
            const terrainEffect = 1 - (terrainHeight * 0.1); // Higher terrain = slower
            
            worker.speed *= terrainEffect;
            
            // Create footprint effect in World 3D
            if (Math.random() > 0.95) {
                world.createFootprintEffect(worker.position.x, worker.position.y);
            }
        }
    }

    getTerrainHeight(x, y) {
        // Simulated terrain height lookup
        if (!this.world3DConnection || !this.world3DConnection.terrain) {
            return Math.sin(x * 10) * Math.cos(y * 10) * 0.5 + 0.5;
        }
        
        return 0.5; // Default
    }

    handleTargetReached(worker) {
        switch (worker.state) {
            case this.workerStates.MOVING_TO_SOURCE:
                worker.state = this.workerStates.LOADING;
                worker.loadingStart = Date.now();
                break;
                
            case this.workerStates.MOVING_TO_TARGET:
                worker.state = this.workerStates.UNLOADING;
                worker.unloadingStart = Date.now();
                break;
        }
    }

    // ============ UPDATE LOOP ============
    
    startUpdateLoop() {
        let lastTime = 0;
        
        const update = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update all workers
            this.activeWorkers.forEach((worker, workerId) => {
                this.updateWorkerState(worker, deltaTime);
            });
            
            // Update stocking points
            this.updateStockingSystem(deltaTime);
            
            // Update stats every second
            if (currentTime - this.lastUpdate > 1000) {
                this.updateStats();
                this.lastUpdate = currentTime;
            }
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    }

    updateWorkerState(worker, deltaTime) {
        switch (worker.state) {
            case this.workerStates.MOVING_TO_SOURCE:
            case this.workerStates.MOVING_TO_TARGET:
                this.updateWorkerPhysics(worker, deltaTime);
                break;
                
            case this.workerStates.LOADING:
                this.processLoading(worker, deltaTime);
                break;
                
            case this.workerStates.UNLOADING:
                this.processUnloading(worker, deltaTime);
                break;
                
            case this.workerStates.IDLE:
                this.assignTask(worker.id);
                break;
        }
    }

    processLoading(worker, deltaTime) {
        const loadingTime = 2000; // 2 seconds to load
        const elapsed = Date.now() - worker.loadingStart;
        
        if (elapsed >= loadingTime) {
            // Load items
            const source = worker.task?.source;
            if (source && source.stock > 0) {
                const loadAmount = Math.min(worker.capacity, source.stock);
                worker.inventory = loadAmount;
                source.stock -= loadAmount;
                
                worker.state = this.workerStates.MOVING_TO_TARGET;
                worker.target = worker.task?.target?.position;
                
                console.log(`${worker.name} loaded ${loadAmount} items`);
            } else {
                // Source empty, find new source
                this.assignTask(worker.id);
            }
        }
    }

    processUnloading(worker, deltaTime) {
        const unloadingTime = 1500; // 1.5 seconds to unload
        const elapsed = Date.now() - worker.unloadingStart;
        
        if (elapsed >= unloadingTime) {
            // Unload items
            const target = worker.task?.target;
            if (target && worker.inventory > 0) {
                const unloadAmount = worker.inventory;
                target.stock += unloadAmount;
                worker.inventory = 0;
                
                // Add economy reward
                this.addStockingReward(unloadAmount);
                
                // Gain experience
                worker.experience += unloadAmount;
                this.checkLevelUp(worker);
                
                // Return to source or get new task
                worker.state = this.workerStates.MOVING_TO_SOURCE;
                worker.target = worker.task?.source?.position;
                
                console.log(`${worker.name} unloaded ${unloadAmount} items`);
            } else {
                this.assignTask(worker.id);
            }
        }
    }

    addStockingReward(amount) {
        if (!this.economyConnection) return;
        
        const reward = BigInt(amount) * 10n; // 10 coins per item
        this.economyConnection.addCoins(reward, 'stocking_reward');
        
        // Show reward notification
        this.showWorkerNotification(`Stocking Reward: +${amount}0 coins`);
    }

    showWorkerNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'worker-notification';
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 12px 20px;
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            color: #06D6A0;
            z-index: 9999;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    checkLevelUp(worker) {
        const expNeeded = worker.level * 100;
        if (worker.experience >= expNeeded) {
            worker.level++;
            worker.speed *= 1.1; // 10% speed increase
            worker.capacity = Math.floor(worker.capacity * 1.2); // 20% capacity increase
            
            this.showWorkerNotification(`${worker.name} reached Level ${worker.level}!`);
        }
    }

    updateStockingSystem(deltaTime) {
        // Replenish sources over time
        this.stocking.sources.forEach(source => {
            if (source.stock < source.capacity) {
                const replenishRate = 0.1; // items per second
                source.stock = Math.min(
                    source.capacity,
                    source.stock + replenishRate * (deltaTime / 1000)
                );
            }
        });
    }

    // ============ MENU UPDATES ============
    
    updateActiveWorkersList() {
        const listContainer = document.getElementById('activeWorkersList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        if (this.activeWorkers.size === 0) {
            listContainer.innerHTML = `
                <div class="no-workers">
                    <svg width="40" height="40" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="rgba(0,0,0,0.05)"/>
                        <path d="M30,40 L70,60 M70,40 L30,60" stroke="rgba(0,0,0,0.2)" stroke-width="4"/>
                    </svg>
                    <div>No active workers</div>
                </div>
            `;
            return;
        }
        
        this.activeWorkers.forEach(worker => {
            const card = document.createElement('div');
            card.className = 'active-worker-card';
            card.dataset.workerId = worker.id;
            
            const statusText = this.getStatusText(worker.state);
            const statusClass = `status-${worker.state.toLowerCase().replace(/_/g, '-')}`;
            
            card.innerHTML = `
                <div class="worker-type-header">
                    <div class="worker-name" style="color: ${worker.color}">
                        <div class="worker-icon">
                            ${this.getWorkerIcon(this.getWorkerType(worker.type).icon)}
                        </div>
                        ${worker.name}
                        <span class="worker-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="worker-cost">Lv.${worker.level}</div>
                </div>
                <div class="worker-stats-row">
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M10,2 L10,10 L14,14" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        ${worker.speed.toFixed(1)}x
                    </div>
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
                            <text x="10" y="13" text-anchor="middle" font-size="8" fill="currentColor">${worker.inventory}/${worker.capacity}</text>
                        </svg>
                        ${worker.inventory}/${worker.capacity}
                    </div>
                    <div class="worker-stat">
                        <svg viewBox="0 0 20 20" width="12" height="12">
                            <path d="M5,15 L15,5 M15,15 L5,5" fill="none" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        ${Math.floor(worker.efficiency * 100)}%
                    </div>
                </div>
                <div class="worker-description">
                    Experience: ${worker.experience}/${worker.level * 100}
                </div>
            `;
            
            // Add click event to select worker
            card.addEventListener('click', () => {
                this.selectActiveWorker(worker.id);
            });
            
            listContainer.appendChild(card);
        });
    }

    getStatusText(state) {
        const statusMap = {
            [this.workerStates.IDLE]: 'IDLE',
            [this.workerStates.MOVING_TO_SOURCE]: 'TO SOURCE',
            [this.workerStates.LOADING]: 'LOADING',
            [this.workerStates.MOVING_TO_TARGET]: 'TO STORE',
            [this.workerStates.UNLOADING]: 'UNLOADING',
            [this.workerStates.RETURNING]: 'RETURNING'
        };
        
        return statusMap[state] || 'UNKNOWN';
    }

    getWorkerType(typeId) {
        return this.workerTypes.find(w => w.id === typeId) || this.workerTypes[0];
    }

    updateStats() {
        const activeCount = document.getElementById('activeWorkerCount');
        const totalEfficiency = document.getElementById('totalEfficiency');
        const itemsPerHour = document.getElementById('itemsPerHour');
        
        if (activeCount) {
            activeCount.textContent = this.activeWorkers.size.toString();
        }
        
        if (totalEfficiency) {
            let avgEfficiency = 0;
            this.activeWorkers.forEach(worker => {
                avgEfficiency += worker.efficiency;
            });
            avgEfficiency = this.activeWorkers.size > 0 ? avgEfficiency / this.activeWorkers.size : 0;
            totalEfficiency.textContent = `${Math.floor(avgEfficiency * 100)}%`;
        }
        
        if (itemsPerHour) {
            // Calculate items per hour based on worker activity
            let totalItems = 0;
            this.activeWorkers.forEach(worker => {
                if (worker.state === this.workerStates.UNLOADING || 
                    worker.state === this.workerStates.MOVING_TO_TARGET) {
                    totalItems += worker.inventory;
                }
            });
            
            // Estimate hourly rate
            const itemsPerSecond = totalItems * 0.1; // Simplified calculation
            const hourlyEstimate = Math.floor(itemsPerSecond * 3600);
            itemsPerHour.textContent = hourlyEstimate.toLocaleString();
        }
    }

    // ============ UTILITY FUNCTIONS ============
    
    canAffordWorker(cost) {
        if (!this.economyConnection) return true; // For testing
        return this.economyConnection.getBalance() >= cost;
    }

    formatCurrency(amount) {
        if (typeof amount === 'bigint') {
            if (amount >= 1000000000n) return `${(Number(amount) / 1000000000).toFixed(1)}B`;
            if (amount >= 1000000n) return `${(Number(amount) / 1000000).toFixed(1)}M`;
            if (amount >= 1000n) return `${(Number(amount) / 1000).toFixed(1)}K`;
            return amount.toString();
        }
        return amount.toString();
    }

    selectWorkerType(workerTypeId) {
        this.menu.selectedWorker = workerTypeId;
        
        // Highlight selected card
        document.querySelectorAll('.worker-type-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.workerId === workerTypeId) {
                card.classList.add('selected');
                card.style.borderColor = '#4A90E2';
                card.style.boxShadow = '0 0 0 2px rgba(74, 144, 226, 0.3)';
            }
        });
    }

    selectActiveWorker(workerId) {
        // Center view on worker
        const worker = this.activeWorkers.get(workerId);
        if (worker && this.world3DConnection) {
            // Focus camera on worker (if supported by World 3D)
            this.showWorkerNotification(`Viewing ${worker.name}`);
        }
    }

    autoHireOptimal() {
        // Hire the best affordable worker
        const affordableWorkers = this.workerTypes
            .filter(worker => worker.unlocked && this.canAffordWorker(worker.cost))
            .sort((a, b) => Number(b.capacity) - Number(a.capacity));
        
        if (affordableWorkers.length > 0) {
            this.hireWorker(affordableWorkers[0].id);
        } else {
            this.showWorkerNotification('Cannot afford any workers');
        }
    }

    upgradeAllWorkers() {
        // Upgrade all workers by 10% efficiency
        let upgraded = 0;
        this.activeWorkers.forEach(worker => {
            if (worker.efficiency < 2.0) { // Cap at 200%
                worker.efficiency *= 1.1;
                upgraded++;
            }
        });
        
        if (upgraded > 0) {
            this.showWorkerNotification(`Upgraded ${upgraded} workers (+10% efficiency)`);
        }
    }

    // ============ MENU CONTROLS ============
    
    toggleMenu() {
        if (this.menu.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.menu.container.style.transform = 'translateX(400px)';
        this.menu.isOpen = true;
        
        // Update lists
        this.populateWorkerTypes();
        this.updateActiveWorkersList();
        this.updateStats();
    }

    closeMenu() {
        this.menu.container.style.transform = 'translateX(0)';
        this.menu.isOpen = false;
    }

    // ============ ECONOMY CONNECTION ============
    
    connectToEconomy() {
        if (typeof window.economySystem !== 'undefined') {
            this.economyConnection = window.economySystem;
            console.log('Worker Manager connected to Economy System');
            
            // Listen for economy updates to unlock workers
            document.addEventListener('economyUpdate', (event) => {
                this.checkWorkerUnlocks(event.detail.coins);
            });
        }
    }

    checkWorkerUnlocks(currentCoins) {
        this.workerTypes.forEach(worker => {
            if (!worker.unlocked && currentCoins >= worker.cost) {
                worker.unlocked = true;
                this.populateWorkerTypes(); // Refresh UI
                this.showWorkerNotification(`Unlocked: ${worker.name}!`);
            }
        });
    }

    // ============ DATA PERSISTENCE ============
    
    saveWorkers() {
        try {
            const workersData = Array.from(this.activeWorkers.values()).map(worker => ({
                ...worker,
                element: undefined // Don't save DOM element
            }));
            
            localStorage.setItem('gami_workers_data', JSON.stringify({
                workers: workersData,
                workerCounter: this.workerCounter,
                savedAt: Date.now()
            }));
        } catch (error) {
            console.error('Failed to save workers data:', error);
        }
    }

    loadWorkers() {
        try {
            const saved = localStorage.getItem('gami_workers_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.workerCounter = data.workerCounter || 0;
                
                // Recreate workers
                data.workers?.forEach(workerData => {
                    const worker = {
                        ...workerData,
                        element: null
                    };
                    
                    this.activeWorkers.set(worker.id, worker);
                    this.createWorkerVisual(worker);
                    this.assignTask(worker.id);
                });
                
                console.log(`Loaded ${this.activeWorkers.size} workers`);
            }
        } catch (error) {
            console.error('Failed to load workers data:', error);
        }
    }

    // ============ PUBLIC API ============
    
    getWorkforceStats() {
        return {
            totalWorkers: this.activeWorkers.size,
            unlockedTypes: this.workerTypes.filter(w => w.unlocked).length,
            totalEfficiency: this.calculateTotalEfficiency(),
            itemsProcessed: this.calculateItemsProcessed(),
            workforceValue: this.calculateWorkforceValue()
        };
    }

    calculateTotalEfficiency() {
        let total = 0;
        this.activeWorkers.forEach(worker => total += worker.efficiency);
        return this.activeWorkers.size > 0 ? total / this.activeWorkers.size : 0;
    }

    calculateItemsProcessed() {
        let total = 0;
        this.activeWorkers.forEach(worker => total += worker.experience);
        return total;
    }

    calculateWorkforceValue() {
        let total = 0n;
        this.activeWorkers.forEach(worker => {
            const type = this.getWorkerType(worker.type);
            total += type.cost;
        });
        return total;
    }

    getActiveWorkers() {
        return Array.from(this.activeWorkers.values());
    }

    forceUpdate() {
        this.updateActiveWorkersList();
        this.updateStats();
        this.populateWorkerTypes();
    }
}

// Initialize and expose globally
window.GAMIWorkerManager = GAMIWorkerManager;
window.workerManager = new GAMIWorkerManager();

// Auto-save workers periodically
setInterval(() => {
    if (window.workerManager) {
        window.workerManager.saveWorkers();
    }
}, 30000); // Every 30 seconds

// Auto-save before page unload
window.addEventListener('beforeunload', () => {
    if (window.workerManager) {
        window.workerManager.saveWorkers();
    }
});

console.log('GAMI Worker Manager loaded - AI Workforce System ready');