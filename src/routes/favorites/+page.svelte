<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_API_SERVER, PUBLIC_IS_LOCAL } from '$env/static/public';

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
      let ib_submissions = data.filter((s) => s.provider === 'inkbunny');
      let fa_submissions = data.filter((s) => s.provider === 'furaffinity');

      let ib_images = ib_submissions.map((s) => {
        return {
          _id: s._id,
          local_url: `${PUBLIC_API_SERVER}/img/local/inkbunny/${s.username}/${s.file_name}`,
          url: `${PUBLIC_API_SERVER}/signed-url/hoya-inkbunny-pictures/${s.username}/${s.file_name}`,
          thumbnail_url: `${PUBLIC_API_SERVER}/signed-url/inkbunny-thumbnails/${s.username}/${s.file_name}`,
          title: s.title,
          provider: s.provider,
          create_timestamp: s.create_timestamp,
        };
      });

      let fa_images = fa_submissions.map((s) => {
        return {
          _id: s._id,
          local_url: `${PUBLIC_API_SERVER}/img/local/furaffinity/${s.username}/${s.file_name}`,
          url: `${PUBLIC_API_SERVER}/signed-url/hoya-furaffinity-pictures/${s.username}/${s.file_name}`,
          thumbnail_url: `${PUBLIC_API_SERVER}/signed-url/furaffinity-thumbnails/${s.username}/${s.file_name}`,
          title: s.title,
          provider: s.provider,
          create_timestamp: s.create_timestamp,
        };
      });

      images = [...ib_images, ...fa_images].sort((a, b) => b.create_timestamp - a.create_timestamp);
    }
  };

  const doContinueSearch = async () => {
    const lastImage = images.at(-1);

    const res = await fetch(
      `${PUBLIC_API_SERVER}/search/tags?q=${tags.join(',')}&before=${lastImage.create_timestamp}`
    );

    if (res.ok) {
      const data = await res.json();
      let ib_submissions = data.filter((s) => s.provider === 'inkbunny');
      let fa_submissions = data.filter((s) => s.provider === 'furaffinity');

      let ib_images = ib_submissions.map((s) => {
        return {
          _id: s._id,
          local_url: `${PUBLIC_API_SERVER}/img/local/inkbunny/${s.username}/${s.file_name}`,
          url: `${PUBLIC_API_SERVER}/signed-url/hoya-inkbunny-pictures/${s.username}/${s.file_name}`,
          thumbnail_url: `${PUBLIC_API_SERVER}/signed-url/inkbunny-thumbnails/${s.username}/${s.file_name}`,
          title: s.title,
          provider: s.provider,
          create_timestamp: s.create_timestamp,
        };
      });

      let fa_images = fa_submissions.map((s) => {
        return {
          _id: s._id,
          local_url: `${PUBLIC_API_SERVER}/img/local/furaffinity/${s.username}/${s.file_name}`,
          url: `${PUBLIC_API_SERVER}/signed-url/hoya-furaffinity-pictures/${s.username}/${s.file_name}`,
          thumbnail_url: `${PUBLIC_API_SERVER}/signed-url/furaffinity-thumbnails/${s.username}/${s.file_name}`,
          title: s.title,
          provider: s.provider,
          create_timestamp: s.create_timestamp,
        };
      });

      let concatedImages = [...images];
      [...ib_images, ...fa_images]
        .sort((a, b) => b.create_timestamp - a.create_timestamp)
        .forEach((image) => {
          if (concatedImages.findLastIndex((i) => i._id === image._id) === -1) {
            concatedImages.push(image);
          } else {
            console.log('duplicate');
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
      <div class={`thumbnail ${image.provider}`}>
        <picture on:click={() => openDialog(image)}>
          {#if PUBLIC_IS_LOCAL === 'true'}
            <source srcset={image.local_url} />
          {/if}
          <img src={image.thumbnail_url} alt={image.title} />
        </picture>
      </div>
    {/each}
  </div>
  <div id="loadMore">...</div>

  <dialog bind:this={modal} on:click={() => modal.close()}>
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
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
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .gallery .thumbnail {
    width: 200px;
    height: 200px;
    overflow: hidden;
    border-radius: 0.5rem;
    border: 3px solid brown;
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
  }

  dialog picture * {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
