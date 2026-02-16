import request from 'supertest';
import app from '../../src/index';

describe('Fortune API Endpoints', () => {
  // TC-API001: Zodiac endpoint
  describe('POST /api/fortune/zodiac', () => {
    it('should return 200 with valid birthday', async () => {
      const res = await request(app)
        .post('/api/fortune/zodiac')
        .send({ birthday: '1990-05-15' });
      expect(res.status).toBe(200);
      expect(res.body.fortuneType).toBe('zodiac');
      expect(res.body.sign).toBeDefined();
    });
    it('should return 400 with empty body', async () => {
      const res = await request(app)
        .post('/api/fortune/zodiac')
        .send({});
      expect(res.status).toBe(400);
    });
    it('should return 400 with invalid date', async () => {
      const res = await request(app)
        .post('/api/fortune/zodiac')
        .send({ birthday: 'invalid' });
      expect(res.status).toBe(400);
    });
  });

  // TC-API002: Numerology endpoint
  describe('POST /api/fortune/numerology', () => {
    it('should return 200 with birthday and name', async () => {
      const res = await request(app)
        .post('/api/fortune/numerology')
        .send({ birthday: '1990-05-15', name: 'yamada taro' });
      expect(res.status).toBe(200);
      expect(res.body.fortuneType).toBe('numerology');
    });
    it('should return 200 with birthday only', async () => {
      const res = await request(app)
        .post('/api/fortune/numerology')
        .send({ birthday: '1990-05-15' });
      expect(res.status).toBe(200);
    });
    it('should return 400 with empty body', async () => {
      const res = await request(app)
        .post('/api/fortune/numerology')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  // TC-API003: Blood type endpoint
  describe('POST /api/fortune/blood-type', () => {
    it('should return 200 with valid blood type', async () => {
      const res = await request(app)
        .post('/api/fortune/blood-type')
        .send({ bloodType: 'A' });
      expect(res.status).toBe(200);
      expect(res.body.fortuneType).toBe('blood-type');
    });
    it('should return 400 with empty body', async () => {
      const res = await request(app)
        .post('/api/fortune/blood-type')
        .send({});
      expect(res.status).toBe(400);
    });
    it('should return 400 with invalid blood type', async () => {
      const res = await request(app)
        .post('/api/fortune/blood-type')
        .send({ bloodType: 'X' });
      expect(res.status).toBe(400);
    });
  });

  // TC-API004: Tarot endpoint
  describe('POST /api/fortune/tarot', () => {
    it('should return 200 with empty body', async () => {
      const res = await request(app)
        .post('/api/fortune/tarot')
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.fortuneType).toBe('tarot');
      expect(res.body.cards).toHaveLength(3);
    });
  });
});
