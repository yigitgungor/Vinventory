<script lang="ts">
  import { enhance } from '$app/forms';

  let email = '';
  let password = '';
  let error = '';

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
  }
</script>

<h2>Log in to Vinventory</h2>
{#if error}
  <p style="color: red">{error}</p>
{/if}
<form method="POST" action="/login" use:enhance={() => {
  console.log('Form submitted');
  error = '';
  return async ({ result }) => {
    console.log('Form result:', result);
    if (result.type === 'failure') {
      error = result.data?.error || 'Something went wrong';
    } else if (result.type === 'success') {
      console.log('Login successful, data:', result.data);
      console.log('Client-side session cookie:', getCookie('session'));
      email = '';
      password = '';
      window.location.href = result.data.redirectTo || '/collection';
      console.log('Redirect initiated to:', result.data.redirectTo || '/collection');
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
  <button type="submit">Log In</button>
</form>
<p>Need an account? <a href="/register">Register</a></p>

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