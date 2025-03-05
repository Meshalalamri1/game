
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// الحصول على مسار الملف الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// تحميل متغيرات البيئة من ملف .env
config({
  path: join(__dirname, '..', '.env')
});

export const isDev = process.env.NODE_ENV !== 'production';
export const dbUrl = process.env.DATABASE_URL;

// التأكد من وجود رابط قاعدة البيانات
if (!dbUrl) {
  console.error("DATABASE_URL غير محدد في متغيرات البيئة");
  process.exit(1);
}

// تهيئة اتصال قاعدة البيانات
const client = postgres(dbUrl);
export const db = drizzle(client);
