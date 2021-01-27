<script lang="ts">
  import { projects } from '../state/selectors';
  import ProjectEdit from './ProjectEdit.svelte';
</script>

<bx-accordion>
  {#each $projects as project}
    <bx-accordion-item open={true} title-text={project.name}>
      <ProjectEdit projectId={project.id} />
    </bx-accordion-item>
  {/each}
</bx-accordion>
