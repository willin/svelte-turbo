<script>
  import { goto } from '$app/navigation';

  let { data } = $props();

  $effect(() => {
    if (!data.user) {
      goto('/');
    }
  });
</script>

{#if data && data.user}
  <div>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
{/if}
