<script lang="ts">
  import { page } from '$app/stores';
  export let data: { user?: { id: number; email: string } };
  $: isLoggedIn = !!data.user;
</script>

<nav>
  <a href="/" class:active={$page.url.pathname === '/'}>Home</a>
  {#if isLoggedIn}
    <a href="/collection" class:active={$page.url.pathname === '/collection'}>My Collection</a>
    <a href="/logout">Logout</a>
    <span>Welcome, {data.user?.email}</span>
  {:else}
    <a href="/login" class:active={$page.url.pathname === '/login'}>Login</a>
    <a href="/register" class:active={$page.url.pathname === '/register'}>Register</a>
  {/if}
</nav>

<main>
  <slot />
</main>

<style>
  nav {
    padding: 1rem;
    background-color: #f4f4f4;
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  a {
    text-decoration: none;
    color: #333;
  }
  a.active {
    font-weight: bold;
    color: #800020;
  }
  main {
    padding: 2rem;
  }
  span {
    margin-left: auto;
  }
</style>