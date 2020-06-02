<script>

export let temp;

const MAX_HEIGHT = 534; // total height of mercury rect - DO NOT CHANGE
const MIN_HEIGHT = 105; // how far the mercury rect dips below the mercury circle -DO NOT CHANGE
const HEIGHT_CHANGE = MAX_HEIGHT-MIN_HEIGHT; // 429

const TOPMOST_Y = 17; // DO NOT CHANGE - mercury of thermometer starts at y=17px and moves down
const BOTTOMMOST_Y = TOPMOST_Y + HEIGHT_CHANGE;


let pixelChangeFromBaseline = 0; // -40 C to start

$: pixelChangeFromBaseline = scaleTempToPixels(temp);
$: height = MIN_HEIGHT + pixelChangeFromBaseline;
$: starting_y = BOTTOMMOST_Y - pixelChangeFromBaseline;

const scaleTempToPixels = (temp) => {
    return (HEIGHT_CHANGE/80)*(temp + 40);
}

</script>

<div class='thermometer'>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 184 613">
  <defs>
    <style>
      .cls-1, .cls-4 {
        fill: #fff;
      }

      .cls-2 {
        fill: none;
        stroke: #333;
        stroke-miterlimit: 10;
        stroke-width: 2px;
      }

      .cls-3 {
        fill: #c1272d;
      }

      .cls-4 {
        font-size: 40px;
        font-family: MyriadPro-Regular, Myriad Pro;
        letter-spacing: 0em;
      }
    </style>
  </defs>
  <g>
    <path class="cls-1" d="M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z" transform="translate(-602 -77)"/>
    <path class="cls-2" d="M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z" transform="translate(-602 -77)"/>
  </g>
  <rect class="cls-3" x="49" y={starting_y} width="86" height={height} rx="43"/>
  <!-- Full Thermometer DO NOT CHANGE -->
  <!-- <rect class="cls-3" x="49" y="17" width="86" height="534" rx="43"/> -->
  <circle class="cls-3" cx="92" cy="521" r="75"/>
  <text class="cls-4" transform="translate(53.42 532)">{temp}C</text>
</svg>
</div>

<style>

.thermometer {}

</style>