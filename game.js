class GameSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.character = null;
        this.characterRotation = 0;
        this.gameState = {
            coins: 0,
            stars: 0,
            helpers: 0,
            stallActive: false,
            items: [],
            customers: [],
            automation: false
        };
        
        this.initialize();
    }
    
    initialize() {
        this.initialize3DCharacter();
        this.initializeGameWorld();
        this.initializeEvents();
        this.updateGameStats();
        this.startGameLoop();
    }
    
    initialize3DCharacter() {
        const container = document.getElementById('characterContainer');
        
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f7fa);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Create character (placeholder geometry)
        this.createCharacter();
        
        // Add orbit controls for rotation
        this.setupRotationControls();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createCharacter() {
        // Create a detailed character
        const group = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.4, 1.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        group.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.7, 0.5, 0);
        leftArm.rotation.z = Math.PI / 4;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.7, 0.5, 0);
        rightArm.rotation.z = -Math.PI / 4;
        group.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, -1.1, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, -1.1, 0);
        group.add(rightLeg);
        
        this.character = group;
        this.scene.add(this.character);
    }
    
    setupRotationControls() {
        const rotateLeft = document.getElementById('rotateLeft');
        const rotateRight = document.getElementById('rotateRight');
        
        rotateLeft.addEventListener('click', () => {
            this.characterRotation += 0.1;
        });
        
        rotateRight.addEventListener('click', () => {
            this.characterRotation -= 0.1;
        });
        
        // Mouse drag rotation
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        const container = document.getElementById('characterContainer');
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            this.characterRotation += deltaMove.x * 0.01;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });
        
        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    initializeGameWorld() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        // Draw realistic ground
        this.drawGroundTexture(ctx, canvas.width, canvas.height);
        
        // Initialize game events
        this.initializeGameEvents();
    }
    
    drawGroundTexture(ctx, width, height) {
        // Create realistic mud texture
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.5, '#A0522D');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add texture details
        ctx.fillStyle = '#5D4037';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    initializeGameEvents() {
        // Start Now button
        document.getElementById('startNow').addEventListener('click', () => {
            document.getElementById('gameWorld').classList.remove('hidden');
            window.aiEngine.addMessage("Welcome to the Pani Puri Empire! Start by clicking the ₹100 investment circle.", "ai");
        });
        
        // Setup Stall
        document.getElementById('setupStall').addEventListener('click', () => {
            this.setupStall();
        });
        
        // Add Item
        document.getElementById('addItem').addEventListener('click', () => {
            this.addItem();
        });
        
        // Hire Helper
        document.getElementById('hireHelper').addEventListener('click', () => {
            this.hireHelper();
        });
        
        // Investment Circle
        document.getElementById('investmentCircle').addEventListener('click', () => {
            this.makeInvestment();
        });
    }
    
    initializeEvents() {
        // Menu toggle
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('sideMenu').classList.add('active');
        });
        
        document.getElementById('closeMenu').addEventListener('click', () => {
            document.getElementById('sideMenu').classList.remove('active');
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.changeTheme(theme);
            });
        });
    }
    
    setupStall() {
        if (this.gameState.coins < 50) {
            window.aiEngine.addMessage("You need at least 50 coins to setup a stall.", "ai");
            return;
        }
        
        this.gameState.stallActive = true;
        this.gameState.coins -= 50;
        
        window.aiEngine.addMessage("Stall setup complete! Customers will start arriving.", "ai");
        this.updateGameStats();
        
        // Start customer generation
        this.generateCustomer();
    }
    
    addItem() {
        if (this.gameState.coins < 10) {
            window.aiEngine.addMessage("You need at least 10 coins to add an item.", "ai");
            return;
        }
        
        this.gameState.items.push({
            id: Date.now(),
            type: 'pani_puri',
            value: 5
        });
        
        this.gameState.coins -= 10;
        window.aiEngine.addMessage("Item added to stall! Each item will earn 5 coins when sold.", "ai");
        this.updateGameStats();
    }
    
    hireHelper() {
        const helperCost = this.calculateHelperCost();
        
        if (this.gameState.coins < helperCost) {
            window.aiEngine.addMessage(`You need ${helperCost} coins to hire a helper.`, "ai");
            return;
        }
        
        this.gameState.helpers++;
        this.gameState.coins -= helperCost;
        
        if (this.gameState.helpers >= 2) {
            this.gameState.automation = true;
            window.aiEngine.addMessage("Automation enabled! Your helpers will now manage the stall automatically.", "ai");
        }
        
        this.updateGameStats();
    }
    
    calculateHelperCost() {
        return 1000 * Math.pow(10, this.gameState.helpers);
    }
    
    makeInvestment() {
        if (this.gameState.coins < 100) {
            window.aiEngine.addMessage("You need 100 coins to make this investment.", "ai");
            return;
        }
        
        this.gameState.coins -= 100;
        this.gameState.coins += 500; // Investment return
        
        window.aiEngine.addMessage("Great investment! You earned 500 coins. Consider setting up your stall now.", "ai");
        this.updateGameStats();
    }
    
    generateCustomer() {
        if (!this.gameState.stallActive) return;
        
        setInterval(() => {
            if (this.gameState.items.length > 0) {
                const saleValue = this.gameState.items[0].value;
                this.gameState.coins += saleValue;
                this.gameState.items.shift();
                this.gameState.stars += 0.1;
                
                this.updateGameStats();
                
                // Check for milestones
                this.checkMilestones();
            }
        }, 3000);
    }
    
    checkMilestones() {
        const milestones = [
            { threshold: 1000, name: 'stall' },
            { threshold: 10000, name: 'shop' },
            { threshold: 100000, name: 'restaurant' },
            { threshold: 1000000, name: 'chain' },
            { threshold: 10000000, name: 'bmw' }
        ];
        
        milestones.forEach((milestone, index) => {
            if (this.gameState.coins >= milestone.threshold) {
                const element = document.querySelectorAll('.milestone')[index];
                element.classList.add('active');
            }
        });
    }
    
    updateGameStats() {
        document.getElementById('coinCount').textContent = 
            authSystem.formatNumber(this.gameState.coins);
        document.getElementById('starCount').textContent = 
            Math.floor(this.gameState.stars);
        document.getElementById('helperCount').textContent = 
            this.gameState.helpers;
        
        // Update user data in database
        if (window.authSystem.currentUser && !window.authSystem.currentUser.isGuest) {
            window.db.updateUserData({
                coins: this.gameState.coins,
                stars: this.gameState.stars,
                helpers: this.gameState.helpers
            });
        }
    }
    
    changeTheme(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        
        // Update UI colors based on theme
        const themes = {
            white: { bg: '#ffffff', text: '#333333' },
            dark: { bg: '#1a1a1a', text: '#ffffff' },
            red: { bg: '#ffebee', text: '#c62828' },
            blue: { bg: '#e3f2fd', text: '#1565c0' },
            green: { bg: '#e8f5e9', text: '#2e7d32' },
            purple: { bg: '#f3e5f5', text: '#7b1fa2' },
            orange: { bg: '#fff3e0', text: '#ef6c00' },
            pink: { bg: '#fce4ec', text: '#ad1457' },
            teal: { bg: '#e0f2f1', text: '#00695c' },
            gold: { bg: '#fff8e1', text: '#ff8f00' }
        };
        
        if (themes[theme]) {
            document.body.style.backgroundColor = themes[theme].bg;
            document.body.style.color = themes[theme].text;
        }
    }
    
    onWindowResize() {
        const container = document.getElementById('characterContainer');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.character) {
            this.character.rotation.y = this.characterRotation;
            this.characterRotation *= 0.95; // Smooth damping
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    startGameLoop() {
        this.animate();
        
        // Game loop for automated systems
        setInterval(() => {
            if (this.gameState.automation && this.gameState.helpers > 0) {
                // Automated earning
                this.gameState.coins += this.gameState.helpers * 10;
                this.updateGameStats();
            }
        }, 5000);
    }
}

// Initialize game system
let gameSystem = new GameSystem();