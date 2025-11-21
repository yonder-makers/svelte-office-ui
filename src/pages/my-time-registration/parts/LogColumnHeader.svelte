<script lang="ts">
  import { TableHead } from 'carbon-components-svelte';
  import Hourglass from 'carbon-icons-svelte/lib/Hourglass.svelte';
  import { format } from 'date-fns';
  import type { HolidayResponse } from '../../../apis/holidays.api';
  import { getHolidayStatusClasses } from '../../../utils/holiday-class-utils';
  import { isPendingHoliday } from '../../../utils/holiday-status-utils';
  import { legalHolidaysStore } from '../../holidays/store/state';

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

  $: isPending = isPendingHoliday(day, holidayRequests);

  // Fallback holidays for known dates if missing from backend
  const fallbackHolidays: HolidayResponse[] = [
    { day: 1, month: 12, description: 'National Day' },
    { day: 24, month: 1, description: 'Unification Day' },
    { day: 1, month: 6, description: "Children's Day" },
    { day: 30, month: 11, description: 'St Andrew' },
    { day: 15, month: 8, description: 'St Mary' },
  ];

  function getFallbackHoliday(day: Date): HolidayResponse | null {
    const d = day.getDate();
    const m = day.getMonth() + 1;
    return fallbackHolidays.find(h => h.day === d && h.month === m) || null;
  }

  $: legalHoliday =
    $legalHolidaysStore.find(
      (h) => h.day === day.getDate() && h.month === day.getMonth() + 1,
    ) ||
    getFallbackHoliday(day);

  function getLegalHolidayIcon(holiday: {
    day: number;
    month: number;
    description: string;
  }): string {
    const { day, month, description } = holiday;

    // Fixed dates
    if (day === 1 && month === 12) return '🇷🇴'; // National Day
    if (day === 24 && month === 1) return '🇷🇴'; // Unification Day
    if (day === 25 && month === 12) return '🎄'; // Christmas
    if (day === 26 && month === 12) return '🎄'; // Christmas
    if (day === 1 && month === 1) return '1️⃣'; // New Year
    if (day === 2 && month === 1) return '1️⃣'; // New Year
    if (day === 1 && month === 5) return '👷'; // Labor Day
    if (day === 1 && month === 6) return '🎈'; // Children's Day
    if (day === 15 && month === 8) return '⛪'; // St Mary
    if (day === 30 && month === 11) return '✝️'; // St Andrew

    // Fallback to description for movable holidays (like Easter)
    const desc = description.toLowerCase();
    if (desc.includes('easter')) return '🐰';

    return '🏛️';
  }
</script>

<TableHead class="log-day {dayOfTheWeek} {holidayStatusClass}">
  <div class="day-content">
    <div class="day-name">{format(day, 'EEE')}</div>
    <div class="day-number">
      {day.getDate()}
      {#if isPending}
        <div class="pending-icon" title="Pending Holiday">
          <Hourglass size={16} />
        </div>
      {/if}
      {#if legalHoliday}
        <div class="legal-icon" title={legalHoliday.description}>
          {getLegalHolidayIcon(legalHoliday)}
        </div>
      {/if}
    </div>
  </div>
</TableHead>

<style>
  .log-day {
    text-align: center;
    vertical-align: middle;
    padding: 0.5rem;
    height: 60px;
  }

  .day-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .day-name {
    font-size: 0.75rem;
    text-transform: uppercase;
    margin-bottom: 0.125rem;
    opacity: 0.8;
  }

  .day-number {
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pending-icon {
    display: inline-flex;
    align-items: center;
    color: var(--holiday-pending-text, #f1c21b);
  }

  .legal-icon {
    font-size: 1rem;
    line-height: 1;
    cursor: help;
  }

  /* Holiday status colors */
  :global(.pending-holiday) {
    background-color: var(--holiday-pending-bg);
    color: var(--holiday-pending-text);
  }

  :global(.approved-holiday) {
    background-color: var(--holiday-approved-bg);
    color: var(--holiday-approved-text);
  }

  :global(.legal-holiday) {
    background-color: var(--holiday-legal-bg);
    color: var(--holiday-legal-text);
  }
</style>
