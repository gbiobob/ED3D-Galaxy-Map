
var Grid = {

  'obj' : null,
  'size' : null,

  'textShapes' : null,
  'textGeo'    : null,

  'coordTxt'   : null,

  'minDistView' : null,

  /**
   * Create 2 base grid scaled on Elite: Dangerous grid
   */

  'init' : function(size, color, minDistView) {

    this.size = size;

    this.obj = new THREE.GridHelper(1000000, size);
    this.obj.setColors(color, color);
    this.obj.minDistView = minDistView;

    scene.add(this.obj);

    this.obj.customUpdateCallback = this.addCoords;

    return this;
  },

  'addCoords' : function() {

    var textShow = '0 : 0 : 0';
    var options = {
        'font': 'helvetiker',
        'weight': 'normal',
        'style': 'normal',
        'size': this.size/20,
        'curveSegments': 10
      };

    if(this.coordGrid != null) {

      if(
        Math.abs(camera.position.y-this.obj.position.y)>this.size*10
        || Math.abs(camera.position.y-this.obj.position.y) < this.obj.minDistView
      ) {
        this.coordGrid.visible = false;
        return;
      }
      this.coordGrid.visible = true;

      var posX = Math.ceil(controls.target.x/this.size)*this.size;
      var posZ = Math.ceil(controls.target.z/this.size)*this.size;

      var textCoords = posX+' : '+this.obj.position.y+' : '+(-posZ);

      //-- If same coords as previously, return.
      if(this.coordTxt == textCoords) return;
      this.coordTxt = textCoords;

      //-- Generate a new text shape

      this.textShapes = THREE.FontUtils.generateShapes( this.coordTxt, options );
      this.textGeo.dispose();
      this.textGeo = new THREE.ShapeGeometry(this.textShapes);

      var center = this.textGeo.center();
      this.coordGrid.position.set(center.x+posX-(this.size/100), this.obj.position.y, center.z+posZ+(this.size/30));


      this.coordGrid.geometry = this.textGeo;
      this.coordGrid.geometry.needsUpdate = true;

    } else {

      this.textShapes = THREE.FontUtils.generateShapes(textShow, options);
      this.textGeo = new THREE.ShapeGeometry(this.textShapes);
      this.coordGrid = new THREE.Mesh(this.textGeo, Ed3d.material.darkblue);
      this.coordGrid.position.set(this.obj.position.x, this.obj.position.y, this.obj.position.z);
      this.coordGrid.rotation.x = -Math.PI / 2;

      scene.add(this.coordGrid);

    }

  }


}

