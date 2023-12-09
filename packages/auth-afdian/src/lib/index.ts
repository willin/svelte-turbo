// Reexport your entry components here
import { type StrategyVerifyCallback, AuthorizationError } from '@svelte-dev/auth';
import {
  type OAuth2Profile,
  OAuth2Strategy,
  type OAuth2StrategyVerifyParams
} from '@svelte-dev/auth-oauth2';

export interface AfdianStrategyOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: AfdianScope[] | string;
  userAgent?: string;
  authorizationURL?: string;
  tokenURL?: string;
}

export type AfdianScope = 'basic';
export type AfdianEmails = OAuth2Profile['emails'];
export type AfdianEmailsResponse = {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: string | null;
}[];

export interface AfdianProfile extends OAuth2Profile {
  provider: string;
  id: string;
  displayName: string;
  emails?: AfdianEmails;
  photos: [{ value: string }];
  _json: {
    user_id?: string;
    user_private_id?: string;
    name?: string;
    avatar?: string;
  };
}

export interface AfdianExtraParams extends Record<string, string | number | null> {}

export const AfdianStrategyDefaultName = 'afdian';
export const AfdianStrategyDefaultScope: AfdianScope = 'basic';
export const AfdianStrategyScopeSeperator = ' ';

export class AfdianStrategy<User> extends OAuth2Strategy<User, AfdianProfile, AfdianExtraParams> {
  name = AfdianStrategyDefaultName;

  private scope: AfdianScope[];
  private userAgent: string;

  constructor(
    {
      clientID,
      clientSecret,
      callbackURL,
      userAgent,
      scope,
      authorizationURL = 'https://afdian.net/oauth2/authorize',
      tokenURL = 'https://afdian.net/api/oauth2/access_token'
    }: AfdianStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<AfdianProfile, AfdianExtraParams>
    >
  ) {
    super(
      {
        clientID,
        clientSecret,
        callbackURL,
        authorizationURL,
        tokenURL
      },
      verify
    );
    this.scope = this.getScope(scope);
    this.userAgent = userAgent ?? 'Remix Auth';
  }

  //Allow users the option to pass a scope string, or typed array
  private getScope(scope: AfdianStrategyOptions['scope']) {
    if (!scope) {
      return [AfdianStrategyDefaultScope];
    } else if (typeof scope === 'string') {
      return scope.split(AfdianStrategyScopeSeperator) as AfdianScope[];
    }

    return scope;
  }

  /**
   * Format the data to be sent in the request body to the token endpoint.
   */
  protected async fetchAccessToken(code: string): Promise<AfdianProfile> {
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('client_id', this.clientID);
    params.set('client_secret', this.clientSecret);
    params.set('code', code);
    params.set(
      'redirect_uri',
      this.callbackURL.includes('?') ? this.callbackURL.split('?')[0] : this.callbackURL
    );
    const response = await fetch(this.tokenURL, {
      method: 'POST',
      headers,
      body: params
    });

    const json = await response.json();

    if (json.ec !== 200) {
      console.error(json.data);
      throw new AuthorizationError(json.data.error);
    }

    return {
      accessToken: {
        provider: 'afdian',
        id: json.data.user_id,
        displayName: json.data.name,
        photos: [{ value: json.data.avatar }],
        _json: json.data
      }
    } as const;
  }

  protected async getAccessToken(profile: AfdianProfile): Promise<AfdianProfile> {
    return profile;
  }

  protected async userProfile(profile: AfdianProfile): Promise<AfdianProfile> {
    return profile;
  }
}
