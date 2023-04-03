<script>
  export let src;
  export let alt;
  export let fallback;

  import IntersectionObserver from './IntersectionObserver.svelte';
  import Image from './Image.svelte';
  let nativeLoading = false;
</script>

<IntersectionObserver once={true} let:intersecting class={$$props.class}>
  {#if intersecting || nativeLoading}
    <Image {alt} {src} {fallback} />
  {/if}
</IntersectionObserver>
