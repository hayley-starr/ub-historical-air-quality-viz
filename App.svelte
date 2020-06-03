<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />

<script>
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations.js';
  import { allcontours } from './allcontours.js'
  import Scrubber from './Scrubber.svelte' 
   import Thermometer from './Thermometer.svelte';

  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const FRAME_RATE = 30; // wait ms before changing frames

  let map;
  let nFrames = 431; // total number of frames in animation
  let currentFrame = 1;
  let animationPaused = true;
  let temp = -40;

  let currentDate = 'June 2019';

  let incrementFrame = function() {
    if (animationPaused) return;
    if (currentFrame+1 >= nFrames) {
      currentFrame = 1;
    } else {
      currentFrame++;
    }
    setMapFrame(currentFrame);  

    if (currentFrame >= 40 && currentFrame <= 80) {
      temp--;
    } else if (currentFrame > 150 && currentFrame < 200) {
      temp-=0.3
    } else {
      temp += 0.5
    }
    temp = Math.round(temp);
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
    map && map.setFilter('ap_contours', ['==', 'idx', ""+frame]); // frame id is a string
  }


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
        url: 'mapbox://hayleystarr.05bkeyzu'
      });

      map.addLayer({
        "id": "ap_contours",
        "type": "fill",
        "source": "ap_contours",
        "source-layer": "apcontours",
        "filter": ["==", "idx", "1"], // frameID is a string :(
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
        ]}
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
        <Thermometer temp={temp}/>
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
  width: 50px;
  height: 100px;
  position: absolute;
  z-index: 100;
  top: 15px;
  left: 15px;
}

.map-current-date {
    width: max-content;
    font-size: 14px;
    font-weight: bold;
    padding: 4px;
}
</style>