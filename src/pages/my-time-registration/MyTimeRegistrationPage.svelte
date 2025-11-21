<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import AssistantIcon from '../../components/icons/AssistantIcon.svelte';
  import {
    loadLegalHolidays,
    triggerRefresh as refreshHolidays,
  } from '../holidays/store/actions';
  import Assistant from './assistant/Assistant.svelte';
  import AddTaskModal from './modals/AddTaskModal.svelte';
  import EditLogModal from './modals/EditLogModal.svelte';
  import GridConfig from './parts/GridConfig.svelte';
  import ImportTogglButton from './parts/ImportTogglButton.svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';
  import TimeRegistrationGrid from './parts/TimeRegistrationGrid.svelte';
  import { refreshData } from './store/actions';
  import { newlyAddedTaskIds } from './store/state';

  let assistantEnabled = false;

  function toggleAssistant() {
    assistantEnabled = !assistantEnabled;
  }

  onMount(() => {
    // Clear newly added tasks for a fresh view
    newlyAddedTaskIds.set([]);
    refreshData();
    // Load holiday data for grid visualization
    refreshHolidays();
    loadLegalHolidays();
  });
</script>

<h1>My Time Registration</h1>

<div class="split-container {assistantEnabled ? 'assistant-enabled' : ''}">
  <div class="left">
    <div class="config">
      <GridConfig />

      <Button size="small" kind="tertiary" on:click={toggleAssistant}>
        <AssistantIcon />
        Toggle assistant (beta)</Button
      >
    </div>

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

  .config {
    display: flex;
    align-items: start;
  }

  .split-container {
    display: flex;
    align-items: start;
    gap: 16px;
    max-width: 100%;
  }
  .left {
    flex: 1;
    box-sizing: border-box;
    display: flex;
    width: 70%;
    flex-direction: column;
    justify-items: start;
  }

  .assistant-enabled .left {
    width: 70%;
  }

  .right {
    display: none;
    width: 30%;
    border-left: 1px solid black;
    padding-left: 24px;
    height: calc(100vh - 170px);
  }
  .assistant-enabled .right {
    display: block;
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
