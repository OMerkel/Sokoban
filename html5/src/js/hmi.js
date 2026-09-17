/**
 * @file hmi.js
 *
 * @brief Application-layer orchestration: wires DOM events, keeps the
 * current board state, and delegates rendering to render.js and
 * transitions to board.js. This is the only module that mixes domain
 * calls with side effects (DOM, localStorage).
 */

import { applyMove, createBoardState, getDimension, isCompleted, undoMove } from './board.js';
import { STORAGE_KEY_CHALLENGE } from './common.js';
import { levels } from './levels.js';
import { clampControlSize, computeBoardSize, renderBoard } from './render.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const HEADER_OFFSET = 64;

const DIRECTION_KEYS = {
  w: 'up',
  arrowup: 'up',
  s: 'down',
  arrowdown: 'down',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
};

const readChallengeFromStorage = (storage) => {
  const stored = storage.getItem(STORAGE_KEY_CHALLENGE);
  const index = stored === null ? 0 : Number.parseInt(stored, 10);
  return Number.isInteger(index) && index >= 0 && index < levels.setup.length ? index : 0;
};

const isChecked = (doc, id) => Boolean(doc.getElementById(id)?.checked);

export const createHmi = (doc = document, win = window, storage = localStorage) => {
  let state = createBoardState(0, levels.setup[0]);
  let svg = null;
  let navigation = null;

  const currentLevel = () => levels.setup[state.challenge];

  const render = () => {
    const dim = getDimension(currentLevel().plan);
    const useWarehouseKeeper = isChecked(doc, 'warehousekeeper');
    const showFullInfo = isChecked(doc, 'fullinfo');
    const info = currentLevel().info && showFullInfo ? `${currentLevel().info}\n` : '';
    const completedText = state.completed
      ? `Level has been completed!${isCompleted(state.model) ? '' : '\nBut it got messed up again.'}`
      : '';
    const boardSize = 30 * Math.max(dim.x, dim.y);

    renderBoard(svg, state, boardSize, {
      useWarehouseKeeper,
      infoText: info,
      completedText,
      onMove: move,
      onPrevious: previous,
      onNext: next,
      showLevelNav: state.moves.length === 0 || state.completed,
    });

    doc.getElementById('myheader').textContent =
      `Sokoban : l${state.challenge} : m${state.moves.length} : p${state.pushes}`;
    updateStatistics();
    storage.setItem(STORAGE_KEY_CHALLENGE, String(state.challenge));
  };

  const updateStatistics = () => {
    doc.getElementById('leveldata').textContent =
      `Challenge #${state.challenge}: ${currentLevel().info ?? ''}`;
    doc.getElementById('history').textContent =
      state.moves.length > 0 ? state.moves : 'Warehouse keeper did not move yet.';
    doc.getElementById('moves').textContent = state.moves.length > 0 ? String(state.moves.length) : 'No';
    doc.getElementById('pushes').textContent = state.pushes > 0 ? String(state.pushes) : 'zero';
    doc.getElementById('completed').textContent = state.completed
      ? `Congratulation! This level has been successfully completed.${isCompleted(state.model) ? '' : ' But it got messed up again.'}`
      : 'You are still solving this level.';
  };

  const startChallenge = (index) => {
    state = createBoardState(index, levels.setup[index]);
    resize();
  };

  const move = (directionName) => {
    state = applyMove(state, directionName);
    render();
  };

  const handleKeydown = (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    if (doc.getElementById('game-page')?.hidden) {
      return;
    }
    const direction = DIRECTION_KEYS[event.key.toLowerCase()];
    if (!direction) {
      return;
    }
    event.preventDefault();
    move(direction);
  };

  const restart = () => {
    startChallenge(state.challenge);
    navigation?.closePanel();
  };

  const next = () => {
    startChallenge((state.challenge + 1) % levels.setup.length);
    navigation?.closePanel();
  };

  const previous = () => {
    startChallenge((state.challenge - 1 + levels.setup.length) % levels.setup.length);
    navigation?.closePanel();
  };

  const random = () => {
    startChallenge(Math.floor(Math.random() * levels.setup.length));
    navigation?.closePanel();
  };

  const undo = () => {
    state = undoMove(state);
    render();
    navigation?.closePanel();
  };

  const resize = () => {
    const availableWidth = win.innerWidth - 32;
    const availableHeight = win.innerHeight - HEADER_OFFSET;
    const size = computeBoardSize(availableWidth, availableHeight);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    const dim = getDimension(currentLevel().plan);
    const boardSize = 30 * Math.max(dim.x, dim.y);
    svg.setAttribute('viewBox', `-10 -10 ${20 + boardSize} ${20 + boardSize}`);

    const boardMarginTop = (availableHeight - size) / 2;
    doc.getElementById('board').style.marginTop = `${boardMarginTop}px`;

    const controlSize = clampControlSize(size);
    ['customMenu', 'customBackRules', 'customBackStatistics', 'customBackOptions', 'customBackAbout'].forEach(
      (id) => {
        const el = doc.getElementById(id);
        if (el) {
          el.style.width = `${controlSize}px`;
          el.style.height = `${controlSize}px`;
        }
      },
    );
    render();
  };

  const initBoard = () => {
    svg = doc.createElementNS(SVG_NS, 'svg');
    doc.getElementById('board').appendChild(svg);
    const index = readChallengeFromStorage(storage);
    state = createBoardState(index, levels.setup[index]);
  };

  const bindControls = () => {
    doc.getElementById('restart')?.addEventListener('click', restart);
    doc.getElementById('next')?.addEventListener('click', next);
    doc.getElementById('previous')?.addEventListener('click', previous);
    doc.getElementById('random')?.addEventListener('click', random);
    doc.getElementById('undo')?.addEventListener('click', undo);
    doc.getElementById('customBackOptions')?.addEventListener('click', render);
    doc.getElementById('customOkOptions')?.addEventListener('click', render);
    doc.addEventListener('keydown', handleKeydown);
  };

  const init = (nav) => {
    navigation = nav;
    initBoard();
    win.addEventListener('resize', resize);
    bindControls();
    resize();
  };

  return { init, move, restart, next, previous, random, undo, getState: () => state };
};
