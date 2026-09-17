/**
 * @file board.js
 *
 * @brief Pure Sokoban board model: state creation, queries, and
 * immutable state transitions (move, push, undo).
 *
 * No function in this module mutates its arguments or touches the DOM;
 * every transition returns a new state object.
 */

import { DIRECTIONS, SYMBOL } from './common.js';

export const getDimension = (plan) =>
  plan.reduce((dim, row) => ({ x: Math.max(dim.x, row.length), y: dim.y + 1 }), { x: 0, y: 0 });

export const createModel = (plan) => {
  const dim = getDimension(plan);
  return Array.from({ length: dim.y }, (_, y) => {
    const row = plan[y];
    return Array.from({ length: dim.x }, (_, x) => (x < row.length ? row[x] : SYMBOL.floor));
  });
};

export const createBoardState = (challenge, levelSetup) => ({
  challenge,
  model: createModel(levelSetup.plan),
  moves: '',
  pushes: 0,
  completed: false,
  direction: 'up',
  pushing: false,
});

export const neighbourOf = (pos, direction) => ({ x: pos.x + direction.dx, y: pos.y + direction.dy });

export const cellAt = (model, pos) => model[pos.y]?.[pos.x];

export const isPos = (model, pos, symbolName) => cellAt(model, pos) === SYMBOL[symbolName];

export const isPosEither = (model, pos, symbolName1, symbolName2) =>
  isPos(model, pos, symbolName1) || isPos(model, pos, symbolName2);

export const findSokoban = (model) => {
  for (let y = 0; y < model.length; y += 1) {
    for (let x = 0; x < model[y].length; x += 1) {
      const pos = { x, y };
      if (isPosEither(model, pos, 'sokoban', 'sokobanOnStorage')) {
        return pos;
      }
    }
  }
  return { x: -1, y: -1 };
};

export const isCompleted = (model) =>
  !model.some((row) => row.some((cell) => cell === SYMBOL.storage || cell === SYMBOL.box));

const setCell = (model, pos, symbol) =>
  model.map((row, y) => (y !== pos.y ? row : row.map((cell, x) => (x !== pos.x ? cell : symbol))));

export const withSokobanRemoved = (model) => {
  const pos = findSokoban(model);
  const symbol = isPos(model, pos, 'sokoban') ? SYMBOL.floor : SYMBOL.storage;
  return setCell(model, pos, symbol);
};

export const withSokobanAt = (model, pos) => {
  const cleared = withSokobanRemoved(model);
  const symbol = isPosEither(model, pos, 'storage', 'boxOnStorage')
    ? SYMBOL.sokobanOnStorage
    : SYMBOL.sokoban;
  return setCell(cleared, pos, symbol);
};

export const withBoxRemoved = (model, pos) =>
  setCell(model, pos, isPos(model, pos, 'box') ? SYMBOL.floor : SYMBOL.storage);

export const withBoxAt = (model, pos) =>
  setCell(model, pos, isPos(model, pos, 'floor') ? SYMBOL.box : SYMBOL.boxOnStorage);

/**
 * Applies a move/push in the given direction, returning a new state.
 * The direction is always recorded, even when the move is illegal
 * (a wall blocks it), matching the original sprite-facing behavior.
 */
export const applyMove = (state, directionName) => {
  const direction = DIRECTIONS[directionName];
  const origin = findSokoban(state.model);
  const target = neighbourOf(origin, direction);

  if (isPosEither(state.model, target, 'floor', 'storage')) {
    const model = withSokobanAt(state.model, target);
    return {
      ...state,
      model,
      moves: state.moves + direction.move,
      direction: directionName,
      pushing: false,
      completed: state.completed || isCompleted(model),
    };
  }

  const beyond = neighbourOf(target, direction);
  if (
    isPosEither(state.model, target, 'box', 'boxOnStorage') &&
    isPosEither(state.model, beyond, 'floor', 'storage')
  ) {
    const model = withBoxAt(withSokobanAt(state.model, target), beyond);
    return {
      ...state,
      model,
      moves: state.moves + direction.push,
      pushes: state.pushes + 1,
      direction: directionName,
      pushing: true,
      completed: state.completed || isCompleted(model),
    };
  }

  return { ...state, direction: directionName, pushing: false };
};

const findDirectionByMoveChar = (moveChar) =>
  Object.values(DIRECTIONS).find((direction) => direction.move === moveChar || direction.push === moveChar);

/** Reverts the last recorded move/push, returning a new state. */
export const undoMove = (state) => {
  if (state.moves.length === 0) {
    return state;
  }
  const lastChar = state.moves[state.moves.length - 1];
  const direction = findDirectionByMoveChar(lastChar);
  const wasPush = direction.push === lastChar;
  const origin = findSokoban(state.model);
  const target = neighbourOf(origin, DIRECTIONS[direction.opposite]);

  let model = withSokobanAt(state.model, target);
  let pushes = state.pushes;
  if (wasPush) {
    const boxOrigin = neighbourOf(origin, direction);
    model = withBoxAt(withBoxRemoved(model, boxOrigin), origin);
    pushes -= 1;
  }

  return {
    ...state,
    model,
    moves: state.moves.slice(0, -1),
    pushes,
    direction: direction.name,
    pushing: wasPush,
  };
};
