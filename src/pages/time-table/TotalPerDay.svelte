<script lang="ts">
  import type { DayId } from '../../core/id-utils';
  import { getTotalHoursForDay } from '../../state/selectors';

  export let day: DayId;

  $: total = getTotalHoursForDay(day);
</script>

<span>{$total}</span>
