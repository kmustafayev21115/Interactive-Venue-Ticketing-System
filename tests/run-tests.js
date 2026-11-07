const vm = require('vm'), fs = require('fs'), path = require('path'), assert = require('assert');
const same = (a, b) => assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
const KEY = 'wm1-ticketing:cart:v1';

function boot(opts = {}) {
  const el = () => ({ style: { setProperty() {} }, dataset: {}, setAttribute() {}, appendChild() {}, addEventListener() {} });
  const store = opts.store || {};
  const buttons = { 'zoom-in': {}, 'zoom-out': {} };
  const ctx = vm.createContext({
    console, window: { addEventListener() {} },
    document: { createElement: el, createDocumentFragment: el },
    localStorage: opts.brokenStorage
      ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }
      : { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } },
    vp: { clientWidth: opts.w || 900, clientHeight: opts.h || 600, addEventListener() {} },
    ly: { style: {} }, lb: { textContent: '' },
    tb: { addEventListener() {}, querySelector: s => buttons[s.match(/"(.*)"/)[1]] }
  });
  ['venue-data', 'seat-state', 'venue-render', 'map-navigation', 'cart', 'cart-storage'].forEach(f =>
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', f + '.js'), 'utf8').replace(/if \(typeof module[^\n]*\n?/, ''), ctx));
  const run = code => vm.runInContext(code, ctx);
  run('MapView.render(document.createElement("div")); SeatStore.subscribe(c => MapView.paint(c)); MapNav.init(vp, ly, tb, lb);');
  return { run, store, buttons };
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('venue model validates and has the expected size', () => {
  const { run } = boot();
  same(run('validateVenue()'), []);
  assert.strictEqual(run('summarizeVenue().total'), 365);
  assert.strictEqual(run('VENUE.sections.length'), 9);
});
test('every seat is generated from data with a unique id', () => {
  const { run } = boot();
  assert.strictEqual(run('new Set(MapView.buildSeats().map(s => s.id)).size'), 365);
  assert.strictEqual(run('MapView.buildSeats().filter(s => s.unavailableReason).length'), 21);
});
test('seat states: inspect does not touch the cart; in-cart outranks inspected', () => {
  const { run } = boot();
  run('SeatStore.inspect("MC-F1")');
  assert.strictEqual(run('SeatStore.stateOf("MC-F1")'), 'inspected');
  assert.strictEqual(run('Cart.getItems().length'), 0);
  run('Cart.add("MC-F1")');
  assert.strictEqual(run('SeatStore.stateOf("MC-F1")'), 'in-cart');
});
test('only one seat is inspected at a time', () => {
  const { run } = boot();
  run('SeatStore.inspect("MC-F1"); SeatStore.inspect("MC-F2")');
  assert.strictEqual(run('SeatStore.stateOf("MC-F1")'), 'available');
});
test('cart rejects duplicates, unavailable and unknown seats', () => {
  const { run } = boot();
  assert.strictEqual(run('Cart.add("MC-F1").ok'), true);
  assert.strictEqual(run('Cart.add("MC-F1").reason'), 'duplicate');
  assert.strictEqual(run('Cart.add("MC-F7").reason'), 'unavailable');
  assert.strictEqual(run('Cart.add("XX-Z9").reason'), 'unknown');
  assert.strictEqual(run('Cart.getItems().length'), 1);
});
test('cart total uses category prices; removal and clear update the map', () => {
  const { run } = boot();
  run('Cart.add("MC-F1"); Cart.add("FC-A1")');
  assert.strictEqual(run('Cart.total()'), 55);
  run('Cart.remove("MC-F1")');
  assert.strictEqual(run('SeatStore.stateOf("MC-F1")'), 'available');
  assert.strictEqual(run('Cart.total()'), 30);
  run('Cart.clear()');
  assert.strictEqual(run('SeatStore.stateOf("FC-A1")'), 'available');
  assert.strictEqual(run('Cart.getItems().length'), 0);
});
test('cart survives a refresh together with seat states', () => {
  const first = boot();
  first.run('Cart.replaceAll([]); Cart.subscribe(i => CartStorage.save(i)); Cart.add("MC-F1"); Cart.add("GC-J3")');
  const second = boot({ store: first.store });
  second.run('Cart.replaceAll(CartStorage.load())');
  same(second.run('Cart.getItems()'), ['MC-F1', 'GC-J3']);
  assert.strictEqual(second.run('SeatStore.stateOf("GC-J3")'), 'in-cart');
});
test('bad, corrupt or blocked storage never breaks the app', () => {
  const bad = boot({ store: { [KEY]: JSON.stringify({ seats: ['MC-F7', 'ZZ-A1', 'FC-A1', 'FC-A1', 42] }) } });
  assert.strictEqual(bad.run('Cart.replaceAll(CartStorage.load())'), 2);
  same(bad.run('Cart.getItems()'), ['FC-A1']);
  same(boot({ store: { [KEY]: '{oops' } }).run('CartStorage.load()'), []);
  same(boot({ brokenStorage: true }).run('CartStorage.load()'), []);
  boot({ brokenStorage: true }).run('CartStorage.save(["MC-F1"])');
});
test('map navigation respects zoom and pan limits and resets', () => {
  const { run } = boot();
  const min = run('MapNav.getMinScale()');
  for (let i = 0; i < 20; i++) run('MapNav.zoomBy(1.25)');
  assert.strictEqual(run('MapNav.getView().scale'), 2.5);
  for (let i = 0; i < 40; i++) run('MapNav.move(1, 1)');
  const v = run('MapNav.getView()');
  assert.ok(v.x >= 900 - 1300 * 2.5 - 1e-6 && v.y >= 600 - 700 * 2.5 - 1e-6);
  for (let i = 0; i < 60; i++) run('MapNav.zoomBy(0.8)');
  assert.ok(Math.abs(run('MapNav.getView().scale') - min) < 1e-9);
  run('MapNav.reset()');
  assert.ok(Math.abs(run('MapNav.getView().scale') - min) < 1e-9);
});
test('small screens start at a readable zoom', () => {
  const { run } = boot({ w: 360, h: 420 });
  assert.strictEqual(run('MapNav.getView().scale'), 0.6);
});

let failed = 0;
tests.forEach(t => {
  try { t.fn(); console.log('PASS', t.name); } catch (e) { failed++; console.log('FAIL', t.name, '\n    ', e.message); }
});
console.log(`\n${tests.length - failed}/${tests.length} tests passed`);
process.exit(failed ? 1 : 0);
