import { env } from '$env/dynamic/private';
import { fallbackLng } from '$lib/i8n';
import { handleAuth } from '@svelte-dev/auth';
import { GitHubStrategy } from '@svelte-dev/auth-github';
import { getLocales, locale } from '@svelte-dev/i18n';
// import { SSOStrategy } from '@svelte-dev/auth-sso';
// import { AlipayStrategy } from '@svelte-dev/auth-alipay';

// const alipayStrategy = new AlipayStrategy(
//   {
//     appId: env.ALIPAY_APP_ID,
//     privateKey: env.ALIPAY_PRIVATE_KEY,
//     callbackURL: env.ALIPAY_CALLBACK_URL || 'http://localhost:8788/auth/alipay/callback'
//   },
//   async ({ profile }) => {
//     // Get the user data from your DB or API using the tokens and profile
//     return profile;
//   }
// );

// const ssoStrategy = new SSOStrategy(
//   {
//     clientID: env.SSO_ID,
//     clientSecret: env.SSO_SECRET,
//     callbackURL: env.SSO_CALLBACK_URL || 'http://localhost:8788/auth/sso/callback'
//   },
//   async ({ profile }) => {
//     // Get the user data from your DB or API using the tokens and profile
//     return profile;
//   }
// );
// auth.use(ssoStrategy);

const githubStrategy = new GitHubStrategy(
  {
    clientID: env.GITHUB_ID,
    clientSecret: env.GITHUB_SECRET,
    callbackURL: env.GITHUB_CALLBACK_URL || 'http://localhost:8788/auth/github/callback'
  },
  async ({ profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return profile;
  }
);

export const handle = handleAuth(
  {
    adapter: {
      name: 'cookie',
      options: {
        chunk: true
      }
    },
    session: {
      secrets: ['s3cr3t']
    },
    cookie: {
      secure: !!env.SSO_CALLBACK_URL,
      sameSite: 'lax',
      path: '/',
      httpOnly: !!env.SSO_CALLBACK_URL,
      maxAge: 604800000
    },
    autoRouting: true,
    strategies: [
      // alipayStrategy,
      // ssoStrategy,
      githubStrategy
    ],
    successRedirect: '/demo',
    failureRedirect: '/error'
  },
  ({ event, resolve }) => {
    const url = new URL(event.request.url);
    const [, matched = ''] = url.pathname.split('/');
    const lang = getLocales().includes(matched) ? matched : fallbackLng;
    locale.set(lang);

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', lang)
    });
  }
);
