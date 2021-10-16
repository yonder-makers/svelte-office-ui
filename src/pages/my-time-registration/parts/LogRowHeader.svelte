<script lang="ts">
  import { getTaskInfoById } from '../store/selectors';

  export let taskId: number;

  $: taskInfo = getTaskInfoById(taskId);
</script>

<bx-table-cell>
  <div>
    <span>{$taskInfo.projectName}</span>
    <i>{$taskInfo.taskId} - {$taskInfo.taskName}</i>
  </div>
</bx-table-cell>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
  span {
    font-weight: bold;
  }
  i {
    font-size: smaller;
  }
</style>
