<script lang="ts">
  // @ts-nocheck
  import { linkPrefix } from '$lib/stores/prefix';
  import { currentRepo } from '$lib/stores/repo';

  const { className, ...rest } = $props<{ className?: string; tabindex?: string }>();

  const itemClass = $derived(className ? '' : 'btn btn-sm btn-ghost');
</script>

<ul
  class={`${className ?? 'animate-menu hidden lg:inline-flex menu menu-horizontal round'}`}
  {...rest}>
  <li aria-current={$currentRepo === 'session' ? 'repo' : undefined}>
    <a class={itemClass} href={`${$linkPrefix || ''}/session`}>Session</a>
  </li>
  <li aria-current={$currentRepo === 'auth' ? 'repo' : undefined}>
    <a class={itemClass} href={`${$linkPrefix || ''}/auth`}>Auth</a>
  </li>
  <li aria-current={$currentRepo === 'i18n' ? 'repo' : undefined}>
    <a class={itemClass} href={`${$linkPrefix || ''}/i18n`}>I18n</a>
  </li>
</ul>

<style>
  .animate-menu li[aria-current='repo'] a {
    @apply btn btn-sm btn-primary;
    view-transition-name: active-page;
  }
</style>
