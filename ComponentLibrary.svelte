<script>
  import Scrubber from './Scrubber.svelte'; 
  import EventInfoBox from './EventInfoBox.svelte';
  import Thermometer from './Thermometer.svelte';
  import AQILegend from './AQILegend.svelte';
  import { frameData } from './frameData';


  const FRAME_CHECKING_RATE = 33; // check every x ms what the current time is in the video
  const FRAME_STEP_SECONDS = .001 * FRAME_CHECKING_RATE; // advance x seconds at each check;

  let maxTime = 4.0;
  let currTime = 0;
  let animationPaused = true;
  let isAnimationEnded = false;
  let temp = -40;
  let currentFrame = 0;

  const pauseAnimation = () => {
    animationPaused = true;
  }

  const startAnimation = () => {
    animationPaused = false;
  }

  const updateCurrentTime = (time) => {
    currTime = time;
    reportCurrentTime(true);
  }

  // mock out the fetching of the time from the video by stepping the time manually
  const reportCurrentTime = (updateWhilePaused) => {
    if (!animationPaused) {
      if (currTime >= maxTime) {
        currTime = 0;
        isAnimationEnded = true;
        animationPaused = true;
      } else {
         currTime = currTime + FRAME_STEP_SECONDS; // frame rate
         isAnimationEnded = false;
      }
    }
  }

  var intervalTimer = setInterval(reportCurrentTime, FRAME_CHECKING_RATE);


    // EventInfoBox
    let eventDetails = {
        date: 'June 20th 2019',
        title: 'Government Bans Raw Coal',
        text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.',
        source: 'https://breathemongolia.org/',
        imgSource: './banRawCoal.jpg'
    }
</script>

<div class='component-library'>
    <h1>Component Library</h1>
    <div class='components'>
         <!-- AQI Legend -->
         <div class='component'>
            <h2>AQI Legend</h2>
            <AQILegend frameData={frameData} currentFrame={currentFrame} />
         </div>


          <!-- Thermometer -->
         <div class='component thermometer'>
            <h2>Thermometer</h2>
            <Thermometer 
              currentFrame={currentFrame}  
              frameData={frameData}
            />
         </div>
        


        <!-- Scrubber -->
        <div class='component scrubber'>
          <h2>Scrubber</h2>
          <span> current time: {currTime}</span>
           <Scrubber 
              currentTime={currTime}
              maxTime={maxTime}
              pauseAnimation={pauseAnimation} 
              startAnimation={startAnimation} 
              updateCurrentTime={updateCurrentTime}
              frameData={frameData}
          />
        </div>


        <!-- Event Info Box -->
        <div class='component policy-event-info-box'>
          <h2>Policy Event Info Box</h2>
          <EventInfoBox classname={'event-info'} eventDetails={eventDetails}/>
        </div>
        
    </div>


</div>

<style>

.component {
  margin-bottom: 80px;
  padding-bottom: 80px;
  border-bottom: 1px solid blue;
}

</style>