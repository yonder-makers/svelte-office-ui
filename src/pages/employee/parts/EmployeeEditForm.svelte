<script lang="ts">
  import { Button, Form, FormGroup } from 'carbon-components-svelte';
  import { putEmployee } from '../../../apis/employee.api';
  import { activeEntry, departmentNames, refreshData } from '../store';
  import DepartmentsComboBox from './DepartmentsComboBox.svelte';
  import { addNotification } from '../../../state/notifications/notifications.state';

  let initialDepartmentValue = $activeEntry?.departmentName ?? '';
  let departmentValue = $activeEntry?.departmentName ?? '';

  $: hasChanges = departmentValue !== initialDepartmentValue;

  async function save() {
    const departmentName = departmentValue?.trim();

    const options = {
      yoShort: $activeEntry?.yoShort,
      departmentName: departmentName.length === 0 ? undefined : departmentValue,
    };

    try {
      await putEmployee(options);

      const forceRefreshDepartments =
        $departmentNames.indexOf(departmentName) < 0;
      refreshData(forceRefreshDepartments);
    } catch (error) {
      addNotification(
        'Error from server',
        error.errorDescription ?? 'Error, try again?',
        '',
      );
      console.log(error);
    }
  }
</script>

<h2>Update employee</h2>

<!-- Value: {departmentValue}
Initial value: {initialDepartmentValue} -->

<Form on:submit>
  <FormGroup>
    <div class="departments">
      <DepartmentsComboBox bind:value={departmentValue} />
    </div>
  </FormGroup>
  <Button disabled={!hasChanges} on:click={save}>Save</Button>
</Form>

<style>
  :global(.bx--combo-box) {
    border-bottom: 0 !important; /* this is a bug in Carbon, it shows 2 bottom borders for some reason */
  }
  h2 {
    margin-top: 60px;
  }

  .departments {
    max-width: 300px;
  }
</style>
