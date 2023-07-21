
export const runGraphQL = async (params) => {
  const graphQLUrl = params.siteURL + "graphql";

  const payload = JSON.stringify({
    query: params.query,
    variables: params.inputPayload,
  });

  var apiNonce = localStorage.getItem('apiNonce');
  const queryOptions = {
    method: "POST",
    //headers: { "Content-Type": "application/json" , "X-WP-Nonce": apiNonce},
    headers: { "Content-Type": "application/json"},
    body: payload,
  };

  let response = await fetch(graphQLUrl, queryOptions);
  const formObj = await response.json();
  //let formData = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_form);
  let formData;
  // if (params.queryName == "getAllPollsReq") {
  //   formData = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_form);
  // }
  // else if (params.queryName == "getSinglePollReq") {
  //   formData = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_form);
  // } 
  
  if (params.queryName == "getSinglePoll") {
    formData = {}
    if(formObj.data.pmEventsPollForm.pm_event_poll_form)
    formData.pollFormData = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_form);

    if(formObj.data.pmEventsPollForm.pm_event_poll_user_summary_res)
    formData.pollResults = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_user_summary_res);
  }
  else if (params.queryName == "getLivePlayersListReq") {
    var playersLength = formObj.data.players.nodes.length;
    var storeLiverPlayers = [];
    for (let i = 0; i < playersLength; i++) {
      var streamType =
        formObj.data.players.nodes[i].player_settings
          .sessionDetailsSessionStreamType;
      if (streamType == "live") {
        storeLiverPlayers.push(formObj.data.players.nodes[i]);
      }
    }

    formData = storeLiverPlayers;
  }
  else if (params.queryName == "getSelectedPlayerPollListReq") {
    const pollList = JSON.parse(formObj.data.pmEventsPollListOfPollForSelectedPlayers.pm_event_poll_list_for_selected_players);      
    formData = pollList;        
  }
  else if (params.queryName == "createNewPoll") {    
    formData = formObj.data.createNewEventPollMutation;    
  }
  else if (params.queryName == "startPoll") {
    formData = formObj.data.startPollMutation;
  }
  else if (params.queryName == "stopPoll") {
    formData = formObj.data.stopPollMutation;
  }
  else if(params.queryName == "updatePoll")
  {
    formData = formObj.data.updateEventPollMutation;
  }
  else if(params.queryName == "getPollResult")
  {
    formData = JSON.parse(formObj.data.pmEventsPollFormResult.pm_event_poll_form_result);
  }
  else if(params.queryName == "createLink" || params.queryName == "updateLink")
  {
    formData = formObj.data.createNewExternalLinkMutation;
  }
  else if(params.queryName == "updateSettings")
  {
    formData = formObj.data.updateEventPollSettingsMutation;
  }
  else if(params.queryName == "getPollSettings")
  {
    formData = JSON.parse(formObj.data.pmEventsPollFormSettings.pm_event_poll_form_settings);
  }
  else if(params.queryName == "deletePoll")
  {
    formData = formObj.data.deleteAndRestorePollMutation;
  }
  else if(params.queryName == "duplicatePoll")
  {
    formData = formObj.data.duplicatePollMutation;
  }
  else if(params.queryName == "delAndStoreRes")
  {
    formData = formObj.data.delAndStoreResMutation.status;    
  }
  else {
    formData = JSON.parse(formObj.data.pmEventsPollForm.pm_event_poll_form);
  }
  return formData;
}



export const handleImageUpload = (
  blobInfo,
  success,
  failure,
  progress,
  imageUploadUrl
) => {
  var xhr, formData;
  xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.open("POST", imageUploadUrl + "wp-admin/admin-ajax.php");

  xhr.upload.onprogress = function (e) {
    progress((e.loaded / e.total) * 100);
  };

  xhr.onload = function () {
    var json;

    if (xhr.status === 403) {
      failure("HTTP Error: " + xhr.status, { remove: true });
      return;
    }

    if (xhr.status < 200 || xhr.status >= 300) {
      failure("HTTP Error: " + xhr.status);
      return;
    }

    json = JSON.parse(xhr.responseText);

    if (json.success && json.data.img_url != "") {
      success(json.data.img_url);
    } else {
      failure(json.data.msg);
      return;
    }
  };

  xhr.onerror = function () {
    failure(
      "Image upload failed due to a XHR Transport error. Code: " + xhr.status
    );
  };

  formData = new FormData();
  formData.append("file", blobInfo.blob(), blobInfo.filename());
  formData.append("action", "handleImageUpload");

  xhr.send(formData);
};


export const isValidUrl = (str) => {

  //verify url should always start with http or https
  var includeHttp = str.includes("http://");
  var includeHttps = str.includes("https://");
  
  if(includeHttp || includeHttps){
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }else{
    return false;
  }
  
}