import fs from 'fs';
import path from 'path';
import { DatabaseSchema, getDefaultSeedData } from './seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'portal_db.json');

let cachedDb: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDb(): DatabaseSchema {
  if (cachedDb) {
    return cachedDb;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      cachedDb = JSON.parse(raw) as DatabaseSchema;
      return cachedDb;
    } catch (err) {
      console.error('Failed reading existing db.json, re-initializing with seed data:', err);
    }
  }

  // If file doesn't exist or failed to parse, initialize default seed
  cachedDb = getDefaultSeedData();
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(data: DatabaseSchema): void {
  ensureDataDirectory();
  cachedDb = data;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

export function resetDb(): DatabaseSchema {
  const fresh = getDefaultSeedData();
  saveDb(fresh);
  return fresh;
}
