<script lang="ts">
  import { Toggle } from 'carbon-components-svelte';
  import { changeDisplayWeekend, displayWeekend } from '../store';

</script>

<Toggle
  labelText="Display weekends"
  bind:toggled={$displayWeekend}
  on:toggle={(e) => changeDisplayWeekend(e?.detail?.toggled)}
/>
