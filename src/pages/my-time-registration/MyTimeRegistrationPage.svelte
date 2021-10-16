<script lang="ts">
  import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
  } from 'date-fns';

  import { onMount } from 'svelte';
  import MonthNavigator from './parts/MonthNavigator.svelte';

  import { currentMonth } from './store/state';
  import type { LogEntry } from './store/state';
  import { authState } from '../../state/auth/auth.state';
  import { get } from 'svelte/store';
  import { getLogEntryIds } from './store/selectors';
  import LogDayHeader from './parts/LogRowHeader.svelte';
  import LogDay from './parts/LogDay.svelte';
  import TotalPerDayCell from './parts/TotalPerDayCell.svelte';
  import LogColumnHeader from './parts/LogColumnHeader.svelte';

  let days: Date[] = [];

  $: {
    const start = startOfMonth($currentMonth);
    const end = endOfMonth(start);
    days = eachDayOfInterval({ start, end });
  }

  let tasksLog: LogEntry[] = [];

  //   onMount(async () => {
  //     tasksLog = await getTasksLog($userSession, '01-07-2021', '15-07-2021');
  //   });
</script>

<h1>My Time Registration</h1>

<MonthNavigator />

<div class="grid-container">
  <bx-table :size="null">
    <bx-table-head>
      <bx-table-header-row>
        <bx-table-header-cell class="day-column"> Task </bx-table-header-cell>
        {#each days as day}
          <LogColumnHeader {day} />
        {/each}
      </bx-table-header-row>
    </bx-table-head>
    <bx-table-body>
      {#each $getLogEntryIds as taskId}
        <bx-table-row>
          <LogDayHeader {taskId} />
          {#each days as day}
            <LogDay {day} {taskId} />
          {/each}
        </bx-table-row>
      {/each}
      <bx-table-row>
        <bx-table-cell>TOTAL</bx-table-cell>
        {#each days as day}
          <TotalPerDayCell {day} />
        {/each}
      </bx-table-row>
    </bx-table-body>
  </bx-table>
</div>

{#each tasksLog as taskLog}
  <div>{taskLog.hours}</div>
{/each}

<style>
  .grid-container {
    overflow: scroll;
  }

  bx-table {
    width: unset;
  }

  bx-table-cell {
    padding-top: 0;
    padding-bottom: 0;
  }

  bx-table-header-cell,
  bx-table-cell {
    max-width: 50px;
    min-width: 50px;
  }
</style>
