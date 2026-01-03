// branding.js - GAMI Project
// Creator: mak_07s__ mr asif khan
// Version: 1.0.0
// Description: Branding system for GAMI that applies user's name as "Edition" stickers
// on all vehicles and shops, and displays owner info in AI Prism

// Global branding configuration
const GAMIBranding = {
    currentUser: 'Guest',
    ownerName: 'mak_07s__ mr asif khan',
    brandingEnabled: true,
    editionText: 'Edition',
    stickerColor: '#FFD700',
    textColor: '#000000',
    stickerOpacity: 0.9,
    fontSize: {
        small: 14,
        medium: 18,
        large: 24
    },
    stickerTemplates: {},
    appliedBrands: new Map()
};

// Initialize branding system
function initBrandingSystem() {
    console.log('GAMI Branding System Initializing...');
    
    // Listen for login events from gami_core.js
    if (typeof window !== 'undefined' && window.GAMI_CORE) {
        window.GAMI_CORE.onUserLogin = function(username) {
            setCurrentUser(username);
        };
    } else {
        // Fallback: Check if user is already logged in
        const savedUser = localStorage.getItem('gami_username');
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }
    
    // Create sticker SVG templates
    createStickerTemplates();
    
    console.log('GAMI Branding System Ready');
}

// Set current user and apply branding
function setCurrentUser(username) {
    if (!username || username.trim() === '') {
        console.warn('Invalid username provided for branding');
        return;
    }
    
    GAMIBranding.currentUser = username.trim();
    console.log(`Branding applied for user: ${GAMIBranding.currentUser}`);
    
    // Save to localStorage
    localStorage.setItem('gami_username', GAMIBranding.currentUser);
    
    // Apply branding to all existing objects
    applyBrandingToAllObjects();
    
    // Update AI Prism display
    updateAIPrismDisplay();
}

// Create SVG templates for stickers
function createStickerTemplates() {
    // Small sticker template (for small objects)
    GAMIBranding.stickerTemplates.small = createStickerSVG('small');
    
    // Medium sticker template (for medium objects)
    GAMIBranding.stickerTemplates.medium = createStickerSVG('medium');
    
    // Large sticker template (for large objects)
    GAMIBranding.stickerTemplates.large = createStickerSVG('large');
}

// Create SVG sticker with user's name
function createStickerSVG(size = 'medium') {
    const fontSize = GAMIBranding.fontSize[size] || GAMIBranding.fontSize.medium;
    const width = fontSize * 15;
    const height = fontSize * 5;
    const cornerRadius = fontSize * 0.5;
    
    // Create SVG string
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${GAMIBranding.stickerColor};stop-opacity:${GAMIBranding.stickerOpacity}" />
                    <stop offset="100%" style="stop-color:#FFA500;stop-opacity:${GAMIBranding.stickerOpacity}" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
                </filter>
            </defs>
            <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" 
                  fill="url(#goldGradient)" filter="url(#shadow)" stroke="#B8860B" stroke-width="2"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
                  font-family="Arial, sans-serif" font-weight="bold" 
                  font-size="${fontSize}px" fill="${GAMIBranding.textColor}">
                <!-- Username will be inserted dynamically -->
            </text>
        </svg>
    `;
    
    return svg;
}

// Apply branding to specific object
function applyBrandingToObject(object3D, objectType, size = 'medium') {
    if (!GAMIBranding.brandingEnabled || !object3D) return;
    
    const stickerId = `${objectType}_${object3D.id || Date.now()}`;
    
    // Check if already branded
    if (GAMIBranding.appliedBrands.has(stickerId)) {
        return GAMIBranding.appliedBrands.get(stickerId);
    }
    
    // Create sticker texture
    const stickerTexture = createBrandingTexture(GAMIBranding.currentUser, size);
    
    // Apply to object based on type
    let stickerApplied = false;
    
    if (objectType === 'vehicle') {
        // Apply to vehicle - typically on doors or sides
        stickerApplied = applyVehicleBranding(object3D, stickerTexture);
    } else if (objectType === 'shop') {
        // Apply to shop - typically on windows or signage
        stickerApplied = applyShopBranding(object3D, stickerTexture);
    } else {
        // Generic application for other objects
        stickerApplied = applyGenericBranding(object3D, stickerTexture);
    }
    
    if (stickerApplied) {
        GAMIBranding.appliedBrands.set(stickerId, {
            object: object3D,
            texture: stickerTexture,
            appliedAt: new Date()
        });
        
        console.log(`Branding applied to ${objectType}: ${GAMIBranding.currentUser} ${GAMIBranding.editionText}`);
    }
    
    return stickerApplied;
}

// Create branding texture from SVG
function createBrandingTexture(username, size = 'medium') {
    const template = GAMIBranding.stickerTemplates[size] || createStickerSVG(size);
    
    // Insert username into SVG
    const fontSize = GAMIBranding.fontSize[size] || GAMIBranding.fontSize.medium;
    const brandingText = `${username} ${GAMIBranding.editionText}`;
    
    // Find text element and replace content
    const svgWithText = template.replace(
        '<!-- Username will be inserted dynamically -->',
        brandingText
    );
    
    // Create data URL
    const svgBlob = new Blob([svgWithText], { type: 'image/svg+xml;charset=utf-8' });
    const dataURL = URL.createObjectURL(svgBlob);
    
    // Create texture (assuming Three.js is available)
    let texture = null;
    if (typeof THREE !== 'undefined') {
        const loader = new THREE.TextureLoader();
        texture = loader.load(dataURL);
        texture.name = `branding_${username}_${size}`;
    }
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(dataURL), 1000);
    
    return texture;
}

// Apply branding to vehicle
function applyVehicleBranding(vehicleObject, texture) {
    if (!vehicleObject || !texture) return false;
    
    try {
        // Find suitable mesh for branding (e.g., doors, sides)
        const suitableMeshes = findBrandableMeshes(vehicleObject, ['door', 'side', 'body', 'panel']);
        
        if (suitableMeshes.length > 0) {
            const targetMesh = suitableMeshes[0];
            
            // Create a plane for the sticker
            const stickerGeometry = new THREE.PlaneGeometry(1.5, 0.5);
            const stickerMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
            sticker.name = `branding_sticker_${GAMIBranding.currentUser}`;
            
            // Position sticker on vehicle door/side
            sticker.position.set(0, 0.8, 1.2);
            sticker.rotation.y = Math.PI / 2;
            
            targetMesh.add(sticker);
            return true;
        }
    } catch (error) {
        console.error('Error applying vehicle branding:', error);
    }
    
    return false;
}

// Apply branding to shop
function applyShopBranding(shopObject, texture) {
    if (!shopObject || !texture) return false;
    
    try {
        // Find suitable mesh for branding (e.g., windows, signs)
        const suitableMeshes = findBrandableMeshes(shopObject, ['window', 'sign', 'front', 'door']);
        
        if (suitableMeshes.length > 0) {
            const targetMesh = suitableMeshes[0];
            
            // Create a plane for the sticker
            const stickerGeometry = new THREE.PlaneGeometry(2, 0.7);
            const stickerMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
            sticker.name = `branding_sticker_${GAMIBranding.currentUser}`;
            
            // Position sticker on shop front
            sticker.position.set(0, 1.5, 0);
            
            targetMesh.add(sticker);
            return true;
        }
    } catch (error) {
        console.error('Error applying shop branding:', error);
    }
    
    return false;
}

// Apply generic branding
function applyGenericBranding(object3D, texture) {
    if (!object3D || !texture) return false;
    
    try {
        // Create a plane for the sticker
        const stickerGeometry = new THREE.PlaneGeometry(1, 0.4);
        const stickerMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
        sticker.name = `branding_sticker_${GAMIBranding.currentUser}`;
        
        // Position sticker on object
        sticker.position.set(0, 1, 0);
        
        object3D.add(sticker);
        return true;
    } catch (error) {
        console.error('Error applying generic branding:', error);
        return false;
    }
}

// Find meshes suitable for branding
function findBrandableMeshes(object3D, keywords = []) {
    const suitableMeshes = [];
    
    object3D.traverse((child) => {
        if (child.isMesh) {
            const childName = child.name.toLowerCase();
            
            // Check if mesh name contains any of the keywords
            for (const keyword of keywords) {
                if (childName.includes(keyword.toLowerCase())) {
                    suitableMeshes.push(child);
                    break;
                }
            }
        }
    });
    
    // If no keyword matches found, return the first mesh
    if (suitableMeshes.length === 0) {
        object3D.traverse((child) => {
            if (child.isMesh && suitableMeshes.length === 0) {
                suitableMeshes.push(child);
            }
        });
    }
    
    return suitableMeshes;
}

// Apply branding to all objects in the scene
function applyBrandingToAllObjects() {
    if (!GAMIBranding.brandingEnabled) return;
    
    console.log('Applying branding to all objects...');
    
    // Check if world_3d.js is available
    if (typeof window !== 'undefined' && window.WORLD_3D) {
        const scene = window.WORLD_3D.getScene();
        if (scene) {
            // Find all vehicles and shops in the scene
            scene.traverse((object) => {
                if (object.name && object.name.toLowerCase().includes('vehicle')) {
                    applyBrandingToObject(object, 'vehicle', 'medium');
                } else if (object.name && object.name.toLowerCase().includes('shop')) {
                    applyBrandingToObject(object, 'shop', 'large');
                }
            });
        }
    }
    
    console.log('Branding applied to all objects');
}

// Update AI Prism display with owner and user info
function updateAIPrismDisplay() {
    const prismElement = document.getElementById('ai-prism-display');
    
    if (!prismElement) {
        // Create AI Prism display if it doesn't exist
        createAIPrismDisplay();
        return;
    }
    
    // Update content with rotating owner/user info
    prismElement.innerHTML = `
        <div class="prism-content">
            <div class="owner-info">Owner: ${GAMIBranding.ownerName}</div>
            <div class="user-info">Player: ${GAMIBranding.currentUser}</div>
            <div class="edition-tag">${GAMIBranding.editionText}</div>
        </div>
    `;
    
    // Add rotation animation
    prismElement.style.animation = 'prismRotate 20s infinite linear';
}

// Create AI Prism display element
function createAIPrismDisplay() {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') return;
    
    // Create prism container
    const prismContainer = document.createElement('div');
    prismContainer.id = 'ai-prism-display';
    prismContainer.className = 'ai-prism';
    
    // Add CSS for prism
    const prismCSS = `
        <style>
            .ai-prism {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 200px;
                height: 200px;
                perspective: 1000px;
                z-index: 1000;
            }
            
            .prism-content {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                transform: rotateX(20deg) rotateY(20deg);
            }
            
            .owner-info, .user-info, .edition-tag {
                position: absolute;
                width: 100%;
                text-align: center;
                color: #FFD700;
                font-family: 'Arial', sans-serif;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
                background: rgba(0, 0, 0, 0.7);
                padding: 10px;
                border-radius: 5px;
                border: 2px solid #FFD700;
            }
            
            .owner-info {
                top: 10%;
                font-size: 14px;
            }
            
            .user-info {
                top: 40%;
                font-size: 18px;
            }
            
            .edition-tag {
                top: 70%;
                font-size: 24px;
                color: #FFFFFF;
                background: linear-gradient(45deg, #FFD700, #FFA500);
            }
            
            @keyframes prismRotate {
                0% { transform: rotateX(20deg) rotateY(0deg); }
                100% { transform: rotateX(20deg) rotateY(360deg); }
            }
        </style>
    `;
    
    // Add CSS to document head
    document.head.insertAdjacentHTML('beforeend', prismCSS);
    
    // Add prism to document body
    document.body.appendChild(prismContainer);
    
    // Update display with current info
    updateAIPrismDisplay();
}

// Branding API for external use
const GAMIBrandingAPI = {
    // Set user for branding
    setUser: function(username) {
        setCurrentUser(username);
    },
    
    // Get current user
    getUser: function() {
        return GAMIBranding.currentUser;
    },
    
    // Enable/disable branding
    toggleBranding: function(enabled) {
        GAMIBranding.brandingEnabled = enabled;
        if (enabled) {
            applyBrandingToAllObjects();
        }
        return GAMIBranding.brandingEnabled;
    },
    
    // Apply branding to a specific object
    brandObject: function(object3D, objectType, size) {
        return applyBrandingToObject(object3D, objectType, size);
    },
    
    // Remove branding from object
    removeBranding: function(object3D) {
        if (!object3D) return false;
        
        object3D.traverse((child) => {
            if (child.name && child.name.startsWith('branding_sticker_')) {
                object3D.remove(child);
            }
        });
        
        // Remove from applied brands map
        for (const [key, value] of GAMIBranding.appliedBrands.entries()) {
            if (value.object === object3D) {
                GAMIBranding.appliedBrands.delete(key);
                break;
            }
        }
        
        return true;
    },
    
    // Get branding configuration
    getConfig: function() {
        return { ...GAMIBranding };
    },
    
    // Update branding colors
    updateColors: function(stickerColor, textColor) {
        if (stickerColor) GAMIBranding.stickerColor = stickerColor;
        if (textColor) GAMIBranding.textColor = textColor;
        
        // Recreate templates with new colors
        createStickerTemplates();
        
        // Reapply branding
        if (GAMIBranding.brandingEnabled) {
            applyBrandingToAllObjects();
        }
    }
};

// Initialize branding system when DOM is loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBrandingSystem);
    } else {
        initBrandingSystem();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAMIBrandingAPI;
}

// Make API available globally
if (typeof window !== 'undefined') {
    window.GAMIBranding = GAMIBrandingAPI;
}

console.log('branding.js loaded successfully');