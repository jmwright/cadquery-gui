
var VIEWER = function() {
  var mesh, renderer, scene, camera, controls;
  var currentObjects = []; // Holds all of the objects that we are rendering
  var currentEdges = []; // Holds all of the edges for the objects that were are rendering
  var centroid;
  var navBarHeight = 50; //px
  var settings = {
      initialView: 'ISO',
      clearColor: 0x696969,
      containerId: ""
  };
  // material
  var material = new THREE.MeshPhongMaterial( {
      color: 0xCCCCCC,
      shading: THREE.FlatShading,
      transparent: true,
      opacity: 1.0
  } );

  // Sets the main 3D scene and the origin scene up
  function init() {
      // renderer
      renderer = new THREE.WebGLRenderer();
      var width = $('#modelview').width();
      renderer.setSize(width, width * 0.8);
      renderer.setClearColor(settings.clearColor, 1);

      // Keeps our 3D view properly sized
      $(window).resize(function() {
          renderer.setSize(window.innerWidth, window.innerHeight - navBarHeight);
      });

      document.getElementById(settings.containerId).appendChild(renderer.domElement);

      // scene
      scene = new THREE.Scene();

      // camera
      camera = new THREE.PerspectiveCamera(40, window.innerWidth / (window.innerHeight - navBarHeight), 1, 10000);
      camera.position.set(60, 60, 60);
      camera.up.set( 0, 0, 1 );

      // controls
      controls = new THREE.OrbitControls(camera);
      controls.addEventListener('change', render); // use if there is no animation loop

      // ambient
      scene.add(new THREE.AmbientLight( 0x222222 ));

      // light
      var light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(60, 60, 60);
      scene.add(light);
      var light2 = new THREE.DirectionalLight(0xffffff, 1);
      light2.position.set(-60, -60, -60);
      scene.add(light2);

      // Set up the origin indicator
      originContainer = document.getElementById('indicator');
      originRenderer = new THREE.WebGLRenderer({
              antialias   : true, // to get smoother output
              preserveDrawingBuffer : true  // to allow screenshot
          });
      originRenderer.setClearColor(0xf0f0f0, 1);
      originRenderer.setSize(100.0, 100.0);
      originRenderer.setClearColor(settings.clearColor, 1);
      originContainer.appendChild(originRenderer.domElement);
      originScene = new THREE.Scene();
      originCamera = new THREE.PerspectiveCamera(35, 100.0 / 100.0, 1, 1000);
      originCamera.up = camera.up;

      // Set up the axes for the origin indicator
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

      // Base grid helps us orient ourselves
      var baseGrid = new THREE.GridHelper(30, 1);
      baseGrid.geometry.rotateX( Math.PI / 2 );
      scene.add(baseGrid);

      render();
  }

  // Loads the JSON geometry data into the main scene
  function loadGeometry(data) {
      // Make sure that we remove all objects from the scene
      if (currentObjects.length > 0) {
          for (var i = 0; i < currentObjects.length; i++) {
              scene.remove(currentObjects[i]);
              scene.remove(currentEdges[i]);
          }
      }

      // Step through all the results and render them
      for(var j = 0; j < data.allResults.length; j++){
          //load new model
          var loader = new THREE.JSONLoader();
          var model = loader.parse(data.allResults[j]);

          var mesh  = new THREE.Mesh(model.geometry, material);
          var edges = new THREE.EdgesHelper(mesh, 0x000000);

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
          }
      }

      render();
      zoomAll();
  }

  // Shows what has been loaded into the scene
  function render() {
      // Main scene
      renderer.render(scene, camera);

      // Origin scene
      originCamera.position.copy(camera.position);
      originCamera.lookAt(originScene.position);
      originCamera.position.setLength(300);
      originRenderer.render(originScene, originCamera);
  }

  // Makes sure we are not too close to the object when setting a view camera position
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

  // Allows us to reset the camera position to any point in space
  function setCameraPosition(x, y, z) {
      rotateObjects(0);
      camera.position.x = x;
      camera.position.y = y;
      camera.position.z = z;
  }

  // Allows us to reset the rotation angle of the objects in the scene
  function rotateObjects(angle) {
      for(var i = 0; i < scene.children.length; i ++){
          scene.children[ i ].rotation.y = angle;
      }
  }

  // Allows the GUI to pass named views to get the desired camera position
  function setCameraView(viewName) {
      // If there are no objects rendered, don't mess with moving the camera around
      if (currentObjects.length === 0) return;

      var d = safeDistance();
      controls.reset();

      if(viewName === 'ISO') {
          // Move the camera to show us an isometric view
          setCameraPosition(d, -d, d);
      }
      else if(viewName === 'TOP') {
          // Move the camera to show us a top view
          setCameraPosition(0, 0, d);
      }
      else if(viewName === 'BOTTOM') {
          // Move the camera to show us a bottom view
          setCameraPosition(0, 0, -d);
      }
      else if(viewName === 'LEFT') {
          // Move the camera to show us a left side view
          setCameraPosition(d, 0, 0);
      }
      else if(viewName === 'RIGHT') {
          // Move the camera to show us a right side view
          setCameraPosition(-d, 0, 0);
      }
      else if(viewName === 'FRONT') {
          // Move the camera to show us a front view
          setCameraPosition(0, d, 0);
      }
      else if(viewName === 'BACK') {
          // Move the camera to show us a back view
          setCameraPosition(0, -d, 0);
      }
      else if(viewName === 'BOTTOM_LEFT') {
          // Move the camera to show us a bottom left
          setCameraPosition(d, d, -d);
      }
      else if(viewName === 'BOTTOM_RIGHT') {
          // Move the camera to show us a back view
          setCameraPosition(-d, d, -d);
      }
      else if(viewName === 'TOP_LEFT') {
          // Move the camera to show us a bottom left
          setCameraPosition(d, d, d);
      }
      else if(viewName === 'TOP_RIGHT') {
          // Move the camera to show us a back view
          setCameraPosition(-d, d, d);
      }

      // Make sure everything fits in the view
      zoomAll();
  }

  // Allows a UI to re-center the object in the view and zoom to the proper distance
  function fitAll() {
    controls.reset();

    zoomAll();
  }

  // Zooms the main object(s) in the scene to to the proper distance
  function zoomAll() {
      var distToCenter = safeDistance();

      // Move the camera backward
      var target = controls.target;
      var vec = new THREE.Vector3();
      vec.subVectors(camera.position, target);
      vec.setLength(distToCenter);
      camera.position.addVectors(vec, target);
      camera.updateProjectionMatrix();

      controls.update();
  }

  //exported functions
  return {
      init: function(opts) {
          $.extend(settings, opts);
          init();
      },
      loadGeometry : loadGeometry,
      setView : setCameraView,
      zoomAll : zoomAll,
      fitAll: fitAll,
      setCameraPosition: setCameraPosition
      // setZoom : function(factor){
      //     camera.position.multiplyScalar(factor);
      // },
      // captureImage: function(){
      //     return renderer.domElement.toDataURL("image/png");
      // }
  };
}();
