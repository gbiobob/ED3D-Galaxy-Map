
var Action = {

  'cursorSel' : null,
  'mouseVector' : null,
  'raycaster' : null,
  'oldSel' : null,
  'objHover' : null,

  /**
   * Init Raycaster for events on Systems
   */

  'init' : function() {

    this.mouseVector = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();

    container.addEventListener('mousedown', this.onMouseClick, false);
    //container.addEventListener('mousemove', this.onMouseHover, false);
  },

  /**
   * Mouse Hover
   */

  'onMouseHover' : function (e) {

    e.preventDefault();

    this.mouseVector = new THREE.Vector3(
      ( ( e.clientX - position.left ) / renderer.domElement.width ) * 2 - 1,
      - ( ( e.clientY - position.top ) / renderer.domElement.height ) * 2 + 1,
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

          Action.hoverOnObj(indexPoint);
        }
      }



    } else {
      Action.outOnObj();
    }

  },

  'hoverOnObj' : function (indexPoint) {

    if(this.objHover == indexPoint) return;
    this.outOnObj();

    System.particleGeo.colors[indexPoint] = new THREE.Color('#00ff00');
    System.particleGeo.colorsNeedUpdate = true;

    this.objHover = indexPoint;

  },

  'outOnObj' : function () {

    if(this.objHover === null || System.particleGeo.vertices[this.objHover] == undefined)
      return;

    obj = System.particleGeo.vertices[this.objHover];

    System.particleGeo.colors[this.objHover] = obj.color;
    System.particleGeo.colorsNeedUpdate = true;

    this.objHover = null;

  },

  /**
   * On system click
   */

  'onMouseClick' : function (e) {

    e.preventDefault();


    var position = $('#ed3dmap').offset();

    this.mouseVector = new THREE.Vector3(
      ( ( e.clientX - position.left ) / renderer.domElement.width ) * 2 - 1,
      - ( ( e.clientY - position.top ) / renderer.domElement.height ) * 2 + 1,
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

          if(selPoint.visible) {
            $('#hud #infos').html(
              "<h2>"+selPoint.name+"</h2>"
            );

            var isMove = Action.moveToObj(indexPoint, selPoint);
            if(isMove) return;
          }

        }
      }



    }

  },

  /**
   * Move to the next visible system
   *
   * @param {int} indexPoint
   */

  'moveNextPrev' : function (indexPoint, increment) {

    var find = false;
    while(!find) {

      //-- If next|previous is undefined, loop to the first|last
      if (indexPoint < 0) indexPoint = System.particleGeo.vertices.length-1;
      else if (System.particleGeo.vertices[indexPoint] == undefined) indexPoint = 0;

      if(System.particleGeo.vertices[indexPoint].visible == true) {
        find = true;
      } else {
        indexPoint += increment
      }
    }


    //-- Move to
    var selPoint = System.particleGeo.vertices[indexPoint];
    Action.moveToObj(indexPoint, selPoint);

  },

  /**
   * Disable current selection
   */

  'disableSelection' : function () {

    this.oldSel = null;
    this.cursorSel.visible = false;

    $('#hud #infos').html('');

  },

  /**
   * Move to inital position
   */
  'moveInitalPosition' : function (timer) {

    if(timer == undefined) timer = 800;

    //-- Move camera to initial position

    var moveFrom = {
      x: camera.position.x, y: camera.position.y , z: camera.position.z,
      mx: controls.center.x, my: controls.center.y , mz: controls.center.z
    };
    var moveCoords = {
      x: 0, y: 500, z: 500,
      mx: 0, my: 0 , mz: 0
    };

    controls.enabled = false;

    Ed3d.tween = new TWEEN.Tween(moveFrom, {override:true}).to(moveCoords, timer)
      .start()
      .onUpdate(function () {
        camera.position.set(moveFrom.x, moveFrom.y, moveFrom.z);
        controls.center.set(moveFrom.mx, moveFrom.my, moveFrom.mz);
      })
      .onComplete(function () {
        controls.enabled = true;
        controls.update();
      });

  },


  /**
   * Move camera to a system
   *
   * @param {int} index - The system index
   * @param {object} obj - System datas
   */

  'moveToObj' : function (index, obj) {

    if (this.oldSel !== null && this.oldSel == index)  return false;

    HUD.setInfoPanel(index, obj);
    HUD.openHudDetails();

    this.oldSel = index;
    var goX = obj.x;
    var goY = obj.y;
    var goZ = obj.z;

    //-- If in far view reset to classic view
    disableFarView(25, false);

    //-- Move grid to object
    this.moveGridTo(goX, goY, goZ);

    //-- Move camera to target (Smooth move using Tween)

    var moveFrom = {
      x: camera.position.x, y: camera.position.y , z: camera.position.z,
      mx: controls.center.x, my: controls.center.y , mz: controls.center.z
    };
    var moveCoords = {
      x: goX, y: goY + 15, z: goZ + 15,
      mx: goX, my: goY , mz: goZ
    };

    controls.enabled = false;
    Ed3d.tween = new TWEEN.Tween(moveFrom, {override:true}).to(moveCoords, 800)
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

    obj.material = Ed3d.material.selected;

    this.addCusorOnSelect(goX, goY, goZ);

    //-- Add text
    var textAdd = obj.name;
    var textAddC = Math.round(goX) + ', ' + Math.round(goY) + ', ' + Math.round(goZ);

    HUD.addText('system',  textAdd, 8, 20, 0, 6, this.cursorSel);
    HUD.addText('coords',  textAddC, 8, 15, 0, 3, this.cursorSel);

    return true;

  },

  /**
   * Create a cusros on selected system
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */

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
      var geometryConeInner = new THREE.CylinderGeometry(0, 3.6, 16, 4, 1, false);
      var coneInner = new THREE.Mesh(geometryConeInner, Ed3d.material.black);
      coneInner.position.set(0, 20.2, 0);
      coneInner.rotation.x = Math.PI;
      this.cursorSel.add(coneInner);



      scene.add(this.cursorSel);
    }

    this.cursorSel.visible = true;
    this.cursorSel.position.set(x, y, z);
    this.cursorSel.scale.set(1, 1, 1);

  },

  /**
   * Move grid to selection
   *
   * @param {number} goX
   * @param {number} goY
   * @param {number} goZ
   */

  'moveGridTo' : function (goX, goY, goZ) {
    var posX = Math.floor(goX/1000)*1000;
    var posY = Math.floor(goY);
    var posZ = Math.floor(goZ/1000)*1000;

    Ed3d.grid1H.obj.position.set(posX, posY, posZ);
    Ed3d.grid1K.obj.position.set(posX, posY, posZ);
    Ed3d.grid1XL.obj.position.set(posX, posY, posZ);

  }



}