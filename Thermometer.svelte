<script>
    import { scaleLinear} from 'd3-scale'

    export let currentFrame;
    export let frameData;
    export let aloha;

    const MAX_HEIGHT = 534; // total height of mercury rect - DO NOT CHANGE
    const MIN_HEIGHT = 105; // how far the mercury rect dips below the mercury circle -DO NOT CHANGE
    const HEIGHT_CHANGE = MAX_HEIGHT-MIN_HEIGHT; // 429

    const TOPMOST_Y = 17; // DO NOT CHANGE - mercury of thermometer starts at y=17px and moves down
    const BOTTOMMOST_Y = TOPMOST_Y + HEIGHT_CHANGE;

    const tempScale = [-40, -20, 5, 15, 30, 40];

    var scaleTempToPixels = scaleLinear().domain([-40, 40]).range([0, HEIGHT_CHANGE]);
    scaleTempToPixels.clamp(true);

    let pixelChangeFromBaseline = 0; // -40 C to start 
    let height = MIN_HEIGHT;
    let starting_y = BOTTOMMOST_Y;
    let tempColor = '#a81e1e';
    let currentTemp = 0;

    $: {
        currentTemp = Math.round(frameData[currentFrame].temp);
        pixelChangeFromBaseline = scaleTempToPixels(currentTemp);
        height = MIN_HEIGHT + pixelChangeFromBaseline;
        starting_y = BOTTOMMOST_Y - pixelChangeFromBaseline;
    }

</script>

<div class='thermometer'>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 613">
  <defs>
    <style>
      .cls-1 {
        fill: rgba(255, 255, 255, 0.521);
      }

      .cls-2 {
        fill: none;
        stroke: #2B2D42;
        stroke-miterlimit: 10;
        stroke-width: 3px;
        
      }

      .cls-4 {
        font-size: 45px;
        font-weight: bold;
        letter-spacing: 0em;
        stroke-width: 1px;
        stroke: #8a2121;
      }
    </style>
  </defs>
  <g>
    <path class="cls-1" d="M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z" transform="translate(-602 -77)"/>
    <path class="cls-2" d="M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z" transform="translate(-602 -77)"/>
  </g>
  <rect class="cls-3" fill={tempColor} x="49" y={starting_y} width="86" height={height} rx="43"/>
  <!-- Full Thermometer DO NOT CHANGE -->
  <!-- <rect class="cls-3" x="49" y="17" width="86" height="534" rx="43"/> -->
  <circle class="cls-3" fill={tempColor} cx="92" cy="521" r="75"/>
  <text class="cls-4"  fill={'#fff'} transform="translate(0 532)" x="50%" text-anchor="middle">{currentTemp}°C</text>
</svg>
</div>

<style>

.thermometer {
    max-width: 50px;
    max-height: 100px;
}

</style>