/**
 * @file render.js
 *
 * @brief SVG rendering for the Sokoban board using native DOM APIs.
 *
 * Replaces the former Raphael.js dependency. Drawing functions are the
 * only place in the application allowed to touch the SVG DOM; they are
 * driven entirely by the immutable board state produced by board.js.
 */

import { isPos } from './board.js';
import { DIRECTIONS } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CELL = 30;

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });
  return el;
};

const group = (...children) => {
  const g = svgEl('g');
  children.forEach((child) => {
    g.appendChild(child);
  });
  return g;
};

const LINE_HEIGHT = 10;

/** Builds a <text> element rendering each '\n'-separated line as its own row. */
const createMultilineText = (content, attrs) => {
  const text = svgEl('text', attrs);
  content.split('\n').forEach((line, index) => {
    const tspan = svgEl('tspan', { x: attrs.x, dy: index === 0 ? 0 : LINE_HEIGHT });
    tspan.textContent = line;
    text.appendChild(tspan);
  });
  return text;
};

/** Computes the square board size (px) that fits the viewport. */
export const computeBoardSize = (availableWidth, availableHeight, minimum = 32) =>
  Math.max(Math.min(availableWidth, availableHeight), minimum);

/** Clamps a control size to the [min, max] icon size range. */
export const clampControlSize = (size, minimum = 60, maximum = 120) =>
  Math.min(Math.max(size / 10, minimum), maximum);

const drawBox = (x, y, attrs) =>
  group(
    svgEl('rect', { x: CELL * x, y: CELL * y, width: 29, height: 29, rx: 5, ...attrs }),
    svgEl('rect', { x: CELL * x + 3, y: CELL * y + 3, width: 23, height: 23, rx: 3, ...attrs }),
    svgEl('path', { d: `M ${CELL * x},${CELL * y} m 5,2 22,22 -3,3 -22,-22 z`, ...attrs }),
    svgEl('path', { d: `M ${CELL * x},${CELL * y} m 27,5 -22,22 -3,-3 22,-22 z`, ...attrs }),
  );

const drawWarehouseKeeper = (x, y, direction, pushing) => {
  const shoe = svgEl('path', {
    d: 'M -5,-11 m -3,0 c 0,-4 7,-4 7,0',
    fill: 'black',
    stroke: 'black',
    'stroke-width': 0.6,
  });
  const leg1 = svgEl('rect', {
    x: -8,
    y: -11,
    width: 7,
    height: 10,
    fill: '#aaa',
    stroke: 'black',
    'stroke-width': 0.6,
  });
  const leg2 = svgEl('path', {
    d: 'M 4,10 m -3,-7 0,7 c 0,4 7,4 7,0 l 0,-7',
    fill: '#aaa',
    stroke: 'black',
    'stroke-width': 0.6,
  });
  const hand1 = svgEl(
    pushing ? 'path' : 'circle',
    pushing
      ? { d: 'M -7,15 m -3,0 c 0,-5 6,-5 6,0', fill: '#fb8', stroke: '#f95', 'stroke-width': 0.6 }
      : { cx: -7, cy: 9, r: 3, fill: '#fb8', stroke: '#f95', 'stroke-width': 0.6 },
  );
  const hand2 = svgEl(
    pushing ? 'path' : 'circle',
    pushing
      ? { d: 'M 7,15 m -3,0 c 0,-5 6,-5 6,0', fill: '#fb8', stroke: '#f95', 'stroke-width': 0.6 }
      : { cx: 7, cy: -10, r: 3, fill: '#fb8', stroke: '#f95', 'stroke-width': 0.6 },
  );
  const torso = svgEl(
    'path',
    pushing
      ? {
          d: 'm -4,0 0,10 c 0,3 -6,3 -6,0 l 0,-10 c 0,-11 20,-11 20,0 l 0,10 c 0,3 -6,3 -6,0 l 0,-10',
          fill: '#444',
          stroke: 'black',
          'stroke-width': 0.6,
        }
      : {
          d: 'm -4,1 0,4 c 0,4 -6,4 -6,0 l 0,-4 c 0,-10 11,-10 14,-8 c 0,-4 6,-4 6,0 l 0,7 c 0,4 -6,4 -6,0',
          fill: '#444',
          stroke: 'black',
          'stroke-width': 0.6,
        },
  );
  const capshield = svgEl('path', {
    d: 'm -6,0 c 0,12 12,12 12,0',
    fill: 'red',
    stroke: 'black',
    'stroke-width': 0.6,
  });
  const cap = svgEl('circle', { cx: 0, cy: 0, r: 6, fill: 'red', stroke: 'black', 'stroke-width': 0.6 });
  const figure = group(shoe, leg1, leg2, hand1, hand2, torso, capshield, cap);
  const scaleX = ((x + y) % 2) * 2 - 1;
  figure.setAttribute(
    'transform',
    `translate(${CELL * x + 15},${CELL * y + 15}) rotate(${direction.angle}) scale(${scaleX},1)`,
  );
  return figure;
};

const drawRedCircle = (x, y) =>
  svgEl('circle', { cx: CELL * x + 15, cy: CELL * y + 15, r: 15, fill: 'red', stroke: 'black' });

const drawSokoban = (x, y, direction, pushing, useWarehouseKeeper) =>
  useWarehouseKeeper ? drawWarehouseKeeper(x, y, direction, pushing) : drawRedCircle(x, y);

const drawDirectionControl = (boardSize, offset, origin, direction, color, onActivate, controlId) => {
  const cx = origin.x + offset.x;
  const cy = origin.y + offset.y;
  const arrow = svgEl('path', {
    d: `m ${0.04 * boardSize},0 ${-0.08 * boardSize},0 ${0.04 * boardSize},${0.04 * boardSize} z`,
    transform: `translate(${cx},${cy}) rotate(${direction.angle})`,
    fill: color,
    'stroke-width': boardSize * 0.03,
    'stroke-linejoin': 'round',
    stroke: color,
    opacity: 0.4,
  });
  const hitArea = svgEl('circle', {
    cx,
    cy,
    r: boardSize * 0.1,
    fill: 'black',
    'stroke-width': boardSize * 0.005,
    stroke: 'black',
    opacity: 0.01,
  });
  const control = group(arrow, hitArea);
  control.setAttribute('data-control', controlId);
  control.style.cursor = 'pointer';
  control.addEventListener('click', onActivate);
  return control;
};

/** Renders the full board (cells, sprite, and joystick controls) into the given SVG root. */
export const renderBoard = (svg, state, boardSize, options) => {
  const { useWarehouseKeeper, infoText, completedText, onMove, onPrevious, onNext, showLevelNav } = options;
  svg.textContent = '';
  svg.appendChild(
    svgEl('path', {
      d: 'm-1000,-1000 4000,0 0,4000 -4000,0 z',
      stroke: '#444',
      'stroke-width': 0.2,
      'stroke-linecap': 'round',
      fill: 'darkslategrey',
    }),
  );

  state.model.forEach((row, y) => {
    row.forEach((_cell, x) => {
      const pos = { x, y };
      if (isPos(state.model, pos, 'wall')) {
        svg.appendChild(
          svgEl('rect', {
            x: CELL * x,
            y: CELL * y,
            width: 29,
            height: 29,
            rx: 1,
            fill: 'maroon',
            stroke: 'black',
          }),
        );
      } else if (isPos(state.model, pos, 'storage')) {
        svg.appendChild(
          svgEl('rect', {
            x: CELL * x,
            y: CELL * y,
            width: 29,
            height: 29,
            rx: 5,
            fill: 'grey',
            stroke: 'orange',
          }),
        );
      } else if (isPos(state.model, pos, 'sokoban')) {
        svg.appendChild(drawSokoban(x, y, DIRECTIONS[state.direction], state.pushing, useWarehouseKeeper));
      } else if (isPos(state.model, pos, 'sokobanOnStorage')) {
        svg.appendChild(
          svgEl('rect', {
            x: CELL * x,
            y: CELL * y,
            width: 29,
            height: 29,
            rx: 5,
            fill: 'grey',
            stroke: 'orange',
          }),
        );
        svg.appendChild(drawSokoban(x, y, DIRECTIONS[state.direction], state.pushing, useWarehouseKeeper));
      } else if (isPos(state.model, pos, 'box')) {
        svg.appendChild(drawBox(x, y, { fill: 'peru', stroke: 'black' }));
      } else if (isPos(state.model, pos, 'boxOnStorage')) {
        svg.appendChild(drawBox(x, y, { fill: 'brown', stroke: 'black' }));
      }
    });
  });

  const joystick = { x: 0.8 * boardSize, y: 0.8 * boardSize };
  svg.appendChild(
    svgEl('circle', {
      cx: joystick.x,
      cy: joystick.y,
      r: 0.2 * boardSize,
      fill: '#000',
      'fill-opacity': 0.3,
      'stroke-width': boardSize * 0.005,
      stroke: 'black',
      opacity: 0.5,
    }),
  );
  svg.appendChild(
    drawDirectionControl(
      boardSize,
      { x: -0.134 * boardSize, y: 0 },
      joystick,
      DIRECTIONS.left,
      'black',
      () => onMove('left'),
      'move-left',
    ),
  );
  svg.appendChild(
    drawDirectionControl(
      boardSize,
      { x: 0.134 * boardSize, y: 0 },
      joystick,
      DIRECTIONS.right,
      'black',
      () => onMove('right'),
      'move-right',
    ),
  );
  svg.appendChild(
    drawDirectionControl(
      boardSize,
      { x: 0, y: -0.134 * boardSize },
      joystick,
      DIRECTIONS.up,
      'black',
      () => onMove('up'),
      'move-up',
    ),
  );
  svg.appendChild(
    drawDirectionControl(
      boardSize,
      { x: 0, y: 0.134 * boardSize },
      joystick,
      DIRECTIONS.down,
      'black',
      () => onMove('down'),
      'move-down',
    ),
  );

  if (showLevelNav) {
    const navOrigin = { x: 0.5 * boardSize, y: 0.33 * boardSize };
    svg.appendChild(
      drawDirectionControl(
        boardSize,
        { x: -0.4 * boardSize, y: 0 },
        navOrigin,
        DIRECTIONS.left,
        'white',
        onPrevious,
        'level-previous',
      ),
    );
    svg.appendChild(
      drawDirectionControl(
        boardSize,
        { x: 0.4 * boardSize, y: 0 },
        navOrigin,
        DIRECTIONS.right,
        'white',
        onNext,
        'level-next',
      ),
    );
  }

  const text = createMultilineText(infoText + completedText, {
    x: 0,
    y: 7,
    'text-anchor': 'start',
    'font-size': 10,
    fill: 'lightgray',
  });
  svg.appendChild(text);
};
