
var Action = {

  'cursorSel' : null,
  'mouseVector' : null,
  'raycaster' : null,
  'oldSel' : null,
  'objHover' : null,

  /**
   * Create a Line route
   */
  'init' : function() {

    this.mouseVector = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();

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
    //this.raycaster = new THREE.Raycaster(camera.position, this.mouseVector.sub(camera.position).normalize());

    this.raycaster.setFromCamera( this.mouseVector, camera );

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this.raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      for( var i = 0; i < intersects.length; i++ ) {
        var intersection = intersects[ i ];
        if(intersection.object.geometry.type != 'SphereGeometry') {

          $('#hud #infos').html("Intersected object: " + intersection.object.name);
          Action.hoverOnObj(intersection.object);
        }
      }


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
    this.raycaster = new THREE.Raycaster(camera.position, this.mouseVector.sub(camera.position).normalize());
    this.raycaster.params.Points.threshold = 5;

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = this.raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {

      for( var i = 0; i < intersects.length; i++ ) {
        var intersection = intersects[ i ];
        if(intersection.object.clickable) {

          var indexPoint = intersection.index;
          var selPoint = intersection.object.geometry.vertices[indexPoint];

          console.log(intersection);
          $('#hud #infos').html(
           // "<h2>"+intersection.object.name+"</h2>"
            "<h2>"+selPoint.name+"</h2>"
          );
          Action.moveToObj(selPoint);
        }
      }



    }

  },




  'moveToObj' : function (obj) {

    var goX = obj.x;
    var goY = obj.y;
    var goZ = obj.z;

    //-- If in far view reset to classic view
    disableFarView(25, false);
    //controls.update();
    //render();

    //-- Move camera to target
    //-- Smooth move

    var moveFrom = {
      x: camera.position.x, y: camera.position.y , z: camera.position.z,
      mx: controls.center.x, my: controls.center.y , mz: controls.center.z
    };
    var moveCoords = {
      x: goX, y: goY + 100, z: goZ + 100,
      mx: goX, my: goY , mz: goZ
    };

    controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(moveFrom).to(moveCoords, 800)
      .start()
      .onUpdate(function () {
        camera.position.set(moveFrom.x, moveFrom.y, moveFrom.z);
        controls.center.set(moveFrom.mx, moveFrom.my, moveFrom.mz);
      })
      .onComplete(function () {
        controls.enabled = true;
        controls.update();
      });

    //-- 3D Cursor on selected object

    if (this.oldSel !== null) this.oldSel.material = Ed3d.material.white;

    obj.material = Ed3d.material.selected;
    this.oldSel = obj;


    this.addCusorOnSelect(goX, goY, goZ);



    //-- Add text
    var textAdd = obj.name;
    textAdd += ' - ' + Math.round(goX) + ', ' + Math.round(goY) + ', ' + Math.round(goZ);

    Ed3d.addText('system', textAdd, goX, goY, goZ, 5);


    //-- Move grid to object
    this.moveGridTo(goX, goY, goZ);
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

  'moveGridTo' : function (goX, goY, goZ) {
    var posX = Math.floor(goX/1000)*1000;
    var posY = Math.floor(goY);
    var posZ = Math.floor(goZ/1000)*1000;

    Ed3d.grid1H.obj.position.set(posX, posY, posZ);
    Ed3d.grid1K.obj.position.set(posX, posY, posZ);
    Ed3d.grid1XL.obj.position.set(posX, posY, posZ);

  }



}