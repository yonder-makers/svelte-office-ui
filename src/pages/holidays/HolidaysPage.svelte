<script lang="ts">
  import { onMount } from 'svelte';
  import HolidaysGrid from './parts/HolidaysGrid.svelte';
  import YearNavigator from './parts/YearNavigator.svelte';
  import { registerEffects } from './store';

  onMount(() => {
    registerEffects();
  });
</script>

<h1>My holidays</h1>

<YearNavigator />
<HolidaysGrid />
