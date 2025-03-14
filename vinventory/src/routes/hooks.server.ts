import { db } from '$lib/database';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  console.log('--- Hook Start ---');
  console.log('Request URL:', event.url.pathname);
  console.log('Request Method:', event.request.method);
  console.log('Request Headers:', Object.fromEntries(event.request.headers));
  const allCookies = event.cookies.getAll();
  console.log('All cookies:', allCookies);
  const session = event.cookies.get('session');
  console.log('Session cookie:', session);

  if (session) {
    console.log('Parsing session:', session);
    const userId = parseInt(session);
    if (isNaN(userId)) {
      console.log('Invalid session value');
    } else {
      const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
      console.log('User query result:', user);
      if (user) {
        event.locals.user = { id: user.id, email: user.email };
        console.log('User set in locals:', event.locals.user);
      } else {
        console.log('No user found for session');
      }
    }
  } else {
    console.log('No session cookie present');
    event.locals.user = undefined;
  }

  const response = await resolve(event);
  console.log('Response Headers:', Object.fromEntries(response.headers));
  console.log('Hook completed for URL:', event.url.pathname);
  console.log('--- Hook End ---');
  return response;
};