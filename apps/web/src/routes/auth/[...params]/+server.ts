import { redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  const [provider = ''] = (event.params.params ?? '').split('/');
  if (event.locals.user) {
    throw redirect(307, '/demo');
  }

  return await event.locals.auth.authenticate(event, provider as string, {
    successRedirect: '/demo',
    failureRedirect: '/'
  });
};
