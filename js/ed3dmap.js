//--
var camera;
var controls;
var scene;
var light;
var renderer;

var raycaster;

var composer;

//-- Map Vars
var container;
var routes = [];
var lensFlareSel;


var Ed3d = {

  'container' : null,
  'jsonPath' : null,
  'effects' : false,

  'grid1H' : null,
  'grid1K' : null,
  'grid1XL' : null,

  'tween' : null,

  'globalView' : true,

  //-- Fog density save
  'fogDensity' : null,

  //-- Defined texts
  'text' : [],

  //-- Object list by categories
  'catObjs' : [],

  //-- Materials
  'material' : {
    'Trd' : new THREE.MeshBasicMaterial({
      color: 0xffffff
    }),
    'line' : new THREE.LineBasicMaterial({
      color: 0x0E7F88
    }),
    'white' : new THREE.MeshBasicMaterial({
      color: 0xffffff
    }),
    'orange' : new THREE.MeshBasicMaterial({
      color: 0xFF9D00
    }),
    'black' : new THREE.MeshBasicMaterial({
      color: 0x010101
    }),
    'lightblue' : new THREE.MeshBasicMaterial({
      color: 0x0E7F88
    }),
    'darkblue' : new THREE.MeshBasicMaterial({
      color: 0x16292B
    }),
    'selected' : new THREE.MeshPhongMaterial({
      color: 0x0DFFFF
    }),
    'transparent' : new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0
    }),
    'glow_1' : null,
    'custom' : []



  },
  'textures' : {

  },

  //-- Systems
  'systems' : [],

  //-- Starfield
  'starfield' : null,

  //-- Graphical Options
  'optDistObj' : 1500,


  /**
   * Init Ed3d map
   *
   * @param {String} ID of the container for Ed3d map
   * @param {String} Json path to load for systems data
   */

  'init' : function(container, jsonPath, withEffects) {

    $('#loader').show();

    this.effects = withEffects;

    //-- Load dependencies
    $.when(

        $.getScript("vendor/three-js/OrbitControls.js"),
        $.getScript("vendor/three-js/CSS3DRenderer.js"),
        $.getScript("vendor/three-js/Projector.js"),
        $.getScript("vendor/three-js/FontUtils.js"),
        $.getScript("vendor/three-js/helvetiker_regular.typeface.js"),

        $.getScript("js/components/grid.class.js"),
        $.getScript("js/components/hud.class.js"),
        $.getScript("js/components/action.class.js"),
        $.getScript("js/components/route.class.js"),
        $.getScript("js/components/system.class.js"),
        $.getScript("js/components/galaxy.class.js"),

        $.getScript("vendor/tween-js/Tween.js"),


      /*  $.getScript("vendor/three-js/shaders/CopyShader.js"),
        $.getScript("vendor/three-js/shaders/BokehShader.js"),
        $.getScript("vendor/three-js/postprocessing/EffectComposer.js"),
        $.getScript("vendor/three-js/postprocessing/RenderPass.js"),
        $.getScript("vendor/three-js/postprocessing/MaskPass.js"),
        $.getScript("vendor/three-js/postprocessing/ShaderPass.js"),
        $.getScript("vendor/three-js/postprocessing/BokehPass.js"),
        $.getScript("vendor/three-js/postprocessing/BloomPass.js"),*/



        $.Deferred(function( deferred ){
            $( deferred.resolve );
        })

    ).done(function() {

      Ed3d.container = container;
      Ed3d.jsonPath  = jsonPath;


      Ed3d.loadTextures();

      Ed3d.initScene();

      // Create grid

      Ed3d.grid1H  = $.extend({}, Grid.init(100, 0x111E23), {});
      Ed3d.grid1K  = $.extend({}, Grid.init(1000, 0x22323A), {});
      Ed3d.grid1XL = $.extend({}, Grid.init(10000, 0x22323A), {});


      // Add some scene enhancement
      Ed3d.skyboxStars();

      // Load systems
      Ed3d.loadDatas();

      // Animate
      animate();

    });

  },


  /**
   * Init Three.js scene
   */

  'loadTextures' : function() {

    //-- Load textures for lensflare
    var texloader = new THREE.TextureLoader();

    //-- Load textures
    this.textures.flare_white  = texloader.load("textures/lensflare/flare2.png");
    this.textures.flare_yellow = texloader.load("textures/lensflare/star_grey.png");
    this.textures.flare_center = texloader.load("textures/lensflare/flare3.png");

    //-- Load sprites
    Ed3d.material.glow_1 = new THREE.SpriteMaterial({
      map: this.textures.flare_yellow,
      color: 0xffffff, transparent: false,
       fog: true
    });
    Ed3d.material.glow_2 = new THREE.SpriteMaterial({
      map: this.textures.flare_center,
      color: 0xFEECDE, transparent: false,
       fog: true
    });

  },

  'addCustomMaterial' : function (id, color) {

    var color = new THREE.Color('#'+color);
    Ed3d.material.custom[id] = new THREE.SpriteMaterial({
      map: this.textures.flare_yellow,
      color: color, transparent: false
    });

  },


  /**
   * Init Three.js scene
   */

  'initScene' : function() {

    container = document.getElementById("ed3dmap");

    //camera
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 200000);

    camera.position.set(0, 500, 500);

    //Scene
    scene = new THREE.Scene();

    //HemisphereLight
    light = new THREE.HemisphereLight(0xffffff, 0xcccccc);
    scene.add(light);

    //WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.domElement.style.zIndex = 5;
    container.appendChild(renderer.domElement);

    //controls
    controls = new THREE.OrbitControls(camera, container);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 3.0;
    controls.panSpeed = 0.8;

    // Add Fog

    scene.fog = new THREE.FogExp2(0x0D0D10, 0.000128);
    renderer.setClearColor(scene.fog.color, 1);
    Ed3d.fogDensity = scene.fog.density;

    // postprocessing
    if(Ed3d.effects) {
      composer = new THREE.EffectComposer( renderer );
      composer.addPass( new THREE.RenderPass( scene, camera ) );

      var bokehPass = new THREE.BokehPass( scene, camera, {
        focus:    0.5,
        aperture: 0.0025,
        maxblur:  10.0,

        width:  container.offsetWidth,
        height: container.offsetHeight
      } );
      bokehPass.renderToScreen = true;
      composer.addPass( bokehPass );
    }



  },

  /**
   * Load Json file to fill map
   */

  'loadDatas' : function() {

    $.getJSON(this.jsonPath, function(data) {

      HUD.create("ed3dmap");

      System.initParticleSystem();

      // Add galaxy center
      Galaxy.addGalaxyCenter();

      //-- Load cat filters
      if(data.categories != undefined) HUD.initFilters(data.categories);

      //-- Loop into systems

      $.each(data.systems, function(key, val) {

        system = System.create(val);
        if(val.cat != undefined) Ed3d.addObjToCategories(system,val.cat);
        Ed3d.systems.push(system);

        scene.add(system);

      });

      //-- Routes
      if(data.routes != undefined) {
        $.each(data.routes, function(key1, route) {
          Route.createRoute(key1, route.list, route.cat);
        });
      }


    }).done(function() {

      HUD.init();
      Action.init();

      //-- Init Events
      $('#loader').hide();
    });;
  },




  /**
   * Add an object to a category
   */

  'addObjToCategories' : function(obj, catList) {

    $.each(catList, function(keyArr, idCat) {
      Ed3d.catObjs[idCat].push(obj.id);
    });

  },

  /**
   * Create a skybox of particle stars
   */

  'skyboxStars' : function() {

    var sizeStars = 10000;

    var particles = new THREE.Geometry;
    for (var p = 0; p < 5000; p++) {
      var particle = new THREE.Vector3(
        Math.random() * sizeStars - (sizeStars / 2),
        Math.random() * sizeStars - (sizeStars / 2),
        Math.random() * sizeStars - (sizeStars / 2)
      );
      particles.vertices.push(particle);
    }

    var particleMaterial = new THREE.PointsMaterial({
      color: 0xeeeeee,
      size: 2
    });
    this.starfield = new THREE.Points(particles, particleMaterial);


    scene.add(this.starfield);
  },

  /**
   * Add a text
   */

  'addText' : function(id, textShow, x, y, z, size) {


    var textShapes = THREE.FontUtils.generateShapes(textShow, {
      'font': 'helvetiker',
      'weight': 'normal',
      'style': 'normal',
      'size': size,
      'curveSegments': 100
    });


    var text = new THREE.ShapeGeometry(textShapes);
    var textMesh = new THREE.Mesh(text, new THREE.MeshBasicMaterial({
      color: 0xffffff
    }));
    textMesh.position.set(x, y, z);
    //textMesh.rotation.x = -Math.PI / 2;
    //textMesh.rotation.z = -Math.PI;

    if(Ed3d.text[id] != undefined) {
      scene.remove(scene.getObjectById( Ed3d.text[id], true ));
    }

    Ed3d.text[id] = textMesh.id;
    scene.add(textMesh);

  },


  /**
   * Add a text
   */

  'calcDistSol' : function(target) {

    var dx = target.x;
    var dy = target.y;
    var dz = target.z;

    return Math.round(Math.sqrt(dx*dx+dy*dy+dz*dz));
  }


}



//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

function animate(time) {



  refreshWithCamPos();

  controls.update();

  TWEEN.update(time);
    /*setTimeout( function() {

        requestAnimationFrame( animate );

    }, 1000 / 60 );*/


  renderer.render(scene, camera);

  if(Ed3d.effects) composer.render();

  $('#cx').html(Math.round(controls.center.x));
  $('#cy').html(Math.round(controls.center.y));
  $('#cz').html(Math.round(controls.center.z));

  $('#distsol').html(Ed3d.calcDistSol(controls.target));

  //-- Move starfield with cam
  Ed3d.starfield.position.set(
    controls.target.x-(controls.target.x/10)%4000,
    controls.target.y-(controls.target.y/10)%4000,
    controls.target.z-(controls.target.z/10)%4000
  );

  //-- Change selection cursor size depending on camera distance

  var scale = distanceFromTarget(camera)/200;
  if(Action.cursorSel != null) {
    if(scale>=1 && scale<10) {
      Action.cursorSel.scale.x = scale;
      Action.cursorSel.scale.y = scale;
      Action.cursorSel.scale.z = scale;
    }
  }


  //-- Zoom on on galaxy effect
  //if(Galaxy.obj != null)
  if(scale>25) {

    enableFarView(scale);

  } else {

    disableFarView(scale);

  }



  requestAnimationFrame( animate );


}

var isFarView = false;

function enableFarView (scale, withAnim) {

  if(isFarView) return;
  if(withAnim == undefined) withAnim = true;

  isFarView = true;


  //Ed3d.systems.forEach(function(el) {scene.getObjectById( el.idsprite, true ).scale.set(1000, 1000, 1.0)});


  //-- Scale change animation
  var newScale = parseFloat(1/(25/3));
  if(withAnim) {

    var scaleFrom = {
      x: 1, y: 1 , z: 1
    };
    var scaleTo = {
      x: 10, y: 10, z: 10
    };

    controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(scaleFrom).to(scaleTo, 1000)
      .start()
      .onUpdate(function () {
        camera.scale.set(scaleFrom.x,scaleFrom.y,scaleFrom.z);
      })
      .onComplete(function () {

        //camera.scale.set(newScale, newScale, newScale);

        controls.enabled = true;
        controls.update();


    });
  } else {
    camera.scale.set(newScale,newScale,newScale);
    controls.update();
  }

  //-- Show element

  Galaxy.obj.scale.set(20,20,20);
  if(Action.cursorSel != null)  Action.cursorSel.scale.set(100,100,100);
  Ed3d.grid1H.obj.visible = false;
  Ed3d.grid1K.obj.visible = false;
  Ed3d.starfield.visible = false;
  scene.fog.density = 0.00005;



}

function disableFarView(scale, withAnim) {

  if(!isFarView) return;
  if(withAnim == undefined) withAnim = false;

  isFarView = false;
  var oldScale = parseFloat(1/(25/3));

  //Ed3d.systems.forEach(function(el) {scene.getObjectById( el.idsprite, true ).scale.set(1, 1, 1.0)});

  //-- Scale change animation
  if(withAnim) {
    var scaleFrom = {
      x: oldScale, y: oldScale, z: oldScale
    };
    var scaleTo = {
      x: 1, y: 1 , z: 1
    };
    controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(scaleFrom).to(scaleTo, 1000)
      .start()
      .onUpdate(function () {
        camera.scale.set(scaleFrom.x,scaleFrom.y,scaleFrom.z);
        controls.update();
      })
      .onComplete(function () {
        controls.enabled = true;
        controls.update();

    controls = new THREE.OrbitControls(camera, container);
    });
  } else {
    camera.scale.set(1,1,1);
  }



  //-- Show element
  Galaxy.obj.scale.set(1,1,1);
  camera.scale.set(1,1,1);
  if(Action.cursorSel != null)  Action.cursorSel.scale.set(1,1,1);
  Ed3d.grid1H.obj.visible = true;
  Ed3d.grid1K.obj.visible = true;
  Ed3d.starfield.visible = true;
  scene.fog.density = Ed3d.fogDensity;
}





function render() {
  renderer.render(scene, camera);
}


window.addEventListener('resize', function () {
  if(renderer != undefined) {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
  }
});












//--------------------------------------------------------------------------
// Test perf


function distance (v1, v2) {
    var dx = v1.position.x - v2.position.x;
    var dy = v1.position.y - v2.position.y;
    var dz = v1.position.z - v2.position.z;

    return Math.round(Math.sqrt(dx*dx+dy*dy+dz*dz));
}

function distanceFromTarget (v1) {
    var dx = v1.position.x - controls.target.x;
    var dy = v1.position.y - controls.target.y;
    var dz = v1.position.z - controls.target.z;

    return Math.round(Math.sqrt(dx*dx+dy*dy+dz*dz));
}

var camSave = {'x':0,'y':0,'z':0};


function refreshWithCamPos() {

  var d = new Date();
  var n = d.getTime();

  //-- Refresh only every 5 sec
  if(n % 1 != 0) return;


  Ed3d.grid1H.addCoords();
  Ed3d.grid1K.addCoords();

  //-- Refresh only if the camera moved
  var p = Ed3d.optDistObj/2;
  if(
    camSave.x == Math.round(camera.position.x/p)*p &&
    camSave.y == Math.round(camera.position.y/p)*p &&
    camSave.z == Math.round(camera.position.z/p)*p
  ) return;

  //-- Execute sdome refresh
  refreshShowSystems();

  //-- Save new pos

  camSave.x = Math.round(camera.position.x/p)*p;
  camSave.y = Math.round(camera.position.y/p)*p;
  camSave.z = Math.round(camera.position.z/p)*p;

}

function refreshShowSystems() {

  Ed3d.systems.forEach(setVisibilitySystem);

}


function setVisibilitySystem(obj) {

  if(obj.filtered != undefined && obj.filtered == 0) return;

  if(distance(obj,camera)<Ed3d.optDistObj) {
    if(!obj.visible) obj.visible = true;
  } else {
    if(obj.visible) obj.visible = false;
  }

}

function testPerfomances() {


  //-- Particle
  var texloader = new THREE.TextureLoader();
  var particle_system_geometry = new THREE.Geometry();



  //-- Object
  var geometry = new THREE.SphereGeometry(6, 10, 10);
  geometry.computeVertexNormals();
  for (var p = 0; p < 20000; p++) {

    var x = (Math.random() * 10000)-5000;
    var y = (Math.random() * 10000)-5000;
    var z = (Math.random() * 10000)-5000;

    Ed3d.systems[p] = new THREE.Mesh(geometry, Ed3d.material.white);
    Ed3d.systems[p].position.set(x, y, z);
    Ed3d.systems[p].visible = false;

    var sprite = new THREE.Sprite( Ed3d.material.glow_1 );
    sprite.scale.set(120, 120, 1.0);
    Ed3d.systems[p].add(sprite); // this centers the glow at the mesh

    scene.add(Ed3d.systems[p]);


    particle_system_geometry.vertices.push(new THREE.Vector3(x, y, z));

  }

  var particle_system_material = new THREE.PointsMaterial({
    map: Ed3d.textures.flare_white, transparent: true, size: 40
  });
  particle_system_material.alphaTest = 0.5
  var particleSystem = new THREE.Points(
    particle_system_geometry,
      particle_system_material
  );
  scene.add(particleSystem);

}