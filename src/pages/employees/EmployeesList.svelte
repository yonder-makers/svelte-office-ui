<script lang="ts">
  import { Tile, Search } from 'carbon-components-svelte';
  import LazyLoadedImage from '../../components/LazyLoadedImage.svelte';
  import { onMount } from 'svelte';
  import type { EmployeeDto } from '../../apis/employee.api';
  import { fetchEmployees } from '../../apis/employee.api';
  import EmployeesSkeletonList from './EmployeesSkeletonList.svelte';
  import type { ActiveFilters } from './interfaces/filter.interface';
  import EmployeesFilter from './EmployeesFilter.svelte';
  import { get } from 'svelte/store';
  import { authState } from '@svelte-office/state';

  interface Employee extends EmployeeDto {
    hireYear: string;
    hireMonth: string;
    birthYear: string;
    birthMonth: string;
  }

  let value = '';
  let employees: Employee[] = undefined;
  let activeFilters: ActiveFilters = {
    departmentName: [],
    position: [],
    hireYear: [],
    hireMonth: [],
    birthYear: [],
    birthMonth: [],
  };

  onMount(async () => {
    const webOfficeUrl = get(authState).webOfficeUrl;

    const response = await fetchEmployees();
    employees = response
      .sort(
        (a, b) =>
          a.firstName.localeCompare(b.firstName) ||
          a.lastName.localeCompare(b.lastName),
      )
      .map((employee) => {
        return {
          ...employee,
          picture: employee.picture.includes('/.jpg')
            ? '/assets/images/user-avatar.png'
            : `${webOfficeUrl}${employee.picture}`,
          hireYear: employee.hireDate.substring(6, 10),
          hireMonth: employee.hireDate.substring(3, 5),
          birthYear: employee.birthDate?.substring(6, 10),
          birthMonth: employee.birthDate?.substring(3, 5),
        };
      });
  });

  $: queriedEmployees =
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
              .concat(' ', employee.firstName.toLowerCase())
              .includes(value.toLowerCase()) ||
            employee.birthDate.toLowerCase().includes(value.toLowerCase()) ||
            employee.hireDate.toLowerCase().includes(value.toLowerCase()) ||
            employee.position.toLowerCase().includes(value.toLowerCase())
          );
        });

  $: allActiveFiltersLength =
    activeFilters.departmentName.length +
    activeFilters.position.length +
    activeFilters.birthYear.length +
    activeFilters.birthMonth.length +
    activeFilters.hireYear.length +
    activeFilters.hireMonth.length;

  $: filteredEmployees =
    allActiveFiltersLength === 0
      ? queriedEmployees
      : queriedEmployees
          .filter((employee) =>
            activeFilters.departmentName.length === 0
              ? true
              : activeFilters.departmentName
                  .map((item) => item.value)
                  .includes(employee.departmentName),
          )
          .filter((employee) =>
            activeFilters.position.length === 0
              ? true
              : activeFilters.position
                  .map((item) => item.value)
                  .includes(employee.position),
          )
          .filter((employee) =>
            activeFilters.hireYear.length === 0
              ? true
              : activeFilters.hireYear
                  .map((item) => item.value)
                  .includes(employee.hireYear),
          )
          .filter((employee) =>
            activeFilters.hireMonth.length === 0
              ? true
              : activeFilters.hireMonth
                  .map((item) => item.value)
                  .includes(employee.hireMonth),
          )
          .filter((employee) =>
            activeFilters.birthYear.length === 0
              ? true
              : activeFilters.birthYear
                  .map((item) => item.value)
                  .includes(employee.birthYear),
          )
          .filter((employee) =>
            activeFilters.birthMonth.length === 0
              ? true
              : activeFilters.birthMonth
                  .map((item) => item.value)
                  .includes(employee.birthMonth),
          );
</script>

{#if !employees}
  <EmployeesSkeletonList elements={20} />
{:else}
  <section class="employee__toolbar">
    <h1>{filteredEmployees.length} Employees</h1>
  </section>

  <div class="employee__content">
    <section class="employee__filters">
      <Search
        bind:value
        size="lg"
        searchClass="employee__search"
        placeholder="Search here for names, birth dates, hire dates and so on."
      />
      <EmployeesFilter bind:activeFilters bind:employees />
    </section>

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
  </div>
{/if}

<style>
  .employee__toolbar {
    display: flex;
    align-items: center;
    gap: 25px;
    margin-bottom: 25px;
  }

  .employee__content {
    display: flex;
    gap: 25px;
  }

  .employee__filters {
    display: flex;
    flex-direction: column;
    gap: 25px;
    flex: 0 0 250px;
  }

  .employee__container {
    display: flex;
    gap: 25px 15px;
    flex-wrap: wrap;
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
