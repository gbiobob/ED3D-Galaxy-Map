
var Galaxy = {


  'obj' : null,
  'milkyway' : [],
  'milkyway2D' : null,
  'colors' : [],

  'x' : 25,
  'y' : -21,
  'z' : 25900,


  'addGalaxyCenter' : function () {

    var objVal = new Object;
    objVal.name = 'Sagittarius A*';
    objVal.coords = {'x':this.y,'y':this.y,'z':this.z};
    objVal.cat = [];

    this.obj = System.create(objVal, true);


    var sprite = new THREE.Sprite( Ed3d.material.glow_2 );
    sprite.scale.set(50, 40, 2.0);
    this.obj.add(sprite); /// this centers the glow at the mesh

    this.createParticles();
    this.add2DPlane();


  },

  'createParticles' : function () {

    var img = new Image();
    img.onload = function () {

      //get height data from img
      Galaxy.getHeightData(img);


      //-- If using start animation: launch it
      if(Ed3d.startAnim) {
        camera.position.set(-10000, 40000, 50000);
        Action.moveInitalPosition(4000);
      } else {
        Action.moveInitalPositionNoAnim();
      }

      Ed3d.showScene();

    };

    //-- load img source
    img.src = Ed3d.basePath + "textures/heightmap7.jpg";

    //-- Add optional infos
    if(Ed3d.showGalaxyInfos) this.showGalaxyInfos();

  },

  /**
   * Add 2D image plane
   */

  'showGalaxyInfos' : function() {

    this.addText('The Orion Spur',10,0,0,0);
    this.addText('Galactic Core Region',this.x,this.y,-this.z,0);
    this.addText('The outer arm vacuus',10,0,14500,0);

    this.addText('The Carina-Sagittarius arm',35000,0,-18000,90);

  },

  /**
   * Add 2D image plane
   */

  'add2DPlane' : function() {

    var texloader = new THREE.TextureLoader();

    //-- Load textures
    var back2D = texloader.load(Ed3d.basePath + "textures/heightmap7.jpg");


    var floorMaterial = new THREE.MeshBasicMaterial( {
      map: back2D,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    } );

    var floorGeometry = new THREE.PlaneGeometry(104000, 104000, 1, 1);
    this.milkyway2D = new THREE.Mesh(floorGeometry, floorMaterial);
    this.milkyway2D.position.set(this.x, this.y, -this.z);
    this.milkyway2D.rotation.x = -Math.PI / 2;
    scene.add(this.milkyway2D);

  },

  /**
   * Add Shape text
   */

  'addText' : function(textShow, x, y, z, rot) {

    var size = 600;
    textShow = textShow.toUpperCase();

    var textShapes = THREE.FontUtils.generateShapes(textShow, {
      'font': 'helvetiker',
      'weight': 'normal',
      'style': 'normal',
      'size': size,
      'curveSegments': 100
    });

    var textGeo = new THREE.ShapeGeometry(textShapes);

      var textMesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({
        color: 0xffffff,
      blending: THREE.AdditiveBlending
      }));

    textMesh.geometry = textGeo;
    textMesh.geometry.needsUpdate = true;

    x -= Math.round(textShow.length*400/2);

    if(rot != 0) textMesh.rotation.z = Math.PI * (rot) / 180;
    textMesh.position.set(x, -1000, z);
    textMesh.rotation.x = -Math.PI / 2;


    scene.add(textMesh);


  },

  /**
   * Create a particle cloud milkyway from an image
   *
   * @param  {Image} img - Image object
   */

  'getHeightData' : function(img) {

    var particles = new THREE.Geometry;
    var particlesBig = new THREE.Geometry;

    //-- Get pixels from milkyway image

    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );

    var size = img.width * img.height;

    context.drawImage(img,0,0);

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    //-- Build galaxy from image data

    var j=0;
    var min = 8;
    var nb = 0;
    var maxDensity = 15;

    //var scaleImg = 16.4;
    var scaleImg = 19.6;

    var colorsBig = [];
    var nbBig = 0;

    for (var i = 0; i<pix.length; i += 12) {

      var all = pix[i]+pix[i+1]+pix[i+2];

      var avg = Math.round((pix[i]+pix[i+1]+pix[i+2])/3);

      if(avg>min) {

        var x = scaleImg*((i / 4) % img.width);
        var z = scaleImg*(Math.floor((i / 4) / img.height));

        var density = Math.floor((pix[i]-min)/10);
        if(density>maxDensity) density = maxDensity;

        var add = Math.ceil(density/maxDensity*2);
        for (var y = -density; y < density; y = y+add) {

          var particle = new THREE.Vector3(
            x+(Math.random() * 25),
            (y*10)+(Math.random() * 50),
            z+(Math.random() * 25)
          );

          //-- Particle color from pixel

          var r = Math.round(pix[i]);
          var g = Math.round(pix[i+1]);
          var b = Math.round(pix[i+2]);


          //-- Big particle

          if(density>=2 && Math.abs(y)-1==0 &&  Math.random() * 1000 < 200) {
            particlesBig.vertices.push(particle);
            colorsBig[nbBig] = new THREE.Color("rgb("+r+", "+g+", "+b+")");
            nbBig++;

          //-- Small particle

          } else if(density<4 || (Math.random() * 1000 < 400-(density*2))) {
            particles.vertices.push(particle);
            this.colors[nb] = new THREE.Color("rgb("+r+", "+g+", "+b+")");
            nb++;
          }
        };
      }
    }

    //-- Create small particles milkyway

    particles.colors = this.colors;

    var particleMaterial = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_yellow,
      transparent: true,
      size: 64,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });

    var points = new THREE.Points(particles, particleMaterial);
    points.sortParticles = true;
    particles.center();

    this.milkyway[0] = points;
    this.milkyway[0].scale.set(20,20,20);

    this.obj.add(points);


    //-- Create big particles milkyway

    particlesBig.colors = colorsBig;

    var particleMaterialBig = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_yellow,
      transparent: true,
      vertexColors: THREE.VertexColors,
      size: 16,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });

    var pointsBig = new THREE.Points(particlesBig, particleMaterialBig);
    pointsBig.sortParticles = true;
    particlesBig.center();

    this.milkyway[1] = pointsBig;
    this.milkyway[1].scale.set(20,20,20);

    this.obj.add(pointsBig);
  }

}
