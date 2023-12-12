<script>
  import { page } from '$app/stores';
  import { fallbackLng } from '$lib/i8n';
  import { getRealPath } from '$lib/utils';
  import { locale, locales } from '@svelte-dev/i18n';

  const pathname = $derived(
    `${$locale === fallbackLng ? '' : `/${$locale}`}${getRealPath($page.url.pathname, $locales)}`
  );
</script>

<div class="navbar bg-neutral text-neutral-content">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16" /></svg>
      </div>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <!-- <li><a>Item 1</a></li>
        <li>
          <a>Parent</a>
          <ul class="p-2">
            <li><a>Submenu 1</a></li>
            <li><a>Submenu 2</a></li>
          </ul>
        </li>
        <li><a>Item 3</a></li> -->
      </ul>
    </div>
    <a href={pathname} class="btn btn-ghost text-xl">Svelte</a>
  </div>

  <div class="navbar-end">
    {#await import('./ChangeLanguage.svelte')}
      <div class="btn btn-ghost gap-1 normal-case cursor-wait">
        <svg
          class="inline-block h-4 w-4 fill-current md:h-5 md:w-5"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 512 512">
          <path
            d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z" />
          <path
            d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z" />
        </svg>

        <svg
          width="12px"
          height="12px"
          class="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048">
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z" />
        </svg>
      </div>
    {:then Module}
      <Module.default />
    {/await}
  </div>
</div>
