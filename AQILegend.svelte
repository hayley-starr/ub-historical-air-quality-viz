<script>
    import Thermometer from './Thermometer.svelte';
    import { onMount } from 'svelte';
    import { scaleLinear } from 'd3-scale'
    import { quantize, interpolate } from 'd3-interpolate'
    import * as d3 from 'd3-selection';

    export let currentFrame;

    let green_color = '#93c947'; //green
    let red_color = '#f0004c'; //red
    let orange_red_color = '#fc6203';
    let yellow_color = '#ebc505';
    let green_yellow_color = '#d7e01d'
    let orange_color = '#fc9d03';
    let red_purple_color = '#d921d0';
    let purple_color = '#5e03fc';
    let dark_purple_color = '#4b1f7a';
    let black_color = '#050505';

    const airQualityScale = [0, 12, 35, 55, 150, 250, 500]; // this is up for changing!
    const colorScale = [green_color, // <12
            yellow_color, // <35
            orange_color, // <55
            red_color, // <150
            purple_color, // < 250
            dark_purple_color, // < 500
            black_color]; //> 500

    var color = scaleLinear().domain(airQualityScale).range(colorScale);
    color.clamp(true);

    let width = 20;
    let height = 150;
    let marginTop = 0;
    let marginRight = 0;
    let marginBottom = 0;
    let marginLeft = 0;

    function ramp(color, n = 256) {
        const canvas = document.getElementById("pm25-scale");
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color(i / (n - 1));
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    }

     const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

    const n = Math.min(color.domain().length, color.range().length);

    let x = color.copy().rangeRound(quantize(interpolate(marginLeft, width - marginRight), n));

   
    onMount(async () => {
        svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(quantize(interpolate(0, 1), n))).toDataURL());
    });

  

    






</script>

<div class='ap-legend'>
    <div class='ap-legend-title'>PM2.5 Legend</div>
    <div class='ap-legend-pm25-scale-container'>{'scale goes here'}
        <canvas id='pm25-scale'></canvas>
    </div>
    <!-- {#each AQI_LEGEND_INFO as level}
        <div class='ap-level'>
            <div class={'ap-level-color ap-'+level.id}></div>
            <div class='ap-level-range'>
                {#if level.range_high}
                    {level.range_low} - {level.range_high}
                {:else}
                    {level.range_low}+
                {/if}
            </div>
             <div class='aqi-level-description'>
                {level.description}
            </div>
        </div>
    {/each} -->
    <div class='ap-legend-stations'>
        <div class='ap-station-container'>
            <div class='ap-station-marker'></div>
        </div>
        <div>{'Air Quality Sensor Location'}</div>
    </div>
    <div>
        <Thermometer currentFrame={currentFrame} />
    </div>
    
</div>

<style>
.ap-legend {
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    min-width: 75px;
    background-color: white;
    border: 1px solid red;
}

.ap-legend-title {
    padding: 5px;
    font-size: 20px;
    border: 1px solid purple;
}

.ap-legend-pm25-scale-container {
    height: 45px;
    border: 1px solid green;
}

/* .ap-level {
    display: flex;
    justify-content: flex-start;
    margin: 0 0 5px 5px;
}

.ap-level-color {
    height: 15px;
    width: 15px;
    border-radius: 2px;
    margin-right: 10px;
}

.ap-color-range {
    width: 50px;
} */


.ap-legend-stations {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border: 1px solid red;
}

.ap-station-container {
    padding: 4px;
}

.ap-station-marker {
    height: 7px;
    width: 7px;
    background-color: black;
    border-radius: 3.5px;
}

</style>