<script lang="ts">
  import { projectAdded } from '../state/actions';

  let projectName = '';

  function submit() {
    if (projectName.length === 0) {
      return;
    }

    projectAdded(projectName);

    projectName = '';
  }
</script>

<h2>Create project</h2>
Project name:<input type="text" bind:value={projectName} />
<button on:click={submit}>Add</button>
