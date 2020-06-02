<script>
  import Scrubber from './Scrubber.svelte'; 
  import EventInfoBox from './EventInfoBox.svelte';
  import Thermometer from './Thermometer.svelte';


  const FRAME_RATE = 30; //fps
  let nFrames = 431; // total number of frames in animation
  let currentFrame = 1;
  let animationPaused = true;

  let incrementFrame = function() {
    if (animationPaused) return;
    if (currentFrame+1 >= nFrames) {
      currentFrame = 1;
    } else {
      currentFrame++;
    }
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

         <!-- Event Info Box -->
         <div class='component thermometer'>
            <h2>Themometer</h2>
            <Thermometer />
         </div>
        
        
    </div>


</div>

<style>

.component {
  margin-bottom: 80px;
  padding-bottom: 80px;
  border-bottom: 1px solid green;
}


.thermometer {
  max-width: 100px;
  max-height: 200px;
}
</style>