<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_SERVER, PUBLIC_IS_LOCAL } from '$env/static/public';
  import { createImageObject } from './image';

  let searchString = '';
  $: tags = searchString.split(',').map((tag) => tag.trim().toLowerCase());
  let images = [];

  let modal: HTMLDialogElement;
  let selectedImage = null;

  let observer;

  onMount(() => {
    observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });
    observer.observe(document.getElementById('loadMore'));
  });

  const handleIntersect = (entries) => {
    if (images.length > 0 && entries[0].isIntersecting) {
      doContinueSearch();
    }
  };

  const doSearch = async () => {
    const res = await fetch(`${PUBLIC_API_SERVER}/search/tags?q=${tags.join(',')}`);

    if (res.ok) {
      const data = await res.json();

      images = data.map((submission) => createImageObject(submission));
    }
  };

  const doContinueSearch = async () => {
    if (images.length === 0) {
      return;
    }

    const lastImage = images.at(-1);

    const res = await fetch(
      `${PUBLIC_API_SERVER}/search/tags?q=${tags.join(',')}&before=${lastImage.create_timestamp}`
    );

    if (res.ok) {
      const data = await res.json();

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

  const openDialog = (image) => {
    selectedImage = image;
    modal.showModal();
  };

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
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
      <figure class={`thumbnail ${image.provider}`}>
        <picture on:click={() => openDialog(image)}>
          {#if PUBLIC_IS_LOCAL === 'true'}
            <source srcset={image.local_url} />
          {/if}
          <img src={image.thumbnail_url} alt={image.title} />
        </picture>
        <figcaption>{image.title}<br /><span class="artist">by {image.username}</span></figcaption>
      </figure>
    {/each}
  </div>
  <div id="loadMore">...</div>

  <dialog
    bind:this={modal}
    on:click={() => {
      selectedImage = null;
      modal.close();
    }}
  >
    {#if selectedImage}
      <picture>
        {#if PUBLIC_IS_LOCAL === 'true'}
          <source srcset={selectedImage.local_url} />
        {/if}
        <img src={selectedImage.url} alt={selectedImage.title} />
      </picture>
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

  .gallery .thumbnail img,
  .gallery .thumbnail picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  dialog {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    border: none;
    background-color: rgba(0, 0, 0, 0.5);
  }

  dialog picture * {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
