<script>
    import Thermometer from './Thermometer.svelte';
    import { onMount } from 'svelte';
    import { scaleLinear } from 'd3-scale'
    import { quantize, interpolate } from 'd3-interpolate'
    import { create } from 'd3-selection';
    import { axisRight } from 'd3-axis';
    import { classnames } from './classnames';

    export let currentFrame;
    export let frameData;
    export let translator;
    export let currLang;

    // DO NOT CHANGE -- used in the png-izer as well
    const green_color = '#93c947';
    const red_color = '#f0004c';
    const yellow_color = '#ebc505';
    const orange_color = '#fc9d03';
    const purple_color = '#5e03fc';
    const dark_purple_color = '#4b1f7a';
    const black_color = '#050505';

    const airQualityScale = [0, 12, 35, 55, 150, 250, 450, 500]; // this is up for changing!
    const airQualityScaleTicks = [
        {label: 12, heightpx: 30, text: 'good'},
        {label: 35, heightpx: 30, text: 'moderate'},
        {label: 55, heightpx: 30, text: 'unhealthy_sensitive'},
        {label: 150, heightpx: 40, text: 'unhealthy'},
        {label: 250, heightpx: 50, text: 'very_unhealthy'},
        {label: 500, heightpx: 50, text: 'hazardous'}
    ]
    const colorScale = [green_color, // <12
            yellow_color, // <35
            orange_color, // <55
            red_color, // <150
            purple_color, // < 250
            dark_purple_color, // < 500
            dark_purple_color] // < 550

//---- Create Color Scale ----------------------

    var color = scaleLinear().domain(airQualityScale).range(colorScale);
    color.clamp(true);

    let width = 30; // must match pm25-scale-ticks
    let height = 250;
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
    <div class='legend-tile'>
        <div class='ap-legend-pm25-scale-title'>{translator.translate('pm25_scale_title', currLang)}</div>
        <div class='ap-legend-pm25-scale-container'>
            <canvas class='pm25-scale' id='pm25-scale'></canvas>
            <div class='pm25-scale-ticks'>
                {#each airQualityScaleTicks as tick}
                    <div class={classnames('pm25-scale-tick-row', 'pm25-scale-tick-row-'+tick.heightpx)}>
                        <div class='pm25-scale-label'>
                        <span class='pm25-scale-number'>
                            {tick.label} 
                        </span>
                        <span>{' μg/m3'}</span>
                        </div>
                        <div class='aqi-scale-labels'>{translator.translate(tick.text, currLang)}</div>
                    </div>
                {/each}
            </div>
        </div>

        <div class='key-container'>
            <img class='key-img' src="./imgs/uncertainty_mask_legend.png" alt="">
            <div class='key-description'>
                <span>{translator.translate('legend_not_enough_data', currLang)}</span>
            </div>
        </div>


        <div class='key-container'>
            <img class='key-img' src="./imgs/station_marker_legend.png" alt="">
            <div class='key-description'>
                <span>{translator.translate('legend_station_marker', currLang)}</span>
            </div>
        </div>

         <!-- <button class='button-switch-basemap'>Switch to Satellite View</button> -->
  
    </div>

     <div class='legend-tile temperature-key-container'>
        <div class='temperature-key-title'> {translator.translate('legend_temperature_title', currLang)} </div>
        <div class='temperature-key-body'>
            <div class='thermometer-container'>
                <Thermometer 
                    currentFrame={currentFrame} 
                    frameData={frameData}
                />
            </div>
             <span>{translator.translate('legend_temperature_description', currLang)} </span>
             
           <!-- <div class='temperature-description' >
               
           </div> -->
        </div>
    </div>
    

</div>

<style>

.ap-legend {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 190px;
    max-width: 220px;
    padding-left: 10px;
    font-size: 12px;
}

@media screen and (max-width: 500px) and (max-height: 1000px) { /* phones */
    .ap-legend {
        min-width: 0;
        max-width: 100%;
        padding-right: 10px;
        font-size: 14px;
    }
}
@media screen and (max-width: 800px) and (max-height: 500px) { /* sideways phones */
    .ap-legend {
        min-width: 0;
        max-width: 100%;
        padding-right: 10px;
        font-size: 14px;
    }
}

.legend-tile {
    background-color: white;
    color: #2B2D42;
    border-radius: 4px;
    margin-bottom: 10px;
    padding: 10px;
}

@media screen and (max-width: 500px) and (max-height: 1000px) { /* phones */
    .legend-tile {
        padding: 20px;
    }
}
@media screen and (max-width: 800px) and (max-height: 500px) { /* sideways phones */
    .legend-tile {
        padding: 20px;
    }
}

.ap-legend-pm25-scale-container {
    display: flex;
    position: relative;
}

.ap-legend-pm25-scale-title {
    margin-bottom: 5px;
    font-weight: bold;
}

.pm25-scale {
    opacity: 0.7;
}

.pm25-scale-ticks {
    height: 250px;
    width: 100%;
    font-size: 10px;
    padding-left: 5px;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    z-index: 100;
}

.pm25-scale-tick-row {
    display: flex;
    height: 20px;
    align-items: baseline;
    padding-top: 10px;
}

.pm25-scale-tick-row-30 {
    height: 30px;
    padding-top: 5px;
}

.pm25-scale-tick-row-40 {
    height: 40px;
}

.pm25-scale-tick-row-50 {
    height: 50px;
}

.pm25-scale-label {
    width: 70px;
}


.pm25-scale-number {
    font-size: 12px;
    font-weight: bold;
}

.aqi-scale-labels {
  width: 100px;
  font-weight: bold;
}

.key-description {
    padding-left: 5px;
    display: flex;
    align-items: center;
}

.key-img {
    height: 30px;
    width: 30px;
}

.key-container {
    display: flex;
    height: 30px;
    margin-top: 10px;
} 

/*--------- Other Controls ---------------*/

.button-switch-basemap {
    margin: 5px 0;
}

.temperature-key-container {
    display: flex;
    flex-direction: column;
}

.temperature-key-body {
   padding: 0 5px 5px 5px
}

.thermometer-container {
    float: left;
    width: 55px;
    padding-right: 10px;
}

.temperature-description {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
    max-width: 70%;
}

.temperature-description-body {
    font-size: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.temperature-key-title {
    font-weight: bold;
    padding-bottom: 5px;
}

</style>