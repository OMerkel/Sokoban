import { describe, expect, it, vi } from 'vitest';
import { createModel } from '../../js/board.js';
import { clampControlSize, computeBoardSize, renderBoard } from '../../js/render.js';

const makeState = (plan, overrides = {}) => ({
  challenge: 0,
  model: createModel(plan),
  moves: '',
  pushes: 0,
  completed: false,
  direction: 'up',
  pushing: false,
  ...overrides,
});

describe('computeBoardSize', () => {
  it('picks the smaller of width/height, respecting the minimum', () => {
    expect(computeBoardSize(500, 300)).toBe(300);
    expect(computeBoardSize(10, 10)).toBe(32);
    expect(computeBoardSize(10, 10, 5)).toBe(10);
  });
});

describe('clampControlSize', () => {
  it('clamps into the [min, max] range', () => {
    expect(clampControlSize(0)).toBe(60);
    expect(clampControlSize(2000)).toBe(120);
    expect(clampControlSize(800)).toBe(80);
  });
});

describe('renderBoard', () => {
  const baseOptions = () => ({
    useWarehouseKeeper: false,
    infoText: 'hello\n',
    completedText: '',
    onMove: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    showLevelNav: true,
  });

  it('renders every cell type without throwing and splits multi-line info text across tspans', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['#.*$@+ ']);
    const options = baseOptions();
    renderBoard(svg, state, 210, options);
    const lines = Array.from(svg.querySelectorAll('text tspan')).map((tspan) => tspan.textContent);
    expect(lines).toEqual(['hello', '']);
  });

  it('renders the completed message on its own line after the info text', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['#.*$@+ ']);
    const options = {
      ...baseOptions(),
      infoText: 'Push box onto storage!\n',
      completedText: 'Level has been completed!',
    };
    renderBoard(svg, state, 210, options);
    const tspans = svg.querySelectorAll('text tspan');
    const lines = Array.from(tspans).map((tspan) => tspan.textContent);
    expect(lines).toEqual(['Push box onto storage!', 'Level has been completed!']);
    expect(tspans[1].getAttribute('dy')).toBe('10');
  });

  it('draws the warehouse-keeper figure as a group when enabled', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['@'], { pushing: true });
    renderBoard(svg, state, 30, { ...baseOptions(), useWarehouseKeeper: true, showLevelNav: false });
    // 1 sprite group + 4 movement controls = 5 groups when level nav is hidden.
    expect(svg.querySelectorAll('g')).toHaveLength(5);
  });

  it('clears previous content on re-render', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['@']);
    renderBoard(svg, state, 30, baseOptions());
    const firstChildCount = svg.childNodes.length;
    renderBoard(svg, state, 30, baseOptions());
    expect(svg.childNodes.length).toBe(firstChildCount);
  });

  it('wires the four movement controls to onMove with the right direction', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['@'], { moves: '' });
    const options = baseOptions();
    renderBoard(svg, state, 30, options);
    const groups = svg.querySelectorAll('g');
    groups[0].dispatchEvent(new Event('click'));
    groups[1].dispatchEvent(new Event('click'));
    groups[2].dispatchEvent(new Event('click'));
    groups[3].dispatchEvent(new Event('click'));
    expect(options.onMove).toHaveBeenNthCalledWith(1, 'left');
    expect(options.onMove).toHaveBeenNthCalledWith(2, 'right');
    expect(options.onMove).toHaveBeenNthCalledWith(3, 'up');
    expect(options.onMove).toHaveBeenNthCalledWith(4, 'down');
  });

  it('adds level-navigation controls that call onPrevious/onNext when shown', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['@']);
    const options = baseOptions();
    renderBoard(svg, state, 30, options);
    const groups = svg.querySelectorAll('g');
    expect(groups).toHaveLength(6);
    groups[4].dispatchEvent(new Event('click'));
    groups[5].dispatchEvent(new Event('click'));
    expect(options.onPrevious).toHaveBeenCalledTimes(1);
    expect(options.onNext).toHaveBeenCalledTimes(1);
  });

  it('omits the level-navigation controls when showLevelNav is false', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const state = makeState(['@']);
    renderBoard(svg, state, 30, { ...baseOptions(), showLevelNav: false });
    expect(svg.querySelectorAll('g')).toHaveLength(4);
  });
});
