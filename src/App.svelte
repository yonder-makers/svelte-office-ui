<script lang="ts">
  import ManagePage from './pages/ManagePage.svelte';
  import Menu from './components/Menu.svelte';
</script>

<main>
  <div class="left-menu">
    <Menu />
  </div>
  <div class="content">
    <ManagePage />
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
