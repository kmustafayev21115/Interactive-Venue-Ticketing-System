# Interactive Venue Ticketing System

Web & Mobile I student project (HTML, CSS, JavaScript). Ticket selection for the **Main Auditorium**,
modelled on the two venue photos in `reference/images/`. Open `index.html` in a browser; no build step.

## Progress
- Week 1: venue choice, layout sketch, sections, prices, HTML/CSS shell, JS data model
- Week 2: generate seats from data, seat states, seat inspection
- Week 3: pan/zoom/reset, Add to Cart, removal, totals, localStorage
- Week 4: responsiveness, edge cases, testing, mouse bonus (wheel zoom, drag pan)

## Project files
- `docs/venue-design.md`: venue choice, sketch, sections, prices, seat structure
- `index.html`, `css/styles.css`: interface shell
- `js/venue-data.js`: venue data model and helpers
- `js/seat-state.js`: seat state store (available, inspected, in-cart, unavailable)
- `js/venue-render.js`: builds seats from the model and renders the map
- `js/map-navigation.js`: zoom, move and reset controls
- `js/cart.js`, `js/cart-ui.js`: cart model and cart/add-button rendering
- `js/cart-storage.js`: localStorage save and restore
- `js/seat-details.js`: seat details and price panel
- `js/app.js`: page setup and event wiring

## Features
- Venue generated from data: 9 sections, 4 price categories, 365 seats (`js/venue-data.js`)
- Seat click inspects only; ADD TO CART adds explicitly; duplicates and unavailable seats are refused
- Zoom, move and reset buttons, keyboard control, plus mouse-wheel zoom and drag panning
- Cart with total, removal and clear; map and cart stay in sync; cart saved in `localStorage`
- Responsive layout (phone, tablet, desktop)

## Tests
`npm test` runs the logic tests in `tests/run-tests.js`. The manual browser checklist is in `docs/testing.md`.
