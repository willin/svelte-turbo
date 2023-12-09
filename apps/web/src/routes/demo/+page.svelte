<script>
  import { goto } from '$app/navigation';

  let { data } = $props();

  $effect(() => {
    if (!data.user) {
      goto('/');
    }
  });
</script>

{#if data && data.session.views}
  <div>
    You have visited this page {data.session.views} times.
  </div>
{/if}

{#if data && data.user}
  <div>
    <pre>{JSON.stringify(data.user, null, 2)}</pre>
  </div>
{/if}
