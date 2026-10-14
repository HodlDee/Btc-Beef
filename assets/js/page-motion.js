(() => {
  const captureVisibleCopy = (event, phase) => {
    if (!event.viewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const candidates = [...document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main ul, main ol, main a, main form, main .eyebrow, main .recipe-filters, main .bold-ticker > span')];
    const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    const blocks = candidates.filter(element => {
      if (candidates.some(parent => parent !== element && parent.contains(element))) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > headerBottom && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    });
    const previousNames = blocks.map(element => element.style.viewTransitionName);
    // Separate names keep outgoing and incoming text at their own positions.
    blocks.forEach((element, index) => { element.style.viewTransitionName = `${phase}-copy-${index}`; });
    const cleanup = () => blocks.forEach((element, index) => { element.style.viewTransitionName = previousNames[index]; });
    event.viewTransition.finished.then(cleanup, cleanup);
  };
  window.addEventListener('pageswap', event => captureVisibleCopy(event, 'out'));
  window.addEventListener('pagereveal', event => captureVisibleCopy(event, 'in'));
})();
