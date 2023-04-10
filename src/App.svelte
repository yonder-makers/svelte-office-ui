<script lang="ts">
  import {
    Content,
    Header,
    HeaderNav,
    HeaderNavItem,
  } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/white.css';
  import { onMount } from 'svelte';
  import { replace } from 'svelte-spa-router';
  import Notifications from './components/Notifications.svelte';
  import Routing from './Routing.svelte';
  import {
    checkAuthentication,
    loadConfiguration,
  } from './state/auth/auth.actions';
  import {
    isConfigLoaded,
    isUserAuthenticated,
    loggedOut,
  } from './state/auth/auth.state';

  onMount(async () => {
    await loadConfiguration();
    await checkAuthentication();
  });

  isUserAuthenticated.subscribe((isAuth) => {
    if (!isAuth) {
      replace('/login');
    }
  });
</script>

<Header company="Yonder" platformName="SvelteOffice">
  <HeaderNav style="display:block">
    {#if $isUserAuthenticated}
      <HeaderNavItem href="#/my-tr" text="My Time Registration" />
      <HeaderNavItem href="#/employees" text="Employees" />
      <HeaderNavItem on:click={loggedOut} text="Logout" />
    {/if}
  </HeaderNav>
</Header>
<Content>
  {#if $isConfigLoaded}
    <Routing />
  {:else}
    Please wait to load configuration.
  {/if}
</Content>

<Notifications />

<style>
  :global(.bx--search-input) {
    margin: 0;
  }
</style>
