<script>
    import Icon from 'fa-svelte'
    import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
    
    export let currLang;
    export let translator;

    const whatVizDoesntShowInfo = [

        {title: 'Information Prior to 2019', body: 'The low-cost sensors have enough data starting around February 2019. While there is data going back further for individual sensors, this type of visualization requires a network of sensors with consistent data.'},
        {title: 'Air Pollutants other than PM2.5', body: 'PM2.5, while harmful to human health, is not the only pollutant to worry about. When the visualization is green doesn\'t mean that there is no air pollution, just that PM2.5 levels are low.'},
        {title: 'Highly Accurate Spatial Estimates', body: 'This visualizaton shows estimated trends over the city over time, and should not be used to make health exposure assessments or anything requiring numerical precision.'},
        {title: 'All actions taken by the government to address air pollution', body: 'The events selected for the timeline are some of the most notable events related to air pollution in Ulaanbaatar, but are not a comprehensive list.'},
    ]

</script>

<div>
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

    }

    .bullet-body {
        font-weight: lighter;
    }
</style>