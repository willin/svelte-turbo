<script>
  import '../app.css';
  import { t } from '@svelte-dev/i18n';
  import Navbar from '$components/Navbar.svelte';
  import { onNavigate } from '$app/navigation';

  onNavigate((navigation) => {
    // @ts-ignore
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      // @ts-ignore
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<Navbar />

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
