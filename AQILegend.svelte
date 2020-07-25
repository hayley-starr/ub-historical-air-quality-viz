<script>

const AQI_LEGEND_INFO = [
    {id: 1, color: '#3ec41f', description: 'Good', range_low: 0, range_high: 49},
    {id: 2, color: '#f2d00f', description: 'Moderate', range_low: 50, range_high: 99},
    {id: 3, color: '#e6a40b', description: 'Unhealthy For Sensitive Groups', range_low: 100, range_high: 149,},
    {id: 4, color: '#bd2211', description: 'Unhealthy', range_low: 150, range_high: 199,},
    {id: 5, color: '#9421a3', description: 'Very Unhealthy', range_low: 200, range_high: 299},
    {id: 6, color: '#6e4c65', description: 'Unsafe', range_low: 300}
];

</script>

<div class='aqi-legend'>
    <div class='aqi-legend-title'>PM2.5 Legend</div>
    {#each AQI_LEGEND_INFO as level}
        <div class='aqi-level'>
            <div class={'aqi-level-color aqi-'+level.id}></div>
            <div class='aqi-level-range'>
                {#if level.range_high}
                    {level.range_low} - {level.range_high}
                {:else}
                    {level.range_low}+
                {/if}
            </div>
             <!-- <div class='aqi-level-description'>
                {level.description}
            </div> -->
        </div>
    {/each}
    <div class='aqi-legend-stations'>
        <div class='aqi-station-container'>
            <div class='aqi-station-marker'></div>
        </div>
        <div>{'Air Quality Sensor Location'}</div>
    </div>
    
</div>

<style>
.aqi-legend {
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    width: 125px;
    background-color: white;
}

.aqi-legend-title {
    padding: 5px;
    font-size: 20px;
}

.aqi-level {
    display: flex;
    justify-content: flex-start;
    margin: 0 0 5px 5px;
}

.aqi-level-color {
    height: 15px;
    width: 15px;
    border-radius: 2px;
    margin-right: 10px;
}

.aqi-color-range {
    width: 50px;
}

.aqi-1 {
    background-color: #3ec41f;
}

.aqi-2 {
    background-color: #f2d00f;
}

.aqi-3 {
    background-color: #e6a40b;
}

.aqi-4 {
    background-color: #bd2211;
}

.aqi-5 {
    background-color: #9421a3;
}

.aqi-6 {
    background-color: #6e4c65;
}


.aqi-legend-stations {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

.aqi-station-container {
    padding: 4px;
}

.aqi-station-marker {
    height: 7px;
    width: 7px;
    background-color: black;
    border-radius: 3.5px;
}

</style>