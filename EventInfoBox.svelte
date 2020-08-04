<script>

export let eventDetails;

</script>

<div class='policy-info-box'>
    <div class='policy-info-top'>
        <div class='policy-event-date'>
            <span>{eventDetails.date}</span>
        </div>
         <div class='policy-event-title'>
            <span>{eventDetails.title}</span>
        </div>
        <div class='policy-event-photo'>
            <img src={eventDetails.imgSource} alt={'Ban on Raw Coal'}>
        </div>
    </div>
    <div class='policy-info-bottom'>
        <div class='policy-event-text'>
            <span>{eventDetails.text}</span>
        </div>
        <div class='policy-event-source'>
            <a href={eventDetails.source} target="_blank">Source</a>
        </div>
    </div>
     
</div>

<style>
    .policy-info-box {
        border: 1px solid #2B2D42;
        color: #2B2D42;
        max-height: 400px;
        width: 300px;
        background: white;
        border-radius: 4px;
        /* font-family: 'Trebuchet MS'; */
        display: flex;
        flex-direction: column;
        align-content: space-between;
    }

    .policy-info-top {
        padding: 5px;
    }

    .policy-event-date {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 3px;
    }

    .policy-event-title {
        font-size: 16px;
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
        max-width: 250px;
        max-height: 150px;
        padding: 5px;
    }

    .policy-info-bottom {
        background: #2B2D42;
        color: white;
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