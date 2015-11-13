
var Route = {


  /**
   * Create a Line route
   *
   * @param {Int} Unique ID for the route
   * @param {JSON} A JSon list of points
   */

  'createRoute' : function(idRoute, route, cat) {

    var geometryL = new THREE.Geometry();
    var nameR = '';

    $.each(route, function(key2, val) {

      //-- Add line point
      geometryL.vertices.push(
        new THREE.Vector3(val.x, val.y, val.z)
      );

      var geometry = new THREE.SphereGeometry(3, 10, 10);
      var sphere = new THREE.Mesh(geometry, Ed3d.material.white);
      sphere.position.set(val.x, val.y, val.z);
      scene.add(sphere);

      nameR += val.name;

    });

    //-- Add lines to scene
    routes[idRoute] = new THREE.Line(geometryL, Ed3d.material.line);
    scene.add(routes[idRoute]);


    //Ed3d.addObjToCategories(routes[idRoute],cat);

    //-- Add route to the HUD
    //HUD.setRoute(idRoute, nameR);

  }


}
