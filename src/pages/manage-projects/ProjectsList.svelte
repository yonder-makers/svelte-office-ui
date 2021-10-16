<script lang="ts">
import { onMount } from 'svelte';
import { getTasks } from '../../apis/tasks-api';
import { authState } from '../../state/auth/auth.state';

  import { projects } from '../../state/selectors';

  onMount(async ()=>{
    const tasks = await getTasks($authState);
  })
  import ProjectEdit from './ProjectEdit.svelte';
</script>

<bx-accordion>
  {#each $projects as project}
    <bx-accordion-item open={true} title-text={project.name}>
      <ProjectEdit projectId={project.id} />
    </bx-accordion-item>
  {/each}
</bx-accordion>
