<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';
  import { tasksState } from '../store/state';

  export let taskId: number;

  $: taskInfo = $tasksState.byId[taskId] || {
    project: 'loading',
    taskId: 0,
    description: 'loading',
  };
</script>

<TableCell class="row-header">
  <span>{taskInfo.project}</span>
  <i><strong>{taskInfo.taskId}</strong> - {taskInfo.description}</i>
</TableCell>

<style>
  span {
    font-weight: bold;
    display: block;
  }
  i {
    font-size: smaller;
    display: block;
  }
</style>
