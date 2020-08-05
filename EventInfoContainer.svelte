<script>
    import { onMount } from 'svelte';
    import EventInfoBox from './EventInfoBox.svelte';


    export let policyEvents;
    export let appState;


</script>

<div class='event-info-container'>
    {#if appState.currEventId != undefined}
        <EventInfoBox eventDetails={policyEvents[appState.currEventId]} />
    {/if}
</div>

<style>

.event-info-container {
    transition: all 2s;
    opacity: 0.85;
}

</style>