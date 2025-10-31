<script lang="ts">
  import {Button, Modal, Tab, TabContent, Tabs} from 'carbon-components-svelte';
  import AddTaskModalFavorites from './AddTaskModalFavorites.svelte';
  import AddTaskModalById from './AddTaskModalById.svelte';
  import AddTaskModalSearch from './AddTaskModalSearch.svelte';

  let open = false;
  let currentTab = 0;
  
  let favoritesComponent: AddTaskModalFavorites;
  let byIdComponent: AddTaskModalById;
  let searchComponent: AddTaskModalSearch;

  let canAdd = false;

  function handlePrimaryClick() {
    if (currentTab === 0 && favoritesComponent) {
      favoritesComponent.submit();
    } else if (currentTab === 1 && byIdComponent) {
      byIdComponent.submit();
    } else if (currentTab === 2 && searchComponent) {
      searchComponent.submit();
    }
    open = false;
  }
</script>

<Button on:click={() => (open = true)}>Add new task</Button>

<Modal
  bind:open
  primaryButtonDisabled={!canAdd}
  primaryButtonText="Add"
  modalHeading="Add a new task"
  secondaryButtonText="Cancel"
  on:click:button--primary={handlePrimaryClick}
  on:click:button--secondary={() => (open = false)}
  on:open
  on:close
>
  <Tabs bind:selected={currentTab}>
    <Tab label="Your favorite tasks" />
    <Tab label="Find by task ID" />
    <Tab label="Find task"/>
    <svelte:fragment slot="content">
      <TabContent>
        <AddTaskModalFavorites bind:this={favoritesComponent} bind:canSubmit={canAdd} on:onTasksAdded={() => open = false}  />
      </TabContent>
      <TabContent>
        <AddTaskModalById bind:this={byIdComponent} bind:canSubmit={canAdd} on:onTasksAdded={() => open = false} />
      </TabContent>
      <TabContent>
        <AddTaskModalSearch bind:this={searchComponent} bind:canSubmit={canAdd} on:onTasksAdded={() => open = false}/>
      </TabContent>
    </svelte:fragment>
</Tabs>
</Modal>