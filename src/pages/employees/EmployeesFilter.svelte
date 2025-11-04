<script lang="ts">
  import { Accordion } from 'carbon-components-svelte';
  import Fuse from 'fuse.js';
  import type { Employee } from 'src/apis/employee.api';
  import { onMount } from 'svelte';
  import { createFilterItemsFromString } from '../../utils/filter-utils';
  import EmployeesAccordionItem from './EmployeesAccordionItem.svelte';
  import type {
    ActiveFilters,
    FilterItem,
  } from './interfaces/filter.interface';

  export let employees: Employee[];
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

  let positionFilters: FilterItem[] = [];
  let hireYearFilters: FilterItem[] = [];
  let hireMonthFilters: FilterItem[] = [];
  let birthYearFilters: FilterItem[] = [];
  let birthMonthFilters: FilterItem[] = [];

  let prevFilter: string = '';
  let activeFilterKeys: string[] = [];
  let decreasedToOneFilter: boolean = false;
  let activeFilterNumber: number = 0;
  let prevActiveFilterNumber: number = 0;

  const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    threshold: 0,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    // fieldNormWeight: 1,
    keys: ['position', 'hireYear', 'hireMonth', 'birthYear', 'birthMonth'],
  };

  let fuse: Fuse<Employee> | null = null;

  // Reinitialize Fuse when employees data loads or changes
  $: if (employees.length > 0) {
    console.log('[Filter] Initializing Fuse with', employees.length, 'employees');
    if (employees.length > 0) {
      console.log('[Filter] Sample employee:', {
        position: employees[0].position,
        hireYear: employees[0].hireYear,
        hireMonth: employees[0].hireMonth,
        birthYear: employees[0].birthYear,
        birthMonth: employees[0].birthMonth,
      });
    }
    fuse = new Fuse(employees, options);
    generateFilters(employees);
  }

  $: activeFilters.position = positionFilters.filter((item) => item.selected);
  $: activeFilters.hireYear = hireYearFilters.filter((item) => item.selected);
  $: activeFilters.hireMonth = hireMonthFilters.filter((item) => item.selected);
  $: activeFilters.birthYear = birthYearFilters.filter((item) => item.selected);
  $: activeFilters.birthMonth = birthMonthFilters.filter(
    (item) => item.selected,
  );

  // Trigger computeFuse when any filter array changes
  $: positionFilters, hireYearFilters, hireMonthFilters, birthYearFilters, birthMonthFilters, computeFuse();
  $: activeFilterKeys, updateActiveFilterNumber();

  function generateFilters(source: Employee[]) {
    if (
      prevFilter !== 'position' ||
      (prevFilter === 'position' && !activeFilterKeys.includes('position'))
    ) {
      positionFilters = createFilterItemsFromString(
        decreasedToOneFilter && activeFilterKeys.includes('position')
          ? employees
          : source,
        'position',
        '?',
        activeFilters.position,
      );
    }

    if (
      prevFilter !== 'hireYear' ||
      (prevFilter === 'hireYear' && !activeFilterKeys.includes('hireYear'))
    ) {
      hireYearFilters = createFilterItemsFromString(
        decreasedToOneFilter && activeFilterKeys.includes('hireYear')
          ? employees
          : source,
        'hireYear',
        '?',
        activeFilters.hireYear,
      );
    }

    if (
      prevFilter !== 'hireMonth' ||
      (prevFilter === 'hireMonth' && !activeFilterKeys.includes('hireMonth'))
    ) {
      hireMonthFilters = createFilterItemsFromString(
        decreasedToOneFilter && activeFilterKeys.includes('hireMonth')
          ? employees
          : source,
        'hireMonth',
        '?',
        activeFilters.hireMonth,
        monthStrings,
      );
    }

    if (
      prevFilter !== 'birthYear' ||
      (prevFilter === 'birthYear' && !activeFilterKeys.includes('birthYear'))
    ) {
      birthYearFilters = createFilterItemsFromString(
        decreasedToOneFilter && activeFilterKeys.includes('birthYear')
          ? employees
          : source,
        'birthYear',
        '?',
        activeFilters.birthYear,
      );
    }

    if (
      prevFilter !== 'birthMonth' ||
      (prevFilter === 'birthMonth' && !activeFilterKeys.includes('birthMonth'))
    ) {
      birthMonthFilters = createFilterItemsFromString(
        decreasedToOneFilter && activeFilterKeys.includes('birthMonth')
          ? employees
          : source,
        'birthMonth',
        '?',
        activeFilters.birthMonth,
        monthStrings,
      );
    }
  }

  function computeFuse() {
    console.log('[Filter] computeFuse called, fuse:', fuse !== null);
    if (!fuse) {
      console.log('[Filter] Fuse not initialized, skipping');
      return;
    }
    
    let fuseQuery = { $and: [] };
    activeFilterKeys = [];
    for (const property in activeFilters) {
      if (activeFilters[property].length > 0) {
        console.log('[Filter] Active filter:', property, activeFilters[property].length, 'items');
        activeFilterKeys.push(property);

        const currentIndex = fuseQuery.$and.length;
        fuseQuery.$and.push({ $or: [] });

        activeFilters[property].forEach((item: FilterItem) => {
          fuseQuery.$and[currentIndex].$or.push({ [property]: item.value });
        });
      }
    }
    
    console.log('[Filter] Fuse query:', JSON.stringify(fuseQuery, null, 2));
    
    if (fuseQuery.$and.length !== 0) {
      const result = fuse.search(fuseQuery);
      console.log('[Filter] Fuse search found:', result.length, 'results');
      generateFilters(result.map((res) => res.item));
    } else {
      console.log('[Filter] No active filters, using all employees');
      generateFilters(employees);
    }
  }

  function updateActiveFilterNumber() {
    prevActiveFilterNumber = activeFilterNumber;
    activeFilterNumber = activeFilterKeys.length;

    if (
      activeFilterNumber === 1 &&
      activeFilterNumber < prevActiveFilterNumber
    ) {
      decreasedToOneFilter = true;
    } else {
      decreasedToOneFilter = false;
    }
  }
</script>

<div class="employee__filter">
  <Accordion>
    <EmployeesAccordionItem
      filterCategory="Roles"
      filterAttr="position"
      bind:activeFilters
      bind:filters={positionFilters}
      bind:prevFilter
    />
    <EmployeesAccordionItem
      filterCategory="Hire Year"
      filterAttr="hireYear"
      bind:activeFilters
      bind:filters={hireYearFilters}
      bind:prevFilter
    />
    <EmployeesAccordionItem
      filterCategory="Hire Month"
      filterAttr="hireMonth"
      bind:activeFilters
      bind:filters={hireMonthFilters}
      bind:prevFilter
    />
    <EmployeesAccordionItem
      filterCategory="Birth Year"
      filterAttr="birthYear"
      bind:activeFilters
      bind:filters={birthYearFilters}
      bind:prevFilter
    />
    <EmployeesAccordionItem
      filterCategory="Birth Month"
      filterAttr="birthMonth"
      bind:activeFilters
      bind:filters={birthMonthFilters}
      bind:prevFilter
    />
  </Accordion>
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
