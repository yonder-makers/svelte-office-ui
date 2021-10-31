<script lang="ts">
  import { ToastNotification } from 'carbon-components-svelte';
  import {
    closeNotification,
    notifications,
  } from '../state/notifications/notifications.state';
</script>

<div>
  {#each $notifications as item}
    <ToastNotification
      lowContrast
      kind="error"
      title={item.title}
      subtitle={item.description}
      caption={item.footer}
      on:close={() => closeNotification(item.id)}
      timeout={10000}
    />
  {/each}
</div>

<style>
  div {
    position: absolute;
    z-index: 1000;
    top: 0;
    right: 0;
  }
</style>
