<script>
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()
export let imgURL = ""
export let siteURL = ""
export let pollId = ""
export let playerTitle = ""
export let downloadResNonce = ""
export let pollTitle = ""
export let resultsData = []
export let pollType

let isLoading = false

const handleReloadResult = () => {
    isLoading = true;
    setTimeout(() => {
        isLoading = false
    }, 2000);

    dispatch('pollResult');
}

const downloadResponse = () =>{
    var downloadResUrl = siteURL+'wp-admin/admin-post.php?action=wp_pm_event_polls_download_responses&noheader=true&_wpnonce='+downloadResNonce+'&player_name='+playerTitle+'&poll_name='+pollTitle+'&poll_id='+pollId;
    window.open(downloadResUrl,'_blank');    
}
</script>

{#if pollType == 'poll'}
<div class="poll-results {(isLoading) ? 'loading' : ''}">
    <div class="result-head">
        Responses
        <span>            
            <img src={imgURL + "reload.png"}  alt="reload" on:click={handleReloadResult} />            
        </span>
    </div>
    <div class="result-grid">
        {#if resultsData.length}
        {#each resultsData as data}
        <div class="result-item">{data.label}</div>
        <div class="result-item">{data.count}</div>
        <div class="result-item">{data.percent}%</div>
        {/each}
        {:else}
        <div class="result-item">no results found!</div>
        {/if}
    </div>
    <div class="result-down">
        <button class={!resultsData.length ? 'grey-btn' : 'black-btn'} 
        on:click="{downloadResponse}" disabled="{!resultsData.length ? true : false}">Download Responses</button>
    </div>    
</div>
{/if}

<style>
.poll-results{
    padding:12px 8px;
}
.poll-results.loading{cursor: wait;}
.result-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}
.result-head img {
    max-width: 36px;
    cursor: pointer;
}
.result-grid {
    display: grid;
    grid-template-columns: 70% 15% 15%;
    margin-bottom: 20px;
}
.result-item {
    line-height: 25px;
    margin-bottom: 5px;
}
.result-down {
    text-align: center;
}
</style>