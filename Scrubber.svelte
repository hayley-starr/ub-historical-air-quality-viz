<script>
    import { onMount } from 'svelte';
    import { styler, value, pointer, listen, transform, easing, keyframes } from 'popmotion';
    import PolicyEvent from './PolicyEvent.svelte';
    import moment from 'moment';
    import { classnames } from './classnames.js';
    import { select, selectAll } from 'd3-selection';
    import { scaleLinear } from 'd3-scale';
    import { axisBottom, axisRight } from 'd3-axis';
    import { line } from 'd3-shape';
    import { max } from 'd3-array';
    import { watchResize } from "svelte-watch-resize";


    export let frameData;
    export let frameDataMonthIndices;
    export let policyEvents;
    export let currentTime;
    export let maxTime;
    export let pauseAnimation;
    export let startAnimation;
    export let updateCurrentTime;
    export let isAnimationEnded;
    export let changePlaybackRate;
    export let translator;
    export let currLang;
    export let updateAppState;
    export let appState;

    const EVENT_BUFFER_TIME = 0.1; // how much time in seconds before and after to start showing an event

    let isDragging = false; // is the user dragging the scrubber
    let sliderWidth = 0;
    let chartHeight = 0;
    let maxScrubberWidth = 1000;// width of scrubber in px
    let handleStyler;
    let currPlayRate = 1;

    $: {
        maxScrubberWidth = sliderWidth;
        addPm25TimeseriesChart(currLang); // when the sliderwidth has been updated
    }


    $: { // continuoslu check currentTime for where to place the scrubber handle
        handleStyler && handleStyler.set({'x': convertTimeToXPosition(currentTime),
        'y': -60});
    }

    $: {
        if (isAnimationEnded) {
            updateAppState({isUserRunning: false});
        }
    }

    function handleResize(node) {
        sliderWidth = node.clientWidth;
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
        chartHeight = document.getElementById("pm25-timeseries").getBoundingClientRect().height;
        const handle = document.querySelector('.handle-hit-area');
        handleStyler = styler(handle);
        const handleX = value(0, (newX) => {
            updateCurrentTime(convertXPositionToTime(newX));
        });
    
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
            appState.isUserRunning && startAnimation();
            isDragging = false;
        };

        listen(handle, 'mousedown touchstart').start(startDrag);
        listen(document, 'mouseup touchend').start(stopDrag);
        document.addEventListener('keyup', event => {
            if (event.code === 'Space') {
                appState.isUserRunning ? handlePauseAnimation() : handleStartAnimation();
            }
        });
    });

    const handlePauseAnimation = () => {
        updateAppState({isUserRunning: false});
        pauseAnimation();
    }

    const handleStartAnimation = () => {
        updateAppState({isUserRunning: true});
        startAnimation();
    }

    const handlePolicyPause = () => {
        if (appState.isUserRunning) pauseAnimation();
    }

    const handlePolicyStart = () => {
         if (appState.isUserRunning) startAnimation();
    }

    const handleUpdateAnimationPosition = (policyEventPosition, eventId) => {
        updateCurrentTime(convertXPositionToTime(policyEventPosition));
    }

    const handleChangePlaybackRate = (playRate) => {
        currPlayRate = playRate;
        changePlaybackRate(playRate);
    }

    let startDate = moment(frameData[0].date);
    let endDate = moment(frameData[frameData.length-1].date);
    let totalDays = endDate-startDate;

    const getPolicyEventPosition = (policyDate) => {
        let policyDays = moment(policyDate)-startDate;
        return policyDays/totalDays;
    }

    const addPm25TimeseriesChart = (currLang) => {

        // clean slate for rerender
        let svg_old = select("#pm25-timeseries");
        svg_old.selectAll('*').remove();

        let margin = {top: 10, right: 0, bottom: 10, left: 0},
            width = maxScrubberWidth - margin.left - margin.right, // CHANGE WIDTH TO WIDTH OF SCRUBBER
            height = chartHeight - margin.top - margin.bottom;
        
        let inner_width  = width - margin.left - margin.right;

        
        let svg = select("#pm25-timeseries")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("overflow-x", "overlay")
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        //---- Add X axis ----------------
        var xAxisScale = scaleLinear()
            .domain([0, frameData.length-1]) // length of the timeseries, exclude first
            .range([ 0, width ]);

        let xAxis = axisBottom(xAxisScale)
            .tickValues(frameDataMonthIndices.slice(1))
            .tickFormat(x => {
                return translator.translate(moment(frameData[x].date).format("MMMM"), currLang) + moment(frameData[x].date).format(" 'YY");
            })
            .tickSizeOuter(0);    

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


        //---- Add Y axis ----------------
        // 1. create scale
        let yAxisScale = scaleLinear()
            .domain(
                [0, max(frameData.map(function(frame) {return frame.pm25}))]
            )
            .range([ height, 0]);
        // 2. format
        let yAxis = axisRight(yAxisScale)
            .ticks(3)
            .tickValues([55,150,250])
            .tickFormat( y => y + ' μg/m3')
            .tickSizeOuter(0);  

        //---- Add Y axis gridlines
        let yAxisGrid = axisRight(yAxisScale)
            .tickSize(inner_width)
            .tickFormat('')
            .ticks(3)
            .tickValues([55,150,250])
            .tickSizeOuter(0);


        svg.append("g")
        .attr('class', 'y-axis-grid')
        .style("stroke-dasharray", "3 3")
        .style('opacity', '0.15')
        .call(yAxisGrid); 
    

        //----- Add the line -----------
        svg.append("path")
            .datum(frameData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line()
                .x(function(frame) { return xAxisScale(frameData.indexOf(frame)) })
                .y(function(frame) { return yAxisScale(frame.pm25) })
            );

        //---- Add ticks on top of the line ----
        svg.append("g")
         .call(yAxis);
    }

    const displayTime = (timeNow, timeTotal) => {
        const duration = moment.duration(timeNow, 'seconds');
        const formatted = moment.utc(duration.asMilliseconds()).format("m:ss");
        return formatted;
    }
</script> 


<div class="scrubber">
    <div class='pm25-chart-title'>{translator.translate('pm25_mov_avg_title', currLang)}</div>

      <div class='scrollable-scrubber-container'>
        <div class='pm25-chart' id='pm25-timeseries'></div>
        <div class="slider" id="slider" use:watchResize={handleResize}>
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
                    pauseAnimation={handlePolicyPause} 
                    startAnimation={handlePolicyStart} 
                    updateAppState={updateAppState}
                    appState={appState}
                    updateAnimationPosition={handleUpdateAnimationPosition}
                />
        
            {/each}
            
        </div>
      </div>
    

    <div class='scrubber-controls'>
        <div class='control-button-container'>
            {#if appState.isUserRunning} 
            <button class='pause-button play-button' on:click={handlePauseAnimation}>
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 71 135">
                    <defs>
                        <style>
                        .cls-pause-1 {
                            stroke: steelblue;
                            fill: steelblue;
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
                            fill: steelblue;
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
                <button class={classnames('speed-button', currPlayRate == 0.5 ? 'speed-button-selected' : '')} on:click={() => handleChangePlaybackRate(0.5)}>{'0.5x'}</button>
                <button class={classnames('speed-button', currPlayRate == 1 ? 'speed-button-selected' : '')} on:click={() => handleChangePlaybackRate(1)}>{'1x'}</button>
                <button class={classnames('speed-button', currPlayRate == 2 ? 'speed-button-selected' : '')} on:click={() => handleChangePlaybackRate(2)}>{'2x'}</button>
            </div>
         </div>
         <div class='current-time-display'>
            {`${displayTime(currentTime)} / ${displayTime(maxTime)}`}
         </div>
    </div>
</div>

<style>
    .scrubber {
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        margin-top: 5px;
    }

    .pm25-chart-title {
        position: absolute;
        top: 10px;
        left: 20%;
        font-size: 10px;
        font-weight: 100;
        text-align: -webkit-center;
    }

    .pm25-chart {
        height: 100px;
    }


    /* CONTROLS SECTION */
    .scrubber-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
    }

    .control-button-container {
        display: flex;
        height: 100%;
        align-items: center;
        color: steelblue;
    }

    .speed-buttons-container {
        display: flex;
        width: auto;
        justify-content: space-between;
    }

    .speed-button {
        width: 45px;
        margin-right: 5px;
        
        background: none;
        color: white;
        border-radius: 4px;

        border: 1px solid steelblue; /*#47B3F2;*/
        height: 20px;
        cursor: pointer;

    }

    .speed-button-selected {
        background-color: steelblue;
        border: 1px solid steelblue;
    }

    .speed-button:focus {
        outline: none;
    }

    .speed-button:active {
        outline: none;
        transform: scale(1.1);
    }

    .speed-button:hover {
        transform: scale(1.1);
    }

    .current-time-display {
        font-size: 15px;
        font-weight: lighter;
        padding: 0 10px;
    }

    .play-button svg {
        height: 25px;
    }

    /* CONTROL BUTTON STYLING */
    .play-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        height: 30px;
        width: 45px;
        margin-right: 10px;
    }

    .play-button:hover {
        transform: scale(1.1);
        /* border: 1px solid steelblue;
        border-radius: 4px; */
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
        height: 40px;
        margin-top: 25px;
        margin-bottom: 5px;
        position: relative;
    }

    @media screen and (max-width:800px) {
        .slider {
            width: 800px;
        }

        .scrollable-scrubber-container {
            overflow-x: scroll;
            overflow-y: hidden;
             -webkit-overflow-scrolling: touch;
            padding: 0 5px;
        }
    }

    .range {
        border-radius: 2px;
        height: 4px;
        background: black;
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
        padding: 5px 20px;
        width: 5px;
        height: 155px;
        cursor: pointer;
        transform: translateY(-60px);
    }

    .handle {
        background: red;
        width: 5px;
        opacity: 0.6;
        bottom: 0;
        height: 155px;
        cursor: pointer;
    }

</style>

