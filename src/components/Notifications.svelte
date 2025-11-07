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
      kind={item.kind}
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
    position: fixed;
    z-index: 999999;
    top: 0;
    right: 0;
    pointer-events: none;
  }

  :global(.bx--toast-notification) {
    pointer-events: auto;
  }
</style>
