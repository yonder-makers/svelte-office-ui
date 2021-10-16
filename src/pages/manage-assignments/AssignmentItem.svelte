<script lang="ts">
  import { addAssignment, removeAssignment } from '../../state/actions';
  import { getProjectById, getTaskById } from '../../state/selectors';
  import { selectedMonth } from './store/selectors';

  export let taskId: number;
  export let action: 'add' | 'remove' = 'add';

  $: task = getTaskById(taskId);
  $: project = getProjectById($task.projectId);

  function add() {
    addAssignment($selectedMonth, taskId);
  }

  function remove() {
    removeAssignment($selectedMonth, taskId);
  }
</script>

<bx-table-row>
  <bx-table-cell> {$project.name} </bx-table-cell>
  <bx-table-cell> {$task.title} </bx-table-cell>
  <bx-table-cell>
    {#if action === 'add'}
      <button on:click={add}>add</button>
    {:else}
      <button on:click={remove}>remove</button>
    {/if}
  </bx-table-cell>
</bx-table-row>
