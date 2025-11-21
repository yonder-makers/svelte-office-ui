<script lang="ts">
  import { TableHead } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import type { HolidayResponse } from '../../../apis/holidays.api';
  import { getHolidayStatusClasses } from '../../../utils/holiday-class-utils';

  export let day: Date;
  export let holidayRequests: HolidayResponse[] = [];
  export let isLegalDay: boolean = false;
  export let isApprovedDay: boolean = false;

  $: dayOfTheWeek = `day-${day.getDay()}`;
  $: holidayStatusClass = getHolidayStatusClasses(
    day,
    holidayRequests,
    isLegalDay,
    isApprovedDay,
  );
</script>

<TableHead class="log-day {dayOfTheWeek} {holidayStatusClass}">
  <span>
    {format(day, 'd')}
  </span>
  <i>{format(day, 'EEE')}</i>
</TableHead>

<style>
  span {
    display: block;
  }

  i {
    font-size: smaller;
  }
</style>
