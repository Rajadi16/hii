// uniform_circular_motion.js - Custom Control Panel

// Global variables
let circleRadius = 100;
let angularVelocity = 0.05; // Changed from rotationSpeed to angularVelocity (ω)
let objectSize = 15;
let currentAngle = 0;
let movingBody;
// Array to store trail particles
let trailParticles = [];
// Trail settings
const MAX_TRAIL_PARTICLES = 100;
const TRAIL_LIFETIME = 60; // frames

// Center position
const centerX = 400;
const centerY = 300;

// Particle class for trail
class TrailParticle {
    constructor(x, y, life) {
        this.x = x;
        this.y = y;
        this.life = life;
        this.maxLife = life;
    }
    
    update() {
        this.life--;
        return this.life > 0;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(245, 90, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function uniformCircularMotion(radius, omega, size) { // Changed parameter name to omega
    circleRadius = radius;
    angularVelocity = omega; // Changed from rotationSpeed to angularVelocity
    objectSize = size;
    currentAngle = 0;

    // Calculate initial position
    let initialX = centerX + circleRadius * Math.cos(currentAngle);
    let initialY = centerY + circleRadius * Math.sin(currentAngle);

    // Create moving object only (no center dot)
    // Make it static so it's not affected by gravity, but we'll position it manually
    movingBody = Bodies.circle(initialX, initialY, objectSize, {
        isStatic: true, // Make it static to prevent gravity from affecting it
        render: { fillStyle: '#f55a3c' },
        frictionAir: 0,
        friction: 0
    });

    Composite.add(world, [movingBody]);
    
    // Setup motion
    if (window.motionHandler) {
        Events.off(engine, 'beforeUpdate', window.motionHandler);
    }
    
    window.motionHandler = function() {
        currentAngle += angularVelocity; // Changed from rotationSpeed to angularVelocity
        let newX = centerX + circleRadius * Math.cos(currentAngle);
        let newY = centerY + circleRadius * Math.sin(currentAngle);
        Body.setPosition(movingBody, { x: newX, y: newY });
        
        // Add trail particle at current position
        trailParticles.push(new TrailParticle(newX, newY, TRAIL_LIFETIME));
        
        // Limit trail particles
        if (trailParticles.length > MAX_TRAIL_PARTICLES) {
            trailParticles.shift();
        }
    };
    
    Events.on(engine, 'beforeUpdate', window.motionHandler);
}

// Function to draw trail particles
function drawTrail() {
    // Get canvas context from Matter.js renderer
    const ctx = render.context;
    
    // Update and draw trail particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const particle = trailParticles[i];
        if (!particle.update()) {
            trailParticles.splice(i, 1);
        } else {
            particle.draw(ctx);
        }
    }
}

function resetScene() {
    Runner.stop(runner);
    Matter.World.clear(engine.world, false);
    if (window.motionHandler) {
        Events.off(engine, 'beforeUpdate', window.motionHandler);
    }
    // Clear trail particles
    trailParticles = [];
    uniformCircularMotion(circleRadius, angularVelocity, objectSize); // Changed parameter
    ResetGUI();
}

function resetparams() {
    Runner.stop(runner);
    isPlaying = false;
    Matter.World.clear(engine.world, false);
    if (window.motionHandler) {
        Events.off(engine, 'beforeUpdate', window.motionHandler);
    }
    // Clear trail particles
    trailParticles = [];
    uniformCircularMotion(circleRadius, angularVelocity, objectSize); // Changed parameter
}

// Control Panel Styles
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
            min-width: 40px;
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

// Create Control Panel
function createCustomControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'custom-control-panel';
    controlPanel.innerHTML = `
        <div class="control-group">
            <label>Circle Radius</label>
            <div class="slider-container">
                <input type="range" id="radius-slider" min="50" max="200" step="5" value="${circleRadius}">
                <span class="slider-value" id="radius-value">${circleRadius}</span>
            </div>
        </div>
        
        <div class="control-group">
            <label>Angular Velocity (ω)</label> <!-- Changed label -->
            <div class="slider-container">
                <input type="range" id="speed-slider" min="0.01" max="0.15" step="0.01" value="${angularVelocity}"> <!-- Changed id reference -->
                <span class="slider-value" id="speed-value">${angularVelocity}</span> <!-- Changed id reference -->
            </div>
        </div>
        
        <div class="control-group">
            <label>Object Size</label>
            <div class="slider-container">
                <input type="range" id="size-slider" min="5" max="25" step="1" value="${objectSize}">
                <span class="slider-value" id="size-value">${objectSize}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(controlPanel);
    
    // Event listeners
    document.getElementById('radius-slider').addEventListener('input', function() {
        circleRadius = parseFloat(this.value);
        document.getElementById('radius-value').textContent = circleRadius;
        resetparams();
        playPauseBtn.innerHTML = '▶';
    });
    
    document.getElementById('speed-slider').addEventListener('input', function() {
        angularVelocity = parseFloat(this.value); // Changed from rotationSpeed to angularVelocity
        document.getElementById('speed-value').textContent = angularVelocity; // Changed id reference
        resetparams();
        playPauseBtn.innerHTML = '▶';
    });
    
    document.getElementById('size-slider').addEventListener('input', function() {
        objectSize = parseFloat(this.value);
        document.getElementById('size-value').textContent = objectSize;
        resetparams();
        playPauseBtn.innerHTML = '▶';
    });
}

function ResetGUI() {
    document.getElementById('radius-slider').value = circleRadius;
    document.getElementById('speed-slider').value = angularVelocity; // Changed from rotationSpeed to angularVelocity
    document.getElementById('size-slider').value = objectSize;
    document.getElementById('radius-value').textContent = circleRadius;
    document.getElementById('speed-value').textContent = angularVelocity; // Changed id reference
    document.getElementById('size-value').textContent = objectSize;
}

// Hook into the Matter.js render loop to draw trail
Events.on(render, 'afterRender', function() {
    drawTrail();
});

// Initialize
addCustomControlStyles();
createCustomControlPanel();
uniformCircularMotion(100, 0.05, 15);