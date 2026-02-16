import { getBloodTypeFortune } from '../../src/services/blood-type';

describe('Blood Type Service', () => {
  // TC-B001: Blood type validation
  describe('TC-B001: Blood type validation', () => {
    it('should return result for type A', () => {
      const result = getBloodTypeFortune('A');
      expect(result.fortuneType).toBe('blood-type');
      expect(result.bloodType).toBe('A');
    });
    it('should return result for type B', () => {
      const result = getBloodTypeFortune('B');
      expect(result.bloodType).toBe('B');
    });
    it('should return result for type O', () => {
      const result = getBloodTypeFortune('O');
      expect(result.bloodType).toBe('O');
    });
    it('should return result for type AB', () => {
      const result = getBloodTypeFortune('AB');
      expect(result.bloodType).toBe('AB');
    });
    it('should throw for invalid type "C"', () => {
      expect(() => getBloodTypeFortune('C')).toThrow();
    });
    it('should throw for empty string', () => {
      expect(() => getBloodTypeFortune('')).toThrow();
    });
  });

  // TC-B002: Response format
  describe('TC-B002: Response format', () => {
    it('personality should be a non-empty string', () => {
      const result = getBloodTypeFortune('A');
      expect(typeof result.personality).toBe('string');
      expect(result.personality.length).toBeGreaterThan(0);
    });
    it('score should be between 1 and 5', () => {
      const result = getBloodTypeFortune('A');
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(5);
    });
    it('compatibilityRanking should have 4 elements', () => {
      const result = getBloodTypeFortune('A');
      expect(result.compatibilityRanking).toHaveLength(4);
    });
    it('compatibilityRanking should contain all 4 blood types', () => {
      const result = getBloodTypeFortune('A');
      expect(result.compatibilityRanking).toContain('A');
      expect(result.compatibilityRanking).toContain('B');
      expect(result.compatibilityRanking).toContain('O');
      expect(result.compatibilityRanking).toContain('AB');
    });
  });
});
