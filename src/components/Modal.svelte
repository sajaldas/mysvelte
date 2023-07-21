<script>
import { createEventDispatcher } from 'svelte'
export let modalId = "mymodal";
export let showModal = false;

const dispatch = createEventDispatcher()
const closeModal = () => {
    showModal = false
    dispatch('handleModalStateChange', showModal);
}
</script>

<div id={modalId} class={(showModal) ? 'modal show' : 'modal'}>
  <div class="modal-content">
    <span class="close" on:click={closeModal}>&times;</span>
    <slot></slot>
  </div>
</div>

<style>
.modal {
    display: none;
    position: fixed;
    z-index: 2;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
}
.modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px 30px;
    border: 1px solid #888;
    width: 450px;
    border-radius: 10px;
    box-shadow: 0 16px 80px rgb(5 17 50 / 66%);
    position: relative;
}
.close {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    position: absolute;
    right: 10px;
    top: 0;
}
.close:hover,
.close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
.show{display: block !important;}
</style>
