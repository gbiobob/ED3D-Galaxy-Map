
var System = {


  /**
   *
   */
  'create' : function(val) {

    val.x = parseInt(val.x);
    val.y = parseInt(val.y);
    val.z = parseInt(val.z);


    //Ed3d.addText(val.name, val.x, val.y, val.z, 5);



    //-- Add glow sprite from first cat color if defined, else take white glow

    var mat = Ed3d.material.glow_1;
    if(Ed3d.material.custom[val.cat[0]] != undefined) {
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

    return sphere;
 },

}
