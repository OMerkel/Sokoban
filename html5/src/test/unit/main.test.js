import { beforeEach, describe, expect, it } from 'vitest';

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
    <input id="warehousekeeper" type="radio" checked />
    <button id="customMenu"></button>
    <div class="page" id="game-page"></div>
  `;
};

describe('main.js bootstrap', () => {
  beforeEach(() => {
    buildDom();
    localStorage.clear();
  });

  it('exposes a bootstrap function that wires navigation and the hmi', async () => {
    const { bootstrap } = await import(`../../js/main.js?case=bootstrap-fn`);
    const { hmi, navigation } = bootstrap(document, window);
    expect(hmi).toBeDefined();
    expect(navigation).toBeDefined();
    expect(document.getElementById('board').querySelector('svg')).not.toBeNull();
  });

  it('runs bootstrap immediately when the document is already ready', async () => {
    Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
    await import(`../../js/main.js?case=ready`);
    expect(document.getElementById('board').querySelector('svg')).not.toBeNull();
  });

  it('defers bootstrap until DOMContentLoaded when the document is still loading', async () => {
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
    await import(`../../js/main.js?case=loading`);
    expect(document.getElementById('board').querySelector('svg')).toBeNull();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(document.getElementById('board').querySelector('svg')).not.toBeNull();
  });
});
