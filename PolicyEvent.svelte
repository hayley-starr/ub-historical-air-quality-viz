<script>
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';

    export let currentFrame;
    export let position;
    export let eventDetails;

    // TODO: Remove
    eventDetails = {
        date: 'June 20th 2019',
        title: 'Government Bans Raw Coal',
        text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.'
    }

    const BUFFER = 10;

    let policyDotStyler;
    let policyInfoContainerStyler;

    const policyInfoContractedState = { scale: 0 , translateX: '-50%', translateY: '-25%'};
    const policyInfoExpandedState = { scale: 1 , translateX: '-25%', translateY: '30%'};

    console.log(policyInfoContractedState);

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
        duration: 300,
        easings: [easing.bounceOut]
    });

    let policyInfoExpandKeyFrames =  keyframes({
        values: [ 
            policyInfoContractedState,
            policyInfoExpandedState
        ],
        times: [0, 1],
        duration: 300,
        easings: [easing.bounceOut]
    });

    let policyDotContractKeyFrames =  keyframes({
        values: [ 
            { scale: 2 },
            { scale: 1 }
        ],
        times: [0, 1],
        duration: 600,
        easings: [easing.bounceIn]
    });

    let policyInfoContractKeyFrames =  keyframes({
        values: [ 
            policyInfoExpandedState,
            policyInfoContractedState
        ],
        times: [0, 1],
        duration: 600,
        easings: [easing.linear]
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
          console.log(style);
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
    });



</script>

<div class='policy-event'>
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
        transition: all .2s ease-in-out; 
    }

    .policy-info-container {
        height: 10;
        width: 10;
        border: 1px solid pink;
        position: absolute;
        transform: translateY(-25%) translateX(-50%) scale(0.2);
    }



</style>