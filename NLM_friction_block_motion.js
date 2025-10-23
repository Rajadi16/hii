// block-motion.js - YOUR EXACT CODE with Custom Control Panel

//when reset, just the position is changing, im not putting stuff back to initial.
const defaultValues={
    appliedForce : 50,
    friction : 0.3,
    blockMass : 1.0
}
// Global variables
function startSimulation(parameters){

    //step 3: since gemini will return a string, convert it back to an object using JSON.parse() function
    parameters=JSON.parse(parameters);


//step 4 (very important) go through the variables present in parameters and check if any value is null. if its null, assign the default value in the following format (its the most efficient.)
    let appliedForce = parameters?.appliedForce ?? defaultValues.appliedForce;
    let friction = parameters?.friction ?? defaultValues.friction;
    let blockMass = parameters?.blockMass ?? defaultValues.blockMass;
let body;

// ground(common to questions with a ground-this exact code.)
const ground = Bodies.rectangle(400, 575, 800, 50, { isStatic: true, render:{ fillStyle: '#28ba3eff'}});

//block parameters
const movingBlockWidth = 50;
const movingBlockHeight = 50;

// Ground top edge
const groundTop = 550; // center - half height = 550

// Force application state - START WITH FORCE NOT APPLIED
let forceApplied = false;

// Physics tracking variables
let initialTime = 0;
let initialPosition = 0;
// Removed display-related variables

// Canvas text display variables
let canvas, ctx;

function setupCanvas() {
    // Get the Matter.js canvas element
    canvas = render.canvas;
    ctx = canvas.getContext('2d');
}

// Removed drawStatsBox function

function blockMotion(force, frictionVal, mass){
    appliedForce = force;
    friction = frictionVal;
    blockMass = mass;
    
    // Moving block center y (directly on ground)
    let movingBlockY = groundTop - movingBlockHeight / 2;
    
    // Create moving block directly on ground
    body = Bodies.rectangle(100, movingBlockY, movingBlockWidth, movingBlockHeight, {
        restitution: 0.0,
        friction: friction,
        frictionAir: 0, // No air resistance for clean physics
        density: blockMass / (movingBlockWidth * movingBlockHeight),
        inertia: Infinity, // Prevent rotation
        render:{ fillStyle: '#f55a3c'}
    });
    
    // Set initial velocity to zero
    Body.setVelocity(body, { x: 0, y: 0 });
    
    // Store initial conditions for physics calculations
    initialTime = Date.now();
    initialPosition = body.position.x;
    
    // DON'T apply force immediately - wait for play button
    // Force will be applied when isPlaying becomes true
    
    Composite.add(world,[body, ground]);
    
    // Setup canvas for drawing stats if not already done
    if (!ctx) {
        setTimeout(() => {
            setupCanvas();
        }, 100);
    }
    
    // Apply force only when simulation is playing
    Events.on(engine, 'beforeUpdate', function() {
        // Use the global isPlaying variable from script.js
        if (typeof isPlaying !== 'undefined' && isPlaying && !forceApplied && body) {
            // Apply force only once when play button is first pressed
            Body.applyForce(body, body.position, { x: appliedForce / 1000, y: 0 });
            forceApplied = true;
        }
        
        // Reset forceApplied when simulation is paused
        if (typeof isPlaying !== 'undefined' && !isPlaying) {
            forceApplied = false;
        }
    });
}

function resetScene() {//for the reset button
    // Clear the world
    Runner.stop(runner);
    Matter.World.clear(engine.world, false); // keep the engine, just remove bodies
    // Reset force application flag
    forceApplied = false;
    // Recreate the scene
    blockMotion(appliedForce, friction, blockMass);
    ResetGUI();
}

function resetparams(){//for the slider
    Runner.stop(runner);
    isPlaying=false;
    Matter.World.clear(engine.world, false); // keep the engine, just remove bodies
    // Reset force application flag
    forceApplied = false;
    // Recreate the scene
    blockMotion(appliedForce, friction, blockMass);
}

// Removed the Events.on render loop that was drawing the stats box

// ======= REPLACE LIL.GUI WITH CUSTOM CONTROL PANEL =======

function addCustomControlStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #custom-control-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 280px;
            background-color: #202123;
            border: 1px solid #4D4D4F;
            border-radius: 8px;
            color: #ECECF1;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 1000;
            padding: 15px;
        }
        
        .simulation-container {
            margin-right: 320px !important;
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
    `;
    document.head.appendChild(style);
}

function createCustomControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'custom-control-panel';
    controlPanel.innerHTML = `
        <div class="control-title">Block Motion Controls</div>
        
        <div class="control-group">
            <label>Applied Force (N)</label>
            <div class="slider-container">
                <input type="range" id="force-slider" min="0" max="200" step="1" value="${appliedForce}">
                <span class="slider-value" id="force-value">${appliedForce}</span>
            </div>
        </div>
        
        <div class="control-group">
            <label>Friction Coefficient</label>
            <div class="slider-container">
                <input type="range" id="friction-slider" min="0" max="1" step="0.01" value="${friction}">
                <span class="slider-value" id="friction-value">${friction}</span>
            </div>
        </div>
        
        <div class="control-group">
            <label>Block Mass (kg)</label>
            <div class="slider-container">
                <input type="range" id="mass-slider" min="0.1" max="5.0" step="0.1" value="${blockMass}">
                <span class="slider-value" id="mass-value">${blockMass}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(controlPanel);
    
    // Event listeners - EXACT SAME LOGIC AS YOUR lil.GUI
    document.getElementById('force-slider').addEventListener('input', function() {
        appliedForce = parseFloat(this.value);
        document.getElementById('force-value').textContent = appliedForce;
        resetparams();
        if (playPauseBtn) playPauseBtn.innerHTML = '▶';
        console.log("applied force changed");
    });
    
    document.getElementById('friction-slider').addEventListener('input', function() {
        friction = parseFloat(this.value);
        document.getElementById('friction-value').textContent = friction;
        resetparams();
        if (playPauseBtn) playPauseBtn.innerHTML = '▶';
        console.log("friction changed");
    });
    
    document.getElementById('mass-slider').addEventListener('input', function() {
        blockMass = parseFloat(this.value);
        document.getElementById('mass-value').textContent = blockMass;
        resetparams();
        if (playPauseBtn) playPauseBtn.innerHTML = '▶';
        console.log("block mass changed");
    });
}

function ResetGUI() {
    document.getElementById('force-slider').value = appliedForce;
    document.getElementById('friction-slider').value = friction;
    document.getElementById('mass-slider').value = blockMass;
    
    document.getElementById('force-value').textContent = appliedForce;
    document.getElementById('friction-value').textContent = friction;
    document.getElementById('mass-value').textContent = blockMass;
}

function loadFromJSON(jsonData) {
    if (jsonData.simulation === "block_motion") {
        appliedForce = jsonData.parameters.applied_force || appliedForce;
        friction = jsonData.parameters.friction || friction;
        blockMass = jsonData.parameters.mass || blockMass;
        
        resetparams();
        ResetGUI();
    }
}

// Initialize everything - EXACTLY LIKE YOUR ORIGINAL
addCustomControlStyles();
createCustomControlPanel();
blockMotion(50, 0.3, 1.0);

//change the behavior on reset
//physics display now shows for all friction values with complete force analysis including friction calculations

window.resetScene = resetScene;
window.loadSimulationFromJSON = loadFromJSON;
}