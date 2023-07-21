<script>
import { onMount } from "svelte";
import { createEventDispatcher } from 'svelte'

import SliderButton from './SliderButton.svelte'

import { updateSettings, getPollSettings } from "../graphql/queries"
import { runGraphQL } from "../graphql/helpers"

export let siteURL
export let pollId
export let pollTitle
export let showSettings = false

const dispatch = createEventDispatcher()

let pollTemplate = 'default_template'
let pollBgColor = '#002e64'
let pollTextColor = '#ffffff'
let pollCustomStyle = ''
let resultTemplate = 'default_template'
let chartType = 'vertical'
let chartDisplayType = 'percentage' 
let showUserResp = false
let showCorrResp = false
let acceptRespStop = false
let resultCustomStyle=''
let pollStatus = 'active';
let pollPagePreviewUrl = '';
let resultPagePreviewUrl = '';
let previewPollPage;    
let previewResultPage;    
let pollSettings

const loadPollSettings = async () => {
    let inputPayload = {
        "id": pollId,
    }

    try {
        pollSettings = await runGraphQL({siteURL, "query": getPollSettings, "inputPayload": inputPayload, "queryName": "getPollSettings"})    

        //console.log('pollSettings = ', pollSettings)
        if(pollSettings.pp_poll_template)    
        transformData(pollSettings)    
    } catch (error) {
        console.log(error)
    }
}

const handleSaveSettings = async () => {
    let settingsData = {
        "pp_poll_template": pollTemplate,
        "pp_background_color": encodeURIComponent(pollBgColor),
        "pp_text_color": encodeURIComponent(pollTextColor),
        "pp_custom_styles": encodeURIComponent(pollCustomStyle),
        "rp_poll_template": resultTemplate,
        "rp_custom_styles": encodeURIComponent(resultCustomStyle),        
        "rp_chart_type": chartType,
        "rp_show_perc_or_counts": chartDisplayType,
        "rp_highlight_user_res": (+showUserResp),
        "rp_highlight_correct_res": (+showCorrResp),
        "rp_show_leaderboard": "0",
        "pa_poll_start_time": '',
        "pa_poll_end_time": '',
        "pa_stop_accept_res": (+acceptRespStop),
        "pa_accept_annoy_resp": "0",
        "pa_poll_status": pollStatus,
    }

    let inputPayload = {
        "input": {
            "mutationType": "updateEventPollSettings",
            "formId": pollId,
            "form": JSON.stringify(settingsData)
        }
    }    

    let resp = await runGraphQL({ siteURL, "query": updateSettings, "inputPayload": inputPayload, "queryName": "updateSettings"})
    //console.log('resp = ', resp)
    //if(resp.pollId)    
    dispatch('pollSetSucMesg');
}

const handleBackToPoll = () => {
    //setToDefault()
    dispatch('backToPoll')
}

const transformData = (data) => {    
    pollTemplate = data.pp_poll_template
    if(data.pp_background_color != '')
    pollBgColor = data.pp_background_color
    if(data.pp_text_color != '')
    pollTextColor = data.pp_text_color
    pollCustomStyle = data.pp_custom_styles
    resultTemplate = data.rp_poll_template
    chartType = data.rp_chart_type
    chartDisplayType = data.rp_show_perc_or_counts
    showUserResp = parseInt(data.rp_highlight_user_res)
    showCorrResp = parseInt(data.rp_highlight_correct_res)
    resultCustomStyle = data.rp_custom_styles
    acceptRespStop = parseInt(data.pa_stop_accept_res)
    pollStatus = data.pa_poll_status;
}

const setToDefault = () => {
    pollTemplate = 'default_template'
    pollBgColor = '#3f52de'
    pollTextColor = '#ffffff'
    resultTemplate = 'default_template'
    chartType = 'vertical'
    chartDisplayType = 'percentage' 
    showUserResp=false
    showCorrResp=false
    acceptRespStop=true
    resultCustomStyle=''
}

const previewPP = () =>
{
    if(pollId > 0)
    {
        if(pollPagePreviewUrl == ''){
            pollPagePreviewUrl = siteURL+'formviews/?formid='+pollId+'&template='+pollTemplate+'&bgcolor='+encodeURIComponent(pollBgColor)+'&textcolor='+encodeURIComponent(pollTextColor)+'&custstyle='+encodeURIComponent(pollCustomStyle)+'&preview=1';
            previewPollPage = window.open(pollPagePreviewUrl, '_blank');
        }else{
            pollPagePreviewUrl = siteURL+'formviews/?formid='+pollId+'&template='+pollTemplate+'&bgcolor='+encodeURIComponent(pollBgColor)+'&textcolor='+encodeURIComponent(pollTextColor)+'&custstyle='+encodeURIComponent(pollCustomStyle)+'&preview=1';
            previewPollPage.close();
            previewPollPage = window.open(pollPagePreviewUrl, '_blank');          
        }
    }
    else
    {
        alert('Please save the poll first.')
    }
} 

const previewRP = () =>{    
    if(pollId > 0)
    {
        if(resultPagePreviewUrl == ''){
            resultPagePreviewUrl = siteURL+'resultview/?formid='+pollId+'&template='+resultTemplate+'&bgcolor='+encodeURIComponent(pollBgColor)+'&textcolor='+encodeURIComponent(pollTextColor)+'&custstyle='+encodeURIComponent(resultCustomStyle)+'&charttype='+chartType+'&chartdisplay='+chartDisplayType+'&userresp='+showUserResp+'&corrresp='+showCorrResp+'&preview=1&email=abc@gmail.com';
            previewResultPage = window.open(resultPagePreviewUrl, '_blank');
        }else{
            resultPagePreviewUrl = siteURL+'resultview/?formid='+pollId+'&template='+resultTemplate+'&bgcolor='+encodeURIComponent(pollBgColor)+'&textcolor='+encodeURIComponent(pollTextColor)+'&custstyle='+encodeURIComponent(resultCustomStyle)+'&charttype='+chartType+'&chartdisplay='+chartDisplayType+'&userresp='+showUserResp+'&corrresp='+showCorrResp+'&preview=1&email=abc@gmail.com';
            previewResultPage.close();
            previewResultPage = window.open(resultPagePreviewUrl, '_blank');          
        } 
    }  
    else
    {
        alert('Please save the poll first.')
    }
} 

$: (showSettings) ? loadPollSettings() : setToDefault();
</script>

<div class="poll-settings {!showSettings ? 'hide' : ''}">
    <div class="setting-head">
        <i class="fa fa-arrow-circle-o-left back-arror" aria-hidden="true" on:click={handleBackToPoll}></i>
        <h3>Settings - {pollTitle}</h3>
    </div>
    <div class="setting-list">
        <h5>Poll Template</h5>
        <ul class="space-left">
            <li>
                <label for="poll_template">Choose template</label>
                <div class="display-block">
                    <select id="poll_template" bind:value={pollTemplate}>
                        <option value="default_template">Template 1</option>
                        <option value="default_template_2">Template 2</option>
                    </select>                                        
                    <span class="preview"><p on:click="{previewPP}" >Preview</p></span>
                </div>
            </li>
            <li>
                <label for="bg_color">Background color</label>
                <input type="color" class="cpicker" id="bg_color" bind:value={pollBgColor} />
            </li>
            <li>
                <label for="text_color">Text color</label>
                <input type="color" class="cpicker" id="text_color" bind:value={pollTextColor} />
            </li>
            <li>
                <label for="poll_custom_style">Custom Styles</label>
                <textarea id="poll_custom_style" rows="4" cols="10" bind:value={pollCustomStyle}></textarea>
            </li>
        </ul>
        <h5>Results Template</h5>
        <ul class="space-left">
            <li>
                <label for="result_template">Choose Template</label>
                <div class="display-block">
                    <select id="result_template" bind:value={resultTemplate}>
                        <option value="default_template">Template 1</option>
                        <option value="default_template_2">Template 2</option>
                    </select>
                    <span class="preview"><p on:click="{previewRP}" >Preview</p></span>
                </div>
            </li>
            <li>
                <label for="chart_type">Chart Type</label>
                <select id="chart_type" bind:value={chartType}>
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="doughnut">Doughnut</option>
                    <option value="pie">Pie</option>
                    <option value="polar_area">Polar Area</option>
                </select>
            </li>
            <li>
                <label for="chart_disp_type">Chart Display Type</label>
                <select id="chart_disp_type" bind:value={chartDisplayType}>
                    <option value="percentage">Percentage</option>
                    <option value="counts">Counts</option>
                    <option value="both">Both</option>
                </select>
            </li>
            <li>
                <label for="high_user_resp">Highlight User Response</label>
                <SliderButton fieldId="high_user_resp" bind:isChecked={showUserResp} />
            </li>
            <li>
                <label for="high_corr_resp">Highlight Correct Response</label>
                <SliderButton fieldId="high_corr_resp" bind:isChecked={showCorrResp} />
            </li>
            <li>
                <label for="accept_resp_stop">Stop accepting responses after poll is stopped</label>
                <SliderButton fieldId="accept_resp_stop" bind:isChecked={acceptRespStop} />
            </li>
            <li>
                <label for="custom_style">Custom Styles</label>
                <textarea id="custom_style" rows="4" cols="10" bind:value={resultCustomStyle}></textarea>
            </li>
        </ul>
        <div class="setting-actions">
            <button class="white-btn" on:click={handleSaveSettings}>Save Changes</button> &nbsp;
            <button class="white-btn" on:click={handleBackToPoll}>Cancel</button>
        </div>
    </div>
</div>

<style>
.setting-head {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.setting-head .back-arror {
    font-size: 22px !important;
    cursor: pointer;
}
.setting-head h3 {
    padding-left: 10px;
    margin: 0;
}
.setting-list {
    padding-bottom: 30px;
}
.setting-list ul {
    padding: 0;
    margin: 0px;
}
.setting-list ul.space-left
{
    margin: 0 0 0 10px !important;
}
.setting-list ul li {
    list-style: none;
    margin-bottom: 12px
}
.setting-list h5 {
    margin: 0px;
    font-weight: bold;
    font-size: 17px;
    padding: 10px 0;
}
.setting-list li label {
    display: inline-block;
    padding-bottom: 8px;
    font-size: 14px;
    font-weight: bold;
    width: auto !important;
}
.setting-list select {
    padding: 4px 6px;
    border: 1px solid #aaa;
    border-radius: 5px;
    width: 150px;
    display: block;
}
.setting-list .preview{
    padding-left:10px;
}
.setting-list .display-block{
    display:block;
}
.display-block select {
    display: inline-block !important;
}
.setting-list input.cpicker {
    width: 70px;
    border: 1px solid #aaa;
    border-radius: 5px;
    display: block;
}
.setting-list textarea{
    display: block;
    width: 95%;
    height: 130px;
    border: 1px solid #aaa;
    border-radius: 5px;
}
.setting-actions {
    margin: 30px 0 0 10px;
}

.preview p{
    display: inline;
    color: blue;
    text-decoration: underline;
    cursor: pointer;
}

.preview p:hover{
    color: rgb(81, 81, 190);
}
</style>