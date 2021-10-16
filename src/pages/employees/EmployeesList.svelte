<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchEmployees } from '../../apis/employee-api';
  import { getTasksLog } from '../../apis/tasks-log.api';
  import { authState } from '../../state/auth/auth.state';

  let employees: any[] = undefined;

  onMount(async () => {
    employees = await fetchEmployees($authState);
    // const hasProjects = $projectsCount > 0;
    // if (hasProjects) {
    //   return;
    // }
    // projectsLoading();
    // let projects = await fetchProjects();
    // projectsLoaded(projects);
  });
</script>

<h3>Employees</h3>
{#if employees === undefined}
  Please wait
{:else}
  <bx-table :size="null">
    <bx-table-head>
      <bx-table-header-row>
        <bx-table-header-cell> YOID </bx-table-header-cell>
        <bx-table-header-cell> First name </bx-table-header-cell>
        <bx-table-header-cell> Last name </bx-table-header-cell>
        <bx-table-header-cell> Role </bx-table-header-cell>
      </bx-table-header-row>
    </bx-table-head>
    <bx-table-body>
      {#each employees as employee}
        <bx-table-row>
          <bx-table-cell> {employee.yoShort} </bx-table-cell>
          <bx-table-cell> {employee.firstName} </bx-table-cell>
          <bx-table-cell> {employee.lastName} </bx-table-cell>
          <bx-table-cell> {employee.position} </bx-table-cell>
        </bx-table-row>
      {/each}
    </bx-table-body>
  </bx-table>
{/if}
