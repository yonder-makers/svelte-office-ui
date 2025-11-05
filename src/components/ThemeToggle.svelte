<script lang="ts">
  import { HeaderNavItem } from 'carbon-components-svelte';
  import { onMount } from 'svelte';
  import { themeStore, toggleTheme } from '../state/theme/theme.state';

  let imageLoaded = false;

  onMount(() => {
    // Preload the Darth Vader image
    const img = new Image();
    img.src = '/assets/darthvader.svg';
    img.onload = () => {
      imageLoaded = true;
    };
  });
</script>

<div class="theme-toggle-wrapper">
  <HeaderNavItem on:click={toggleTheme}>
    <div style="display: flex; align-items: center;">
      {#if $themeStore === 'white'}
        <span class="dark-side-text">Join the Dark Side</span> <img src="/assets/death-star-svgrepo-com.svg" alt="Death Star" class="death-star-icon" />
      {:else}
        ☀️ Return to the Light
      {/if}
    </div>
  </HeaderNavItem>
  {#if $themeStore === 'white'}
    <div class="vader-popup">
      <img src="/assets/darthvader.svg" alt="Darth Vader" />
    </div>
  {/if}
</div>

<style>
  .theme-toggle-wrapper {
    position: relative;
  }

  .vader-popup {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px) scale(0.95);
    transition: opacity 0.7s ease, transform 0.7s ease;
    z-index: 1000;
  }

  .theme-toggle-wrapper:hover .vader-popup {
    opacity: 1;
    transform: translateY(0) scale(1);
    animation: shake 0.05s 10;
  }

  .vader-popup img {
    width: 300px;
    height: auto;
    display: block;
  }

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}

  .death-star-icon {
    width: 24px;
    height: 24px;
    vertical-align: middle;
    margin-left: 8px;
    filter: invert(1) drop-shadow(0 0 5px #fff);
  }

  .dark-side-text {
    color: #ff8a8a;
    text-shadow: 0 0 5px #f00;
    font-weight: bold;
  }

  .theme-toggle-wrapper :global(li) {
    list-style: none;
  }
</style>
