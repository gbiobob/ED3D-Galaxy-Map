# ED3D-Galaxy-Map
ED3D-Galaxy-Map is a 3D galactic map (web app) for the game Elite: Dangerous.
Work with JSon file to embed stelar systems data.

View [demo sample](http://ed-board.net/testmap3/)

## Requirement
Require JQuery & Three.js

## Options
**container:** The container ID. *(Required)*

**jsonPath:** The JSon containing systems data. *(Required)*

**basePath:** Custom base path

**withHudPanel:** Enable the HUD (panel to filter and navigate throughout systems).
*Default: false*

## Exemple
```
<!-- My container -->
<div id="edmap"></div>
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<!-- Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.min.js"></script>
<!-- Launch ED3Dmap -->
<script src="js/ed3dmap.js"></script>
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
