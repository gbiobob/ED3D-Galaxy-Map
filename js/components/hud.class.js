
var HUD = {

  'container' : null,

  /**
   *
   */
  'create' : function(container) {
    this.container = container;

    $('#'+this.container).append('<div id="hud"></div>');
    $('#hud').append(
      '<div>'+
      '    <h2>Infos</h2>'+
      '     Dist. Sol <span id="distsol"></span>'+
      '    <div id="coords">'+
      '      <span id="cx"></span><span id="cy"></span><span id="cz"></span></div>'+
      '      <p id="infos"></p>'+
      '    </div>'+
      '  <div id="search">'+
      '    <h2>Search</h2>'+
      '    <input type="text" />'+
      '  </div>'+
      '  <div id="filters">'+
      '  </div>'+

      '  <div id="options">'+
      '    <h2>Options</h2>'+
      '    <p>Distance obj<input id="opt_distance" type="range" value="1000" max="3000" min="500" step="500"></p>'+
      '    <p>Fog<input id="opt_fog" type="range" value="0.0001" max="0.0004" min="0.00005" step="0.00001"></p>'+
      '  </div>'+


      '</div>'
    );
    $('#'+this.container).append('<div id="systemDetails" style="display:none;"></div>');

  },


  /**
   *
   */
  'init' : function() {

    this.initHudAction();

  },

  /**
   *
   */
  'initHudAction' : function() {


    //-- Disable 3D controls when mouse hover the Hud
    $( "#hud" ).hover(
      function() {
        controls.enabled = false;
      }, function() {
        controls.enabled = true;
      }
    );

    //-- Add Count filters
    $('.map_filter').each(function(e) {
      var idCat = $(this).data('filter');
      $(this).append(' ('+Ed3d.catObjs[idCat].length+')');
    });

    //-- Add map filters
    $('.map_filter').click(function(e) {
      e.preventDefault();
      var idCat = $(this).data('filter');
      var active = $(this).data('active');
      active = (Math.abs(active-1));

      $(Ed3d.catObjs[idCat]).each(function(key, indexPoint) {

        obj = System.particleGeo.vertices[indexPoint];

        /*System.particleGeo.vertices.splice(key, 1);
        System.particleGeo.verticesNeedUpdate = true;*/
        System.particleGeo.colors[indexPoint] = (active==1)
          ? obj.color
          : new THREE.Color('#000000');

        //obj = scene.getObjectById( idObj, true );
        obj.visible = (active==1);
        obj.filtered = (active==1);

       // System.particleGeo.verticesNeedUpdate = true;
        System.particleGeo.colorsNeedUpdate = true;


        //scene.getObjectById( obj.idsprite, true ).visible = (active==1);
      });
      $(this).data('active',active);
      $(this).toggleClass('disabled');
    });


    //-- Add map link
    $('.map_link').click(function(e) {

      e.preventDefault();
      var elId = $(this).data('route');
      Action.moveToObj(routes[elId]);
    });

    $('.map_link span').click(function(e) {

      e.preventDefault();

      var elId = $(this).parent().data('route');
      routes[elId].visible = !routes[elId].visible;
    });


    $('#opt_distance').change(function(e) {
      Ed3d.optDistObj = $(this).val();
    });


    $('#opt_fog').change(function(e) {
      scene.fog.density = $(this).val();
      Ed3d.fogDensity = scene.fog.density;
    });

  },

  'initFilters' : function(categories) {

    $.each(categories, function(typeFilter, values) {

      if(typeof values === "object" ) {
        var groupId = typeFilter.toLowerCase();
        groupId.replace(" ", "-");

        $('#filters').append('<h2>'+typeFilter+'</h2>');
        $('#filters').append('<div id="'+groupId+'"></div>');

        $.each(values, function(key, val) {
          HUD.addFilter(groupId, key, val);
          Ed3d.catObjs[key] = []
        });
      }

    });


  },

  /**
   *
   */
  'addFilter' : function(groupId, idCat, val) {

    //-- Add material, if custom color defined, use it
    var back = '#fff';
    if(val.color != undefined) {
      Ed3d.addCustomMaterial(idCat, val.color);
      back = '#'+val.color;
    }

    //-- Add html link
    $('#'+groupId).append(
      '<a class="map_filter" data-active="1" data-filter="' + idCat + '">'+
      '<span class="check" style="background:'+back+'"> </span>' + val.name + '</a>'
    );
  },

  /**
   *
   */
  'openHudDetails' : function() {
    $('#hud').hide();
    $('#systemDetails').show();
  },
  /**
   *
   */
  'closeHudDetails' : function() {
    $('#hud').show();
    $('#systemDetails').hide();
  },

  /**
   * Create a Line route
   */
  'setRoute' : function(idRoute, nameR) {
    $('#routes').append('<a class="map_link" data-route="' + idRoute + '"><span class="check"> </span>' + nameR + '</a>');
  },



  /**
   *
   */

  'setInfoPanel' : function(index, point) {

    $('#systemDetails').html(
      '<h2>'+point.name+'</h2>'+
      '<div class="coords">'+
      '  <span>'+point.x+'</span><span>'+point.y+'</span><span>'+point.z+'</span></div>'+
      '  <p id="infos"></p>'+
      '</div>'+
      (point.infos != undefined ? '<div>'+point.infos+'</div>' : '')+
      '<div id="nav">'+
      '</div>'
    );

    //-- Add navigation
    $('<a/>', {'html': '<'})
    .click(function(){Action.moveNextPrev(index-1);})
    .appendTo("#nav");

    $('<a/>', {'html': 'X'})
    .click(function(){HUD.closeHudDetails();})
    .appendTo("#nav");

    $('<a/>', {'html': '>'})
    .click(function(){Action.moveNextPrev(index+1);})
    .appendTo("#nav");

  },


  /**
   * Add Shape text
   */

  'addText' : function(id, textShow, x, y, z, size, addToObj) {

    if(addToObj == undefined) addToObj = scene;

   /* if(Ed3d.textSel[id] !== undefined) {
      scene.getObjectById( Ed3d.textSel[id], true ).remove(  );

      //scene.remove( Ed3d.textSel[id] );

    }*/

    var textShapes = THREE.FontUtils.generateShapes(textShow, {
      'font': 'helvetiker',
      'weight': 'normal',
      'style': 'normal',
      'size': size,
      'curveSegments': 100
    });

    var textGeo = new THREE.ShapeGeometry(textShapes);

    if(Ed3d.textSel[id] == undefined) {
      var textMesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({
        color: 0xffffff
      }));
    } else {
      var textMesh = Ed3d.textSel[id];
    }



    textMesh.geometry = textGeo;
    textMesh.geometry.needsUpdate = true;

    textMesh.position.set(x, y, z);

    Ed3d.textSel[id] = textMesh;
    addToObj.add(textMesh);


  }

}
