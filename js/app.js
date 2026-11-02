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

  })();
