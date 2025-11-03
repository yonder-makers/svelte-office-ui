<script lang="ts">
  import { Checkbox } from 'carbon-components-svelte';
  import { addNewTask, favoritesTasks, newlyAddedTaskIds } from '../store';
  import { tasksWithLoggedHours } from '../store/selectors';
  import { createEventDispatcher } from 'svelte';
  import type { TaskDto } from '../../../apis/tasks.api';

  const dispatch = createEventDispatcher();

  export let canSubmit: boolean = false;

  let selected: number[] = [];

  $: canSubmit = selected.length > 0;

  function onToggle(taskId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      selected = [...selected, taskId];
    } else {
      selected = selected.filter(id => id !== taskId);
    }
  }

  export function submit() {
    for (const id of selected) {
      const favTask = $favoritesTasks.find((f) => f.taskNumber === id);
      if (favTask) {
        const taskDto: TaskDto = {
          taskId: favTask.taskNumber,
          description: favTask.description,
          project: favTask.projectName,
          custRefDescription: favTask.custRefDescription,
        };
        addNewTask(taskDto);
      }
    }

    dispatch('onTasksAdded', selected);
    selected = []; // Clear selection after adding
  }
</script>

{#if $favoritesTasks.length === 0}
  <p>
    You don't have any favorite tasks. Click the 'star' icon next to a task in
    the TR Grid.
  </p>
{:else}
  {#each $favoritesTasks as favorite}
    <Checkbox
      indeterminate={$tasksWithLoggedHours.includes(favorite.taskNumber)}
      disabled={$tasksWithLoggedHours.includes(favorite.taskNumber) || $newlyAddedTaskIds.includes(favorite.taskNumber)}
      checked={selected.includes(favorite.taskNumber)}
      on:change={(event) => onToggle(favorite.taskNumber, event)}
      labelText={`${favorite.taskNumber} - ${favorite.projectName ? favorite.projectName + ', ' : ''}${favorite.description}`}
    />
  {/each}
{/if}
