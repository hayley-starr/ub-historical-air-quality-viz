<script>
    import Thermometer from './Thermometer.svelte';
    import { onMount } from 'svelte';
    import { scaleLinear } from 'd3-scale'
    import { quantize, interpolate } from 'd3-interpolate'
    import { create } from 'd3-selection';
    import { axisRight } from 'd3-axis';

    export let currentFrame;
    export let frameData;

    // DO NOT CHANGE -- used in the png-izer as well
    const green_color = '#93c947';
    const red_color = '#f0004c';
    const yellow_color = '#ebc505';
    const orange_color = '#fc9d03';
    const purple_color = '#5e03fc';
    const dark_purple_color = '#4b1f7a';
    const black_color = '#050505';

    const airQualityScale = [0, 12, 35, 55, 150, 250, 450, 500]; // this is up for changing!
    const airQualityScaleTicks = [12, 35, 55, 150, 250, 500]; // this is up for changing!
    const colorScale = [green_color, // <12
            yellow_color, // <35
            orange_color, // <55
            red_color, // <150
            purple_color, // < 250
            dark_purple_color, // < 500
            dark_purple_color, // < 550
            black_color]; //> 550

//---- Create Color Scale ----------------------

    var color = scaleLinear().domain(airQualityScale).range(colorScale);
    color.clamp(true);

    let width = 30;
    let height = 200;
    let marginTop = 0;
    let marginRight = 0;
    let marginBottom = 0;
    let marginLeft = 0;    

    function ramp(color) {
        let n = height;
        const canvas = document.getElementById("pm25-scale");
        canvas.height = height;
        canvas.width = width;
        const context = canvas.getContext("2d");
        
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color((n-1-i) / (n - 1));
            context.fillRect(0, i, width, height);
        }
        
        return canvas;
    }

    // Create the svg that will display the legend
    const svg = create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Get the length over which to quantize
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
    <div class='legend-tile ap-legend-pm25-scale-container'>
        <canvas class='pm25-scale' id='pm25-scale'></canvas>
        <div class='pm25-scale-ticks'>
            {#each airQualityScaleTicks as tick}
                <div>{'-' + tick + ' μg/m3'} </div>
            {/each}


        </div>
    </div>

    
     <div class='legend-tile basemap-options'>
        <div class='ap-legend-stations'>
            <div class='ap-station-container'>
                <div class='ap-station-marker'></div>
            </div>
            <div>{'Air Quality Sensor Location'}</div>
        </div>

         <!-- <button class='button-switch-basemap'>Switch to Satellite View</button> -->
    </div>
     <div class='legend-tile thermometer-container'>
        <Thermometer 
            currentFrame={currentFrame} 
            frameData={frameData}
        />
    </div>
    
</div>

<style>
.ap-legend {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 75px;
    padding-left: 10px;
}

.legend-tile {
    background-color: white;
    color: #2B2D42;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 5px 5px;
}

.ap-legend-pm25-scale-container {
    display: flex;
}

.pm25-scale-ticks {
    height: 200px;
    font-size: 10px;
    padding-left: 5px;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-evenly;
}

.ap-legend-stations {
    display: flex;
    font-size: 14px;
    flex-direction: row;
    justify-content: space-around;
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

.button-switch-basemap {
    margin: 5px 0;
}

.thermometer-container {
    height: 200px;
}

</style>