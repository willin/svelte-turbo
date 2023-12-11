<script>
  import { t } from '@svelte-dev/i18n';
</script>

<main>
  <h1>@svelte-dev/auth &amp; @svelte-dev/session</h1>
  <nav>
    <a href="/">Demo</a> |
    <a href="https://github.com/willin/svelte-turbo" target="_blank">Repo</a> |
    <a href="/docs/i18n" target="_blank">I18n</a> |
    <a href="/docs/auth" target="_blank">Auth</a> |
    <a href="/docs/session" target="_blank">Session</a>
  </nav>
  <article>
    <h2>Demo</h2>
    <h3>{$t('site.title')}</h3>
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
