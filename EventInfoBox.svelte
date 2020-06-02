<script>

export let eventDetails;
export let classname;

</script>

<div class={classname+' event-info-box'}>
        <span>{eventDetails.date}</span>
        <span>{eventDetails.title}</span>
        <span>{eventDetails.text}</span>
</div>

<style>
    .event-info-box {
        border: 1px solid sandybrown;
        height: 200px;
        width: 300px;
        background: white;
        border-radius: 4px;
    }
</style>