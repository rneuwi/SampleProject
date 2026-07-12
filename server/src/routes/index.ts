import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Verifies both the API process and the DB connection are healthy.
// Also doubles as a smoke test for the Docker Compose wiring.
router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

export default router;
