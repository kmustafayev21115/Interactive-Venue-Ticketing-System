(function () {
  const money = n => `${VENUE.currency.symbol}${n.toFixed(2)}`;
  const problems = validateVenue();
  if (problems.length) console.error('Venue model problems:', problems);

  const summary = summarizeVenue();
  document.getElementById('capacity-info').textContent =
    `${summary.total} seats in ${VENUE.sections.length} sections, ${summary.total - summary.unavailable} available`;

  const e = VENUE.event;
  const date = new Date(`${e.date}T${e.time}`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('event-info').textContent = `${e.title}, ${date}, ${e.time}`;

  document.getElementById('price-legend').innerHTML = Object.values(VENUE.categories)
    .map(c => `<li><span><span class="swatch" style="background:${c.color}"></span>${c.label}</span><strong>${money(c.price)}</strong></li>`)
    .join('');
  document.getElementById('cart-total').textContent = money(0);
  
  const viewport = document.getElementById('map-viewport');
  const layer = document.getElementById('map-layer');
  MapView.render(layer);
  MapNav.init(viewport, layer, document.querySelector('.toolbar'), document.getElementById('zoom-level'));

  SeatStore.subscribe(changed => MapView.paint(changed));
  layer.addEventListener('click', ev => {
    const btn = ev.target.closest('button[data-seat-id]');
    if (btn) SeatStore.inspect(btn.dataset.seatId);
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') SeatStore.clearInspection(); });

  const detailsEl = document.getElementById('seat-details');
  function showDetails() {
    const id = SeatStore.getInspectedId();
    SeatDetails.render(detailsEl, id && MapView.getSeat(id), id && SeatStore.stateOf(id), id && SeatStore.getUnavailableReason(id));
  }
  SeatStore.subscribe(showDetails);
  detailsEl.addEventListener('click', ev => {
    if (ev.target.closest('[data-action="clear-inspection"]')) SeatStore.clearInspection();
  });

  const addButton = document.getElementById('add-to-cart');
  const cartList = document.getElementById('cart-items');
  const message = document.getElementById('cart-message');

  const dropped = Cart.replaceAll(CartStorage.load());
  if (Cart.getItems().length) message.textContent = `Restored ${Cart.getItems().length} ticket(s) from your last visit.`;
  if (dropped) message.textContent += ` ${dropped} saved seat(s) could not be restored.`;
  CartStorage.save(Cart.getItems());
  Cart.subscribe(ids => CartStorage.save(ids));
  window.addEventListener('storage', ev => {
    if (ev.key === CartStorage.KEY) Cart.replaceAll(CartStorage.load());

  });
  
})();
