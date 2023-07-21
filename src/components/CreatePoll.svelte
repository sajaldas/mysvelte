<script>

//import { storeFormTitle, storeFormDesc, storeSaveForm } from './../graphql/stores.js';
import { createEventDispatcher } from 'svelte'
//import Modal from "./Modal.svelte"

import { createNewPoll } from "../graphql/queries";
import { runGraphQL } from "../graphql/helpers";
import { onMount } from 'svelte'

export let showModal = false
export let siteURL
export let playerId
export let pollId

const dispatch = createEventDispatcher()
let formTitle=''
let formDesc=''
let isValid = true
let isLoading = false
let pollTitle

onMount(() => pollTitle.focus())  

const params = {"siteURL" : siteURL}


const validateFields = () => {
    if(formTitle.trim() == '')
    isValid = false
    else
    isValid = true

    if(!isValid) 
    isLoading = false

    return isValid
}

const handleCreatePoll = async () => {
    isLoading = true

    if(!validateFields()) return

    let inputPayload = {
      "input": {
        "mutationType": "createNewPoll",
        "playerId": playerId,
        "formTitle": formTitle,
        "formDesc": formDesc
      }
    }

    let resp = await runGraphQL({ siteURL, "query": createNewPoll, "inputPayload": inputPayload, "queryName": "createNewPoll"})
    isLoading = false
    var formId = resp.poll_id;
    if(parseInt(formId) > 0)
    {      
      pollId = parseInt(formId)
      var poll_order = parseInt(resp.poll_order);      
      var map_id = parseInt(resp.map_id);      
      //dispatch('reloadList', playerId)
      dispatch('loadCreatedPoll', {"id": pollId, "title": formTitle, "poll_order": poll_order, "map_id": map_id})
    }
    
    // document.querySelector('#form_title').value = '';
    // document.querySelector('#form_desc').value = '';
    showModal = false;

    dispatch('handleModalStateChange', showModal);
    dispatch('createNewPollSuccessMessage');
}

const onHandleModalStateChange = () => {
    formTitle=''
    formDesc=''
    dispatch('handleModalStateChange', showModal);
  }
</script>

<div class="create-poll">
  <!-- <Modal modalId="modal1" {showModal} on:handleModalStateChange={onHandleModalStateChange}> -->
    <div class="poll-form">
      <h2>Create Poll</h2>
      <div class="form-row">
        <label for="form_title_pop_up">Form Title <em>*</em></label>
        <input type="text" bind:this={pollTitle} bind:value={formTitle} id="form_title_pop_up" class={(!isValid) ? 'err' : ''} autocomplete="off" />
      </div>
      <div class="form-row">
        <label for="form_desc_pop_up">Form Description</label>
        <textarea id="form_desc_pop_up" rows="4" bind:value={formDesc}></textarea>        
      </div>
      <div class="form-row">
        <button id="save-form" class={isLoading ? 'black-btn' : 'white_btn'} disabled={isLoading} on:click={handleCreatePoll}>Save</button>
        {#if !isValid}
        <span class="err_msg">Please fill all required fields!</span>
        {/if}
      </div>
    </div>
  <!-- </Modal> -->
</div>

<style>
.poll-form h2 {
    font-size: 20px;
    margin: 0 0 10px 0;
    font-weight: normal;
}
.poll-form .form-row {
    display: block;
    margin-bottom: 15px;
}
.form-row label {
    display: block;
    margin-bottom: 5px;
}
.form-row label em{color: #f00;}
.form-row input[type="text"], .form-row textarea {
    display: block;
    padding: 12px 10px;
    border: 1px solid #aaaaaa;
    box-sizing: border-box;
    width: 100%;
    border-radius: 5px;
}
.form-row .err_msg {
    display: inline-block;
    padding-left: 20px;
    color: #f00;
}
.form-row .err {
    border: 1px solid #f00 !important;
}
</style>