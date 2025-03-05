
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const isDev = process.env.NODE_ENV !== 'production';
export const dbUrl = process.env.DATABASE_URL;
