<script lang="ts">
  import { projectById, tasksByProjectId } from '../state/selectors';

  export let projectId: number;

  let project = projectById(projectId);
  let tasks = tasksByProjectId(projectId);
</script>

{#if $tasks.length == 0}
  <p>No tasks in this project</p>
{:else}
  <bx-table :size="null">
    <bx-table-head>
      <bx-table-header-row>
        <bx-table-header-cell> YO Task </bx-table-header-cell>
        <bx-table-header-cell> Name </bx-table-header-cell>
      </bx-table-header-row>
    </bx-table-head>
    <bx-table-body>
      {#each $tasks as task}
        <bx-table-row>
          <bx-table-cell> {task.yoId} </bx-table-cell>
          <bx-table-cell> {task.name} </bx-table-cell>
        </bx-table-row>
      {/each}
    </bx-table-body>
  </bx-table>
{/if}
