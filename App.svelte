<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />

<script>
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations.js';
  import { allcontours } from './allcontours.js'
  import Scrubber from './Scrubber.svelte' 
  import Thermometer from './Thermometer.svelte';
  import AQILegend from './AQILegend.svelte';
  import moment from 'moment';

  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const FRAME_RATE = 20; // wait ms before changing frames

  let map;
  let nFrames = 431; // total number of frames in animation
  let currentFrame = 1;
  let animationPaused = true;
  let currentTemp = -40;

  let dateStrings = new Array(nFrames+1);
  let temps = new Array(nFrames+1);

  let startDate = moment('2019-01-10');
  let temp = currentTemp;
  
  // DUMMY DATA
  for (let i = 1; i <= nFrames; i++) {
    var dateString = startDate.format("YYYY[\, Week of ]MMMM[ ]Do");  
    if (i%7 ==0) {
      startDate = startDate.add(7, 'days');
      dateString = startDate.format("YYYY[\, Week of ]MMMM[ ]Do"); 
    }
    dateStrings[i] = dateString;

    if (i >= 40 && i <= 80) {
      temp--;
    } else if (i > 150 && i < 200) {
      temp-=0.5
    } else if (i > 250 && i < 300){
      temp--;
    } else {
      temp += 1
    }
    temps[i] = Math.round(temp);
  }

  // END DUMMY DATA

  let currentDate = dateStrings[currentFrame];

  let incrementFrame = function() {
    if (animationPaused) return;
    if (currentFrame+1 >= nFrames) {
      currentFrame = 1;
    } else {
      currentFrame++;
    }
    setMapFrame(currentFrame); 
    currentDate = dateStrings[currentFrame];
    currentTemp = temps[currentFrame];
  }

  const pauseAnimation = () => {
    animationPaused = true;
  }

  const startAnimation = () => {
    animationPaused = false;
  }

  const updateCurrentFrame = (frame) => {
    currentFrame = frame;
    setMapFrame(frame);
    
  }

  const setMapFrame = (frame) => {
    //map && map.setFilter('ap_contours', ['==', 'idx', ""+frame]); // frame id is a string
  }

  let max_color = '#87e32b'; //green
  let secondary_color = '#5f0a8a'; //purple
  let tertiatry_color = '#f0004c'; //red
  let yellow = '#ebc505'; //red
  let blue_color = '#027ef2';


  // After the DOM has been rendered set up the mapbox. (Won't work before map html is available.)
	onMount(async () => {
		map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: UB_COORDINATES, // starting position
        zoom: 11 // starting zoom
      });
    
    
    map.on('load', function() { // what to do when the map is first loaded on the page
      addInterpolationLayer();
    });

    var intervalTimer = setInterval(incrementFrame, FRAME_RATE);
  });

  const addInterpolationLayer = () => {
    map.addSource('ap_contours', {
        type: 'vector',
        url: 'mapbox://hayleystarr.bahryplq'
      });

      map.addLayer({
        "id": "ap_contours",
        "type": "fill",
        "source": "ap_contours",
        "source-layer": "apcontours",
        "filter": ["==", "idx", 1], // frameID is a string
        'layout': {
            "visibility": "visible"
        },
        paint: {
          'fill-opacity': 0.7,
          'fill-color': {
            property: 'value',
            stops: [
              [0, blue_color],
              [25, blue_color],
              [50, yellow],
              [150, tertiatry_color],
              [200, tertiatry_color],
              [250, tertiatry_color],
              [300, tertiatry_color],
              [325, secondary_color],
              [350, max_color],
              [400, '#0a8a0e'],
            ]
          }
        }
      });
  }


</script>


<div class='ub-ap-viz'>
  <div class='header'>
    <div class='title'>
    <h1>Visualzing Air Pollution and Policy in Ulaanbaatar</h1>
    </div>
  </div>
  <div class='visualizations'>
    <div id='map' class='map'>
      <div class='map-thermometer-container'>
        <div class='map-current-date'>{currentDate}</div>
        <Thermometer temp={currentTemp}/>
      </div>
      <div class='map-aqi-legend'>
        <AQILegend/>
      </div>
      
    </div>
    <div class='map-legend'>
    </div>
  </div>
  <Scrubber 
      currentFrame={currentFrame}
      pauseAnimation={pauseAnimation} 
      startAnimation={startAnimation} 
      updateCurrentFrame={updateCurrentFrame}/>
</div>

<style>

.ub-ap-viz {
  /*border: 4px solid aquamarine;*/
}



/* HEADER STYLES */

.header {
  display: flex;
  flex-direction: column;
  /* border: 2px solid red; */
}

.header .title {
  /* border: 1px solid pink; */
}


/* VISUALIZATION STYLES */

.visualizations {
  display: flex;
  height: 500px;
}

.visualizations .map {
  width: 70%;
  height: 100%;
  flex-grow: 3;

  /* border: 1px solid orangered; */
}

.map-thermometer-container {
  width: 750px;
  height: 100px;
  position: absolute;
  z-index: 100;
  top: 15px;
  left: 15px;
}

.map-current-date {
    width: max-content;
    font-size: 20px;
    font-weight: bold;
    padding: 4px;
    margin-bottom: 20px;
}

.map-aqi-legend {
  width: 50px;
  height: 100px;
  position: absolute;
  z-index: 100;
  top: 15px;
  left: 89vw;
}
</style>