<script>
  import {
    SkeletonPlaceholder,
    SkeletonText,
    Tile,
  } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  export let elements;
  let fakeEmployeeList = [];

  onMount(() => {
    fakeEmployeeList = new Array(elements);
  });
</script>

<SkeletonPlaceholder
  style="height: 3rem; width: 100%; margin-bottom: 1.75rem;"
/>
<section class="employee__container">
  {#each fakeEmployeeList as _}
    <Tile class="employee--placeholder">
      <SkeletonPlaceholder class="employee__image-placeholder" />
      <SkeletonText width="50%" />
      <SkeletonText width="50%" />
      <div class="employee__info--secondary">
        <SkeletonText width="100%" />
        <SkeletonText width="100%" />
        <SkeletonText width="100%" />
        <SkeletonText width="100%" />
        <SkeletonText width="100%" />
      </div>
    </Tile>
  {/each}
</section>

<style>
  .employee__container {
    display: flex;
    gap: 25px 15px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .employee__info--secondary {
    width: 100%;
    height: 150px;
    margin-top: 1rem;
    background-color: rgba(100, 100, 100, 0.1);
    border: 1px solid rgba(100, 100, 100, 0.2);
    border-radius: 5px;
    padding: 10px;
  }

  :global(.employee--placeholder) {
    width: 300px;
    height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :global(.employee__image-placeholder) {
    width: 150px;
    height: 150px;
    margin-bottom: 10px;
  }
</style>
