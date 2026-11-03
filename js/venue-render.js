const MapView = (() => {
  const seats = new Map();
  const buttons = new Map();

  function buildSeats() {
    const list = [], unavailable = getUnavailableMap(), o = VENUE.map.origin;
    VENUE.sections.forEach(section => {
      const category = VENUE.categories[section.category];
      getSectionRows(section).forEach(rowSpec => {
        for (let n = 1; n <= rowSpec.seatCount; n++) {
          const angle = section.from + ((n - 0.5) / rowSpec.seatCount) * (section.to - section.from);
          const id = makeSeatId(section.code, rowSpec.row, n);
          list.push({
            id, section: section.code, sectionName: section.name, row: rowSpec.row, number: n,
            categoryKey: section.category, category: category.label, price: category.price, color: category.color,
            x: o.x + rowSpec.radius * Math.sin(toRad(angle)),
            y: o.y + rowSpec.radius * Math.cos(toRad(angle)),
            angle, unavailableReason: unavailable.get(id) || null
          });
        }
      });
    });
    return list;
  }

  function createSeatButton(seat) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.seatId = seat.id;
    btn.style.left = `${seat.x - VENUE.seat.size / 2}px`;
    btn.style.top = `${seat.y - VENUE.seat.size / 2}px`;
    btn.style.setProperty('--cat', seat.color);
    btn.style.setProperty('--rot', `${-seat.angle}deg`);
    paintButton(btn, seat);
    return btn;
  }

  const STATE_TEXT = { available: 'available', inspected: 'selected for inspection', 'in-cart': 'in your cart', unavailable: 'unavailable' };

  function paintButton(btn, seat) {
    const state = SeatStore.stateOf(seat.id);
    btn.className = `seat seat--${state}`;
    btn.setAttribute('aria-pressed', String(state === 'inspected'));
    btn.setAttribute('aria-disabled', String(state === 'unavailable'));
    btn.setAttribute('aria-label',
      `${seat.sectionName}, row ${seat.row}, seat ${seat.number}, ${seat.category}, ${STATE_TEXT[state]}`);
  }
  function paint(ids) { ids.forEach(id => paintButton(buttons.get(id), seats.get(id))); }

  function addLabel(layer, className, text, x, y) {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    layer.appendChild(el);
  }

  function render(layer) {
    const o = VENUE.map.origin, r = VENUE.stage.radius;
    layer.style.width = `${VENUE.map.width}px`;
    layer.style.height = `${VENUE.map.height}px`;
    layer.innerHTML = '';
    const stage = document.createElement('div');
    stage.className = 'stage';
    Object.assign(stage.style, { left: `${o.x - r}px`, top: `${o.y - r}px`, width: `${2 * r}px`, height: `${2 * r}px` });
    layer.appendChild(stage);
    addLabel(layer, 'stage-label', 'Stage', o.x, 80);

    VENUE.sections.forEach(sec => {
      const tier = VENUE.tiers[sec.tier];
      const radius = tier.innerRadius + (tier.rows.length - 1) * VENUE.seat.rowPitch + 38;
      const a = toRad((sec.from + sec.to) / 2);
      addLabel(layer, 'section-label', sec.name, o.x + radius * Math.sin(a), o.y + radius * Math.cos(a));
    });

    const frag = document.createDocumentFragment();
    buildSeats().forEach(seat => {
      seats.set(seat.id, seat);
      const btn = createSeatButton(seat);
      buttons.set(seat.id, btn);
      frag.appendChild(btn);
    });
    layer.appendChild(frag);
  }

  return { buildSeats, render, paint, getSeat: id => seats.get(id), getButton: id => buttons.get(id) };
})();

if (typeof module !== 'undefined') module.exports = { MapView };