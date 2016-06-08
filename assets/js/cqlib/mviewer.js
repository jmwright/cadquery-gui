/*
    Functions related to the three.js model viewport

    This changed from its original version, to separate the ajax calls from the viewing portion.
    The new version exports an updateObject() method, presuming that someone else has fetched the
    data.

    Requires these scripts to be loaded first:
    js/three.js/Three.js
    js/jquery.filedownload.js
    js/three.js/Detector.js
    js/threex/THREEx.screenshot.js
    js/threex.dragpancontrols.js

    exported functions:
        init()
        clearScene()
        loadObject()
        setView()
        setZoom()

    TODO: http://learningthreejs.com/blog/2012/05/21/sport-car-in-webgl/
    use tquery that will make rendering this scene much much easier i think
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals THREE: false, Detector: false, $: false*/
'use strict';
var MVIEWER = function() {
    var scene, renderer, originScene, originRenderer;
    var camera, originCamera, cameraControls;
    var originAxes;
    var originContainer;
    var currentObjects = []; // Holds all of the objects that we are rendering
    var currentEdges = []; // Holds all of the edges for the objects that were are rendering
    var currentAxes = []; // Holds the axis lines that are based on the size(s) of the included objects
    var cameraSetup = false;
    var autoRotate = false;
    var isWireFrame = false;
    var firstTimeLoad = true;
    var material = "";
    var centroid;
    var CAM_DISTANCE = 300;
    var settings = {
        initialView: 'ISO',
        clearColor: 0x696969,
        containerId: ""
    };

    function safeDistance() {
        // Get the first object so that we can set the safe distance
        var bBox = currentObjects[0].geometry.boundingBox;
        if (bBox === undefined) {
            console.log("bBox Undefined");
            return;
        }

        // Calculate the safe distance that we should be away from the object to get a good view
        var sphereSize = bBox.size().length() * 0.75;
        return sphereSize / Math.sin(Math.PI / 180.0 * camera.fov * 0.5);
    }

    function setupCamera(geometry) {
        if (!cameraSetup) {
            var distance = geometry.boundingSphere.radius / Math.sin((camera.fov / 2) * (Math.PI / 180));
            camera.position.z += (-distance / 1.5);
            cameraSetup = true;
            //geometry.computeBoundingBox();
            //var centerX = 0.5 * ( geometry.boundingBox.x[ 1 ] - geometry.boundingBox.x[ 0 ] );
            //var centerY = 0.5 * ( geometry.boundingBox.y[ 1 ] - geometry.boundingBox.y[ 0 ] );
            //var centerZ = 0.5 * ( geometry.boundingBox.z[ 1 ] - geometry.boundingBox.z[ 0 ] );
            //geomCenter = new THREE.Vector3(centerX,centerY,centerZ);
        }
    }

    function setCameraPosition(x, y, z) {
        rotateObjects(0);
        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
    }

    function setCameraView(viewName) {
        var d = safeDistance();
        if(viewName === 'ISO') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(d, d, d);
            zoomAll();
        }
        else if(viewName === 'TOP') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(0, d, 0);
            zoomAll();
        }
        else if(viewName === 'BOTTOM') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(0, -d, 0);
            zoomAll();
        }
        else if(viewName === 'LEFT') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(d, 0, 0);
            zoomAll();
        }
        else if(viewName === 'RIGHT') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(-d, 0, 0);
            zoomAll();
        }
        else if(viewName === 'FRONT') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(0, 0, d);
            zoomAll();
        }
        else if(viewName === 'BACK') {
            cameraControls.reset();
            d = safeDistance();
            setCameraPosition(0, 0, -d);
            zoomAll();
        }
    }

    function zoomAll() {
        var distToCenter = safeDistance();

        // Move the camera backward
        var target = cameraControls.target;
        var vec = new THREE.Vector3();
        vec.subVectors(camera.position, target);
        vec.setLength(distToCenter);
        camera.position.addVectors(vec, target);
        camera.updateProjectionMatrix();
    }

// init the scene
    function init() {
        // Check if the user's setup supports WebGL
        if(Detector.webgl){
            renderer = new THREE.WebGLRenderer({
                antialias   : true, // to get smoother output
                preserveDrawingBuffer : true  // to allow screenshot
            });
            renderer.setClearColor(settings.clearColor, 1);
            material  = new THREE.MeshPhongMaterial({
                wireframe:isWireFrame,
                color: 0x808080
            });
        }
        else{
            material = new THREE.MeshBasicMaterial({ color: 0x0074D9, wireframe: false });
            renderer  = new THREE.CanvasRenderer();
            renderer.setClearColor(settings.clearColor, 1);
            alert('WebGL is not enabled for your browser. Performance will be degraded.');
        }

        var width = $('#modelview').width();
        renderer.setSize(width, width * 0.8);

        $(window).resize(function() {
            var width = $('#modelview').width();
            renderer.setSize(width, width * 0.8);
        });

        document.getElementById(settings.containerId).appendChild(renderer.domElement);

        // create a scene
        scene = new THREE.Scene();

        // put a camera in the scene
        camera  = new THREE.PerspectiveCamera(35, settings.width / settings.height, 1, 10000 );
        camera.position.set(0, 0, 15);
        scene.add(camera);

        // create a camera contol
        cameraControls  = new THREE.TrackballControls( camera, document.getElementById(settings.containerId) );

        scene.add (new THREE.AmbientLight(0xffffff));

        // Set up the origin indicator
        originContainer = document.getElementById('indicator');
        originRenderer = new THREE.WebGLRenderer({
                antialias   : true, // to get smoother output
                preserveDrawingBuffer : true  // to allow screenshot
            });
        originRenderer.setClearColor(0xf0f0f0, 1);
        originRenderer.setSize(100.0, 100.0);
        originContainer.appendChild(originRenderer.domElement);
        originScene = new THREE.Scene();
        originCamera = new THREE.PerspectiveCamera(35, 100.0 / 100.0, 1, 1000);
        originCamera.up = camera.up;

        // Set up the axes for the origin indicator
        // originAxes = new THREE.AxisHelper(100);
        // originAxes = new Origin();
        var dirX = new THREE.Vector3(100, 0, 0);
        var dirY = new THREE.Vector3(0, 100, 0);
        var dirZ = new THREE.Vector3(0, 0, 100);
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 75;
        var xAxisColor = 0xff0000;
        var yAxisColor = 0x00ff00;
        var zAxisColor = 0x0000ff;

        var arrowHelperX = new THREE.ArrowHelper(dirX, origin, length, xAxisColor, 20, 15);
        var arrowHelperY = new THREE.ArrowHelper(dirY, origin, length, yAxisColor, 20, 15);
        var arrowHelperZ = new THREE.ArrowHelper(dirZ, origin, length, zAxisColor, 20, 15);
        originScene.add(arrowHelperX);
        originScene.add(arrowHelperY);
        originScene.add(arrowHelperZ);

        //controls.addEventListener( 'update', render );

        //uncomment to start with the camera centered at object center, comment to have camera centered
        //at origin instead
        //cameraControls.target = new THREE.Vector3(50,20,50);

        // transparently support window resize
        //THREEx.WindowResize.bind(renderer, camera,WIDTH,HEIGHT);
        //THREEx.Screenshot.bindKey(renderer);
        // allow 'f' to go fullscreen where this feature is supported
        /*
         if( THREEx.FullScreen.available() ){
         THREEx.FullScreen.bindKey();
         document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
         }
         */
    }

    function clearScene() {
        for (var i = 0; i < scene.children.length; i++){            
            var obj = scene.children[i];            
            scene.remove(obj);
        }
    }
    function debugAxis(axisLength) {
        //Shorten the vertex function
        function v(x, y, z){
            return new THREE.Vector3(x, y, z);
        }

        //Create axis (point1, point2, colour)
        function createAxis(p1, p2, color, index) {
            var line, lineGeometry = new THREE.Geometry(),
                lineMat = new THREE.LineBasicMaterial({color: color});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat); 
            currentAxes[index] = line;           
            scene.add(line);


        }
        createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000, 0);
        createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00, 1);
        createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF, 2);
    }


//loads geometry.
    function loadGeometry(data) {       
        // clearScene();

        // Make sure that we remove all objects from the scene
        if (currentObjects.length > 0) {
            for (var i = 0; i < currentObjects.length; i++) {
                scene.remove(currentObjects[i]);
                scene.remove(currentEdges[i]);
            }
            for(var i = 0; i < currentAxes.length; i++) {
                scene.remove(currentAxes[i]);
            }
        }

        // Step through all the results and render them
        for(var j = 0; j < data.allResults.length; j++){
            //load new model
            var loader = new THREE.JSONLoader();
            var model = loader.parse(data.allResults[j]);

            var mesh  = new THREE.Mesh(model.geometry, material);
            var edges = new THREE.EdgesHelper(mesh, 0x000000);

            setupCamera(model.geometry);

            scene.add(mesh);
            scene.add(edges);            

            // We need to track all objects and lines added to the scene so that we can remove them later
            currentObjects[j] = mesh;
            currentEdges[j] = edges;

            // We only want to do these things for the first object
            if(j === 0) {
                //compute center
                model.geometry.computeBoundingBox();
                var bb = model.geometry.boundingBox;
                var centerX = 0.5 * (bb.max.x - bb.min.x);
                var centerY = 0.5 * (bb.max.y - bb.min.y);
                var centerZ = 0.5 * (bb.max.z - bb.min.z);
                centroid = new THREE.Vector3(centerX, centerY, centerZ);                

                //axes.. based on object size
                debugAxis(mesh.geometry.boundingSphere.radius * 2.0);
            }
        }

        //THREE.GeometryUtils.center( geometry );
        //camera.lookAt( scene.position );
        //camera.target.position.copy( new THREE.Vector3(50,0,0));

        // var d = safeDistance();
        // var light = new THREE.SpotLight(0xffffff);
        // light.position.set(d + 10, d + 10, d + 10);
        // scene.add(light);

        // light = new THREE.SpotLight(0x002288);
        // light.position.set(-d, d, d);
        // scene.add(light);        

        if (firstTimeLoad) {
            setCameraView(settings.initialView);            
            firstTimeLoad = false;
        }

        //render();
    }

// animation loop
    function animate() {
        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame(animate);

        originCamera.position.copy(camera.position);
        originCamera.position.sub(cameraControls.target);
        originCamera.position.setLength(CAM_DISTANCE);

        originCamera.lookAt(originScene.position);

        render(); // do the render
    }

    function rotateObjects(angle) {
        for(var i = 0; i < scene.children.length; i ++){
            scene.children[ i ].rotation.y = angle;
        }
    }

// render the scene
    function render() {
        // variable which is increase by Math.PI every seconds - usefull for animation
        // var PIseconds = Date.now() * Math.PI;

        // update camera controls
        cameraControls.update();

        // animation of all objects
        // if (autoRotate){
        //     rotateObjects(PIseconds * -0.0003);
        // }
        //TODO: i think this is done wrong. We shouldnt be rotating the object, we should
        //example: view-source:http://mrdoob.github.com/three.js/examples/webgl_morphtargets.html
        //be moving the camera with camera.lookAt( position )
        //like this:
        //camera.position.y += ( - mouseY - camera.position.y ) * .01;
        //camera.lookAt( scene.position );

        // animate PointLights
        //scene.lights.forEach(function(light, idx){
        //    if( light instanceof THREE.PointLight === false ) return;
        //    var angle = 0.0005 * PIseconds * (idx % 2 ? 1 : -1) + idx * Math.PI/3;
        //    light.position.set(Math.cos(angle)*3, Math.sin(angle*3)*2, Math.cos(angle*2)).normalize().multiplyScalar(safeDistance());
        //});
        // actually render the scene
        renderer.render(scene, camera);
        originRenderer.render(originScene, originCamera);
    }

    //exported stuff
    return {
        init: function(opts){
            $.extend(settings, opts);
            if(!init())  animate();
        },
        toggleRotate : function(){
            autoRotate = !autoRotate;
        },
        clear : clearScene,
        load : loadGeometry,
        setView : setCameraView,
        zoomAll : zoomAll,
        setZoom : function(factor){
            camera.position.multiplyScalar(factor);
        },
        captureImage: function(){
            return renderer.domElement.toDataURL("image/png");
        }
    };

}();