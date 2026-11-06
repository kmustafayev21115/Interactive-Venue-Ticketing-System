const CartUI = (() => {
  const money = n => `${VENUE.currency.symbol}${n.toFixed(2)}`;
  const MESSAGES = {
    unavailable: 'That seat is unavailable and cannot be added.',
    duplicate: 'That seat is already in your cart.',
    unknown: 'That seat does not exist.'
  };

  function renderCart(listEl, totalEl, titleEl) {
    const ids = Cart.getItems();
    titleEl.textContent = ids.length ? `Your cart (${ids.length})` : 'Your cart';
    listEl.innerHTML = ids.length ? ids.map(id => {
      const s = MapView.getSeat(id);
      return `<li class="cart-item">
        <span><strong>${s.sectionName}</strong><br><small>Row ${s.row}, seat ${s.number} · ${s.category}</small></span>
        <span class="cart-price">${money(s.price)}</span>
        <button type="button" class="remove" data-remove="${id}" aria-label="Remove ${s.sectionName}, row ${s.row}, seat ${s.number}">Remove</button>
      </li>`;
    }).join('') : '<li class="empty">No tickets yet. Inspect a seat, then press Add to cart.</li>';
    totalEl.textContent = money(Cart.total());
  }

  function renderAddButton(button) {
    const id = SeatStore.getInspectedId();
    const state = id ? SeatStore.stateOf(id) : null;
    button.disabled = !id || state === 'unavailable' || state === 'in-cart';
    button.textContent = state === 'in-cart' ? 'In your cart' : 'Add to cart';
  }

  return { renderCart, renderAddButton, MESSAGES };
})();
