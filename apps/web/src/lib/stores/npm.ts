import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const downloadsAuth = writable(0);
export const downloadsSession = writable(0);
export const downloadsI18n = writable(0);

if (browser) {
  fetch('https://raw.githubusercontent.com/wshow/github-readme-npm-downloads/main/npm.json')
    .then((res) => res.json())
    .then((json: { stats: [key: string, count: number][] }) => {
      json.stats.forEach(([key, count]) => {
        switch (key) {
          case '@svelte-dev/auth':
            downloadsAuth.set(count);
            break;
          case '@svelte-dev/session':
            downloadsSession.set(count);
            break;
          case '@svelte-dev/i18n':
            downloadsI18n.set(count);
            break;
        }
      });
    });
}
