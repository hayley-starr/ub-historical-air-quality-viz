<script>
    import { onMount } from 'svelte';
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';

    export let currentFrame;
    export let pauseAnimation;
    export let startAnimation;
    export let updateCurrentFrame;

    var isUserRunning = false; // Whether or not the USER has paused the animation

    const maxScrubberWidth = 1000;// width of scrubber in px
    let handleStyler;

    //TEST!!
    const eventPosition = 50;
    const eventFadeBuffer = 10;
    let eventStyler;


    let eventKeyFramesExpand =  keyframes({
        values: [ 
            { scale: 1 },
            { scale: 2 }
        ],
        times: [0, 1],
        duration: 300,
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

    //END_TEST!!

    $: {
       handleStyler && handleStyler.set('x', currentFrame);
       if (currentFrame == eventPosition-eventFadeBuffer) {
           highlightEvent();
       }

       if (currentFrame == eventPosition + eventFadeBuffer*2) {
           reduceEvent();
       }
    }

    const highlightEvent = () => {
        eventKeyFramesExpand.start(style => {
            eventStyler.set(style);
        });
    }

    const reduceEvent = () => {
        eventKeyFramesContract.start(style => {
            eventStyler.set(style);
        });
    }

    onMount(async () => {
        const event = document.querySelector('.event');
        eventStyler = styler(event);


        const handle = document.querySelector('.handle-hit-area');
        handleStyler = styler(handle);
        const handleX = value(0, (newX) => {
            updateCurrentFrame(newX);
        });
    
        // const range = document.querySelector('.range');

        const pointerX = (x) => pointer({ x }).pipe(xy => xy.x, transform.clamp(0, maxScrubberWidth));

        const startDrag = () => {
            pauseAnimation();
            pointerX(currentFrame).start(handleX);
        };
    
        const stopDrag = () => {
            handleX.stop();
            updateCurrentFrame(handleStyler.get('x'));
            isUserRunning && startAnimation();
        };

        listen(handle, 'mousedown touchstart').start(startDrag);
        listen(document, 'mouseup touchend').start(stopDrag);
    });

    const handlePauseAnimation = () => {
        isUserRunning = false;
        pauseAnimation();
    }

    const handleStartAnimation = () => {
        isUserRunning = true;
        startAnimation();
    }

</script> 


<div class="scrubber">

    <div class='scrubber-controls'>
        <button on:click={handleStartAnimation}>Start</button>
        <button on:click={handlePauseAnimation}>Pause</button>
    </div>

    <div class="slider">
        <div class="range"></div>

        <div class="handle-container">
            <div class="handle-hit-area">
                <div class="handle"></div>
            </div>
        </div>

        <div class="event-container">
            <div class="event-hit-area">
                <div class="event"></div>
            </div>
        </div>
    </div>
</div>

<style>
      .scrubber {
        border: 5px solid blue;
        display: flex;
        flex-direction: row;
    }

    .scrubber-controls {
        width: 10%;
    }
    
    
    .slider {
        width: 85%;
        height: 100px;
        position: relative;
    }

    .range {
        border-radius: 3px;
        height: 6px;
        background: lightgray;
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
    }

    .handle-container {
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translateY(-50%) translateX(-50%);
    }

    .handle-hit-area {
        padding: 30px;
        width: 5px;
        height: 40px;
    }

    .handle {
        background: red;
        width: 5px; 
        height: 40px;
        cursor: pointer;
    }

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


</style>

