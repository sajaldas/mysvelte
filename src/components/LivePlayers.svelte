<script>
    import { createEventDispatcher } from 'svelte';

    export let livePlayersList = [];

    const dispatch = createEventDispatcher();
    
    const selectPlayer = () => {
        var selectedPlayer = document.querySelector('#live_players').value;    
        if(selectedPlayer == 0){            
            document.querySelector('.required-field').style.display = "block";
            setTimeout(function(){
                document.querySelector('.required-field').style.display = "none";
            }, 4000);
            return;
        }
        let selectedPlayerDetails = selectedPlayer.split('_');
        let selectedPlayerId = selectedPlayerDetails[0];
        let selectedPlayerTitle = selectedPlayerDetails[1];
                          
        dispatch("playerId", {
			id: selectedPlayerId,
            title: selectedPlayerTitle
		});        
    }
</script>
 

<main class="event-poll">
    <section class="event-screen">         
        <div class="live-players-block">
            <h1>Select Your Event</h1>
            <select name="live_players" id="live_players" required>                
                <option value="0">Select Event</option>
                {#each livePlayersList as singleLivePlayer}          
                <option value="{singleLivePlayer.playerId}_{singleLivePlayer.title}">{singleLivePlayer.title}</option>
                {/each}                                
            </select>            
            <span class="required-field" style="display:none;">This field is required.</span>
            <button class="white_btn" on:click="{selectPlayer}">Next</button>
        </div>            
    </section>
</main>  
  