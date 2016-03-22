/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, Detector: false, THREE: false*/
"use strict";
var scene; // Global scene object
var camera; // Global camera object
var renderer; // Global renderer object
var boxMesh; // Global mesh object of the cube
var directionalLight; // Allows us to see what we are looking at on the object
var controls; // Allows us to spin the object around

// Initialize the scene, render and animate, and set up controls
initializeScene();
renderScene();
orbitControls(); // request the orbitControls be created and enabled
animateScene();

function initializeScene() {
    // Use WebGL if supported
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({antialias: true});
    }
    else {
        renderer = new THREE.CanvasRenderer();
    }

    // Background will be black with full opacity
    renderer.setClearColor(0x000000, 1);

    // Create a full size renderer
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    renderer.setSize(canvasWidth, canvasHeight);

    // Append the renderer to the DOM
    $('#WebGLCanvas').append(renderer.domElement);

    // Where things like camera, lights, geometries, etc are stored
    scene = new THREE.Scene();

    // Set up a perspective camera. Camera is moved 10 units towards
    // the Z axis to allow looking at the center of the scene
    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
    camera.position.set(0, 0, 10);
    scene.add(camera);

    // Set up a box with a basic mesh material
    var boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    // The following is how to set a color for each face
    // var boxMaterials = [
    //     new THREE.MeshBasicMaterial({color:0xFF0000}),
    //     new THREE.MeshBasicMaterial({color:0x00FF00}),
    //     new THREE.MeshBasicMaterial({color:0x0000FF}),
    //     new THREE.MeshBasicMaterial({color:0xFFFF00}),
    //     new THREE.MeshBasicMaterial({color:0x00FFFF}),
    //     new THREE.MeshBasicMaterial({color:0xFFFFFF})
    // ];
    // var boxMaterial = new THREE.MeshFaceMaterial(boxMaterials);

    var boxMaterial = new THREE.MeshLambertMaterial({
        color:0x0000FF,
        side:THREE.DoubleSide
    });
    if(!Detector.webgl){
        boxMaterial = new THREE.MeshBasicMaterial({
        color:0x0000FF,
        side:THREE.DoubleSide
        });
    }

    // Apply the material to the geometry and add it to the scene
    boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.set(0.0, 0.0, 0.0); // Just capturing this here for documentation purposes
    scene.add(boxMesh);

    // Set the lighting up
    var ambientLight = new THREE.AmbientLight(0x404040);
    ambientLight.position.set(0.0, 0.0, 1.0);
    scene.add(ambientLight);
    directionalLight = new THREE.PointLight(0xffffff);
    directionalLight.position.set(250, 250, 250);
    scene.add(directionalLight);
}

// Render - map the 3D world to the 2D screen
function renderScene() {
    renderer.render(scene, camera);
}

function animateScene(){
    //directionalLight.position = camera.position;

    //boxMesh.rotateOnAxis(new THREE.Vector3(1, 1, 1).normalize(), 0.075);

    requestAnimationFrame(animateScene);

    renderScene();
}

function orbitControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
}

// Lets us trap key presses to set view angles, execute the script, etc
$(document).on('keydown', function(event) {
    var keyCode = event.which;
    console.log(keyCode);
    if (keyCode == 115) {
        console.log("Execute Key Pressed");
    }
});