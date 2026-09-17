/**
 * @file navigation.js
 *
 * @brief Vanilla replacement for the jQuery Mobile page/panel router.
 *
 * Exactly one `.page` element is visible at a time and the left
 * navigation panel (hamburger menu) overlays the current page. All
 * anchors using a `href="#target-id"` convention are intercepted so
 * the visible page toggles without a full navigation/hash reload.
 */

const PANEL_ID = 'left-panel';
const MENU_BUTTON_ID = 'customMenu';
const DEFAULT_PAGE_ID = 'game-page';

export const initNavigation = ({ onShowPage } = {}) => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const panel = document.getElementById(PANEL_ID);
  const menuButton = document.getElementById(MENU_BUTTON_ID);

  const showPage = (id) => {
    pages.forEach((page) => {
      page.hidden = page.id !== id;
    });
    onShowPage?.(id);
  };

  const openPanel = () => panel?.classList.add('open');
  const closePanel = () => panel?.classList.remove('open');
  const isPanelOpen = () => Boolean(panel?.classList.contains('open'));

  const handleClick = (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link) {
      const id = link.getAttribute('href').slice(1);
      if (id === PANEL_ID) {
        event.preventDefault();
        openPanel();
        return;
      }
      if (link.dataset.rel === 'back' || id === '') {
        event.preventDefault();
        closePanel();
        showPage(DEFAULT_PAGE_ID);
        return;
      }
      if (document.getElementById(id)?.classList.contains('page')) {
        event.preventDefault();
        closePanel();
        showPage(id);
        return;
      }
    }
    if (isPanelOpen() && panel && !panel.contains(event.target) && event.target !== menuButton) {
      closePanel();
    }
  };

  document.addEventListener('click', handleClick);
  menuButton?.addEventListener('click', (event) => {
    event.preventDefault();
    openPanel();
  });

  showPage(DEFAULT_PAGE_ID);

  return { showPage, openPanel, closePanel, isPanelOpen };
};
