<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadEmployeeHistory,
    registerEffects,
    refreshData,
    employeeHistoryState,
  } from './store';
  import EmployeeHistoryGrid from './parts/EmployeeHistoryGrid.svelte';
  import { Button } from 'carbon-components-svelte';
  import EmployeeEditForm from './parts/EmployeeEditForm.svelte';

  export let params: { yoShort: string };

  onMount(() => {
    registerEffects();

    loadEmployeeHistory(params.yoShort);
  });
</script>

<h1>{$employeeHistoryState.yoShort} - history</h1>

<Button class="refresh-btn" on:click={refreshData} size="small" kind="primary">
  Refresh
</Button>

{#if $employeeHistoryState.isLoading}
  <div>Loading...</div>
{:else if $employeeHistoryState.errorMessage}
  <div>{$employeeHistoryState.errorMessage}</div>
{:else}
  <EmployeeHistoryGrid />
  <EmployeeEditForm />
{/if}
