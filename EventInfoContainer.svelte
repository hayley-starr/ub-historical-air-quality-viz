<script>
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';


    export let policyEvents;
    export let appState;
    export let translator;
    export let currLang;


</script>

<div class='event-info-container'>
    {#if appState.currEventId != undefined}
    <EventInfoBox 
        eventDetails={policyEvents[appState.currEventId]}
        translator={translator}
        currLang={currLang} 
    />
    {/if}
</div>

<style>

.event-info-container {
    transition: all 2s;
    opacity: 0.85;
    box-shadow: 2px 2px 2px grey;
}

</style>