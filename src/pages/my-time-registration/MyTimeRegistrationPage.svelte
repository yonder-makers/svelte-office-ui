<script lang="ts">
  import AddTaskModal from './parts/AddTaskModal.svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';
  import TimeRegistrationGrid from './parts/TimeRegistrationGrid.svelte';
</script>

<h1>My Time Registration</h1>

<MonthNavigator />
<TimeRegistrationGrid />

<AddTaskModal open={false} />

<style>
</style>
