<script lang="ts">
  import {
    Content,
    Header,
    HeaderNav,
    HeaderNavItem,
    Theme,
  } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/all.css';
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
  import { themeStore } from './state/theme/theme.state';
  import Asleep from 'carbon-icons-svelte/lib/Asleep.svelte';
  import Light from 'carbon-icons-svelte/lib/Light.svelte';
  import ThemeToggle from './components/ThemeToggle.svelte';

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

<Theme bind:theme={$themeStore}>
  {#if $isUserAuthenticated}
    <Header company="Yonder" platformName="SvelteOffice">
      <HeaderNav
        style="display: flex; align-items: center; width: 100%; line-height: 48px;"
      >
        <HeaderNavItem href="#/my-tr" text="My Time Registration" />
        <HeaderNavItem href="#/employees" text="Employees" />
        <HeaderNavItem href="#/holidays" text="Holidays" />
        <HeaderNavItem on:click={loggedOut} text="Logout" />
        <div style="margin-left: auto; display: flex; align-items: center;">
          <ThemeToggle />
        </div>
      </HeaderNav>
    </Header>
  {/if}
  <Content>
    {#if $isConfigLoaded}
      <Routing />
    {:else}
      Please wait to load configuration.
    {/if}
  </Content>
</Theme>

<Notifications />
