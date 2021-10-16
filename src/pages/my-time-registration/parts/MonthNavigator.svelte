<script lang="ts">
  import { Button } from 'carbon-components-svelte';

  import { format } from 'date-fns';
  import { goNextMonth, goPreviousMonth } from '../store/actions';

  import { currentMonth } from '../store/state';
</script>

<div>
  <Button on:click={goPreviousMonth} size="small" kind="primary">-</Button>

  <span>{format($currentMonth, 'yyyy MMM')}</span>

  <Button on:click={goNextMonth} size="small" kind="primary">+</Button>
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  span {
    display: inline-block;
    margin: 0.5rem;
  }
</style>
