<script lang="ts">
  import { TableCell } from 'carbon-components-svelte';
  import StarFilled from '../../../components/icons/StarFilled.svelte';
  import StarOutline from '../../../components/icons/StarOutline.svelte';
  import { addTaskToFavorites, isTaskFavorite, removeTaskFromFavorites } from '../store';
  import { tasksState } from '../store/state';

  export let taskId: number;

  $: isFavorite = isTaskFavorite(taskId);

  $: taskInfo = $tasksState.byId[taskId] || {
    project: 'loading',
    taskId: 0,
    description: 'loading',
  };

</script>

<TableCell class="row-header">
  <div class="container">
    {#if $isFavorite} 
    <StarFilled on:click={() => removeTaskFromFavorites(taskId)}  size={24} />
    {:else}
    <StarOutline on:click={()=> addTaskToFavorites(taskId)} size={24} />
    {/if}
    <div class="description">
      <span>{taskInfo.project}</span>
      <i><strong>{taskInfo.taskId}</strong> - {taskInfo.description}</i>
    </div>
  </div>
</TableCell>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  :global(svg){
    flex: 0 0 24px;
  }

  .description {
    padding-left: 6px;
  }

  span {
    font-weight: bold;
    display: block;
  }
  i {
    font-size: smaller;
    display: block;
  }
</style>
