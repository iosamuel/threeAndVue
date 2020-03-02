import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
//import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default (data) => {
  const canvas = document.querySelector("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, 10);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('skyblue');

  const raycaster = new THREE.Raycaster();

  let mixer;
  const clock = new THREE.Clock();

  // objects
  let joker, penguModel;
  let penguCurrentAnimation = 0;

  {
    const planeSize = 100;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('/threeAssets/snow.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  {
    const skyColor = 0xffffff;
    const groundColor = 0xffffff;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0x000000;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }

  {
    const objLoader = new GLTFLoader();
    objLoader.load('/threeAssets/joker.glb', (model) => {
      joker = model.scene;

      joker.scale.set(5, 5, 5);
      joker.position.set(-5, 1.3, -10);
      joker.rotation.set(0, .6, 0);

      scene.add(model.scene);
    });
  }

  {
    const objLoader = new GLTFLoader();
    objLoader.load('/threeAssets/pengu.glb', (model) => {
      penguModel = model;
      const pengu = model.scene;

      pengu.scale.set(10, 10, 10);
      pengu.position.set(0, 0, -10);

      mixer = new THREE.AnimationMixer(model.scene);
      const action = mixer.clipAction(model.animations[penguCurrentAnimation]);
      action.play();

      scene.add(model.scene);
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  const handleClickOnJoker = (ev) => {
    ev.preventDefault();

    const event = ev.touches ? ev.touches[0] : ev;

    const rect = canvas.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const pickPosition = {
      x:(position.x / canvas.clientWidth) * 2 - 1,
      y:(position.y / canvas.clientHeight) * -2 + 1
    };

    raycaster.setFromCamera(pickPosition, camera);
    const intersectedObjects = raycaster.intersectObject(joker, true);
    if (intersectedObjects.length) {
      data.clickedTimes += 1;

      mixer.existingAction(penguModel.animations[penguCurrentAnimation]).fadeOut(1);
      setTimeout(() => {
        mixer.stopAllAction();
        const action = mixer.clipAction(penguModel.animations[Number(!penguCurrentAnimation)]);

        action.play();
        penguCurrentAnimation = Number(!penguCurrentAnimation);
      }, 1000);
    }
  };

  window.addEventListener("mousedown", handleClickOnJoker);
  window.addEventListener("touchstart", handleClickOnJoker);
}
