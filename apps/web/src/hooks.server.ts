import { env } from '$env/dynamic/private';
import { handleAuth } from '@svelte-dev/auth';
// import { sequence } from '@sveltejs/kit/hooks';
// import { handleSession } from '@svelte-dev/session';
// import { Auth } from '@svelte-dev/auth';
// import { SSOStrategy } from '@svelte-dev/auth-sso';
import { GitHubStrategy } from '@svelte-dev/auth-github';

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

export const handle = handleAuth({
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
  strategies: [githubStrategy],
  successRedirect: '/demo',
  failureRedirect: '/error'
});

// export const handle = sequence(
//   handleSession({
//     adapter: {
//       name: 'cookie',
//       options: {
//         chunk: true
//       }
//     },
//     session: {
//       secrets: ['s3cr3t']
//     },
//     cookie: {
//       secure: !!env.SSO_CALLBACK_URL,
//       sameSite: 'lax',
//       path: '/',
//       httpOnly: !!env.SSO_CALLBACK_URL,
//       maxAge: 604800000
//     }
//   }),
//   async function handle({ event, resolve }) {
//     const auth = new Auth(event);
//     // const ssoStrategy = new SSOStrategy(
//     //   {
//     //     clientID: env.SSO_ID,
//     //     clientSecret: env.SSO_SECRET,
//     //     callbackURL: env.SSO_CALLBACK_URL || 'http://localhost:8788/auth/sso/callback'
//     //   },
//     //   async ({ profile }) => {
//     //     // Get the user data from your DB or API using the tokens and profile
//     //     return profile;
//     //   }
//     // );
//     // auth.use(ssoStrategy);

//     const githubStrategy = new GitHubStrategy(
//       {
//         clientID: env.GITHUB_ID,
//         clientSecret: env.GITHUB_SECRET,
//         callbackURL: env.GITHUB_CALLBACK_URL || 'http://localhost:8788/auth/github/callback'
//       },
//       async ({ profile }) => {
//         // Get the user data from your DB or API using the tokens and profile
//         return profile;
//       }
//     );
//     auth.use(githubStrategy);

//     event.locals.auth = auth;
//     const user = event.locals.session.get('user');
//     event.locals.user = user;
//     const response = await resolve(event);

//     return response;
//   }
// );
