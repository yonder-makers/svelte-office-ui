<script>
  export let src;
  export let alt;
  export let fallback;
  import { onMount } from 'svelte';
  let loaded = false;
  let thisImage;
  onMount(() => {
    thisImage.onload = () => {
      loaded = true;
    };
  });
</script>

<img
  {src}
  {alt}
  class:loaded
  bind:this={thisImage}
  loading="lazy"
  onerror="this.src='{fallback}'"
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
