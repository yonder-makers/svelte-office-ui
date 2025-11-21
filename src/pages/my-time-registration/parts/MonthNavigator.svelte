<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import ArrowLeft from '../../../components/icons/ArrowLeft.svelte';
  import ArrowRight from '../../../components/icons/ArrowRight.svelte';
  import { goNextMonth, goPreviousMonth, refreshData } from '../store/actions';
  import { currentMonthState } from '../store/state';
  import HintMessage from './HintMessage.svelte';
  import HolidayLegend from './HolidayLegend.svelte';
</script>

<div class="container">
  <div class="controls">
    <Button
      on:click={goPreviousMonth}
      class="nav-btn"
      hasIconOnly={true}
      size="small"
      kind="primary"
    >
      <ArrowLeft size={16} />
    </Button>

    <span class="month-label">{format($currentMonthState, 'yyyy MMM')}</span>

    <Button on:click={goNextMonth} class="nav-btn" size="small" kind="primary">
      <ArrowRight size={16} />
    </Buttons>

    <Button
      class="refresh-btn"
      on:click={refreshData}
      size="small"
      kind="primary">Refresh</Button
    >
    <HintMessage />
  </div>

  <div class="legend-wrapper">
    <HolidayLegend />
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    margin-top: 12px;
    gap: 1rem;
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .legend-wrapper {
    display: flex;
    align-items: center;
  }

  .container :global(button.nav-btn) {
    padding-right: 12px;
  }

  .container :global(button.refresh-btn) {
    margin-left: 12px;
    margin-right: 12px;
  }

  .month-label {
    display: inline-block;
    font-weight: 500;
    min-width: 100px;
    text-align: center;
  }
</style>
