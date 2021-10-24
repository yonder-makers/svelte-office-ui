<script lang="ts">
  import {
    Content,
    Header,
    HeaderNav,
    HeaderNavItem,
  } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/white.css';
  import { onMount } from 'svelte';
  import Routing from './Routing.svelte';
  import { loadConfiguration } from './state/auth/auth.actions';
  import { isConfigLoaded } from './state/auth/auth.state';

  onMount(() => {
    loadConfiguration();
  });
</script>

<Header company="Yonder" platformName="WebOffice">
  <HeaderNav style="display:block">
    <HeaderNavItem href="#/my-tr" text="My Time Registration" />
    <HeaderNavItem href="#/employees" text="Employees" />
  </HeaderNav>
</Header>
<Content>
  {#if $isConfigLoaded}
    <Routing />
  {:else}
    Please wait to load configuration.
  {/if}
</Content>

<style>
</style>
