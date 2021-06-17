import { Scene, PerspectiveCamera, WebGLRenderer, LoadingManager, Clock} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let camera, scene, renderer, orbit, loadingManager, clock;

function scrinit(controls) {
    camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 500);
    camera.position.z = 5;
    scene = new Scene();
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.classList.add('webgl');
    document.body.appendChild(renderer.domElement);
    clock = new Clock();
    loadingManager = new LoadingManager();
    if (controls === "controls") {
        orbit = new OrbitControls(camera, renderer.domElement);
        orbit.enableDamping = true;
        orbit.dampingFactor = 0.05;
    }
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

export { camera, scene, renderer, orbit,loadingManager , clock, scrinit, resize };