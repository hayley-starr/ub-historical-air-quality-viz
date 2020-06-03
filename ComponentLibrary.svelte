<script>
  import Scrubber from './Scrubber.svelte'; 
  import EventInfoBox from './EventInfoBox.svelte';
  import Thermometer from './Thermometer.svelte';
  import AQILegend from './AQILegend.svelte';


  const FRAME_RATE = 30; //fps
  let nFrames = 431; // total number of frames in animation
  let currentFrame = 1;
  let animationPaused = true;
  let temp = -40;

  let incrementFrame = function() {
    if (animationPaused) return;
    if (currentFrame+1 >= nFrames) {
      currentFrame = 1;
    } else {
      currentFrame++;
    }

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
  }

  var intervalTimer = setInterval(incrementFrame, FRAME_RATE);
  


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
         <div class='component thermometer'>
            <h2>AQI Legend</h2>
            <AQILegend />
         </div>


          <!-- Thermometer -->
         <div class='component thermometer'>
            <h2>Thermometer</h2>
            <Thermometer temp={temp} />
         </div>
        


        <!-- scrubber -->
        <div class='component scrubber'>
          <h2>Scrubber</h2>
          <span> current frame: {currentFrame}</span>
          <Scrubber 
            currentFrame={currentFrame}
            pauseAnimation={pauseAnimation} 
            startAnimation={startAnimation} 
            updateCurrentFrame={updateCurrentFrame}/>
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