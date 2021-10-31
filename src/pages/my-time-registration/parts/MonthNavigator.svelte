<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import ArrowLeft from '../../../components/icons/ArrowLeft.svelte';
  import ArrowRight from '../../../components/icons/ArrowRight.svelte';
  import { goNextMonth, goPreviousMonth, refreshData } from '../store/actions';
  import { currentMonthState } from '../store/state';
  import HintMessage from './HintMessage.svelte';
</script>

<div class="container">
  <Button
    on:click={goPreviousMonth}
    class="nav-btn"
    hasIconOnly={true}
    size="small"
    kind="primary"
  >
    <ArrowLeft size={16} />
  </Button>

  <span>{format($currentMonthState, 'yyyy MMM')}</span>

  <Button on:click={goNextMonth} class="nav-btn" size="small" kind="primary"
    ><ArrowRight size={16} /></Button
  >

  <Button class="refresh-btn" on:click={refreshData} size="small" kind="primary"
    >Refresh</Button
  >
  <HintMessage />
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
