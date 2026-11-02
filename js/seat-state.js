const SeatStore = (() => {
  const unavailable = getUnavailableMap();
  const inCart = new Set();
  const listeners = [];
  let inspectedId = null;

  function stateOf(id) {
    if (unavailable.has(id)) return 'unavailable';
    if (inCart.has(id)) return 'in-cart';
    if (id === inspectedId) return 'inspected';
    return 'available';
  }
  function emit(changed) { listeners.forEach(fn => fn(changed)); }

  function inspect(id) {
    if (id === inspectedId) return;
    const changed = [inspectedId, id].filter(Boolean);
    inspectedId = id;
    emit(changed);
  }
  function clearInspection() {
    if (!inspectedId) return;
    const changed = [inspectedId];
    inspectedId = null;
    emit(changed);
  }
  function setInCart(id, value) {
    if (unavailable.has(id)) return false;
    value ? inCart.add(id) : inCart.delete(id);
    emit([id]);
    return true;
  }

  return {
    stateOf, inspect, clearInspection, setInCart,
    getInspectedId: () => inspectedId,
    getUnavailableReason: id => unavailable.get(id) || null,
    subscribe: fn => listeners.push(fn)
  };
})();
