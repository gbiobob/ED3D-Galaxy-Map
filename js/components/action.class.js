
var Action = {

  'cursorSel' : null,
  'mouseVector' : null,
  'oldSel' : null,
  'objHover' : null,

  /**
   * Create a Line route
   */
  'init' : function() {

    this.mouseVector = new THREE.Vector3();

    container.addEventListener('click', this.onMouseClick, false);
    //container.addEventListener('mousemove', this.onMouseHover, false);
 },

  /**
   * Mouse Hover
   */

  'onMouseHover' : function (e) {

    e.preventDefault();

    this.mouseVector = new THREE.Vector3(
      (e.clientX / container.offsetWidth) * 2 - 1, -(e.clientY / container.offsetHeight) * 2 + 1,
      1);

    this.mouseVector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, this.mouseVector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {

      if(intersects[0].object.geometry.type != 'SphereGeometry') return;


      $('#hud #infos').html("Intersected object: " + intersects.length + " - " + intersects[0].object.name);
      Action.hoverOnObj(intersects[0].object);
    }

  },


  'hoverOnObj' : function (obj) {

    if (this.objHover !== null) this.objHover.material = Ed3d.material.white;

    obj.material = Ed3d.material.orange;
    this.objHover = obj;

  },


  /**
   * Mouse down
   */

  'onMouseClick' : function (e) {

    e.preventDefault();

    this.mouseVector = new THREE.Vector3(
      (e.clientX / container.offsetWidth) * 2 - 1, -(e.clientY / container.offsetHeight) * 2 + 1,
      1);

    this.mouseVector.unproject(camera);
    var raycaster = new THREE.Raycaster(camera.position, this.mouseVector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {

      if(intersects[0].object.geometry.type != 'SphereGeometry') return;

      $('#hud #infos').html(
        "<h2>"+intersects[0].object.name+"</h2>"+
        "Intersected object: " + intersects.length
      );
      Action.moveToObj(intersects[0].object);
    }

  },




  'moveToObj' : function (obj) {

    obj.material = Ed3d.material.selected;
    this.addCusorOnSelect(obj.position.x, obj.position.y, obj.position.z);

    //-- Move camera to target

    camera.position.set(obj.position.x, obj.position.y + 100, obj.position.z - 100);
    camera.rotation.set(0, 0, 0);


    //  controls.zoom.set(0);
    controls.center.set(obj.position.x, obj.position.y, obj.position.z);
    controls.update();
    render();


    //-- Add text
    var textAdd = obj.name;
    textAdd += ' - ' + Math.round(obj.position.x) + ', ' + Math.round(obj.position.y) + ', ' + Math.round(obj.position.z);

    Ed3d.addText(textAdd, obj.position.x, obj.position.y, obj.position.z, 5);

    //-- Move grid to object
    this.moveGridTo(obj);

  },

  'addCusorOnSelect' : function (x, y, z) {

    if(this.cursorSel == null) {
      this.cursorSel = new THREE.Object3D();

      //-- Ring around the system
      var geometryL = new THREE.TorusGeometry( 12, 0.4, 3, 30 );

      var selection = new THREE.Mesh(geometryL, Ed3d.material.selected);
      //selection.position.set(x, y, z);
      selection.rotation.x = Math.PI / 2;

      this.cursorSel.add(selection);

      //-- Create a cone on the selection
      var geometryCone = new THREE.CylinderGeometry(0, 5, 16, 4, 1, false);
      var cone = new THREE.Mesh(geometryCone, Ed3d.material.selected);
      cone.position.set(0, 20, 0);
      cone.rotation.x = Math.PI;
      this.cursorSel.add(cone);

      //-- Inner cone
      var geometryConeInner = new THREE.CylinderGeometry(0, 4, 16, 4, 1, false);
      var coneInner = new THREE.Mesh(geometryConeInner, Ed3d.material.black);
      coneInner.position.set(0, 20.1, 0);
      coneInner.rotation.x = Math.PI;
      this.cursorSel.add(coneInner);



      scene.add(this.cursorSel);
    }

    this.cursorSel.position.set(x, y, z);
    this.cursorSel.scale.set(1, 1, 1);

  },

  'moveGridTo' : function (obj) {
    var posX = Math.floor(obj.position.x/1000)*1000;
    var posY = Math.floor(obj.position.y);
    var posZ = Math.floor(obj.position.z/1000)*1000;
    Ed3d.grid1H.obj.position.set(posX, posY, posZ);
    Ed3d.grid1K.obj.position.set(posX, posY, posZ);

  }



}