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
