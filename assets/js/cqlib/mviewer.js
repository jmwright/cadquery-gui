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
    var scene, renderer, composer;
    var camera, cameraControls;
    var currentObject;
    var cameraSetup = false;
    var autoRotate = false;
    var isWireFrame = false;
    var firstTimeLoad = true;
    var material = "";
    var centroid;
    var settings = {
        initialView: 'ISO',
        clearColor: 0x696969,
        containerId: ""
    };

    function safeDistance() {
        // if(currentObject !== undefined && currentObject !== null) {
        return currentObject.geometry.boundingSphere.radius * 1.6;
        // }
    }

    function setupCamera(geometry) {
        if ( ! cameraSetup ){
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
        if(viewName == 'ISO') {
            d = safeDistance();
            setCameraPosition(d, d, d);
        }
        else if(viewName == 'TOP'){
            setCameraPosition(0, 0, d);
        }
        else if(viewName == 'LEFT'){
            setCameraPosition(0, d, 0);
        }
        else if(viewName == 'FRONT'){
            setCameraPosition(d, 0, 0);
        }

    }

// init the scene
    function init(){

        if(Detector.webgl){
            renderer = new THREE.WebGLRenderer({
                antialias   : true, // to get smoother output
                preserveDrawingBuffer : true  // to allow screenshot
            });
            renderer.setClearColor(settings.clearColor, 1);
            material  = new THREE.MeshNormalMaterial({
                wireframe:isWireFrame
            });
            //Had to take this out of the hash with the newer version of three.js
            //shading: THREE.SmoothShading
        }
        else{
            material = new THREE.MeshBasicMaterial({ color: 0x44ff44, wireframe: false, doubleSided: true });
            renderer  = new THREE.CanvasRenderer();
            renderer.setClearColor(settings.clearColor, 1);
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
        //scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
        // create a camera contol
        cameraControls  = new THREE.TrackballControls( camera, document.getElementById(settings.containerId) );

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
        for( var i = 0; i < scene.children.length; i ++ ){
            var obj = scene.children[i];
            //obj.material = [new THREE.MeshPhongMaterial({color:0xaaaaaa})];
            scene.remove(obj);
        }
    }
    function debugAxis(axisLength) {
        //Shorten the vertex function
        function v(x, y, z){
            return new THREE.Vector3(x, y, z);
        }

        //Create axis (point1, point2, colour)
        function createAxis(p1, p2, color) {
            var line, lineGeometry = new THREE.Geometry(),
                lineMat = new THREE.LineBasicMaterial({color: color});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);


        }
        createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
        createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
        createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
    }


//loads geometry.
    function loadGeometry( data ) {
        clearScene();

        if ( currentObject ) {
            scene.remove(currentObject);
        }

        //load new model
        var loader = new THREE.JSONLoader();
        var model = loader.parse(data);

        //var material = new THREE.MeshPhongMaterial( {
        //    ambient: 0x030303,
        //    color: 0x22ff11,
        //    specular: 0x009900,
        //    shininess: 10,
        //    shading: THREE.FlatShading } );

        //var material  = new THREE.MeshNormalMaterial({
        //     wireframe:isWireFrame,
        //     shading: THREE.SmoothShading
        //    } );
        //var material = new THREE.MeshBasicMaterial({
        //   color: 0x11ff11,
        //
        //});
        //var material = new THREE.MeshLambertMaterial( { color: 0x11ff11, shading: THREE.SmoothShading } );
        //var material = new THREE.MeshFaceMaterial();
        //var material = new THREE.MeshBasicMaterial( { color: 0x44ffaa, wireframe: false ,doubleSided: true } )
        var mesh  = new THREE.Mesh(model.geometry, material);

        setupCamera(model.geometry);

        scene.add(mesh);
        console.log(mesh);
        currentObject = mesh;

        //compute center
        model.geometry.computeBoundingBox();
        var bb = model.geometry.boundingBox;
        var centerX = 0.5 * (bb.max.x - bb.min.x);
        var centerY = 0.5 * (bb.max.y - bb.min.y);
        var centerZ = 0.5 * (bb.max.z - bb.min.z);
        centroid = new THREE.Vector3(centerX,centerY,centerZ);
        //console.debug("Centroid is:")
        //console.debug(centroid)

        //axes.. based on object size
        debugAxis(mesh.geometry.boundingSphere.radius * 2.0);

        //THREE.GeometryUtils.center( geometry );
        //camera.lookAt( scene.position );
        //camera.target.position.copy( new THREE.Vector3(50,0,0));

        var d = safeDistance();
        var light = new THREE.SpotLight( 0xaaaaaa );
        light.position.set(d, d, d);
        scene.add(light);

        light = new THREE.SpotLight( 0xaaaaaa );
        light.position.set(-d, d, d);
        scene.add(light);

        scene.add ( new THREE.AmbientLight( 0xaaaaaa ) );

        if (firstTimeLoad){
            setCameraView(settings.initialView);
            firstTimeLoad = false;
        }
    }

// animation loop
    function animate() {
        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame( animate );
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
        var PIseconds = Date.now() * Math.PI;
        // update camera controls
        cameraControls.update();

        // animation of all objects
        if ( autoRotate ){
            rotateObjects(PIseconds * -0.0003);
        }
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
        renderer.render( scene, camera );
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
        setZoom : function(factor){
            camera.position.multiplyScalar(factor);
        },
        captureImage: function(){
            return renderer.domElement.toDataURL("image/png");
        }
    };

}();