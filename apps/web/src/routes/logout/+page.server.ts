import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, locals }) => {
  throw await locals.auth.logout({
    redirectTo: url?.searchParams?.get('redirectTo') ?? '/'
  });
};
