<script>
  import { downloadsAuth, downloadsI18n, downloadsSession } from '$lib/stores/npm';
  import { t } from '@svelte-dev/i18n';
  import { getPossibleLocales, locales } from '@svelte-dev/i18n';
  import { fallbackLng } from '$lib/i8n';
  import { page } from '$app/stores';

  $effect(() => {
    const isInit = !!localStorage.getItem('lang');
    if (isInit) return;
    const langs = getPossibleLocales(navigator.language);
    langs.forEach((lang) => {
      if ($locales.includes(lang)) {
        localStorage.setItem('lang', lang);
        if (lang !== fallbackLng && $page.url.pathname === '/') {
          goto('/' + lang);
        }
      }
    });
  });
</script>

<div class="hero min-h-screen" style="background-image: url(https://willin.wang/images/bg.jpg);">
  <div class="hero-overlay bg-opacity-60"></div>
  <div class="hero-content text-center text-neutral-content">
    <div class="max-w-5xl">
      <h1 class="mb-5 text-5xl font-bold text-secondary">Svelte Turbo</h1>
      <p class="mb-5">Make rockets for rookies.</p>
      <div class="join">
        <div class="join-item card w-96 bg-base-100 shadow-xl glass">
          <div class="card-body">
            <h2 class="card-title">@svelte-dev/session</h2>
            <p class="text-left">{$t('common.npm_downloads')}: {$downloadsSession}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-primary" href="/session">{$t('common.get_started')}</a>
            </div>
          </div>
        </div>
        <div class="join-item card w-96 bg-base-100 shadow-xl glass">
          <div class="card-body">
            <h2 class="card-title">@svelte-dev/auth</h2>
            <p class="text-left">{$t('common.npm_downloads')}: {$downloadsAuth}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-primary" href="/auth">{$t('common.get_started')}</a>
            </div>
          </div>
        </div>
        <div class="join-item card w-96 bg-base-100 shadow-xl glass">
          <div class="card-body">
            <h2 class="card-title">@svelte-dev/i18n</h2>
            <p class="text-left">{$t('common.npm_downloads')}: {$downloadsI18n}</p>
            <div class="card-actions justify-end">
              <a class="btn btn-primary" href="/i18n">{$t('common.get_started')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
