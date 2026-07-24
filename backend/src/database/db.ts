import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function initDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    logger.info('Connected to PostgreSQL database');
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    logger.info('Database schema initialized successfully');
    
    client.release();
  } catch (error) {
    logger.warn('Could not initialize PostgreSQL schema directly. If running without live Postgres DB, check credentials. Error: %s', (error as Error).message);
  }
}
