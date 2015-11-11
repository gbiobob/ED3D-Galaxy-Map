
var System = {

  'particle' : null,
  'particleGeo' : null,

  /**
   *
   */
  'create' : function(val, withSolid) {

<<<<<<< HEAD
    if(withSolid==undefined) withSolid = false;
=======
    val.x = parseInt(val.x); //-- Revert X coord
    val.y = parseInt(val.y);
    val.z = -parseInt(val.z);


    //Ed3d.addText(val.name, val.x, val.y, val.z, 5);



    //-- Add glow sprite from first cat color if defined, else take white glow

    var mat = Ed3d.material.glow_1;
    if(val.cat != undefined && Ed3d.material.custom[val.cat[0]] != undefined) {
      mat = Ed3d.material.custom[val.cat[0]];
    }
>>>>>>> 6cdd8efca459e8ebaae5355992fdb6d5b16f1961

    val.x = parseInt(val.x);
    val.y = parseInt(val.y);
    val.z = -parseInt(val.z); //-- Revert Z coord

    //-- Particle for far view far
    if(this.particleGeo !== null) {
      var particle = new THREE.Vector3(parseInt(val.x), parseInt(val.y), parseInt(val.z));

      particle.clickable = true;
      this.particleGeo.vertices.push(particle);

    }

    if(withSolid) {
      //-- Add glow sprite from first cat color if defined, else take white glow

      var mat = Ed3d.material.glow_1;
      if(val.cat != undefined && Ed3d.material.custom[val.cat[0]] != undefined) {
        mat = Ed3d.material.custom[val.cat[0]];
      }

      var sprite = new THREE.Sprite( mat );
      sprite.position.set(parseInt(val.x), parseInt(val.y), parseInt(val.z));
      sprite.scale.set(50, 50, 1.0);
      scene.add(sprite); // this centers the glow at the mesh


      //-- Sphere
      var geometry = new THREE.SphereGeometry(2, 10, 10);

      var sphere = new THREE.Mesh(geometry, Ed3d.material.white);

      sphere.position.set(parseInt(val.x), parseInt(val.y), parseInt(val.z));

      sphere.name = val.name;

      sphere.clickable = true;
      sphere.idsprite = sprite.id;
      scene.add(sphere);

      return sphere;
    }

  },


  'initParticleSystem' : function () {

    this.particleGeo = new THREE.Geometry;

    var particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5,
      fog: false
    });
    this.particle = new THREE.Points(this.particleGeo, particleMaterial);


    scene.add(this.particle);
  },


  /**
   * Load Spectral system color
   */
  'loadSpectral' : function(val) {

  }

}
