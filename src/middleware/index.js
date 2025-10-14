// src/middleware/index.js
import pb from '../utils/pb';

export const onRequest = async (context, next) => {
    
  console.log('🔍 Middleware - URL:', context.url.pathname);
  
  const cookie = context.cookies.get("pb_auth")?.value;
  if (cookie) {
    pb.authStore.loadFromCookie(cookie);
    if (pb.authStore.isValid) {
      context.locals.user = pb.authStore.record;
    }
  }

  // Pour les routes API, on exige l'authentification SAUF pour /api/login ET /api/signup
  if (context.url.pathname.startsWith('/api/')) {
    console.log('🔍 Route API détectée:', context.url.pathname);
    console.log('🔍 User connecté ?', !!context.locals.user);
    console.log('🔍 Est login ?', context.url.pathname === '/api/login');
    console.log('🔍 Est signup ?', context.url.pathname === '/api/signup');
    
    if (!context.locals.user && 
        context.url.pathname !== '/api/login' && 
        context.url.pathname !== '/api/signup') {
      console.log('❌ BLOQUÉ par middleware');
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    console.log('✅ Route API autorisée');
    return next();
  }

  // Pour les autres pages, si l'utilisateur n'est pas connecté, on le redirige vers /login
  if (!context.locals.user) {
    if (
      context.url.pathname !== '/login' &&
      context.url.pathname !== '/' &&
      context.url.pathname !== '/signup'
    ) {
      return Response.redirect(new URL('/login', context.url), 303);
    }
  }

  // Gestion du changement de langue
  if (context.request.method === 'POST') {
    const form = await context.request.formData().catch(() => null);
    const lang = form?.get('language');

    if (lang === 'en' || lang === 'fr') {
      context.cookies.set('locale', String(lang), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
      return Response.redirect(
        new URL(context.url.pathname + context.url.search, context.url),
        303
      );
    }
  }

  const cookieLocale = context.cookies.get('locale')?.value;
  context.locals.lang =
    cookieLocale === 'fr' || cookieLocale === 'en'
      ? cookieLocale
      : context.preferredLocale ?? 'en';

  return next();
};