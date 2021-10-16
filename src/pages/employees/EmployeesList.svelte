<script lang="ts">
  import { DataTable, DataTableSkeleton } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import { fetchEmployees } from '../../apis/employee-api';
  import type { EmployeeDto } from '../../apis/employee-api';
  import { authState } from '../../state/auth/auth.state';

  let employees: EmployeeDto[] = undefined;

  let headers = [
    { key: 'yoShort', value: 'YO' },
    { key: 'firstName', value: 'First name' },
    { key: 'lastName', value: 'Last name' },
    { key: 'birthDate', value: 'Birthdate' },
    { key: 'hireDate', value: 'Hire date' },
    { key: 'position', value: 'Role' },
  ];

  onMount(async () => {
    employees = await fetchEmployees($authState);
  });
</script>

{#if !employees}
  <DataTableSkeleton showToolbar={false} size="compact" {headers} rows={20} />
{:else}
  <DataTable
    size="compact"
    sortable={true}
    stickyHeader={true}
    title="All Yonder employees"
    description="Are you looking for someone?"
    {headers}
    rows={employees}
  />
{/if}
