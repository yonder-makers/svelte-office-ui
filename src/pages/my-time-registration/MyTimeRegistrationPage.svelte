<script lang="ts">
  import { onMount } from 'svelte';
  import AddTaskModal from './modals/AddTaskModal.svelte';
  import EditLogModal from './modals/EditLogModal.svelte';
  import GridConfig from './parts/GridConfig.svelte';
  import ImportTogglButton from './parts/ImportTogglButton.svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';
  import TimeRegistrationGrid from './parts/TimeRegistrationGrid.svelte';
  import { refreshData } from './store/actions';
  import Assistant from './assistant/Assistant.svelte';

  onMount(() => {
    refreshData();
  });
</script>

<h1>My Time Registration</h1>

<div class="split-container">
  <div class="left">
    <GridConfig />
    <MonthNavigator />
    <TimeRegistrationGrid />

    <div class="footer-actions">
      <AddTaskModal />
      <ImportTogglButton />
    </div>

    <p>
      * in case you are working 8h per day. If you work part time ... do the
      math :P
    </p>
  </div>
  <div class="right">
    <Assistant />
  </div>
</div>

<EditLogModal />

<style>
  :global(#main-content) {
    padding-bottom: 0;
  }
  
  .split-container {
    display: flex;
    gap: 16px;
  }
  .left {
    width: 70%;
  }
  .right {
    width: 30%;
    border-left: 1px solid black;
    padding-left: 24px;
    height: calc(100vh - 170px);
  }
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
