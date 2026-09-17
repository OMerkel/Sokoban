import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmi } from '../../js/hmi.js';

const buildDom = () => {
  document.body.innerHTML = `
    <div id="board"></div>
    <center id="myheader"></center>
    <p id="leveldata"></p>
    <p id="history"></p>
    <span id="moves"></span>
    <span id="pushes"></span>
    <p id="completed"></p>
    <a id="restart"></a>
    <a id="next"></a>
    <a id="previous"></a>
    <a id="random"></a>
    <a id="undo"></a>
    <a id="customBackOptions"></a>
    <a id="customOkOptions"></a>
    <input id="fullinfo" type="radio" checked />
    <input id="supresshints" type="radio" />
    <input id="warehousekeeper" type="radio" checked />
    <input id="redcircle" type="radio" />
    <a id="customMenu"></a>
    <a id="customBackRules"></a>
    <a id="customBackStatistics"></a>
    <a id="customBackAbout"></a>
    <div class="page" id="game-page"></div>
  `;
};

const createFakeStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
};

const createFakeWindow = () => {
  const listeners = {};
  return {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    },
    triggerResize: () => listeners.resize?.(),
  };
};

describe('createHmi', () => {
  let storage;
  let win;
  let hmi;

  beforeEach(() => {
    buildDom();
    storage = createFakeStorage();
    win = createFakeWindow();
    hmi = createHmi(document, win, storage);
  });

  it('renders the initial level header and statistics after init', () => {
    hmi.init();
    expect(document.getElementById('myheader').textContent).toBe('Sokoban : l0 : m0 : p0');
    expect(document.getElementById('history').textContent).toBe('Warehouse keeper did not move yet.');
    expect(document.getElementById('moves').textContent).toBe('No');
    expect(document.getElementById('pushes').textContent).toBe('zero');
    expect(document.getElementById('completed').textContent).toBe('You are still solving this level.');
  });

  it('persists the current challenge index to storage', () => {
    hmi.init();
    hmi.next();
    expect(storage.getItem('SokobanChallenge')).toBe(String(hmi.getState().challenge));
  });

  it('creates an svg element inside the board container', () => {
    hmi.init();
    expect(document.getElementById('board').querySelector('svg')).not.toBeNull();
  });

  it('reads a previously persisted challenge index on init', () => {
    storage.setItem('SokobanChallenge', '2');
    hmi.init();
    expect(hmi.getState().challenge).toBe(2);
  });

  it('falls back to level 0 for a corrupt stored challenge index', () => {
    storage.setItem('SokobanChallenge', 'not-a-number');
    hmi.init();
    expect(hmi.getState().challenge).toBe(0);
  });

  it('moves the sokoban and records history text', () => {
    hmi.init();
    hmi.move('up');
    expect(document.getElementById('history').textContent).toBe('U');
    expect(document.getElementById('moves').textContent).toBe('1');
    expect(document.getElementById('pushes').textContent).toBe('1');
  });

  it('completes level 0 after two pushes upward', () => {
    hmi.init();
    hmi.move('up');
    hmi.move('up');
    expect(document.getElementById('completed').textContent).toBe(
      'Congratulation! This level has been successfully completed.',
    );
  });

  it('advances to the next level, wrapping past the last one', () => {
    hmi.init();
    const before = hmi.getState().challenge;
    hmi.next();
    expect(hmi.getState().challenge).toBe(before + 1);
  });

  it('goes to the previous level, wrapping before the first one', () => {
    hmi.init();
    hmi.previous();
    expect(hmi.getState().challenge).toBeGreaterThanOrEqual(0);
  });

  it('random selects a level within bounds', () => {
    hmi.init();
    hmi.random();
    expect(hmi.getState().challenge).toBeGreaterThanOrEqual(0);
  });

  it('restart resets the moves for the current level', () => {
    hmi.init();
    hmi.move('up');
    hmi.restart();
    expect(hmi.getState().moves).toBe('');
    expect(hmi.getState().pushes).toBe(0);
  });

  it('undo reverts the last move', () => {
    hmi.init();
    hmi.move('up');
    hmi.undo();
    expect(hmi.getState().moves).toBe('');
    expect(document.getElementById('history').textContent).toBe('Warehouse keeper did not move yet.');
  });

  it('closes the navigation panel on level-changing actions when provided', () => {
    const navigation = { closePanel: vi.fn() };
    hmi.init(navigation);
    hmi.next();
    hmi.previous();
    hmi.random();
    hmi.restart();
    hmi.undo();
    expect(navigation.closePanel).toHaveBeenCalledTimes(5);
  });

  it('re-renders on window resize', () => {
    hmi.init();
    document.getElementById('myheader').textContent = 'cleared';
    win.triggerResize();
    expect(document.getElementById('myheader').textContent).toBe('Sokoban : l0 : m0 : p0');
  });

  it('re-renders when the options back/ok controls are used', () => {
    hmi.init();
    document.getElementById('fullinfo').checked = false;
    document.getElementById('customOkOptions').click();
    expect(document.getElementById('leveldata').textContent).toContain('Challenge #0');
  });

  it('omits level info text when the level has no info and full info is unchecked', () => {
    storage.setItem('SokobanChallenge', '4');
    document.getElementById('fullinfo').checked = false;
    hmi.init();
    expect(document.getElementById('leveldata').textContent).toBe('Challenge #4: ');
  });

  it('shows level info text when full info is checked and the level provides one', () => {
    document.getElementById('fullinfo').checked = true;
    hmi.init();
    expect(document.getElementById('leveldata').textContent).toContain('Push box onto storage!');
  });

  const dispatchKey = (key) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
  };

  it.each([
    ['w', 'up'],
    ['W', 'up'],
    ['ArrowUp', 'up'],
    ['a', 'left'],
    ['A', 'left'],
    ['ArrowLeft', 'left'],
    ['s', 'down'],
    ['S', 'down'],
    ['ArrowDown', 'down'],
    ['d', 'right'],
    ['D', 'right'],
    ['ArrowRight', 'right'],
  ])('faces the sokoban %s towards "%s"', (key, expectedDirection) => {
    hmi.init();
    dispatchKey(key);
    expect(hmi.getState().direction).toBe(expectedDirection);
  });

  it('pushes the box upward when "w" is pressed on level 0', () => {
    hmi.init();
    dispatchKey('w');
    expect(hmi.getState().moves).toBe('U');
  });

  it('prevents the default action for a handled key so the page does not scroll', () => {
    hmi.init();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores unrelated keys', () => {
    hmi.init();
    dispatchKey('q');
    expect(hmi.getState().moves).toBe('');
  });

  it('ignores key presses combined with a modifier key', () => {
    hmi.init();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', ctrlKey: true, cancelable: true }));
    expect(hmi.getState().moves).toBe('');
  });

  it('ignores key presses while a subpage is shown instead of the game page', () => {
    hmi.init();
    document.getElementById('game-page').hidden = true;
    dispatchKey('w');
    expect(hmi.getState().moves).toBe('');
  });

  it('undoes the last move when "ctrl+z" is pressed', () => {
    hmi.init();
    dispatchKey('w');
    expect(hmi.getState().moves).toBe('U');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true }));
    expect(hmi.getState().moves).toBe('');
  });

  it('undoes the last move when "cmd+z" (metaKey) is pressed', () => {
    hmi.init();
    dispatchKey('w');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z', metaKey: true, cancelable: true }));
    expect(hmi.getState().moves).toBe('');
  });

  it('prevents the default action for the undo shortcut', () => {
    hmi.init();
    dispatchKey('w');
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes the navigation panel when the undo shortcut is used', () => {
    const navigation = { closePanel: vi.fn() };
    hmi.init(navigation);
    dispatchKey('w');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true }));
    expect(navigation.closePanel).toHaveBeenCalledTimes(1);
  });

  it('does not undo for "z" without a modifier key', () => {
    hmi.init();
    dispatchKey('w');
    dispatchKey('z');
    expect(hmi.getState().moves).toBe('U');
  });

  it('does not undo for "ctrl+alt+z"', () => {
    hmi.init();
    dispatchKey('w');
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, altKey: true, cancelable: true }),
    );
    expect(hmi.getState().moves).toBe('U');
  });

  it('ignores the undo shortcut while a subpage is shown instead of the game page', () => {
    hmi.init();
    dispatchKey('w');
    document.getElementById('game-page').hidden = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true }));
    expect(hmi.getState().moves).toBe('U');
  });

  it('advances to the next level when "ctrl+g" is pressed', () => {
    hmi.init();
    const before = hmi.getState().challenge;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, cancelable: true }));
    expect(hmi.getState().challenge).toBe(before + 1);
  });

  it('goes to the previous level when "ctrl+shift+g" is pressed', () => {
    hmi.init();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'G', ctrlKey: true, shiftKey: true, cancelable: true }),
    );
    expect(hmi.getState().challenge).toBeGreaterThanOrEqual(0);
  });

  it('goes to the previous level with "cmd+shift+g" (metaKey)', () => {
    hmi.init();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'G', metaKey: true, shiftKey: true, cancelable: true }),
    );
    expect(hmi.getState().challenge).toBeGreaterThanOrEqual(0);
  });

  it('prevents the default action for the level-switch shortcuts', () => {
    hmi.init();
    const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes the navigation panel when a level-switch shortcut is used', () => {
    const navigation = { closePanel: vi.fn() };
    hmi.init(navigation);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, cancelable: true }));
    expect(navigation.closePanel).toHaveBeenCalledTimes(1);
  });

  it('does not switch levels for "g" without a modifier key', () => {
    hmi.init();
    const before = hmi.getState().challenge;
    dispatchKey('g');
    expect(hmi.getState().challenge).toBe(before);
  });

  it('does not switch levels for "ctrl+alt+g"', () => {
    hmi.init();
    const before = hmi.getState().challenge;
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, altKey: true, cancelable: true }),
    );
    expect(hmi.getState().challenge).toBe(before);
  });

  it('ignores the level-switch shortcuts while a subpage is shown instead of the game page', () => {
    hmi.init();
    const before = hmi.getState().challenge;
    document.getElementById('game-page').hidden = true;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, cancelable: true }));
    expect(hmi.getState().challenge).toBe(before);
  });
});
