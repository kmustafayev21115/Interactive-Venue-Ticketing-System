const CartStorage = (() => {
  const KEY = 'wm1-ticketing:cart:v1';

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return data && Array.isArray(data.seats) ? data.seats.filter(id => typeof id === 'string') : [];
    } catch (err) {
      return [];
    }
  }

  function save(ids) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ seats: ids, savedAt: new Date().toISOString() }));
    } catch (err) {
      console.warn('Could not save the cart:', err);
    }
  }

  return { KEY, load, save };
})();
