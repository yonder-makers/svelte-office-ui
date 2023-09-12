<script lang="ts">
  import {Checkbox, DataTable, Search, Toolbar, ToolbarContent} from 'carbon-components-svelte';
  import {addNewTask, assignableTasks, tasksState} from '../store';
  import type {TaskDto} from "../../../apis/tasks.api";

  let value = '';
  let filtered = $assignableTasks;

  const selected: Record<number, boolean> = {};

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
            return value == ''
                    || task.taskId.toString().includes(value)
                    || task.project.toString().includes(value)
                    || task.description.toString().includes(value)
          })
          .sort((a: TaskDto, b: TaskDto) => a.taskId > b.taskId);

  function onCheck(task: TaskDto) {
    try {
      addNewTask(task);
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
              indeterminate={$tasksState.byId[row.taskId] !== undefined}
              disabled={$tasksState.byId[row.taskId] !== undefined || selected[row.taskId]}
              bind:checked={selected[row.taskId]}
              on:check={(_event) => {onCheck(row)}}
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

<style>
  :global(.bx--tab-content) {
    padding: 0 !important;
  }
</style>