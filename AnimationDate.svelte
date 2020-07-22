 <script>
    import { dateTempFrames } from './dateTempFrames.js';
    import moment from 'moment';

    export let currentFrame;

    let currentDate;

    $: currentDate = moment(dateTempFrames[currentFrame].date);

 </script>

 <span>
    {#if currentDate}
        Week of: {currentDate.format('YYYY-MM-DD')}
    {/if}
 </span>
  
