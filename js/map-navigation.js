const MapNav = (() => {
  const DRAG_THRESHOLD = 5, SMALL_SCREEN = 700, COMFORT_SCALE = 0.6, MAX_SCALE = 2.5, ZOOM_STEP = 1.25, PAN_FRACTION = 0.25;
  let viewport, layer, toolbar, label, minScale = 1, view = { scale: 1, x: 0, y: 0 };

  const fitScale = () => Math.max(0.05, Math.min(viewport.clientWidth / VENUE.map.width, viewport.clientHeight / VENUE.map.height));

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

  function zoomAt(factor, cx, cy) {
    const scale = Math.min(MAX_SCALE, Math.max(minScale, view.scale * factor));
    const k = scale / view.scale;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.scale = scale;
    apply();
  }
  const zoomBy = factor => zoomAt(factor, viewport.clientWidth / 2, viewport.clientHeight / 2);

  function panBy(dx, dy) {
    view.x += dx;
    view.y += dy;
    apply();
  }

  function move(dirX, dirY) {
    view.x -= dirX * viewport.clientWidth * PAN_FRACTION;
    view.y -= dirY * viewport.clientHeight * PAN_FRACTION;
    apply();
  }

  function startScale() {
    return viewport.clientWidth < SMALL_SCREEN ? Math.min(1, Math.max(minScale, COMFORT_SCALE)) : minScale;
  }

  function reset() {
    minScale = fitScale();
    view = { scale: startScale(), x: 0, y: 0 };
    view.x = (viewport.clientWidth - VENUE.map.width * view.scale) / 2;
    view.y = 0;
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

  function initMouse() {
    viewport.addEventListener('wheel', ev => {
      ev.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const delta = (ev.deltaMode === 1 ? 16 : 1) * ev.deltaY;
      zoomAt(Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.0015), ev.clientX - rect.left, ev.clientY - rect.top);
    }, { passive: false });

    let drag = null, suppressClick = false;
    viewport.addEventListener('pointerdown', ev => {
      if (ev.pointerType === 'mouse' && ev.button === 0) drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, moved: false };
    });
    viewport.addEventListener('pointermove', ev => {
      if (!drag || ev.pointerId !== drag.id) return;
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        drag.moved = true;
        viewport.setPointerCapture(ev.pointerId);
        viewport.classList.add('is-dragging');
      }
      panBy(dx, dy);
      drag.x = ev.clientX;
      drag.y = ev.clientY;
    });
    const endDrag = ev => {
      if (!drag || ev.pointerId !== drag.id) return;
      if (drag.moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
        viewport.classList.remove('is-dragging');
      }
      drag = null;
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('click', ev => { if (suppressClick) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  }

  function init(viewportEl, layerEl, toolbarEl, labelEl) {
    viewport = viewportEl; layer = layerEl; toolbar = toolbarEl; label = labelEl;
    toolbar.addEventListener('click', ev => {
      const btn = ev.target.closest('[data-action]');
      if (btn && actions[btn.dataset.action]) actions[btn.dataset.action]();
    });
    const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', '0': 'reset' };
    viewport.addEventListener('keydown', ev => {
      if (ev.target === viewport && keys[ev.key]) { ev.preventDefault(); actions[keys[ev.key]](); }
    });
    initMouse();
    window.addEventListener('resize', onResize);
    reset();
  }

  return { init, zoomBy, zoomAt, panBy, move, reset, getView: () => ({ ...view }), getMinScale: () => minScale };
})();