<script lang="ts">
  import { TableHead } from 'carbon-components-svelte';
  import { format } from 'date-fns';
  import type { HolidayResponse } from '../../../apis/holidays.api';
  import { isPendingHoliday } from '../../../utils/holiday-status-utils';

  export let day: Date;
  export let holidayRequests: HolidayResponse[] = [];
  export let isLegalDay: boolean = false;
  export let isApprovedDay: boolean = false;

  $: dayOfTheWeek = `day-${day.getDay()}`;
  $: isPending = isPendingHoliday(day, holidayRequests);
</script>

<TableHead
  class="log-day {dayOfTheWeek} {isPending
    ? 'pending-holiday'
    : ''} {isApprovedDay ? 'approved-holiday' : ''} {isLegalDay
    ? 'legal-holiday'
    : ''}"
>
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
