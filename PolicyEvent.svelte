<script>

    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import { onMount } from 'svelte';

    export let currentFrame;
    export let position;

    const BUFFER = 10;

    let eventStyler;
    let eventInfoStyler;

    $: {
        if (currentFrame == position-BUFFER) {
           highlightEvent();
       }

       if (currentFrame == position + BUFFER*4) {
           reduceEvent();
       }
    }


    let eventKeyFramesExpand =  keyframes({
        values: [ 
            { scale: 1 },
            { scale: 2 }
        ],
        times: [0, 1],
        duration: 300,
        easings: [easing.bounceOut]
    });

    let eventInfoKeyFramesExpand =  keyframes({
        values: [ 
            { scale: 0 , translateX: 0, translateY: 0},
            { scale: 1 , translateX: 0, translateY: 60}
        ],
        times: [0, 1],
        duration: 800,
        easings: [easing.bounceOut]
    });

    let eventKeyFramesContract =  keyframes({
        values: [ 
            { scale: 2 },
            { scale: 1 }
        ],
        times: [0, 1],
        duration: 600,
        easings: [easing.bounceIn]
    });

    let eventInfoKeyFramesContract =  keyframes({
        values: [ 
            { scale: 1 , translateX: 0, translateY: 60},
            { scale: 0 , translateX: 0, translateY: 0}
        ],
        times: [0, 1],
        duration: 400,
        easings: [easing.linear]
    });

    const highlightEvent = () => {
        eventKeyFramesExpand.start(style => {
            eventStyler.set(style);
        });
        eventInfoKeyFramesExpand.start(style => {
            eventInfoStyler.set(style);
        });   
    }

    const reduceEvent = () => {
        eventKeyFramesContract.start(style => {
            eventStyler.set(style);
        });
        eventInfoKeyFramesContract.start(style => {
            eventInfoStyler.set(style);
        });
    }

    onMount(async () => {
        const event = document.querySelector(".event"+position);
        eventStyler = styler(event);
        const eventInfo = document.querySelector(".event-info-box"+position);
        eventInfoStyler = styler(eventInfo);
        eventInfoStyler.set('left', position);

        const eventContainer = document.querySelector(".event-container"+position);
        let eventContainerStyler = styler(eventContainer);
        eventContainerStyler.set('left', position);
    });



</script>

<div class='policy-event'>
    <div class={"event-container event-container"+position}>
        <div class={"event-hit-area event-hit-area"+position}>
            <div class={"event event"+position}></div>
        </div>
    </div>
    <div class={"event-info-box event-info-box"+position}>
        <span>EVENT INFO</span>
    </div>
</div>

<style>

    .event-container {
        position: absolute;
        top: 50%;
        left: 50px; 
        transform: translateY(-50%) translateX(-50%);
    }

    .event-hit-area {
        padding: 30px;
        width: 10px;
        height: 10px;
    }

    .event {
        background: darkslategrey;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: all .2s ease-in-out; 
    }

    .policy-event {
        width: 300px;
    }

    .event-info-box {
        border: 1px solid sandybrown;
        height: 200px;
        width: 300px;
        transform: translate(0px, 0px) scale(0);
        background: white;
        border-radius: 4px;
        position: absolute;
    }


</style>