 <script>
    import { dateTempFrames } from './dateTempFrames.js';
    import moment from 'moment';

    export let currentFrame;

    let currentDate;

    $: currentDate = moment(dateTempFrames[currentFrame].date);

 </script>

 <span class='animation-date'>
    {#if currentDate}
        {currentDate.format('YYYY-MM-DD')}
    {/if}
 </span>
  
