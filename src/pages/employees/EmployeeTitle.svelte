<script lang="ts">
  import { authState } from '@svelte-office/state';

  export let yoShort: string;
  export let employeeName: string;
  export let department: string | undefined;

  $: canView =
    $authState.role === 'ADMIN' &&
    ($authState.departmentContext === undefined ||
      department === undefined ||
      $authState.departmentContext == department);
</script>

{#if canView}
  <a href="#/employees/{yoShort}">{employeeName}</a>
{:else}
  {employeeName}
{/if}
