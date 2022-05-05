<script lang="ts">
  import { Button, Checkbox } from "carbon-components-svelte";
  import { addNewTask, favoritesTasks, tasksState } from "../store";
  import { createEventDispatcher } from 'svelte';
  import { entries } from "lodash";
  import type { TaskDto } from "src/apis/tasks.api";

  const dispatch = createEventDispatcher();

  const selected: Record<number, boolean> = {};
  var hasAnySelection = false;

  function onToggle(){
    hasAnySelection= entries(selected).some(([, value]) => value);
  }

  function onSubmit() {
    const selectedIds = entries(selected).filter(([, value]) => value).map(([id]) => parseInt(id));
    for(const id of selectedIds) {
      const favTask = $favoritesTasks.find(f=>f.taskNumber === id);
      if(favTask) {
        const taskDto: TaskDto = {
          taskId: favTask.taskNumber,
          description: favTask.description,
          project: favTask.projectName,
          custRefDescription: favTask.custRefDescription,
        };
        addNewTask(taskDto);
      }
    }

    dispatch("onTasksAdded", selectedIds);
  }
</script>
{#if $favoritesTasks.length === 0}
  <p>You don't have any favorite tasks. Click the 'star' icon next to a task in the TR Grid. </p>
{:else}  
  {#each $favoritesTasks as favorite }
  <Checkbox indeterminate={$tasksState.byId[favorite.taskNumber] !== undefined} disabled={$tasksState.byId[favorite.taskNumber] !== undefined} on:check={onToggle} bind:checked={selected[favorite.taskNumber]} labelText={`${favorite.taskNumber} - ${favorite.projectName}, ${favorite.description}`} />
  {/each}
  
  <Button disabled={hasAnySelection === false} on:click={onSubmit}>Add</Button>
{/if}




