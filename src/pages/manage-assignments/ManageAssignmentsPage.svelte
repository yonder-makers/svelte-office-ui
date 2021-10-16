<script lang="ts">
  import { goNextMonth, goPreviousMonth } from './store/actions';
  import {
    currentMonthTasks,
    otherTasks,
    selectedMonth,
  } from './store/selectors';
  import { format } from 'date-fns';
  import { getDateForMonthId } from '../../core/id-utils';
  import AssignmentItem from './AssignmentItem.svelte';
</script>

<bx-btn on:click={goPreviousMonth} kind="primary" size icon-layout>
  <span slot="icon">-</span>
</bx-btn>

{format(getDateForMonthId($selectedMonth), 'yyyy MMM')}

<bx-btn on:click={goNextMonth} kind="primary" size icon-layout>
  <span slot="icon">+</span>
</bx-btn>

<bx-table>
  <bx-table-head>
    <bx-table-header-row>
      <bx-table-header-cell> Project </bx-table-header-cell>
      <bx-table-header-cell> Task </bx-table-header-cell>
      <bx-table-header-cell />
    </bx-table-header-row>
  </bx-table-head>
  <bx-table-body>
    {#each $currentMonthTasks as taskId}
      <AssignmentItem {taskId} action="remove" />
    {/each}
  </bx-table-body>
</bx-table>
<bx-table>
  <bx-table-head>
    <bx-table-header-row>
      <bx-table-header-cell> Project </bx-table-header-cell>
      <bx-table-header-cell> Task </bx-table-header-cell>
    </bx-table-header-row>
  </bx-table-head>
  <bx-table-body>
    {#each $otherTasks as taskId}
      <AssignmentItem {taskId} action="add" />
    {/each}
  </bx-table-body>
</bx-table>
