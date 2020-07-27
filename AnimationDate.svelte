 <script>
    import moment from 'moment';

    export let currentFrame;
    export let frameData;

    let currentDate;

    $: {
       currentDate = moment(frameData[currentFrame].date);
    }

 </script>

 <span class='animation-date'>
    {#if currentDate}
        {currentDate.format('YYYY-MM-DD')}
    {/if}
 </span>
  
