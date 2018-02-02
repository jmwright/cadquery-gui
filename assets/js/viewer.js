
var VIEWER = function() {
  var mesh, renderer, scene, camera, controls;
  var settings = {
      initialView: 'ISO',
      clearColor: 0x696969,
      containerId: ""
  };

  function init() {
      // renderer
      renderer = new THREE.WebGLRenderer();
      var width = $('#modelview').width();
      renderer.setSize(width, width * 0.8);
      renderer.setClearColor(settings.clearColor, 1);

      $(window).resize(function() {
          var width = $('#modelview').width();
          renderer.setSize(width, width * 0.8);
      });

      document.getElementById(settings.containerId).appendChild(renderer.domElement);

      // scene
      scene = new THREE.Scene();

      // camera
      camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set( 20, 20, 20 );

      // controls
      controls = new THREE.OrbitControls( camera );
      controls.addEventListener( 'change', render ); // use if there is no animation loop

      // ambient
      scene.add( new THREE.AmbientLight( 0x222222 ) );

      // light
      var light = new THREE.DirectionalLight( 0xffffff, 1 );
      light.position.set( 20, 20, 0 );
      scene.add( light );

      // axes
      // scene.add( new THREE.AxisHelper( 20 ) );

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
      var baseGrid = new THREE.GridHelper( 30, 1 );
      scene.add(baseGrid)

      // geometry
      var geometry = new THREE.SphereGeometry( 5, 12, 8 );

      // material
      var material = new THREE.MeshPhongMaterial( {
          color: 0x00ffff,
          shading: THREE.FlatShading,
          transparent: true,
          opacity: 0.7,
      } );

      // mesh
      mesh = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      render();
  }

  function render() {
      // Main scene
      renderer.render( scene, camera );

      // Origin scene
      originCamera.position.copy(camera.position);
      originCamera.lookAt(originScene.position);
      originCamera.position.setLength(300);
      originRenderer.render(originScene, originCamera);
  }

  //exported stuff
  return {
      init: function(opts) {
          $.extend(settings, opts);
          init();
          // if(!init())  animate();
      }//,
      // toggleRotate : function(){
      //     autoRotate = !autoRotate;
      // },
      // clear : clearScene,
      // load : loadGeometry,
      // setView : setCameraView,
      // zoomAll : zoomAll,
      // setZoom : function(factor){
      //     camera.position.multiplyScalar(factor);
      // },
      // captureImage: function(){
      //     return renderer.domElement.toDataURL("image/png");
      // }
  };
}();
