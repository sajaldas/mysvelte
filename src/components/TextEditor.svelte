<script>
  import Editor from "@tinymce/tinymce-svelte";
  import { allConfig as config } from '../config'
  import { handleImageUpload } from "../graphql/helpers";
  export let editorData = ''
  export let editorId = 'my_editor'
  export let imageUploadUrl = ''

  let conf = {
    min_width: 400,
    min_height: 300,
    plugins: ["image lists"],
    toolbar: "styleselect bold italic | alignleft aligncenter alignright alignjustify | link image",
    images_upload_url: "",
    file_picker_types: "image",
    images_file_types: "png,jpg,jpeg,svg,webp",
    images_upload_handler: function(blobInfo, success, failure, progress){handleImageUpload(blobInfo, success, failure, progress, imageUploadUrl)},
  }
</script>

<div class="editor-area">
    <Editor 
        apiKey={config.tinyApiKey}
        id={editorId}
        modelEvents="change input"
        bind:value={editorData}
        {conf}
    />
</div>