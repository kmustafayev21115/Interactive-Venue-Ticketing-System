const VENUE = {
  name: 'Main Auditorium',
  building: 'Building C, ADA University',
  event: { title: 'Startup Pitch Night', date: '2026-11-08', time: '19:00' },
  currency: { code: 'AZN', symbol: '₼' },
  map: { width: 1300, height: 700, origin: { x: 650, y: -90 } },
  seat: { size: 22, rowPitch: 34, minSpacing: 23 },
  stage: { radius: 280 },
  seatStates: ['available', 'inspected', 'in-cart', 'unavailable'],

  categories: {
    premium:  { label: 'Premium',  price: 30, color: '#a3123a' },
    gold:     { label: 'Gold',     price: 25, color: '#c9791a' },
    standard: { label: 'Standard', price: 15, color: '#2f6f8f' },
    gallery:  { label: 'Gallery',  price: 10, color: '#6b5b8a' }
  },
  tiers: {
    front:   { label: 'Front tier',    innerRadius: 300, rows: 'ABC' },
    main:    { label: 'Main tier',     innerRadius: 450, rows: 'DEFGH' },
    gallery: { label: 'Upper gallery', innerRadius: 664, rows: 'JK' }
  },
  sections: [
    { code: 'FC', name: 'Front Center',   tier: 'front',   from: -30, to: 30,  category: 'premium',  seatsPerRow: [12, 14, 16] },
    { code: 'FL', name: 'Front Left',     tier: 'front',   from: -68, to: -34, category: 'standard', seatsPerRow: [7, 8, 8] },
    { code: 'FR', name: 'Front Right',    tier: 'front',   from: 34,  to: 68,  category: 'standard', seatsPerRow: [7, 8, 8] },
    { code: 'MC', name: 'Main Center',    tier: 'main',    from: -30, to: 30,  category: 'gold',     seatsPerRow: [15, 16, 17, 18, 19] },
    { code: 'ML', name: 'Main Left',      tier: 'main',    from: -68, to: -34, category: 'standard', seatsPerRow: [8, 10, 12, 13, 14] },
    { code: 'MR', name: 'Main Right',     tier: 'main',    from: 34,  to: 68,  category: 'standard', seatsPerRow: [8, 10, 12, 13, 14] },
    { code: 'GC', name: 'Gallery Center', tier: 'gallery', from: -24, to: 24,  category: 'gallery',  seatsPerRow: [16, 18] },
    { code: 'GL', name: 'Gallery Left',   tier: 'gallery', from: -54, to: -28, category: 'gallery',  seatsPerRow: [10, 12] },
    { code: 'GR', name: 'Gallery Right',  tier: 'gallery', from: 28,  to: 54,  category: 'gallery',  seatsPerRow: [10, 12] }
  ],
  unavailable: [
    { section: 'FC', row: 'B', seats: [6, 7, 8],      reason: 'sold' },
    { section: 'FC', row: 'C', seats: [3, 4],         reason: 'sold' },
    { section: 'MC', row: 'F', seats: [7, 8, 9, 10],  reason: 'sold' },
    { section: 'MC', row: 'H', seats: [9, 10, 11],    reason: 'reserved' },
    { section: 'ML', row: 'D', seats: [3, 4],         reason: 'sold' },
    { section: 'MR', row: 'G', seats: [6],            reason: 'sold' },
    { section: 'FR', row: 'A', seats: [1, 2],         reason: 'reserved' },
    { section: 'GC', row: 'K', seats: [8, 9, 10],     reason: 'sold' },
    { section: 'GL', row: 'J', seats: [2],            reason: 'sold' }
  ]
};

const toRad = deg => (deg * Math.PI) / 180;
const getSection = code => VENUE.sections.find(s => s.code === code);
const makeSeatId = (code, row, number) => `${code}-${row}${number}`;

function getSectionRows(section) {
  const tier = VENUE.tiers[section.tier];
  return [...tier.rows].map((row, i) => ({
    row,
    radius: tier.innerRadius + i * VENUE.seat.rowPitch,
    seatCount: section.seatsPerRow[i] || 0
  }));
}

function getUnavailableMap() {
  const map = new Map();
  VENUE.unavailable.forEach(g => g.seats.forEach(n => map.set(makeSeatId(g.section, g.row, n), g.reason)));
  return map;
}

function summarizeVenue() {
  const bySection = {}, byCategory = {};
  let total = 0;
  VENUE.sections.forEach(sec => {
    const count = sec.seatsPerRow.reduce((sum, n) => sum + n, 0);
    bySection[sec.code] = count;
    byCategory[sec.category] = (byCategory[sec.category] || 0) + count;
    total += count;
  });
  return { total, unavailable: getUnavailableMap().size, bySection, byCategory };
}

function validateVenue() {
  const errors = [], codes = new Set();
  VENUE.sections.forEach(sec => {
    if (codes.has(sec.code)) errors.push(`Duplicate section code ${sec.code}`);
    codes.add(sec.code);
    if (!VENUE.categories[sec.category]) errors.push(`${sec.code}: unknown category`);
    const tier = VENUE.tiers[sec.tier];
    if (!tier) return errors.push(`${sec.code}: unknown tier`);
    if (sec.seatsPerRow.length !== tier.rows.length)
      errors.push(`${sec.code}: needs ${tier.rows.length} values in seatsPerRow`);
    getSectionRows(sec).forEach(r => {
      const spacing = (r.radius * toRad(sec.to - sec.from)) / r.seatCount;
      if (spacing < VENUE.seat.minSpacing) errors.push(`${sec.code} row ${r.row}: seats too close (${spacing.toFixed(1)}px)`);
    });
    VENUE.sections.forEach(o => {
      if (o.code < sec.code && o.tier === sec.tier && sec.from < o.to && o.from < sec.to)
        errors.push(`${sec.code} overlaps ${o.code}`);
    });
  });
  VENUE.unavailable.forEach(g => {
    const sec = getSection(g.section);
    const row = sec && getSectionRows(sec).find(r => r.row === g.row);
    if (!row) return errors.push(`Unavailable group has bad section/row: ${g.section}${g.row}`);
    g.seats.forEach(n => { if (n < 1 || n > row.seatCount) errors.push(`${makeSeatId(g.section, g.row, n)} does not exist`); });
  });
  return errors;
}

if (typeof module !== 'undefined') module.exports = { VENUE, getSectionRows, getUnavailableMap, summarizeVenue, validateVenue, makeSeatId, toRad };
