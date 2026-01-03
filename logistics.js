// logistics.js - GAMI Project
// Version: 1.0.0
// Description: Infinite supply logistics system with automated delivery and stock management
// Integrates with economy.js sales system and worker_manager.js for material handling

const GAMILogistics = {
    // Configuration
    config: {
        truckCapacity: 1000, // Units per delivery
        deliveryInterval: 30000, // 30 seconds in milliseconds
        restockThreshold: 0.3, // 30% stock triggers restock
        fullStockThreshold: 0.9, // 90% stock considered full
        glowIntensity: 0.8, // Visual feedback intensity
        dockPositions: [],
        activeDeliveries: new Map(),
        shopStockStatus: new Map(),
        isSystemActive: false,
        deliveryQueue: []
    },

    // Truck definitions
    trucks: {
        infiniteWhiteTruck: {
            id: 'truck_infinity_white',
            model: null,
            capacity: 1000,
            color: 0xFFFFFF,
            currentLoad: 0,
            isAtDock: false,
            deliveryProgress: 0,
            currentDestination: null
        }
    },

    // Materials database
    materials: {
        raw_materials: {
            id: 'mat_raw',
            name: 'Raw Materials',
            weight: 1,
            value: 10,
            stock: 0
        },
        electronics: {
            id: 'mat_elec',
            name: 'Electronics',
            weight: 0.5,
            value: 50,
            stock: 0
        },
        textiles: {
            id: 'mat_text',
            name: 'Textiles',
            weight: 0.3,
            value: 30,
            stock: 0
        },
        machinery: {
            id: 'mat_mach',
            name: 'Machinery Parts',
            weight: 2,
            value: 100,
            stock: 0
        }
    },

    // System initialization
    initialize: function() {
        console.log('GAMI Logistics System Initializing...');
        
        // Check dependencies
        if (!this.checkDependencies()) {
            console.error('Logistics system: Required dependencies not found');
            return false;
        }
        
        // Setup dock positions
        this.setupDockPositions();
        
        // Create infinite white truck
        this.createInfiniteTruck();
        
        // Start delivery system
        this.startDeliverySystem();
        
        // Connect to economy sales system
        this.connectToEconomySystem();
        
        // Setup shop monitoring
        this.setupShopMonitoring();
        
        this.config.isSystemActive = true;
        console.log('GAMI Logistics System Ready');
        return true;
    },

    // Check for required systems
    checkDependencies: function() {
        const dependencies = [
            window.GAMIEconomy,
            window.WorkerManager,
            window.WORLD_3D
        ];
        
        return dependencies.every(dep => dep !== undefined);
    },

    // Setup dock positions in the world
    setupDockPositions: function() {
        // Default dock position (can be configured via world editor)
        this.config.dockPositions.push({
            id: 'main_dock_1',
            position: { x: 50, y: 0, z: 50 },
            rotation: { x: 0, y: 0, z: 0 },
            isOccupied: false,
            currentTruck: null
        });
        
        console.log('Logistics: Dock positions initialized');
    },

    // Create the infinite white delivery truck
    createInfiniteTruck: function() {
        const truckConfig = this.trucks.infiniteWhiteTruck;
        
        try {
            // Create truck model using existing world_3d.js system
            if (window.WORLD_3D && window.WORLD_3D.createObject) {
                truckConfig.model = window.WORLD_3D.createObject({
                    type: 'vehicle_truck',
                    position: truckConfig.position || { x: 100, y: 0, z: 100 },
                    rotation: truckConfig.rotation || { x: 0, y: 0, z: 0 },
                    scale: { x: 1.5, y: 1.5, z: 1.5 },
                    color: truckConfig.color,
                    properties: {
                        isDeliveryTruck: true,
                        infiniteSupply: true,
                        currentLoad: 0
                    }
                });
                
                // Add truck to scene
                if (window.WORLD_3D.getScene()) {
                    window.WORLD_3D.getScene().add(truckConfig.model);
                }
                
                console.log('Logistics: Infinite White Truck created');
            }
        } catch (error) {
            console.error('Logistics: Failed to create truck model:', error);
        }
    },

    // Start the automated delivery system
    startDeliverySystem: function() {
        // Initial delivery
        this.scheduleDelivery();
        
        // Set up periodic deliveries
        setInterval(() => {
            this.processDeliveryQueue();
        }, this.config.deliveryInterval);
        
        console.log('Logistics: Delivery system started');
    },

    // Schedule a new delivery
    scheduleDelivery: function(destinationShop = null) {
        const deliveryId = 'delivery_' + Date.now();
        
        const delivery = {
            id: deliveryId,
            truckId: 'truck_infinity_white',
            destination: destinationShop,
            materials: this.generateDeliveryMaterials(),
            status: 'scheduled',
            scheduledTime: Date.now(),
            estimatedArrival: Date.now() + 15000, // 15 seconds delivery time
            priority: destinationShop ? 'high' : 'normal'
        };
        
        this.config.deliveryQueue.push(delivery);
        this.config.activeDeliveries.set(deliveryId, delivery);
        
        console.log(`Logistics: Delivery ${deliveryId} scheduled`);
        
        // Process immediately if high priority
        if (delivery.priority === 'high') {
            this.processDelivery(delivery);
        }
        
        return deliveryId;
    },

    // Process delivery queue
    processDeliveryQueue: function() {
        if (this.config.deliveryQueue.length === 0) {
            // Schedule standard delivery if queue is empty
            this.scheduleDelivery();
            return;
        }
        
        // Process next delivery in queue
        const nextDelivery = this.config.deliveryQueue.shift();
        if (nextDelivery) {
            this.processDelivery(nextDelivery);
        }
    },

    // Process individual delivery
    processDelivery: function(delivery) {
        if (!delivery || delivery.status !== 'scheduled') return;
        
        const truck = this.trucks.infiniteWhiteTruck;
        delivery.status = 'in_transit';
        
        // Animate truck movement to dock
        this.animateTruckToDock(truck, delivery)
            .then(() => {
                // Truck arrived at dock
                delivery.status = 'at_dock';
                truck.isAtDock = true;
                
                // Unload materials (instant - infinite supply)
                this.unloadMaterials(delivery);
                
                // Assign workers to handle materials
                this.assignWorkersToUnload(delivery);
                
                // After unloading, truck leaves
                setTimeout(() => {
                    this.animateTruckDeparture(truck);
                    delivery.status = 'completed';
                    truck.isAtDock = false;
                    
                    // Update shop stock
                    if (delivery.destination) {
                        this.updateShopStock(delivery.destination, delivery.materials);
                    }
                    
                    // Remove from active deliveries
                    this.config.activeDeliveries.delete(delivery.id);
                    
                }, 5000); // 5 seconds at dock
            })
            .catch(error => {
                console.error('Logistics: Delivery failed:', error);
                delivery.status = 'failed';
            });
    },

    // Animate truck movement to dock
    animateTruckToDock: function(truck, delivery) {
        return new Promise((resolve) => {
            if (!truck.model) {
                resolve();
                return;
            }
            
            // Get dock position
            const dock = this.config.dockPositions[0];
            dock.isOccupied = true;
            dock.currentTruck = truck.id;
            
            // Simple animation - move truck to dock position
            // In a full implementation, this would use proper pathfinding
            const targetPosition = dock.position;
            const animationDuration = 3000; // 3 seconds
            
            // Store original position
            const startPosition = {
                x: truck.model.position.x,
                y: truck.model.position.y,
                z: truck.model.position.z
            };
            
            // Animate (simplified - actual implementation would use animation system)
            let startTime = null;
            
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / animationDuration, 1);
                
                // Linear interpolation
                truck.model.position.x = startPosition.x + (targetPosition.x - startPosition.x) * progress;
                truck.model.position.z = startPosition.z + (targetPosition.z - startPosition.z) * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    truck.model.position.x = targetPosition.x;
                    truck.model.position.z = targetPosition.z;
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    },

    // Unload materials from truck
    unloadMaterials: function(delivery) {
        console.log(`Logistics: Unloading ${delivery.materials.length} material types`);
        
        // Infinite supply - always full capacity
        const truck = this.trucks.infiniteWhiteTruck;
        truck.currentLoad = this.config.truckCapacity;
        
        // Update material stocks
        delivery.materials.forEach(material => {
            if (this.materials[material.type]) {
                this.materials[material.type].stock += material.quantity;
            }
        });
        
        // Visual feedback - truck unloading animation
        this.playUnloadingAnimation();
    },

    // Assign workers to handle unloading
    assignWorkersToUnload: function(delivery) {
        if (!window.WorkerManager) {
            console.warn('Logistics: Worker Manager not available');
            return;
        }
        
        // Get available workers
        const availableWorkers = window.WorkerManager.getAvailableWorkers();
        
        if (availableWorkers.length > 0) {
            // Assign first available worker to handle materials
            const worker = availableWorkers[0];
            
            window.WorkerManager.assignTask(worker.id, {
                type: 'unload_delivery',
                location: 'main_dock',
                priority: 'high',
                materials: delivery.materials,
                callback: () => {
                    console.log('Logistics: Worker completed unloading task');
                    this.distributeMaterialsToShops();
                }
            });
        } else {
            // No workers available - materials will auto-distribute after delay
            setTimeout(() => {
                this.distributeMaterialsToShops();
            }, 10000); // 10 second delay
        }
    },

    // Distribute materials to shops
    distributeMaterialsToShops: function() {
        // Get all shops from economy system
        const shops = window.GAMIEconomy ? window.GAMIEconomy.getShops() : [];
        
        shops.forEach(shop => {
            // Check shop stock levels
            const stockLevel = this.getShopStockLevel(shop.id);
            
            if (stockLevel <= this.config.restockThreshold) {
                // Shop needs restocking
                this.restockShop(shop.id);
            }
            
            // Update shop glow status
            this.updateShopGlow(shop.id, stockLevel);
        });
    },

    // Restock specific shop
    restockShop: function(shopId) {
        // Calculate required materials based on shop type
        const requiredMaterials = this.calculateShopRequirements(shopId);
        
        // Schedule high priority delivery for this shop
        this.scheduleDelivery(shopId);
        
        console.log(`Logistics: Restock scheduled for shop ${shopId}`);
    },

    // Calculate shop material requirements
    calculateShopRequirements: function(shopId) {
        // Default requirements - would be based on shop type in full implementation
        return [
            { type: 'raw_materials', quantity: 200 },
            { type: 'electronics', quantity: 50 },
            { type: 'textiles', quantity: 100 }
        ];
    },

    // Update shop stock levels
    updateShopStock: function(shopId, materials) {
        if (!this.config.shopStockStatus.has(shopId)) {
            this.config.shopStockStatus.set(shopId, {
                currentStock: 0,
                maxStock: 1000,
                lastRestock: Date.now(),
                materials: {}
            });
        }
        
        const shopStock = this.config.shopStockStatus.get(shopId);
        
        // Add delivered materials to shop stock
        materials.forEach(material => {
            if (!shopStock.materials[material.type]) {
                shopStock.materials[material.type] = 0;
            }
            shopStock.materials[material.type] += material.quantity;
            shopStock.currentStock += material.quantity;
        });
        
        // Cap at maximum
        if (shopStock.currentStock > shopStock.maxStock) {
            shopStock.currentStock = shopStock.maxStock;
        }
        
        // Update glow status
        this.updateShopGlow(shopId, shopStock.currentStock / shopStock.maxStock);
    },

    // Update shop visual glow based on stock level
    updateShopGlow: function(shopId, stockLevel) {
        // Find shop object in 3D world
        if (!window.WORLD_3D || !window.WORLD_3D.getScene()) return;
        
        const scene = window.WORLD_3D.getScene();
        let shopObject = null;
        
        scene.traverse((object) => {
            if (object.userData && object.userData.shopId === shopId) {
                shopObject = object;
            }
        });
        
        if (!shopObject) return;
        
        // Determine glow color based on stock level
        let glowColor = null;
        let glowIntensity = 0;
        
        if (stockLevel <= this.config.restockThreshold) {
            // Low stock - Red glow
            glowColor = 0xFF0000;
            glowIntensity = this.config.glowIntensity;
        } else if (stockLevel >= this.config.fullStockThreshold) {
            // Full stock - Green glow
            glowColor = 0x00FF00;
            glowIntensity = this.config.glowIntensity * 0.7;
        }
        
        // Apply or remove glow effect
        if (glowColor && glowIntensity > 0) {
            this.applyShopGlow(shopObject, glowColor, glowIntensity);
        } else {
            this.removeShopGlow(shopObject);
        }
    },

    // Apply visual glow to shop
    applyShopGlow: function(shopObject, color, intensity) {
        // Check if glow already exists
        if (shopObject.userData.hasGlow) {
            // Update existing glow
            if (shopObject.userData.glowMaterial) {
                shopObject.userData.glowMaterial.emissive.setHex(color);
                shopObject.userData.glowMaterial.emissiveIntensity = intensity;
            }
        } else {
            // Create new glow effect
            if (shopObject.material) {
                // Clone material for glow effect
                const glowMaterial = shopObject.material.clone();
                glowMaterial.emissive.setHex(color);
                glowMaterial.emissiveIntensity = intensity;
                
                // Store reference
                shopObject.userData.glowMaterial = glowMaterial;
                shopObject.userData.hasGlow = true;
                
                // Apply material
                shopObject.material = glowMaterial;
            }
        }
    },

    // Remove glow from shop
    removeShopGlow: function(shopObject) {
        if (shopObject.userData.hasGlow) {
            // Restore original material or remove emissive properties
            if (shopObject.userData.originalMaterial) {
                shopObject.material = shopObject.userData.originalMaterial;
            } else {
                // Just remove emissive properties
                shopObject.material.emissive.setHex(0x000000);
                shopObject.material.emissiveIntensity = 0;
            }
            
            shopObject.userData.hasGlow = false;
            delete shopObject.userData.glowMaterial;
        }
    },

    // Get current stock level for shop
    getShopStockLevel: function(shopId) {
        if (!this.config.shopStockStatus.has(shopId)) {
            return 0;
        }
        
        const shopStock = this.config.shopStockStatus.get(shopId);
        return shopStock.currentStock / shopStock.maxStock;
    },

    // Generate random materials for delivery
    generateDeliveryMaterials: function() {
        const materials = [];
        const materialTypes = Object.keys(this.materials);
        
        // Select 2-3 random material types
        const numTypes = Math.floor(Math.random() * 2) + 2;
        const selectedTypes = [];
        
        while (selectedTypes.length < numTypes) {
            const type = materialTypes[Math.floor(Math.random() * materialTypes.length)];
            if (!selectedTypes.includes(type)) {
                selectedTypes.push(type);
            }
        }
        
        // Generate quantities
        selectedTypes.forEach(type => {
            const quantity = Math.floor(Math.random() * 300) + 100; // 100-400 units
            materials.push({
                type: type,
                quantity: quantity,
                value: this.materials[type].value * quantity
            });
        });
        
        return materials;
    },

    // Animate truck departure from dock
    animateTruckDeparture: function(truck) {
        if (!truck.model) return;
        
        // Free up dock
        const dock = this.config.dockPositions[0];
        dock.isOccupied = false;
        dock.currentTruck = null;
        
        // Move truck away from dock (simplified)
        const departurePosition = {
            x: 100,
            y: 0,
            z: 100
        };
        
        // Simple animation
        const startPosition = {
            x: truck.model.position.x,
            y: truck.model.position.y,
            z: truck.model.position.z
        };
        
        const animationDuration = 3000;
        let startTime = null;
        
        const animateDeparture = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / animationDuration, 1);
            
            truck.model.position.x = startPosition.x + (departurePosition.x - startPosition.x) * progress;
            truck.model.position.z = startPosition.z + (departurePosition.z - startPosition.z) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(animateDeparture);
            }
        };
        
        requestAnimationFrame(animateDeparture);
    },

    // Play unloading animation
    playUnloadingAnimation: function() {
        // Visual feedback for unloading
        if (window.WORLD_3D && window.WORLD_3D.createParticleEffect) {
            window.WORLD_3D.createParticleEffect({
                type: 'unloading',
                position: this.config.dockPositions[0].position,
                duration: 3000,
                color: 0xFFFFFF,
                count: 50
            });
        }
    },

    // Connect to economy sales system
    connectToEconomySystem: function() {
        if (!window.GAMIEconomy) {
            console.warn('Logistics: Economy system not available for connection');
            return;
        }
        
        // Listen for sales events
        window.GAMIEconomy.onSaleCompleted = (saleData) => {
            // Update shop stock after sale
            const shopId = saleData.shopId;
            const quantitySold = saleData.quantity;
            
            if (this.config.shopStockStatus.has(shopId)) {
                const shopStock = this.config.shopStockStatus.get(shopId);
                shopStock.currentStock = Math.max(0, shopStock.currentStock - quantitySold);
                
                // Check if restock needed
                const stockLevel = shopStock.currentStock / shopStock.maxStock;
                this.updateShopGlow(shopId, stockLevel);
                
                if (stockLevel <= this.config.restockThreshold) {
                    this.restockShop(shopId);
                }
            }
        };
        
        console.log('Logistics: Connected to economy system');
    },

    // Setup shop stock monitoring
    setupShopMonitoring: function() {
        // Periodic stock check
        setInterval(() => {
            this.distributeMaterialsToShops();
        }, 60000); // Check every minute
    },

    // Public API methods
    API: {
        // Get logistics status
        getStatus: function() {
            return {
                systemActive: GAMILogistics.config.isSystemActive,
                activeDeliveries: GAMILogistics.config.activeDeliveries.size,
                deliveryQueue: GAMILogistics.config.deliveryQueue.length,
                truckStatus: GAMILogistics.trucks.infiniteWhiteTruck
            };
        },
        
        // Force immediate delivery to specific shop
        requestEmergencyDelivery: function(shopId) {
            return GAMILogistics.scheduleDelivery(shopId);
        },
        
        // Get shop stock information
        getShopStock: function(shopId) {
            return GAMILogistics.config.shopStockStatus.get(shopId) || null;
        },
        
        // Get material inventory
        getMaterialInventory: function() {
            return GAMILogistics.materials;
        },
        
        // Manually trigger stock check
        checkAllShopStock: function() {
            GAMILogistics.distributeMaterialsToShops();
            return true;
        },
        
        // Toggle logistics system
        toggleSystem: function(active) {
            GAMILogistics.config.isSystemActive = active;
            return GAMILogistics.config.isSystemActive;
        }
    }
};

// Auto-initialize when all dependencies are loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (GAMILogistics.checkDependencies()) {
            GAMILogistics.initialize();
        } else {
            console.warn('Logistics: Delaying initialization - waiting for dependencies');
            // Try again after delay
            setTimeout(() => {
                if (GAMILogistics.checkDependencies()) {
                    GAMILogistics.initialize();
                }
            }, 2000);
        }
    }, 1000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAMILogistics;
}

// Make API available globally
if (typeof window !== 'undefined') {
    window.GAMILogistics = GAMILogistics.API;
}

console.log('GAMI Logistics System loaded');