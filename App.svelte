<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />

<script>
  // import { scaleLinear } from 'd3-scale'
  // import {csvParse, autoType} from 'd3-dsv'
  // import { Graphic, PointLayer, Line, XAxis, YAxis } from '@snlab/florence'
  // import DataContainer from '@snlab/florence-datacontainer'
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations.js';
  import { allcontours } from './allcontours.js'

  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;

  let map;


  // After the DOM has been rendered set up the mapbox. (Won't work before map html is available.)
	onMount(async () => {
		map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: UB_COORDINATES, // starting position
        zoom: 11 // starting zoom
      });
    
    
    map.on('load', function() { // what to do when the map is first loaded on the page
      map.addSource('three_contours', {
        type: 'vector',
        url: 'mapbox://hayleystarr.80jtx7ee'
      });

      map.addLayer({
        "id": "three_contours",
        "type": "fill",
        "source": "three_contours",
        "source-layer": "allcontours",
        "filter": ["==", "idx", 0],
        'layout': {
            "visibility": "visible"
        },
        paint: {
          'fill-opacity': 0.2,
          'fill-color': [
            "step",
            ["get", "value"],
            "hsl(0, 0%, 100%)", 8,
            "hsl(202, 88%, 51%)", 18,
            "hsl(194, 88%, 51%)", 36,
            "hsl(185, 88%, 51%)", 54,
            "hsl(177, 96%, 53%)", 72,
            "hsl(157, 96%, 53%)", 90,
            "hsl(101, 94%, 65%)", 108,
            "hsl(60, 100%, 49%)", 126,
            "hsl(43, 100%, 49%)", 144,
            "hsl(26, 100%, 49%)", 162,
            "hsl(10, 100%, 49%)", 180,
            "hsl(0, 64%, 43%)", 198,
            "hsl(326, 47%, 29%)", 216,
            "hsl(274, 47%, 29%)", 234,
            "hsl(246, 56%, 35%)"
        ]
        }
      });
    });

  });


</script>


<div class='ub-ap-viz'>
  <div class='header'>
    <div class='title'>
    <span>Visualzing Air Pollution in Ulaanbaatar</span>
    </div>
  </div>
  <div class='visualizations'>
    <div id='map' class='map'></div>
    <div class='map-legend'>
    </div>
  </div>

</div>

<style>

.ub-ap-viz {
  border: 4px solid aquamarine;
}



/* HEADER STYLES */

.header {
  display: flex;
  flex-direction: column;
  border: 2px solid red;
}

.header .title {
  border: 1px solid pink;
}


/* VISUALIZATION STYLES */

.visualizations {
  display: flex;
  height: 600px;
}

.visualizations .map {
  width: 70%;
  height: 100%;
  flex-grow: 3;

  border: 1px solid orangered;
}

</style>