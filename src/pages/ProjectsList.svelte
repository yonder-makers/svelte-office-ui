<script lang="ts">
  import { projects } from '../state/selectors';
</script>

{#each $projects as project}
  <div>{project.id} - {project.name}</div>
{/each}
