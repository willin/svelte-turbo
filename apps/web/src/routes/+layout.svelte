<main>
  <h1>@svelte-dev/auth &amp; @svelte-dev/session</h1>
  <nav>
    <a href="/">Demo</a> |
    <a href="https://github.com/willin/svelte-turbo" target="_blank">Repo</a> |
    <a href="/docs/" target="_blank">Auth</a> |
    <a href="/docs/" target="_blank">Session</a>
  </nav>
  <article>
    <h2>Demo</h2>
    <slot />
  </article>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  a,
  a:link,
  a:visited {
    text-decoration: none;
    color: #69f;
  }
</style>
