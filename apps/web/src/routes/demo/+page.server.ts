import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
  const views = locals.session.get('views') ?? 0;
  await locals.session.set('views', views + 1);
  return {};
};
