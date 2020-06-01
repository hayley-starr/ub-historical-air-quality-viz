<script>
  import Scrubber from './Scrubber.svelte'; 
  import PolicyEvent from './PolicyEvent.svelte'; 

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
  
</script>

<div class='component-library'>
    <h1>Component Library</h1>
    <div class='components'>
        <!-- scrubber -->
        <div class='scrubber'>
          <h2>Scrubber</h2>
          <span> current frame: {currentFrame}</span>
          <Scrubber 
            currentFrame={currentFrame}
            pauseAnimation={pauseAnimation} 
            startAnimation={startAnimation} 
            updateCurrentFrame={updateCurrentFrame}/>
        </div>


         <!-- next component -->
 
        
    </div>


</div>

<style>

</style>