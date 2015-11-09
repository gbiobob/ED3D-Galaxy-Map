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


    var sprite = new THREE.Sprite( Ed3d.material.glow_2 );
    sprite.scale.set(50, 50, 1.0);
    this.obj.add(sprite); // this centers the glow at the mesh

    this.createParticles();
  },

  'createParticles' : function () {

    var starParticles = new THREE.Geometry();
    var starDistance = 5000;

    for (var i = 1; i <= 500; i++) {
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
    };



    var particle_system_material = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_white, transparent: true, size: 40
    });

    particle_system_material.alphaTest = 0.5
    var particleSystem = new THREE.Points(
      starParticles,
      particle_system_material
    );

    particleSystem.position.set(this.x, this.y, this.z);

    scene.add(particleSystem);
  }

}