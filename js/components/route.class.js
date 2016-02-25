
var Route = {

  //-- Var to enable routes
  'active' : false,

  //-- Init list coords
  'systems' : [],

  //-- Route list
  'list' : [],

  /**
   * Initialize the systems list for coordinates check
   *
   * @param {Int} Unique ID for the route
   * @param {JSON} A JSon list of points
   */

  'initRoute' : function(idRoute, route) {

    Route.active = true;

    $.each(route.points, function(key, val) {
      Route.systems[val.s] = false;
    });

  },

  /**
   * Create a Line route
   *
   * @param {Int} Unique ID for the route
   * @param {JSON} A JSon list of points
   */

  'createRoute' : function(idRoute, route) {

    var geometryL = new THREE.Geometry();
    var nameR = '';
    var first = null;
    var last = null;

    $.each(route.points, function(key2, val) {

      if(Route.systems[val.s] !== false) {

        var c = Route.systems[val.s];

        if(first==null) first = [c[0], c[1], c[2]];
        last = [c[0], c[1], c[2]];

        //-- Add line point
        geometryL.vertices.push(
          new THREE.Vector3(c[0], c[1], c[2])
        );
        Route.addPoint(c[0], c[1], c[2]);

        /*var geometry = new THREE.SphereGeometry(3, 10, 10);
        var sphere = new THREE.Mesh(geometry, Ed3d.material.white);
        sphere.position.set(x, y, z);
        scene.add(sphere);*/

      } else {

        console.log("Missing point: "+val.s);
      }

    });

    //-- Add lines to scene
    routes[idRoute] = new THREE.Line(geometryL, Ed3d.material.line);

    //-- Add object for start & end
    if(first!==null) routes[idRoute].add(this.addCircle(first));
    if(last!==null)  routes[idRoute].add(this.addCircle(last));

    scene.add(routes[idRoute]);

  },

  'addCircle' : function(point) {
    var cursor = new THREE.Object3D;

    //-- Ring around the system
    var geometryL = new THREE.TorusGeometry( 12, 0.4, 3, 30 );

    var selection = new THREE.Mesh(geometryL, Ed3d.material.orange);
    selection.rotation.x = Math.PI / 2;

    cursor.add(selection);

    cursor.position.set(point[0], point[1], point[2]);

    cursor.scale.set(15,15,15);

    scene.add(cursor);
  },

  'addPoint' : function(x, y, z) {

    /*console.log('Add point route');*/

    /*var cursor = new THREE.Object3D;

    //-- Ring around the system
    var geometryL = new THREE.TorusGeometry( 12, 0.4, 3, 30 );

    var selection = new THREE.Mesh(geometryL, Ed3d.material.selected);
    selection.rotation.x = Math.PI / 2;

    cursor.add(selection);

    //-- Create a cone on the selection
    var geometryCone = new THREE.CylinderGeometry(0, 5, 16, 4, 1, false);
    var cone = new THREE.Mesh(geometryCone, Ed3d.material.selected);
    cone.position.set(0, 20, 0);
    cone.rotation.x = Math.PI;
    cursor.add(cone);

    //-- Inner cone
    var geometryConeInner = new THREE.CylinderGeometry(0, 3.6, 16, 4, 1, false);
    var coneInner = new THREE.Mesh(geometryConeInner, Ed3d.material.black);
    coneInner.position.set(0, 20.2, 0);
    coneInner.rotation.x = Math.PI;
    cursor.add(coneInner);


    cursor.position.set(x, y, -z);

    cursor.scale.set(30,30,30);

    scene.add(cursor);*/
  }


}
