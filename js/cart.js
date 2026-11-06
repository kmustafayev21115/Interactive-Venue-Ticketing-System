const Cart = (() => {
  const items = [];
  const listeners = [];
  const emit = () => listeners.forEach(fn => fn(items.slice()));

  function add(id) {
    const seat = MapView.getSeat(id);
    if (!seat) return { ok: false, reason: 'unknown' };
    if (SeatStore.stateOf(id) === 'unavailable') return { ok: false, reason: 'unavailable' };
    if (items.includes(id)) return { ok: false, reason: 'duplicate' };
    items.push(id);
    SeatStore.setInCart(id, true);
    emit();
    return { ok: true };
  }

  function remove(id) {
    const index = items.indexOf(id);
    if (index === -1) return false;
    items.splice(index, 1);
    SeatStore.setInCart(id, false);
    emit();
    return true;
  }

  function replaceAll(ids) {
    const valid = [];
    ids.forEach(id => {
      if (MapView.getSeat(id) && SeatStore.stateOf(id) !== 'unavailable' && !valid.includes(id)) valid.push(id);
    });
    items.filter(id => !valid.includes(id)).forEach(id => SeatStore.setInCart(id, false));
    items.length = 0;
    items.push(...valid);
    valid.forEach(id => SeatStore.setInCart(id, true));
    emit();
    return new Set(ids).size - valid.length;
  }
  
  const total = () => items.reduce((sum, id) => sum + MapView.getSeat(id).price, 0);

  return { add, remove, clear, replaceAll, total, has: id => items.includes(id), getItems: () => items.slice(), subscribe: fn => listeners.push(fn) };
})();
