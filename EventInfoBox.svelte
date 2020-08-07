<script>

  import Icon from 'fa-svelte'
  import { faSnowflake } from '@fortawesome/free-solid-svg-icons/faSnowflake';
  import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
  import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
  import { faNewspaper } from '@fortawesome/free-solid-svg-icons/faNewspaper';
  import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
  import { classnames } from './classnames';

export let eventDetails;
export let translator;
export let currLang;
export let handleCloseEvent;

let eventIcon = faBook;
let iconClass = 'icon-book';
let eventDateText = '';

$: {
    switch (eventDetails.type) {
        case 'policy':
            eventIcon = faBook
            iconClass = 'icon-book';
            break;
        case 'ap_season_end':
            eventIcon = faSun;
            iconClass = 'icon-sun';
            break;
        case 'ap_season_start':
            eventIcon = faSnowflake;
            iconClass = 'icon-snowflake';
            break;
        case 'news':
            eventIcon = faNewspaper;
            iconClass = 'icon-newspaper';
            break;
        default:
            eventIcon = faBook;
            iconClass = 'icon-book';
    }
}

</script>

<div class='event-info-box'>
    <div class={classnames('event-date', iconClass)}>
        <div class='event-date-left'>
            <Icon icon={eventIcon}></Icon>
        <span class='event-date-text'>{translator.translateDate(eventDetails.date, currLang)}</span>
        </div>
        <div class='event-date-right' on:click={handleCloseEvent}>
            <Icon icon={faTimes}></Icon>
        </div>
    </div>
    <div class='event-info-scrollable'>
        <div class='event-info-top'>
            <div class='event-title'>
                <span>{translator.translate(eventDetails.title, currLang)}</span>
            </div>
            {#if !eventDetails.type.startsWith('ap_season')}
            <div class='event-photo'>
                <img src={eventDetails.imgSource} alt={''}>
            </div>
            {/if}
        </div>
        {#if !eventDetails.type.startsWith('ap_season')}
        <div class='event-info-bottom'>
            <div class='event-text'>
                <span>{eventDetails.text}</span>
            </div>
            <div class='event-source'>
                <a href={eventDetails.source} target="_blank">Source</a>
            </div>
        </div>
        {/if}
    </div>
</div>

<style>
    .event-info-box {
        border: 1px solid #2B2D42;
        box-shadow: 2px 2px 2px grey;
        font-family: 'Open Sans', sans-serif;
        color: #2B2D42;
        max-height: 350px;
        width: 250px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-content: space-between;
    }

    .event-info-scrollable {
        overflow-y: scroll;
        max-height: 350px;
        width: 100%;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        background: white;
        display: flex;
        flex-direction: column;
        align-content: space-between;
    }

    .event-info-scrollable::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    .event-info-scrollable {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }

    .event-info-top {
        padding: 5px 10px;
    }

    .event-date {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        font-weight: bold;
        background-color: #2B2D42;
        padding: 5px 10px;
    }

    .event-date-left {
        display: flex;
        align-items: center;
    }

    .event-date-right {
        color: white;
        cursor: pointer;
    }

    .event-date-text {
        padding-left: 5px;
        color: white;
    }

    .icon-book {
        color: #c9c9c9;
    }

    .icon-sun {
        color: #e3a005;
    }

    .icon-snowflake {
        color: steelblue;
    }

    .icon-newspaper {
        color: #c9c9c9;
    }

    .event-title {
        font-size: 16px;
        font-weight: lighter;
        margin-bottom: 5px;
    }

    .event-text {
        font-size: 11px;
    }

    .event-photo {
        display: flex;
        justify-content: center;
        margin: 5px 0;
    }

    .event-photo img {
        max-width: 100%;
        max-height: 100%;
        padding: 5px;
    }

    .event-info-bottom {
        border-color: #2B2D42;
        padding: 5px;
    }

    .event-source {
        font-size: 11px;
        font-style: italic;
        cursor: pointer;
        flex-grow: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .event-source a {
        text-align: end;
    }


</style>