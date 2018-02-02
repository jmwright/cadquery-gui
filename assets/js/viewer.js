
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
      scene.add( new THREE.AxisHelper( 20 ) );

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
      renderer.render( scene, camera );
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
