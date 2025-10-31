<script lang="ts">
  import {Checkbox, DataTable, Search, Toolbar, ToolbarContent} from 'carbon-components-svelte';
  import {addNewTask, assignableTasks, newlyAddedTaskIds} from '../store';
  import {tasksWithLoggedHours} from '../store/selectors';
  import type {TaskDto} from "../../../apis/tasks.api";

  export let canSubmit: boolean = false;

  let value = '';
  let filtered = $assignableTasks;

  // Search tab doesn't need a submit button - tasks are added immediately
  $: canSubmit = false;

  export function submit() {
    // No-op for search tab - tasks are added on checkbox change
  }

  $: filtered = $assignableTasks
          .map((task: TaskDto) => {
            return {
              ...task,
              // DataTable requires a field "id" on the entity
              id: task.taskId,
              // both descriptions are consolidated in a single one
              description: task.custRefDescription ? task.custRefDescription : task.description
            }
          })
          .filter((task: TaskDto) => {
            let val = value.toLowerCase();
            return val == ''
                    || task.taskId.toString().toLowerCase().includes(val)
                    || task.project.toString().toLowerCase().includes(val)
                    || task.description.toString().toLowerCase().includes(val)
          })
          .sort((a: TaskDto, b: TaskDto) => a.taskId > b.taskId);

  function onCheck(task: TaskDto, event: Event) {
    try {
      const checkbox = event.target as HTMLInputElement;
      if (checkbox.checked) {
        addNewTask(task);
      }
    } catch (err) {
      console.error(err);
    }
  }
</script>

<!--the table can't be made stickyHeader because a lot of things break-->
<DataTable
        headers={[
                    { key: "add", value: "Add" },
                    { key: "taskId", value: "ID" },
                    { key: "project", value: "Project" },
                    { key: "description", value: "Description" },
                 ]}
        rows={filtered}
>

  <svelte:fragment slot="cell" let:row let:cell>
    {#if cell.key === "add"}
      <Checkbox
              indeterminate={$tasksWithLoggedHours.includes(row.taskId)}
              disabled={$tasksWithLoggedHours.includes(row.taskId) || $newlyAddedTaskIds.includes(row.taskId)}
              checked={$newlyAddedTaskIds.includes(row.taskId)}
              on:change={(event) => {onCheck(row, event)}}
      />
    {:else}
      {cell.value}
    {/if}
  </svelte:fragment>

    <Toolbar>
      <ToolbarContent>
        <Search
                bind:value
                size="lg"
                searchClass="task__search"
                placeholder="Search here for id, project or description."
        />

        <!--  after upgrading carbon components svelte version-->
<!--        <ToolbarSearch-->
<!--                persistent-->
<!--                shouldFilterRows={(task, value) => {-->
<!--            return value === ''-->
<!--                      || task.taskId.toString().includes(value)-->
<!--                      || task.project.toString().includes(value)-->
<!--                      || task.description.toString().includes(value)-->
<!--          }}-->
<!--        />-->
      </ToolbarContent>
    </Toolbar>
</DataTable>