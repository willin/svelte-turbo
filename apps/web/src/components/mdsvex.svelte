<script>
  const { title, desc } = $props();
</script>

<div class="flex flex-col-reverse justify-between gap-6 xl:flex-row">
  <div class="prose prose-sm md:prose-base w-full max-w-4xl flex-grow pt-10">
    {#if title}
      <h1>{@html title}</h1>
    {/if}
    {#if desc}
      <p>{@html desc}</p>
    {/if}
    <slot />
    <!-- <ComponentFooter pages={data?.pages} />
    <div class="not-prose flex justify-center xl:hidden">
      <Sponsors wrapperClasses="flex-col sm:flex-row" />
    </div> -->
  </div>
  <!-- <Ads slot="carbon2" /> -->
</div>
