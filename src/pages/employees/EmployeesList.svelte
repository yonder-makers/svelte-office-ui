<script lang="ts">
  import {DataTable, DataTableSkeleton, Toolbar, ToolbarContent, ToolbarSearch } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import type { EmployeeDto } from '../../apis/employee.api';
  import { fetchEmployees } from '../../apis/employee.api';

  let employees: EmployeeDto[] = undefined;

  let headers = [
    { key: 'yoShort', value: 'YO' },
    { key: 'firstName', value: 'First name'},
    { key: 'lastName', value: 'Last name' },
    { key: 'birthDate', value: 'Birthdate'},
    { key: 'hireDate', value: 'Hire date'},
    { key: 'position', value: 'Role'},
  ];

  onMount(async () => {
    employees = await fetchEmployees();
  });

  let value = '';

  $: filteredEmployees = employees === undefined ? 
    employees : employees.filter((employee) => {
              if (value.trim().length === 0) return employee;
              return (employee.yoShort.toLowerCase().includes(value) ||
              employee.firstName.toLowerCase().concat(' ', employee.lastName.toLowerCase()).includes(value) ||
              employee.lastName.toLowerCase().concat(' ', employee.firstName.toLowerCase()).includes(value) ||
              employee.birthDate.toLowerCase().includes(value) || 
              employee.hireDate.toLowerCase().includes(value) ||
              employee.position.toLowerCase().includes(value));
            });

</script>

{#if !employees}
  <DataTableSkeleton showToolbar={false} size="compact" {headers} rows={20} />
{:else}
  <ToolbarSearch bind:value placeholder="Search here for names, birth dates, hire dates and so on."/>
  <DataTable
    size="compact"
    sortable={true}
    stickyHeader={true}
    title="All Yonder employees"
    description="Are you looking for someone?"
    {headers}
    rows={filteredEmployees}
  />
{/if}
