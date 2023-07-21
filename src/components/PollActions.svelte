<script>
	
import { createEventDispatcher } from 'svelte'
const dispatch = createEventDispatcher();

export let pollType;
export let startPoll = false;
export let playerId;
export let siteURL;
export let pollId;
export let adminEmail;
export let adminFirstName;
export let adminLastName;
export let surveyData
export let hasResults = false
export let disPollBtn = false
export let disExtBtn = false
let showResult = false;

$: strPlayerId = playerId.toString();

const pmEventPollRts = (command, params, playerid) => {
                
    if(command == 'showPage'){
        rt.send({ name: command, params: {url : params}, groups : [playerid] });                     
    }else{
        rt.send({ name: command, params: params, groups : [playerid] });   
    }                
}

const handlePreviewPoll = () =>{
    let pollUrl = siteURL+'formviews/?formid='+pollId;  
    pollUrl += '&email='+adminEmail;    
    pollUrl += '&fn='+adminFirstName;    
    pollUrl += '&ln='+adminLastName; 
    pollUrl += '&preview=1';     
    window.open(pollUrl,'_blank');
}

//poll RTS
const handleStartPoll = async () => {
    dispatch('startPoll');                
    setTimeout(
      function(){             
        startPoll = true;       
        let pollUrl = siteURL+'formviews/?formid='+pollId;        
        pmEventPollRts('showPage',pollUrl,strPlayerId);    
    }, 1000);            
}

const handleStopPoll = async () => {
    startPoll = false
    pmEventPollRts('hidePage','',strPlayerId);                    
    dispatch('stopPoll');
}

const handleSendResults = () => {    
    //check if hasResuls is true then pass pollUlrs to sendResults
    if(hasResults){
        showResult = true;
        let pollUrl = siteURL+'resultview/?is_resultview_page=1&formid='+pollId;            
        pmEventPollRts('showPage',pollUrl,strPlayerId);    
    }        
    dispatch('pollShowResult', {status : hasResults});  
}

const handleHideResults = () => {
    if(showResult){
        showResult = false;        
        pmEventPollRts('hidePage','',strPlayerId);     
        dispatch('pollHideResult');
    }    
}

//external link RTS
const handleShowPage = () => {        
    pmEventPollRts('showPage',surveyData.url,strPlayerId);   
    dispatch('externalLinkShowPage');
}

const handleHidePage = () => {
    pmEventPollRts('hidePage','',strPlayerId);    
    dispatch('externalLinkHidePage');                
}
</script>

<div class="poll-actions">
    {#if pollType == 'poll'}
    <div class="action-row1"><button disabled={disPollBtn} class="black-btn {disPollBtn ? 'dis-btn': ''}" on:click={handlePreviewPoll}>Preview Poll</button></div>
    {/if}
    <div class="action-row2">
        {#if pollType == 'poll'}
        <div class="g1">
            <button disabled={disPollBtn} class="{disPollBtn ? 'dis-btn': ''}" on:click={handleStartPoll}>Start Poll</button>
            <button  disabled={disPollBtn} class="{disPollBtn ? 'dis-btn': ''}" on:click={handleStopPoll}>Stop Poll</button>
        </div>
        <div class="g2">
            <button disabled={disPollBtn} class="{disPollBtn ? 'dis-btn': ''}" on:click={handleSendResults}>Send Results</button>
            <button disabled={disPollBtn} class="{disPollBtn ? 'dis-btn': ''}" on:click={handleHideResults}>Hide Results</button>
        </div>
        {:else}
        <div class="g1">
            <button disabled={disExtBtn} class="{disExtBtn ? 'dis-btn': ''}" on:click={handleShowPage}>Show Page</button>
            <button disabled={disExtBtn} class="{disExtBtn ? 'dis-btn': ''}" on:click={handleHidePage}>Hide Page</button>
        </div>
        {/if}
    </div>
</div>


<style>
.poll-actions{
    padding: 20px 0;
    border-bottom: 1px solid #aaa;
}
.poll-actions .action-row1 {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}
.action-row2 .g1, .action-row2 .g2 {
    display: flex;
    flex: 1;
    justify-content: space-evenly;
    margin-bottom: 20px;
}
.action-row2 button{
    min-width: 142px;
}

.dis-btn {
    border: 1px solid #aaa !important;
    padding: 10px 30px !important;
    border-radius: 4px !important;
    background: #fff !important;
    color: #aaa !important;    
    cursor: not-allowed !important;
}
</style>