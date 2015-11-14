
var System = {

  'particle' : null,
  'particleGeo' : null,
  'particleColor' : [],
  'count' : 0,

  /**
   *
   */
  'create' : function(val, withSolid) {

    if(withSolid==undefined) withSolid = false;

    val.x = parseInt(val.x);
    val.y = parseInt(val.y);
    val.z = -parseInt(val.z); //-- Revert Z coord

    //-- Particle for far view far
    var colors = [];
    if(this.particleGeo !== null) {
      var particle = new THREE.Vector3(parseInt(val.x), parseInt(val.y), parseInt(val.z));

      //-- Get point color

      if(val.cat != undefined && val.cat[0] != undefined && Ed3d.colors[val.cat[0]] != undefined) {
        this.particleColor[this.count] = Ed3d.colors[val.cat[0]];
      } else {
        this.particleColor[this.count] = new THREE.Color('#ffffff');
      }

      //-- If system got some categories, add it to cat list and save his main color
      if(val.cat != undefined) {
        Ed3d.addObjToCategories(this.count,val.cat);
        particle.color = this.particleColor[this.count];
      }

      //-- Attach name and set point as clickable
      particle.clickable = true;
      particle.name = val.name;
      if(val.infos != undefined) particle.infos = val.infos;

      this.particleGeo.vertices.push(particle);

      this.count++;
    }

    if(withSolid) {
      //-- Add glow sprite from first cat color if defined, else take white glow

      var mat = Ed3d.material.glow_1;

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

  },
  'endParticleSystem' : function () {

    this.particleGeo.colors = this.particleColor;

    var particleMaterial = new THREE.PointsMaterial({
      map: Ed3d.textures.flare_yellow,
      vertexColors: THREE.VertexColors,
      size: 200,
      fog: false,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });

    this.particle = new THREE.Points(this.particleGeo, particleMaterial);

    this.particle.sortParticles = true;
    this.particle.clickable = true;

    scene.add(this.particle);
  },


  /**
   * Load Spectral system color
   */
  'loadSpectral' : function(val) {

  }

}
