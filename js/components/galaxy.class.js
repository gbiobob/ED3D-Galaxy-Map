/*

var x = -1 + Math.random() * 2;
var y = -1 + Math.random() * 2;
var z = -1 + Math.random() * 2;
var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
x *= d;
y *= d;
z *= d;

var starParticle = new THREE.Vector3(
       x * starDistance,
       y * starDistance,
       z * starDistance
);

starParticles.vertices.push(starParticle);

*/

var Galaxy = {


  'obj' : null,
  'particles' : null,
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


    this.obj = System.create(objVal);
    scene.add(this.obj);



   /* var sprite = new THREE.Sprite( Ed3d.material.glow_2 );
    sprite.scale.set(50, 50, 1.0);
    this.obj.add(sprite); /// this centers the glow at the mesh*/

    this.createParticles();


  },

  'createParticles' : function () {

       // terrain
    var img = new Image();
    img.onload = function () {

        //get height data from img
        var data = Galaxy.getHeightData(img,10);

        // plane
      /*  var geometry = new THREE.PlaneGeometry(10,10,9,9);
        var texture = THREE.ImageUtils.loadTexture( 'textures/heightmap3.jpg' );
        var material = new THREE.MeshLambertMaterial( { map: texture } );
        plane = new THREE.Mesh( geometry, material );

        //set height of vertices
        for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
             plane.geometry.vertices[i].z = data[i];
        }

        plane.geometry.scale(100,100,100);
        scene.add(plane);*/

    };
    // load img source
    img.src = "textures/heightmap2.jpg";


  },

  //return array with height data from img
  'getHeightData' : function(img,scale) {


    var particles = new THREE.Geometry;

   if (scale == undefined) scale=1;

      var canvas = document.createElement( 'canvas' );
      canvas.width = img.width;
      canvas.height = img.height;
      var context = canvas.getContext( '2d' );

      var size = img.width * img.height;
      var data = new Float32Array( size );

      context.drawImage(img,0,0);

      for ( var i = 0; i < size; i ++ ) {
          data[i] = 0
      }

      var imgd = context.getImageData(0, 0, img.width, img.height);
      var pix = imgd.data;

      var j=0;
      var min = 10;
      var nb = 0;
      var maxDensity = 14;

      for (var i = 0; i<pix.length; i +=4) {

          var all = pix[i]+pix[i+1]+pix[i+2];
          data[j++] = all/(12*scale);

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

            var r = pix[i]+25; if(r>255) r = 255;
            var g = pix[i+1]+25; if(g>255) g = 255;
            var b = pix[i+2]+25; if(b>255) b = 255;

            this.colors[nb] = new THREE.Color("rgb("+r+", "+g+", "+b+")");
            nb++;
          };
        }

      }


        particles.colors = this.colors;

    var particleMaterial = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_white, transparent: true, size: 14,
      vertexColors: THREE.VertexColors,
      blending: THREE.AdditiveBlending
    });
    //particleMaterial.color.setHSL( 1.0, 0.2, 0.7 );

    var starfield = new THREE.Points(particles, particleMaterial);
    starfield.sortParticles = true;
    particles.center();

    this.particles = starfield;

    this.obj.add(starfield);

      return data;
  }

}
