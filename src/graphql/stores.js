import { writable } from 'svelte/store';

export const storePlayerId = writable(0);
export const storeShowPollEdit = writable(false);
export const storeFormTitle = writable('title');
export const storeFormDesc = writable('Desc');
export const storeSaveForm = writable(false);
export const pollRes = writable('res');



