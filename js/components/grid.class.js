
var Grid = {

  'obj' : null,
  'size' : null,


  /**
   * Create 2 base grid scaled on Elite: Dangerous grid
   */

  'init' : function(size, color) {

    this.size = size;

    this.obj = new THREE.GridHelper(1000000, size);
    this.obj.setColors(color, color);
    scene.add(this.obj);

    this.obj.customUpdateCallback = this.addCoords;

    return this;
  },

  'init2' : function(size, color) {
    alert(this.size);
  },

  'addCoords' : function() {

    var textShow = 'TEST';
    var options = {
        'font': 'helvetiker',
        'weight': 'normal',
        'style': 'normal',
        'size': this.size/20,
        'curveSegments': 10
      };

    if(this.coordGrid != null) {

      if(Math.abs(camera.position.y-this.obj.position.y)>this.size*10) {
        this.coordGrid.visible = false;
        return;
      }
      this.coordGrid.visible = true;

      var posX = Math.ceil(controls.target.x/this.size)*this.size;
      var posZ = Math.ceil(controls.target.z/this.size)*this.size;

      this.coordGrid.position.set(posX, this.obj.position.y, posZ);

      var textCoords = posX+' : '+this.obj.position.y+' : '+posZ;
      var textShapes = THREE.FontUtils.generateShapes( textCoords, options );
      var text = new THREE.ShapeGeometry( textShapes );
      this.coordGrid.geometry = text;
      this.coordGrid.geometry.needsUpdate = true;

    } else {

      var textShapes = THREE.FontUtils.generateShapes(textShow, options);
      var text = new THREE.ShapeGeometry(textShapes);
      this.coordGrid = new THREE.Mesh(text, Ed3d.material.darkblue);
      this.coordGrid.position.set(this.obj.position.x, this.obj.position.y, this.obj.position.z);
      this.coordGrid.rotation.x = -Math.PI / 2;
      this.coordGrid.rotation.z = -Math.PI;
      scene.add(this.coordGrid);
    }

  }


}

