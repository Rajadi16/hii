// gravitational_n_body.js - N-Body Solar System Simulation

// Global variables
let centralMass = 150;
let numPlanets = 5;
let G = 0.8;
let showTrails = true;

let centralStar;
let planets = [];
let trails = [];
const maxTrailLength = 200;

// Disable Matter.js gravity (we calculate our own gravitational forces)
engine.world.gravity.y = 0;
engine.world.gravity.x = 0;

class Planet {
    constructor(mass, distance, speed, color) {
        this.mass = mass;
        this.distance = distance;
        this.speed = speed;
        this.color = color;
        this.body = null;
    }
}

function createNBodySystem(cMass, n) {
    centralMass = cMass;
    numPlanets = n;

    const centerX = 400;
    const centerY = 300;

    const starRadius = Math.sqrt(centralMass) * 2.5;
    centralStar = Bodies.circle(centerX, centerY, starRadius, {
        isStatic: true,
        render: { fillStyle: '#FFA500' }
    });
    Body.setMass(centralStar, centralMass);

    planets = [];
    trails = [];

    const colors = ['#8B4513', '#DAA520', '#4169E1', '#DC143C', '#9370DB', '#20B2AA', '#FF69B4', '#00CED1'];

    for (let i = 0; i < n; i++) {
        const mass = 3 + i * 0.5;
        const distance = 80 + i * 40;
        const speed = 1.5 + i * 0.3;
        const color = colors[i % colors.length];

        const planet = new Planet(mass, distance, speed, color);

        const radius = Math.sqrt(mass) * 2;
        const angle = (i / n) * Math.PI * 2;

        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);

        planet.body = Bodies.circle(x, y, radius, {
            frictionAir: 0,
            friction: 0,
            restitution: 0.9,
            render: { fillStyle: color }
        });

        Body.setMass(planet.body, mass);

        const v = Math.sqrt((G * centralMass) / distance) * speed;
        const vx = -v * Math.sin(angle);
        const vy = v * Math.cos(angle);

        Body.setVelocity(planet.body, { x: vx, y: vy });

        planets.push(planet);
        trails.push([]);
    }

    Composite.add(world, [centralStar, ...planets.map(p => p.body)]);
}

Events.on(engine, 'beforeUpdate', function() {
    if (!centralStar || planets.length === 0) return;

    for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        if (!planet.body) continue;

        applyGravity(planet.body, centralStar, planet.mass, centralMass);

        for (let j = i + 1; j < planets.length; j++) {
            const otherPlanet = planets[j];
            if (!otherPlanet.body) continue;
            applyGravity(planet.body, otherPlanet.body, planet.mass, otherPlanet.mass);
        }

        if (showTrails) {
            trails[i].push({ x: planet.body.position.x, y: planet.body.position.y });
            if (trails[i].length > maxTrailLength) trails[i].shift();
        }
    }
});

function applyGravity(bodyA, bodyB, massA, massB) {
    const dx = bodyB.position.x - bodyA.position.x;
    const dy = bodyB.position.y - bodyA.position.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);

    if (distance > 1) {
        const forceMagnitude = (G * massA * massB) / distanceSquared;
        const forceX = (forceMagnitude * dx) / distance;
        const forceY = (forceMagnitude * dy) / distance;

        Body.applyForce(bodyA, bodyA.position, { x: forceX / massA, y: forceY / massA });
    }
}

Events.on(render, 'afterRender', function() {
    if (!showTrails) return;

    const context = render.context;

    for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        const planet = planets[i];
        if (!planet) continue;

        context.strokeStyle = planet.color;
        context.lineWidth = 1.5;
        context.globalAlpha = 0.3;
        context.beginPath();

        for (let j = 0; j < trail.length; j++) {
            if (j === 0) {
                context.moveTo(trail[j].x, trail[j].y);
            } else {
                context.lineTo(trail[j].x, trail[j].y);
            }
        }
        context.stroke();
    }
    context.globalAlpha = 1.0;
});

function resetScene() {
    Runner.stop(runner);
    Matter.World.clear(engine.world, false);
    createNBodySystem(centralMass, numPlanets);
    ResetGUI();
}

function resetparams() {
    Runner.stop(runner);
    isPlaying = false;
    Matter.World.clear(engine.world, false);
    createNBodySystem(centralMass, numPlanets);
}

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
            max-height: calc(100vh - 100px);
            overflow-y: auto;
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
        .control-group input[type="range"] {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #4D4D4F;
            outline: none;
            -webkit-appearance: none;
        }
        .control-group input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #10A37F;
            cursor: pointer;
        }
        .control-group input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #10A37F;
            cursor: pointer;
            border: none;
        }
        .value-display {
            display: inline-block;
            float: right;
            color: #10A37F;
            font-weight: bold;
        }
        .panel-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #10A37F;
            text-align: center;
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .checkbox-group input[type="checkbox"] {
            margin-right: 10px;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        .info-text {
            font-size: 11px;
            color: #999;
            margin-top: 5px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

function createCustomControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'custom-control-panel';
    panel.innerHTML = `
        <div class="panel-title">N-Body System</div>

        <div class="control-group">
            <label>Central Mass (Star): <span class="value-display" id="cmass-value">${centralMass}</span></label>
            <input type="range" id="cmass-slider" min="100" max="250" step="10" value="${centralMass}">
            <div class="info-text">Mass of central star</div>
        </div>

        <div class="control-group">
            <label>Number of Planets: <span class="value-display" id="nplanets-value">${numPlanets}</span></label>
            <input type="range" id="nplanets-slider" min="2" max="8" step="1" value="${numPlanets}">
            <div class="info-text">Orbiting bodies count</div>
        </div>

        <div class="control-group">
            <label>Gravity Strength: <span class="value-display" id="g-value">${G}</span></label>
            <input type="range" id="g-slider" min="0.3" max="2.0" step="0.1" value="${G}">
            <div class="info-text">Universal gravitational constant</div>
        </div>

        <div class="checkbox-group">
            <input type="checkbox" id="trails-checkbox" ${showTrails ? 'checked' : ''}>
            <label for="trails-checkbox">Show Orbital Trails</label>
        </div>
    `;

    document.body.appendChild(panel);
    attachControlListeners();
}

function attachControlListeners() {
    document.getElementById('cmass-slider').addEventListener('input', function() {
        centralMass = parseFloat(this.value);
        document.getElementById('cmass-value').textContent = centralMass;
        resetparams();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });

    document.getElementById('nplanets-slider').addEventListener('input', function() {
        numPlanets = parseInt(this.value);
        document.getElementById('nplanets-value').textContent = numPlanets;
        resetparams();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });

    document.getElementById('g-slider').addEventListener('input', function() {
        G = parseFloat(this.value);
        document.getElementById('g-value').textContent = G.toFixed(1);
    });

    document.getElementById('trails-checkbox').addEventListener('change', function() {
        showTrails = this.checked;
        if (!showTrails) {
            trails = trails.map(() => []);
        }
    });
}

function ResetGUI() {
    document.getElementById('cmass-slider').value = centralMass;
    document.getElementById('nplanets-slider').value = numPlanets;
    document.getElementById('g-slider').value = G;
    document.getElementById('trails-checkbox').checked = showTrails;

    document.getElementById('cmass-value').textContent = centralMass;
    document.getElementById('nplanets-value').textContent = numPlanets;
    document.getElementById('g-value').textContent = G.toFixed(1);
}

addCustomControlStyles();
createCustomControlPanel();
createNBodySystem(centralMass, numPlanets);
