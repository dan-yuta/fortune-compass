import { Router, Request, Response } from 'express';
import { getZodiacFortune } from '../services/zodiac';
import { getNumerologyFortune } from '../services/numerology';
import { getBloodTypeFortune } from '../services/blood-type';
import { getTarotFortune } from '../services/tarot';
import { getDashboardFortune } from '../services/dashboard';
import { getEtoFortune } from '../services/eto';
import { getBirthFlowerFortune } from '../services/birth-flower';
import { getBirthstoneFortune } from '../services/birthstone';
import { getWeekdayFortune } from '../services/weekday';
import { getKyuseiFortune } from '../services/kyusei';
import { getAnimalFortune } from '../services/animal';
import { getShichuuFortune } from '../services/shichuu';
import { getOmikujiFortune } from '../services/omikuji';
import { getRuneFortune } from '../services/rune';
import { getFengshuiFortune } from '../services/fengshui';
import { getDreamFortune } from '../services/dream';
import { getPalmFortune } from '../services/palm';
import { getCompatibilityFortune } from '../services/compatibility';
import { getTrendsFortune } from '../services/trends';
import { getAiReadingFortune } from '../services/ai-reading';

const router = Router();

// Helper: validate birthday
function validateBirthday(birthday: unknown): string | null {
  if (!birthday || typeof birthday !== 'string') return 'birthday is required';
  const date = new Date(birthday);
  if (isNaN(date.getTime())) return 'Invalid date format';
  return null;
}

router.post('/zodiac', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getZodiacFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/numerology', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getNumerologyFortune(req.body.birthday, req.body.name);
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
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    if (req.body.bloodType && !['A', 'B', 'O', 'AB'].includes(req.body.bloodType)) {
      res.status(400).json({ error: 'Invalid blood type' });
      return;
    }
    const result = getDashboardFortune(req.body.birthday, req.body.name, req.body.bloodType);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

// --- New endpoints ---

router.post('/eto', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getEtoFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/birth-flower', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getBirthFlowerFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/birthstone', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getBirthstoneFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/weekday', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getWeekdayFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/kyusei', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getKyuseiFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/animal', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getAnimalFortune(req.body.birthday);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/shichuu', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getShichuuFortune(req.body.birthday, req.body.birthTime);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/omikuji', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getOmikujiFortune(req.body.birthday, req.body.name || '');
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/rune', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getRuneFortune(req.body.birthday, req.body.name || '');
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/fengshui', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const gender = req.body.gender === 'female' ? 'female' : 'male';
    const result = getFengshuiFortune(req.body.birthday, gender);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/dream', (req: Request, res: Response) => {
  try {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== 'string') {
      res.status(400).json({ error: 'keyword is required' });
      return;
    }
    const result = getDreamFortune(keyword);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/palm', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'image is required' });
      return;
    }
    const result = await getPalmFortune(image);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/compatibility', (req: Request, res: Response) => {
  try {
    const err1 = validateBirthday(req.body.birthday1);
    if (err1) { res.status(400).json({ error: 'birthday1: ' + err1 }); return; }
    const err2 = validateBirthday(req.body.birthday2);
    if (err2) { res.status(400).json({ error: 'birthday2: ' + err2 }); return; }
    const result = getCompatibilityFortune(
      req.body.birthday1,
      req.body.birthday2,
      req.body.name1,
      req.body.name2,
      req.body.bloodType1,
      req.body.bloodType2,
    );
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/trends', (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    const result = getTrendsFortune(req.body.birthday, req.body.name, req.body.bloodType);
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

router.post('/ai-reading', async (req: Request, res: Response) => {
  try {
    const err = validateBirthday(req.body.birthday);
    if (err) { res.status(400).json({ error: err }); return; }
    if (!req.body.name || typeof req.body.name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const result = await getAiReadingFortune(
      req.body.birthday,
      req.body.name,
      req.body.bloodType,
      req.body.birthTime,
      req.body.gender,
    );
    res.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;
