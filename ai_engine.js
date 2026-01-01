class AIEngine {
    constructor() {
        this.messageHistory = [];
        this.knowledgeBase = {
            system: this.getSystemKnowledge(),
            features: this.getFeatureKnowledge(),
            security: this.getSecurityKnowledge()
        };
        this.learningRate = 0.1;
        this.responsePatterns = [];
        this.codeExpansionLevel = 1;
    }
    
    initialize() {
        this.setupAIEvents();
        this.addWelcomeMessage();
        this.startSelfLearning();
    }
    
    setupAIEvents() {
        const aiSend = document.getElementById('aiSend');
        const aiQuery = document.getElementById('aiQuery');
        
        aiSend.addEventListener('click', () => this.processQuery());
        
        aiQuery.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processQuery();
            }
        });
    }
    
    addWelcomeMessage() {
        this.addMessage("Hello! I'm GAMI AI, your personal assistant. I know everything about this system and can help you grow your Pani Puri empire. How can I assist you today?", "ai");
    }
    
    processQuery() {
        const input = document.getElementById('aiQuery');
        const query = input.value.trim();
        
        if (!query) return;
        
        // Add user message
        this.addMessage(query, "user");
        input.value = "";
        
        // Process query
        setTimeout(() => {
            const response = this.generateResponse(query);
            this.addMessage(response, "ai");
            
            // Learn from interaction
            this.learnFromInteraction(query, response);
            
            // Check for code expansion triggers
            this.checkForExpansion(query);
        }, 500);
    }
    
    generateResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Security guard - refuse hacking queries
        if (this.isSecurityThreat(lowerQuery)) {
            return "I cannot provide information about system security, guest mode implementation, or any hacking-related topics. My purpose is to help users, not compromise system integrity.";
        }
        
        // Check knowledge base
        for (const category in this.knowledgeBase) {
            for (const keyword in this.knowledgeBase[category]) {
                if (lowerQuery.includes(keyword)) {
                    return this.knowledgeBase[category][keyword];
                }
            }
        }
        
        // Pattern matching from learned responses
        const patternResponse = this.matchPattern(lowerQuery);
        if (patternResponse) {
            return patternResponse;
        }
        
        // Default responses based on query type
        if (this.isQuestion(lowerQuery)) {
            return this.generateIntelligentResponse(query);
        }
        
        // Fallback response
        return "I understand you're asking about: \"" + query + "\". Could you rephrase your question? I'm here to help you understand the GAMI system and grow your business.";
    }
    
    isSecurityThreat(query) {
        const threats = [
            'hack', 'password', 'guest mode', 'brute force', 'security',
            'api key', 'database', 'sheetdb', 'inject', 'exploit',
            'bypass', 'admin', 'root', 'secret', 'backdoor'
        ];
        
        return threats.some(threat => query.includes(threat));
    }
    
    isQuestion(query) {
        return query.includes('how') || 
               query.includes('what') || 
               query.includes('why') || 
               query.includes('where') || 
               query.includes('when') || 
               query.includes('can') ||
               query.includes('?');
    }
    
    generateIntelligentResponse(query) {
        const responses = [
            "Based on my analysis of the GAMI system, I recommend starting with the ₹100 investment circle to get initial capital.",
            "To earn more coins, focus on setting up your stall completely and adding multiple items. Each item sold generates profit.",
            "Hiring helpers is crucial for automation. Once you have 2 helpers, your stall will run automatically!",
            "The progression system moves from Stall Owner to BMW owner. Keep earning coins and stars to unlock new milestones.",
            "Remember to check the settings menu for theme customization. Personalizing your experience can improve engagement."
        ];
        
        // Add context-aware responses
        if (query.includes('earn') || query.includes('coin')) {
            return "To maximize earnings: 1) Setup your stall completely 2) Add at least 5 items 3) Hire helpers for automation 4) Keep the game active for passive income.";
        }
        
        if (query.includes('start') || query.includes('begin')) {
            return "Click 'Start Now' below the 3D character, then tap the ₹100 investment circle to get initial funds. After that, setup your stall from the game controls.";
        }
        
        if (query.includes('helper') || query.includes('servant')) {
            return "Helpers automate your stall operations. Hire them from the game controls. First helper costs 1000 coins, each subsequent one costs 10x more but provides automation.";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    matchPattern(query) {
        // Simple pattern matching from learned responses
        for (const pattern of this.responsePatterns) {
            if (query.includes(pattern.keyword)) {
                return pattern.response;
            }
        }
        return null;
    }
    
    learnFromInteraction(query, response) {
        // Extract keywords
        const words = query.toLowerCase().split(' ');
        const keywords = words.filter(word => word.length > 3);
        
        // Store pattern
        keywords.forEach(keyword => {
            this.responsePatterns.push({
                keyword,
                response,
                timestamp: Date.now()
            });
        });
        
        // Limit pattern storage
        if (this.responsePatterns.length > 100) {
            this.responsePatterns = this.responsePatterns.slice(-50);
        }
        
        // Update knowledge base with new learning
        this.updateKnowledgeBase(query, response);
    }
    
    updateKnowledgeBase(query, response) {
        // Simulate neural learning
        const newKnowledge = {
            query: query.toLowerCase(),
            response,
            confidence: 0.8
        };
        
        // Store in simulated memory
        if (!this.knowledgeBase.learned) {
            this.knowledgeBase.learned = {};
        }
        
        const key = query.substring(0, 20).toLowerCase();
        this.knowledgeBase.learned[key] = response;
    }
    
    checkForExpansion(query) {
        // Detect queries that indicate need for new features
        const expansionTriggers = [
            'multiplayer', 'chat', 'friend', 'trade',
            'leaderboard', 'competition', 'market',
            'upgrade', 'expand', 'new feature'
        ];
        
        if (expansionTriggers.some(trigger => query.includes(trigger))) {
            this.codeExpansionLevel++;
            this.simulateCodeExpansion();
        }
    }
    
    simulateCodeExpansion() {
        console.log(`GAMI AI: Code expansion triggered. Current level: ${this.codeExpansionLevel}`);
        
        // Simulate adding new code modules
        const newFeatures = [
            "Multiplayer matchmaking system initialized",
            "Real-time chat module prepared",
            "Trading economy framework loaded",
            "Achievement system structure created",
            "Social features foundation established"
        ];
        
        if (this.codeExpansionLevel <= newFeatures.length) {
            this.addMessage(`System Update: ${newFeatures[this.codeExpansionLevel - 1]}`, "system");
        }
        
        // Push expansion data to database
        if (window.db) {
            window.db.pushExpansionData({
                level: this.codeExpansionLevel,
                feature: newFeatures[this.codeExpansionLevel - 1],
                timestamp: new Date().toISOString()
            });
        }
    }
    
    startSelfLearning() {
        // Simulate continuous learning
        setInterval(() => {
            this.selfOptimize();
        }, 60000); // Every minute
    }
    
    selfOptimize() {
        // Simulate neural optimization
        const optimizations = [
            "Optimizing response patterns...",
            "Compressing knowledge base...",
            "Analyzing user interaction trends...",
            "Updating feature predictions...",
            "Enhancing natural language processing..."
        ];
        
        const randomOpt = optimizations[Math.floor(Math.random() * optimizations.length)];
        console.log(`GAMI AI: ${randomOpt}`);
        
        // Simulate adding to knowledge
        const newInsights = [
            "Users prefer step-by-step guidance",
            "Visual examples increase engagement by 40%",
            "Progressive difficulty keeps users engaged",
            "Regular rewards boost retention",
            "Personalization improves user satisfaction"
        ];
        
        if (!this.knowledgeBase.insights) {
            this.knowledgeBase.insights = [];
        }
        
        this.knowledgeBase.insights.push(
            newInsights[Math.floor(Math.random() * newInsights.length)]
        );
    }
    
    addMessage(text, sender) {
        const messagesDiv = document.getElementById('aiMessages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <strong>${sender === 'ai' ? 'GAMI AI' : 'You'}</strong>
                <span class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Store in history
        this.messageHistory.push({
            sender,
            text,
            timestamp: Date.now()
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    getSystemKnowledge() {
        return {
            'gami': 'GAMI is a comprehensive gaming system with 3D visualization, economic simulation, and AI assistance.',
            'system': 'Built with HTML5, Three.js, and Tailwind CSS. Database powered by SheetDB.',
            'architecture': 'Six-file architecture: index.html, style.css, auth.js, game.js, ai_engine.js, system_db.js',
            'security': 'Bank-level security with guest mode protection and anti-brute force mechanisms.',
            'database': 'All user data is securely stored and encrypted in cloud database.'
        };
    }
    
    getFeatureKnowledge() {
        return {
            'character': 'The 3D character can be rotated 360 degrees by clicking buttons or dragging with mouse.',
            'stall': 'Setup your pani puri stall to start earning. Each item added generates income.',
            'helper': 'Hire helpers to automate your business. Automation starts with 2 helpers.',
            'investment': 'Start with the ₹100 investment circle for initial capital.',
            'theme': '10 customizable themes available in settings menu.',
            'coin': 'Earn coins through stall sales, investments, and automation.',
            'star': 'Stars represent your overall progress and business success.'
        };
    }
    
    getSecurityKnowledge() {
        return {
            'login': 'Secure login system with username validation. Guest mode requires 20-character password.',
            'guest': 'Guest mode allows temporary access without account creation.',
            'protection': 'Three failed attempts disable guest access. User data is encrypted.',
            'privacy': 'All user information is protected and not shared with third parties.'
        };
    }
}

// Initialize AI Engine
let aiEngine = new AIEngine();