<link href='https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css' rel='stylesheet' />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Antic+Slab&family=Merriweather:wght@300&display=swap" rel="stylesheet">

<script>
  import { onMount } from 'svelte';
  import mapboxgl from './mapbox-gl/mapbox-gl'; // USING LOCAL PATCHED COPY
  import { stations } from './stations_geojson.js';
  import Scrubber from './Scrubber.svelte' 
  import AQILegend from './AQILegend.svelte';
  import EventInfoContainer from './EventInfoContainer.svelte';
  import ExtraInformationSection from './ExtraInformationSection.svelte';
  import moment from 'moment';
  import { frameData, frameDataMonthIndices } from './frameData.js';
  import { policyEvents } from './policyEvents.js';
  import getUnicodeFlagIcon from 'country-flag-icons/unicode';
  import { Translator } from './translator';
  import _ from 'lodash';
  import { classnames } from './classnames';
  import Icon from 'fa-svelte'
  import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle';


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

  const handleClickMap = () => {
    if (!animationPaused) {
      pauseAnimation();
      updateAppState({isUserRunning: false});
    } else {
      startAnimation();
      updateAppState({isUserRunning: true});
    }
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

//------ Open pm25 description box --------------------------------

let pm25InfoOpen = false;

const handleOpenPM25 = () => {
  pm25InfoOpen = !pm25InfoOpen;
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

          map.on('click', function() {
            handleClickMap();
          });
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

  <div class='section header'>
    <div class='title-container'>
      <div class='title-date-container'>
         <div class='title'>
          {translator.translate('title', currLang)}
        </div>
        <div class='title-date'>
          {translator.translateDate('2020-08-14', currLang)}
        </div>
      </div>
     
     <div class='translate-buttons'>
      <button class={classnames('btn','translate-button',  currLang == 'MN' ? 'translate-selected' : '')} on:click={handleUpdateLanguage}>
        {getUnicodeFlagIcon('MN')}
      </button>
      <button class={classnames('btn','translate-button', currLang == 'US' ? 'translate-selected' : '')} on:click={handleUpdateLanguage}>
        {getUnicodeFlagIcon('US')}
      </button>
     </div>
      
    </div>

    <div class='introduction'>{translator.translate('introduction', currLang)}</div>
    <div class='what-is-pm25' on:click={handleOpenPM25}>
        {#if pm25InfoOpen}
          <span class='pm-25-is'>{translator.translate('pm_25_is', currLang)}</span>
        {:else}
          <Icon icon={faQuestionCircle}></Icon>
          <span class='what-is-pm25-question'>{translator.translate('what_is_pm25', currLang)}</span>
        {/if}
      </div>
  </div>

  <div class='section visualization'>

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


  <div class='section footer'>
    <ExtraInformationSection  
        translator={translator}
        currLang={currLang}
      />
  </div>

</div>

<style>

.ub-ap-viz {
  font-family: 'Open Sans', sans-serif;
  letter-spacing: -0.05px;
  color: #2B2D42;
  min-width: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
}

.section {
  width: 90%;
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
  width: 90%;
  padding: 20px 0;
}

.title-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px
}

.title-date-container {
  display: flex;
  flex-direction: column;
}

.title-date {
  font-size: 15px;
  font-weight: lighter;
}

.title {
  font-size: 30px;
}

.translate-buttons {
  display: flex;
  opacity: 0.8;
  margin-top: 20px;
}

.translate-button:first-child {
  margin-right: 3px;
}

.translate-button {
  height: 30px;
  font-size: 30px;
  color: white;
  border: none;
  border-radius: 4px;
  background-color: ghostwhite;
  display: flex;
  align-items: center;
}

.translate-selected {
  background-color: lightgrey;
}

.introduction {
    font-size: 14px;
    line-height: 22px;
}

.what-is-pm25 {
  font-size: 12px;
  cursor: pointer;
  color: steelblue;
  margin-top: 10px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
}

.what-is-pm25-question {
  margin-left: 5px;
}

.pm-25-is {
  text-transform: none;
  /* color: #2B2D42; */
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
  height: 100%;
}
</style>