// Multiple Surfaces Friction Simulation - Using Matter.js physics engine

// Uses worldcreation.js for Matter.js setup

// Global variables
let blocks = [];
let appliedForces = [0, 0, 0]; // Individual forces for each block
let surfaceFrictions = [0.1, 0.3, 0.5]; // Friction coefficients for each surface
let blockMasses = [1.0, 1.0, 1.0]; // Mass for each block
let blockColors = ['#f55a3c', '#3d3dc1', '#28ba3e']; // Colors for each block

function multipleSurfacesFriction(force1, force2, force3, surfaceFriction1, surfaceFriction2, surfaceFriction3, mass1, mass2, mass3) {
    appliedForces = [force1, force2, force3];
    surfaceFrictions = [surfaceFriction1, surfaceFriction2, surfaceFriction3];
    blockMasses = [mass1, mass2, mass3];
    
    // Clear existing world
    Matter.World.clear(engine.world, false);
    
    // Set gravity
    engine.world.gravity.y = 1;
    
    // Create ground
    const ground = Matter.Bodies.rectangle(400, 575, 800, 50, {
        isStatic: true,
        render: { fillStyle: '#28ba3eff'}
    });
    
    // Create blocks stacked on top of each other
    blocks = [];
    
    // Bottom block (Block 1)
    const block1 = Matter.Bodies.rectangle(400, 540, 60, 30, {
        mass: blockMasses[0],
        friction: surfaceFrictions[0],
        frictionAir: 0.01,
        inertia: Infinity, // Prevent rotation
        render: { fillStyle: blockColors[0]}
    });
    blocks.push(block1);
    
    // Middle block (Block 2) - stacked on top of block 1
    const block2 = Matter.Bodies.rectangle(400, 510, 60, 30, {
        mass: blockMasses[1],
        friction: surfaceFrictions[1],
        frictionAir: 0.01,
        inertia: Infinity, // Prevent rotation
        render: { fillStyle: blockColors[1]}
    });
    blocks.push(block2);
    
    // Top block (Block 3) - stacked on top of block 2
    const block3 = Matter.Bodies.rectangle(400, 480, 60, 30, {
        mass: blockMasses[2],
        friction: surfaceFrictions[2],
        frictionAir: 0.01,
        inertia: Infinity, // Prevent rotation
        render: { fillStyle: blockColors[2]}
    });
    blocks.push(block3);
    
    // Add all bodies to world
    Matter.World.add(world, [ground, ...blocks]);
    
    // Apply force only when playing
    Matter.Events.on(engine, 'beforeUpdate', function() {
        // Use the global isPlaying variable from script.js
        if (typeof isPlaying !== 'undefined' && isPlaying) {
            // Apply force to each block individually
            for (let i = 0; i < blocks.length; i++) {
                if (blocks[i] && appliedForces[i] > 0) {
                    // Calculate acceleration using Newton's second law: F = ma, so a = F/m
                    // This gives us realistic acceleration based on the applied force and block mass
                    const acceleration = appliedForces[i] / blockMasses[i];
                    
                    // Apply force with proper scaling for Matter.js physics engine
                    // Using a smaller multiplier (0.0001) to create more realistic motion
                    // where 3N force on a 1kg block produces reasonable acceleration
                    const forceX = acceleration * blockMasses[i] * 0.0001;
                    Matter.Body.applyForce(blocks[i], blocks[i].position, { x: forceX, y: 0 });
                }
            }

        }
        
        // Check for friction between blocks
        checkBlockFriction();
    });
}

// Check for friction between blocks
function checkBlockFriction() {
    if (blocks.length >= 2) {
        // Check if blocks are in contact
        for (let i = 0; i < blocks.length - 1; i++) {
            const blockA = blocks[i];
            const blockB = blocks[i + 1];
            
            // Simple proximity check for contact
            const distance = Math.abs(blockA.position.y - blockB.position.y);
            const combinedHeight = (blockA.bounds.max.y - blockA.bounds.min.y + blockB.bounds.max.y - blockB.bounds.min.y) / 2;
            
            // If blocks are in contact, apply friction effect
            if (distance <= combinedHeight + 1) {
                // Apply friction effect between blocks with more realistic value
                // Using a smaller friction effect (0.01) to create subtle inter-block interaction
                // This simulates the friction between block surfaces when they're in contact
                const frictionEffect = 0.01; // Reduced value for more subtle inter-block friction
                
                // If bottom block is moving but top block isn't, apply some drag to top block
                // This simulates how the motion of a bottom block can influence a top block through friction
                if (Math.abs(blockA.velocity.x) > 0.1 && Math.abs(blockB.velocity.x) < Math.abs(blockA.velocity.x)) {
                    // Reduced friction effect for more realistic inter-block interaction
                    const dragForce = -blockB.velocity.x * frictionEffect * 0.0001;
                    Matter.Body.applyForce(blockB, blockB.position, { x: dragForce, y: 0 });
                }
            }

        }
    }
}

// Reset the scene
function resetScene() {
    Matter.Runner.stop(runner);
    isPlaying = false; // Reset play state
    // Clear event handlers to prevent duplicates
    Matter.Events.off(engine, 'beforeUpdate');
    multipleSurfacesFriction(
        appliedForces[0],
        appliedForces[1],
        appliedForces[2],
        surfaceFrictions[0],
        surfaceFrictions[1],
        surfaceFrictions[2],
        blockMasses[0],
        blockMasses[1],
        blockMasses[2]
    );
    // Reset play button to paused state
    if (typeof playPauseBtn !== 'undefined') {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

// Reset parameters
function resetparams() {
    Matter.Runner.stop(runner);
    isPlaying = false; // Reset play state
    // Clear event handlers to prevent duplicates
    Matter.Events.off(engine, 'beforeUpdate');
    multipleSurfacesFriction(
        appliedForces[0],
        appliedForces[1],
        appliedForces[2],
        surfaceFrictions[0],
        surfaceFrictions[1],
        surfaceFrictions[2],
        blockMasses[0],
        blockMasses[1],
        blockMasses[2]
    );
    // Reset play button to paused state
    if (typeof playPauseBtn !== 'undefined') {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

// Add custom control panel styles
function addCustomControlStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #custom-control-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 300px;
            background-color: #202123;
            border: 1px solid #4D4D4F;
            border-radius: 8px;
            color: #ECECF1;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 1000;
            padding: 15px;
        }
        
        .simulation-container {
            margin-right: 340px !important;
        }
        
        .control-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #10A37F;
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        .control-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 12px;
            color: #ECECF1;
        }
        
        .slider-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .slider-container input[type="range"] {
            flex: 1;
            height: 4px;
            background: #4D4D4F;
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
        }
        
        .slider-container input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            background: #10A37F;
            border-radius: 50%;
            cursor: pointer;
        }
        
        .slider-value {
            min-width: 50px;
            text-align: center;
            background-color: #343541;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: #10A37F;
        }
        
        .surface-label {
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #4D4D4F;
        }
    `;
    document.head.appendChild(style);
}

// Create custom control panel
function createCustomControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'custom-control-panel';
    controlPanel.innerHTML = `
        <div class="control-title">Multiple Blocks Friction Controls</div>
        
        <div class="surface-label">Bottom Block</div>
        <div class="control-group">
            <label>Applied Force (N)</label>
            <div class="slider-container">
                <input type="range" id="force1-slider" min="0" max="6" step="0.1" value="${appliedForces[0]}">
                <span class="slider-value" id="force1-value">${appliedForces[0]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Friction Coefficient</label>
            <div class="slider-container">
                <input type="range" id="friction1-slider" min="0" max="1" step="0.01" value="${surfaceFrictions[0]}">
                <span class="slider-value" id="friction1-value">${surfaceFrictions[0]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Block Mass (kg)</label>
            <div class="slider-container">
                <input type="range" id="mass1-slider" min="0.1" max="5.0" step="0.1" value="${blockMasses[0]}">
                <span class="slider-value" id="mass1-value">${blockMasses[0]}</span>
            </div>
        </div>
        
        <div class="surface-label">Middle Block</div>
        <div class="control-group">
            <label>Applied Force (N)</label>
            <div class="slider-container">
                <input type="range" id="force2-slider" min="0" max="6" step="0.1" value="${appliedForces[1]}">
                <span class="slider-value" id="force2-value">${appliedForces[1]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Friction Coefficient</label>
            <div class="slider-container">
                <input type="range" id="friction2-slider" min="0" max="1" step="0.01" value="${surfaceFrictions[1]}">
                <span class="slider-value" id="friction2-value">${surfaceFrictions[1]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Block Mass (kg)</label>
            <div class="slider-container">
                <input type="range" id="mass2-slider" min="0.1" max="5.0" step="0.1" value="${blockMasses[1]}">
                <span class="slider-value" id="mass2-value">${blockMasses[1]}</span>
            </div>
        </div>
        
        <div class="surface-label">Top Block</div>
        <div class="control-group">
            <label>Applied Force (N)</label>
            <div class="slider-container">
                <input type="range" id="force3-slider" min="0" max="6" step="0.1" value="${appliedForces[2]}">
                <span class="slider-value" id="force3-value">${appliedForces[2]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Friction Coefficient</label>
            <div class="slider-container">
                <input type="range" id="friction3-slider" min="0" max="1" step="0.01" value="${surfaceFrictions[2]}">
                <span class="slider-value" id="friction3-value">${surfaceFrictions[2]}</span>
            </div>
        </div>
        <div class="control-group">
            <label>Block Mass (kg)</label>
            <div class="slider-container">
                <input type="range" id="mass3-slider" min="0.1" max="5.0" step="0.1" value="${blockMasses[2]}">
                <span class="slider-value" id="mass3-value">${blockMasses[2]}</span>
            </div>
        </div>

    `;
    
    document.body.appendChild(controlPanel);
    
    // Event listeners - reset simulation when any control changes
    document.getElementById('force1-slider').addEventListener('input', function() {
        appliedForces[0] = parseFloat(this.value);
        document.getElementById('force1-value').textContent = appliedForces[0];
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('force2-slider').addEventListener('input', function() {
        appliedForces[1] = parseFloat(this.value);
        document.getElementById('force2-value').textContent = appliedForces[1];
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('force3-slider').addEventListener('input', function() {
        appliedForces[2] = parseFloat(this.value);
        document.getElementById('force3-value').textContent = appliedForces[2];
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('friction1-slider').addEventListener('input', function() {
        surfaceFrictions[0] = parseFloat(this.value);
        document.getElementById('friction1-value').textContent = surfaceFrictions[0];
        if (blocks[0]) {
            blocks[0].friction = surfaceFrictions[0];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('friction2-slider').addEventListener('input', function() {
        surfaceFrictions[1] = parseFloat(this.value);
        document.getElementById('friction2-value').textContent = surfaceFrictions[1];
        if (blocks[1]) {
            blocks[1].friction = surfaceFrictions[1];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('friction3-slider').addEventListener('input', function() {
        surfaceFrictions[2] = parseFloat(this.value);
        document.getElementById('friction3-value').textContent = surfaceFrictions[2];
        if (blocks[2]) {
            blocks[2].friction = surfaceFrictions[2];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('mass1-slider').addEventListener('input', function() {
        blockMasses[0] = parseFloat(this.value);
        document.getElementById('mass1-value').textContent = blockMasses[0];
        if (blocks[0]) {
            blocks[0].mass = blockMasses[0];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('mass2-slider').addEventListener('input', function() {
        blockMasses[1] = parseFloat(this.value);
        document.getElementById('mass2-value').textContent = blockMasses[1];
        if (blocks[1]) {
            blocks[1].mass = blockMasses[1];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
    
    document.getElementById('mass3-slider').addEventListener('input', function() {
        blockMasses[2] = parseFloat(this.value);
        document.getElementById('mass3-value').textContent = blockMasses[2];
        if (blocks[2]) {
            blocks[2].mass = blockMasses[2];
        }
        resetparams();
        // Reset play button to paused state
        if (typeof playPauseBtn !== 'undefined') {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    });
}

function loadFromJSON(jsonData) {
    if (jsonData.simulation === "multiple_surfaces_friction") {
        appliedForces[0] = jsonData.parameters.applied_force_1 || appliedForces[0];
        appliedForces[1] = jsonData.parameters.applied_force_2 || appliedForces[1];
        appliedForces[2] = jsonData.parameters.applied_force_3 || appliedForces[2];
        surfaceFrictions[0] = jsonData.parameters.surface_friction_1 || surfaceFrictions[0];
        surfaceFrictions[1] = jsonData.parameters.surface_friction_2 || surfaceFrictions[1];
        surfaceFrictions[2] = jsonData.parameters.surface_friction_3 || surfaceFrictions[2];
        blockMasses[0] = jsonData.parameters.block_mass_1 || blockMasses[0];
        blockMasses[1] = jsonData.parameters.block_mass_2 || blockMasses[1];
        blockMasses[2] = jsonData.parameters.block_mass_3 || blockMasses[2];
        
        resetparams();
    }
}

// Initialize everything
addCustomControlStyles();
createCustomControlPanel();
multipleSurfacesFriction(0, 0, 0, 0.1, 0.3, 0.5, 1.0, 1.0, 1.0); // Default parameters

window.resetScene = resetScene;
window.loadSimulationFromJSON = loadFromJSON;
