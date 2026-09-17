import { describe, expect, it } from 'vitest';
import { DIRECTIONS, STORAGE_KEY_CHALLENGE, SYMBOL } from '../../js/common.js';

describe('common constants', () => {
  it('defines all seven Sokoban plan symbols', () => {
    expect(Object.keys(SYMBOL)).toHaveLength(7);
    expect(SYMBOL.wall).toBe('#');
    expect(SYMBOL.box).toBe('$');
    expect(SYMBOL.sokoban).toBe('@');
    expect(SYMBOL.storage).toBe('.');
    expect(SYMBOL.boxOnStorage).toBe('*');
    expect(SYMBOL.sokobanOnStorage).toBe('+');
    expect(SYMBOL.floor).toBe(' ');
  });

  it('freezes SYMBOL to prevent mutation', () => {
    expect(Object.isFrozen(SYMBOL)).toBe(true);
  });

  it('defines four directions with opposite pairs', () => {
    expect(DIRECTIONS.up.opposite).toBe('down');
    expect(DIRECTIONS.down.opposite).toBe('up');
    expect(DIRECTIONS.left.opposite).toBe('right');
    expect(DIRECTIONS.right.opposite).toBe('left');
  });

  it('gives every direction a distinct move and push letter', () => {
    const letters = Object.values(DIRECTIONS).flatMap((d) => [d.move, d.push]);
    expect(new Set(letters).size).toBe(letters.length);
  });

  it('freezes DIRECTIONS and each entry', () => {
    expect(Object.isFrozen(DIRECTIONS)).toBe(true);
    expect(Object.isFrozen(DIRECTIONS.up)).toBe(true);
  });

  it('exposes a stable localStorage key name', () => {
    expect(STORAGE_KEY_CHALLENGE).toBe('SokobanChallenge');
  });
});
