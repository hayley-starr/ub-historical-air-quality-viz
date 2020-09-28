<script>
    import Icon from 'fa-svelte'
    import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
    import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
    
    export let currLang;
    export let translator;

    const howVizWasMadeInfo = [

        {title: 'info_title_low_cost_sensor_data', body: 'info_body_low_cost_sensor_data'},
        {title: 'info_title_aq_modeling', body: 'info_body_aq_modeling'}
    ]

    const whatVizDoesntShowInfo = [

        {title: 'info_title_info_prior_2019', body: 'info_body_info_prior_2019'},
        {title: 'info_title_other_pollutants', body: 'info_body_other_pollutants'},
        {title: 'info_title_accurate_spatial_estimates', body: 'info_body_accurate_spatial_estimates'},
        {title: 'info_title_full_govt_actions', body: 'info_body_full_govt_actions'},
    ]

</script>

<div>
    <div class='info-section'>
        <div class='info-section-title'>{translator.translate('info_how_was_viz_made', currLang)} </div>
        {#each howVizWasMadeInfo as bullet}
            <div class='info-section-non-bullet'>
                <div class='info-non-bullet'>
                    <div class='bullet-title-non-bullet'>
                          {translator.translate(bullet.title, currLang)}
                    </div>
                     <div class='bullet-body'>
                        {translator.translate(bullet.body, currLang)}
                    </div>
                </div>
                
               
            </div>
        {/each}
        
    </div>
    <div class='info-section'>
      <div class='info-section-title'>{translator.translate('info_what_viz_doesnt_show', currLang)} </div>
        {#each whatVizDoesntShowInfo as bullet}
            <div class='info-section-bullet'>
                <div class='bullet-info'>
                    <div class='bullet-icon'>
                        <Icon icon={faTimes}></Icon>
                    </div>
                    <div class='bullet-title'>
                        {translator.translate(bullet.title, currLang)}
                    </div>
                     
                </div>

                <div class='bullet-body'>
                        {translator.translate(bullet.body, currLang)}
                </div>
                
               
            </div>
        {/each}
        
    </div>

     <div class='info-end'>
        <div class='info-end-text info-thanks'>
                <div class='heart-icon'>
                        <Icon icon={faHeart}></Icon>
                </div>
                {translator.translate('thanks_to', currLang)}
        </div>

        <div class='info-who-am-i'>
                {translator.translate('who_am_i', currLang).split('Breathe Mongolia')[0]}
                <a href='https://breathemongolia.org/mn' target="_blank">{'Breathe Mongolia'}</a>
                {translator.translate('who_am_i', currLang).split('Breathe Mongolia')[1]}
        </div>
        
     </div>
    
</div>

<style>
    .info-section {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }

    .info-section-title {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 10px;

    }

    .info-section-non-bullet {
        display: flex;
        margin-bottom: 10px;
    }

    .info-section-bullet {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }

    .bullet-info {
        font-size: 14px;
        line-height: 22px;
        display: flex;
        align-items: center;
    }

    .info-non-bullet {
        font-size: 14px;
        line-height: 22px;
        align-items: center;
    }

    .bullet-icon {
        color: red;        
        display: flex;
        align-items: center;
        height: 20px;
        width: 15px;
    }

    .bullet-title {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bold;
        margin-left: 5px;
    }

    .bullet-title-non-bullet {
        text-transform: uppercase;
        font-size: 12px;
        font-weight: bold;
    }

    .bullet-body {
        /* font-weight: lighter; */
        font-size: 14px;
        line-height: 22px;
        margin-left: 20px;
    }

    .info-end {
        margin-top: 60px;
        background-color: steelblue;
        padding: 10px;
        color: white;
        border-radius: 4px;
    }

    .heart-icon {
        color: palevioletred;
        display: inline;
        font-size: 14px;
    }

    .info-who-am-i {
        font-weight: lighter;
        font-size: 14px;
        letter-spacing: -0.05px;
    }

    .info-thanks {
        font-weight: bold;
        margin-bottom: 20px;
    }
</style>