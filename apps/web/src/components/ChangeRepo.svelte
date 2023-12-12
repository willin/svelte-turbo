<script lang="ts">
  // @ts-nocheck
  import { page } from '$app/stores';

  const { className, ...rest } = $props<{ className?: string; tabindex?: string }>();
</script>

<ul
  class={`${className ?? 'animate-menu hidden lg:inline-flex menu menu-horizontal round'}`}
  {...rest}>
  <li aria-current={$page.url.pathname === '/' ? 'repo' : undefined}><a href="/">Item 1</a></li>
  <li aria-current={$page.url.pathname === '/en/' ? 'repo' : undefined}>
    <a href="/en">Item 2</a>
  </li>
  <li><a href="/session">Item 3</a></li>
</ul>

<style>
  .animate-menu li[aria-current='repo']::before {
    --size: 6px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid oklch(var(--p));
    view-transition-name: active-page;
  }
</style>
