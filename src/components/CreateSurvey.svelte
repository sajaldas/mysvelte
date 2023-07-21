<script>
import { createEventDispatcher } from 'svelte'

import { createLink } from "../graphql/queries";
import { runGraphQL, isValidUrl } from "../graphql/helpers";
import { onMount } from 'svelte'

export let siteURL
export let playerId

const dispatch = createEventDispatcher()
let surveyTitle=''
let surveyUrl=''
let isValid = true
let isLoading = false
let checkIsValidurl = true;
let surveyTitleFoucus;

onMount(() => surveyTitleFoucus.focus())  

const validateFields = () => {
    if(surveyTitle.trim() == '' || surveyUrl.trim() == '')
    isValid = false
    else
    isValid = true

    if(!isValid) 
    isLoading = false

    return isValid
}

const handleCreateSurvey = async () => {
    isLoading = true
    surveyUrl = surveyUrl.trim();
    surveyTitle = surveyTitle.trim();

    //check fields should not be empty
    if(!validateFields()) return
    
    //check url should be in format
    checkIsValidurl = isValidUrl(surveyUrl);
    if(!checkIsValidurl){
        isLoading = false;
        return;
    }

    let inputPayload = {
        "input": {
            "playerId": playerId,
            "mutationType": "createNewExternalLink",
            "externalLinkUrl": encodeURI(surveyUrl),
            "externalLinkTitle": surveyTitle
        }
    }

    let resp = await runGraphQL({ siteURL, "query": createLink, "inputPayload": inputPayload, "queryName": "createLink"})
    isLoading = false

    if(parseInt(resp.map_id) > 0)
    {
        surveyTitle = ''
        surveyUrl = ''
        dispatch('linkCreated', resp)
    }
}
</script>

<div class="new-survey">
    <div class="poll-form">
        <h2>Add External Link</h2>
        <div class="form-row">
            <label for="form_title_pop_up">Title <em>*</em></label>
            <input type="text" bind:this={surveyTitleFoucus} bind:value={surveyTitle} id="form_title_pop_up" class={(!isValid && surveyTitle == '') ? 'err' : ''} autocomplete="off" />
        </div>
        <div class="form-row">
            <label for="form_url_pop_up">URL <em>*</em></label>
            <input type="text" bind:value={surveyUrl} id="form_url_pop_up" class={(!isValid && surveyUrl == '') || !checkIsValidurl ? 'err' : ''} autocomplete="off" />     
        </div>
        <div class="form-row">
            <button id="save-form" class={isLoading ? 'black-btn' : 'white_btn'} disabled={isLoading} on:click={handleCreateSurvey}>Save</button>
            {#if !isValid}
                <span class="err_msg">Please fill all required fields!</span>
            {:else if  !checkIsValidurl}
                <span class="err_msg">Please enter valid url!!</span>
            {/if}
        </div>
    </div>
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
    .form-row input[type="text"]{
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