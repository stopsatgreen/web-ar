let vrDisplay;
let vrControls;
let arView;

let canvas;
let camera;
let scene;
let renderer;
let cube;

const colors = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xffff00),
  new THREE.Color(0xff00ff),
  new THREE.Color(0xff0000),
  new THREE.Color(0x00ffff),
  new THREE.Color(0x00ff00),
  new THREE.Color(0x0000ff),
  new THREE.Color(0x000000),
];

const BOX_SCALE = 0.3;

THREE.ARUtils.getARDisplay().then((display) => {
  if (display) {
    vrDisplay = display;
    init();
  } else {
    THREE.ARUtils.displayUnsupportedMessage();
  }
});

function init() {
  const arDebug = new THREE.ARDebug(vrDisplay);
  document.body.appendChild(arDebug.getElement());

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  canvas = renderer.domElement;
  document.body.appendChild(canvas);
  scene = new THREE.Scene();

  arView = new THREE.ARView(vrDisplay, renderer);

  camera = new THREE.ARPerspectiveCamera(
    vrDisplay,
    60,
    window.innerWidth / window.innerHeight,
    vrDisplay.depthNear,
    vrDisplay.depthFar
  );

  vrControls = new THREE.VRControls(camera);

  const geometry = new THREE.BoxGeometry(BOX_SCALE, BOX_SCALE, BOX_SCALE);
  const faceIndices = ['a', 'b', 'c'];
  // TODO for… of
  for (let i = 0; i < geometry.faces.length; i++) {
    const f = geometry.faces[i];
    for (let j = 0; j < 3; j++) {
      const vertexIndex = f[faceIndices[j]];
      f.vertexColors[j] = colors[vertexIndex];
    }
  }
  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
  });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(1000, 1000, 1000);

  scene.add(cube);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('touchstart', onClick, false);

  update();
}

function update() {
  camera.updateProjectionMatrix();

  vrControls.update();

  arView.render();

  renderer.clearDepth();
  renderer.render(scene, camera);

  vrDisplay.requestAnimationFrame(update);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(e) {
  if (!e.touches[0]) {
    return;
  }

  const x = e.touches[0].pageX / window.innerWidth;
  const y = e.touches[0].pageY / window.innerHeight;
  const hits = vrDisplay.hitTest(x, y);

  if (hits && hits.length) {
    const hits = hits[0];

    THREE.ARUtils.placeObjectAtHit(
      cube,
      hit,
      true,
      1
    );
  }
}
