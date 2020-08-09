<script>
    import Icon from 'fa-svelte'
    import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
    
    export let currLang;
    export let translator;

    const howVizWasMadeInfo = [

        {title: 'Low-Cost Sensor Data', body: 'This visualization was made with data collected from 20 low-cost sensors installed around the city by People In Need Mongolia. The air quality stations on the map show their locations.'},
        {title: 'Air Quality Modeling', body: 'Creating the visualzation was a two-step process. First the sensor data was combined with data about the city, such as density of population, density of coal-stoves (surveyed in 2013) and density of residential roads, to create a prediction map for each month. Then the prediction maps were corrected with the 7 day moving average of the observed readings. The final visualization reflects a fusion of the monthly trends with the smaller, daily variations in air quality.'}
    ]

    const whatVizDoesntShowInfo = [

        {title: 'Information Prior to 2019', body: 'The low-cost sensors have enough data starting around February 2019. While there is data going back further for individual sensors, this type of visualization requires a network of sensors with consistent data.'},
        {title: 'Air Pollutants other than PM2.5', body: 'PM2.5, while harmful to human health, is not the only pollutant to worry about. When the visualization is green doesn\'t mean that there is no air pollution, just that PM2.5 levels are low.'},
        {title: 'Highly Accurate Spatial Estimates', body: 'This visualizaton shows estimated trends over the city over time, and should not be used to make health exposure assessments or anything requiring numerical precision. In the future, more and better sensors around the city will help produce even more accurate maps.'},
        {title: 'A Full List of Government Actions', body: 'The events selected for the timeline are some of the most notable events related to air pollution in Ulaanbaatar, but are not a comprehensive list.'},
    ]

</script>

<div>
    <div class='info-section'>
        <div class='info-section-title'>{'How was this visualization made?'} </div>
        {#each howVizWasMadeInfo as bullet}
            <div class='info-section-bullet'>
                <div class='bullet-info'>
                    <div class='bullet-title'>
                        {bullet.title}
                    </div>
                     <div class='bullet-body'>
                        {bullet.body}
                    </div>
                </div>
                
               
            </div>
        {/each}
        
    </div>
    <div class='info-section'>
        <div class='info-section-title'>{'What does the visualizaton NOT show?'} </div>
        {#each whatVizDoesntShowInfo as bullet}
            <div class='info-section-bullet'>
                 <div class='bullet-icon'>
                    <Icon icon={faTimes}></Icon>
                </div>
                <div class='bullet-info'>
                    <div class='bullet-title'>
                        {bullet.title}
                    </div>
                     <div class='bullet-body'>
                        {bullet.body}
                    </div>
                </div>
                
               
            </div>
        {/each}
        
    </div>
    
</div>

<style>
    .info-section {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }

    .info-section-title {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 10px;

    }

    .info-section-bullet {
        display: flex;
        margin-bottom: 5px;
    }

    .bullet-info {
        font-size: 14px;
        line-height: 22px;
    }

    .bullet-icon {
        color: red;
        margin-right: 5px;
        display: flex;
        align-items: center;
        height: fit-content;
        margin-top: 4px;
    }

    .bullet-title {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bold;
    }

    .bullet-body {
        font-weight: lighter;
    }
</style>