<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">

<script>
  import { onMount } from 'svelte';
  import mapboxgl from './mapbox-gl/mapbox-gl'; // USING LOCAL PATCHED COPY
  import { stations } from './stations_geojson.js';
  import Scrubber from './Scrubber.svelte' 
  import AQILegend from './AQILegend.svelte';
  import EventInfoContainer from './EventInfoContainer.svelte';
  import moment from 'moment';
  import { frameData, frameDataMonthIndices } from './frameData.js';
  import { policyEvents } from './policyEvents.js';
  import getUnicodeFlagIcon from 'country-flag-icons/unicode';
  import { Translator } from './translator';
  import _ from 'lodash';


  let appState = {
    currEventId: undefined,
    isUserRunning: false
  };

  const updateAppState = (updatedState) => {
    appState = _.extend({}, appState, updatedState);
  }

//---------- Control langauge of the page ----------------------
  let translator = new Translator();
  let currLang = 'US'; // 'MN'
  let oppLang = 'MN'; // 'MN'

  const handleUpdateLanguage = () => {
    oppLang = currLang;
    currLang = currLang === 'US' ? 'MN' : 'US';
  }

//---------------------------------------------------------------

  
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
  let visualizationStarted = false; // first time only

  const pauseAnimation = () => {
    animationPaused = true;
    map.getSource('ap_video').pause();
  }

  const startAnimation = () => {
    animationPaused = false;
    isAnimationEnded = false;
    visualizationStarted = true;
    map.getSource('ap_video').play();
  }

  const startVisualization = () => {
    startAnimation();
    updateAppState({isUserRunning: true});
    visualizationStarted = true;
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

  const changePlaybackRate = (playRate) => {
    map.getSource('ap_video').video.playbackRate = playRate;
  }

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

<!--HTML-->
<div class='ub-ap-viz'>

  <div class='header'>
    <div class='title-container'>
      <div class='title'>{translator.translate('title', currLang)}</div>
        <button class='btn translate-button' on:click={handleUpdateLanguage}>
          {getUnicodeFlagIcon(oppLang)}
        </button>
    </div>
    <div class='introduction'>{translator.translate('introduction', currLang)}</div>
  </div>

  <div class='visualization'>

    <div class='map-container'>

      <div class='map' id='map'>
       {#if !visualizationStarted}
        <div class='map-play-button-overlay'>
          <button class='btn map-play-button' on:click={startVisualization}>
                  <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 113.57 127.1">
                      <defs>
                          <style>
                          .cls-play-1 {
                              stroke: #000;
                              fill: #000;
                              stroke-miterlimit: 10;
                          }
                          </style>
                      </defs>
                      <g id="Layer_2" data-name="Layer 2">
                          <g id="Layer_1-2" data-name="Layer 1-2">
                          <path class="cls-play-1" d="M106.78,74.45,19.36,124.92A12.57,12.57,0,0,1,.5,114V13.09A12.57,12.57,0,0,1,19.36,2.2l87.42,50.48a12.57,12.57,0,0,1,0,21.77Z" transform="translate(0 -0.01)"/>
                          </g>
                      </g>
                  </svg>
              </button>
        </div>
        {/if}
        <div class='map-animation-date-container'>
             <span class='animation-date'>
                {translator.translate('seven_day_avg_on', currLang) + ': ' + translator.translateDate(frameData[currentFrame].date, currLang)}
            </span>        
        </div>
        <div class='map-event-container'>
            <EventInfoContainer 
                policyEvents={policyEvents}
                appState={appState}
                updateAppState={updateAppState}
                startAnimation={startAnimation}
                translator={translator}
                currLang={currLang}
            />         
        </div>
      </div>

      <div class='map-scrubber-container'>
          <Scrubber 
              updateAppState={updateAppState}
              appState={appState}
              currentTime={currentTime}
              maxTime={maxTime}
              isAnimationEnded={isAnimationEnded}
              pauseAnimation={pauseAnimation} 
              startAnimation={startAnimation} 
              updateCurrentTime={updateCurrentTime}
              frameData={frameData}
              frameDataMonthIndices={frameDataMonthIndices}
              changePlaybackRate={changePlaybackRate}
              policyEvents={policyEvents}
              translator={translator}
              currLang={currLang}
          />
      </div>

    </div>
   

    <div class='map-aqi-legend'>
      <AQILegend  
        currentFrame={currentFrame} 
        frameData={frameData} 
        translator={translator}
        currLang={currLang}
      />
    </div>
  </div>

</div>
<div class='station-marker'></div>

<style>

.ub-ap-viz {
  font-family: 'Open Sans', sans-serif;
  color: #2B2D42;
}

.btn {
    cursor: pointer
}

.btn:focus {
    outline: none;
}

.btn:hover {
    outline: none;
    transform: scale(1.1);
}

.btn:active {
    outline: none;
    transform: scale(1.1);
}

/* HEADER STYLES */

.header {
  display: flex;
  flex-direction: column;
  /* border: 2px solid red; */
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* background: #2B2D42;
  color: white; */
  height: 100px;
  padding: 0 10px;
  border-radius: 10px;
}

.title {
  font-size: 20px;
}

.translate-button {
  width: 50px;
  height: 40px;
  font-size: 30px;
  color: white;
  border: none;
  border-radius: 15px;
}

.introduction {
  padding: 5px;
  font-size: 12px;
}


/* VISUALIZATION STYLES */

.visualization {
  display: flex;
  flex-direction: row; /* in desktop */
  height: 600px;
  background-color: #2B2D42;
  color: white;
  border-radius: 10px;
  padding: 20px 20px 10px 20px;
} 

.visualization .map-container {
  width: 80%; /* in desktop */
  height: 100%;
  /* border: 1px solid orangered; */
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-container .map {
  height: 490px; /*desktop*/
}

.map-play-button-overlay {
  position: absolute;
  background-color: white;
  opacity: 0.2;
  height: 400px;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-play-button {
    height: 100px;
    width: 100px;
    border: none;
    cursor: pointer;
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
    max-width: 300px;
    z-index: 100;
    
    font-size: 15px;
    padding: 4px;
    margin-bottom: 20px;
    background: white;
    opacity: .85;
    border-radius: 4px;
    text-align: center;
    font-weight: 300;
    color: #2B2D42;
}

.map-event-container {
  position: absolute; 
  left: 5px; 
  top: 5px;
  z-index: 100;
}

.visualization .map-aqi-legend {
  width: 20%; /* in desktop */
  height: 100%;
}
</style>