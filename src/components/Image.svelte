<script lang="ts">
  export let src: string;
  export let alt: string;
  export let fallback: string;
  import { onMount } from 'svelte';
  let loaded = false;
  let thisImage: HTMLImageElement;
  
  onMount(() => {
    thisImage.onload = () => {
      loaded = true;
    };
  });

  function handleError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = fallback;
    }
  }
</script>

<img
  {src}
  {alt}
  class:loaded
  bind:this={thisImage}
  loading="lazy"
  on:error={handleError}
/>

<style>
  img {
    height: 150px;
    width: 150px;
    opacity: 0;
    transition: opacity 1200ms ease-out;
    border: 1px solid transparent;
    border-radius: 150px;
    object-fit: cover;
  }
  img.loaded {
    opacity: 1;
  }
</style>
