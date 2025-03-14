<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidate } from '$app/navigation';

  export let data: { user: { id: number; email: string }; wines: any[] };

  let name = '';
  let vintage = '';
  let region = '';
  let rating = '';
  let imageFile: File | null = null;
  let error = '';
  let success = '';
  let processing = false;
  let uploadStatus = '';

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }

  if (typeof window !== 'undefined') {
    const session = getCookie('session');
    console.log('Client-side collection check, session:', session);
    if (!data.user && session) {
      console.log('User missing but session exists, forcing reload');
      window.location.reload();
    }
  }

  async function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      imageFile = input.files[0];
      uploadStatus = 'Processing image: ' + imageFile.name;
      processing = true;
      error = '';
      try {
        console.log('Image selected:', imageFile.name, 'Size:', imageFile.size);
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('OCR Response:', result);
        name = result.name || '';
        vintage = result.vintage || '';
        region = result.region || '';
        uploadStatus = 'Image processed: ' + imageFile.name;
      } catch (err) {
        console.error('OCR Fetch Error:', err);
        error = `Failed to process image: ${err.message}. Please edit fields manually.`;
        name = '';
        vintage = '';
        region = '';
      } finally {
        processing = false;
      }
    }
  }
</script>

<h1>My Vinventory Collection</h1>
<p>Welcome, {data.user.email}!</p>
<form method="POST" action="?/logout" use:enhance>
  <button type="submit">Logout</button>
</form>

<h2>Add a Wine</h2>
{#if error}
  <p style="color: red">{error}</p>
{/if}
{#if success}
  <p style="color: green">{success}</p>
{/if}
{#if processing}
  <p>Processing...</p>
{/if}
<p>{uploadStatus}</p>
<form method="POST" action="?/addWine" enctype="multipart/form-data" use:enhance={() => {
  error = '';
  success = '';
  return async ({ result, update }) => {
    processing = true;
    console.log('Form submission started');
    if (result.type === 'failure') {
      error = result.data?.error || 'Something went wrong';
      console.log('Form failure:', error);
    } else if (result.type === 'success') {
      name = '';
      vintage = '';
      region = '';
      rating = '';
      imageFile = null;
      uploadStatus = '';
      success = 'Wine added successfully!';
      console.log('Invalidating /collection');
      await invalidate('/collection');
      console.log('Invalidation completed');
      setTimeout(() => (success = ''), 3000);
    }
    processing = false;
    update();
  };
}}>
  <label>
    Image:
    <input type="file" accept="image/*" name="image" on:change={handleImageChange} />
  </label>
  <label>
    Name:
    <input type="text" bind:value={name} name="name" required />
  </label>
  <label>
    Vintage:
    <input type="number" bind:value={vintage} name="vintage" />
  </label>
  <label>
    Region:
    <input type="text" bind:value={region} name="region" />
  </label>
  <label>
    Rating (0-5):
    <input type="number" step="0.1" min="0" max="5" bind:value={rating} name="rating" />
  </label>
  <button type="submit" disabled={processing}>Add Wine</button>
</form>

<h2>Your Wines</h2>
{#if data.wines.length === 0}
  <p>No wines yet. Add one above!</p>
{:else}
  <ul>
    {#each data.wines as wine}
      <li>
        {#if wine.image}
          <img src={`data:image/jpeg;base64,${wine.image}`} alt={wine.name} style="max-width: 100px;" />
        {/if}
        {wine.name} ({wine.vintage || 'NV'}) - {wine.region || 'Unknown'} 
        {#if wine.rating} - {wine.rating}/5{/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1, h2 {
    color: #800020;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }
  label {
    display: flex;
    flex-direction: column;
  }
  button {
    background-color: #800020;
    color: white;
    padding: 0.5rem;
    border: none;
    cursor: pointer;
  }
  button:hover {
    background-color: #a00030;
  }
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  img {
    max-height: 100px;
  }
</style>