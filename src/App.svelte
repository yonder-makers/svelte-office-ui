<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfile } from './apis/auth-api';

  import Menu from './components/Menu.svelte';
  import Routing from './Routing.svelte';
  import { authState } from './state/auth/auth.state';

  onMount(async () => {});
</script>

<main>
  <div class="left-menu">
    <Menu />
  </div>
  <div class="content">
    <Routing />
  </div>
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: row;
  }

  .left-menu {
    flex: 0 0 120px;
    background-color: bisque;
  }

  .content {
    flex: 1;
  }
</style>
