// GAMI WORLD 3D - Interactive Terrain Engine with Golden Arrow Navigation
// File: /js/world_3d.js (Absolute Path)

class GAMIWorld3D {
    constructor() {
        this.engineName = "LIQUID_TERRAIN_3D";
        this.version = "1.0.8";
        this.isInitialized = false;
        this.isActive = false;
        this.canvas = null;
        this.context = null;
        this.animationFrame = null;
        
        // Core 3D elements
        this.character = {
            x: 0,
            y: 0,
            z: 0,
            rotation: 0,
            scale: 1,
            velocity: { x: 0, y: 0, z: 0 },
            isMoving: false,
            footprintEffects: [],
            trailPoints: []
        };
        
        // Golden Arrow System
        this.goldenArrow = {
            visible: false,
            targetX: 0,
            targetY: 0,
            targetValue: 100, // ₹100 target
            pathPoints: [],
            animationProgress: 0,
            pulseIntensity: 0
        };
        
        // Terrain Configuration
        this.terrain = {
            texture: 'ASPHALT_SOIL_MIX',
            roughness: 0.7,
            softness: 0.3,
            displacement: 0.5,
            liquidEffect: 0,
            segments: 50,
            heightMap: [],
            moistureMap: []
        };
        
        // Liquid Glass Effects (Connected to master_style.css)
        this.liquidEffects = {
            displacement: 0,
            blur: 0,
            refraction: 0,
            waveFrequency: 0.02,
            waveAmplitude: 2
        };
        
        // 360-degree Rotation System
        this.rotationSystem = {
            enabled: true,
            sensitivity: 0.5,
            currentAngle: 0,
            targetAngle: 0,
            velocity: 0,
            isRotating: false,
            profileOffset: 0
        };
        
        // Economy Integration
        this.economyTarget = {
            value: 100,
            currency: '₹',
            distance: 0,
            direction: 0,
            glowIntensity: 0
        };
        
        // Visual Elements
        this.particles = [];
        this.footprintImpacts = [];
        this.liquidWaves = [];
        
        // Performance Tracking
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        
        // Initialize on load
        this.initialize();
    }

    // ============ INITIALIZATION ============
    
    initialize() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEngine());
        } else {
            this.setupEngine();
        }
    }

    setupEngine() {
        // Get canvas element from index.html
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Get 2D context
        this.context = this.canvas.getContext('2d');
        
        // Set canvas dimensions
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize terrain generation
        this.generateTerrain();
        
        // Connect to CSS Liquid Effects
        this.connectToCSSLiquidEffects();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start golden arrow system
        this.setupGoldenArrow();
        
        this.isInitialized = true;
        console.log(`${this.engineName} v${this.version} initialized`);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update terrain if needed
        if (this.isInitialized) {
            this.generateTerrain();
        }
    }

    // ============ TERRAIN GENERATION ============
    
    generateTerrain() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const segments = this.terrain.segments;
        
        this.terrain.heightMap = [];
        this.terrain.moistureMap = [];
        
        // Generate realistic asphalt/soil mix texture
        for (let y = 0; y <= segments; y++) {
            const rowHeight = [];
            const rowMoisture = [];
            
            for (let x = 0; x <= segments; x++) {
                // Base height with Perlin-like noise
                let heightValue = 0;
                
                // Multiple noise layers for realistic texture
                const scale = 0.02;
                heightValue += this.noise(x * scale, y * scale) * 20;
                heightValue += this.noise(x * scale * 2, y * scale * 2) * 10;
                heightValue += this.noise(x * scale * 4, y * scale * 4) * 5;
                
                // Add asphalt cracking patterns
                const crackIntensity = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.3;
                heightValue += crackIntensity;
                
                // Moisture simulation for wet soil effect
                const moisture = this.noise(x * scale * 0.5, y * scale * 0.5) * 0.5 + 0.5;
                rowMoisture.push(moisture);
                
                rowHeight.push(heightValue);
            }
            
            this.terrain.heightMap.push(rowHeight);
            this.terrain.moistureMap.push(rowMoisture);
        }
        
        // Generate initial liquid waves
        this.generateLiquidWaves();
    }

    noise(x, y) {
        // Simple pseudo-random noise for terrain
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = this.p[X] + Y;
        const b = this.p[X + 1] + Y;
        
        return this.lerp(v, 
            this.lerp(u, this.grad(this.p[a], x, y), 
                         this.grad(this.p[b], x - 1, y)),
            this.lerp(u, this.grad(this.p[a + 1], x, y - 1), 
                         this.grad(this.p[b + 1], x - 1, y - 1)));
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    p = new Array(512).fill(0).map((_, i) => {
        const permutation = [
            151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
            69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,
            252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,
            171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,
            122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,
            63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,
            188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,
            202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,
            28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,
            167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,
            104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,
            51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,
            176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,
            243,141,128,195,78,66,215,61,156,180
        ];
        return i < 256 ? permutation[i] : permutation[i - 256];
    });

    // ============ GOLDEN ARROW SYSTEM ============
    
    setupGoldenArrow() {
        // Create SVG golden arrow element
        this.createArrowSVG();
        
        // Calculate target position (₹100 target zone)
        this.calculateTargetPosition();
        
        // Listen for start button
        const startButton = document.querySelector('#activatePrism, .control-button, [data-action="start"]');
        if (startButton) {
            startButton.addEventListener('click', () => this.activateGoldenArrow());
            startButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.activateGoldenArrow();
            });
        }
    }

    createArrowSVG() {
        // Create SVG arrow element
        const arrowContainer = document.createElement('div');
        arrowContainer.id = 'goldenArrowContainer';
        arrowContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        arrowContainer.innerHTML = `
            <svg id="goldenArrowSVG" style="position: absolute; overflow: visible;">
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFD700" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="#FFEC8B" stop-opacity="0.95"/>
                        <stop offset="100%" stop-color="#FFD700" stop-opacity="0.9"/>
                    </linearGradient>
                    <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <radialGradient id="targetGlow">
                        <stop offset="0%" stop-color="#FFD700" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
                    </radialGradient>
                </defs>
                <g id="arrowGroup" transform="translate(0,0)">
                    <path id="goldenArrowPath" d="M0,-15 L30,0 L0,15 L10,0 Z" 
                          fill="url(#goldGradient)" filter="url(#arrowGlow)"
                          stroke="#B8860B" stroke-width="1"/>
                    <path id="arrowTrail" d="" fill="none" stroke="url(#goldGradient)" 
                          stroke-width="2" stroke-opacity="0.3" stroke-dasharray="5,5"/>
                </g>
                <circle id="targetCircle" cx="0" cy="0" r="30" 
                        fill="url(#targetGlow)" opacity="0"/>
                <text id="targetValue" x="0" y="40" text-anchor="middle" 
                      font-family="'SF Mono', monospace" font-size="14" 
                      font-weight="bold" fill="#FFD700" opacity="0">
                      ₹100
                </text>
            </svg>
        `;
        
        this.canvas.parentElement.appendChild(arrowContainer);
        this.goldenArrow.element = arrowContainer;
        this.goldenArrow.svg = document.getElementById('goldenArrowSVG');
        this.goldenArrow.path = document.getElementById('goldenArrowPath');
        this.goldenArrow.trail = document.getElementById('arrowTrail');
        this.goldenArrow.targetCircle = document.getElementById('targetCircle');
        this.goldenArrow.targetText = document.getElementById('targetValue');
    }

    calculateTargetPosition() {
        // Calculate random target position within canvas
        const padding = 100;
        this.goldenArrow.targetX = padding + Math.random() * (this.canvas.width - padding * 2);
        this.goldenArrow.targetY = padding + Math.random() * (this.canvas.height - padding * 2);
        
        // Calculate path points for smooth navigation
        this.calculateArrowPath();
        
        // Update economy target distance
        this.updateEconomyTarget();
    }

    calculateArrowPath() {
        const startX = this.character.x;
        const startY = this.character.y;
        const endX = this.goldenArrow.targetX;
        const endY = this.goldenArrow.targetY;
        
        // Create curved path using bezier
        const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
        const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 200;
        
        this.goldenArrow.pathPoints = [];
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = this.bezierPoint(startX, controlX, endX, t);
            const y = this.bezierPoint(startY, controlY, endY, t);
            this.goldenArrow.pathPoints.push({ x, y });
        }
        
        // Update SVG trail path
        if (this.goldenArrow.trail) {
            let d = `M ${startX} ${startY}`;
            for (let i = 1; i < this.goldenArrow.pathPoints.length; i += 3) {
                const point = this.goldenArrow.pathPoints[i];
                d += ` L ${point.x} ${point.y}`;
            }
            this.goldenArrow.trail.setAttribute('d', d);
        }
    }

    bezierPoint(p0, p1, p2, t) {
        return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    }

    activateGoldenArrow() {
        if (this.goldenArrow.visible) return;
        
        this.goldenArrow.visible = true;
        this.goldenArrow.animationProgress = 0;
        this.goldenArrow.pulseIntensity = 1;
        
        // Show arrow container
        if (this.goldenArrow.element) {
            this.goldenArrow.element.style.opacity = '1';
        }
        
        // Start animation
        this.animateGoldenArrow();
        
        // Update coordinates display
        this.updateCoordinateDisplay();
        
        console.log('Golden Arrow activated - Navigating to ₹100 target');
    }

    animateGoldenArrow() {
        if (!this.goldenArrow.visible) return;
        
        this.goldenArrow.animationProgress += 0.005;
        this.goldenArrow.pulseIntensity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
        
        if (this.goldenArrow.animationProgress > 1) {
            this.goldenArrow.animationProgress = 0;
            this.reachTarget();
            return;
        }
        
        // Calculate current position along path
        const pointIndex = Math.floor(this.goldenArrow.animationProgress * (this.goldenArrow.pathPoints.length - 1));
        const currentPoint = this.goldenArrow.pathPoints[pointIndex];
        const nextPoint = this.goldenArrow.pathPoints[pointIndex + 1] || currentPoint;
        
        // Calculate arrow position and rotation
        const arrowX = currentPoint.x;
        const arrowY = currentPoint.y;
        
        // Calculate angle towards next point
        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Move character along with arrow
        this.character.x = arrowX;
        this.character.y = arrowY;
        this.character.rotation = angle;
        
        // Update arrow SVG
        this.updateArrowSVG(arrowX, arrowY, angle);
        
        // Create footprint effects
        this.createFootprintEffect(arrowX, arrowY);
        
        // Update liquid effects based on movement
        this.updateLiquidEffects();
        
        // Continue animation
        requestAnimationFrame(() => this.animateGoldenArrow());
    }

    updateArrowSVG(x, y, angle) {
        if (!this.goldenArrow.svg) return;
        
        const arrowGroup = document.getElementById('arrowGroup');
        if (arrowGroup) {
            arrowGroup.setAttribute('transform', `translate(${x},${y}) rotate(${angle})`);
        }
        
        // Update target glow
        if (this.goldenArrow.targetCircle) {
            this.goldenArrow.targetCircle.setAttribute('cx', this.goldenArrow.targetX);
            this.goldenArrow.targetCircle.setAttribute('cy', this.goldenArrow.targetY);
            this.goldenArrow.targetCircle.style.opacity = 0.3 + this.goldenArrow.pulseIntensity * 0.2;
            
            // Pulse animation
            const pulseSize = 30 + Math.sin(Date.now() * 0.003) * 10;
            this.goldenArrow.targetCircle.setAttribute('r', pulseSize);
        }
        
        if (this.goldenArrow.targetText) {
            this.goldenArrow.targetText.setAttribute('x', this.goldenArrow.targetX);
            this.goldenArrow.targetText.setAttribute('y', this.goldenArrow.targetY - 50);
            this.goldenArrow.targetText.style.opacity = 0.7 + this.goldenArrow.pulseIntensity * 0.3;
        }
    }

    reachTarget() {
        // Target reached animation
        this.goldenArrow.pulseIntensity = 1;
        
        // Create celebration effect
        this.createTargetReachedEffect();
        
        // Update economy
        this.updateEconomyOnTargetReach();
        
        // Hide arrow after delay
        setTimeout(() => {
            this.goldenArrow.visible = false;
            if (this.goldenArrow.element) {
                this.goldenArrow.element.style.opacity = '0';
            }
            
            // Calculate new target
            setTimeout(() => {
                this.calculateTargetPosition();
            }, 1000);
            
        }, 2000);
    }

    // ============ FOOTPRINT & LIQUID EFFECTS ============
    
    createFootprintEffect(x, y) {
        // Create realistic footprint in soil
        const footprint = {
            x: x,
            y: y,
            size: 15 + Math.random() * 5,
            depth: this.terrain.softness * 0.5 + Math.random() * 0.3,
            rotation: this.character.rotation,
            life: 1,
            decay: 0.002
        };
        
        this.footprintImpacts.push(footprint);
        
        // Add to character trail
        this.character.trailPoints.push({ x, y, timestamp: Date.now() });
        
        // Keep only recent points
        if (this.character.trailPoints.length > 50) {
            this.character.trailPoints.shift();
        }
        
        // Create liquid displacement
        this.createLiquidDisplacement(x, y, footprint.size);
    }

    createLiquidDisplacement(x, y, size) {
        // Connect to CSS liquid effects
        this.liquidEffects.displacement = Math.min(this.liquidEffects.displacement + 0.1, 1);
        
        // Create wave effect
        this.liquidWaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: size * 3,
            intensity: 1,
            speed: 2
        });
        
        // Update CSS variables
        this.updateCSSLiquidVariables();
    }

    // ============ 360-DEGREE ROTATION SYSTEM ============
    
    setupRotationSystem() {
        // Add rotation controls
        const rotationArea = document.createElement('div');
        rotationArea.id = 'rotationController';
        rotationArea.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 50;
            cursor: grab;
        `;
        
        this.canvas.parentElement.appendChild(rotationArea);
        
        // Touch and mouse events
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        
        const startDrag = (clientX, clientY) => {
            isDragging = true;
            lastX = clientX;
            lastY = clientY;
            rotationArea.style.cursor = 'grabbing';
            this.rotationSystem.isRotating = true;
        };
        
        const drag = (clientX, clientY) => {
            if (!isDragging) return;
            
            const deltaX = clientX - lastX;
            const deltaY = clientY - lastY;
            
            // Calculate rotation based on drag
            this.rotationSystem.velocity = deltaX * this.rotationSystem.sensitivity * 0.01;
            this.rotationSystem.targetAngle += this.rotationSystem.velocity * 180;
            
            // Keep angle within 0-360
            this.rotationSystem.targetAngle %= 360;
            if (this.rotationSystem.targetAngle < 0) this.rotationSystem.targetAngle += 360;
            
            lastX = clientX;
            lastY = clientY;
            
            // Update character profile
            this.updateCharacterProfile();
        };
        
        const endDrag = () => {
            isDragging = false;
            rotationArea.style.cursor = 'grab';
            this.rotationSystem.isRotating = false;
        };
        
        // Mouse events
        rotationArea.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
        document.addEventListener('mousemove', (e) => drag(e.clientX, e.clientY));
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        rotationArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            drag(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchend', endDrag);
        
        // Start rotation update loop
        this.updateRotation();
    }

    updateRotation() {
        if (!this.rotationSystem.enabled) return;
        
        // Smoothly interpolate current angle to target
        const angleDiff = this.rotationSystem.targetAngle - this.rotationSystem.currentAngle;
        this.rotationSystem.currentAngle += angleDiff * 0.1;
        
        // Apply rotation to character
        this.character.rotation = this.rotationSystem.currentAngle;
        
        // Update profile display
        this.updateProfileDisplay();
        
        // Continue animation
        requestAnimationFrame(() => this.updateRotation());
    }

    updateCharacterProfile() {
        // Calculate profile offset based on rotation
        const normalizedAngle = (this.rotationSystem.currentAngle % 360) / 360;
        this.rotationSystem.profileOffset = normalizedAngle * 100; // 0-100 scale
        
        // Update any profile display elements
        const profileElements = document.querySelectorAll('[data-profile="character"]');
        profileElements.forEach(el => {
            el.style.transform = `rotateY(${this.rotationSystem.currentAngle}deg)`;
            el.style.opacity = 0.5 + Math.cos(normalizedAngle * Math.PI * 2) * 0.5;
        });
    }

    updateProfileDisplay() {
        // Update any UI elements showing rotation
        const rotationDisplay = document.getElementById('rotationDisplay');
        if (rotationDisplay) {
            rotationDisplay.textContent = `${Math.round(this.rotationSystem.currentAngle)}°`;
        }
    }

    // ============ LIQUID EFFECTS CONNECTION TO CSS ============
    
    connectToCSSLiquidEffects() {
        // Create CSS variable observers
        this.updateCSSLiquidVariables();
        
        // Listen for CSS variable changes
        this.observeCSSVariables();
    }

    updateCSSLiquidVariables() {
        // Update CSS custom properties with liquid effect values
        const root = document.documentElement;
        
        root.style.setProperty('--liquid-displacement', `${this.liquidEffects.displacement}px`);
        root.style.setProperty('--liquid-blur', `${this.liquidEffects.blur}px`);
        root.style.setProperty('--liquid-refraction', this.liquidEffects.refraction.toString());
        root.style.setProperty('--wave-frequency', this.liquidEffects.waveFrequency.toString());
        root.style.setProperty('--wave-amplitude', `${this.liquidEffects.waveAmplitude}px`);
    }

    observeCSSVariables() {
        // Observe changes to CSS liquid variables
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.updateFromCSSVariables();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    updateFromCSSVariables() {
        // Sync 3D effects with CSS variables
        const root = document.documentElement;
        const computed = getComputedStyle(root);
        
        this.liquidEffects.displacement = parseFloat(computed.getPropertyValue('--liquid-displacement')) || 0;
        this.liquidEffects.blur = parseFloat(computed.getPropertyValue('--liquid-blur')) || 0;
        this.liquidEffects.refraction = parseFloat(computed.getPropertyValue('--liquid-refraction')) || 0;
    }

    updateLiquidEffects() {
        // Update effects based on character movement
        if (this.character.isMoving) {
            this.liquidEffects.displacement = Math.min(this.liquidEffects.displacement + 0.01, 8);
            this.liquidEffects.waveFrequency = 0.02 + Math.random() * 0.01;
        } else {
            this.liquidEffects.displacement *= 0.95;
        }
        
        this.liquidEffects.blur = this.liquidEffects.displacement * 0.1;
        this.liquidEffects.refraction = this.liquidEffects.displacement * 0.05;
        
        this.updateCSSLiquidVariables();
    }

    generateLiquidWaves() {
        // Generate initial liquid waves
        for (let i = 0; i < 5; i++) {
            this.liquidWaves.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0,
                maxRadius: 50 + Math.random() * 100,
                intensity: 0.5 + Math.random() * 0.5,
                speed: 1 + Math.random()
            });
        }
    }

    // ============ RENDERING ENGINE ============
    
    startRendering() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.lastFrameTime = performance.now();
        
        const render = (currentTime) => {
            if (!this.isActive) return;
            
            // Calculate delta time
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;
            
            // Calculate FPS
            this.frameCount++;
            if (currentTime > this.lastFpsUpdate + 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
                this.frameCount = 0;
                this.lastFpsUpdate = currentTime;
                
                // Update FPS display
                this.updateFPSDisplay();
            }
            
            // Clear canvas
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw terrain
            this.drawTerrain();
            
            // Draw footprints
            this.drawFootprints(deltaTime);
            
            // Draw liquid waves
            this.drawLiquidWaves(deltaTime);
            
            // Draw character
            this.drawCharacter();
            
            // Draw particles
            this.drawParticles(deltaTime);
            
            // Continue animation loop
            this.animationFrame = requestAnimationFrame(render);
        };
        
        this.lastFpsUpdate = performance.now();
        this.animationFrame = requestAnimationFrame(render);
    }

    drawTerrain() {
        const ctx = this.context;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const segments = this.terrain.segments;
        const cellWidth = width / segments;
        const cellHeight = height / segments;
        
        // Draw asphalt/soil texture
        for (let y = 0; y < segments; y++) {
            for (let x = 0; x < segments; x++) {
                const heightValue = this.terrain.heightMap[y][x];
                const moisture = this.terrain.moistureMap[y][x];
                
                // Calculate color based on height and moisture
                let r = 80 + heightValue * 2; // Dark base
                let g = 70 + heightValue * 1.5;
                let b = 60 + heightValue;
                
                // Add moisture effect (darker when wet)
                if (moisture > 0.7) {
                    r *= 0.8;
                    g *= 0.9;
                    b *= 1.1;
                }
                
                // Add asphalt texture (random dark spots)
                if (Math.random() > 0.95) {
                    r *= 0.7;
                    g *= 0.7;
                    b *= 0.7;
                }
                
                ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                
                // Add texture details
                if (heightValue > 5) {
                    ctx.fillStyle = `rgba(100, 100, 100, ${heightValue * 0.02})`;
                    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                }
            }
        }
        
        // Add liquid glass overlay
        this.drawLiquidOverlay();
    }

    drawLiquidOverlay() {
        const ctx = this.context;
        
        // Create glass-like overlay
        const gradient = ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * this.liquidEffects.refraction})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.01 * this.liquidEffects.refraction})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add wave distortion
        if (this.liquidEffects.displacement > 0) {
            ctx.save();
            ctx.globalAlpha = 0.1 * this.liquidEffects.displacement;
            
            for (const wave of this.liquidWaves) {
                const gradient = ctx.createRadialGradient(
                    wave.x, wave.y, 0,
                    wave.x, wave.y, wave.radius
                );
                
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    drawFootprints(deltaTime) {
        const ctx = this.context;
        
        for (let i = this.footprintImpacts.length - 1; i >= 0; i--) {
            const footprint = this.footprintImpacts[i];
            
            // Update footprint life
            footprint.life -= footprint.decay * deltaTime;
            
            if (footprint.life <= 0) {
                this.footprintImpacts.splice(i, 1);
                continue;
            }
            
            // Draw footprint
            ctx.save();
            ctx.translate(footprint.x, footprint.y);
            ctx.rotate(footprint.rotation * Math.PI / 180);
            ctx.scale(1, footprint.depth);
            
            ctx.fillStyle = `rgba(60, 40, 20, ${0.3 * footprint.life})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, footprint.size, footprint.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add depth shadow
            ctx.fillStyle = `rgba(40, 20, 10, ${0.2 * footprint.life})`;
            ctx.beginPath();
            ctx.ellipse(0, footprint.size * 0.2, footprint.size * 0.8, footprint.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    drawLiquidWaves(deltaTime) {
        // Update and draw liquid waves
        for (let i = this.liquidWaves.length - 1; i >= 0; i--) {
            const wave = this.liquidWaves[i];
            
            wave.radius += wave.speed;
            
            if (wave.radius > wave.maxRadius) {
                this.liquidWaves.splice(i, 1);
            }
        }
    }

    drawCharacter() {
        const ctx = this.context;
        const char = this.character;
        
        ctx.save();
        ctx.translate(char.x, char.y);
        ctx.rotate(char.rotation * Math.PI / 180);
        
        // Draw character body (simple shape for now)
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(5, -5);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect when moving
        if (this.character.isMoving) {
            ctx.shadowColor = '#4A90E2';
            ctx.shadowBlur = 20;
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw character trail
        this.drawCharacterTrail();
    }

    drawCharacterTrail() {
        const ctx = this.context;
        const trail = this.character.trailPoints;
        
        if (trail.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        
        for (let i = 1; i < trail.length; i++) {
            ctx.lineTo(trail[i].x, trail[i].y);
        }
        
        ctx.strokeStyle = `rgba(74, 144, 226, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawParticles(deltaTime) {
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.01;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            const ctx = this.context;
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ============ EVENT HANDLERS ============
    
    setupEventListeners() {
        // Canvas click for manual movement
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.moveCharacterTo(x, y);
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.moveCharacterTo(x, y);
        });
        
        // Start rendering when canvas is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startRendering();
                    this.setupRotationSystem();
                } else {
                    this.stopRendering();
                }
            });
        });
        
        observer.observe(this.canvas);
    }

    moveCharacterTo(x, y) {
        this.character.isMoving = true;
        this.character.targetX = x;
        this.character.targetY = y;
        
        // Calculate angle to target
        const dx = x - this.character.x;
        const dy = y - this.character.y;
        this.character.rotation = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Create footprint at current position
        this.createFootprintEffect(this.character.x, this.character.y);
        
        // Smooth movement animation
        this.animateCharacterMovement();
    }

    animateCharacterMovement() {
        if (!this.character.isMoving) return;
        
        const dx = this.character.targetX - this.character.x;
        const dy = this.character.targetY - this.character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            this.character.isMoving = false;
            return;
        }
        
        // Move character
        const speed = 3;
        this.character.x += (dx / distance) * speed;
        this.character.y += (dy / distance) * speed;
        
        // Create footprint effect
        if (Math.random() > 0.7) {
            this.createFootprintEffect(this.character.x, this.character.y);
        }
        
        // Update liquid effects
        this.updateLiquidEffects();
        
        // Continue movement
        requestAnimationFrame(() => this.animateCharacterMovement());
    }

    // ============ ECONOMY INTEGRATION ============
    
    updateEconomyTarget() {
        const dx = this.goldenArrow.targetX - this.character.x;
        const dy = this.goldenArrow.targetY - this.character.y;
        
        this.economyTarget.distance = Math.sqrt(dx * dx + dy * dy);
        this.economyTarget.direction = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Calculate glow intensity based on proximity
        const maxDistance = Math.sqrt(
            Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2)
        );
        this.economyTarget.glowIntensity = 1 - (this.economyTarget.distance / maxDistance);
    }

    updateEconomyOnTargetReach() {
        // Add ₹100 to economy
        if (window.economySystem) {
            window.economySystem.addCredits(100, 'golden_arrow_target');
        }
        
        // Create celebration particles
        this.createMoneyParticles();
        
        // Update display
        this.updateEconomyDisplay();
    }

    createMoneyParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.goldenArrow.targetX,
                y: this.goldenArrow.targetY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                size: 3 + Math.random() * 4,
                color: '#FFD700',
                life: 1
            });
        }
    }

    // ============ UI UPDATES ============
    
    updateCoordinateDisplay() {
        const coordX = document.getElementById('coordX');
        const coordY = document.getElementById('coordY');
        const coordZ = document.getElementById('coordZ');
        
        if (coordX) coordX.textContent = Math.round(this.character.x);
        if (coordY) coordY.textContent = Math.round(this.character.y);
        if (coordZ) coordZ.textContent = Math.round(this.character.z);
    }

    updateEconomyDisplay() {
        const creditValue = document.getElementById('creditValue');
        if (creditValue) {
            // Animate value increase
            const current = parseInt(creditValue.textContent) || 0;
            const target = current + 100;
            
            this.animateValue(creditValue, current, target, 1000);
        }
    }

    animateValue(element, start, end, duration) {
        let startTime = null;
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const value = Math.floor(start + progress * (end - start));
            element.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateFPSDisplay() {
        const fpsValue = document.getElementById('fpsValue');
        if (fpsValue) {
            fpsValue.textContent = this.fps;
            
            // Color code based on FPS
            if (this.fps >= 50) {
                fpsValue.style.color = '#06D6A0';
            } else if (this.fps >= 30) {
                fpsValue.style.color = '#FFD166';
            } else {
                fpsValue.style.color = '#FF6B6B';
            }
        }
    }

    createTargetReachedEffect() {
        // Create visual effect when target is reached
        const ctx = this.context;
        const centerX = this.goldenArrow.targetX;
        const centerY = this.goldenArrow.targetY;
        
        // Draw explosion effect
        for (let i = 0; i < 360; i += 10) {
            const angle = i * Math.PI / 180;
            const radius = 50;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 2 + Math.random() * 3,
                color: '#FFD700',
                life: 1
            });
        }
        
        // Draw "₹100" text effect
        ctx.save();
        ctx.font = 'bold 24px "SF Mono", monospace';
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillText('₹100', centerX, centerY);
        ctx.restore();
    }

    // ============ PUBLIC API ============
    
    start() {
        if (!this.isInitialized) {
            this.initialize();
        }
        
        this.startRendering();
        return this.getStatus();
    }

    stopRendering() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    reset() {
        this.character = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            z: 0,
            rotation: 0,
            scale: 1,
            velocity: { x: 0, y: 0, z: 0 },
            isMoving: false,
            footprintEffects: [],
            trailPoints: []
        };
        
        this.goldenArrow.visible = false;
        this.calculateTargetPosition();
        
        if (this.goldenArrow.element) {
            this.goldenArrow.element.style.opacity = '0';
        }
        
        this.footprintImpacts = [];
        this.liquidWaves = [];
        this.particles = [];
        
        console.log('World 3D reset');
    }

    getStatus() {
        return {
            engine: this.engineName,
            version: this.version,
            active: this.isActive,
            characterPosition: { x: this.character.x, y: this.character.y },
            goldenArrowActive: this.goldenArrow.visible,
            targetDistance: this.economyTarget.distance,
            liquidEffects: this.liquidEffects,
            rotation: this.rotationSystem.currentAngle,
            fps: this.fps
        };
    }
}

// Initialize and expose globally
window.GAMIWorld3D = GAMIWorld3D;
window.world3D = new GAMIWorld3D();

// Auto-start when on game screen
document.addEventListener('DOMContentLoaded', () => {
    // Start when Anant Maidan screen is active
    const observer = new MutationObserver(() => {
        const maidanScreen = document.getElementById('anantMaidanScreen');
        if (maidanScreen && maidanScreen.classList.contains('active')) {
            setTimeout(() => {
                if (window.world3D) {
                    window.world3D.start();
                }
            }, 500);
        }
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true
    });
});

console.log('GAMI World 3D Engine loaded - Golden Arrow Navigation System ready');