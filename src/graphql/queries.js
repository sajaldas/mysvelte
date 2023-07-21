
export const getSinglePoll = `
query polls($id: Int $player_id: Int $poll_type: String) {
	pmEventsPollForm(id: $id player_id: $player_id poll_type: $poll_type) {
		pm_event_poll_form
		pm_event_poll_user_summary_res
	}
}
`
export const getLivePlayersList = `query players {
	players(where: {orderby: {field: DATE, order: DESC}}, first: 10000) {
		nodes {
			playerId
			title
			player_settings{
				sessionDetailsSessionStreamType
			}
		}
	}
}`

export const getPlayerPolls = `query pmEventsPollListOfPollForSelectedPlayers($playerId: Int) {
	pmEventsPollListOfPollForSelectedPlayers(playerId: $playerId) {
		pm_event_poll_list_for_selected_players                                                                                
	}
}`

export const getPollResult = `query getPollResults($id: Int) {
	pmEventsPollFormResult(id: $id) {
		pm_event_poll_form_result                                                                                
	}
}`

export const createNewPoll = `mutation ($input: CreateNewEventPollMutationInput!) {
	createNewEventPollMutation(input: $input) { status poll_order map_id poll_id }
}`

export const updatePoll = `mutation ($input: UpdateEventPollMutationInput!) {
    updateEventPollMutation(input: $input) { status }
}`

export const startPoll = `mutation ($input: StartPollMutationInput!) {
    startPollMutation(input: $input) { status }
}`

export const stopPoll = `mutation ($input: StopPollMutationInput!) {
    stopPollMutation(input: $input) { status, response }
}`

export const createLink = `mutation ($input: CreateNewExternalLinkMutationInput!) {
	createNewExternalLinkMutation(input: $input) { urlTitle url map_id poll_order status }
}`

export const updateLink = `mutation ($input: CreateNewExternalLinkMutationInput!) {
	createNewExternalLinkMutation(input: $input) { urlTitle url map_id status }
}`

export const updateSettings = `mutation ($input: UpdateEventPollSettingsMutationInput!) {
	updateEventPollSettingsMutation(input: $input) { status pollId }
}`

export const getPollSettings = `query pmEventsPollFormSettings($id: Int) {
    pmEventsPollFormSettings(id: $id) {
        pm_event_poll_form_settings
    }
}`

export const deletePoll = `mutation ($input: DeleteAndRestorePollMutationInput!) {
	deleteAndRestorePollMutation(input: $input) { status }
}`;

export const duplicatePoll = `mutation ($input: DuplicatePollMutationInput!) {
	duplicatePollMutation(input: $input) { status poll_order map_id poll_id}
}`;

export const duplicateURL = `mutation ($input: DuplicatePollMutationInput!) {
	duplicatePollMutation(input: $input) { status urlTitle url poll_order map_id }
}`;

export const delAndStoreRes = `mutation ($input: DelAndStoreResMutationInput!) {
    delAndStoreResMutation(input: $input) { status }
}`