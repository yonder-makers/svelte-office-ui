<script lang="ts">
  import {
    Button,
    InlineLoading,
    NumberInput,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListRow,
  } from 'carbon-components-svelte';
  import type {TaskDto} from '../../../apis/tasks.api';
  import {getTaskById} from '../../../apis/tasks.api';
  import {addNewTask} from '../store/actions';
  import {createEventDispatcher} from 'svelte';

  const dispatch = createEventDispatcher();

  let taskId = '';

  let loadingStatus: 'inactive' | 'active' | 'finished' = 'inactive';
  let loadingDescription = '';

  let selectedTask: TaskDto = undefined;

  async function fetchInfo() {
    const id = parseInt(taskId);
    selectedTask = undefined;
    loadingDescription = `Fetching info about task ${id}`;
    loadingStatus = 'active';
    selectedTask = await getTaskById(id);
    loadingStatus = 'finished';
    loadingDescription = `Task exists! Now, let's hope you are also assigned on this task.`;
  }

  function onSubmit() {
    try {
      addNewTask(selectedTask);
      dispatch("onTasksAdded", [selectedTask.taskId]);
    } catch (err) {
      console.error(err);
    }
  }

</script>
<NumberInput
  label="Task ID"
  bind:value={taskId}
  placeholder="Enter the task id"
  hideSteppers={true}
  />
<Button disabled={loadingStatus === 'active'} on:click={fetchInfo}>Fetch info</Button>

<InlineLoading status={loadingStatus} description={loadingDescription} />
{#if selectedTask}
  <StructuredList condensed>
    <StructuredListBody>
      <StructuredListRow>
        <StructuredListCell noWrap>Task ID</StructuredListCell>
        <StructuredListCell>{selectedTask.taskId}</StructuredListCell>
      </StructuredListRow>
      <StructuredListRow>
        <StructuredListCell noWrap>Project name</StructuredListCell>
        <StructuredListCell>{selectedTask.project}</StructuredListCell>
      </StructuredListRow>
      <StructuredListRow>
        <StructuredListCell noWrap>Description</StructuredListCell>
        <StructuredListCell>{selectedTask.custRefDescription || selectedTask.description}</StructuredListCell>
      </StructuredListRow>
    </StructuredListBody>
  </StructuredList>
{/if}

<Button disabled={selectedTask === undefined} on:click={onSubmit}>Add</Button>




