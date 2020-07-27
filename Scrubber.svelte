<script>
    import { onMount } from 'svelte';
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import PolicyEvent from './PolicyEvent.svelte';
    import moment from 'moment';

    export let frameData;
    export let currentTime;
    export let maxTime;
    export let pauseAnimation;
    export let startAnimation;
    export let updateCurrentTime;
    export let isAnimationEnded;

    const EVENT_BUFFER_TIME = 0.5; // how much time in seconds before and after to start showing an event

    var isUserRunning = false; // Whether or not the USER has paused the animation
    let isDragging = false; // is the user dragging the scrubber
    let sliderWidth = 0;
    let maxScrubberWidth = 1000;// width of scrubber in px
    let handleStyler;

    $: maxScrubberWidth = sliderWidth;
    


    $: { // continuoslu check currentTime for where to place the scrubber handle
        handleStyler && handleStyler.set('x', convertTimeToXPosition(currentTime));
    }

    $: {
        if (isAnimationEnded) {
            isUserRunning = false;
        }
    }

    const convertTimeToXPosition =  (time) => {
        return time * maxScrubberWidth / maxTime;
    }

    const convertXPositionToTime = (xPos) => {      
        return !maxScrubberWidth ? 0 : xPos * maxTime / maxScrubberWidth;
    }

    onMount(async () => {
        const slider = document.getElementById("slider");
        sliderWidth = slider.getBoundingClientRect().width;
        const handle = document.querySelector('.handle-hit-area');
        handleStyler = styler(handle);
        const handleX = value(0, (newX) => {
            updateCurrentTime(convertXPositionToTime(newX));
        });
    
        // const range = document.querySelector('.range');

        const pointerX = (x) => pointer({ x }).pipe(xy => xy.x, transform.clamp(0, maxScrubberWidth));

        const startDrag = () => {
            isDragging = true;
            pauseAnimation();
            pointerX(convertTimeToXPosition(currentTime)).start(handleX);
        };
    
        const stopDrag = () => {
            if (!isDragging) return;
            handleX.stop();
            // convert from poistion to time
            updateCurrentTime(convertXPositionToTime(handleStyler.get('x')));
            isUserRunning && startAnimation();
            isDragging = false;
        };

        listen(handle, 'mousedown touchstart').start(startDrag);
        listen(document, 'mouseup touchend').start(stopDrag);
        document.addEventListener('keyup', event => {
            if (event.code === 'Space') {
                isUserRunning ? handlePauseAnimation() : handleStartAnimation();
            }
        });

    });

    const handlePauseAnimation = () => {
        isUserRunning = false;
        pauseAnimation();
    }

    const handleStartAnimation = () => {
        isUserRunning = true;
        startAnimation();
    }

    let startDate = moment(frameData[0].date);
    let endDate = moment(frameData[frameData.length-1].date);
    let totalDays = endDate-startDate;

    const getPolicyEventPosition = (policyDate) => {
        let policyDays = moment(policyDate)-startDate;
        return policyDays/totalDays;
    }

    const policyEvents = [
        {
            date: '2019-03-21',
            title: 'Government Bans Raw Coal',
            text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.',
            source: 'https://breathemongolia.org/',
            imgSource: './banRawCoal.jpg'
        },
        {
            date: '2019-06-29',
            title: 'Government Bans Raw Coal',
            text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.',
            source: 'https://breathemongolia.org/',
            imgSource: './banRawCoal.jpg'
        },
        {
            date: '2019-11-30',
            title: 'Government Bans Raw Coal',
            text: 'The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.',
            source: 'https://breathemongolia.org/',
            imgSource: './banRawCoal.jpg'
        }
    ]
</script> 


<div class="scrubber">
    <div class="slider" id="slider">
        <div class="range"></div>

        <div class="handle-container">
            <div class="handle-hit-area">
                <div class="handle"></div>
            </div>
        </div>

        {#each policyEvents as policyEvent, i}
            <PolicyEvent 
                currentScrubberPosition={convertTimeToXPosition(currentTime)} 
                eventPosition={Math.round(sliderWidth * getPolicyEventPosition(policyEvent.date))}
                eventDetails={policyEvent}
                bufferRadius={EVENT_BUFFER_TIME * maxScrubberWidth / maxTime}
                id={i}
            />
    
        {/each}
        
    </div>
    <div class='scrubber-controls'>
        <div class='control-button-container'>
            {#if isUserRunning} 
            <button class='pause-button play-button' on:click={handlePauseAnimation}>
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 135">
                    <defs>
                        <style>
                        .cls-pause-1 {
                            stroke: #000;
                            stroke-miterlimit: 10;
                        }
                        </style>
                    </defs>
                    <g id="Layer_2" data-name="Layer 2">
                        <g id="Layer_1-2" data-name="Layer 1-2">
                        <path class="cls-pause-1" d="M10.5.5h0a10,10,0,0,1,10,10v114a10,10,0,0,1-10,10h0a10,10,0,0,1-10-10V10.5A10,10,0,0,1,10.5.5Z"/>
                        <path class="cls-pause-1" d="M60.5.5h0a10,10,0,0,1,10,10v114a10,10,0,0,1-10,10h0a10,10,0,0,1-10-10V10.5A10,10,0,0,1,60.5.5Z"/>
                        </g>
                    </g>
                </svg>
            </button>
            {:else}
            <button class='start-button play-button' on:click={handleStartAnimation}>
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 113.57 127.1">
                    <defs>
                        <style>
                        .cls-play-1 {
                            stroke: #000;
                            fill: #000;
                            stroke-miterlimit: 10;
                        }
                        </style>
                    </defs>
                    <g id="Layer_2" data-name="Layer 2">
                        <g id="Layer_1-2" data-name="Layer 1-2">
                        <path class="cls-play-1" d="M106.78,74.45,19.36,124.92A12.57,12.57,0,0,1,.5,114V13.09A12.57,12.57,0,0,1,19.36,2.2l87.42,50.48a12.57,12.57,0,0,1,0,21.77Z" transform="translate(0 -0.01)"/>
                        </g>
                    </g>
                </svg>
            </button>
            {/if}
            <div class='speed-buttons-container'>
                <button class='speed-button'>{'0.5x'}</button>
                <button class='speed-button'>{'1x'}</button>
                <button class='speed-button'>{'1.5x'}</button>
            </div>
         </div>
         <div class='current-time-display'>
            {'0:55'}
         </div>
    </div>
</div>

<style>
    .scrubber {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* CONTROLS SECTION */
    .scrubber-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        /* border: 2px solid blue; */
    }

    .control-button-container {
        display: flex;
        height: 100%;
        align-items: center;
        /* border: 1px solid green; */
    }

    .speed-buttons-container {
        display: flex;
        width: auto;
        justify-content: space-between;
    }

    .speed-button {
        width: 45px;
        margin-right: 5px;
        
        background-color: #47B3F2;
        color: white;
        border-radius: 15px;

        border: none;
        height: 20px;
    }

    .current-time-display {

    }

    .play-button svg {
        height: 20px;
    }

    /* CONTROL BUTTON STYLING */
    .play-button {
        border: none;
        background: none;
        cursor: pointer;
        height: 100%;
        width: 30px;
        margin-right: 10px;
    }

    .play-button:hover {
        transform: scale(1.1);
    }

    .play-button:focus {
        outline: none;
    }

    .play-button:active {
        outline: none;
        transform: scale(1.3);
    }
    
    
     /* SLIDER SECTION */
    .slider {
        height: 80px;
        position: relative;
        /* border: 1px solid orange; */
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

