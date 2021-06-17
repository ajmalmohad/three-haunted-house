import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import { camera, scene, renderer, orbit, loadingManager, clock, scrinit, resize } from './utilities/scr';
import doorColor from './../images/textures/door/color.jpg'
import doorAlpha from './../images/textures/door/alpha.jpg'
import doorOcculsion from './../images/textures/door/ambientOcclusion.jpg'
import doorHeight from './../images/textures/door/height.jpg'
import doorMetalness from './../images/textures/door/metalness.jpg'
import doorNormal from './../images/textures/door/normal.jpg'
import doorRoughness from './../images/textures/door/roughness.jpg'

import wallColor from './../images/textures/bricks/color.jpg'
import wallOcculsion from './../images/textures/bricks/ambientOcclusion.jpg'
import wallNormal from './../images/textures/bricks/normal.jpg'
import wallRoughness from './../images/textures/bricks/roughness.jpg'

import grassColor from './../images/textures/grass/color.jpg'
import grassOcculsion from './../images/textures/grass/ambientOcclusion.jpg'
import grassNormal from './../images/textures/grass/normal.jpg'
import grassRoughness from './../images/textures/grass/roughness.jpg'

let cursor;
let ghost1,ghost2,ghost3;

let fontLoader = new THREE.FontLoader();
let textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load(doorColor);
const doorAlphaTexture = textureLoader.load(doorAlpha);
const doorOcculsionTexture = textureLoader.load(doorOcculsion);
const doorHeightTexture = textureLoader.load(doorHeight);
const doorMetalnessTexture = textureLoader.load(doorMetalness);
const doorNormalTexture = textureLoader.load(doorNormal);
const doorRoughnessTexture = textureLoader.load(doorRoughness);

const wallColorTexture = textureLoader.load(wallColor);
const wallOcculsionTexture = textureLoader.load(wallOcculsion);
const wallNormalTexture = textureLoader.load(wallNormal);
const wallRoughnessTexture = textureLoader.load(wallRoughness);

const grassColorTexture = textureLoader.load(grassColor);
const grassOcculsionTexture = textureLoader.load(grassOcculsion);
const grassNormalTexture = textureLoader.load(grassNormal);
const grassRoughnessTexture = textureLoader.load(grassRoughness);
grassColorTexture.repeat.set(8,8)
grassOcculsionTexture.repeat.set(8,8)
grassNormalTexture.repeat.set(8,8)
grassRoughnessTexture.repeat.set(8,8)
grassColorTexture.wrapS = THREE.RepeatWrapping
grassColorTexture.wrapT = THREE.RepeatWrapping
grassOcculsionTexture.wrapS = THREE.RepeatWrapping
grassOcculsionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping


init();
animate();

function init() {
	//Init Scene Camera Renderer with orbit controls.
	scrinit("controls");

	//Cursor
	cursor = { x: 0, y: 0 }

	//GUI
	const gui = new dat.GUI();


/**
 * House
 */
	renderer.setClearColor('#262837');
	renderer.shadowMap.enabled = true;
	//Fog
	const fog = new THREE.Fog('#262837',1,20);
	scene.fog = fog;

	//Group
	const house = new THREE.Group();
	scene.add(house);
	const graves = new THREE.Group();
	scene.add(graves);

	//Walls
	const walls = new THREE.Mesh(
		new THREE.BoxBufferGeometry(4,2.5,4),
		new THREE.MeshStandardMaterial({
			map:wallColorTexture,
			aoMap:wallOcculsionTexture,
			normalMap:wallNormalTexture,
			roughnessMap:wallRoughnessTexture
		})
	);
	house.add(walls)
	walls.position.y = walls.geometry.parameters.height*0.5 + 0.01;
	walls.geometry.setAttribute('uv2',new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array,2));

	//Roof
	const roof = new THREE.Mesh(
		new THREE.ConeBufferGeometry(3.5,1,4),
		new THREE.MeshStandardMaterial({color:'#b35f45'})
	)
	house.add(roof)
	roof.position.y = walls.geometry.parameters.height + roof.geometry.parameters.height/2 ;
	roof.rotation.y = Math.PI*0.25;

	//Door
	const door = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1.8,1.8,100,100),
		new THREE.MeshStandardMaterial({
			transparent:true,
			map:doorColorTexture,
			alphaMap:doorAlphaTexture,
			aoMap:doorOcculsionTexture,
			displacementMap:doorHeightTexture,
			displacementScale:0.1,
			normalMap:doorNormalTexture,
			metalnessMap:doorMetalnessTexture,
			roughnessMap:doorRoughnessTexture

		})
	)
	door.geometry.setAttribute('uv2',new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array,2))
	house.add(door)
	door.position.z = walls.geometry.parameters.depth/2 + 0.01;
	door.position.y =  door.geometry.parameters.height*0.5 - 0.05;


	//Bush 
	const bushGeometry = new THREE.SphereBufferGeometry(1, 16,16);
	const bushMaterial = new THREE.MeshStandardMaterial({color:'#89c854'});

	let bushscales = [0.5,0.25,0.4,0.1];
	let bushpositions = [0.8,0.2,2.2,1.4,0.1,2.1,-0.8,0.1,2.2,-1,0.05,2.6]
	let vecstart = 0;
	for (let i = 0; i < 4; i++) {
		const bush = new THREE.Mesh(bushGeometry,bushMaterial)
		bush.scale.set(bushscales[i],bushscales[i],bushscales[i]);
		bush.position.set(bushpositions[vecstart],bushpositions[vecstart+1],bushpositions[vecstart+2]);
		vecstart += 3;
		house.add(bush)
	}

	//Graveyard
	const graveGeometry = new THREE.BoxBufferGeometry(0.6,0.8,0.2);
	const graveMaterial = new THREE.MeshStandardMaterial({color:'#b2b6b1'});

	for (let i = 0; i < 50; i++) {
		const angle = Math.random()*Math.PI*2;
		let radius = 3.5 + Math.random()*5;
		const x = Math.sin(angle)*radius;
		const z = Math.cos(angle)*radius;
		const grave = new THREE.Mesh(graveGeometry,graveMaterial);
		grave.position.set(x,graveGeometry.parameters.height/2 - 0.1,z)
		grave.rotation.y = (Math.random()-0.5)*0.4
		grave.rotation.z = (Math.random()-0.5)*0.2
		graves.add(grave);
	}

	//Ground
	const floor = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(20,20),
		new THREE.MeshStandardMaterial({
			side:THREE.DoubleSide,
			map:grassColorTexture,
			aoMap:grassOcculsionTexture,
			normalMap:grassNormalTexture,
			roughnessMap:grassRoughnessTexture
		})
	);
	floor.rotation.x = Math.PI*0.5;
	scene.add(floor);
	floor.geometry.setAttribute('uv2',new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array,2));

/**
 * House
 */

	//Lights

	//Ambient
	const aLight = new THREE.AmbientLight( 0xb9d5ff , 0.12 );
	scene.add(aLight)

	//MoonLight
	const moonLight = new THREE.DirectionalLight( 0xb9d5ff , 0.12 );
	scene.add(moonLight)

	//DoorLight
	const doorLight = new THREE.PointLight( 0xff7d46 , 1 ,7);
	doorLight.position.set(walls.position.x,walls.position.y + walls.geometry.parameters.height/2,2.7)
	house.add(doorLight)

/**
 * Ghosts
 */

	ghost1 = new THREE.PointLight('#ff00ff',2,3);
	ghost2 = new THREE.PointLight('#00ffff',2,3);
	ghost3 = new THREE.PointLight('#ffff00',2,3);
	scene.add(ghost1,ghost2,ghost3)

/**
 * Ghosts
 */

	//Positionings
	camera.position.y = 3;
	camera.position.x = 6;
	camera.position.z = 10;
	camera.lookAt(0,0,0)

	//GUI
	gui.add(aLight,'intensity').min(0).max(1).step(0.01).name("Ambient Intensity")
	gui.add(moonLight,'intensity').min(0).max(1).step(0.01).name("Moon Intensity")
	gui.add(moonLight.position,'x').min(-10).max(10).step(0.01).name("Moon Translate X")
	gui.add(moonLight.position,'y').min(-10).max(10).step(0.01).name("Moon Translate Y")
	gui.add(moonLight.position,'z').min(-10).max(10).step(0.01).name("Moon Translate Z")

}

function animate() {
	const elapsedTime = clock.getElapsedTime();
	orbit.update();
	let ghost1Angle = elapsedTime * 0.5;
	ghost1.position.x = Math.sin(ghost1Angle)*4
	ghost1.position.z = Math.cos(ghost1Angle)*4
	ghost1.position.y = Math.sin(elapsedTime*4)

	let ghost2Angle = - elapsedTime * 0.32;
	ghost2.position.x = Math.sin(ghost2Angle)*5
	ghost2.position.z = Math.cos(ghost2Angle)*5
	ghost2.position.y = Math.sin(elapsedTime*3) + Math.sin(elapsedTime*2.5)

	let ghost3Angle = - elapsedTime * 0.18;
	ghost3.position.x = Math.sin(ghost3Angle)* (7+Math.sin(elapsedTime*0.32))
	ghost3.position.z = Math.cos(ghost3Angle)* (7+Math.sin(elapsedTime*0.5))
	ghost3.position.y = Math.sin(elapsedTime*4) + Math.sin(elapsedTime*2.5)

	//All Logic above this
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function handleMousemove(e) {
	cursor.x = e.clientX / window.innerWidth - 0.5;
	cursor.y = -(e.clientY / window.innerHeight - 0.5);
}

function fullScreenhandler() {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.body.requestFullscreen();
	}
}

//Event Listeners
window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMousemove);
window.addEventListener('dblclick', fullScreenhandler);
