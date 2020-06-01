<script>
    import { onMount } from 'svelte';
    import { styler, value, pointer, listen, transform, easing } from 'popmotion';

    export let currentFrame;
    export let pauseAnimation;
    export let startAnimation;

    const maxScrubberWidth = 300;// width of scrubber in px
    let handleStyler;

    $: {
       handleStyler && handleStyler.set('x', currentFrame);
    }

    onMount(async () => {
        const handle = document.querySelector('.handle-hit-area');
        handleStyler = styler(handle);
        const handleX = value(0, (newX) => {
            handleStyler.set('x', newX);
        });
    
        // const range = document.querySelector('.range');

        const pointerX = (x) => pointer({ x }).pipe(xy => xy.x, transform.clamp(0, maxScrubberWidth));

        let pointerTracker;

        const startDrag = () => {
            pauseAnimation();
            pointerX(handleX.get()).start(handleX);
        };
    
        const stopDrag = () => {
            handleX.stop();
            //currentFrame = handleStyler.get('x');
           startAnimation();
        };

        listen(handle, 'mousedown touchstart').start(startDrag);
        listen(document, 'mouseup touchend').start(stopDrag);
    });

</script> 


<div class="scrubber">
    <div class='scrubber-controls'>
        <button on:click={startAnimation}>Start</button>
        <button on:click={pauseAnimation}>Pause</button>
    </div>
    <div class="slider">
        <div class="range"></div>
        <div class="handle-container">
            <div class="handle-hit-area">
            <div class="handle"></div>
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
        width: 20 + (30 * 2);
        height: 30 + (30 * 2);
        top: 50%;
        left: 0%;
        transform: translateY(-50%) translateX(-50%);
    }

    .handle-hit-area {
        padding: 30px;
        width: 20px;
        height: 20px;
    }

    .handle {
        background: red;
        border-radius: 50%;
        width: 20px; 
        height: 20px;
        cursor: pointer;
    }


</style>

