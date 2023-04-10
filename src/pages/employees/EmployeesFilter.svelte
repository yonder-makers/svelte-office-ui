<script lang="ts">
  import { Accordion, Button, Popover } from 'carbon-components-svelte';
  import { Filter } from 'carbon-icons-svelte';
  import type { EmployeeDto } from 'src/apis/employee.api';
  import {
    createFilterItemsFromPartialString,
    createFilterItemsFromString,
  } from '../../utils/filter-utils';
  import { onMount } from 'svelte';
  import type {
    ActiveFilters,
    FilterItem,
  } from './interfaces/filter.interface';
  import EmployeesAccordionItem from './EmployeesAccordionItem.svelte';

  export let employees: EmployeeDto[];
  export let activeFilters: ActiveFilters;

  let monthStrings = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
    '': '?',
  };
  let open = false;

  let positionFilters: FilterItem[] = [];
  let hireYearFilters: FilterItem[] = [];
  let hireMonthFilters: FilterItem[] = [];
  let birthYearFilters: FilterItem[] = [];
  let birthMonthFilters: FilterItem[] = [];

  onMount(() => {
    generateFilters(employees);
  });

  $: activeFilters.position = positionFilters.filter((item) => item.selected);
  $: activeFilters.hireYear = hireYearFilters.filter((item) => item.selected);
  $: activeFilters.hireMonth = hireMonthFilters.filter((item) => item.selected);
  $: activeFilters.birthYear = birthYearFilters.filter((item) => item.selected);
  $: activeFilters.birthMonth = birthMonthFilters.filter(
    (item) => item.selected,
  );

  function generateFilters(source: EmployeeDto[]) {
    positionFilters = createFilterItemsFromString(
      source,
      'position',
      '?',
      activeFilters.position,
    );

    hireYearFilters = createFilterItemsFromPartialString(
      source,
      'hireDate',
      6,
      10,
      '?',
      activeFilters.hireYear,
    );

    hireMonthFilters = createFilterItemsFromPartialString(
      source,
      'hireDate',
      3,
      5,
      '?',
      activeFilters.hireMonth,
      monthStrings,
    );

    birthYearFilters = createFilterItemsFromPartialString(
      source,
      'birthDate',
      6,
      10,
      '?',
      activeFilters.birthYear,
    );

    birthMonthFilters = createFilterItemsFromPartialString(
      source,
      'birthDate',
      3,
      5,
      '?',
      activeFilters.birthMonth,
      monthStrings,
    );
  }
</script>

<div class="employee__filter">
  <Button
    class="employee__filter-button"
    size="field"
    on:click={() => (open = !open)}>Filters <Filter /></Button
  >
  <Popover
    closeOnOutsideClick
    bind:open
    align="bottom-left"
    on:click:outside={() => {
      open = false;
    }}
  >
    <Accordion style="width: 350px;">
      <EmployeesAccordionItem
        filterCategory="Roles"
        filterAttr="position"
        bind:activeFilters
        bind:filters={positionFilters}
      />
      <EmployeesAccordionItem
        filterCategory="Hire Year"
        filterAttr="hireYear"
        bind:activeFilters
        bind:filters={hireYearFilters}
      />
      <EmployeesAccordionItem
        filterCategory="Hire Month"
        filterAttr="hireMonth"
        bind:activeFilters
        bind:filters={hireMonthFilters}
      />
      <EmployeesAccordionItem
        filterCategory="Birth Year"
        filterAttr="birthYear"
        bind:activeFilters
        bind:filters={birthYearFilters}
      />
      <EmployeesAccordionItem
        filterCategory="Birth Month"
        filterAttr="birthMonth"
        bind:activeFilters
        bind:filters={birthMonthFilters}
      />
    </Accordion>
  </Popover>
</div>

<style>
  .employee__filter {
    position: relative;
  }

  :global(.employee__filter-button) {
    width: 90px;
  }

  :global(.filter__content .bx--accordion__content) {
    padding-right: 0;
  }
</style>
