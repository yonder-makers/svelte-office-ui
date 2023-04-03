<script lang="ts">
  import { ToolbarSearch, Tile } from 'carbon-components-svelte';
  import LazyLoadedImage from '../../components/LazyLoadedImage.svelte';
  import { onMount } from 'svelte';
  import type { EmployeeDto } from '../../apis/employee.api';
  import { fetchEmployees } from '../../apis/employee.api';
  import EmployeesSkeletonList from './EmployeesSkeletonList.svelte';

  let employees: EmployeeDto[] = undefined;

  onMount(async () => {
    employees = await fetchEmployees();
  });

  let value = '';

  $: filteredEmployees =
    employees === undefined
      ? employees
      : employees.filter((employee) => {
          if (value.trim().length === 0) return employee;
          return (
            employee.yoShort.toLowerCase().includes(value.toLowerCase()) ||
            employee.firstName
              .toLowerCase()
              .concat(' ', employee.lastName.toLowerCase())
              .includes(value.toLowerCase()) ||
            employee.lastName
              .toLowerCase()
              .concat(' ', employee.firstName.toLowerCase().toLowerCase())
              .includes(value.toLowerCase()) ||
            employee.birthDate.toLowerCase().includes(value.toLowerCase()) ||
            employee.hireDate.toLowerCase().includes(value.toLowerCase()) ||
            employee.position.toLowerCase().includes(value.toLowerCase())
          );
        });
</script>

{#if !employees}
  <EmployeesSkeletonList elements={20} />
{:else}
  <ToolbarSearch
    bind:value
    placeholder="Search here for names, birth dates, hire dates and so on."
  />
  <section class="employee__container">
    {#each filteredEmployees as employee}
      <Tile class="employee">
        <div class="employee--image">
          <LazyLoadedImage
            src={employee.picture}
            alt={`${employee.yoShort}'s image'`}
            fallback={'/assets/images/user-avatar.png'}
            class="employee--lazy-image"
          />
        </div>

        <div class="employee__info--primary">
          <div class="employee--name">
            {`${employee.firstName} ${employee.lastName}`}
          </div>
          <div class="employee--role">
            {employee.position}
          </div>
        </div>

        <div class="employee__info--secondary">
          <div class="employee__info--details">
            <div>
              <span class="label">Employee Code</span>
              <span>{employee.yoShort}</span>
            </div>
            <div>
              <span class="label">Hire Date</span>
              <span>{employee.hireDate}</span>
            </div>
          </div>
          <div class="employee__info--details">
            <div>
              <span class="label">Birthday</span>
              <span>{employee.birthDate}</span>
            </div>
          </div>
        </div>
      </Tile>
    {/each}
  </section>
{/if}

<style>
  .employee__container {
    display: flex;
    gap: 25px 15px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .employee--image {
    height: 150px;
  }

  .employee__info--primary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 0.5rem;
    gap: 10px;
  }

  .employee--name {
    font-weight: bold;
    font-size: 1.25rem;
  }

  .employee--role {
    color: #999;
    font-size: 1.1rem;
  }

  .employee__info--secondary {
    width: 100%;
    margin-top: 1rem;
    background-color: rgba(100, 100, 100, 0.1);
    border: 1px solid rgba(100, 100, 100, 0.2);
    border-radius: 5px;
  }

  .employee__info--details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }

  .employee__info--details div {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .label {
    font-weight: bold;
    color: #999;
  }

  :global(.employee) {
    width: 300px;
    height: 360px;
  }

  :global(.employee--lazy-image) {
    display: flex;
    justify-content: center;
  }
</style>
