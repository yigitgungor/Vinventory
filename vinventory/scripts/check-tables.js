// scripts/check-tables.js
import Database from 'better-sqlite3';

const db = new Database('vinventory.db', { verbose: console.log });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

db.close();