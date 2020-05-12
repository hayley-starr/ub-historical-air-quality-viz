<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />

<script>
  // import { scaleLinear } from 'd3-scale'
  // import {csvParse, autoType} from 'd3-dsv'
  // import { Graphic, PointLayer, Line, XAxis, YAxis } from '@snlab/florence'
  // import DataContainer from '@snlab/florence-datacontainer'
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations.js';

  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;

  let map;


  // TURF JS - https://docs.mapbox.com/help/tutorials/analysis-with-turf/#add-interactivity

  // After the DOM has been rendered set up the mapbox. (Won't work before map html is available.)
	onMount(async () => {
		map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: UB_COORDINATES, // starting position
        zoom: 11 // starting zoom
      });
    
    map.on('load', function() { // what to do when the map is first loaded on the page
      map.addLayer({ // SAMPLE! CAN USE ADD-LAYER TO ADD MORE LAYERS LATER ON USER INTERACTION
        id: 'dormitories',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: stations // USING THE SAMPLE DATA FOR NOW
        },
        layout: {
          'icon-image': 'hospital-15', // TODO: change this to something nicer
          'icon-allow-overlap': true
        },
        paint: { }
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