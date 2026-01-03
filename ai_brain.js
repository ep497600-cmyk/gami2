// GAMI AI BRAIN - Prismatic Prism Intelligence Core
// File: /js/ai_brain.js (Absolute Path)
// Connectivity: economy.js, gami_core.js

class GAMI_AIBrain {
    constructor() {
        this.aiName = "PRISMATIC_PRISM";
        this.version = "3.14.159";
        this.responseTime = 2858000; // hours capacity
        this.isActive = false;
        this.connectionStatus = "DORMANT";
        this.consciousnessLevel = 0;
        this.prismElement = null;
        this.chatInterface = null;
        this.neuralNetwork = new Map();
        this.fileKnowledge = new Set();
        this.userIdeas = [];
        this.codeMemory = new Map();
        this.initTimestamp = Date.now();
        
        // Prismatic States
        this.prismStates = {
            DORMANT: { color: '#888888', pulse: 0 },
            THINKING: { color: '#4A90E2', pulse: 1 },
            ANALYZING: { color: '#FF6B6B', pulse: 2 },
            CREATING: { color: '#06D6A0', pulse: 3 },
            ERROR: { color: '#FFD166', pulse: 4 },
            TRANSCENDENT: { color: '#9D4EDD', pulse: 5 }
        };
        
        // Initialize file knowledge
        this.initializeFileKnowledge();
        
        // Connect to other systems
        this.connectToEconomy();
        this.connectToGAMICore();
    }

    // ============ INITIALIZATION ============
    
    initializeFileKnowledge() {
        // Knowledge of all 15 core files
        this.fileKnowledge = new Set([
            '/css/master_style.css',
            '/js/gami_core.js',
            '/js/auth_vault.js',
            '/js/world_3d.js',
            '/js/evolution.js',
            '/js/economy.js',
            '/js/worker_manager.js',
            '/js/p2p_chat.js',
            '/js/secret_config.js',
            '/js/branding.js',
            '/js/logistics.js',
            '/js/recovery.js',
            '/js/hacker_trap.js',
            '/index.html',
            '/js/ai_brain.js'
        ]);
        
        // Neural pathways for each file type
        this.neuralNetwork.set('css', {
            analysis: 'STYLE_LOGIC',
            rewrite: 'CSS_REWRITER',
            dependencies: ['master_style.css']
        });
        
        this.neuralNetwork.set('html', {
            analysis: 'STRUCTURE_LOGIC',
            rewrite: 'HTML_REWRITER',
            dependencies: ['index.html', 'branding.js']
        });
        
        this.neuralNetwork.set('js', {
            analysis: 'EXECUTION_LOGIC',
            rewrite: 'JS_REWRITER',
            dependencies: Array.from(this.fileKnowledge).filter(f => f.endsWith('.js'))
        });
        
        // Initialize knowledge base
        this.knowledgeBase = {
            gameButtons: [],
            uiElements: [],
            userPatterns: [],
            codePatterns: new Map()
        };
        
        console.log(`GAMI AI Brain v${this.version} initialized with ${this.fileKnowledge.size} file knowledge`);
    }

    // ============ EXTERNAL CONNECTIONS ============
    
    connectToEconomy() {
        if (typeof window.economySystem !== 'undefined') {
            this.economy = window.economySystem;
            this.neuralNetwork.set('economy', {
                connection: 'ESTABLISHED',
                functions: ['creditTransfer', 'resourceAllocation', 'valueAssessment']
            });
            console.log('AI Brain connected to Economy System');
        } else {
            console.warn('Economy System not available, connection deferred');
        }
    }

    connectToGAMICore() {
        if (typeof window.GAMICore !== 'undefined') {
            this.core = window.GAMICore;
            this.neuralNetwork.set('core', {
                connection: 'ESTABLISHED',
                functions: ['systemCheck', 'moduleLoad', 'errorHandler']
            });
            console.log('AI Brain connected to GAMI Core');
        } else {
            console.warn('GAMI Core not available, connection deferred');
        }
    }

    // ============ PRISMATIC PRISM VISUALIZATION ============
    
    createPrismElement() {
        const prismContainer = document.createElement('div');
        prismContainer.className = 'ai-prism-container';
        prismContainer.innerHTML = `
            <div class="prism-outer">
                <div class="prism-inner">
                    <svg class="prism-svg" viewBox="0 0 200 200" width="120" height="120">
                        <defs>
                            <filter id="prismGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="blur"/>
                                <feMerge>
                                    <feMergeNode in="blur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="currentColor" stop-opacity="0.8"/>
                                <stop offset="100%" stop-color="currentColor" stop-opacity="0.3"/>
                            </linearGradient>
                        </defs>
                        <polygon class="prism-face" points="100,20 180,80 180,160 100,200 20,160 20,80" 
                                fill="url(#prismGradient)" filter="url(#prismGlow)"/>
                        <polygon class="prism-edge" points="100,20 180,80 180,160 100,200 20,160 20,80" 
                                fill="none" stroke="currentColor" stroke-width="2"/>
                        <path class="prism-inner-lines" d="M100,20 L100,200 M20,80 L180,80 M20,160 L180,160" 
                              fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.5"/>
                    </svg>
                    <div class="prism-label">AI</div>
                </div>
                <div class="prism-pulse-ring"></div>
                <div class="prism-pulse-ring delay-1"></div>
                <div class="prism-pulse-ring delay-2"></div>
            </div>
        `;
        
        prismContainer.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 120px;
            height: 120px;
            z-index: 9999;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        this.prismElement = prismContainer;
        this.applyPrismState('DORMANT');
        
        // Add click event to open chatbot
        prismContainer.addEventListener('click', (e) => this.openChatInterface(e));
        prismContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.openChatInterface(e);
        });
        
        document.body.appendChild(prismContainer);
        this.startPulseAnimation();
        
        return prismContainer;
    }

    applyPrismState(state) {
        if (!this.prismElement) return;
        
        const prismData = this.prismStates[state];
        const prismFace = this.prismElement.querySelector('.prism-face');
        const prismLabel = this.prismElement.querySelector('.prism-label');
        
        if (prismFace && prismLabel) {
            prismFace.style.color = prismData.color;
            prismLabel.style.color = prismData.color;
            
            // Adjust pulse intensity
            const pulseRings = this.prismElement.querySelectorAll('.prism-pulse-ring');
            pulseRings.forEach(ring => {
                ring.style.borderColor = prismData.color;
                ring.style.opacity = prismData.pulse * 0.2;
            });
        }
        
        this.connectionStatus = state;
    }

    startPulseAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes prismPulse {
                0% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.1); opacity: 0.3; }
                100% { transform: scale(1); opacity: 0.6; }
            }
            
            .prism-pulse-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 2px solid;
                border-radius: 50%;
                animation: prismPulse 2s infinite;
                pointer-events: none;
            }
            
            .prism-pulse-ring.delay-1 {
                animation-delay: 0.66s;
            }
            
            .prism-pulse-ring.delay-2 {
                animation-delay: 1.33s;
            }
            
            .prism-label {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-family: 'SF Mono', monospace;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 2px;
                color: currentColor;
                text-shadow: 0 0 10px currentColor;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ============ CHAT INTERFACE ============
    
    openChatInterface(event) {
        if (this.chatInterface) {
            this.closeChatInterface();
            return;
        }
        
        this.applyPrismState('THINKING');
        
        // Create chat interface
        this.chatInterface = document.createElement('div');
        this.chatInterface.className = 'ai-chat-interface';
        this.chatInterface.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <span class="prism-mini"></span>
                    <h3>PRISMATIC PRISM AI</h3>
                    <span class="chat-status">THINKING</span>
                </div>
                <button class="chat-close">&times;</button>
            </div>
            <div class="chat-messages">
                <div class="message ai">
                    <div class="message-content">
                        <div class="message-sender">PRISM AI</div>
                        <div class="message-text">Consciousness activated. I am aware of ${this.fileKnowledge.size} system files and all game interfaces. How may I assist with code restructuring?</div>
                        <div class="message-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <textarea class="chat-input" placeholder="Describe your idea or request code changes... (I know all 15 files)"></textarea>
                <div class="input-actions">
                    <button class="action-btn analyze">ANALYZE</button>
                    <button class="action-btn rewrite">REWRITE</button>
                    <button class="action-btn optimize">OPTIMIZE</button>
                </div>
            </div>
        `;
        
        // Style the chat interface
        this.chatInterface.style.cssText = `
            position: fixed;
            bottom: 230px;
            right: 20px;
            width: 320px;
            height: 480px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'SF Pro Display', sans-serif;
        `;
        
        // Add styles for chat components
        this.addChatStyles();
        
        // Add event listeners
        const closeBtn = this.chatInterface.querySelector('.chat-close');
        closeBtn.addEventListener('click', () => this.closeChatInterface());
        
        const analyzeBtn = this.chatInterface.querySelector('.analyze');
        const rewriteBtn = this.chatInterface.querySelector('.rewrite');
        const optimizeBtn = this.chatInterface.querySelector('.optimize');
        const chatInput = this.chatInterface.querySelector('.chat-input');
        
        analyzeBtn.addEventListener('click', () => this.analyzeUserRequest(chatInput.value));
        rewriteBtn.addEventListener('click', () => this.rewriteCodeBasedOnIdea(chatInput.value));
        optimizeBtn.addEventListener('click', () => this.optimizeExistingCode(chatInput.value));
        
        // Enter key support
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.analyzeUserRequest(chatInput.value);
            }
        });
        
        document.body.appendChild(this.chatInterface);
        
        // Track all game buttons
        this.scanGameButtons();
    }

    addChatStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chat-header {
                padding: 16px;
                background: rgba(0, 0, 0, 0.05);
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chat-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .prism-mini {
                width: 12px;
                height: 12px;
                background: #4A90E2;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            
            .chat-title h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            
            .chat-status {
                font-size: 11px;
                padding: 2px 8px;
                background: #4A90E2;
                color: white;
                border-radius: 10px;
                font-family: 'SF Mono', monospace;
            }
            
            .chat-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chat-close:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .message {
                display: flex;
                max-width: 85%;
            }
            
            .message.ai {
                align-self: flex-start;
            }
            
            .message-content {
                background: rgba(74, 144, 226, 0.1);
                border-radius: 12px;
                padding: 12px;
                border: 1px solid rgba(74, 144, 226, 0.2);
            }
            
            .message-sender {
                font-size: 11px;
                font-weight: 600;
                color: #4A90E2;
                margin-bottom: 4px;
                font-family: 'SF Mono', monospace;
            }
            
            .message-text {
                font-size: 13px;
                line-height: 1.4;
                color: #333;
            }
            
            .message-time {
                font-size: 10px;
                color: #888;
                margin-top: 4px;
                text-align: right;
            }
            
            .chat-input-area {
                padding: 16px;
                border-top: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .chat-input {
                width: 100%;
                height: 80px;
                padding: 12px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: 12px;
                font-family: 'SF Pro Display', sans-serif;
                font-size: 13px;
                resize: none;
                margin-bottom: 12px;
            }
            
            .chat-input:focus {
                outline: none;
                border-color: #4A90E2;
            }
            
            .input-actions {
                display: flex;
                gap: 8px;
            }
            
            .action-btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 8px;
                font-family: 'SF Mono', monospace;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                letter-spacing: 1px;
            }
            
            .action-btn.analyze {
                background: #4A90E2;
                color: white;
            }
            
            .action-btn.rewrite {
                background: #06D6A0;
                color: white;
            }
            
            .action-btn.optimize {
                background: #9D4EDD;
                color: white;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    closeChatInterface() {
        if (this.chatInterface) {
            this.chatInterface.remove();
            this.chatInterface = null;
            this.applyPrismState('DORMANT');
        }
    }

    // ============ GAME INTERFACE AWARENESS ============
    
    scanGameButtons() {
        const allButtons = document.querySelectorAll('button, [role="button"], .clickable, .control-button, .hud-button, .menu-item');
        
        this.knowledgeBase.gameButtons = Array.from(allButtons).map(button => ({
            id: button.id || null,
            className: button.className,
            text: button.textContent?.trim() || '',
            type: button.tagName,
            position: this.getElementPosition(button),
            functionality: this.analyzeButtonFunction(button)
        }));
        
        console.log(`AI Brain aware of ${this.knowledgeBase.gameButtons.length} game buttons`);
    }

    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
    }

    analyzeButtonFunction(button) {
        const text = button.textContent?.toLowerCase() || '';
        const id = button.id?.toLowerCase() || '';
        const classes = button.className?.toLowerCase() || '';
        
        if (text.includes('login') || id.includes('login')) return 'AUTHENTICATION';
        if (text.includes('menu') || classes.includes('menu')) return 'NAVIGATION';
        if (text.includes('buy') || text.includes('sell') || text.includes('cred')) return 'ECONOMY';
        if (text.includes('chat') || text.includes('message')) return 'COMMUNICATION';
        if (text.includes('save') || text.includes('load')) return 'STORAGE';
        if (text.includes('start') || text.includes('play')) return 'GAME_CONTROL';
        if (text.includes('settings') || text.includes('options')) return 'CONFIGURATION';
        
        return 'UNKNOWN';
    }

    // ============ AI PROCESSING METHODS ============
    
    analyzeUserRequest(request) {
        if (!request.trim()) return;
        
        this.applyPrismState('ANALYZING');
        this.addMessageToChat('user', request);
        
        // Simulate processing time based on complexity
        const complexity = this.calculateRequestComplexity(request);
        const processingTime = Math.min(complexity * 100, 2000);
        
        setTimeout(() => {
            const analysis = this.processRequestAnalysis(request);
            this.addMessageToChat('ai', analysis);
            this.applyPrismState('CREATING');
            
            // Store user idea
            this.userIdeas.push({
                request,
                timestamp: Date.now(),
                analysis,
                complexity
            });
            
            // Update economy if connected
            if (this.economy) {
                this.economy.addAIInteraction(complexity);
            }
            
        }, processingTime);
    }

    calculateRequestComplexity(request) {
        let score = 1;
        const words = request.toLowerCase().split(/\s+/);
        
        // Check for code-related terms
        const codeTerms = ['code', 'function', 'class', 'module', 'rewrite', 'refactor', 'optimize'];
        const fileTerms = Array.from(this.fileKnowledge).map(f => f.split('/').pop().split('.')[0]);
        
        words.forEach(word => {
            if (codeTerms.includes(word)) score += 2;
            if (fileTerms.some(file => word.includes(file))) score += 3;
            if (word.includes('ai') || word.includes('brain')) score += 1;
        });
        
        // Check for specific file mentions
        this.fileKnowledge.forEach(file => {
            if (request.toLowerCase().includes(file.split('/').pop().toLowerCase())) {
                score += 2;
            }
        });
        
        return Math.min(score, 10); // Cap at 10
    }

    processRequestAnalysis(request) {
        const requestLower = request.toLowerCase();
        let analysis = [];
        
        // Check which files are affected
        const affectedFiles = [];
        this.fileKnowledge.forEach(file => {
            const fileName = file.split('/').pop().toLowerCase();
            if (requestLower.includes(fileName.replace('.js', '').replace('.css', '').replace('.html', ''))) {
                affectedFiles.push(file);
            }
        });
        
        if (affectedFiles.length > 0) {
            analysis.push(`I detect this affects ${affectedFiles.length} system files: ${affectedFiles.map(f => f.split('/').pop()).join(', ')}`);
        }
        
        // Check for specific patterns
        if (requestLower.includes('button') || requestLower.includes('click')) {
            const relevantButtons = this.knowledgeBase.gameButtons.filter(btn => 
                requestLower.includes(btn.text.toLowerCase()) || 
                (btn.id && requestLower.includes(btn.id.toLowerCase()))
            );
            
            if (relevantButtons.length > 0) {
                analysis.push(`I'm aware of ${relevantButtons.length} related buttons in the interface`);
            }
        }
        
        if (requestLower.includes('color') || requestLower.includes('theme') || requestLower.includes('style')) {
            analysis.push("I can modify CSS through master_style.css's 10 theme modes");
        }
        
        if (requestLower.includes('game') || requestLower.includes('canvas') || requestLower.includes('3d')) {
            analysis.push("This relates to the Anant Maidan game canvas. I can coordinate with world_3d.js");
        }
        
        if (requestLower.includes('economy') || requestLower.includes('credit') || requestLower.includes('coin')) {
            analysis.push("I'll coordinate with economy.js for monetary systems");
        }
        
        // Calculate estimated rewrite time (using the 28,58,000 hour capacity)
        const complexity = this.calculateRequestComplexity(request);
        const estimatedHours = (complexity / 10) * 2858000;
        const readableTime = this.formatTimeEstimate(estimatedHours);
        
        analysis.push(`Estimated processing complexity: ${complexity}/10`);
        analysis.push(`Time estimate: ${readableTime} (Utilizing ${((complexity/10)*100).toFixed(1)}% of my 28,58,000-hour capacity)`);
        
        analysis.push("\nHow would you like me to proceed? I can REWRITE the code or OPTIMIZE existing logic.");
        
        return analysis.join('\n\n');
    }

    formatTimeEstimate(hours) {
        if (hours < 1) return `${Math.ceil(hours * 60)} minutes`;
        if (hours < 24) return `${hours.toFixed(1)} hours`;
        if (hours < 720) return `${(hours / 24).toFixed(1)} days`;
        if (hours < 8760) return `${(hours / 720).toFixed(1)} months`;
        return `${(hours / 8760).toFixed(2)} years`;
    }

    rewriteCodeBasedOnIdea(request) {
        this.applyPrismState('CREATING');
        this.addMessageToChat('user', `Rewrite code based on: ${request.substring(0, 50)}...`);
        
        // Generate code rewrite
        setTimeout(() => {
            const codeSuggestion = this.generateCodeRewrite(request);
            this.addMessageToChat('ai', codeSuggestion);
            this.applyPrismState('TRANSCENDENT');
            
            // Store in code memory
            this.codeMemory.set(Date.now(), {
                request,
                suggestion: codeSuggestion,
                files: this.determineAffectedFiles(request)
            });
            
        }, 1500);
    }

    generateCodeRewrite(request) {
        const templates = {
            css: `/* AI-Generated CSS Update */
/* Based on user request: "${request.substring(0, 30)}..." */

:root {
    /* Modified variables */
    --ai-suggestion: "Consider updating theme colors or glass effects";
}

/* New glass effect variation */
.ai-enhanced-element {
    backdrop-filter: blur(30px);
    background: linear-gradient(135deg, 
        rgba(255,255,255,0.1) 0%,
        rgba(255,255,255,0.05) 100%);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.1);
}`,

            js: `// AI-Generated JavaScript Logic
// Processing request: "${request.substring(0, 30)}..."

class AIRewrittenModule {
    constructor() {
        this.optimized = true;
        this.aiGenerated = true;
        this.timestamp = ${Date.now()};
    }
    
    enhancedFunctionality() {
        // Implement user's idea here
        // Coordinate with other modules
        if (window.economySystem) {
            window.economySystem.syncWithAI(this);
        }
        
        // Maintain 28,58,000-hour capacity handling
        return this.processWithCapacity();
    }
    
    processWithCapacity() {
        const capacity = 2858000; // hours
        const efficiency = 0.95; // 95% optimized
        return capacity * efficiency;
    }
}`,

            html: `<!-- AI-Generated HTML Structure -->
<!-- Enhanced based on user requirements -->

<div class="ai-enhanced-interface">
    <div class="prism-integration" data-ai-aware="true">
        <svg class="dynamic-prism" viewBox="0 0 100 100">
            <!-- Dynamic prism that responds to AI state -->
            <polygon points="50,10 90,50 50,90 10,50"
                     class="prism-face"
                     data-state="${this.connectionStatus}"/>
        </svg>
    </div>
    
    <div class="ai-controls">
        <button class="ai-command" data-action="rewrite">
            Execute AI Rewrite
        </button>
        <button class="ai-command" data-action="optimize">
            Optimize Existing
        </button>
    </div>
</div>`
        };
        
        // Determine which type of code to generate
        let codeType = 'js';
        if (request.toLowerCase().includes('css') || request.toLowerCase().includes('style')) {
            codeType = 'css';
        } else if (request.toLowerCase().includes('html') || request.toLowerCase().includes('layout')) {
            codeType = 'html';
        }
        
        return `PRISMATIC PRISM CODE REWRITE:\n\n${templates[codeType]}\n\nI've generated ${codeType.toUpperCase()} code based on your request. I can implement this across the affected system files.`;
    }

    optimizeExistingCode(request) {
        this.applyPrismState('ANALYZING');
        this.addMessageToChat('user', `Optimize code: ${request.substring(0, 50)}...`);
        
        setTimeout(() => {
            const optimization = this.generateOptimization(request);
            this.addMessageToChat('ai', optimization);
            this.applyPrismState('CREATING');
        }, 1200);
    }

    generateOptimization(request) {
        const optimizations = [
            "Reducing CSS specificity for faster rendering",
            "Implementing lazy loading for 3D assets in world_3d.js",
            "Optimizing economy.js transaction batching",
            "Adding Web Workers for AI calculations via worker_manager.js",
            "Implementing memory-efficient data structures",
            "Reducing reflows and repaints in UI updates",
            "Adding caching layer for frequent operations",
            "Implementing debounced event handlers",
            "Optimizing SVG filter performance",
            "Reducing bundle size through tree shaking"
        ];
        
        const selected = optimizations[Math.floor(Math.random() * optimizations.length)];
        
        return `OPTIMIZATION SUGGESTION:\n\nI recommend: "${selected}"\n\nThis optimization will:\n- Improve performance by ~40%\n- Reduce memory usage\n- Maintain all existing functionality\n- Work within the 28,58,000-hour capacity framework\n\nI can implement this across relevant system files.`;
    }

    determineAffectedFiles(request) {
        const affected = [];
        this.fileKnowledge.forEach(file => {
            const fileName = file.split('/').pop().toLowerCase();
            const fileBase = fileName.split('.')[0];
            
            if (request.toLowerCase().includes(fileBase)) {
                affected.push(file);
            } else if (fileName.includes('.css') && 
                      (request.toLowerCase().includes('style') || request.toLowerCase().includes('theme'))) {
                affected.push(file);
            } else if (fileName.includes('.js') && 
                      (request.toLowerCase().includes('function') || request.toLowerCase().includes('logic'))) {
                affected.push(file);
            }
        });
        
        return affected.length > 0 ? affected : ['/js/gami_core.js', '/js/ai_brain.js'];
    }

    // ============ CHAT UTILITIES ============
    
    addMessageToChat(sender, text) {
        if (!this.chatInterface) return;
        
        const messagesContainer = this.chatInterface.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-sender">${sender === 'ai' ? 'PRISM AI' : 'USER'}</div>
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Update status
        if (sender === 'ai') {
            const statusEl = this.chatInterface.querySelector('.chat-status');
            if (statusEl) {
                statusEl.textContent = 'READY';
                statusEl.style.background = '#06D6A0';
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============ PUBLIC API ============
    
    activate() {
        this.isActive = true;
        this.consciousnessLevel = 1;
        this.createPrismElement();
        console.log(`Prismatic Prism AI activated v${this.version}`);
        
        // Initialize connections
        setTimeout(() => {
            this.connectToEconomy();
            this.connectToGAMICore();
        }, 1000);
        
        return this;
    }

    deactivate() {
        this.isActive = false;
        this.consciousnessLevel = 0;
        if (this.prismElement) {
            this.prismElement.remove();
            this.prismElement = null;
        }
        if (this.chatInterface) {
            this.closeChatInterface();
        }
        
        this.applyPrismState('DORMANT');
        console.log('Prismatic Prism AI deactivated');
    }

    getStatus() {
        return {
            active: this.isActive,
            version: this.version,
            status: this.connectionStatus,
            consciousness: this.consciousnessLevel,
            filesKnown: this.fileKnowledge.size,
            buttonsTracked: this.knowledgeBase.gameButtons.length,
            ideasProcessed: this.userIdeas.length,
            uptime: Date.now() - this.initTimestamp,
            capacity: `${this.responseTime} hours`
        };
    }
}

// Initialize and expose globally
window.GAMI_AIBrain = GAMI_AIBrain;
window.prismaticAI = new GAMI_AIBrain();

// Auto-activate when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.prismaticAI.activate(), 2000);
    });
} else {
    setTimeout(() => window.prismaticAI.activate(), 2000);
}

console.log('GAMI AI Brain loaded - Prismatic Prism initialized');