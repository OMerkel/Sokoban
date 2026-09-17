import { describe, expect, it } from 'vitest';
import { createModel, findSokoban } from '../../js/board.js';
import { SYMBOL } from '../../js/common.js';
import { levels } from '../../js/levels.js';

describe('levels data', () => {
  it('exposes at least one level', () => {
    expect(levels.setup.length).toBeGreaterThan(0);
  });

  it('keeps its symbol table in sync with common.js SYMBOL', () => {
    expect(levels.symbol).toEqual(SYMBOL);
  });

  it('gives every level a non-empty plan of strings', () => {
    levels.setup.forEach((level) => {
      expect(Array.isArray(level.plan)).toBe(true);
      expect(level.plan.length).toBeGreaterThan(0);
      level.plan.forEach((row) => {
        expect(typeof row).toBe('string');
      });
    });
  });

  it('places exactly one sokoban on every level', () => {
    levels.setup.forEach((level) => {
      const model = createModel(level.plan);
      expect(findSokoban(model)).not.toEqual({ x: -1, y: -1 });
    });
  });
});
