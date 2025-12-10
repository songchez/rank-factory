import app from "../server/app";

// Cloudflare Pages Functions handler
export const onRequest = (context: any) =>
  app.fetch(
    context.request as Request,
    context.env,
    context
  );
