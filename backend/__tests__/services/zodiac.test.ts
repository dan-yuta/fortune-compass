import { getZodiacFortune } from '../../src/services/zodiac';

describe('Zodiac Service', () => {
  // TC-Z001: Boundary value tests for all 12 zodiac signs
  const boundaryTests = [
    { date: '2000-03-21', expected: '牡羊座' },
    { date: '2000-04-19', expected: '牡羊座' },
    { date: '2000-04-20', expected: '牡牛座' },
    { date: '2000-05-20', expected: '牡牛座' },
    { date: '2000-05-21', expected: '双子座' },
    { date: '2000-06-21', expected: '双子座' },
    { date: '2000-06-22', expected: '蟹座' },
    { date: '2000-07-22', expected: '蟹座' },
    { date: '2000-07-23', expected: '獅子座' },
    { date: '2000-08-22', expected: '獅子座' },
    { date: '2000-08-23', expected: '乙女座' },
    { date: '2000-09-22', expected: '乙女座' },
    { date: '2000-09-23', expected: '天秤座' },
    { date: '2000-10-23', expected: '天秤座' },
    { date: '2000-10-24', expected: '蠍座' },
    { date: '2000-11-22', expected: '蠍座' },
    { date: '2000-11-23', expected: '射手座' },
    { date: '2000-12-21', expected: '射手座' },
    { date: '2000-12-22', expected: '山羊座' },
    { date: '2000-01-19', expected: '山羊座' },
    { date: '2000-01-20', expected: '水瓶座' },
    { date: '2000-02-18', expected: '水瓶座' },
    { date: '2000-02-19', expected: '魚座' },
    { date: '2000-03-20', expected: '魚座' },
  ];

  describe('TC-Z001: Zodiac sign boundary values', () => {
    boundaryTests.forEach(({ date, expected }) => {
      it(`${date} should be ${expected}`, () => {
        const result = getZodiacFortune(date);
        expect(result.sign).toBe(expected);
      });
    });
  });

  // TC-Z002: Element tests
  describe('TC-Z002: Element determination', () => {
    it('Aries should be fire', () => {
      expect(getZodiacFortune('2000-04-01').element).toBe('火');
    });
    it('Taurus should be earth', () => {
      expect(getZodiacFortune('2000-05-01').element).toBe('地');
    });
    it('Gemini should be wind', () => {
      expect(getZodiacFortune('2000-06-01').element).toBe('風');
    });
    it('Cancer should be water', () => {
      expect(getZodiacFortune('2000-07-01').element).toBe('水');
    });
  });

  // TC-Z003: Score tests
  describe('TC-Z003: Score generation', () => {
    it('score should be between 1 and 5', () => {
      const result = getZodiacFortune('1990-05-15');
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(5);
    });
    it('same day and sign should produce same score', () => {
      const r1 = getZodiacFortune('1990-05-15');
      const r2 = getZodiacFortune('1990-05-15');
      expect(r1.score).toBe(r2.score);
    });
  });

  // TC-Z004: Response format
  describe('TC-Z004: Response format', () => {
    it('should have all required fields', () => {
      const result = getZodiacFortune('1990-05-15');
      expect(result.fortuneType).toBe('zodiac');
      expect(result.sign).toBeDefined();
      expect(result.signEn).toBeDefined();
      expect(result.element).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.luckyColor).toBeDefined();
      expect(result.luckyItem).toBeDefined();
      expect(result.advice).toBeDefined();
    });
  });
});
