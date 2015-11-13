
var Galaxy = {


  'obj' : null,
  'milkyway' : null,
  'colors' : [],

  'x' : 25,
  'y' : -21,
  'z' : 25900,


  'addGalaxyCenter' : function () {

    var objVal = new Object;
    objVal.name = 'Sagittarius A*';
    objVal.x = this.x;
    objVal.y = this.y;
    objVal.z = this.z;
    objVal.cat = [];


    this.obj = System.create(objVal, true);


    var sprite = new THREE.Sprite( Ed3d.material.glow_2 );
    sprite.scale.set(50, 40, 2.0);
    this.obj.add(sprite); /// this centers the glow at the mesh

    this.createParticles();


  },

  'createParticles' : function () {

       // terrain
    var img = new Image();
    img.onload = function () {

        //get height data from img
        Galaxy.getHeightData(img,10);

    };
    // load img source
    img.src = Ed3d.basePath + "textures/heightmap2.jpg";


  },

  //return array with height data from img
  'getHeightData' : function(img,scale) {


    var particles = new THREE.Geometry;

    if (scale == undefined) scale=1;

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
    var maxDensity = 14;

    for (var i = 0; i<pix.length; i +=4) {

      var all = pix[i]+pix[i+1]+pix[i+2];

      var avg = Math.round((pix[i]+pix[i+1]+pix[i+2])/3);

      if(avg>min) {
        var x = 15.6*((i / 4) % img.width);
        var z = 15.6*(Math.floor((i / 4) / img.height));

        var density = Math.floor((pix[i]-min)/10);
        if(density>maxDensity) density = maxDensity;


        for (var y = -density; y < density; y++) {
          var particle = new THREE.Vector3(
            x+(Math.random() * 50),
            (y*10)+(Math.random() * 50),
            z+(Math.random() * 50)
          );
          particles.vertices.push(particle);

          var r = Math.round(pix[i]);
          var g = Math.round(pix[i+1]);
          var b = Math.round(pix[i+2]);

          this.colors[nb] = new THREE.Color("rgb("+r+", "+g+", "+b+")");
          nb++;
        };
      }
    }


    particles.colors = this.colors;

    var particleMaterial = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_white, transparent: true, size: 25,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });


    //particleMaterial.color.setHSL( 1.0, 0.2, 0.7 );

    var points = new THREE.Points(particles, particleMaterial);
    points.sortParticles = true;
    particles.center();

    this.milkyway = points;
    this.milkyway.visible = false;

    this.obj.add(points);

  }

}
