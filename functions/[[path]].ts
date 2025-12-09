import app from '../server/app';

// Cloudflare Pages Functions handler
export const onRequest: PagesFunction = async (context) => {
  return app.fetch(context.request, context.env, context);
};
