
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

      var x = parseInt(val.coords.x);
      var y = parseInt(val.coords.y);
      var z = -parseInt(val.coords.z); //-- Revert Z coord

      //-- Add line point
      geometryL.vertices.push(
        new THREE.Vector3(x, y, z)
      );

      var geometry = new THREE.SphereGeometry(3, 10, 10);
      var sphere = new THREE.Mesh(geometry, Ed3d.material.white);
      sphere.position.set(x, y, z);
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
