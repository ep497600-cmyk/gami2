class InfiniteWorldEngine {
    constructor() {
        this.worldSeed = BigInt(Date.now());
        this.currentRadius = BigInt(100); // Starting ₹100 radius
        this.maxRenderDistance = 1000;
        this.chunkSize = 50;
        this.loadedChunks = new Map();
        this.LODLevels = [1, 0.5, 0.25, 0.1];
        this.oxygenLevel = 100;
        this.treeCount = BigInt(1000);
        this.natureCoins = BigInt(0);
        this.proceduralCache = new WeakMap();
        
        // Environmental variables
        this.season = 'autumn';
        this.temperature = 25;
        this.timeOfDay = 12;
        this.weather = 'clear';
        
        this.initProceduralSystems();
    }
    
    initProceduralSystems() {
        // PCG with deterministic seed
        this.noise = new SimplexNoise(this.worldSeed);
        this.biomeMap = new Map();
        this.heightMap = new Map();
        
        // Smart LOD system
        this.LODManager = {
            distances: [100, 300, 700, 1500],
            updateFrequency: 1000,
            lastUpdate: 0,
            
            calculateLOD: function(distance) {
                if (distance < this.distances[0]) return 0;
                if (distance < this.distances[1]) return 1;
                if (distance < this.distances[2]) return 2;
                return 3;
            }
        };
        
        // Infinite expansion logic
        this.expansionEngine = {
            baseCost: BigInt(100),
            growthFactor: 1.15,
            
            calculateExpansionCost: function(currentRadius) {
                // Exponential cost scaling with big integers
                const exponent = Math.floor(Number(currentRadius) / 100);
                const cost = this.baseCost * BigInt(Math.pow(this.growthFactor, exponent));
                return cost > BigInt(Number.MAX_SAFE_INTEGER) ? 
                    BigInt(Number.MAX_SAFE_INTEGER) : cost;
            },
            
            canExpand: function(playerCoins, currentRadius) {
                const cost = this.calculateExpansionCost(currentRadius);
                return playerCoins >= cost;
            }
        };
    }
    
    generateChunk(chunkX, chunkY, LODLevel = 0) {
        const chunkKey = `${chunkX},${chunkY},${LODLevel}`;
        
        if (this.loadedChunks.has(chunkKey)) {
            return this.loadedChunks.get(chunkKey);
        }
        
        // Procedural generation with seed consistency
        const seedX = BigInt(chunkX) ^ this.worldSeed;
        const seedY = BigInt(chunkY) ^ this.worldSeed;
        const chunkSeed = (seedX * BigInt(73856093)) ^ (seedY * BigInt(19349663));
        
        // Generate chunk data with LOD optimization
        const chunkData = {
            id: chunkKey,
            position: { x: chunkX, y: chunkY },
            LOD: LODLevel,
            geometry: this.generateGeometry(chunkX, chunkY, LODLevel, chunkSeed),
            objects: this.generateObjects(chunkX, chunkY, LODLevel, chunkSeed),
            biome: this.determineBiome(chunkX, chunkY, chunkSeed),
            heightMap: this.generateHeightMap(chunkX, chunkY, LODLevel, chunkSeed)
        };
        
        // Apply seasonal and environmental effects
        this.applyEnvironmentalEffects(chunkData);
        
        this.loadedChunks.set(chunkKey, chunkData);
        return chunkData;
    }
    
    generateGeometry(x, y, LOD, seed) {
        const detail = 10 - (LOD * 2); // Reduce detail with higher LOD
        const vertices = [];
        const indices = [];
        
        // Procedural terrain generation
        for (let i = 0; i <= detail; i++) {
            for (let j = 0; j <= detail; j++) {
                const u = i / detail;
                const v = j / detail;
                const worldX = (x * this.chunkSize) + (u * this.chunkSize);
                const worldY = (y * this.chunkSize) + (v * this.chunkSize);
                
                // Noise-based height with multiple octaves
                let height = 0;
                let amplitude = 1;
                let frequency = 0.01;
                
                for (let octave = 0; octave < 4; octave++) {
                    const noiseVal = this.noise.noise2D(
                        (worldX + Number(seed)) * frequency,
                        (worldY + Number(seed)) * frequency
                    );
                    height += noiseVal * amplitude;
                    amplitude *= 0.5;
                    frequency *= 2;
                }
                
                vertices.push(worldX, height * 20, worldY);
                
                if (i < detail && j < detail) {
                    const a = i * (detail + 1) + j;
                    const b = a + 1;
                    const c = a + detail + 1;
                    const d = c + 1;
                    
                    indices.push(a, c, b);
                    indices.push(b, c, d);
                }
            }
        }
        
        return { vertices, indices };
    }
    
    generateObjects(chunkX, chunkY, LOD, seed) {
        const objects = [];
        const objectCount = Math.max(1, 10 - (LOD * 3)); // Fewer objects at higher LOD
        
        // Random but deterministic object placement
        const rng = new SeededRandom(Number(seed));
        
        for (let i = 0; i < objectCount; i++) {
            const typeRoll = rng.next();
            let objectType;
            
            if (typeRoll < 0.3) objectType = 'tree';
            else if (typeRoll < 0.5) objectType = 'rock';
            else if (typeRoll < 0.7) objectType = 'bush';
            else if (typeRoll < 0.9) objectType = 'flower';
            else objectType = 'special';
            
            const object = {
                id: `${chunkX},${chunkY},${i}`,
                type: objectType,
                position: {
                    x: rng.next() * this.chunkSize,
                    y: 0,
                    z: rng.next() * this.chunkSize
                },
                scale: 0.5 + rng.next(),
                rotation: rng.next() * Math.PI * 2,
                seasonalVariants: this.generateSeasonalVariants(objectType, rng)
            };
            
            objects.push(object);
        }
        
        return objects;
    }
    
    generateSeasonalVariants(type, rng) {
        const variants = {
            spring: { color: '#4CAF50', scale: 1 },
            summer: { color: '#388E3C', scale: 1.1 },
            autumn: { color: '#FF9800', scale: 1 },
            winter: { color: '#FFFFFF', scale: 0.9 }
        };
        
        // Add randomness to each variant
        Object.keys(variants).forEach(season => {
            variants[season].colorVariation = `hsl(${Math.floor(rng.next() * 30)}, 70%, ${40 + rng.next() * 20}%)`;
            variants[season].windSway = 0.1 + rng.next() * 0.3;
        });
        
        return variants;
    }
    
    determineBiome(x, y, seed) {
        const temperature = this.noise.noise2D(x * 0.001, y * 0.001);
        const moisture = this.noise.noise2D(x * 0.001 + 1000, y * 0.001 + 1000);
        const altitude = this.noise.noise2D(x * 0.0005, y * 0.0005);
        
        if (altitude > 0.6) return 'mountain';
        if (altitude < -0.3) return 'water';
        if (temperature > 0.5 && moisture < 0.3) return 'desert';
        if (temperature < 0.2 && moisture > 0.5) return 'tundra';
        if (moisture > 0.6) return 'forest';
        return 'plains';
    }
    
    applyEnvironmentalEffects(chunkData) {
        // Apply season effects
        chunkData.objects.forEach(obj => {
            if (obj.seasonalVariants && obj.seasonalVariants[this.season]) {
                const variant = obj.seasonalVariants[this.season];
                obj.currentColor = variant.colorVariation || variant.color;
                obj.currentScale = obj.scale * variant.scale;
            }
        });
        
        // Apply weather effects
        if (this.weather === 'rain') {
            chunkData.wetness = 0.8;
            chunkData.reflectivity = 0.3;
        } else if (this.weather === 'snow') {
            chunkData.snowCover = 1.0;
            chunkData.slipperiness = 0.7;
        }
        
        // Time of day lighting
        const sunIntensity = Math.cos((this.timeOfDay - 12) * Math.PI / 12);
        chunkData.ambientLight = Math.max(0.2, 0.5 + sunIntensity * 0.3);
        chunkData.sunDirection = {
            x: Math.cos(this.timeOfDay * Math.PI / 12),
            y: Math.sin(this.timeOfDay * Math.PI / 12),
            z: 0
        };
    }
    
    updateOxygenSystem() {
        // Oxygen production based on trees
        const oxygenProduction = Number(this.treeCount) * 0.0001;
        const oxygenConsumption = this.getPopulationCount() * 0.001;
        
        this.oxygenLevel = Math.min(100, 
            Math.max(0, this.oxygenLevel + oxygenProduction - oxygenConsumption));
        
        // Bird-Rent system (Nature Coins)
        const birdActivity = Math.min(1, this.oxygenLevel / 50);
        const newNatureCoins = BigInt(Math.floor(birdActivity * 100));
        this.natureCoins += newNatureCoins;
        
        return {
            oxygen: this.oxygenLevel,
            natureCoins: this.natureCoins,
            birdActivity: birdActivity
        };
    }
    
    getPopulationCount() {
        // Calculate total population in the world
        let count = 0;
        this.loadedChunks.forEach(chunk => {
            count += chunk.objects.filter(obj => 
                obj.type === 'building' || obj.type === 'house'
            ).length * 5; // Average 5 people per building
        });
        return count;
    }
    
    expandWorld(coins) {
        const canExpand = this.expansionEngine.canExpand(
            BigInt(coins), 
            this.currentRadius
        );
        
        if (canExpand) {
            const cost = this.expansionEngine.calculateExpansionCost(this.currentRadius);
            this.currentRadius += BigInt(100);
            
            // Generate new perimeter chunks
            this.generatePerimeterChunks();
            
            // Update oxygen system with new space
            this.treeCount += BigInt(100);
            
            return {
                success: true,
                newRadius: this.currentRadius,
                cost: cost,
                newTrees: 100
            };
        }
        
        return { success: false, required: cost };
    }
    
    generatePerimeterChunks() {
        const radiusChunks = Math.ceil(Number(this.currentRadius) / this.chunkSize);
        
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const chunkX = Math.floor(Math.cos(angle) * radiusChunks);
            const chunkY = Math.floor(Math.sin(angle) * radiusChunks);
            
            // Generate chunks at different LOD levels based on distance
            for (let lod = 0; lod < this.LODLevels.length; lod++) {
                const scaledChunkX = Math.floor(chunkX * this.LODLevels[lod]);
                const scaledChunkY = Math.floor(chunkY * this.LODLevels[lod]);
                this.generateChunk(scaledChunkX, scaledChunkY, lod);
            }
        }
    }
    
    update(playerPosition, deltaTime) {
        // Update LOD based on player distance
        this.updateLOD(playerPosition);
        
        // Update environmental systems
        this.updateEnvironment(deltaTime);
        
        // Update nature systems
        const natureUpdate = this.updateOxygenSystem();
        
        // Return world state
        return {
            loadedChunks: this.loadedChunks.size,
            currentRadius: this.currentRadius,
            oxygen: natureUpdate.oxygen,
            natureCoins: natureUpdate.natureCoins,
            season: this.season,
            timeOfDay: this.timeOfDay,
            weather: this.weather
        };
    }
    
    updateLOD(playerPosition) {
        const now = Date.now();
        if (now - this.LODManager.lastUpdate < this.LODManager.updateFrequency) {
            return;
        }
        
        this.LODManager.lastUpdate = now;
        
        this.loadedChunks.forEach((chunk, key) => {
            const chunkCenter = {
                x: (chunk.position.x + 0.5) * this.chunkSize,
                y: (chunk.position.y + 0.5) * this.chunkSize
            };
            
            const distance = Math.sqrt(
                Math.pow(chunkCenter.x - playerPosition.x, 2) +
                Math.pow(chunkCenter.y - playerPosition.y, 2)
            );
            
            const requiredLOD = this.LODManager.calculateLOD(distance);
            
            if (chunk.LOD !== requiredLOD) {
                // Regenerate chunk at new LOD
                const newChunk = this.generateChunk(
                    chunk.position.x,
                    chunk.position.y,
                    requiredLOD
                );
                this.loadedChunks.set(key, newChunk);
            }
        });
    }
    
    updateEnvironment(deltaTime) {
        // Simulate day/night cycle (24 minutes real-time = 24 hours game time)
        this.timeOfDay = (this.timeOfDay + (deltaTime / 60000)) % 24;
        
        // Seasonal changes (15 minutes real-time = 1 season)
        const seasonDuration = 15; // minutes
        const totalMinutes = Date.now() / (1000 * 60);
        const seasonIndex = Math.floor(totalMinutes / seasonDuration) % 4;
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        this.season = seasons[seasonIndex];
        
        // Weather simulation
        this.updateWeather(deltaTime);
        
        // Update temperature based on season and time
        this.updateTemperature();
    }
    
    updateWeather(deltaTime) {
        // Simple weather simulation
        const weatherChangeChance = 0.001 * (deltaTime / 1000);
        
        if (Math.random() < weatherChangeChance) {
            const weatherTypes = ['clear', 'cloudy', 'rain', 'snow'];
            const weights = [0.4, 0.3, 0.2, 0.1];
            
            let rand = Math.random();
            let cumulative = 0;
            
            for (let i = 0; i < weatherTypes.length; i++) {
                cumulative += weights[i];
                if (rand < cumulative) {
                    this.weather = weatherTypes[i];
                    break;
                }
            }
        }
    }
    
    updateTemperature() {
        const seasonTemps = {
            spring: 20,
            summer: 30,
            autumn: 15,
            winter: 5
        };
        
        const baseTemp = seasonTemps[this.season];
        const timeAdjustment = Math.cos((this.timeOfDay - 14) * Math.PI / 12) * 10;
        
        this.temperature = baseTemp + timeAdjustment;
        
        if (this.weather === 'rain') this.temperature -= 3;
        if (this.weather === 'snow') this.temperature = Math.min(this.temperature, 0);
    }
}

// Helper classes
class SimplexNoise {
    constructor(seed) {
        this.seed = Number(seed) % 2147483647;
        this.grad3 = [
            [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
            [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
            [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
        ];
        this.perm = new Array(512);
        this.initPermutation();
    }
    
    initPermutation() {
        const p = new Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        
        // Shuffle with seed
        for (let i = 255; i > 0; i--) {
            const n = (this.seed + i) % (i + 1);
            [p[i], p[n]] = [p[n], p[i]];
        }
        
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
        }
    }
    
    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        
        let s = (xin + yin) * F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        
        let t = (i + j) * G2;
        let X0 = i - t;
        let Y0 = j - t;
        let x0 = xin - X0;
        let y0 = yin - Y0;
        
        let i1, j1;
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }
        
        let x1 = x0 - i1 + G2;
        let y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2;
        let y2 = y0 - 1 + 2 * G2;
        
        ii = i & 255;
        jj = j & 255;
        
        let gi0 = this.perm[ii + this.perm[jj]] % 12;
        let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        let n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * this.dot(this.grad3[gi0], x0, y0);
        
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        let n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * this.dot(this.grad3[gi1], x1, y1);
        
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        let n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * this.dot(this.grad3[gi2], x2, y2);
        
        return 70 * (n0 + n1 + n2);
    }
    
    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }
}

class SeededRandom {
    constructor(seed) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}

// Initialize world engine
const GAMIWorld = new InfiniteWorldEngine();

// Export for other modules
if (typeof module !== 'undefined') {
    module.exports = { InfiniteWorldEngine, GAMIWorld };
}