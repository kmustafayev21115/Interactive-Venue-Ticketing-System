const SeatDetails = (() => {
  const STATUS = {
    available: 'Available',
    inspected: 'Available',
    'in-cart': 'In your cart',
    unavailable: 'Unavailable'
  };
  const money = n => `${VENUE.currency.symbol}${n.toFixed(2)}`;

  function render(container, seat, state, reason) {
    if (!seat) {
      container.className = 'empty';
      container.textContent = 'Select a seat on the map to see its row, number and price.';
      return;
    }
    const status = state === 'unavailable' ? `Unavailable (${reason})` : STATUS[state];
    container.className = 'seat-info';
    container.innerHTML = `
      <p class="seat-title">${seat.sectionName}</p>
      <dl>
        <dt>Row</dt><dd>${seat.row}</dd>
        <dt>Seat</dt><dd>${seat.number}</dd>
        <dt>Category</dt><dd><span class="swatch" style="background:${seat.color}"></span>${seat.category}</dd>
        <dt>Price</dt><dd><strong>${money(seat.price)}</strong></dd>
        <dt>Status</dt><dd class="status status--${state}">${status}</dd>
      </dl>
      <button type="button" class="link" data-action="clear-inspection">Clear selection</button>`;
  }
  return { render };
})();
