<script lang="ts">
  import { createTaskForProject } from '../../state/actions';

  import { tasksByProjectId } from '../../state/selectors';

  export let projectId: number;

  let tasks = tasksByProjectId(projectId);

  let newTaskTitle = '';
  let newTaskDescription = '';
  let yoTaskId = '';

  function addTask() {
    const yoId = parseInt(yoTaskId);
    if (newTaskTitle.length > 0) {
      createTaskForProject(projectId, newTaskTitle, yoId, newTaskDescription);

      newTaskTitle = '';
      newTaskDescription = '';
    }
  }
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
          <bx-table-cell> {task.title} </bx-table-cell>
        </bx-table-row>
      {/each}
    </bx-table-body>
  </bx-table>
{/if}
YO task id: <input bind:value={yoTaskId} type="text" />
Title: <input bind:value={newTaskTitle} type="text" />
Default description: <input bind:value={newTaskDescription} type="text" />
<button on:click={addTask}>Create task</button>
