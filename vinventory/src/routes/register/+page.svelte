<script lang="ts">
  import { enhance } from '$app/forms';

  let email = '';
  let password = '';
  let error = '';
  let success = false;
</script>

<h2>Register for Vinventory</h2>
{#if error}
  <p style="color: red">{error}</p>
{/if}
{#if success}
  <p style="color: green">Registration successful! <a href="/login">Log in</a> now.</p>
{:else}
  <form method="POST" use:enhance={({ formData }) => {
    // Reset state on submit
    error = '';
    success = false;
    return async ({ result }) => {
      if (result.type === 'failure') {
        error = result.data?.error || 'Something went wrong';
      } else if (result.type === 'success') {
        success = true;
        email = '';
        password = '';
      }
    };
  }}>
    <label>
      Email:
      <input type="email" bind:value={email} name="email" required />
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} name="password" required />
    </label>
    <button type="submit">Register</button>
  </form>
  <p>Already have an account? <a href="/login">Log in</a></p>
{/if}

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
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
</style>