<script lang="ts">
  import {Button, Modal, Tab, TabContent, Tabs} from 'carbon-components-svelte';
  import AddTaskModalFavorites from './AddTaskModalFavorites.svelte';
  import AddTaskModalById from './AddTaskModalById.svelte';
  import AddTaskModalSearch from './AddTaskModalSearch.svelte';

  let open = false;
  
</script>

<Button on:click={() => (open = true)}>Add new task</Button>

<Modal
  bind:open
  primaryButtonDisabled={true}
  modalHeading="Add a new task"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (open = false)}
  on:open
  on:close
>
  <Tabs>
    <Tab label="Your favorite tasks" />
    <Tab label="Find by task ID" />
    <Tab label="Find task"/>
    <svelte:fragment slot="content">
      <TabContent>
        <AddTaskModalFavorites on:onTasksAdded={() => open = false}  />
      </TabContent>
      <TabContent>
        <AddTaskModalById on:onTasksAdded={() => open = false} />
      </TabContent>
      <TabContent>
        <AddTaskModalSearch on:onTasksAdded={() => open = false}/>
      </TabContent>
    </svelte:fragment>
</Tabs>
</Modal>