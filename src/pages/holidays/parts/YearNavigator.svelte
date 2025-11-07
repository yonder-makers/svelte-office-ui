<script lang="ts">
  import { Button, InlineLoading } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import ArrowLeft from '../../../components/icons/ArrowLeft.svelte';
  import ArrowRight from '../../../components/icons/ArrowRight.svelte';
  import {
    goNextYear,
    goPreviousYear,
    refreshData,
    currentYearState,
  } from '../store';
  import { loadingHolidaysStore } from '../store/state';

  export let hideRefresh = false;
</script>

<div class="container">
  <Button
    on:click={goPreviousYear}
    class="nav-btn"
    iconDescription="Previous year"
    size="small"
    kind="primary"
    disabled={$loadingHolidaysStore}
  >
    <ArrowLeft size={16} />
  </Button>

  <span class="year-display" class:loading={$loadingHolidaysStore}>
    {#if $loadingHolidaysStore}
      <InlineLoading description="" />
    {/if}
    {$currentYearState}
  </span>

  <Button
    on:click={goNextYear}
    class="nav-btn"
    iconDescription="Next year"
    size="small"
    kind="primary"
    disabled={$loadingHolidaysStore}
  >
    <ArrowRight size={16} />
  </Button>

  {#if !hideRefresh}
    <Button
      class="refresh-btn"
      on:click={refreshData}
      size="small"
      kind="primary"
      disabled={$loadingHolidaysStore}
    >
      Refresh
    </Button>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }

  .container :global(button) {
    min-width: auto;
  }

  .container :global(button.nav-btn) {
    padding: 0.75rem 1rem;
  }

  .container :global(button.refresh-btn) {
    padding: 0.75rem 1.5rem;
  }

  span.year-display {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--custom-text);
    min-width: 80px;
    text-align: center;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  span.year-display.loading {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .container {
      gap: 0.5rem;
    }

    span.year-display {
      font-size: 1.125rem;
      min-width: 60px;
    }

    .container :global(button.nav-btn) {
      padding: 0.5rem 0.75rem;
    }

    .container :global(button.refresh-btn) {
      padding: 0.5rem 1rem;
    }
  }
</style>
