const MapNav = (() => {
  const MAX_SCALE = 2.5, ZOOM_STEP = 1.25, PAN_FRACTION = 0.25;
  let viewport, layer, toolbar, label, minScale = 1, view = { scale: 1, x: 0, y: 0 };

  const fitScale = () => Math.min(viewport.clientWidth / VENUE.map.width, viewport.clientHeight / VENUE.map.height);

  function clampView() {
    const w = VENUE.map.width * view.scale, h = VENUE.map.height * view.scale;
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    view.x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, view.x));
    view.y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, view.y));
  }

  function apply() {
    clampView();
    layer.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    label.textContent = `${Math.round((view.scale / minScale) * 100)}%`;
    toolbar.querySelector('[data-action="zoom-in"]').disabled = view.scale >= MAX_SCALE - 1e-6;
    toolbar.querySelector('[data-action="zoom-out"]').disabled = view.scale <= minScale + 1e-6;
  }

  function zoomBy(factor) {
    const scale = Math.min(MAX_SCALE, Math.max(minScale, view.scale * factor));
    const k = scale / view.scale, cx = viewport.clientWidth / 2, cy = viewport.clientHeight / 2;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.scale = scale;
    apply();
  }

  function move(dirX, dirY) {
    view.x -= dirX * viewport.clientWidth * PAN_FRACTION;
    view.y -= dirY * viewport.clientHeight * PAN_FRACTION;
    apply();
  }

  function reset() {
    minScale = fitScale();
    view = { scale: minScale, x: 0, y: 0 };
    apply();
  }

  function onResize() {
    const wasFitted = view.scale <= minScale + 1e-6;
    minScale = fitScale();
    if (wasFitted || view.scale < minScale) view.scale = minScale;
    apply();
  }

  const actions = {
    'zoom-in': () => zoomBy(ZOOM_STEP), 'zoom-out': () => zoomBy(1 / ZOOM_STEP),
    up: () => move(0, -1), down: () => move(0, 1), left: () => move(-1, 0), right: () => move(1, 0), reset
  };

  function init(viewportEl, layerEl, toolbarEl, labelEl) {
    viewport = viewportEl; layer = layerEl; toolbar = toolbarEl; label = labelEl;
    toolbar.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-action]');
      if (btn && actions[btn.dataset.action]) actions[btn.dataset.action]();
    });
    window.addEventListener('resize', onResize);
    reset();
  }

  return { init, zoomBy, move, reset, getView: () => ({ ...view }), getMinScale: () => minScale };
})();