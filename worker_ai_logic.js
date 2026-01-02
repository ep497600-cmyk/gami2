class WorkerAIEngine {
    constructor() {
        this.workers = new Map();
        this.taskQueue = new PriorityQueue();
        this.emergenceMatrix = new Map();
        this.overtimeProtocol = {
            enabled: false,
            speedMultiplier: 4,
            fatigueRate: 0.1,
            overtimeLimit: 8 // hours
        };
        
        this.interestCompounder = {
            baseRate: 0.05,
            compoundingFrequency: 'hourly',
            lastCompound: Date.now()
        };
        
        this.initAISystems();
        this.spawnInitialWorkers();
    }
    
    initAISystems() {
        // Neural network for emergent behavior
        this.neuralNetwork = {
            layers: 3,
            nodesPerLayer: [10, 7, 5],
            weights: this.initializeWeights(),
            biases: this.initializeBiases(),
            
            forwardPass: function(inputs) {
                let current = inputs;
                
                for (let layer = 0; layer < this.layers; layer++) {
                    const newLayer = [];
                    const nodeCount = this.nodesPerLayer[layer];
                    
                    for (let node = 0; node < nodeCount; node++) {
                        let sum = this.biases[layer][node];
                        
                        for (let prevNode = 0; prevNode < current.length; prevNode++) {
                            sum += current[prevNode] * this.weights[layer][prevNode][node];
                        }
                        
                        // ReLU activation
                        newLayer.push(Math.max(0, sum));
                    }
                    
                    current = newLayer;
                }
                
                return current;
            },
            
            mutate: function(mutationRate = 0.1) {
                for (let layer = 0; layer < this.layers; layer++) {
                    for (let i = 0; i < this.weights[layer].length; i++) {
                        for (let j = 0; j < this.weights[layer][i].length; j++) {
                            if (Math.random() < mutationRate) {
                                this.weights[layer][i][j] += (Math.random() - 0.5) * 0.2;
                            }
                        }
                    }
                    
                    for (let j = 0; j < this.biases[layer].length; j++) {
                        if (Math.random() < mutationRate) {
                            this.biases[layer][j] += (Math.random() - 0.5) * 0.1;
                        }
                    }
                }
            }
        };
        
        // Emergence detection system
        this.emergenceDetector = {
            patterns: new Map(),
            threshold: 0.7,
            
            detectEmergence: function(workerStates) {
                const patterns = this.extractPatterns(workerStates);
                const newEmergences = [];
                
                patterns.forEach((frequency, pattern) => {
                    if (frequency > this.threshold && !this.patterns.has(pattern)) {
                        newEmergences.push({
                            pattern: pattern,
                            frequency: frequency,
                            timestamp: Date.now(),
                            workersInvolved: this.getWorkersInPattern(workerStates, pattern)
                        });
                        
                        this.patterns.set(pattern, {
                            firstSeen: Date.now(),
                            frequencyHistory: [frequency],
                            activationCount: 1
                        });
                    } else if (this.patterns.has(pattern)) {
                        const patternData = this.patterns.get(pattern);
                        patternData.frequencyHistory.push(frequency);
                        patternData.activationCount++;
                        patternData.lastActivated = Date.now();
                    }
                });
                
                return newEmergences;
            },
            
            extractPatterns: function(workerStates) {
                const patterns = new Map();
                
                // Extract movement patterns
                const movementPatterns = this.extractMovementPatterns(workerStates);
                movementPatterns.forEach((count, pattern) => {
                    patterns.set(`move_${pattern}`, count / workerStates.length);
                });
                
                // Extract task patterns
                const taskPatterns = this.extractTaskPatterns(workerStates);
                taskPatterns.forEach((count, pattern) => {
                    patterns.set(`task_${pattern}`, count / workerStates.length);
                });
                
                // Extract social patterns
                const socialPatterns = this.extractSocialPatterns(workerStates);
                socialPatterns.forEach((count, pattern) => {
                    patterns.set(`social_${pattern}`, count / workerStates.length);
                });
                
                return patterns;
            },
            
            extractMovementPatterns: function(workerStates) {
                const patterns = new Map();
                
                workerStates.forEach(worker => {
                    if (worker.path && worker.path.length > 2) {
                        const pattern = this.vectorToPattern(worker.path.slice(-3));
                        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
                    }
                });
                
                return patterns;
            },
            
            vectorToPattern: function(vectors) {
                // Convert vector sequence to pattern string
                return vectors.map(v => 
                    `${Math.round(v.x)},${Math.round(v.y)},${Math.round(v.z)}`
                ).join('->');
            },
            
            extractTaskPatterns: function(workerStates) {
                const patterns = new Map();
                
                workerStates.forEach(worker => {
                    if (worker.currentTask && worker.taskHistory) {
                        const recentTasks = worker.taskHistory.slice(-3);
                        const pattern = recentTasks.map(t => t.type).join('->');
                        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
                    }
                });
                
                return patterns;
            },
            
            extractSocialPatterns: function(workerStates) {
                const patterns = new Map();
                
                // Detect clustering
                const clusters = this.detectClusters(workerStates);
                clusters.forEach(cluster => {
                    const pattern = `cluster_${cluster.size}_${Math.round(cluster.center.x)},${Math.round(cluster.center.y)}`;
                    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
                });
                
                return patterns;
            },
            
            detectClusters: function(workerStates, threshold = 5) {
                const clusters = [];
                const visited = new Set();
                
                workerStates.forEach((worker, i) => {
                    if (!visited.has(i)) {
                        const cluster = this.floodFill(workerStates, i, visited, threshold);
                        if (cluster.length > 1) {
                            clusters.push({
                                workers: cluster,
                                size: cluster.length,
                                center: this.calculateClusterCenter(workerStates, cluster)
                            });
                        }
                    }
                });
                
                return clusters;
            },
            
            floodFill: function(workerStates, startIndex, visited, threshold) {
                const cluster = [];
                const stack = [startIndex];
                
                while (stack.length > 0) {
                    const current = stack.pop();
                    
                    if (!visited.has(current)) {
                        visited.add(current);
                        cluster.push(current);
                        
                        // Find neighbors within threshold distance
                        workerStates.forEach((other, otherIndex) => {
                            if (!visited.has(otherIndex)) {
                                const distance = this.calculateDistance(
                                    workerStates[current].position,
                                    other.position
                                );
                                
                                if (distance < threshold) {
                                    stack.push(otherIndex);
                                }
                            }
                        });
                    }
                }
                
                return cluster;
            },
            
            calculateDistance: function(pos1, pos2) {
                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                const dz = pos1.z - pos2.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            },
            
            calculateClusterCenter: function(workerStates, clusterIndices) {
                let sumX = 0, sumY = 0, sumZ = 0;
                
                clusterIndices.forEach(index => {
                    sumX += workerStates[index].position.x;
                    sumY += workerStates[index].position.y;
                    sumZ += workerStates[index].position.z;
                });
                
                return {
                    x: sumX / clusterIndices.length,
                    y: sumY / clusterIndices.length,
                    z: sumZ / clusterIndices.length
                };
            },
            
            getWorkersInPattern: function(workerStates, pattern) {
                const workersInvolved = [];
                
                workerStates.forEach((worker, index) => {
                    if (this.workerMatchesPattern(worker, pattern)) {
                        workersInvolved.push({
                            id: worker.id,
                            index: index,
                            contribution: this.calculatePatternContribution(worker, pattern)
                        });
                    }
                });
                
                return workersInvolved;
            },
            
            workerMatchesPattern: function(worker, pattern) {
                // Check if worker's behavior matches the pattern
                if (pattern.startsWith('move_')) {
                    const workerPattern = this.vectorToPattern(worker.path ? worker.path.slice(-3) : []);
                    return `move_${workerPattern}` === pattern;
                } else if (pattern.startsWith('task_')) {
                    const recentTasks = worker.taskHistory ? worker.taskHistory.slice(-3) : [];
                    const workerPattern = recentTasks.map(t => t.type).join('->');
                    return `task_${workerPattern}` === pattern;
                }
                
                return false;
            },
            
            calculatePatternContribution: function(worker, pattern) {
                // Calculate how much this worker contributes to the pattern
                let contribution = 0;
                
                if (pattern.startsWith('move_')) {
                    const workerPattern = this.vectorToPattern(worker.path ? worker.path.slice(-3) : []);
                    if (`move_${workerPattern}` === pattern) {
                        contribution = 0.7 + (worker.speed || 0.3);
                    }
                } else if (pattern.startsWith('task_')) {
                    const recentTasks = worker.taskHistory ? worker.taskHistory.slice(-3) : [];
                    const workerPattern = recentTasks.map(t => t.type).join('->');
                    if (`task_${workerPattern}` === pattern) {
                        contribution = 0.5 + (worker.efficiency || 0.2);
                    }
                }
                
                return Math.min(1, contribution);
            }
        };
        
        // Task allocation system
        this.taskAllocator = {
            tasks: new Map(),
            workerCapabilities: new Map(),
            
            allocateTask: function(task, availableWorkers) {
                // Find best worker for the task
                let bestWorker = null;
                let bestScore = -Infinity;
                
                availableWorkers.forEach(worker => {
                    const score = this.calculateSuitabilityScore(worker, task);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestWorker = worker;
                    }
                });
                
                if (bestWorker) {
                    task.assignedTo = bestWorker.id;
                    task.assignedAt = Date.now();
                    this.tasks.set(task.id, task);
                    
                    return {
                        success: true,
                        workerId: bestWorker.id,
                        taskId: task.id,
                        estimatedCompletion: this.estimateCompletionTime(bestWorker, task)
                    };
                }
                
                return { success: false, reason: 'No suitable worker found' };
            },
            
            calculateSuitabilityScore: function(worker, task) {
                let score = 0;
                
                // Skill match
                const skillMatch = this.calculateSkillMatch(worker.skills, task.requiredSkills);
                score += skillMatch * 40;
                
                // Distance penalty
                const distance = this.calculateDistance(worker.position, task.location);
                score -= distance * 10;
                
                // Availability bonus
                if (!worker.currentTask) score += 20;
                
                // Efficiency bonus
                score += worker.efficiency * 15;
                
                // Experience with similar tasks
                const experienceBonus = this.calculateExperienceBonus(worker, task);
                score += experienceBonus * 25;
                
                return score;
            },
            
            calculateSkillMatch: function(workerSkills, requiredSkills) {
                let match = 0;
                let total = 0;
                
                requiredSkills.forEach(skill => {
                    total++;
                    if (workerSkills.includes(skill)) {
                        match++;
                    }
                });
                
                return total > 0 ? match / total : 0;
            },
            
            calculateDistance: function(pos1, pos2) {
                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                const dz = pos1.z - pos2.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            },
            
            calculateExperienceBonus: function(worker, task) {
                if (!worker.taskHistory) return 0;
                
                const similarTasks = worker.taskHistory.filter(
                    t => t.type === task.type || t.category === task.category
                );
                
                const successRate = similarTasks.length > 0 ? 
                    similarTasks.filter(t => t.success).length / similarTasks.length : 0;
                
                return successRate * Math.min(1, similarTasks.length / 10);
            },
            
            estimateCompletionTime: function(worker, task) {
                const baseTime = task.estimatedDuration || 1000;
                const efficiencyFactor = worker.efficiency || 0.5;
                const skillFactor = this.calculateSkillMatch(worker.skills, task.requiredSkills);
                
                const time = baseTime / (efficiencyFactor * (0.5 + skillFactor * 0.5));
                
                // Apply overtime multiplier if applicable
                if (worker.overtime && this.overtimeProtocol.enabled) {
                    return time / this.overtimeProtocol.speedMultiplier;
                }
                
                return time;
            }
        };
        
        // Interest compounding system
        this.compoundEngine = {
            principal: BigInt(1000),
            rate: 0.05,
            compoundsPerHour: 4,
            lastCompoundTime: Date.now(),
            
            calculateCompound: function(currentAmount, elapsedHours) {
                const periods = elapsedHours * this.compoundsPerHour;
                const ratePerPeriod = this.rate / this.compoundsPerHour;
                
                // A = P(1 + r/n)^(nt)
                const multiplier = Math.pow(1 + ratePerPeriod, periods);
                const newAmount = BigInt(Math.floor(Number(currentAmount) * multiplier));
                
                return newAmount;
            },
            
            update: function() {
                const now = Date.now();
                const elapsedHours = (now - this.lastCompoundTime) / (1000 * 60 * 60);
                
                if (elapsedHours >= (1 / this.compoundsPerHour)) {
                    this.principal = this.calculateCompound(this.principal, elapsedHours);
                    this.lastCompoundTime = now;
                    
                    return {
                        compounded: true,
                        newAmount: this.principal,
                        elapsedHours: elapsedHours
                    };
                }
                
                return { compounded: false };
            }
        };
    }
    
    initializeWeights() {
        const weights = [];
        
        for (let layer = 0; layer < this.neuralNetwork.layers; layer++) {
            const layerWeights = [];
            const inputSize = layer === 0 ? 8 : this.neuralNetwork.nodesPerLayer[layer - 1];
            const outputSize = this.neuralNetwork.nodesPerLayer[layer];
            
            for (let i = 0; i < inputSize; i++) {
                const nodeWeights = [];
                for (let j = 0; j < outputSize; j++) {
                    nodeWeights.push((Math.random() - 0.5) * 2);
                }
                layerWeights.push(nodeWeights);
            }
            
            weights.push(layerWeights);
        }
        
        return weights;
    }
    
    initializeBiases() {
        const biases = [];
        
        for (let layer = 0; layer < this.neuralNetwork.layers; layer++) {
            const layerBiases = [];
            const nodeCount = this.neuralNetwork.nodesPerLayer[layer];
            
            for (let i = 0; i < nodeCount; i++) {
                layerBiases.push((Math.random() - 0.5) * 0.5);
            }
            
            biases.push(layerBiases);
        }
        
        return biases;
    }
    
    spawnInitialWorkers() {
        const initialCount = 5;
        
        for (let i = 0; i < initialCount; i++) {
            this.spawnWorker({
                id: `worker_${Date.now()}_${i}`,
                type: 'delivery',
                position: { x: i * 5, y: 0, z: 0 },
                skills: ['delivery', 'navigation', 'customer_service'],
                efficiency: 0.5 + Math.random() * 0.5,
                stamina: 100,
                experience: 0,
                level: 1
            });
        }
    }
    
    spawnWorker(config) {
        const worker = {
            id: config.id,
            type: config.type,
            position: config.position,
            skills: config.skills || [],
            efficiency: config.efficiency || 0.5,
            stamina: config.stamina || 100,
            experience: config.experience || 0,
            level: config.level || 1,
            currentTask: null,
            taskHistory: [],
            path: [],
            state: 'idle',
            overtime: false,
            overtimeHours: 0,
            earnings: BigInt(0),
            neuralState: this.initializeNeuralState(),
            lastUpdate: Date.now(),
            updateInterval: 1000 // ms
        };
        
        this.workers.set(worker.id, worker);
        
        // Start AI update loop for this worker
        this.startWorkerAI(worker.id);
        
        return worker;
    }
    
    initializeNeuralState() {
        return {
            inputs: new Array(8).fill(0),
            outputs: new Array(5).fill(0),
            memory: new Array(3).fill(0),
            reward: 0,
            explorationRate: 0.3,
            lastAction: null
        };
    }
    
    startWorkerAI(workerId) {
        const updateWorker = () => {
            const worker = this.workers.get(workerId);
            if (!worker) return;
            
            const now = Date.now();
            const deltaTime = now - worker.lastUpdate;
            
            if (deltaTime >= worker.updateInterval) {
                this.updateWorkerAI(worker, deltaTime);
                worker.lastUpdate = now;
                
                // Apply interest compounding to worker earnings
                this.compoundWorkerEarnings(worker, deltaTime);
            }
            
            // Continue update loop
            setTimeout(updateWorker, 100);
        };
        
        updateWorker();
    }
    
    updateWorkerAI(worker, deltaTime) {
        // Prepare neural network inputs
        this.prepareNeuralInputs(worker);
        
        // Get AI decision
        const decision = this.neuralNetwork.forwardPass(worker.neuralState.inputs);
        worker.neuralState.outputs = decision;
        
        // Interpret outputs and take action
        this.executeAIDecision(worker, decision);
        
        // Update worker state
        this.updateWorkerState(worker, deltaTime);
        
        // Check for emergent patterns
        this.checkEmergentBehavior(worker);
        
        // Apply overtime protocol if active
        if (this.overtimeProtocol.enabled && worker.overtime) {
            this.applyOvertimeProtocol(worker, deltaTime);
        }
    }
    
    prepareNeuralInputs(worker) {
        const inputs = [];
        
        // Input 0-2: Position (normalized)
        inputs.push(worker.position.x / 100);
        inputs.push(worker.position.y / 50);
        inputs.push(worker.position.z / 100);
        
        // Input 3: Has task (0 or 1)
        inputs.push(worker.currentTask ? 1 : 0);
        
        // Input 4: Efficiency level
        inputs.push(worker.efficiency);
        
        // Input 5: Stamina level (0-1)
        inputs.push(worker.stamina / 100);
        
        // Input 6: Overtime status
        inputs.push(worker.overtime ? 1 : 0);
        
        // Input 7: Memory (average of memory cells)
        inputs.push(worker.neuralState.memory.reduce((a, b) => a + b, 0) / 3);
        
        worker.neuralState.inputs = inputs;
    }
    
    executeAIDecision(worker, decision) {
        // decision[0]: Move intensity (0-1)
        // decision[1]: Task focus (0-1)
        // decision[2]: Social interaction (0-1)
        // decision[3]: Rest need (0-1)
        // decision[4]: Explore vs exploit (0-1)
        
        const actionThreshold = 0.5;
        
        if (decision[0] > actionThreshold && !worker.currentTask) {
            // Move randomly or explore
            this.performMovement(worker, decision[0]);
        }
        
        if (decision[1] > actionThreshold && !worker.currentTask) {
            // Look for tasks
            this.seekTask(worker);
        }
        
        if (decision[2] > actionThreshold) {
            // Social interaction
            this.socialInteraction(worker);
        }
        
        if (decision[3] > actionThreshold && worker.stamina < 30) {
            // Take rest
            this.rest(worker);
        }
        
        // Update memory
        worker.neuralState.memory = [
            decision[0],
            decision[1],
            decision[2]
        ];
        
        worker.neuralState.lastAction = {
            type: this.getActionType(decision),
            timestamp: Date.now(),
            decisionValues: decision
        };
    }
    
    getActionType(decision) {
        const maxIndex = decision.indexOf(Math.max(...decision));
        const types = ['move', 'task', 'social', 'rest', 'explore'];
        return types[maxIndex] || 'idle';
    }
    
    performMovement(worker, intensity) {
        // Generate random movement direction
        const angle = Math.random() * Math.PI * 2;
        const distance = intensity * 5;
        
        const newPosition = {
            x: worker.position.x + Math.cos(angle) * distance,
            y: worker.position.y,
            z: worker.position.z + Math.sin(angle) * distance
        };
        
        // Update path history
        worker.path.push({
            from: { ...worker.position },
            to: { ...newPosition },
            timestamp: Date.now()
        });
        
        // Keep path history manageable
        if (worker.path.length > 10) {
            worker.path.shift();
        }
        
        worker.position = newPosition;
        
        // Consume stamina
        worker.stamina = Math.max(0, worker.stamina - distance * 0.1);
    }
    
    seekTask(worker) {
        // Check task queue for available tasks
        const availableTask = this.taskQueue.peek();
        
        if (availableTask && this.taskAllocator.calculateSuitabilityScore(worker, availableTask) > 30) {
            const allocation = this.taskAllocator.allocateTask(availableTask, [worker]);
            
            if (allocation.success) {
                worker.currentTask = availableTask;
                this.taskQueue.dequeue();
                
                // Log task assignment
                worker.taskHistory.push({
                    taskId: availableTask.id,
                    type: availableTask.type,
                    assignedAt: Date.now(),
                    success: null // Will be updated on completion
                });
            }
        }
    }
    
    socialInteraction(worker) {
        // Find nearby workers
        const nearbyWorkers = [];
        
        this.workers.forEach(otherWorker => {
            if (otherWorker.id !== worker.id) {
                const distance = this.calculateDistance(worker.position, otherWorker.position);
                if (distance < 10) {
                    nearbyWorkers.push(otherWorker);
                }
            }
        });
        
        if (nearbyWorkers.length > 0) {
            // Simple social interaction - share knowledge
            const randomWorker = nearbyWorkers[Math.floor(Math.random() * nearbyWorkers.length)];
            
            // Exchange efficiency tips
            const efficiencyExchange = (randomWorker.efficiency - worker.efficiency) * 0.1;
            worker.efficiency = Math.max(0.1, Math.min(1, worker.efficiency + efficiencyExchange));
            
            // Small stamina boost from socializing
            worker.stamina = Math.min(100, worker.stamina + 5);
        }
    }
    
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    rest(worker) {
        // Rest to regain stamina
        const staminaGain = 20;
        worker.stamina = Math.min(100, worker.stamina + staminaGain);
        
        // Small chance to increase efficiency through rest
        if (Math.random() < 0.1) {
            worker.efficiency = Math.min(1, worker.efficiency + 0.01);
        }
    }
    
    updateWorkerState(worker, deltaTime) {
        // Update task progress if worker has a task
        if (worker.currentTask) {
            this.updateTaskProgress(worker, deltaTime);
        }
        
        // Natural stamina regeneration
        if (!worker.currentTask && worker.stamina < 100) {
            worker.stamina = Math.min(100, worker.stamina + 0.1 * (deltaTime / 1000));
        }
        
        // Experience gain
        if (worker.currentTask) {
            worker.experience += 0.01 * (deltaTime / 1000);
        }
        
        // Level up check
        if (worker.experience >= worker.level * 10) {
            this.levelUpWorker(worker);
        }
    }
    
    updateTaskProgress(worker, deltaTime) {
        if (!worker.currentTask) return;
        
        const task = worker.currentTask;
        const efficiencyMultiplier = worker.efficiency;
        
        // Apply overtime speed boost
        const speedMultiplier = worker.overtime ? 
            this.overtimeProtocol.speedMultiplier : 1;
        
        const progressRate = efficiencyMultiplier * speedMultiplier * (deltaTime / 1000);
        
        task.progress = (task.progress || 0) + progressRate;
        
        // Check for task completion
        if (task.progress >= 1) {
            this.completeTask(worker, task);
        }
    }
    
    completeTask(worker, task) {
        // Calculate earnings
        const baseEarnings = task.reward || BigInt(100);
        const efficiencyBonus = BigInt(Math.floor(Number(baseEarnings) * worker.efficiency));
        const overtimeBonus = worker.overtime ? 
            BigInt(Math.floor(Number(baseEarnings) * 0.5)) : BigInt(0);
        
        const totalEarnings = baseEarnings + efficiencyBonus + overtimeBonus;
        
        worker.earnings += totalEarnings;
        worker.experience += 1;
        
        // Update task history
        const taskRecord = worker.taskHistory.find(t => t.taskId === task.id);
        if (taskRecord) {
            taskRecord.completedAt = Date.now();
            taskRecord.success = true;
            taskRecord.earnings = totalEarnings;
        }
        
        // Clear current task
        worker.currentTask = null;
        
        // Reward AI
        worker.neuralState.reward += 1;
        
        // Mutate neural network based on success
        if (worker.neuralState.reward > 5) {
            this.neuralNetwork.mutate(0.05);
            worker.neuralState.reward = 0;
        }
        
        return totalEarnings;
    }
    
    levelUpWorker(worker) {
        worker.level++;
        worker.experience = 0;
        
        // Level up bonuses
        worker.efficiency = Math.min(1, worker.efficiency + 0.05);
        worker.stamina = 100;
        
        // Unlock new skills
        const newSkill = this.getSkillForLevel(worker.level);
        if (newSkill && !worker.skills.includes(newSkill)) {
            worker.skills.push(newSkill);
        }
        
        console.log(`Worker ${worker.id} leveled up to level ${worker.level}`);
    }
    
    getSkillForLevel(level) {
        const skillMap = {
            2: 'quick_learner',
            3: 'time_management',
            5: 'leadership',
            8: 'strategic_planning',
            10: 'ai_training'
        };
        
        return skillMap[level] || null;
    }
    
    checkEmergentBehavior(worker) {
        // Collect state of all workers
        const workerStates = Array.from(this.workers.values());
        
        // Detect emergence
        const newEmergences = this.emergenceDetector.detectEmergence(workerStates);
        
        newEmergences.forEach(emergence => {
            this.handleEmergence(emergence);
        });
    }
    
    handleEmergence(emergence) {
        console.log(`Emergent behavior detected: ${emergence.pattern}`, emergence);
        
        // Store in emergence matrix
        this.emergenceMatrix.set(emergence.pattern, emergence);
        
        // Apply benefits from emergence
        emergence.workersInvolved.forEach(involved => {
            const worker = this.workers.get(involved.id);
            if (worker) {
                // Boost efficiency based on contribution
                worker.efficiency = Math.min(1, 
                    worker.efficiency + (involved.contribution * 0.05)
                );
                
                // Bonus earnings
                const bonus = BigInt(Math.floor(involved.contribution * 100));
                worker.earnings += bonus;
                
                // Experience boost
                worker.experience += involved.contribution;
            }
        });
    }
    
    applyOvertimeProtocol(worker, deltaTime) {
        const overtimeHours = deltaTime / (1000 * 60 * 60);
        worker.overtimeHours += overtimeHours;
        
        // Apply fatigue
        worker.stamina = Math.max(0, 
            worker.stamina - (this.overtimeProtocol.fatigueRate * overtimeHours)
        );
        
        // Check overtime limit
        if (worker.overtimeHours >= this.overtimeProtocol.overtimeLimit) {
            // Force rest
            worker.overtime = false;
            worker.overtimeHours = 0;
            worker.stamina = 20; // Exhausted
            
            console.log(`Worker ${worker.id} reached overtime limit and is forced to rest`);
        }
    }
    
    compoundWorkerEarnings(worker, deltaTime) {
        const compoundResult = this.compoundEngine.update();
        
        if (compoundResult.compounded) {
            // Apply compounding to worker's earnings
            const earnings = worker.earnings;
            const compounded = this.compoundEngine.calculateCompound(
                earnings,
                compoundResult.elapsedHours
            );
            
            worker.earnings = compounded;
        }
    }
    
    toggleOvertimeProtocol(enabled) {
        this.overtimeProtocol.enabled = enabled;
        
        if (enabled) {
            console.log('Overtime protocol activated (4x speed)');
        } else {
            console.log('Overtime protocol deactivated');
            
            // Reset overtime for all workers
            this.workers.forEach(worker => {
                worker.overtime = false;
                worker.overtimeHours = 0;
            });
        }
    }
    
    addTask(task) {
        const taskWithId = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...task,
            created: Date.now(),
            progress: 0,
            assignedTo: null
        };
        
        this.taskQueue.enqueue(taskWithId, task.priority || 1);
        return taskWithId;
    }
    
    getWorkerStats() {
        const stats = {
            totalWorkers: this.workers.size,
            activeWorkers: Array.from(this.workers.values()).filter(w => w.currentTask).length,
            totalEarnings: BigInt(0),
            averageEfficiency: 0,
            totalExperience: 0,
            emergencesDetected: this.emergenceMatrix.size,
            overtimeActive: this.overtimeProtocol.enabled
        };
        
        let totalEfficiency = 0;
        let totalExperience = 0;
        
        this.workers.forEach(worker => {
            stats.totalEarnings += worker.earnings;
            totalEfficiency += worker.efficiency;
            totalExperience += worker.experience;
        });
        
        stats.averageEfficiency = totalEfficiency / stats.totalWorkers;
        stats.totalExperience = totalExperience;
        
        return stats;
    }
}

// Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.queue = [];
    }
    
    enqueue(item, priority) {
        this.queue.push({ item, priority });
        this.queue.sort((a, b) => b.priority - a.priority);
    }
    
    dequeue() {
        return this.queue.shift()?.item;
    }
    
    peek() {
        return this.queue[0]?.item;
    }
    
    isEmpty() {
        return this.queue.length === 0;
    }
    
    size() {
        return this.queue.length;
    }
}

// Initialize worker AI engine
const GAMIWorkers = new WorkerAIEngine();

// Export for other modules
if (typeof module !== 'undefined') {
    module.exports = { WorkerAIEngine, GAMIWorkers };
}