<script lang="ts">
  import type { SubmissionDetail, ImageObject } from './image';

  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_SERVER } from '$env/static/public';
  import { createImageObject } from './image';
  import LazyImg from './lazy-img.svelte';

  let searchString = '';
  $: tags = searchString.split(',').map((tag) => tag.trim().toLowerCase());
  let images: ImageObject[] = [];

  let modal: HTMLDialogElement;
  let selectedImage: ImageObject | null = null;

    let observer: IntersectionObserver;
    let lazyLoadImageObserver: IntersectionObserver;

    onMount(() => {
      observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          if (images.length > 0 && entries[0].isIntersecting) {
            doContinueSearch();
          }
        },
        {
          root: null,
          rootMargin: '400px',
          threshold: 1,
        }
      );
      observer.observe(document.getElementById('loadMore')!);

      lazyLoadImageObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src') || '';
            img.setAttribute('src', src);
            lazyLoadImageObserver.unobserve(img);
          }
        });
      });
    });

    const doSearch = async () => {
      const res = await fetch(`${PUBLIC_API_SERVER}/search/tags?q=${tags.join(',')}`);

      if (res.ok) {
        const data: SubmissionDetail[] = await res.json();

        images = data.map((submission) => createImageObject(submission));
      }
    };

    const doContinueSearch = async () => {
      if (images.length === 0) {
        return;
      }

      const lastImage = images.at(-1)!;

      const res = await fetch(
        `${PUBLIC_API_SERVER}/search/tags?q=${tags.join(',')}&before=${lastImage.create_timestamp}`
      );

      if (res.ok) {
        const data: SubmissionDetail[] = await res.json();

        let concatedImages = [...images];
        const newImages = data.map((submission) => createImageObject(submission));

        newImages.forEach((image) => {
          if (concatedImages.findLastIndex((i) => i._id === image._id) === -1) {
            concatedImages.push(image);
          }
        });
        images = concatedImages;
      }
    };

    const openDialog = (image: ImageObject) => {
      selectedImage = image;
      modal.showModal();
    };

    onDestroy(() => {
      if (observer) {
        observer.disconnect();
      }
      if (lazyLoadImageObserver) {
        lazyLoadImageObserver.disconnect();
      }
    });
  </script>

  <svelte:head>
    <title>Favorite Search</title>
    <meta name="description" content="Search for your favorite tags" />
  </svelte:head>

<div class="root container">
  <nav class="search-bar">
    <input
      on:keypress={(e) => e.key === 'Enter' && doSearch()}
      class="search tags"
      bind:value={searchString}
      placeholder="Search for tags"
    />
    <button class="btn" on:click={doSearch}>Search</button>
  </nav>
  <div class="gallery">
    {#each images as image}
      <figure class={`thumbnail ${image.provider}`} on:click={() => openDialog(image)} on:keydown={(e) => e.key === 'Enter' && openDialog(image)}>
        <LazyImg srcset={image.thumbnail_urls} alt={image.title} />
        <figcaption>{image.title}<br /><span class="artist">by {image.username}</span></figcaption>
      </figure>
    {/each}
  </div>
  <div id="loadMore">...</div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <dialog
    bind:this={modal}
    on:click={() => {
      selectedImage = null;
      modal.close();
    }}
  >
    {#if selectedImage}
      <LazyImg srcset={selectedImage.urls} alt={selectedImage.title} />
    {/if}
  </dialog>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .search-bar {
    z-index: 10;
    position: sticky;
    top: 0;
    padding: 1rem;
    background-image: linear-gradient(var(--color-bg-1) 80%, transparent);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }

  .search-bar .search {
    width: 100%;
    height: 100%;
    padding: 1rem;
    font-size: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    outline: none;
  }

  .search-bar .btn {
    padding: 1rem;
    font-size: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    outline: none;
  }

  .gallery {
    display: grid;
    width: 100%;
    height: auto;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, calc(200px + 0.5rem));
    justify-content: center;
  }

  .gallery .thumbnail {
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 3px solid brown;
    margin: 0;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .gallery .thumbnail:hover {
    transform: rotate(-2deg);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }

  .gallery .thumbnail figcaption {
    position: absolute;
    width: 100%;
    bottom: 0;
    text-align: center;
    font-size: 1em;
    font-weight: bold;
    color: #ddd;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.1rem 0;
  }

  .gallery .thumbnail figcaption .artist {
    font-size: 0.8em;
    font-weight: normal;
  }

  .gallery .thumbnail.inkbunny {
    border-color: #ff3e00;
  }

  .gallery .thumbnail.furaffinity {
    border-color: #40b3ff;
  }

  dialog {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    border: none;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
