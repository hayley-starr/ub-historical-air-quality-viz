<script>

export let eventDetails;

</script>

<div class='policy-info-box'>
    <div class='policy-event-date'>
        <span>{eventDetails.date}</span>
    </div>
    <div class='policy-info-top'>
        
         <div class='policy-event-title'>
            <span>{eventDetails.title}</span>
        </div>
        {#if eventDetails.type != 'ap season'}
        <div class='policy-event-photo'>
            <img src={eventDetails.imgSource} alt={''}>
        </div>
        {/if}
    </div>
    {#if eventDetails.type != 'ap season'}
    <div class='policy-info-bottom'>
        <div class='policy-event-text'>
            <span>{eventDetails.text}</span>
        </div>
        <div class='policy-event-source'>
            <a href={eventDetails.source} target="_blank">Source</a>
        </div>
    </div>
    {/if}
   
     
</div>

<style>
    .policy-info-box {
        border: 1px solid #2B2D42;
        font-family: 'Open Sans', sans-serif;
        color: #2B2D42;
        max-height: 400px;
        width: 200px;
        background: white;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-content: space-between;
    }

    .policy-info-top {
        padding: 5px 10px;
    }

    .policy-event-date {
        font-size: 12px;
        font-weight: bold;
        background-color: #2B2D42;
        color: white;
        padding: 5px 10px
    }

    .policy-event-title {
        font-size: 16px;
        font-weight: lighter;
        margin-bottom: 5px;
    }

    .policy-event-text {
        font-size: 11px;
    }

    .policy-event-photo {
        display: flex;
        justify-content: center;
        margin: 5px 0;
    }

    .policy-event-photo img {
        max-width: 100%;
        max-height: 100%;
        padding: 5px;
    }

    .policy-info-bottom {
        border-color: #2B2D42;
        padding: 5px;
    }

    .policy-event-source {
        font-size: 11px;
        font-style: italic;
        cursor: pointer;
        flex-grow: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .policy-event-source a {
        text-align: end;
    }


</style>