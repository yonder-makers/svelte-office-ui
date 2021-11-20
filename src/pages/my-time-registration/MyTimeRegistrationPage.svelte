<script lang="ts">
  import { onMount } from 'svelte';
  import AddTaskModal from './modals/AddTaskModal.svelte';
  import EditLogModal from './modals/EditLogModal.svelte';
  import ImportTogglButton from './parts/ImportTogglButton.svelte';
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
  <ImportTogglButton />
</div>

<EditLogModal />

<style>
  .footer-actions {
    margin-top: 12px;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-auto-flow: dense;
    column-gap: 12px;
    row-gap: 12px;
  }
</style>
