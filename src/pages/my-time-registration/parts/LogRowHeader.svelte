<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';

  import { getTaskInfoById } from '../store/selectors';

  export let taskId: number;

  $: taskInfo = getTaskInfoById(taskId);
</script>

<TableCell class="row-header">
  <span>{$taskInfo.projectName}</span>
  <i>{$taskInfo.taskId} - {$taskInfo.taskName}</i>
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
