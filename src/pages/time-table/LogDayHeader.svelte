<script lang="ts">
  import { getProjectById, getTaskById } from '../../state/selectors';

  export let taskId: number;

  $: task = getTaskById(taskId);
  $: project = getProjectById($task.projectId);
</script>

<bx-table-header-cell>
  <div>
    <span>{$project.name}</span>
    <span>{$task.title}</span>
  </div>
</bx-table-header-cell>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
</style>
