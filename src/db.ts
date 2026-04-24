import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      owner_user_id INT NOT NULL,
      reference TEXT NOT NULL,
      amount_cents INT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      invoice_id INT REFERENCES invoices(id),
      status TEXT NOT NULL,
      processor_payload JSONB
    );
  `);
}
