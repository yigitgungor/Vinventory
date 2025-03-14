import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { db } from '$lib/database'; // Updated import
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    console.log('Register action started');
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    console.log('Form data:', { email, password });

    if (!email || !password) {
      console.log('Missing email or password');
      return fail(400, { error: 'Email and password are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('Existing user check:', existingUser);
    if (existingUser) {
      console.log('Email already exists');
      return fail(400, { error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
    console.log('User registered successfully');

    return { success: true };
  },
};