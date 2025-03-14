import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { writeFileSync } from 'fs';
import { join } from 'path';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  console.log('Collection load started, locals:', locals);
  console.log('Cookies at load:', cookies.getAll());
  if (!locals.user) {
    const session = cookies.get('session');
    console.log('Manual session check in load:', session);
    if (session) {
      const userId = parseInt(session);
      const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
      if (user) {
        locals.user = { id: user.id, email: user.email };
        console.log('Manually set locals.user in load:', locals.user);
      } else {
        console.log('No user found for manual check in load');
      }
    }
  }
  if (!locals.user) {
    console.log('No user in locals after check, redirecting to /login');
    throw redirect(303, '/login');
  }

  const userWines = db
    .prepare('SELECT * FROM wines WHERE user_id = ?')
    .all(locals.user.id);
  console.log('Wines fetched:', userWines);

  return {
    user: locals.user,
    wines: userWines,
  };
};

export const actions: Actions = {
  addWine: async ({ request, locals, cookies }) => {
    console.log('Add wine action started, locals:', locals);
    if (!locals.user) {
      const session = cookies.get('session');
      console.log('Manual session check in add wine action:', session);
      if (session) {
        const userId = parseInt(session);
        const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
        if (user) {
          locals.user = { id: user.id, email: user.email };
          console.log('Manually set locals.user in add wine action:', locals.user);
        } else {
          console.log('No user found for manual check in add wine action');
        }
      }
    }
    if (!locals.user) {
      console.log('No user in locals after add wine action check');
      return fail(401, { error: 'Not authenticated' });
    }

    const data = await request.formData();
    const name = data.get('name')?.toString().toLowerCase().trim();
    const vintage = data.get('vintage')?.toString();
    const region = data.get('region')?.toString().toLowerCase().trim();
    const rating = data.get('rating')?.toString();
    const image = data.get('image') as File;

    if (!name) {
      console.log('Name missing');
      return fail(400, { error: 'Name is required' });
    }

    let imageBase64 = null;
    if (image && image.size > 0) {
      const buffer = await image.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
      console.log('Image uploaded, size:', image.size);
    }

    // Insert the wine
    db.prepare(
      'INSERT INTO wines (user_id, name, vintage, region, rating, image) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      locals.user.id,
      name,
      vintage ? parseInt(vintage) : null,
      region || null,
      rating ? parseFloat(rating) : null,
      imageBase64
    );

    console.log('Wine inserted successfully');

    // Track suggestion if name or region differs from known data
    const wineDataPath = join(process.cwd(), 'data', 'wine-data.json');
    const wineData = JSON.parse(readFileSync(wineDataPath, 'utf8'));
    const knownBrands = wineData.knownBrands;
    const regions = wineData.regions;

    if (name && !knownBrands.includes(name)) {
      const existingSuggestion = db
        .prepare('SELECT * FROM wine_suggestions WHERE name = ?')
        .get(name);
      if (existingSuggestion) {
        db.prepare(
          'UPDATE wine_suggestions SET submission_count = submission_count + 1, updated_at = (strftime(\'%s\', \'now\')) WHERE name = ?'
        ).run(name);
      } else {
        db.prepare(
          'INSERT INTO wine_suggestions (name, submission_count) VALUES (?, ?)'
        ).run(name, 1);
      }

      // Check if submission count reaches threshold (e.g., 10)
      const suggestion = db.prepare('SELECT * FROM wine_suggestions WHERE name = ?').get(name);
      if (suggestion && suggestion.submission_count >= 10) {
        if (!knownBrands.includes(name)) {
          knownBrands.push(name);
          wineData.knownBrands = knownBrands;
          writeFileSync(wineDataPath, JSON.stringify(wineData, null, 2));
          console.log(`Added ${name} to knownBrands after 10 submissions`);
          db.prepare('DELETE FROM wine_suggestions WHERE name = ?').run(name);
        }
      }
    }

    if (region && !regions.includes(region)) {
      const existingSuggestion = db
        .prepare('SELECT * FROM wine_suggestions WHERE region = ?')
        .get(region);
      if (existingSuggestion) {
        db.prepare(
          'UPDATE wine_suggestions SET submission_count = submission_count + 1, updated_at = (strftime(\'%s\', \'now\')) WHERE region = ?'
        ).run(region);
      } else {
        db.prepare(
          'INSERT INTO wine_suggestions (region, submission_count) VALUES (?, ?)'
        ).run(region, 1);
      }

      // Check if submission count reaches threshold
      const suggestion = db.prepare('SELECT * FROM wine_suggestions WHERE region = ?').get(region);
      if (suggestion && suggestion.submission_count >= 10) {
        if (!regions.includes(region)) {
          regions.push(region);
          wineData.regions = regions;
          writeFileSync(wineDataPath, JSON.stringify(wineData, null, 2));
          console.log(`Added ${region} to regions after 10 submissions`);
          db.prepare('DELETE FROM wine_suggestions WHERE region = ?').run(region);
        }
      }
    }

    return { success: true };
  },

  logout: async ({ cookies }) => {
    console.log('Logout action started');
    cookies.delete('session', { path: '/' });
    console.log('Session cookie deleted');
    throw redirect(303, '/login');
  },
};