<script>
  import '../app.css';
  // import { t } from '@svelte-dev/i18n';
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
  <slot />
</main>

<footer class="footer items-center p-4 bg-neutral text-neutral-content">
  <aside class="items-center grid-flow-col">
    <p>Copyright © 2023 - <a href="https://willin.wang">Willin Wang</a> All right reserved</p>
  </aside>
</footer>
