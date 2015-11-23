# ED3D-Galaxy-Map
ED3D-Galaxy-Map is a 3D galactic map (web app) for the game Elite: Dangerous.
Work with JSon file to embed stelar systems data.

View [demo sample](http://en.ed-board.net/3Dgalnet/)

## Features
* JSON file to fill the map.
* Manage click event to display information related to a system (if detailed infos, need to be in the JSON file).
* Display a global view of the galaxy that reproduces the ingame galaxy - Generated from a volumetric particle cloud from an ingame screenshot (a kind of heightmap).
* HUD with customizable categories to filter the map. [Optional]
* CSS+HTML HUD to fit to any style.
* Systems colorizations using color attribute that can be set on each category and soon use color from ingame stellar type (if stellar type defined in JSon file for each system). [Optional]
* Can show exploration routes.

## Requirement
Require Three.js & JQuery

## Options
**container:** The container ID. *(Required)*

**jsonPath:** The JSon containing systems data. *(Required)*

**jsonContainer:** Optionaly set an Id of container with JSon systems data. (Can be used on small project, JSon file stay better).

**basePath:** Custom base path

**withHudPanel:** Enable the HUD (panel to filter and navigate throughout systems). *Default: false*

**hudMultipleSelect:** Enable showing multiple filters at same time *Default: true*

**effectScaleSystem:** Set an array with min & max value for system scale effect on zoom in/out *Default: [10,800]*

**startAnim:** Use initial animation (Zoom into the galaxy) *Default: true*

## Methods
**Ed3d.init({options}):** Initialize the scene

**Ed3d.rebuild():** Destroy & rebuild the scene (Hard way to refresh the scene to load new JSon data)

## Exemple
```
<!-- My container -->
<div id="edmap"></div>
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<!-- Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.min.js"></script>
<!-- Launch ED3Dmap -->
<link href="css/styles.css" rel="stylesheet" type="text/css" />
<script src="js/ed3dmap.min.js"></script>
<script type="text/javascript">
  Ed3d.init({
      container   : 'edmap',
      jsonPath    : "./map/system.json"
  });
</script>
```
## JSon sample
### Simple systems list
```
[
  {
    "name": "Sol",
    "coords": {
      "x": 0,
      "y": 0,
      "z": 0
    }
  },
  {
    "name": "Solati",
    "coords": {
      "x": 66.53125,
      "y": 29.1875,
      "z": 34.6875
    }
  }
]
```
