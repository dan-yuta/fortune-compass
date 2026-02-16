import { Router, Request, Response } from 'express';
import { getZodiacFortune } from '../services/zodiac';
import { getNumerologyFortune } from '../services/numerology';
import { getBloodTypeFortune } from '../services/blood-type';
import { getTarotFortune } from '../services/tarot';
import { getDashboardFortune } from '../services/dashboard';

const router = Router();

router.post('/zodiac', (req: Request, res: Response) => {
  try {
    const { birthday } = req.body;
    if (!birthday || typeof birthday !== 'string') {
      res.status(400).json({ error: 'birthday is required' });
      return;
    }
    const date = new Date(birthday);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    const result = getZodiacFortune(birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/numerology', (req: Request, res: Response) => {
  try {
    const { birthday, name } = req.body;
    if (!birthday || typeof birthday !== 'string') {
      res.status(400).json({ error: 'birthday is required' });
      return;
    }
    const date = new Date(birthday);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    const result = getNumerologyFortune(birthday, name);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/blood-type', (req: Request, res: Response) => {
  try {
    const { bloodType } = req.body;
    if (!bloodType || typeof bloodType !== 'string') {
      res.status(400).json({ error: 'bloodType is required' });
      return;
    }
    if (!['A', 'B', 'O', 'AB'].includes(bloodType)) {
      res.status(400).json({ error: 'Invalid blood type. Must be A, B, O, or AB' });
      return;
    }
    const result = getBloodTypeFortune(bloodType);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/tarot', (_req: Request, res: Response) => {
  try {
    const result = getTarotFortune();
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/dashboard', (req: Request, res: Response) => {
  try {
    const { birthday, name, bloodType } = req.body;
    if (!birthday || typeof birthday !== 'string') {
      res.status(400).json({ error: 'birthday is required' });
      return;
    }
    const date = new Date(birthday);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    if (bloodType && !['A', 'B', 'O', 'AB'].includes(bloodType)) {
      res.status(400).json({ error: 'Invalid blood type' });
      return;
    }
    const result = getDashboardFortune(birthday, name, bloodType);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;
