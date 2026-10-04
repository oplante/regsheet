# RegSheet

A static site. No build step. No account. No server.

Prepared 4 October 2026 by Olivier Plante, United Kingdom.

## Open it locally

The pages use relative links, so they work as files and on GitHub Pages.

1. Download or copy this folder.
2. Open `index.html` in a browser (double-click, or File → Open).
3. Regional dates, including the councils named in the draft regulations, are on `dates.html`.
4. The fill-in sheet is `sheet.html`. Choose a region and how many dwellings (1 to 5), type into the blanks, then “Print or save as PDF”. In the print dialogue, choose Save as PDF if you want a file.

Empty answers are left empty and printed as “you still need this”. The sheet is filled only with what you type. There is no model in that path, and the page does not upload certificates or photographs.

The print stylesheet pins a short disclaimer to the foot of the page. The same disclaimer is also in the body of the printout. Browsers differ on whether a fixed footer repeats on every printed page; check the PDF before you rely on the footer alone. The banner at the top of each HTML page is the on-screen disclaimer.

You do not need a network connection after the files are on disk. Fonts are the ones already on the computer.

## What is still blocked

Checkout is not connected. The buttons on `index.html` are disabled and read “Checkout opens after Stripe/Payhip is connected”. They do not point at a payment URL. Do not add a shop link until a Stripe or Payhip account is actually connected. The £29 (one property) and £49 (up to five) prices are shown so the offer is clear. They are not taken on this site.

Because checkout is not live, `sheet.html` can still be filled in and printed. That is not a record that anyone has paid.

The government fee reported by the NRLA and LandlordZONE is £65 per property per year, paid on GOV.UK, not to RegSheet. The draft regulations do not themselves state £65. See `SOURCES.md`.

This site does not register a landlord or a property, and it is not legal advice.

## Files

- `index.html` — what the sheet is, the nine regional dates, the fee distinction, the agent point, a sample note, prices.
- `dates.html` — the regional table and Schedule 1 areas. Free to read. One link to the sheet at the bottom.
- `sheet.html` — the form and the print view.
- `css/site.css` — layout, including print.
- `js/sheet.js` — shows and hides the relevant blanks, and copies your strings into the print view.
- `SOURCES.md` — URLs, dates, and the field list, including what could not be verified.

## Publish

Put this folder on GitHub Pages as it is, or as the site root. No Jekyll build is required. A `.nojekyll` file is included so GitHub Pages does not try to process the folder.
