<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />

<script>
  //import 'customStyles.css';
  import { onMount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
  import { stations } from './stations_geojson.js';
  import Scrubber from './Scrubber.svelte' 
  import Thermometer from './Thermometer.svelte';
  import AQILegend from './AQILegend.svelte';
  import AnimationDate from './AnimationDate.svelte';
  import moment from 'moment';

  const UB_COORDINATES = [106.900354, 47.917802];
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGF5bGV5c3RhcnIiLCJhIjoiY2s5MmhvYTU3MDBkaTNwcGI3cWJtMjdkcCJ9.tOfFfs9wWWcOfQ1sDMiwvQ';
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const FRAME_CHECKING_RATE = 33; // check every x ms what the current time is in the video

  let map;

  let currentTime = 0;
  let maxTime = 0; // will reset when video loads
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


  // After the DOM has been rendered set up the mapbox. (Won't work before map html is available.)
	onMount(async () => {
		map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: UB_COORDINATES, // starting position
        zoom: 11 // starting zoom
      });
    
    
    map.on('load', function() { // what to do when the map is first loaded on the page
      addVideoLayer();
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
        "videos/testVideo.mp4",
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


  const addStationLayer = () => {
    stations.features.forEach(station => {
      const lon = station.geometry.coordinates[0];
      const lat = station.geometry.coordinates[1];
      const el = document.createElement('div');
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
        <div class='map-current-date'>
          <AnimationDate
            currentTime={currentTime}
            maxTime={maxTime}
          />
        </div>
        <Thermometer temp={0}/>
      </div>
      <div class='map-aqi-legend'>
        <AQILegend/>
      </div>
      
    </div>
    <div class='map-legend'>
    </div>
  </div>
  <Scrubber 
      currentTime={currentTime}
      maxTime={maxTime}
      isAnimationEnded={isAnimationEnded}
      pauseAnimation={pauseAnimation} 
      startAnimation={startAnimation} 
      updateCurrentTime={updateCurrentTime}
  />
</div>
<div class='station-marker'></div>

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