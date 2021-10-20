<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  import AddTaskModal from './parts/AddTaskModal.svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';
  import TimeRegistrationGrid from './parts/TimeRegistrationGrid.svelte';
  import { refreshData } from './store/actions';

  let isAddTaskModalOpen = false;

  onMount(() => {
    refreshData();
  });
</script>

<h1>My Time Registration</h1>

<MonthNavigator />
<TimeRegistrationGrid />

<Button on:click={() => (isAddTaskModalOpen = true)}>Add new task</Button>
<AddTaskModal
  on:close={() => (isAddTaskModalOpen = false)}
  open={isAddTaskModalOpen}
/>

<style>
</style>
