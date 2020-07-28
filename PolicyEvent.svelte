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


//---- Position the policy dot and container according to their calculated position -----------

    let policyDotStyler;
    let policyDotContainerStyler
    let policyInfoContainerStyler;
    var policyDateStyler;

    $: {
        if (policyDateStyler && eventPosition > 0) {
            policyDotContainerStyler.set('left', eventPosition);
            policyInfoContainerStyler.set('left', eventPosition);
            policyDateStyler.set('left', eventPosition);
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
            bufferEndPosition = eventPosition + 2*bufferRadius;
            bufferStartPosition = eventPosition - bufferRadius;
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

    const policyInfoContractedState = { scale: 0 , translateX: '-50%', translateY: '-25%'};
    const policyInfoExpandedState = { scale: 1 , translateX: '-25%', translateY: '-102%'};

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
        isEventHighlighted = true;

        policyDotExpandKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        policyInfoExpandKeyFrames.start(style => {
          policyInfoContainerStyler.set(style);
        });   
    }

    // To diminish the whole event, contract the dot and hide the policy info box
    const diminishEvent = () => {
        isEventHighlighted = false;

        policyDotContractKeyFrames.start(style => {
            policyDotStyler.set(style);
        });
        policyInfoContractKeyFrames.start(style => {
          policyInfoContainerStyler.set(style);
        });
    }

    onMount(async () => {
        // Create a styler to style the policy dot - to control the dot's animation
        const policyDot = document.querySelector(".policy-dot"+id);
        policyDotStyler = styler(policyDot);

        // Create a styler to style the dot container - to position the policy dot on the timeline
        const policyDotContainer = document.querySelector(".policy-dot-container"+id);
        policyDotContainerStyler = styler(policyDotContainer);
       

        const policyInfoContainer = document.querySelector(".policy-info-container"+id);
        policyInfoContainerStyler = styler(policyInfoContainer);
        

        const policyDate = document.querySelector(".policy-event-date"+id);
        policyDateStyler = styler(policyDate);
        
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
    <div class={"policy-info-container policy-info-container"+id}>
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