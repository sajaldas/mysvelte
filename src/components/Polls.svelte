<script>
  import { createEventDispatcher } from 'svelte'
  import Modal from "./Modal.svelte"
  import DuplicatePoll from "./DuplicatePoll.svelte"
  import { deletePoll } from "../graphql/queries";
  import { runGraphQL } from "../graphql/helpers";

  export let livePlayersList;
  export let siteURL;
  export let playerId;
  export let pollList = [];
  export let selected = 0;

  let showModal = false
  let selectedItem
  //let itemType

  const dispatch = createEventDispatcher()

  const handlePollClicked = (item) => {    
    dispatch('pollClicked', {
      "mapId": item.map_id,
      "type": item.entry_type,
      "pollId": item.poll_id,
      "pollOrder": item.poll_order
    });
  }

  const handleDelete = async (item) => {
    let isDel = confirm("Are you sure ?");

    if(isDel)
    {
      let inputPayload = {
        "input": {
            "mutationType": "delete",
            "player_id": playerId,
            "map_id": item.map_id            
        }
      }
      
      let resp = await runGraphQL({ siteURL, "query": deletePoll, "inputPayload": inputPayload, "queryName": "deletePoll"})
      // console.log('resp = ', resp)             
      dispatch('deletePoll', {"mapId": item.map_id});
    }
  }

  const handleOpenDuplicatePopup = (item) => {
    showModal = true
    selectedItem = item
  }

  const onHandleModalStateChange = () => {
    showModal = !showModal;
  }

</script>

<div class="polls-list">
    <ul>
      {#if pollList.length}
      {#each pollList as item (item.map_id)}        
          <li class="{item.map_id == selected ? 'active' : ''}">
            <span class="poll-name" on:click={handlePollClicked(item)}>{item.title}</span>
            <span class="poll-btns">
              <i class="fa fa-files-o" aria-hidden="true" on:click={handleOpenDuplicatePopup(item)}></i>
              <i class="fa fa-trash-o" aria-hidden="true" on:click={handleDelete(item)}></i>
            </span>
          </li>                        
      {/each}       
      {:else}
      <li>No polls found!</li>
      {/if}
    </ul>

    <Modal modalId="modal2" {showModal} on:handleModalStateChange={onHandleModalStateChange}>
      <DuplicatePoll {siteURL} {livePlayersList} {playerId} {selectedItem} on:duplicateSuccess bind:showModal />
    </Modal>
</div>
