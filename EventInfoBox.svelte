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
        <div class='policy-event-text'>
            <span>{eventDetails.text}</span>
        </div>
    </div>
    <div class='policy-event-source'>
        <a href={eventDetails.source}>Source</a>
    </div>
</div>

<style>
    .policy-info-box {
        border: 1px solid sandybrown;
        height: 200px;
        width: 300px;
        background: white;
        border-radius: 4px;
        padding: 5px;
        font-family: 'Trebuchet MS';
        display: flex;
        flex-direction: column;
        align-content: space-between;
    }

    .policy-info-top {
        border: 1px solid purple;
    }

    .policy-event-date {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 3px;
    }

    .policy-event-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .policy-event-text {
        font-size: 11px;
    }

    .policy-event-source {
        font-size: 11px;
        font-style: italic;
        color: #47B3F2;
        cursor: pointer;
        flex-grow: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        border: 1px solid red;
    }

    .policy-event-source a {
        text-align: end;
    }


</style>