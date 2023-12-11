import createDebug from 'debug';
import dayjs from 'dayjs';
import { Strategy, type AuthenticateOptions, type StrategyVerifyCallback } from '@svelte-dev/auth';
import type { SessionStorage } from '@svelte-dev/session';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';

const debug = createDebug('AlipayStrategy');
export const nanoid = customAlphabet('1234567890abcdef', 20);

export interface AlipayStrategyOptions {
  appId: string;
  privateKey: string;
  callbackURL: string;
  signType: AlipaySignType;
  scope?: AlipayScope[] | string;
  authorizationURL?: string;
  gateway?: string;
  userAgent?: string;
}

export type AlipaySignType = 'RSA2' | 'RSA';
export type AlipayScope = 'auth_user' | 'auth_basic';

export interface AlipayProfile {
  user_id: string;
  avatar: string;
  nick_name: string;
}

export interface AlipayExtraParams extends Record<string, string | number | null> {}

export const AlipayStrategyDefaultName = 'alipay';
export const AlipayStrategyDefaultScope: AlipayScope = 'auth_user';
export const AlipayStrategyDefaultSignType: AlipaySignType = 'RSA2';
export const AlipayStrategyScopeSeperator = ' ';

export interface AlipayStrategyVerifyParams<
  Profile extends AlipayProfile,
  ExtraParams extends Record<string, unknown> = Record<string, never>
> {
  accessToken: string;
  refreshToken?: string;
  extraParams: ExtraParams;
  profile: Profile;
  event: RequestEvent;
}

/*
Convert a string into an ArrayBuffer
from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
*/
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export class AlipayStrategy<
  User,
  Profile extends AlipayProfile,
  ExtraParams extends AlipayExtraParams
> extends Strategy<User, AlipayStrategyVerifyParams<Profile, ExtraParams>> {
  name = AlipayStrategyDefaultName;

  #scope: AlipayScope[];
  #gateway: string;
  #appId: string;
  #privateKey: string;
  #callbackURL: string;
  #signType: AlipaySignType;
  #authorizationURL: string;
  #userAgent: string;

  constructor(
    {
      appId,
      privateKey,
      callbackURL,
      signType = AlipayStrategyDefaultSignType,
      scope,
      userAgent,
      gateway = 'https://openapi.alipay.com/gateway.do',
      authorizationURL = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm'
    }: AlipayStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      AlipayStrategyVerifyParams<AlipayProfile, AlipayExtraParams>
    >
  ) {
    super(verify);
    this.#scope = this.#getScope(scope);
    this.#gateway = gateway;
    this.#appId = appId;
    this.#privateKey = privateKey;
    this.#callbackURL = callbackURL;
    this.#signType = signType;
    this.#authorizationURL = authorizationURL;
    this.#userAgent = userAgent ?? 'Svelte Auth';
  }

  //Allow users the option to pass a scope string, or typed array
  #getScope(scope: AlipayStrategyOptions['scope']) {
    if (!scope) {
      return [AlipayStrategyDefaultScope];
    } else if (typeof scope === 'string') {
      return scope.split(AlipayStrategyScopeSeperator) as AlipayScope[];
    }

    return scope;
  }
  async authenticate(event: RequestEvent, options: AuthenticateOptions): Promise<User | void> {
    const { request } = event;
    const session = (event.locals as any).session as SessionStorage;
    debug('Request URL', request.url);
    const url = new URL(request.url);

    let user = (session.get(options.sessionKey ?? 'user') || (event.locals as any).user) as User;

    // User is already authenticated
    if (user) {
      debug('User is authenticated');
      return this.success(user, event, options);
    }

    const callbackURL = this.#getCallbackURL(request);

    debug('Callback URL', callbackURL);

    // Redirect the user to the callback URL
    if (url.pathname !== callbackURL.pathname) {
      debug('Redirecting to callback URL');
      const state = this.#generateState();
      debug('State', state);
      await session.set('state', state);
      throw redirect(307, this.#getAuthorizationURL(request, state).toString());
    }
    // Validations of the callback URL params
    const stateUrl = url.searchParams.get('state');
    debug('State from URL', stateUrl);
    if (!stateUrl) {
      return await this.failure(
        'Missing state on URL.',
        event,
        options,
        new AuthorizationError('Missing state on URL.')
      );
    }

    const stateSession = session.get('state');
    debug('State from session', stateSession);
    if (!stateSession) {
      return await this.failure(
        'Missing state on session.',
        event,
        options,
        new Error('Missing state on session.')
      );
    }

    if (stateSession === stateUrl) {
      debug('State is valid');
      await session.unset('state');
    } else {
      return await this.failure(
        "State doesn't match.",
        event,
        options,
        new Error("State doesn't match.")
      );
    }

    const code = url.searchParams.get('auth_code');
    if (!code) {
      return await this.failure(
        'Missing auth_code.',
        event,
        options,
        new Error('Missing auth_code.')
      );
    }

    try {
      // Get the access token
      const { accessToken, refreshToken, extraParams } = await this.fetchAccessToken(code);

      // Get the profile
      const profile = await this.userProfile(accessToken, extraParams);

      // Verify the user and return it, or redirect
      user = await this.verify({
        accessToken,
        refreshToken,
        extraParams,
        profile,
        event
      });
    } catch (error) {
      debug('Failed to verify user', error);
      // Allow responses to pass-through
      if (error instanceof Response) throw error;
      if (error instanceof Error) {
        return await this.failure(error.message, event, options, error);
      }
      if (typeof error === 'string') {
        return await this.failure(error, event, options, new Error(error));
      }
      return await this.failure(
        'Unknown error',
        event,
        options,
        new Error(JSON.stringify(error, null, 2))
      );
    }

    debug('User authenticated');
    return await this.success(user, event, options);
  }

  protected authorizationParams(params: URLSearchParams): URLSearchParams {
    return new URLSearchParams(params);
  }

  #getAuthorizationURL(request: Request, state: string) {
    const params = new URLSearchParams(this.authorizationParams(new URL(request.url).searchParams));
    params.set('app_id', this.#appId);
    params.set('redirect_uri', this.#getCallbackURL(request).toString());
    params.set('state', state);
    params.set('scope', this.#scope);
    const url = new URL(this.#authorizationURL);
    url.search = params.toString();

    return url;
  }

  #generateState() {
    return nanoid();
  }

  #getCallbackURL(request: Request) {
    if (this.#callbackURL.startsWith('http:') || this.#callbackURL.startsWith('https:')) {
      return new URL(this.#callbackURL);
    }
    const host =
      request.headers.get('X-Forwarded-Host') ??
      request.headers.get('host') ??
      new URL(request.url).host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    if (this.#callbackURL.startsWith('/')) {
      return new URL(this.#callbackURL, `${protocol}://${host}`);
    }
    return new URL(`${protocol}//${this.#callbackURL}`);
  }

  /**
   * Format the data to be sent in the request body to the token endpoint.
   */
  protected async fetchAccessToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    extraParams: ExtraParams;
  }> {
    const params = new URLSearchParams();
    params.set('app_id', this.#appId);
    params.set('method', 'alipay.system.oauth.token');
    params.set('charset', 'utf-8');
    params.set('sign_type', this.#signType);
    params.set('timestamp', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    params.set('version', '1.0');
    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    const sign = await this.#sign(params);
    params.set('sign', sign);
    const url = new URL(this.#gateway);
    url.search = params.toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': this.#userAgent
      }
    });
    const data = await response.json();
    debug('fetchAccessToken', JSON.stringify(data, null, 2));
    const result = data.alipay_system_oauth_token_response;
    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      extraParams: result
    };
  }

  async #sign(params: URLSearchParams) {
    const signParams = Object.fromEntries(params.entries());
    // 排序
    const signStr = Object.keys(signParams)
      .sort()
      .map((key) => {
        return `${key}=${signParams[key]}`;
      })
      .join('&');

    // 计算签名
    const encoder = new TextEncoder();
    const data = encoder.encode(signStr);
    // base64 decode the string to get the binary data
    const binaryDerString = atob(this.#privateKey);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);
    debug(JSON.stringify(signParams, null, 2));
    const key = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: {
          name: this.#signType === 'RSA2' ? 'SHA-256' : 'SHA-1'
        }
      },
      false, // whether the key is extractable (i.e. can be used in exportKey)
      ['sign'] // can be any combination of 'sign' and 'verify'
    );

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data);
    const sign = btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
    return sign;
  }

  protected async userProfile(accessToken: string): Promise<AlipayProfile> {
    const params = new URLSearchParams();
    params.set('app_id', this.#appId);
    params.set('method', 'alipay.user.info.share');
    params.set('charset', 'utf-8');
    params.set('sign_type', this.#signType);
    params.set('timestamp', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    params.set('version', '1.0');
    params.set('auth_token', accessToken);
    const sign = await this.#sign(params);
    params.set('sign', sign);
    const url = new URL(this.#gateway);
    url.search = params.toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': this.#userAgent
      }
    });
    const data = await response.json();
    debug('userProfile', JSON.stringify(data, null, 2));
    const result = data.alipay_user_info_share_response;
    if (result.code !== '10000') {
      throw new Error(result.msg);
    }
    return {
      avatar: result.avatar,
      nick_name: result.nick_name,
      user_id: result.user_id
    };
  }
}
