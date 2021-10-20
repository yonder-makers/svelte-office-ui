<script lang="ts">
  import { onMount } from 'svelte';
  import AddTaskModal from './parts/AddTaskModal.svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';
  import TimeRegistrationGrid from './parts/TimeRegistrationGrid.svelte';
  import { refreshData } from './store/actions';

  onMount(() => {
    refreshData();
  });
</script>

<h1>My Time Registration</h1>

<MonthNavigator />
<TimeRegistrationGrid />

<div class="footer-actions">
  <AddTaskModal />
</div>

<style>
  .footer-actions {
    margin-top: 12px;
  }
</style>
