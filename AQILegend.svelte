<script>
import Thermometer from './Thermometer.svelte';

export let currentFrame;

const AQI_LEGEND_INFO = [
    {id: 1, color: '#3ec41f', description: 'Good', range_low: 0, range_high: 49},
    {id: 2, color: '#f2d00f', description: 'Moderate', range_low: 50, range_high: 99},
    {id: 3, color: '#e6a40b', description: 'Unhealthy For Sensitive Groups', range_low: 100, range_high: 149,},
    {id: 4, color: '#bd2211', description: 'Unhealthy', range_low: 150, range_high: 199,},
    {id: 5, color: '#9421a3', description: 'Very Unhealthy', range_low: 200, range_high: 299},
    {id: 6, color: '#6e4c65', description: 'Unsafe', range_low: 300}
];

</script>

<div class='ap-legend'>
    <div class='ap-legend-title'>PM2.5 Legend</div>
    <div class='ap-legend-pm25-scale-container'>{'scale goes here'}</div>
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