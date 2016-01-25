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

  'container'   : null,
  'basePath'    : './',
  'jsonPath'    : null,
  'jsonContainer' : null,

  'grid1H' : null,
  'grid1K' : null,
  'grid1XL' : null,

  'tween' : null,

  'globalView' : true,

  //-- Fog density save
  'fogDensity' : null,

  //-- Defined texts
  'textSel' : [],

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
  'colors'  : [],
  'textures' : {},

  //-- HUD
  'withHudPanel' : false,
  'hudMultipleSelect' : true,

  //-- Systems
  'systems' : [],

  //-- Starfield
  'starfield' : null,

  //-- Start animation
  'startAnim' : true,

  //-- Scale system effect
  'effectScaleSystem' : [10,800],

  //-- Graphical Options
  'optDistObj' : 1500,

  //-- Player position
  'playerPos' : null,

  //-- Active 2D top view
  'isTopView' : false,

  //-- Show galaxy infos
  'showGalaxyInfos' : false,

  /**
   * Init Ed3d map
   *
   */

  'init' : function(options) {

    // Merge options with defaults
    var options = $.extend({
        container: Ed3d.container,
        basePath: Ed3d.basePath,
        jsonPath: Ed3d.jsonPath,
        jsonContainer: Ed3d.jsonContainer,
        withHudPanel: Ed3d.withHudPanel,
        hudMultipleSelect: Ed3d.hudMultipleSelect,
        effectScaleSystem: Ed3d.effectScaleSystem,
        startAnim: Ed3d.startAnim,
        playerPos: Ed3d.playerPos,
        showGalaxyInfos: false
    }, options);

    $('#loader').show();

    //-- Set Option
    this.basePath          = options.basePath;
    this.container         = options.container;
    this.jsonPath          = options.jsonPath;
    this.jsonContainer     = options.jsonContainer;
    this.withHudPanel      = options.withHudPanel;
    this.hudMultipleSelect = options.hudMultipleSelect;
    this.startAnim         = options.startAnim;
    this.effectScaleSystem = options.effectScaleSystem;
    this.playerPos         = options.playerPos;
    this.showGalaxyInfos   = options.showGalaxyInfos;

    //-- Init 3D map container
    $('#'+Ed3d.container).append('<div id="ed3dmap"></div>');


    //-- Load dependencies

    if(typeof isMinified !== 'undefined') return Ed3d.launchMap();

    $.when(

        $.getScript(Ed3d.basePath + "vendor/three-js/OrbitControls.js"),
        $.getScript(Ed3d.basePath + "vendor/three-js/CSS3DRenderer.js"),
        $.getScript(Ed3d.basePath + "vendor/three-js/Projector.js"),
        $.getScript(Ed3d.basePath + "vendor/three-js/FontUtils.js"),
        $.getScript(Ed3d.basePath + "vendor/three-js/helvetiker_regular.typeface.js"),

        $.getScript(Ed3d.basePath + "js/components/grid.class.js"),
        $.getScript(Ed3d.basePath + "js/components/icon.class.js"),
        $.getScript(Ed3d.basePath + "js/components/hud.class.js"),
        $.getScript(Ed3d.basePath + "js/components/action.class.js"),
        $.getScript(Ed3d.basePath + "js/components/route.class.js"),
        $.getScript(Ed3d.basePath + "js/components/system.class.js"),
        $.getScript(Ed3d.basePath + "js/components/galaxy.class.js"),

        $.getScript(Ed3d.basePath + "vendor/tween-js/Tween.js"),

        $.Deferred(function( deferred ){
            $( deferred.resolve );
        })

    ).done(function() {

      Ed3d.launchMap();

    });

  },

  /**
   * Rebuild completely system list and filter (for new JSon content)
   */

  'rebuild' : function(options) {

    // Remove System & HUD filters
    System.remove();
    HUD.removeFilters();

    // Reload from JSon
    if(this.jsonPath != null) Ed3d.loadDatasFromFile();
    else if(this.jsonContainer != null) Ed3d.loadDatasFromContainer();

    Action.moveInitalPosition();

  },

  /**
   * Launch
   */

  'launchMap' : function() {

      Ed3d.loadTextures();

      Ed3d.initScene();

      // Create grid

      Ed3d.grid1H  = $.extend({}, Grid.init(100, 0x111E23, 0), {});
      Ed3d.grid1K  = $.extend({}, Grid.init(1000, 0x22323A, 1000), {});
      Ed3d.grid1XL = $.extend({}, Grid.infos(10000, 0x22323A, 10000), {});


      // Add some scene enhancement
      Ed3d.skyboxStars();

      // Create HUD
      HUD.create("ed3dmap");

      // Add galaxy center
      Galaxy.addGalaxyCenter();

      // Load systems
      if(this.jsonPath != null) Ed3d.loadDatasFromFile();
      else if(this.jsonContainer != null) Ed3d.loadDatasFromContainer();


      if(!this.startAnim) {
        Ed3d.grid1XL.hide();
        Galaxy.milkyway2D.visible = false;
      }

      // Animate
      animate();

  },

  /**
   * Init Three.js scene
   */

  'loadTextures' : function() {

    //-- Load textures for lensflare
    var texloader = new THREE.TextureLoader();

    //-- Load textures
    this.textures.flare_white = texloader.load(Ed3d.basePath + "textures/lensflare/flare2.png");
    this.textures.flare_yellow = texloader.load(Ed3d.basePath + "textures/lensflare/star_grey2.png");
    this.textures.flare_center = texloader.load(Ed3d.basePath + "textures/lensflare/flare3.png");

    //-- Load sprites
    Ed3d.material.glow_1 = new THREE.SpriteMaterial({
      map: this.textures.flare_yellow,
      color: 0xffffff, transparent: false,
       fog: true
    });
    Ed3d.material.glow_2 = new THREE.SpriteMaterial({

      map: Ed3d.textures.flare_white, transparent: true, size: 15,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5
    });

  },

  'addCustomMaterial' : function (id, color) {

    var color = new THREE.Color('#'+color);
    this.colors[id] = color;

  },


  /**
   * Init Three.js scene
   */

  'initScene' : function() {

    container = document.getElementById("ed3dmap");

    //Scene
    scene = new THREE.Scene();
    scene.visible = false;
    /*scene.scale.set(10,10,10);*/

    //camera
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 200000);
    //camera = new THREE.OrthographicCamera( container.offsetWidth / - 2, container.offsetWidth / 2, container.offsetHeight / 2, container.offsetHeight / - 2, - 500, 1000 );

    camera.position.set(0, 500, 500);

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
    controls.maxDistance = 60000;
    controls.noZoom=!1;controls.noPan=!1;controls.staticMoving=!0;controls.dynamicDampingFactor=.3;


    // Add Fog

    scene.fog = new THREE.FogExp2(0x0D0D10, 0.000128);
    renderer.setClearColor(scene.fog.color, 1);
    Ed3d.fogDensity = scene.fog.density;

  },

  /**
   * Show the scene when fully loaded
   */

  'showScene' : function() {

      $('#loader').hide();
      scene.visible = true;

  },

  /**
   * Load Json file to fill map
   */

  'loadDatasFromFile' : function() {

    $.getJSON(this.jsonPath, function(data) {

      Ed3d.loadDatas(data);

    }).done(function() {

      Ed3d.loadDatasComplete();

    });
  },

  'loadDatasFromContainer' : function() {

    var content = $('#'+this.jsonContainer).html();
    var json = null;

    try {
      json = JSON.parse(content);
    } catch (e) {
      console.log("Can't load JSon for systems");
    }
    if(json != null) Ed3d.loadDatas(json);

    Ed3d.loadDatasComplete();

  },

  'loadDatas' : function(data) {

      //-- Init Particle system
      System.initParticleSystem();

      //-- Load cat filters
      if(data.categories != undefined) HUD.initFilters(data.categories);

      //-- Check if simple or complex json
      list = (data.systems !== undefined) ? data.systems : data;

      //-- Loop into systems

      $.each(list, function(key, val) {

        system = System.create(val);
        if(system != undefined) {
          if(val.cat != undefined) Ed3d.addObjToCategories(system,val.cat);
          if(val.cat != undefined) Ed3d.systems.push(system);
        }

      });

      //-- Routes
      if(data.routes != undefined) {
        $.each(data.routes, function(key1, route) {
          Route.createRoute(key1, route.list, route.cat);
        });
      }

  },

  'loadDatasComplete' : function() {

      System.endParticleSystem();
      HUD.init();
      Action.init();

  },

  /**
   * Add an object to a category
   */

  'addObjToCategories' : function(index, catList) {

    $.each(catList, function(keyArr, idCat) {
      Ed3d.catObjs[idCat].push(index);
    });

  },

  /**
   * Create a skybox of particle stars
   */

  'skyboxStars' : function() {

    var sizeStars = 10000;

    var particles = new THREE.Geometry;
    for (var p = 0; p < 5; p++) {
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
   * Calc distance from Sol
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
 //controls.noRotate().set(false);
 //controls.noPan().set(false);
 //controls.minPolarAngle = 0;
 //controls.maxPolarAngle = 0;

  controls.update();

  TWEEN.update(time);

  //-- If 2D top view, lock camera pos
  if(Ed3d.isTopView) {
    camera.rotation.set(-Math.PI/2,0,0);
    camera.position.x = controls.center.x;
    camera.position.z = controls.center.z;
  }


  renderer.render(scene, camera);

  $('#cx').html(Math.round(controls.center.x));
  $('#cy').html(Math.round(controls.center.y));
  $('#cz').html(Math.round(-controls.center.z)); // Reverse z coord

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
    if(scale>=0.01 && scale<10) {
      Action.cursorSel.scale.set(scale, scale, scale);

    }
    Action.cursorSel.rotation.y =  camera.rotation.y ;
  }

  if(Ed3d.textSel['system'] != undefined)
  if(Ed3d.isTopView) {
    Ed3d.textSel['system'].rotation.set(-Math.PI/2,0,0);
  } else {
    Ed3d.textSel['system'].rotation.set(0,0,0);
  }


  //-- Zoom on on galaxy effect
  Action.sizeOnScroll(scale);

  Galaxy.infosUpdateCallback(scale);

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

  //-- Scale change animation
  var scaleFrom = {zoom:25};
  var scaleTo = {zoom:500};
  if(withAnim) {

    //controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(scaleFrom, {override:true}).to(scaleTo, 500)
      .start()
      .onUpdate(function () {
        Galaxy.milkyway[0].material.size = scaleFrom.zoom;
        Galaxy.milkyway[1].material.size = scaleFrom.zoom*4;
      });

  } else {
    Galaxy.milkyway[0].material.size = scaleTo;
    Galaxy.milkyway[1].material.size = scaleTo*4;
  }

  //-- Enable 2D galaxy
  Galaxy.milkyway2D.visible = true;
  Galaxy.infosShow();


  //Galaxy.obj.scale.set(20,20,20);
  if(Action.cursorSel != null)  Action.cursorSel.scale.set(60,60,60);
  Ed3d.grid1H.hide();
  Ed3d.grid1K.hide();
  Ed3d.grid1XL.show();
  Ed3d.starfield.visible = false;
  scene.fog.density = 0.000009;



}

function disableFarView(scale, withAnim) {

  if(!isFarView) return;
  if(withAnim == undefined) withAnim = true;

  isFarView = false;
  var oldScale = parseFloat(1/(25/3));


  //-- Scale change animation

  var scaleFrom = {zoom:250};
  var scaleTo = {zoom:64};
  if(withAnim) {

    //controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(scaleFrom, {override:true}).to(scaleTo, 500)
      .start()
      .onUpdate(function () {
        Galaxy.milkyway[0].material.size = scaleFrom.zoom;
        Galaxy.milkyway[1].material.size = scaleFrom.zoom;
      });

  } else {
    Galaxy.milkyway[0].material.size = scaleTo;
    Galaxy.milkyway[1].material.size = scaleTo;
  }

  //-- Disable 2D galaxy
  Galaxy.milkyway2D.visible = false;
  Galaxy.infosHide();

  //-- Show element
  Galaxy.milkyway[0].material.size = 16;
//
  camera.scale.set(1,1,1);
  if(Action.cursorSel != null)  Action.cursorSel.scale.set(1,1,1);
  Ed3d.grid1H.show();
  Ed3d.grid1K.show();
  Ed3d.grid1XL.hide();
  Ed3d.starfield.visible = true;
  scene.fog.density = Ed3d.fogDensity;
}


function render() {
  renderer.render(scene, camera);
}


window.addEventListener('resize', function () {
  if(renderer != undefined) {
    var width = container.offsetWidth;
    var height = container.offsetHeight;
    if(width<100) width = 100;
    if(height<100) height = 100;
    renderer.setSize(width, height);
    camera.aspect = width / height;
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

  //-- Save new pos

  camSave.x = Math.round(camera.position.x/p)*p;
  camSave.y = Math.round(camera.position.y/p)*p;
  camSave.z = Math.round(camera.position.z/p)*p;

}
