# HearthLedger, the Marlowe household budget

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/ashidasaito/hearthledger-budget/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/ashidasaito/hearthledger-budget/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

A household budget site for a family of four, built for the
[best household budget site](https://make.fun/c/best-household-budget-site-20261126-1457)
competition on make.fun. It runs entirely from static files in `app/`, with no
network request and no build step.

## What it does

- **Dashboard**: money in, spent so far, left to spend, safe spending per day,
  a spending donut, budget bars, bills coming up, recent transactions and
  savings goals at a glance.
- **Budget**: a zero-based monthly plan. Every dollar of the $6,400 take-home
  pay gets a job, and planned amounts are editable and saved.
- **Transactions**: the full November list with category filter and search, plus
  an add form and one-click remove. Totals update at once.
- **Bills**: every bill with its due date, mark paid or unpaid, and an add form.
- **Goals**: four savings goals with progress bars, add money to a goal, and
  create new goals.
- **Reports**: six months of spending as a bar chart, categories ranked by spend,
  and four plain-English findings.
- **Subscriptions**: active and cancelled subscriptions with monthly and yearly
  totals, cancel or bring back, and an add form.
- **Guide**: the household method in five steps, the 50/30/20 split, the
  envelope trick, grocery saving tips and a bill routine.

All data lives in the browser (localStorage) and starts from a realistic
November 2026 seed for the Marlowe household. Nothing leaves the device.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser, desktop or phone.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library.

## Layout

- `app/index.html` - the page shell and navigation
- `app/style.css` - the whole look, responsive down to a phone
- `app/main.js` - router and boot
- `app/views.js` - the eight pages and their forms
- `app/data.js` - seed data and the localStorage store
- `app/charts.js` - canvas donut and bar charts, drawn by hand
- `app/format.js` - money, date and text helpers
- `main.ts` - the hand-in program
- `serve.ts` - the local static server
- `screenshots/` - renders of the site running

## License

MIT. See [LICENSE](LICENSE).
