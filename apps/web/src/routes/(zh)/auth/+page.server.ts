import { redirect, type ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const returnUrl = await locals.session.get('returnTo');
  await locals.session.unset('returnTo');

  if (returnUrl) throw redirect(307, returnUrl);

  return { user: locals.user };
};
