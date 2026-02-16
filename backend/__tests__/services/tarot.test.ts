import { getTarotFortune } from '../../src/services/tarot';
import { majorArcana } from '../../src/data/tarot-cards';

describe('Tarot Service', () => {
  // TC-T001: Card extraction
  describe('TC-T001: Card extraction', () => {
    it('should return 3 cards', () => {
      const result = getTarotFortune();
      expect(result.cards).toHaveLength(3);
    });
    it('should return 3 unique cards', () => {
      const result = getTarotFortune();
      const numbers = result.cards.map(c => c.number);
      expect(new Set(numbers).size).toBe(3);
    });
    it('card numbers should be between 0 and 21', () => {
      const result = getTarotFortune();
      result.cards.forEach(card => {
        expect(card.number).toBeGreaterThanOrEqual(0);
        expect(card.number).toBeLessThanOrEqual(21);
      });
    });
    it('isReversed should be boolean', () => {
      const result = getTarotFortune();
      result.cards.forEach(card => {
        expect(typeof card.isReversed).toBe('boolean');
      });
    });
  });

  // TC-T002: Spread composition
  describe('TC-T002: Spread composition', () => {
    it('first card position should be "past"', () => {
      const result = getTarotFortune();
      expect(result.cards[0].position).toBe('past');
    });
    it('second card position should be "present"', () => {
      const result = getTarotFortune();
      expect(result.cards[1].position).toBe('present');
    });
    it('third card position should be "future"', () => {
      const result = getTarotFortune();
      expect(result.cards[2].position).toBe('future');
    });
  });

  // TC-T003: Card data completeness
  describe('TC-T003: Card data completeness', () => {
    it('all cards should have non-empty name', () => {
      const result = getTarotFortune();
      result.cards.forEach(card => {
        expect(card.name.length).toBeGreaterThan(0);
      });
    });
    it('all cards should have non-empty meaning', () => {
      const result = getTarotFortune();
      result.cards.forEach(card => {
        expect(card.meaning.length).toBeGreaterThan(0);
      });
    });
    it('all cards should have non-empty reversedMeaning', () => {
      const result = getTarotFortune();
      result.cards.forEach(card => {
        expect(card.reversedMeaning.length).toBeGreaterThan(0);
      });
    });
    it('major arcana should have 22 cards', () => {
      expect(majorArcana).toHaveLength(22);
    });
  });

  // TC-T004: Randomness
  describe('TC-T004: Randomness', () => {
    it('multiple runs should produce varying results', () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = getTarotFortune();
        const key = result.cards.map(c => `${c.number}-${c.isReversed}`).join(',');
        results.add(key);
      }
      expect(results.size).toBeGreaterThanOrEqual(2);
    });
  });
});
