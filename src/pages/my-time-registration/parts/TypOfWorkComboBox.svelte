<script lang="ts">
  import { ComboBox } from 'carbon-components-svelte';
  import type { ComboBoxItem } from 'carbon-components-svelte/types/ComboBox/ComboBox';
  import { derived } from 'svelte/store';
  import { typesOfWork } from '../store/state';

  function typeOfWorkString(typeOfWork: ComboBoxItem) {
    return `${typeOfWork.id} (${typeOfWork.text})`;
  }

  function typeOfWorkFilter(typeOfWork: ComboBoxItem, value: string) {
    value = value.toLocaleLowerCase();
    if (typeOfWork.id.toLocaleLowerCase().indexOf(value) >= 0) return true;
    if (typeOfWork.text.toLocaleLowerCase().indexOf(value) >= 0) return true;
    return false;
  }

  const typesOfWorkComboItems = derived(typesOfWork, (types) => {
    return types.map((t) => {
      return {
        id: t.key,
        text: t.description,
      };
    });
  });

  export let selectedIndex = 0;
</script>

{#if $typesOfWorkComboItems.length > 0}
  <ComboBox
    items={$typesOfWorkComboItems}
    titleText="Type of work"
    placeholder="Select the type of work"
    itemToString={typeOfWorkString}
    shouldFilterItem={typeOfWorkFilter}
    bind:selectedIndex
  />
{/if}
