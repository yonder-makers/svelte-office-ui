<script lang="ts">
  import { AccordionItem, Checkbox, Tag } from 'carbon-components-svelte';
  import type {
    ActiveFilters,
    FilterItem,
  } from './interfaces/filter.interface';

  export let activeFilters: ActiveFilters;
  export let filters: FilterItem[];
  export let filterAttr: string;
  export let filterCategory: string;
  export let prevFilter: string;

  const clearSelectedFilters = (source: FilterItem[]) => {
    return source.map((item) => {
      return {
        ...item,
        selected: false,
      };
    });
  };
</script>

<AccordionItem class="filter__content">
  <svelte:fragment slot="title">
    <div class="filter__title">
      <div>{filterCategory}</div>
      {#if activeFilters[filterAttr].length > 0}
        <Tag
          type="high-contrast"
          filter
          on:close={() => {
            prevFilter = '';
            filters = clearSelectedFilters(filters);
          }}>{activeFilters[filterAttr].length}</Tag
        >
      {/if}
    </div>
  </svelte:fragment>
  <div class="filter__items">
    {#each filters as item}
      <Checkbox
        labelText={item.text}
        value={item.value}
        bind:checked={item.selected}
        on:blur={(e) => e.preventDefault()}
        on:change={() => (prevFilter = filterAttr)}
      />
    {/each}
  </div>
</AccordionItem>

<style>
  .filter__items {
    width: 100%;
    max-height: 180px;
    overflow: auto;
  }

  .filter__title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  :global(.filter__items .bx--checkbox) {
    position: initial;
  }
</style>
