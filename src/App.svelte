<script>
  import { onMount } from "svelte";

  import Polls from "./components/Polls.svelte";
  import TextEditor from "./components/TextEditor.svelte";
  import LivePlayers from "./components/LivePlayers.svelte";
  import Modal from "./components/Modal.svelte"
  import CreatePoll from "./components/CreatePoll.svelte"
  import CreateSurvey from "./components/CreateSurvey.svelte"
  import PollQuestion from "./components/PollQuestion.svelte"
  import PollActions from "./components/PollActions.svelte"
  import PollResults from "./components/PollResults.svelte"
  import PollSettings from "./components/PollSettings.svelte"
  import { runGraphQL, isValidUrl } from "./graphql/helpers";
  import { getSinglePoll, getLivePlayersList, getPlayerPolls, updatePoll, updateLink, stopPoll, startPoll, getPollResult, delAndStoreRes} from "./graphql/queries";

  export let siteURL = "";
  export let imgURL = "";
  export let downloadResNonce = "";

  export let adminEmail = "";
  export let adminFirstName = "";
  export let adminLastName = "";
  let disPollBtn = false
  let disExtBtn = false
  
  let playerId = 0;
  let playerTitle;
  let isPlayerSelected = false;
  let isCreatePoll = false;
  let isCreateSurvey = false;
  let selectedPollType = 'poll'
  let removeDummyIframe;
  let removeDummyIframeForce;
  let clearIframeTimeOut = false;
  let successMessageStatus = false;
  let successMessage = '';
  let pollId=0
  let pollOrder=0
  let mapId=0
  let pollIdOrMapId = 0;
  let pollList = [];
  let livePlayersList = [];  
  let showModal = false;
  let isLoading = false
  let showSettings = false
  const params = {"siteURL" : siteURL}
  let errorMessage = false;
  let deleteOldResponses = {status:false, click: false };
  let externalLinkError = false;
  let showPollArea = true
  let showLinkArea = false
  let exterUrl = 'exterUrl';
  let exterTitle = 'exterTitle';
  //validation variables
  let pollValidationErro = {pollTitle: false, pollQuesLabel: false, pollRes: false}
  let checkIsValidUrl = true;
  
  let questionData = {
    "questionLabel": 'my Question title',
    "questionText": '',
    "allowMultiple": false,
    "optionList": {}
  }
  let pollTitle = ''
  let pollContent = ''
  let resultsData = []
  let surveyData = {
    map_id:0,
    title: '',
    url: '',
  }
  
  $: handlePlayerChange(playerId)

  //removing poll error message for new player
  const removeValidationErrors = () =>{
    pollValidationErro.pollTitle = false;
    pollValidationErro.pollQuesLabel = false;
    pollValidationErro.pollRes = false;
    checkIsValidUrl = true;
    errorMessage = false;
    exterTitle = 'exterTitle';
    exterUrl = 'exterUrl';
    disPollBtn = false
    disExtBtn = false
  }

  onMount(async () => {
    try {
      livePlayersList = await runGraphQL({...params, "query": getLivePlayersList, "queryName": "getLivePlayersListReq"})     
    } catch (error) {
      console.log(error)
    }    
  });

  const transformData = (data) => {
    pollId = data.id
    pollTitle = data.title
    pollContent = data.fields[0].content
    clearIframeTimeOut = !clearIframeTimeOut;
    
    //fixing editor bug
    const removeElements = (elms) => elms.forEach(el => el.remove());      
    var beforeAppend = pollContent;
    pollContent = '<p class="dummy-element" style="display:none">Hello</p>' + pollContent;      
    
    if(selectedPollType == 'poll')
    {
      removeDummyIframe = setTimeout(() => {

        var iframe = document.querySelector('iframe[id="poll_desc_ifr"]');                                          
        if( iframe != null && beforeAppend != ''){          
          iframe =  iframe.contentWindow;  
          removeElements( iframe.document.querySelectorAll("body .dummy-element") );
        }else{
          //forcing to show content in editor 
          pollContent = '<p class="dummy-element" style="display:none">Hello</p>' + pollContent;
          removeDummyIframeForce = setTimeout(() => {
            var iframe = document.querySelector('iframe[id="poll_desc_ifr"]');                        
            if( iframe != null && beforeAppend != ''){              
              iframe =  iframe.contentWindow;                                  
              removeElements( iframe.document.querySelectorAll("body .dummy-element") );
            }            
          }, 500);   
        }                
      }, 500);   
    } 

    let optionList = data.fields[1].content.map((item) => {        
      var weight = isNaN(item.gquizWeight) || item.gquizWeight ==  null ?  0 : item.gquizWeight;
      var label = item.text.trim();
      
      if(label.length == 0){
         //disable poll action buttons
          pollValidationErro.pollRes = true;
          disPollBtn = true;
      }

      let newItem = {
          "id": item.value,
          "label": label,
          "text": label,
          "isCorrect": item.gquizIsCorrect,
          "weight": weight
        }
      return newItem;
    })

    questionData = {
      "questionLabel": '',
      "questionText": data.fields[1].label.trim(),
      "allowMultiple": (data.fields[1].inputType == 'checkbox') ? true : false,
      "optionList": optionList
    }
  }

  const handleSinglePollClick = async (item) => {
    showSettings = false
    pollId = item.detail.pollId
    pollOrder = item.detail.pollOrder;
    mapId = item.detail.mapId;
    var entryType = item.detail.type;
    selectedPollType = entryType

    if(entryType == 'poll'){      
      pollIdOrMapId = pollId;
    }else{
      pollIdOrMapId = mapId;      
    }

    if(pollIdOrMapId)
    {
      clearSelectedPollData()
      getSinglePollData(pollIdOrMapId, entryType)
    }

    if(selectedPollType == 'url' && clearIframeTimeOut){
      clearTimeout(removeDummyIframe);
      clearTimeout(removeDummyIframeForce);         
      clearIframeTimeOut = !clearIframeTimeOut;         
    }    
  }

  const getSinglePollData = async (pollIdOrMapId, entryType) => {    
    removeValidationErrors();
    if(pollIdOrMapId <= 0) return
    const pollMixedData = await runGraphQL({...params, "query": getSinglePoll, "inputPayload": { id: pollIdOrMapId, player_id: playerId, poll_type: entryType }, "queryName": "getSinglePoll"})        
    if(entryType == 'url')
    {
      showPollArea = false
      showLinkArea = true

      if(pollMixedData.pollFormData)
      {

        
        let pollData = pollMixedData.pollFormData
        exterUrl = pollData.url;
        exterTitle = pollData.title;
        surveyData = {
          map_id:pollData.map_id,
          title: exterTitle,
          url: exterUrl,
        }

      }
    }
    else
    {
      showSettings = false
      showPollArea = true
      showLinkArea = false

      if(pollMixedData.pollFormData)
      {
        let pollData = pollMixedData.pollFormData        
        transformData(pollData)
      }
      
      if(pollMixedData.pollResults)
      {
        resultsData = pollMixedData.pollResults
        transformPollResults(resultsData)
      }
      else
      resultsData = []
    }
  }

  const handlePollCreated = async (e) => { 
    let newPollTitle
    pollId = e.detail.id
    pollOrder = e.detail.poll_order
    mapId = e.detail.map_id
    pollTitle = newPollTitle = e.detail.title
    selectedPollType = 'poll'
    clearSelectedPollData()
        
    const newPoll = {
      "entry_type": 'poll',
      "map_id": mapId,
      "id": pollId,
      "poll_id": pollId,
      "poll_order": pollOrder,
      "title": newPollTitle,
      "description": '',
      "fields": []
    }
    pollList = [...pollList, newPoll]    
    getSinglePollData(pollId, 'poll')
    
    showModal = false;
    isCreatePoll = false;

    //disable poll action buttons
    pollValidationErro.pollRes = true;
    disPollBtn = true;

    showSuccessMessage('Poll is created successfully!')    
  }

  const getPollList = async (pid) => {
      isLoading = true
      pollList = await runGraphQL({ siteURL, "query": getPlayerPolls, "inputPayload": {playerId: pid}, "queryName": "getSelectedPlayerPollListReq"})            
      isLoading = false
      if(pollList.length > 0){        
        pollId = parseInt(pollList[0].poll_id)        
        mapId = parseInt(pollList[0].map_id)        
        selectedPollType = pollList[0].entry_type
        if(selectedPollType == 'poll'){
          pollIdOrMapId = pollId;
        }else{
          pollIdOrMapId = mapId;
        }
        getSinglePollData(pollIdOrMapId, selectedPollType)
      }      
  }

  const updatePollResult = async () => {
    let resp = await runGraphQL({ ...params, "query": getPollResult, "inputPayload": {"id": pollId}, "queryName": "getPollResult"});
    
    if(resp){
      transformPollResults(resp);
    }

    showSuccessMessage('Poll result is updated successfully!')    
  }

  const transformPollResults = (data) => {
    if(data != null && data.responses && data.responses.length > 0)
    {
      resultsData = data.responses.map((item) => {
        return {        
          "label": item.label,
          "count": item.count,        
          "percent": item.percentage                
          }
      })
    }   
  }

  const setPlayerId = async (event) => {
    playerId = parseInt(event.detail.id)
    playerTitle = event.detail.title
    getPollList(playerId)
    isPlayerSelected = true;
  }

  const onHandleModalStateChange = (event) => {

    if(event)
    showModal = event.detail;
    else
    showModal = !showModal;

    if(!showModal)
    {
      isCreatePoll = false
      isCreateSurvey = false
    }
  }

  const transformQuestionChoices = (data) => {
    //console.log('data = ', data)  
    let flag = 0;  
    return data.map((item) => {
    //debugger;
    if(item.text.trim() == '')
    flag ++;    
   
    (flag > 0) ? pollValidationErro.pollRes = true : pollValidationErro.pollRes = false;

    var weight = isNaN(item.weight) || item.weight == null ? 0 : item.weight ;
      let choice = {
        "text": item.text.trim(),
        "value": item.text.trim(),
        "isSelected": false,
        "price": "",
        "gquizIsCorrect": item.isCorrect,
        "gquizWeight": weight
      }
      return choice
    })
  }

  const handleSaveChanges = async () => {
    
    //remove responses before updating poll if responses are exist
    if(resultsData.length){
        deleteOldResponses.click = true;
        setTimeout(
          function(){                 
            deleteOldResponses.status = false;
            deleteOldResponses.click = false;
        }, 3000);

        let inputPayload = {
          "input": {
            "formId": pollId        
          }
        }

        if(deleteOldResponses.status && deleteOldResponses.click){        
          let resp = await runGraphQL({ ...params, "query": delAndStoreRes, "inputPayload": inputPayload, "queryName": "delAndStoreRes"});
          if(resp){                       
            resultsData = [];
          }
        }
        else{    
          //not allowed to update poll if responses are exist      
          return;
        }      
    }
    

    if(selectedPollType == 'poll')
    {
      let choices = transformQuestionChoices(questionData.optionList);
      pollTitle = pollTitle.trim();
      //poll validations
      pollTitle == '' ? pollValidationErro.pollTitle = true : pollValidationErro.pollTitle = false;
      questionData.questionText.trim() == '' ? pollValidationErro.pollQuesLabel = true : pollValidationErro.pollQuesLabel = false;      

      if(pollValidationErro.pollTitle || pollValidationErro.pollQuesLabel || pollValidationErro.pollRes)
      {
        disPollBtn = true;
        return;
      }

      disPollBtn = false
      let inputPayload = {
        "input": {
          "formId": pollId,
          "quizType": (questionData.allowMultiple) ? "checkbox" : "radio",
          "formTitle": pollTitle,
          "formDesc": "",
          "htmlBlock": encodeURIComponent(pollContent),
          "quesLabel": questionData.questionText.trim(),
          "quizChoices": JSON.stringify(choices)
        }
      }
      
      let resp = await runGraphQL({ ...params, "query": updatePoll, "inputPayload": inputPayload, "queryName": "updatePoll"})
      //console.log('resp = ', resp)
      if(resp)      
      updatePollListTitle(mapId, pollTitle)
      
      showSuccessMessage('Poll is updated successfully!')    
    }
    else if(selectedPollType == 'url')
    {

      exterUrl = surveyData.url.trim();
      exterTitle = surveyData.title.trim();
      
      let inputPayload = {
        "input": {
          playerId: playerId, 
          mutationType: "updateExternalLink", 
          externalLinkUrl: exterUrl, 
          externalLinkTitle: exterTitle,   
          pollListMapId: parseInt(surveyData.map_id)
        }
      }

      

      checkIsValidUrl = isValidUrl(exterUrl);      

      //check title and url field should not be empty
      if(exterTitle.length == 0 || exterUrl.length == 0 || !checkIsValidUrl){        
        disExtBtn = true;
        return;
      }

      if(checkIsValidUrl){
        let resp = await runGraphQL({ ...params, "query": updateLink, "inputPayload": inputPayload, "queryName": "updateLink"})
        //console.log('resp = ', resp)
        if(resp.urlTitle)      
        updatePollListTitle(mapId, resp.urlTitle)
        disExtBtn = false;        
        showSuccessMessage('External link is updated successfully!')            
      }   
    }    
  }

  const handleStopPoll = async () => {  
    let inputPayload = {
      "input": {
        "formId": pollId        
      }
    }
    let resp = await runGraphQL({ ...params, "query": stopPoll, "inputPayload": inputPayload, "queryName": "stopPoll"});

    if(resp){
      transformPollResults(JSON.parse(resp.response));
      // console.log('stop resp = ',JSON.parse(resp.response));     
    }

    showSuccessMessage('Poll is stopped successfully!')         
  }


  const handleCreateNewPollSuccessMessage = () =>{

    showSuccessMessage('New poll is created successfully!')     

  }

  const handleStartPoll = async () =>{

    let inputPayload = {
      "input": {
        "formId": pollId        
      }
    }
    await runGraphQL({ ...params, "query": startPoll, "inputPayload": inputPayload, "queryName": "startPoll"});

    showSuccessMessage('Poll is started successfully!')    

  }

  const handlePollShowResult = (e) => {

    if(!e.detail.status){      
      showSuccessMessage('Result page does not have responses')    
      errorMessage =  true;
    }else{      
      showSuccessMessage('Poll result page sent successfully!')    
    }
    
  }

  const hidePollResultPage = () =>{    
    showSuccessMessage( 'Poll result page hide successfully!')    
  }

  const handleExternalLinkShowPage = () =>{
    showSuccessMessage( 'External link is showing!')       
  }

  const handleExternalLinkHidePage = () =>{
    showSuccessMessage( 'External link is hidden!')       
  }

  const handlePlayerChange = () => {
    if(playerId && !isLoading)
    {
      clearSelectedPollData()
      getPollList(playerId)
      removeValidationErrors();
      disPollBtn = true;
      disExtBtn = true;
    }
  }

  const clearSelectedPollData = () => {
    pollTitle = '';
    pollContent = ' &nbsp; ';
    questionData = {
      "questionLabel": '',
      "questionText": '',
      "allowMultiple": false,
      "optionList": {}
    }
    resultsData = []

    surveyData = {
      map_id:0,
      title: '',
      url: '',
    }
  }

  const updatePollListTitle = (id, title) => {    
    
    pollList.map((item, index) => {
      if(item.map_id == id && item.title != title.trim())
      pollList[index].title = title.trim()
    })    
  }

  const handleLinkCreated = (e) => {    
    showModal = false
    isCreateSurvey = false
    selectedPollType = 'url'
    let newLinkItem = {
      map_id: e.detail.map_id,
      entry_type: "url",
      poll_order: e.detail.poll_order,
      title: e.detail.urlTitle,
      url: e.detail.url
    }    
    pollList = [...pollList, newLinkItem]
    mapId = e.detail.map_id;        
    getSinglePollData(mapId, 'url');

    showSuccessMessage('External Link is created successfully!')           
  }

  const showPollSettings = () => {
    showSettings = true    
    showPollArea = false
    showLinkArea  = false
  }

  const handleBackToPoll = () => {
    showSettings = false   
    showPollArea = true
    showLinkArea  = false
  }

  const handlePollSetSucMesg = () =>{
    showSuccessMessage('Poll settings updated successfully!')     
  }

  const handleDeletePoll = async (item) => {
    
    var selMapId = mapId;

    //remove poll when all polls are deleted form the poll list  
    for (let i = 0; i < pollList.length; i++) {      
      if(pollList[i].map_id == item.detail.mapId){
        
        if(i+1 ==  pollList.length){
          var nextPoll = i - 1; 
        }else{
          var nextPoll = i + 1; 
        }
        
        if(selMapId == pollList[i].map_id && pollList.length > 1){
          var next_entry_type = pollList[nextPoll].entry_type
          var next_poll_id = pollList[nextPoll].poll_id
          var next_map_id = pollList[nextPoll].map_id          

          mapId = next_map_id;
          if(next_entry_type == 'poll'){
            getSinglePollData(next_poll_id, next_entry_type);
            selectedPollType = 'poll';                        
          }else{                        
            selectedPollType = 'url';
            getSinglePollData(next_map_id, next_entry_type);
          }                                        
        }

        pollList.splice(i, 1);
        pollList = pollList;        
        break;
      }    
    }

    if(pollList.length == 0){                  
      clearSelectedPollData();
      removeValidationErrors();
      disPollBtn = true;
      disExtBtn = true;      
    }    
    
    showSuccessMessage('Poll or external link deleted successfully')  
  }

  const handleDuplicateSuccess = (event) => {
    let selectedPlayer = JSON.parse(event.detail)
    if(selectedPlayer == playerId)
    {
      getPollList(playerId)
      setTimeout(function(){                 
        //showModal = false
        showSuccessMessage('Poll/External Link successfully duplicated')
      }, 2000);
    }
    else
    {
      //showModal = false
      showSuccessMessage('Poll/External Link successfully duplicated')
    }
  }

  const showSuccessMessage = (msg) => {
    successMessage = msg
    successMessageStatus = true

    setTimeout(
    function(){                 
      successMessageStatus = false
      errorMessage =  false;       //hide error message
    }, 3000)
  }

  const handleCreatePollClick = () => {
    showModal = true
    isCreatePoll=true

    if(showSettings == true)
    {
      showSettings = false
      showPollArea = true
    }
  }

  const handleCreateLinkClick = () => {
    showModal = true
    isCreateSurvey=true

    if(showSettings == true)
    {
      showSettings = false
      showPollArea = true
    }
  }

  if(pollList.length == 0){
    disPollBtn = true;
    disExtBtn = true;
  }
 
</script>

{#if !isPlayerSelected}
  <LivePlayers on:playerId={setPlayerId} {livePlayersList} />
{:else}
  <main class="event-poll">
    <section class="head-sect">
      <div class="block1">
      </div>      
      <div class="block2" data-player-id="2">
        {#if successMessageStatus}
          <div class="successMessage" class:errorMessage >{successMessage}</div>
        {/if}
        <select bind:value={playerId} class="player-list">
          {#each livePlayersList as item (item.playerId)}
          <option value={item.playerId}>{item.title}</option>
          {/each}
        </select>
      </div>      
      <div class="block3">
        <!-- <img src={imgURL + "menu_icon.png"} alt="menu" /> -->
      </div>
      <div class="clr" />
    </section>
    <section class="body-sect">
      <div class="column col1">
        <Polls on:pollClicked={handleSinglePollClick} on:deletePoll={handleDeletePoll} on:duplicateSuccess={handleDuplicateSuccess} {pollList} {playerId} {siteURL} {livePlayersList} bind:selected={mapId} />
        <div class="btn-add-poll"><button on:click={handleCreatePollClick}>Create New Poll</button></div>
        <div class="btn-add-poll"><button on:click={handleCreateLinkClick}>Add External Link</button></div>
      </div>
      <div class="column col2">
        
        <PollSettings {siteURL} {pollId} {pollTitle} {showSettings} on:pollSetSucMesg={handlePollSetSucMesg} on:backToPoll={handleBackToPoll}  />
        
        <div class="poll-area {!showPollArea ? 'hide' : ''}">
          <div class="poll-title">            
            <input type="text" class="quest {pollValidationErro.pollTitle ? 'err': ''}"  bind:value={pollTitle}>
            <span class="gear"><i class="fa fa-cog" aria-hidden="true" on:click={showPollSettings}></i>
            </span>
          </div>
          {#if pollValidationErro.pollTitle}
            <span class="errorMessage">Please enter poll title.</span>
          {/if}
          <TextEditor bind:editorData={pollContent} editorId="poll_desc" imageUploadUrl={siteURL} />
          <PollQuestion bind:questionData={questionData} bind:deleteOldResponses={deleteOldResponses} {pollValidationErro} hasResults={resultsData.length ? true : false}/>
        </div>
        
        <div class="link-area {!showLinkArea ? 'hide' : ''}">
          <div class="form-row">
            <label for="form_title">Title <em style="color:red">*</em></label>
            <input type="text" bind:value={surveyData.title} id="form_title" class="{exterTitle.length == '' ? 'err': '' }"/>                     
          </div>
          <div class="form-row">
              <label for="form_url">URL<em style="color:red">*</em></label>
              <input type="text" bind:value={surveyData.url} id="form_url" class="{(exterUrl.length == '' || !checkIsValidUrl) ? 'err': '' }"/>     
          </div>
          {#if exterTitle.length == '' || exterUrl.length == ''}
            <span class="errorMessage">Please fill all required fields!</span>
            {:else if !checkIsValidUrl}
              <span class="errorMessage">Please enter valid url!</span>            
          {/if}          
        </div>
        {#if !showSettings}
          <div class="save-poll"><button on:click={handleSaveChanges}>Save Changes</button></div>
        {/if}                  
      </div>
      <div class="column col3">
        <PollActions {surveyData} {playerId} {pollId} {disPollBtn} {disExtBtn} {params} {siteURL} {adminEmail} {adminFirstName} {adminLastName} pollType={selectedPollType} hasResults={resultsData.length ? true : false} on:stopPoll={handleStopPoll} on:startPoll={handleStartPoll} on:externalLinkShowPage={handleExternalLinkShowPage} on:externalLinkHidePage={handleExternalLinkHidePage} on:pollShowResult={handlePollShowResult} on:pollHideResult={hidePollResultPage} />
        <PollResults {imgURL} {resultsData} {siteURL} {pollId} {playerTitle} {downloadResNonce} {pollTitle} pollType={selectedPollType} on:pollResult={updatePollResult}/>
      </div>
      <div class="clr" />
    </section>
    
    <Modal modalId="modal1" {showModal} on:handleModalStateChange={onHandleModalStateChange}>
      {#if isCreatePoll}
      <CreatePoll {showModal} {siteURL} {playerId}
      on:handleModalStateChange={onHandleModalStateChange} 
      on:loadCreatedPoll = {(e) => {handlePollCreated(e)}}
      on:createNewPollSuccessMessage = {handleCreateNewPollSuccessMessage}
      />
      {/if}
      {#if isCreateSurvey}
      <CreateSurvey {siteURL} {playerId}
      on:linkCreated = {(e) => {handleLinkCreated(e)}}/>
      {/if}
    </Modal>
  </main>
{/if}

<style>
.link-area {
    margin-bottom: 30px;
}
.form-row {
    display: block;
    margin-bottom: 15px;
}
.form-row label {
    display: block;
    margin-bottom: 5px;
}
.form-row input[type="text"]{
    display: block;
    padding: 12px 10px;
    border: 1px solid #aaaaaa;
    box-sizing: border-box;
    width: 100%;
    border-radius: 5px;
}

</style>
