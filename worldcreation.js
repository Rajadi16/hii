const {
  Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint,
  Constraint, Composite, Events, Body
} = Matter;

// create engine and world
let engine = Engine.create();
let world = engine.world;

// create renderer
let render = Render.create({
  element: document.querySelector('.simulation-container'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#222'
  }
});

// create mouse constraint
let mouse = Mouse.create(render.canvas);
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
});

// Add mouse constraint to world
World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

Render.run(render);

// runner
let runner = Runner.create();
// Runner.run(runner, engine); // Removed automatic start - controlled by script.js

// Export variables for use in simulations
window.engine = engine;
window.world = world;
window.render = render;
window.runner = runner;
