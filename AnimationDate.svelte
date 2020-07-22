 <script>
 
import { dateFrames } from './dateFrames.js';
import moment from 'moment';

export let currentTime;
export let maxTime;

let multiplier = 0;
let currentDate;
let maxFrame = dateFrames.length-1; 

$: multiplier = maxTime > 0 ? maxFrame / maxTime : 0;

$: currentDate = getDateFromVideoTime(currentTime);

const getDateFromVideoTime = (time) => {
    if (multiplier == 0) {
        return moment(dateFrames[0]);
    }
    let currentFrame = Math.round(multiplier * time);
    return moment(dateFrames[currentFrame]);
}

 </script>

 <span>
    {#if currentDate}
        Week of: {currentDate.format('YYYY-MM-DD')}
    {/if}
 </span>
  
