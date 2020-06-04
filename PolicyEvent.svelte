<script>
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';
    import moment from 'moment';

    export let currentFrame;
    export let position;
    export let eventDetails;

    // TODO: Remove
    eventDetails = {
        date: '2019-03-21',
        title: 'Government Bans Raw Coal',
        text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.',
        source: 'https://breathemongolia.org/',
        imgSource: './banRawCoal.jpg'
    }

    const BUFFER = 10;

    let policyDotStyler;
    let policyInfoContainerStyler;

    const policyInfoContractedState = { scale: 0 , translateX: '-50%', translateY: '-25%'};
    const policyInfoExpandedState = { scale: 1 , translateX: '-25%', translateY: '-102%'};

    const expandDuration = 400;
    const contractDuration = 600;


    $: { // When the current frame passes certain positions, highlight or reduce event
        if (currentFrame == position-BUFFER) {
           highlightEvent();
       }

       if (currentFrame == position + BUFFER*4) {
           diminishEvent();
       }
    }


    let policyDotExpandKeyFrames =  keyframes({
        values: [ 
            { scale: 1 },
            { scale: 2 }
        ],
        times: [0, 1],
        duration: expandDuration,
        easings: [easing.easeOut]
    });

    let policyInfoExpandKeyFrames =  keyframes({
        values: [ 
            policyInfoContractedState,
            policyInfoExpandedState
        ],
        times: [0, 1],
        duration: expandDuration,
        easings: [easing.easeOut]
    });

    let policyDotContractKeyFrames =  keyframes({
        values: [ 
            { scale: 2 },
            { scale: 1 }
        ],
        times: [0, 1],
        duration: contractDuration,
        easings: [easing.easeIn]
    });

    let policyInfoContractKeyFrames =  keyframes({
        values: [ 
            policyInfoExpandedState,
            policyInfoContractedState
        ],
        times: [0, 1],
        duration: contractDuration,
        easings: [easing.easeIn]
    });


    // To highlight the whole event, expand the dot and show the policy info box
    const highlightEvent = () => {
        policyDotExpandKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        policyInfoExpandKeyFrames.start(style => {
          policyInfoContainerStyler.set(style);
        });   
    }

    // To diminish the whole event, contract the dot and hide the policy info box
    const diminishEvent = () => {
        policyDotContractKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        policyInfoContractKeyFrames.start(style => {
          policyInfoContainerStyler.set(style);
        });
    }

    onMount(async () => {
        // Create a styler to style the policy dot - to control the dot's animation
        const policyDot = document.querySelector(".policy-dot"+position);
        policyDotStyler = styler(policyDot);

        // Create a styler to style the dot container - to position the policy dot on the timeline
        const policyDotContainer = document.querySelector(".policy-dot-container"+position);
        let policyDotContainerStyler = styler(policyDotContainer);
        policyDotContainerStyler.set('left', position);

        const policyInfoContainer = document.querySelector(".policy-info-container"+position);
        policyInfoContainerStyler = styler(policyInfoContainer);
        policyInfoContainerStyler.set('left', position);

        const policyDate = document.querySelector(".policy-event-date"+position);
        var policyDateStyler = styler(policyDate);
        policyDateStyler.set('left', position);
    });



</script>

<div class='policy-event'>
    <div class={'policy-event-date policy-event-date'+position}>{moment(eventDetails.date).format("MMMM YYYY")}</div>
    <div class={"policy-dot-container policy-dot-container"+position}>
        <div class={"policy-dot-hit-area policy-dot-hit-area"+position}>
            <div class={"policy-dot policy-dot"+position}></div>
        </div>
    </div>
    <div class={"policy-info-container policy-info-container"+position}>
        <EventInfoBox eventDetails={eventDetails} />
    </div>
  
</div>

<style>


    .policy-event-date {
        position: absolute;
        font-size: 13px;
        top: 20%;
        left: 50px; 
        transform: translateY(-50%) translateX(-50%);   
    }

    .policy-dot-container {
        position: absolute;
        top: 50%;
        left: 50px; 
        transform: translateY(-50%) translateX(-50%);
    }

    .policy-dot-hit-area {
        padding: 30px;
        width: 10px;
        height: 10px;
    }

    .policy-dot {
        background: darkslategrey;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        cursor: pointer;
    }

    .policy-info-container {
        height: 10;
        width: 10;
        position: absolute;
        transform: translateY(-25%) translateX(-50%) scale(0);
    }



</style>