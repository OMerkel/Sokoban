import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initNavigation } from '../../js/navigation.js';

const setupDom = () => {
  document.body.innerHTML = `
    <div class="page" id="game-page">
      <button id="customMenu">Menu</button>
      <nav id="left-panel" class="panel">
        <a href="#" data-rel="back" id="close-menu">Close</a>
        <a href="#rules-page" id="to-rules">Rules</a>
        <a href="#left-panel" id="open-menu">Menu link</a>
        <a href="#unknown" id="to-unknown">Unknown</a>
      </nav>
      <span id="outside">outside</span>
    </div>
    <div class="page" id="rules-page" hidden>
      <a href="#" data-rel="back" id="back-from-rules">Back</a>
    </div>
  `;
};

describe('initNavigation', () => {
  beforeEach(setupDom);

  it('shows only the default game page on init', () => {
    initNavigation();
    expect(document.getElementById('game-page').hidden).toBe(false);
    expect(document.getElementById('rules-page').hidden).toBe(true);
  });

  it('notifies onShowPage with the initial page id', () => {
    const onShowPage = vi.fn();
    initNavigation({ onShowPage });
    expect(onShowPage).toHaveBeenCalledWith('game-page');
  });

  it('navigates to another page when a matching anchor is clicked', () => {
    const onShowPage = vi.fn();
    initNavigation({ onShowPage });
    document.getElementById('to-rules').click();
    expect(document.getElementById('rules-page').hidden).toBe(false);
    expect(document.getElementById('game-page').hidden).toBe(true);
    expect(onShowPage).toHaveBeenCalledWith('rules-page');
  });

  it('opens the panel when the hamburger anchor is clicked', () => {
    initNavigation();
    document.getElementById('open-menu').click();
    expect(document.getElementById('left-panel').classList.contains('open')).toBe(true);
  });

  it('closes the panel and returns to the game page on back links', () => {
    const nav = initNavigation();
    nav.openPanel();
    document.getElementById('back-from-rules').click();
    expect(nav.isPanelOpen()).toBe(false);
    expect(document.getElementById('game-page').hidden).toBe(false);
  });

  it('ignores anchors that target a non-page element', () => {
    initNavigation();
    document.getElementById('to-unknown').click();
    expect(document.getElementById('game-page').hidden).toBe(false);
  });

  it('closes the panel when clicking outside of it', () => {
    const nav = initNavigation();
    nav.openPanel();
    document.getElementById('outside').click();
    expect(nav.isPanelOpen()).toBe(false);
  });

  it('keeps the panel open when clicking the menu button itself', () => {
    const nav = initNavigation();
    nav.openPanel();
    document.getElementById('customMenu').click();
    expect(nav.isPanelOpen()).toBe(true);
  });

  it('exposes showPage/openPanel/closePanel for programmatic control', () => {
    const nav = initNavigation();
    nav.showPage('rules-page');
    expect(document.getElementById('rules-page').hidden).toBe(false);
    nav.openPanel();
    expect(nav.isPanelOpen()).toBe(true);
    nav.closePanel();
    expect(nav.isPanelOpen()).toBe(false);
  });
});
