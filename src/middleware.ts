import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    return await next();
  } catch (err) {
    console.error(`[500] ${context.url.pathname}${context.url.search}`, err);
    if (context.url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/500');
  }
});
