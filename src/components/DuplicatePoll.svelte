<script>
  import { createEventDispatcher } from 'svelte'
  import { duplicatePoll, duplicateURL } from "../graphql/queries";
  import { runGraphQL } from "../graphql/helpers";

  export let siteURL
  export let livePlayersList
  export let playerId
  export let selectedItem
  export let showModal

  const dispatch = createEventDispatcher()
  let selectedPlayer

  const handleDuplicateClick = async () => {
    let itemType = selectedItem.entry_type
    let selectedPollItemId = (itemType == 'poll') ? selectedItem.poll_id : selectedItem.map_id
    let queryType = (itemType == 'poll') ? duplicatePoll : duplicateURL

    let inputPayload = {
        "input": {
          "mutationType": itemType,                
          "desPlayerId": selectedPlayer,
          "pollIdOrMapId": selectedPollItemId
        }
    }

    let resp = await runGraphQL({ siteURL, "query": queryType, "inputPayload": inputPayload, "queryName": "duplicatePoll"})

    if(resp.map_id)
    {
      if(selectedPlayer == playerId)
      {
        dispatch('duplicateSuccess', selectedPlayer)
        setTimeout(function(){                 
          showModal = false;
        }, 2000);
      }
      else
      {
        dispatch('duplicateSuccess', selectedPlayer)
        showModal = false;
      }      
    }
  }
</script>

<div class="duplicate-poll">
  <div class="poll-form">
    <h2>Copy Poll</h2>
    <div class="form-row">
      <label for="form_title">Select Player <em>*</em></label>
      <select class="player-list" bind:value={selectedPlayer}>
        {#each livePlayersList as player}          
        <option value="{player.playerId}" selected={(player.playerId == playerId) ? true : false}>{player.title}</option>
        {/each}
      </select>
    </div>
    <div class="form-row">
      <label for="form_title" >Copy <strong>"{(selectedItem) ? selectedItem.title : ''}"</strong> to above player</label>
    </div>
    <div class="form-row">
      <button id="save-form" class="white_btn" on:click={handleDuplicateClick}>Save</button>
    </div>
  </div>
</div>
