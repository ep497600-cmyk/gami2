class MorphEvolutionEngine {
    constructor() {
        this.evolutionStages = [
            'thela',        // Cart
            'jhopadi',      // Hut
            'shop',         // Small Shop
            'building',     // Building
            'mall',         // Shopping Mall
            'bmw',          // Luxury Car
            'jahaj',        // Ship
            'viman',        // Aircraft
            'skyscraper',   // Skyscraper
            'megacity'      // Megacity
        ];
        
        this.currentAssets = new Map();
        this.morphAnimations = new Map();
        this.vectorCache = new WeakMap();
        this.morphDuration = 1000; // ms
        
        this.initMorphSystems();
        this.loadBaseAssets();
    }
    
    initMorphSystems() {
        // Vector interpolation system
        this.interpolator = {
            linear: (t) => t,
            easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            exponential: (t) => Math.pow(t, 1.5),
            
            interpolateVector: function(v1, v2, t, easing = 'easeInOut') {
                const easeFunc = this[easing] || this.linear;
                const easedT = easeFunc(t);
                
                return {
                    x: v1.x + (v2.x - v1.x) * easedT,
                    y: v1.y + (v2.y - v1.y) * easedT,
                    z: v1.z + (v2.z - v1.z) * easedT
                };
            },
            
            interpolateColor: function(c1, c2, t) {
                const r1 = parseInt(c1.slice(1, 3), 16);
                const g1 = parseInt(c1.slice(3, 5), 16);
                const b1 = parseInt(c1.slice(5, 7), 16);
                
                const r2 = parseInt(c2.slice(1, 3), 16);
                const g2 = parseInt(c2.slice(3, 5), 16);
                const b2 = parseInt(c2.slice(5, 7), 16);
                
                const r = Math.round(r1 + (r2 - r1) * t);
                const g = Math.round(g1 + (g2 - g1) * t);
                const b = Math.round(b1 + (b2 - b1) * t);
                
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
        };
        
        // 3D transformation system
        this.transformer = {
            decomposeMatrix: function(matrix) {
                // Extract position, rotation, scale from transformation matrix
                return {
                    position: { x: matrix[12], y: matrix[13], z: matrix[14] },
                    scale: {
                        x: Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]),
                        y: Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]),
                        z: Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10])
                    }
                };
            },
            
            generateMorphPath: function(startState, endState, controlPoints = 3) {
                const path = [];
                
                // Generate bezier control points for smooth morphing
                for (let i = 0; i <= controlPoints; i++) {
                    const t = i / controlPoints;
                    const point = {
                        position: this.interpolatePosition(startState.position, endState.position, t),
                        rotation: this.interpolateRotation(startState.rotation, endState.rotation, t),
                        scale: this.interpolateScale(startState.scale, endState.scale, t)
                    };
                    path.push(point);
                }
                
                return path;
            },
            
            interpolatePosition: function(p1, p2, t) {
                return {
                    x: p1.x + (p2.x - p1.x) * t,
                    y: p1.y + (p2.y - p1.y) * t,
                    z: p1.z + (p2.z - p1.z) * t
                };
            },
            
            interpolateRotation: function(r1, r2, t) {
                // Quaternion slerp for smooth rotation
                const dot = r1.x * r2.x + r1.y * r2.y + r1.z * r2.z + r1.w * r2.w;
                
                if (dot < 0) {
                    r2 = { x: -r2.x, y: -r2.y, z: -r2.z, w: -r2.w };
                }
                
                const theta = Math.acos(Math.min(Math.max(dot, -1), 1));
                const sinTheta = Math.sin(theta);
                
                if (sinTheta < 0.001) {
                    return {
                        x: r1.x + (r2.x - r1.x) * t,
                        y: r1.y + (r2.y - r1.y) * t,
                        z: r1.z + (r2.z - r1.z) * t,
                        w: r1.w + (r2.w - r1.w) * t
                    };
                }
                
                const ratio1 = Math.sin((1 - t) * theta) / sinTheta;
                const ratio2 = Math.sin(t * theta) / sinTheta;
                
                return {
                    x: r1.x * ratio1 + r2.x * ratio2,
                    y: r1.y * ratio1 + r2.y * ratio2,
                    z: r1.z * ratio1 + r2.z * ratio2,
                    w: r1.w * ratio1 + r2.w * ratio2
                };
            },
            
            interpolateScale: function(s1, s2, t) {
                return {
                    x: s1.x + (s2.x - s1.x) * t,
                    y: s1.y + (s2.y - s1.y) * t,
                    z: s1.z + (s2.z - s1.z) * t
                };
            }
        };
        
        // Asset generation system
        this.assetGenerator = {
            stageTemplates: {
                thela: this.generateThelaTemplate(),
                jhopadi: this.generateJhopadiTemplate(),
                shop: this.generateShopTemplate(),
                building: this.generateBuildingTemplate(),
                mall: this.generateMallTemplate(),
                bmw: this.generateBMWTemplate(),
                jahaj: this.generateJahajTemplate(),
                viman: this.generateVimanTemplate(),
                skyscraper: this.generateSkyscraperTemplate(),
                megacity: this.generateMegacityTemplate()
            },
            
            generateStageAsset: function(stage, level = 0) {
                const template = this.stageTemplates[stage];
                if (!template) return null;
                
                // Apply level-based modifications
                return this.applyLevelModifications(template, level);
            },
            
            applyLevelModifications: function(template, level) {
                const modified = JSON.parse(JSON.stringify(template));
                
                // Scale with level
                const scaleFactor = 1 + (level * 0.1);
                modified.scale = {
                    x: template.scale.x * scaleFactor,
                    y: template.scale.y * scaleFactor,
                    z: template.scale.z * scaleFactor
                };
                
                // Add level-based details
                modified.details = modified.details || [];
                for (let i = 0; i < level; i++) {
                    modified.details.push({
                        type: 'decoration',
                        position: {
                            x: (Math.random() - 0.5) * 2,
                            y: Math.random() * 3,
                            z: (Math.random() - 0.5) * 2
                        },
                        scale: 0.2 + Math.random() * 0.3
                    });
                }
                
                return modified;
            }
        };
    }
    
    generateThelaTemplate() {
        return {
            type: 'thela',
            vertices: [
                // Base
                [-1, 0, -0.5], [1, 0, -0.5], [1, 0, 0.5], [-1, 0, 0.5],
                // Wheels
                [-0.8, -0.2, -0.6], [-0.8, -0.2, 0.6],
                [0.8, -0.2, -0.6], [0.8, -0.2, 0.6],
                // Cart body
                [-0.9, 0.5, -0.4], [0.9, 0.5, -0.4],
                [0.9, 0.5, 0.4], [-0.9, 0.5, 0.4]
            ],
            faces: [
                [0, 1, 2], [0, 2, 3], // Base
                [4, 5, 6], [5, 6, 7], // Wheels
                [8, 9, 10], [8, 10, 11] // Body
            ],
            colors: ['#8B4513', '#654321', '#A0522D'],
            scale: { x: 1.5, y: 1.5, z: 2 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            position: { x: 0, y: 0, z: 0 },
            animations: {
                idle: this.generateThelaIdleAnimation(),
                moving: this.generateThelaMovingAnimation()
            }
        };
    }
    
    generateBMWTemplate() {
        return {
            type: 'bmw',
            vertices: [
                // Car body - lower
                [-2, 0.3, -0.8], [2, 0.3, -0.8], [2, 0.3, 0.8], [-2, 0.3, 0.8],
                // Car body - upper
                [-1.8, 0.8, -0.7], [1.8, 0.8, -0.7], [1.5, 1.2, 0.6], [-1.5, 1.2, 0.6],
                // Wheels
                [-1.5, 0.2, -0.9], [-1.5, 0.2, 0.9],
                [1.5, 0.2, -0.9], [1.5, 0.2, 0.9],
                // Windows
                [-1.6, 0.9, -0.65], [1.6, 0.9, -0.65],
                [1.3, 1.1, 0.55], [-1.3, 1.1, 0.55]
            ],
            faces: [
                // Body panels
                [0, 1, 2], [0, 2, 3],
                [4, 5, 6], [4, 6, 7],
                // Wheel arches
                [8, 9, 10], [9, 10, 11],
                // Windows
                [12, 13, 14], [12, 14, 15]
            ],
            colors: ['#000000', '#1E1E1E', '#2D2D2D', '#0033CC'], // BMW colors
            scale: { x: 2, y: 2, z: 3 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            position: { x: 0, y: 0.5, z: 0 },
            details: [
                { type: 'logo', position: { x: 0, y: 1, z: 0.85 }, scale: 0.3 },
                { type: 'headlight', position: { x: 1.9, y: 0.7, z: 0.5 }, scale: 0.2 },
                { type: 'headlight', position: { x: 1.9, y: 0.7, z: -0.5 }, scale: 0.2 },
                { type: 'taillight', position: { x: -1.9, y: 0.7, z: 0.5 }, scale: 0.2 },
                { type: 'taillight', position: { x: -1.9, y: 0.7, z: -0.5 }, scale: 0.2 }
            ],
            animations: {
                idle: this.generateBMWIdleAnimation(),
                driving: this.generateBMWDrivingAnimation(),
                luxury: this.generateBMWLuxuryAnimation()
            }
        };
    }
    
    generateJahajTemplate() {
        return {
            type: 'jahaj',
            vertices: [
                // Hull
                [-10, 0, -3], [10, 0, -3], [10, 0, 3], [-10, 0, 3],
                [-9, 4, -2.5], [9, 4, -2.5], [9, 4, 2.5], [-9, 4, 2.5],
                // Deck
                [-8, 5, -2], [8, 5, -2], [8, 5, 2], [-8, 5, 2],
                // Bridge
                [-2, 8, -1.5], [2, 8, -1.5], [2, 8, 1.5], [-2, 8, 1.5],
                // Mast
                [0, 15, 0]
            ],
            faces: [
                // Hull sides
                [0, 1, 5], [0, 5, 4],
                [1, 2, 6], [1, 6, 5],
                [2, 3, 7], [2, 7, 6],
                [3, 0, 4], [3, 4, 7],
                // Deck
                [8, 9, 10], [8, 10, 11],
                // Bridge
                [12, 13, 14], [12, 14, 15],
                // Mast
                [13, 16, 14], [12, 16, 13]
            ],
            colors: ['#8B4513', '#654321', '#1E90FF', '#FFFFFF'],
            scale: { x: 4, y: 4, z: 4 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            position: { x: 0, y: 0, z: 0 },
            details: [
                { type: 'funnel', position: { x: 5, y: 6, z: 0 }, scale: 1 },
                { type: 'lifeboat', position: { x: -6, y: 5.5, z: 2.5 }, scale: 0.5 },
                { type: 'lifeboat', position: { x: -6, y: 5.5, z: -2.5 }, scale: 0.5 },
                { type: 'radar', position: { x: 0, y: 12, z: 0 }, scale: 0.3 },
                { type: 'anchor', position: { x: -9.5, y: 2, z: 0 }, scale: 0.4 }
            ],
            animations: {
                sailing: this.generateJahajSailingAnimation(),
                docking: this.generateJahajDockingAnimation(),
                cruising: this.generateJahajCruisingAnimation()
            }
        };
    }
    
    generateThelaIdleAnimation() {
        return {
            type: 'idle',
            duration: 2000,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 1000, position: { x: 0, y: 0.1, z: 0 }, rotation: { x: 0, y: 0.05, z: 0 } },
                { time: 2000, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    generateBMWLuxuryAnimation() {
        return {
            type: 'luxury',
            duration: 3000,
            keyframes: [
                { 
                    time: 0, 
                    position: { x: 0, y: 0.5, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    details: { headlights: 0.3, reflections: 0.5 }
                },
                { 
                    time: 1000, 
                    position: { x: 0, y: 0.55, z: 0 },
                    rotation: { x: 0.01, y: 0.02, z: 0 },
                    details: { headlights: 0.8, reflections: 0.8 }
                },
                { 
                    time: 2000, 
                    position: { x: 0, y: 0.5, z: 0 },
                    rotation: { x: -0.01, y: -0.02, z: 0 },
                    details: { headlights: 1.0, reflections: 1.0 }
                },
                { 
                    time: 3000, 
                    position: { x: 0, y: 0.5, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    details: { headlights: 0.5, reflections: 0.7 }
                }
            ]
        };
    }
    
    loadBaseAssets() {
        // Pre-load all stage templates
        this.evolutionStages.forEach(stage => {
            const asset = this.assetGenerator.generateStageAsset(stage, 0);
            if (asset) {
                this.currentAssets.set(stage, asset);
            }
        });
    }
    
    morphObject(objectId, fromStage, toStage, progress) {
        const fromAsset = this.currentAssets.get(fromStage);
        const toAsset = this.currentAssets.get(toStage);
        
        if (!fromAsset || !toAsset) {
            console.error(`Missing assets for morph: ${fromStage} -> ${toStage}`);
            return null;
        }
        
        // Calculate interpolated state
        const morphedState = this.calculateMorphedState(fromAsset, toAsset, progress);
        
        // Apply vector-based morphing
        const morphedVertices = this.morphVertices(
            fromAsset.vertices,
            toAsset.vertices,
            progress
        );
        
        // Interpolate colors
        const morphedColors = this.interpolateColors(
            fromAsset.colors,
            toAsset.colors,
            progress
        );
        
        // Handle detail morphing
        const morphedDetails = this.morphDetails(
            fromAsset.details || [],
            toAsset.details || [],
            progress
        );
        
        return {
            id: objectId,
            stage: toStage,
            vertices: morphedVertices,
            faces: toAsset.faces, // Faces remain consistent
            colors: morphedColors,
            position: morphedState.position,
            rotation: morphedState.rotation,
            scale: morphedState.scale,
            details: morphedDetails,
            progress: progress,
            isMorphing: progress < 1
        };
    }
    
    calculateMorphedState(fromAsset, toAsset, progress) {
        const position = this.interpolator.interpolateVector(
            fromAsset.position,
            toAsset.position,
            progress,
            'easeInOut'
        );
        
        const rotation = this.transformer.interpolateRotation(
            fromAsset.rotation,
            toAsset.rotation,
            progress
        );
        
        const scale = this.interpolator.interpolateVector(
            fromAsset.scale,
            toAsset.scale,
            progress,
            'exponential'
        );
        
        return { position, rotation, scale };
    }
    
    morphVertices(fromVerts, toVerts, progress) {
        // Ensure both vertex arrays have same length
        const maxLength = Math.max(fromVerts.length, toVerts.length);
        const morphed = [];
        
        for (let i = 0; i < maxLength; i++) {
            const v1 = fromVerts[i] || [0, 0, 0];
            const v2 = toVerts[i] || [0, 0, 0];
            
            const morphedVert = [
                v1[0] + (v2[0] - v1[0]) * progress,
                v1[1] + (v2[1] - v1[1]) * progress,
                v1[2] + (v2[2] - v1[2]) * progress
            ];
            
            morphed.push(morphedVert);
        }
        
        return morphed;
    }
    
    interpolateColors(colors1, colors2, progress) {
        const maxColors = Math.max(colors1.length, colors2.length);
        const interpolated = [];
        
        for (let i = 0; i < maxColors; i++) {
            const c1 = colors1[i] || '#000000';
            const c2 = colors2[i] || '#000000';
            
            const color = this.interpolator.interpolateColor(c1, c2, progress);
            interpolated.push(color);
        }
        
        return interpolated;
    }
    
    morphDetails(details1, details2, progress) {
        if (progress < 0.5) {
            // Phase 1: Fade out old details
            return details1.map(detail => ({
                ...detail,
                opacity: 1 - (progress * 2),
                scale: detail.scale * (1 - progress)
            }));
        } else {
            // Phase 2: Fade in new details
            return details2.map(detail => ({
                ...detail,
                opacity: (progress - 0.5) * 2,
                scale: detail.scale * (progress - 0.5) * 2
            }));
        }
    }
    
    startMorphing(objectId, fromStage, toStage, duration = null) {
        const morphDuration = duration || this.morphDuration;
        const startTime = Date.now();
        
        const animation = {
            objectId,
            fromStage,
            toStage,
            startTime,
            duration: morphDuration,
            progress: 0,
            isComplete: false
        };
        
        this.morphAnimations.set(objectId, animation);
        
        // Start animation loop
        this.updateMorphing();
        
        return animation;
    }
    
    updateMorphing() {
        const now = Date.now();
        
        this.morphAnimations.forEach((animation, objectId) => {
            if (animation.isComplete) return;
            
            const elapsed = now - animation.startTime;
            animation.progress = Math.min(elapsed / animation.duration, 1);
            
            if (animation.progress >= 1) {
                animation.isComplete = true;
                animation.progress = 1;
                
                // Trigger completion event
                this.onMorphComplete(objectId, animation.fromStage, animation.toStage);
            }
            
            // Update the morphed object
            const morphedObject = this.morphObject(
                objectId,
                animation.fromStage,
                animation.toStage,
                animation.progress
            );
            
            // Dispatch update event
            this.dispatchMorphUpdate(morphedObject);
        });
        
        // Clean up completed animations
        this.cleanupCompletedAnimations();
        
        // Continue animation loop if there are active animations
        if (this.morphAnimations.size > 0) {
            requestAnimationFrame(() => this.updateMorphing());
        }
    }
    
    onMorphComplete(objectId, fromStage, toStage) {
        console.log(`Morph complete: ${objectId} (${fromStage} -> ${toStage})`);
        
        // Update asset registry
        const newAsset = this.assetGenerator.generateStageAsset(toStage, 1);
        this.currentAssets.set(toStage, newAsset);
        
        // Dispatch completion event
        const event = new CustomEvent('morphComplete', {
            detail: { objectId, fromStage, toStage }
        });
        window.dispatchEvent(event);
    }
    
    dispatchMorphUpdate(morphedObject) {
        const event = new CustomEvent('morphUpdate', {
            detail: morphedObject
        });
        window.dispatchEvent(event);
    }
    
    cleanupCompletedAnimations() {
        for (const [objectId, animation] of this.morphAnimations.entries()) {
            if (animation.isComplete) {
                // Keep for a short time for cleanup
                setTimeout(() => {
                    this.morphAnimations.delete(objectId);
                }, 1000);
            }
        }
    }
    
    getEvolutionPath(currentStage) {
        const currentIndex = this.evolutionStages.indexOf(currentStage);
        if (currentIndex === -1) return [];
        
        return this.evolutionStages.slice(currentIndex + 1);
    }
    
    canEvolve(currentStage, resources) {
        const nextStage = this.getNextStage(currentStage);
        if (!nextStage) return false;
        
        const cost = this.calculateEvolutionCost(currentStage, nextStage);
        return this.hasSufficientResources(resources, cost);
    }
    
    getNextStage(currentStage) {
        const currentIndex = this.evolutionStages.indexOf(currentStage);
        if (currentIndex === -1 || currentIndex >= this.evolutionStages.length - 1) {
            return null;
        }
        return this.evolutionStages[currentIndex + 1];
    }
    
    calculateEvolutionCost(fromStage, toStage) {
        const stageValues = {
            thela: 100,
            jhopadi: 500,
            shop: 2000,
            building: 10000,
            mall: 50000,
            bmw: 200000,
            jahaj: 1000000,
            viman: 5000000,
            skyscraper: 25000000,
            megacity: 100000000
        };
        
        const fromValue = stageValues[fromStage] || 0;
        const toValue = stageValues[toStage] || 0;
        
        return {
            coins: BigInt(toValue - fromValue),
            time: (toValue - fromValue) * 1000, // ms
            requirements: this.getStageRequirements(toStage)
        };
    }
    
    getStageRequirements(stage) {
        const requirements = {
            thela: { workers: 1, space: 1 },
            jhopadi: { workers: 2, space: 2, materials: ['wood', 'clay'] },
            shop: { workers: 3, space: 3, materials: ['bricks', 'glass'], license: true },
            building: { workers: 10, space: 10, materials: ['concrete', 'steel'], permit: true },
            mall: { workers: 50, space: 50, materials: ['marble', 'glass'], businessLicense: true },
            bmw: { workers: 1, space: 2, materials: ['luxury', 'electronics'], driverLicense: true },
            jahaj: { workers: 20, space: 100, materials: ['steel', 'composite'], captainLicense: true },
            viman: { workers: 50, space: 200, materials: ['titanium', 'composite'], pilotLicense: true },
            skyscraper: { workers: 200, space: 1000, materials: ['steel', 'glass'], cityPermit: true },
            megacity: { workers: 1000, space: 10000, materials: ['all'], governmentApproval: true }
        };
        
        return requirements[stage] || {};
    }
    
    hasSufficientResources(resources, cost) {
        return resources.coins >= cost.coins;
    }
    
    // Procedural shader system for automatic clothing/seasonal changes
    applyProceduralShaders(object, environmentalData) {
        const shaders = {
            winter: this.applyWinterShader.bind(this),
            summer: this.applySummerShader.bind(this),
            rain: this.applyRainShader.bind(this),
            luxury: this.applyLuxuryShader.bind(this)
        };
        
        // Apply seasonal shader
        if (shaders[environmentalData.season]) {
            shaders[environmentalData.season](object, environmentalData);
        }
        
        // Apply weather shader
        if (shaders[environmentalData.weather]) {
            shaders[environmentalData.weather](object, environmentalData);
        }
        
        // Apply stage-specific shader
        if (object.stage === 'bmw' || object.stage === 'jahaj' || object.stage === 'viman') {
            shaders.luxury(object, environmentalData);
        }
        
        return object;
    }
    
    applyWinterShader(object, environmentalData) {
        // Add snow accumulation, frost effects
        object.winterEffects = {
            snowCover: Math.min(1, environmentalData.temperature < 0 ? 1 : 0),
            frostIntensity: environmentalData.temperature < 5 ? 0.5 : 0,
            breathEffect: environmentalData.temperature < 10,
            clothing: 'sweater'
        };
        
        // Adjust colors for winter
        object.colors = object.colors.map(color => {
            // Desaturate and lighten colors for winter
            const hsl = this.hexToHSL(color);
            hsl.s = Math.max(0, hsl.s - 30);
            hsl.l = Math.min(95, hsl.l + 10);
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        });
        
        return object;
    }
    
    applySummerShader(object, environmentalData) {
        // Add heat haze, vibrant colors
        object.summerEffects = {
            heatHaze: environmentalData.temperature > 30 ? 0.7 : 0.3,
            saturationBoost: 1.3,
            clothing: 'tshirt',
            sunReflection: environmentalData.timeOfDay > 10 && environmentalData.timeOfDay < 16 ? 0.8 : 0.3
        };
        
        // Adjust colors for summer
        object.colors = object.colors.map(color => {
            const hsl = this.hexToHSL(color);
            hsl.s = Math.min(100, hsl.s * 1.3);
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        });
        
        return object;
    }
    
    applyRainShader(object, environmentalData) {
        // Add wetness, reflections, puddles
        object.rainEffects = {
            wetness: 0.8,
            reflection: 0.6,
            puddles: environmentalData.rainIntensity || 0.5,
            clothing: 'raincoat',
            umbrella: environmentalData.rainIntensity > 0.7
        };
        
        // Darken and desaturate colors for rain
        object.colors = object.colors.map(color => {
            const hsl = this.hexToHSL(color);
            hsl.s = Math.max(0, hsl.s - 20);
            hsl.l = Math.max(10, hsl.l - 15);
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        });
        
        return object;
    }
    
    applyLuxuryShader(object, environmentalData) {
        // Add reflections, glow, particle effects for luxury items
        object.luxuryEffects = {
            reflectionIntensity: 0.9,
            glow: 0.7,
            particleEffects: ['sparkles', 'glint'],
            animationQuality: 'high',
            shadowQuality: 'soft'
        };
        
        // Enhance colors for luxury
        object.colors = object.colors.map(color => {
            const hsl = this.hexToHSL(color);
            hsl.s = Math.min(100, hsl.s * 1.5);
            hsl.l = Math.min(90, hsl.l * 1.1);
            return this.hslToHex(hsl.h, hsl.s, hsl.l);
        });
        
        return object;
    }
    
    hexToHSL(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        
        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}

// Initialize morph engine
const GAMIMorph = new MorphEvolutionEngine();

// Export for other modules
if (typeof module !== 'undefined') {
    module.exports = { MorphEvolutionEngine, GAMIMorph };
}