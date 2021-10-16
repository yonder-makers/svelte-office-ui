<script lang="ts">
  // White theme
  import {
    Content,
    Header,
    HeaderNav,
    HeaderNavItem,
  } from 'carbon-components-svelte';
  import 'carbon-components-svelte/css/white.css';
  import Routing from './Routing.svelte';
</script>

<Header company="Yonder" platformName="WebOffice">
  <HeaderNav style="display:block">
    <HeaderNavItem href="#/my-tr" text="My Time Registration" />
    <HeaderNavItem href="#/employees" text="Employees" />
  </HeaderNav>
</Header>
<Content>
  <Routing />
</Content>

<style>
</style>
