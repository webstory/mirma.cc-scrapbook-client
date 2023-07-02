<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_SERVER, PUBLIC_IS_LOCAL } from '$env/static/public';

  let imgEl: HTMLImageElement;
  let src = '';
  export let alt = '';

  export let srcset: string[] = [];

  let observer: IntersectionObserver;

  onMount(() => {
    if (srcset.length === 0) {
      return;
    }

    observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(imgEl);
          const img = new Image();
          img.onload = () => {
            src = img.src;
          };
          img.onerror = () => {
            if (srcset.length === 0) {
              return;
            }
            img.src = srcset.shift()!;
          };

          img.src = srcset.shift()!;
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );
    observer.observe(imgEl);
  });

  onDestroy(() => {
    if (observer) {
      observer.unobserve(imgEl);
    }
  });
</script>

<img bind:this={imgEl} {src} {alt} />

<style>
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
