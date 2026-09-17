/**
 * @file common.js
 *
 * @brief Immutable constants shared across Sokoban modules.
 *
 * Symbol codes mirror the classic Sokoban plan-text notation and the
 * direction table encodes movement deltas, move/push move-history
 * letters, and the opposite direction used for undo.
 */

export const SYMBOL = Object.freeze({
  floor: ' ',
  wall: '#',
  box: '$',
  sokoban: '@',
  storage: '.',
  boxOnStorage: '*',
  sokobanOnStorage: '+',
});

export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ name: 'up', angle: 180, dx: 0, dy: -1, move: 'u', push: 'U', opposite: 'down' }),
  down: Object.freeze({ name: 'down', angle: 0, dx: 0, dy: 1, move: 'd', push: 'D', opposite: 'up' }),
  left: Object.freeze({ name: 'left', angle: 90, dx: -1, dy: 0, move: 'l', push: 'L', opposite: 'right' }),
  right: Object.freeze({ name: 'right', angle: 270, dx: 1, dy: 0, move: 'r', push: 'R', opposite: 'left' }),
});

export const STORAGE_KEY_CHALLENGE = 'SokobanChallenge';
