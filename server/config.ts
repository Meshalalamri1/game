import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({
  path: join(__dirname, '..', '.env')
});

export const isDev = process.env.NODE_ENV !== 'production';
export const dbUrl = process.env.DATABASE_URL;