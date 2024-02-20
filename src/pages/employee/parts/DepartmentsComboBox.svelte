<script lang="ts">
  import { ComboBox } from 'carbon-components-svelte';
  import { derived } from 'svelte/store';
  import { departmentNames } from '../store/state';

  const comboItems = derived(departmentNames, (names) => {
    return names.map((name) => {
      return {
        id: name,
        text: name,
      };
    });
  });

  export let value: string;
</script>

<ComboBox
  items={$comboItems}
  titleText="Department (select an existing one from the list, or type to create a new one)"
  placeholder="Select or leave it empty"
  selectedIndex={$comboItems.findIndex((item) => item.id === value)}
  bind:value
/>
