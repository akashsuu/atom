// == Globals & Setup ==
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 60, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 20;
controls.maxDistance = 400;

const loader = new THREE.TextureLoader();

const info = document.getElementById('info');

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 3, 500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Lensflare for Sun Glow
const textureFlare = loader.load('textures/lensflare0.png');  // You need to add lensflare0.png or use a dataurl or fallback
const lensflare = new THREE.Lensflare();
lensflare.addElement(new THREE.LensflareElement(textureFlare, 512, 0, sunLight.color));
sunLight.add(lensflare);

// Starfield background
function createStarField() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 10000;
  const positions = [];

  for(let i=0; i<starsCount; i++){
    positions.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const starsMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.7 });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}
createStarField();

// Planets data with textures, sizes, distances are placeholders for scaling
const planets = [
  { name: "mercury", size: 0.5, distance: 8, texture: "mercury.jpg" },
  { name: "venus", size: 0.9, distance: 11, texture: "venus.jpg" },
  { name: "earth", size: 1, distance: 14, texture: "earth_daymap.jpg" },
  { name: "mars", size: 0.7, distance: 17, texture: "mars.jpg" },
  { name: "jupiter", size: 2.5, distance: 23, texture: "jupiter.jpg" },
  { name: "saturn", size: 2, distance: 28, texture: "saturn.jpg" },
  { name: "uranus", size: 1.8, distance: 32, texture: "uranus.jpg" },
  { name: "neptune", size: 1.7, distance: 36, texture: "neptune.jpg" },
];

// Create Sun
const sunGeo = new THREE.SphereGeometry(5, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
scene.add(sunMesh);

// Create planet meshes
const planetMeshes = {};
planets.forEach(p => {
  const tex = loader.load(`textures/${p.texture}`);
  const geo = new THREE.SphereGeometry(p.size, 64, 64);
  const mat = new THREE.MeshStandardMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  planetMeshes[p.name] = mesh;
});

// Saturn ring
const saturnRingTexture = loader.load("textures/saturn_ring.png");
const saturnRingGeo = new THREE.RingGeometry(2.3, 3, 64);
const saturnRingMat = new THREE.MeshBasicMaterial({
  map: saturnRingTexture,
  side: THREE.DoubleSide,
  transparent: true,
});
const saturnRingMesh = new THREE.Mesh(saturnRingGeo, saturnRingMat);
saturnRingMesh.rotation.x = Math.PI / 2;
scene.add(saturnRingMesh);

// Moons data (relative distance, size, texture)
const moonsData = {
  earth: [{ name: "moon", size: 0.27, distance: 1.5, texture: "moon.jpg" }],
  mars: [
    { name: "phobos", size: 0.15, distance: 1.2, texture: "phobos.jpg" },
    { name: "deimos", size: 0.1, distance: 2.0, texture: "deimos.jpg" },
  ],
};
const moonMeshes = {};
for (const planetName in moonsData) {
  moonsData[planetName].forEach(moon => {
    const tex = loader.load(`textures/${moon.texture}`);
    const geo = new THREE.SphereGeometry(moon.size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ map: tex });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    if (!moonMeshes[planetName]) moonMeshes[planetName] = [];
    moonMeshes[planetName].push({ mesh, distance: moon.distance, angle: 0, speed: 0.05 });
  });
}

// Orbit rings
const orbitRings = {};
planets.forEach(p => {
  const ringGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  orbitRings[p.name] = ring;
});

// UI controls
const gui = new dat.GUI();
const params = {
  speedMultiplier: 1,
  showOrbits: true,
  toggleOrbitVisibility() {
    for (const ringName in orbitRings) {
      orbitRings[ringName].visible = params.showOrbits;
    }
  },
};
gui.add(params, 'speedMultiplier', 0, 10, 0.1).name("Speed x");
gui.add(params, 'showOrbits').name("Show Orbits").onChange(params.toggleOrbitVisibility);
params.toggleOrbitVisibility();

// Load planet positions JSON (simulate real-time NASA Horizons data)
// Format example:
// {
//   "earth": { "x": 1.234, "y": 0.5, "z": -1.234 },
//   "mars": { "x": 1.5, "y": 0.3, "z": -2.1 },
//   ...
// }
let planetPositions = null;
async function loadPlanetPositions() {
  try {
    const response = await fetch('data/planets_positions.json');
    planetPositions = await response.json();
    info.textContent = "Solar system loaded. Use controls.";
  } catch (e) {
    info.textContent = "Error loading planet positions. Using circular orbits.";
    planetPositions = null;
  }
}
loadPlanetPositions();

// Animation loop variables
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  time += 0.01 * params.speedMultiplier;

  if (planetPositions) {
    // Use real NASA Horizons data positions
    for (const [name, mesh] of Object.entries(planetMeshes)) {
      const pos = planetPositions[name];
      if (pos) {
        mesh.position.set(pos.x * 30, pos.y * 30, pos.z * 30);  // Scale for visibility
      }
    }
  } else {
    // Fallback: circular orbits if no data loaded
    planets.forEach(p => {
      const mesh = planetMeshes[p.name];
      const x = p.distance * Math.cos(time * p.distance * 0.1);
      const z = p.distance * Math.sin(time * p.distance * 0.1);
      mesh.position.set(x, 0, z);
    });
  }

  // Saturn ring follows Saturn
  saturnRingMesh.position.copy(planetMeshes["saturn"].position);

  // Animate moons orbiting their planets
  for (const planetName in moonMeshes) {
    const planetMesh = planetMeshes[planetName];
    moonMeshes[planetName].forEach(moon => {
      moon.angle += 0.02 * params.speedMultiplier;
      const x = planetMesh.position.x + moon.distance * Math.cos(moon.angle);
      const z = planetMesh.position.z + moon.distance * Math.sin(moon.angle);
      moon.mesh.position.set(x, 0, z);
    });
  }

  renderer.render(scene, camera);
}

animate();

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
