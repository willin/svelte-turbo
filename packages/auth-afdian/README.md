![Logo](https://repository-images.githubusercontent.com/726691357/f09bf6fc-3844-4584-8eee-6bfb425d8a38)

# @svelte-dev/auth-afdian strategy

The Afdian（爱发电） strategy is used to authenticate users against a afidan account. It extends the OAuth2Strategy.

For more details: <https://github.com/willin/svelte-turbo>

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |
| Vercel     | ✅          |

## Usage

### Create an OAuth application

Follow the steps on [the Afdian(爱发电) documentation](https://afdian.net/p/010ff078177211eca44f52540025c377) to create a new application and get a client ID and secret.

### Create the strategy instance

```ts
import { AfdianStrategy } from '@svelte-dev/auth-afdian';

let strategy = new AfdianStrategy(
  {
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'https://example.com/auth/afdian/callback'
  },
  async ({ accessToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ email: profile.emails[0].value });
  }
);

auth.use(strategy);
```

### Setup your routes

```html
<form action="/auth/afdian" method="get">
  <button>Login with Afdian（爱发电）</button>
</form>
```

```tsx
// routes/auth/afdian/+server
import { authenticator } from '~/auth.server';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  return authenticator.authenticate('afdian', event);
};
```

```tsx
// routes/auth/afdian/callback/+server
import { authenticator } from '~/auth.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ event }) => {
  return authenticator.authenticate('afdian', event, {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
  });
};
```

## 赞助 Sponsor

维护者 Owner： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

Donation ways:

- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## 许可证 License

Apache-2.0
