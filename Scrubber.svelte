<script>
    import { onMount } from 'svelte';
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import PolicyEvent from './PolicyEvent.svelte';

    export let currentFrame;
    export let pauseAnimation;
    export let startAnimation;
    export let updateCurrentFrame;

    var isUserRunning = false; // Whether or not the USER has paused the animation

    const maxScrubberWidth = 1000;// width of scrubber in px
    let handleStyler;

    $: {
       handleStyler && handleStyler.set('x', currentFrame);
    }



    onMount(async () => {
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

        <PolicyEvent currentFrame={currentFrame} position={30}/>
        <PolicyEvent currentFrame={currentFrame} position={130}/>
        <PolicyEvent currentFrame={currentFrame} position={310}/>
        
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

</style>

