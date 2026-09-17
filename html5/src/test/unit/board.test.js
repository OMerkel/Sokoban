import { describe, expect, it } from 'vitest';
import {
  applyMove,
  cellAt,
  createBoardState,
  createModel,
  findSokoban,
  getDimension,
  isCompleted,
  isPos,
  isPosEither,
  neighbourOf,
  undoMove,
  withBoxAt,
  withBoxRemoved,
  withSokobanAt,
  withSokobanRemoved,
} from '../../js/board.js';
import { DIRECTIONS } from '../../js/common.js';
import { levels } from '../../js/levels.js';

const smallLevel = {
  plan: ['###', '#.#', '# #', '#$#', '#@#', '###'],
  info: 'test level',
};

const corridorLevel = {
  plan: ['#########', '#. $@$ .#', '#########'],
};

describe('getDimension', () => {
  it('returns the max row width and row count', () => {
    expect(getDimension(['##', '#', '####'])).toEqual({ x: 4, y: 3 });
  });

  it('handles an empty plan', () => {
    expect(getDimension([])).toEqual({ x: 0, y: 0 });
  });
});

describe('createModel', () => {
  it('pads short rows with floor symbol', () => {
    const model = createModel(['##', '#']);
    expect(model[1]).toEqual(['#', ' ']);
  });
});

describe('createBoardState', () => {
  it('creates a fresh, non-completed state for a level', () => {
    const state = createBoardState(0, smallLevel);
    expect(state.challenge).toBe(0);
    expect(state.moves).toBe('');
    expect(state.pushes).toBe(0);
    expect(state.completed).toBe(false);
    expect(state.direction).toBe('up');
    expect(state.pushing).toBe(false);
    expect(state.model).toHaveLength(6);
  });
});

describe('neighbourOf', () => {
  it('applies the direction delta', () => {
    expect(neighbourOf({ x: 2, y: 2 }, DIRECTIONS.up)).toEqual({ x: 2, y: 1 });
    expect(neighbourOf({ x: 2, y: 2 }, DIRECTIONS.down)).toEqual({ x: 2, y: 3 });
    expect(neighbourOf({ x: 2, y: 2 }, DIRECTIONS.left)).toEqual({ x: 1, y: 2 });
    expect(neighbourOf({ x: 2, y: 2 }, DIRECTIONS.right)).toEqual({ x: 3, y: 2 });
  });
});

describe('cellAt / isPos / isPosEither', () => {
  const model = createModel(smallLevel.plan);

  it('reads the symbol at a position', () => {
    expect(cellAt(model, { x: 1, y: 4 })).toBe('@');
  });

  it('returns undefined outside the model bounds', () => {
    expect(cellAt(model, { x: 99, y: 99 })).toBeUndefined();
  });

  it('matches a single symbol name', () => {
    expect(isPos(model, { x: 1, y: 4 }, 'sokoban')).toBe(true);
    expect(isPos(model, { x: 1, y: 4 }, 'wall')).toBe(false);
  });

  it('matches either of two symbol names', () => {
    expect(isPosEither(model, { x: 1, y: 4 }, 'sokoban', 'sokobanOnStorage')).toBe(true);
    expect(isPosEither(model, { x: 0, y: 0 }, 'sokoban', 'sokobanOnStorage')).toBe(false);
  });
});

describe('findSokoban', () => {
  it('locates the plain sokoban symbol', () => {
    const model = createModel(smallLevel.plan);
    expect(findSokoban(model)).toEqual({ x: 1, y: 4 });
  });

  it('locates the sokobanOnStorage symbol', () => {
    const model = createModel(['+']);
    expect(findSokoban(model)).toEqual({ x: 0, y: 0 });
  });

  it('returns {-1,-1} when no sokoban is present', () => {
    const model = createModel(['###']);
    expect(findSokoban(model)).toEqual({ x: -1, y: -1 });
  });
});

describe('isCompleted', () => {
  it('is false while storage or boxes remain', () => {
    expect(isCompleted(createModel(smallLevel.plan))).toBe(false);
  });

  it('is true when no storage or plain box cell remains', () => {
    expect(isCompleted(createModel(['*+']))).toBe(true);
  });
});

describe('withSokobanRemoved / withSokobanAt', () => {
  it('clears a plain sokoban cell back to floor', () => {
    const model = createModel(smallLevel.plan);
    const cleared = withSokobanRemoved(model);
    expect(cellAt(cleared, { x: 1, y: 4 })).toBe(' ');
  });

  it('clears a sokobanOnStorage cell back to storage', () => {
    const model = createModel(['+']);
    const cleared = withSokobanRemoved(model);
    expect(cellAt(cleared, { x: 0, y: 0 })).toBe('.');
  });

  it('places the sokoban on a floor cell', () => {
    const model = createModel(smallLevel.plan);
    const next = withSokobanAt(model, { x: 1, y: 2 });
    expect(cellAt(next, { x: 1, y: 2 })).toBe('@');
    expect(cellAt(next, { x: 1, y: 4 })).toBe(' ');
  });

  it('places the sokoban-on-storage variant on a storage cell', () => {
    const model = createModel(smallLevel.plan);
    const next = withSokobanAt(model, { x: 1, y: 1 });
    expect(cellAt(next, { x: 1, y: 1 })).toBe('+');
  });

  it('does not mutate the input model', () => {
    const model = createModel(smallLevel.plan);
    const snapshot = model.map((row) => [...row]);
    withSokobanAt(model, { x: 1, y: 2 });
    expect(model).toEqual(snapshot);
  });
});

describe('withBoxRemoved / withBoxAt', () => {
  it('clears a plain box back to floor', () => {
    const model = createModel(['$']);
    expect(cellAt(withBoxRemoved(model, { x: 0, y: 0 }), { x: 0, y: 0 })).toBe(' ');
  });

  it('clears a boxed storage cell back to storage', () => {
    const model = createModel(['*']);
    expect(cellAt(withBoxRemoved(model, { x: 0, y: 0 }), { x: 0, y: 0 })).toBe('.');
  });

  it('places a box on a floor cell', () => {
    const model = createModel([' ']);
    expect(cellAt(withBoxAt(model, { x: 0, y: 0 }), { x: 0, y: 0 })).toBe('$');
  });

  it('places a boxOnStorage on a storage cell', () => {
    const model = createModel(['.']);
    expect(cellAt(withBoxAt(model, { x: 0, y: 0 }), { x: 0, y: 0 })).toBe('*');
  });
});

describe('applyMove', () => {
  it('moves the sokoban onto an empty floor cell', () => {
    const moveLevel = { plan: ['#####', '#@  #', '#####'] };
    const state = createBoardState(0, moveLevel);
    const next = applyMove(state, 'right');
    expect(next.moves).toBe('r');
    expect(next.pushing).toBe(false);
    expect(findSokoban(next.model)).toEqual({ x: 2, y: 1 });
  });

  it('pushes a box forward and records an uppercase push letter', () => {
    const state = createBoardState(0, smallLevel);
    const next = applyMove(state, 'up');
    expect(next.moves).toBe('U');
    expect(next.pushes).toBe(1);
    expect(next.pushing).toBe(true);
    expect(findSokoban(next.model)).toEqual({ x: 1, y: 3 });
    expect(isPos(next.model, { x: 1, y: 2 }, 'box')).toBe(true);
  });

  it('marks the level completed once every box reaches storage', () => {
    let state = createBoardState(0, smallLevel);
    state = applyMove(state, 'up');
    state = applyMove(state, 'up');
    expect(state.completed).toBe(true);
    expect(isCompleted(state.model)).toBe(true);
  });

  it('does not push a box into a wall', () => {
    const wallLevel = { plan: ['#$#', '#@#'] };
    const state = createBoardState(0, wallLevel);
    const next = applyMove(state, 'up');
    expect(next.moves).toBe('');
    expect(next.pushing).toBe(false);
    expect(findSokoban(next.model)).toEqual({ x: 1, y: 1 });
  });

  it('records the attempted direction even when blocked', () => {
    const wallLevel = { plan: ['#@#'] };
    const state = createBoardState(0, wallLevel);
    const next = applyMove(state, 'left');
    expect(next.direction).toBe('left');
    expect(next.moves).toBe('');
  });

  it('does not mutate the input state', () => {
    const state = createBoardState(0, smallLevel);
    const snapshot = JSON.parse(JSON.stringify(state));
    applyMove(state, 'up');
    expect(state).toEqual(snapshot);
  });
});

describe('undoMove', () => {
  it('is a no-op when there is no move history', () => {
    const state = createBoardState(0, smallLevel);
    expect(undoMove(state)).toBe(state);
  });

  it('reverts a plain move', () => {
    const state = createBoardState(0, corridorLevel);
    const moved = applyMove(state, 'left');
    const reverted = undoMove(moved);
    expect(reverted.moves).toBe('');
    expect(findSokoban(reverted.model)).toEqual(findSokoban(state.model));
  });

  it('reverts a push, restoring the box and the pushes counter', () => {
    const state = createBoardState(0, smallLevel);
    const pushed = applyMove(state, 'up');
    const reverted = undoMove(pushed);
    expect(reverted.moves).toBe('');
    expect(reverted.pushes).toBe(0);
    expect(reverted.model).toEqual(state.model);
  });

  it('fully reverts a two-step push sequence back to the initial state', () => {
    let state = createBoardState(0, smallLevel);
    const initialModel = state.model;
    state = applyMove(state, 'up');
    state = applyMove(state, 'up');
    state = undoMove(state);
    state = undoMove(state);
    expect(state.model).toEqual(initialModel);
    expect(state.moves).toBe('');
    expect(state.pushes).toBe(0);
  });

  it.each(['up', 'down', 'left', 'right'])('reverts a plain %s move', (directionName) => {
    const openLevel = { plan: ['#######', '#     #', '#  @  #', '#     #', '#######'] };
    const state = createBoardState(0, openLevel);
    const moved = applyMove(state, directionName);
    const reverted = undoMove(moved);
    expect(reverted.moves).toBe('');
    expect(findSokoban(reverted.model)).toEqual(findSokoban(state.model));
  });

  it.each(['up', 'down', 'left', 'right'])('reverts a %s push', (directionName) => {
    const centeredBoxLevel = {
      plan: [
        '#########',
        '#       #',
        '#       #',
        '#   $   #',
        '#   @   #',
        '#       #',
        '#       #',
        '#########',
      ],
    };
    const state = createBoardState(0, centeredBoxLevel);
    const pushed = applyMove(state, directionName);
    expect(pushed.pushing).toBe(directionName === 'up');
    if (pushed.pushing) {
      const reverted = undoMove(pushed);
      expect(reverted.pushes).toBe(0);
      expect(reverted.model).toEqual(state.model);
    }
  });
});

describe('official level solutions replay to completion', () => {
  const directionByChar = (char) => Object.values(DIRECTIONS).find((d) => d.move === char.toLowerCase()).name;

  const levelsWithSolutions = levels.setup.filter((level) => typeof level.solution === 'string');

  it('has at least one level with a recorded solution', () => {
    expect(levelsWithSolutions.length).toBeGreaterThan(0);
  });

  it.each(levelsWithSolutions.map((level, index) => [level.info ?? `level ${index}`, level]))(
    'solves "%s" by replaying its recorded solution',
    (_name, level) => {
      const challengeIndex = levels.setup.indexOf(level);
      let state = createBoardState(challengeIndex, level);
      for (const char of level.solution) {
        state = applyMove(state, directionByChar(char));
      }
      expect(isCompleted(state.model)).toBe(true);
    },
  );
});
