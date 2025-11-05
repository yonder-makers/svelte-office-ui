<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import ArrowLeft from '../../../components/icons/ArrowLeft.svelte';
  import ArrowRight from '../../../components/icons/ArrowRight.svelte';
  import {
    goNextYear,
    goPreviousYear,
    refreshData,
    currentYearState,
  } from '../store';
</script>

<div class="container">
  <Button
    on:click={goPreviousYear}
    class="nav-btn"
    iconDescription="Previous year"
    size="small"
    kind="primary"
  >
    <ArrowLeft size={16} />
  </Button>

  <span>{$currentYearState}</span>

  <Button on:click={goNextYear} class="nav-btn" iconDescription="Next year" size="small" kind="primary"
    ><ArrowRight size={16} /></Button
  >

  <Button class="refresh-btn" on:click={refreshData} size="small" kind="primary"
    >Refresh</Button
  >
</div>

<style>
  .container :global(button.nav-btn) {
    padding-right: 12px;
  }

  .container :global(button.refresh-btn) {
    margin-left: 12px;
    margin-right: 12px;
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
    margin-top: 12px;
  }

  span {
    display: inline-block;
    margin: 0.5rem;
  }
</style>
