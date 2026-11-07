# Testing

## Automated logic tests
`npm test` (or `node tests/run-tests.js`) runs the model, seat-state, cart, localStorage and map-navigation logic in a sandbox. It does not click the real page, so the checklist below still has to be done in a browser.

## Manual checklist (from the project brief)
Tick each item after trying it in a browser, and note the browser and width used.

- [ ] Click a seat: details appear, the cart does not change until ADD TO CART is pressed
- [ ] Add a seat, then try to add it again: no duplicate ticket (button shows "In your cart")
- [ ] Remove a ticket from the cart: its seat changes on the map immediately
- [ ] Refresh the page: cart items and their seat states are restored
- [ ] Click an unavailable (hatched) seat: details show "Unavailable" and ADD TO CART stays disabled
- [ ] Zoom in/out, Move up/down/left/right and Reset / center all work, and stop at the limits
- [ ] Keyboard: focus the map, then arrows, + / - and 0 work; Escape clears the inspected seat
- [ ] Clear cart empties the cart and restores every seat
- [ ] Widths to try: 360, 600, 768, 960, 1280 px (toolbar wraps, panels stack below 960 px)
- [ ] Open in a private window where storage may be blocked: the page still works

## Bonus (mouse navigation)
- [ ] Mouse wheel zooms around the cursor and stops at the zoom limits
- [ ] Click-and-drag on the map pans it and stops at the map edges
- [ ] A short click on a seat (no drag) still inspects the seat; releasing after a drag does not
- [ ] All buttons still work after using the mouse
