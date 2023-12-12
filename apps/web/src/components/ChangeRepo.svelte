<script lang="ts">
  // @ts-nocheck
  import { page } from '$app/stores';
  import { linkPrefix } from '$lib/stores/prefix';

  const { className, ...rest } = $props<{ className?: string; tabindex?: string }>();
</script>

<ul
  class={`${className ?? 'animate-menu hidden lg:inline-flex menu menu-horizontal round'}`}
  {...rest}>
  <li aria-current={$page.url.pathname.includes('/session') ? 'repo' : undefined}>
    <a href={`${$linkPrefix}/session`}>Session</a>
  </li>
  <li aria-current={$page.url.pathname.includes('/auth') ? 'repo' : undefined}>
    <a href={`${$linkPrefix}/auth`}>Auth</a>
  </li>
  <li aria-current={$page.url.pathname.includes('/i18n') ? 'repo' : undefined}>
    <a href={`${$linkPrefix}/i18n`}>I18n</a>
  </li>
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
