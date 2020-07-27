<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">

<script>
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations_geojson.js';
  import Scrubber from './Scrubber.svelte' 
  import AQILegend from './AQILegend.svelte';
  import AnimationDate from './AnimationDate.svelte';
  import moment from 'moment';
  import { frameData } from './frameData.js';


  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const FRAME_CHECKING_RATE = 33; // check every x ms what the current time is in the video

  let map;

  let currentTime = 0;
  let currentFrame = 0;

//---------- Translate current time in video to the number of the current frame ----

  let maxTime = 0; // will reset when video loads
  let maxFrame = frameData.length-1; 
  let timeToFrameMultiplier = 0;
  $: timeToFrameMultiplier = maxTime > 0 ? maxFrame / maxTime : 0;
  $: currentFrame = Math.round(timeToFrameMultiplier * currentTime);


//----------- Logic for playing and pausing the animation -------------------------
  let animationPaused = true;
  let isAnimationEnded = false;

  const pauseAnimation = () => {
    animationPaused = true;
    map.getSource('ap_video').pause();
  }

  const startAnimation = () => {
    animationPaused = false;
    isAnimationEnded = false;
    map.getSource('ap_video').play();
  }

  // set the currentTime to what the video is showing so that the dependent components stay up to date
  const reportCurrentTime = (updateWhilePaused) => {
    if (!animationPaused | updateWhilePaused) {
      currentTime = map && map.getSource('ap_video') && map.getSource('ap_video').video.currentTime;
      if (currentTime >= maxTime) {
        isAnimationEnded = true;
      }
    }
  }

  const updateCurrentTime = (time) => {
    if (map && map.getSource('ap_video')) {
      map.getSource('ap_video').seek(time);
      reportCurrentTime(true);
    }
  }


  let green_color = '#87e32b'; //green
  let red_color = '#f0004c'; //red
  let yellow_color = '#ebc505'; 
  let blue_color = '#027ef2';
  let white_color = '#ffffff';
  let orange_color = '#fc9d03';
  let purple_color = '#5e03fc';
  let dark_purple_color = '#4b1f7a';
  let black_color = '#050505';

//------ Setting up Mapbox layers ---------------------------------

  // After the DOM has been rendered set up the mapbox. (Won't work before map html is available.)
	onMount(async () => {
		map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        // style: 'mapbox://styles/mapbox/satellite-v9',
        center: UB_COORDINATES, // starting position
        zoom: 11 // starting zoom
      });
    
    
    map.on('load', function() { // what to do when the map is first loaded on the page
      addVideoLayer();
      addUncertaintyMaskLayer();
      addStationLayer();

      //cannot access the video right away due to some mapbox strangeness
      const waiting = () => {
        if (!map.isStyleLoaded()) {
          setTimeout(waiting, 200);
        } else {
          map.getSource('ap_video').pause();
          let videoSource = map.getSource('ap_video');
          videoSource.video.loop = false;
          maxTime = videoSource.video.duration;
          var intervalTimer = setInterval(reportCurrentTime, FRAME_CHECKING_RATE);
        }
      };
      waiting();
        
    });
  });

  const addVideoLayer = () => {
    map.addSource('ap_video', {
       "type": "video",
       "urls": [
        "videos/pm25_over_ub.mp4",
       ],
      "coordinates": [ // these must be exactly the extent of the raster frames in R!!
          [106.6907, 48.03644],
          [107.1107, 48.03644],
          [107.1107, 47.82644],
          [106.6907, 47.82644]
      ]
    });

    map.addLayer({
      id: 'ap_video',
      type: 'raster',
      source: 'ap_video',
       paint: {
          'raster-opacity': 0.3
       }
    });

    map.on("click", function() {
      map.getSource("ap_video").seek(3.0);
      map.update;
    });
  }

  const addUncertaintyMaskLayer = () => {
    map.addSource('ap_uncertainty', {
          "type": "image",
          "url": "imgs/uncertainty_mask_img.png",
          "coordinates": [ // these must be exactly the extent of the raster frames in R!!
              [106.6907, 48.03644],
              [107.1107, 48.03644],
              [107.1107, 47.82644],
              [106.6907, 47.82644]
          ]
        });

        map.addLayer({
          id: 'ap_uncertainty',
          type: 'raster',
          source: 'ap_uncertainty'
        });
  }


  const addStationLayer = () => {
    stations.features.forEach(station => {
      const lon = station.geometry.coordinates[0];
      const lat = station.geometry.coordinates[1];
      const el = document.createElement('div');

      // this is a hack! have to update the style in AQILegend for the aqi-station-marker if you change this
      el.className = 'station-marker';
      el.style.height = '7px';
      el.style.width = '7px';
      el.style.backgroundColor = 'black';
      el.style.borderRadius= '3.5px';
      const stationMarker = new mapboxgl.Marker(el)
                  .setLngLat([lon, lat])
                  .addTo(map);
    });            
  }

  const setBaseLayer = () => {
    map.setStyle('mapbox://styles/mapbox/satellite-v9');
  }

</script>


<div class='ub-ap-viz'>

  <div class='header'>
    <div class='title'>
      <h1>Visualzing Air Pollution and Policy in Ulaanbaatar</h1>
    </div>
  </div>

  <div class='visualization'>

    <div class='map-container'>
      <div class='map' id='map'>
        <div class='map-animation-date-container'>
            <AnimationDate
              currentFrame={currentFrame} 
              frameData={frameData} 
            />          
        </div>
      </div>

      <div class='map-scrubber-container'>
          <Scrubber 
              currentTime={currentTime}
              maxTime={maxTime}
              isAnimationEnded={isAnimationEnded}
              pauseAnimation={pauseAnimation} 
              startAnimation={startAnimation} 
              updateCurrentTime={updateCurrentTime}
              frameData={frameData}
          />
      </div>

    </div>
   

    <div class='map-aqi-legend'>
      <AQILegend  
        currentFrame={currentFrame} 
        frameData={frameData} 
      />
    </div>
  </div>

</div>
<div class='station-marker'></div>

<style>

.ub-ap-viz {
  font-family: 'Open Sans', sans-serif;
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

.visualization {
  display: flex;
  flex-direction: row; /* in desktop */
  height: 600px;
  background-color: #2B2D42;
  color: white;
  border-radius: 10px;
  padding: 20px;
} 

.visualization .map-container {
  width: 80%; /* in desktop */
  height: 605px;
  /* border: 1px solid orangered; */
  display: flex;
  flex-direction: column;
}

.map-container .map {
  /* border: 2px solid red; */
  height: 490px; /*desktop*/
}

.map-scrubber-container {
    
}

.map-container .map .map-animation-date-container {
    position: absolute; 
    left: 0; 
    right: 0; 
    bottom: 0;
    margin-left: auto; 
    margin-right: auto; 
    width: 200px;
    z-index: 100;
    
    font-size: 20px;
    font-weight: bold;
    padding: 4px;
    margin-bottom: 20px;


}

.visualization .map-aqi-legend {
  width: 20%; /* in desktop */
  height: 100%;
}
</style>