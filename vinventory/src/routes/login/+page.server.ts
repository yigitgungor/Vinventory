import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { db } from '$lib/database'; // Updated import
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    console.log('Login action started');
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    console.log('Form data:', { email, password });

    if (!email || !password) {
      console.log('Missing email or password');
      return fail(400, { error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('User query result:', user);

    if (!user) {
      console.log('No user found');
      return fail(401, { error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password mismatch');
      return fail(401, { error: 'Invalid email or password' });
    }

    const sessionValue = user.id.toString();
    cookies.set('session', sessionValue, {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax'
    });

    console.log('Session cookie set with value:', sessionValue);
    console.log('Returning success, client should redirect');
    return { success: true, redirectTo: '/collection' };
  },
};