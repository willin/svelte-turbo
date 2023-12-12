import { page } from '$app/stores';
import { derived } from 'svelte/store';

export const currentRepo = derived(page, ($page) => {
  const path = $page.url.pathname.split('/');
  const repos = ['auth', 'session', 'i18n'];
  const matched = path.find((p) => repos.includes(p));
  return matched;
});
