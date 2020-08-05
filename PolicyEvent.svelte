<script>
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';
    import moment from 'moment';

    export let currentScrubberPosition;
    export let bufferRadius;
    export let eventPosition;
    export let eventDetails;
    export let id;
    export let pauseAnimation;
    export let startAnimation;
    export let updateAppState;

    const PAUSE_ON_EVENT_MS = 3000; 


//---- Position the policy dot and container according to their calculated position -----------

    let policyDotStyler;
    let policyDotContainerStyler

    $: {
        if (eventPosition > 0) {
            policyDotContainerStyler.set('left', eventPosition);
        }
    }

//---- Keep track of where the current event is relative to the event's highlighting/buffer zone. --------
//---- Inside this buffer the event should highlight, outside it should diminish back to a dot. -------

    eventPosition = 0;
    let bufferStartPosition = 0;
    let bufferEndPosition = 0;
    let isEventHighlighted = false;

    $: {
        if (eventPosition > 0) {
            bufferEndPosition = eventPosition + bufferRadius;
            bufferStartPosition = eventPosition - bufferRadius;
            if (eventDetails.type == 'ap season') bufferEndPosition += 15*bufferRadius;
        }
    }

    $: { // When the scrubber enters the buffer zone, highlight
        if (isScrubberWithinEventBuffer(currentScrubberPosition)) {
            if (!isEventHighlighted) {
                highlightEvent();
            }
        } else {
            if (isEventHighlighted) {
                diminishEvent();
            }
        }
    }

    const isScrubberWithinEventBuffer = (currentScrubberPosition) => {
        if (currentScrubberPosition == 0) return false; // start position nothing should be open

        return currentScrubberPosition >= bufferStartPosition &
            currentScrubberPosition <= bufferEndPosition;
    }

//----- Animation specification for expanding and contractng the event -------------

    const expandDuration = 400;
    const contractDuration = 600;

    let policyDotExpandKeyFrames =  keyframes({
        values: [ 
            { scale: 1 },
            { scale: 2 }
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


    // To highlight the whole event, expand the dot and show the policy info box
    const highlightEvent = () => {
        isEventHighlighted = true;
        updateAppState({currEventId: id});

        policyDotExpandKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        
        
        if (eventDetails.type != 'ap season') {
            // pause the animation for a little to let the user read
            pauseAnimation();
            setTimeout(function() { startAnimation() }, PAUSE_ON_EVENT_MS);
        } 
    }

    // To diminish the whole event, contract the dot and hide the policy info box
    const diminishEvent = () => {
        isEventHighlighted = false;

        policyDotContractKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        updateAppState({currEventId: undefined});
    }

    onMount(async () => {
        // Create a styler to style the policy dot - to control the dot's animation
        const policyDot = document.querySelector(".policy-dot"+id);
        policyDotStyler = styler(policyDot);

        // Create a styler to style the dot container - to position the policy dot on the timeline
        const policyDotContainer = document.querySelector(".policy-dot-container"+id);
        policyDotContainerStyler = styler(policyDotContainer);
        
    });

</script>

<div class='policy-event'>
    <div class={'policy-event-date policy-event-date'+id}>
        <!-- {moment(eventDetails.date).format("MMMM YYYY")} -->
    </div>
    <div class={"policy-dot-container policy-dot-container"+id}>
        <div class={"policy-dot-hit-area policy-dot-hit-area"+id}>
            <div class={"policy-dot policy-dot"+id}></div>
        </div>
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
        background:  #e3a005;
        width: 8px;
        height: 8px;
        border: 2px solid black;
        border-radius: 5px;
        cursor: pointer;
    }

</style>