/**
 * @file main.js
 *
 * @brief Application bootstrap. Wires navigation (hamburger menu, side
 * panel, subpages) and the game HMI once the DOM is ready.
 */

import { createHmi } from './hmi.js';
import { initNavigation } from './navigation.js';

export const bootstrap = (doc = document, win = window) => {
  const hmi = createHmi(doc, win);
  const navigation = initNavigation();
  hmi.init(navigation);
  return { hmi, navigation };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrap());
} else {
  bootstrap();
}
