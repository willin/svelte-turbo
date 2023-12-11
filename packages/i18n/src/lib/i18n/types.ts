export type Fn = (...args: any[]) => string;
export interface I18nDict {
  [key: string]: string | number | Fn | I18nDict;
}

export type MessageFormatter = (
  key: string,
  params?: Record<string, unknown>,
  lang?: string
) => string;
