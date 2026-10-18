# Interactive Venue Ticketing System
# Venue design: Main Auditorium Building C

## 1. Venue choice
The venue is the curved, wood-panelled lecture auditorium shown in the two reference images. The event takes place in Building C of ADA university, with a payed entrance for a  **Startup Pitch Night** in **AZN (₼)**.

## 2. Layout sketch
The sketch was based on the 2 reference images, the number of seats per rows might be inacurate.  

## 3. Sections and prices
**| Code | Section    | Tier         | Rows | Seats per row       | Seats | Category | Price |**
| FC | Front Center   | Front tier    | A–D | 12, 14, 16          | 42  | Premium  | ₼30 |
| FL | Front Left     | Front tier    | A–D | 7, 8, 8             | 23  | Standard | ₼15 |
| FR | Front Right    | Front tier    | A–D | 7, 8, 8             | 23  | Standard | ₼15 |
| MC | Main Center    | Main tier     | E–L | 15, 16, 17, 18, 19  | 85  | Gold     | ₼25 |
| ML | Main Left      | Main tier     | E–L | 8, 10, 12, 13, 14   | 57  | Standard | ₼15 |
| MR | Main Right     | Main tier     | E–L | 8, 10, 12, 13, 14   | 57  | Standard | ₼15 |
| GC | Gallery Center | Upper gallery | M–R | 16, 18              | 34  | Gallery  | ₼10 |
| GL | Gallery Left   | Upper gallery | M–R | 10, 12              | 24  | Gallery  | ₼10 |
| GR | Gallery Right  | Upper gallery | M–R | 10, 12              | 24  | Gallery  | ₼10 |

**Capacity: 369 seats**, rows skip the letters I and O.

**| Category | Price | Seats |**
| Premium  | ₼30 | 42  |
| Gold     | ₼25 | 85  |
| Standard | ₼15 | 245 |
| Gallery  | ₼10 | 82  |

## 4. Seat structure
- Seat ID: "<code>-<row><number>", e.g. `MC-F12` (Main Center, row F, seat 12). Numbers run left to right and restart in every section row.
- Seat count per row = floor(arc length / seat pitch), so outer rows hold more seats.
- Seat size 22px, pitch 26px, row pitch 34px, map space 1400×960.
- Seat states: available, inspected, in-cart, unavailable.

