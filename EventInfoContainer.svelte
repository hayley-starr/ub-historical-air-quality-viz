<script>
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';


    export let policyEvents;
    export let appState;
    export let updateAppState;
    export let translator;
    export let currLang;
    export let startAnimation;

    const handleCloseEvent = () => {
         updateAppState({currEventId: undefined});
         if (appState.isUserRunning) {
             startAnimation();
         }
    }


</script>

<div class='event-info-container'>
    {#if appState.currEventId != undefined}
    <EventInfoBox 
        eventDetails={policyEvents[appState.currEventId]}
        translator={translator}
        currLang={currLang} 
        handleCloseEvent={handleCloseEvent}
        isUserRunning={appState.isUserRunning}
    />
    {/if}
</div>

<style>

.event-info-container {
}

</style>