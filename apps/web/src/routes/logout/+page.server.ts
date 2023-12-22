import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, locals }) => {
  locals.user = null;
  throw await locals.auth.logout({
    redirectTo: url?.searchParams?.get('redirectTo') ?? '/'
  });
};
