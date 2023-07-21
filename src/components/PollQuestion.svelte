<script>
    export let questionData = {}
    export let hasResults = false
    export let deleteOldResponses = {}
    export let pollValidationErro = {pollQuesLabel: false, pollRes: false}
    
    const config = {
        maxOptions: 8,
        minOptions: 2,
    };
  
    let question = {
        questionText: null,
        questionLabel: "Enter your question here",
        allowMultiple: false,
        optionList: [
            {
                id: 1,
                label: "Option A",
                text: "",
                isCorrect: false,
                weight: null,
            },
            {
                id: 2,
                label: "Option B",
                text: "",
                isCorrect: false,
                weight: null,
            },
        ],
    }

    const placeholderText = ['First Choice', 'Second Choice', 'Third Choice', 'Fourth Choice', 'Fifth Choice',
      'Sixth Choice', 'Seventh Choice', 'Eighth Choice'];

    if(questionData.questionText != '')
    question = questionData;

    $: question = questionData

    const handleAllowMultiple = (checkState) => {
        if(!checkState)
        {
            if(question.optionList.filter(item => item.isCorrect == true).length > 1)
            {
                question.optionList = question.optionList.map((item) => {
                    item.isCorrect = false 
                    return item;
                });

            }
        }
    }

    const handleIsCorrectAnswer = (id, checkState) => {
        if (!question.allowMultiple) 
        {
            question.optionList = question.optionList.map((item) => {
                item.isCorrect = item.id !== id ? false : checkState;
                return item;
            });
        } 
        else 
        {
            question.optionList = question.optionList.map((item) => {
                if (item.id == id) item.isCorrect = checkState;
                return item;
            });
        }
    }

    const addNewOption = () => {
        let optionsCount = question.optionList.length;
        const max_id = question.optionList.reduce((prev, current) =>
        prev.id > current.id ? prev.id : current.id
        );

        if (optionsCount < config.maxOptions) {
        let item = {
            id: max_id + 1,
            label: "Option " + String.fromCharCode(64 + optionsCount + 1),
            text: "",
            isCorrect: false,
            weight: 0,
        };

        question.optionList = [...question.optionList, item];
        }
    }

    const removeOption = (id) => {
        if (question.optionList.length > config.minOptions) 
        {
            question.optionList = question.optionList.filter((item) => item.id !== id)
        }
    }
</script>

<div class="poll-question">
  <div class="main-question">
    <input type="text" bind:value={question.questionText} class="main-text {pollValidationErro.pollQuesLabel ? 'err': ''}" placeholder={question.questionLabel}/>
  </div>
  {#if pollValidationErro.pollQuesLabel}
     <span class="errormessage">Please enter poll question.</span>
  {/if}
  <div class="options-box">
    <div class="op-heads">
      <div class="coll1">
        <input
          type="checkbox" id="allow_multiple" bind:checked={question.allowMultiple} on:change={(e) => {
              handleAllowMultiple(e.target.checked)
            }} />
        <label for="allow_multiple">Allow multiple responses</label>
      </div>
      <div class="coll2">Correct Answer</div>
      <div class="coll3">Weight</div>
      <div class="coll4" />
    </div>
    <ul class="options-list">
      {#if question.optionList.length }
      {#each question.optionList as item, i}
        <li>
          <div class="coll1">
            <input type="text" bind:value={item.text} class="op_text" placeholder={placeholderText[i]} />
          </div>
          <div class="coll2">
            <input type="checkbox" checked={item.isCorrect} on:change={(e) => {
                handleIsCorrectAnswer(item.id, e.target.checked)
              }}/>
          </div>
          <div class="coll3">
            <input type="number" bind:value={item.weight} class="op_weight" min="0" max="10" />
          </div>
          <div class="coll4 action">
            <span on:click={addNewOption}>&#43;</span>
            <span on:click={() => {removeOption(item.id)}}>&#215;</span>
          </div>
        </li>        
      {/each}
      {/if}
      {#if pollValidationErro.pollRes}
        <span class="errorMessage">Responses can't be saved as empty.</span>
      {/if}       
    </ul>
    {#if hasResults}
    <div>
      <br>
      <span><b>Note:</b> You have submitted responses. When saving the form, the submitted responses will be deleted. You can download responses before you click the save button.</span>    
      <br>
      <input type="checkbox" name="delete_old_responses" bind:checked={deleteOldResponses.status} id="delete_old_responses"><label for="delete_old_responses">Delete old responses.<em>*</em></label>    
      {#if deleteOldResponses.click && !deleteOldResponses.status}
        <br>
        <span class="errorMessage">Please select required field</span>
      {/if}
    </div>
    {/if}
  </div>
</div>

<style>
  .poll-question {
    margin: 30px 0;
  }
  .main-question {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }
  .main-question .main-text {
    padding: 4px 8px;
    height: 26px;
    border: 1px solid #aaa;
  }
  .op-heads {
    display: flex;
    flex-direction: row;
    font-size: 14px;
    margin-bottom: 10px;
    align-items: center;
  }
  .op-heads .coll1 label {
    cursor: pointer;
    padding-left: 5px;
  }
  .op-heads .coll2 {
    text-align: center;
  }
  .poll-question .coll1 {
    flex-basis: 60%;
    display: flex;
    align-items: center;
  }
  .poll-question .coll2 {
    flex-basis: 15%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .poll-question .coll3 {
    flex-basis: 15%;
    display: flex;
    justify-content: center;
  }
  .poll-question .coll4 {
    flex-basis: 10%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .poll-question .options-list {
    padding: 0;
    margin: 0;
  }
  .poll-question .options-list li {
    list-style: none;
    display: flex;
    flex-direction: row;
    margin-bottom: 10px !important;
  }
  .options-list .op_text {
    width: 100%;
    padding: 4px 6px;
  }
  .options-list .op_weight {
    width: 40%;
    padding: 4px 6px;
  }
  .options-list .action span {
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
  }

  em, .errormessage{
    color:red
  }

  input.op_text:focus::-webkit-input-placeholder { color:transparent; }
  input.op_text:focus:-moz-placeholder { color:transparent; } /* FF 4-18 */
  input.op_text:focus::-moz-placeholder { color:transparent; } /* FF 19+ */
  input.op_text:focus:-ms-input-placeholder { color:transparent; } /* IE 10+ */
</style>
