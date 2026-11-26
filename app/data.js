const KEY = 'hearthledger-marlowe-v1';
export const TODAY = '2026-11-26';
export const MONTH = { year: 2026, month: 11 };

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#234434', note: 'Rent, insurance, upkeep' },
  { id: 'groceries', name: 'Groceries', color: '#c96f3f', note: 'Weekly shop and pantry' },
  { id: 'transport', name: 'Transport', color: '#3f6d8e', note: 'Fuel, bus passes, car care' },
  { id: 'utilities', name: 'Utilities', color: '#d9a441', note: 'Power, water, internet, phone' },
  { id: 'dining', name: 'Dining out', color: '#8a5a83', note: 'Restaurants and takeaway' },
  { id: 'kids', name: 'Kids', color: '#5a8a5f', note: 'School, clothes, activities' },
  { id: 'health', name: 'Health', color: '#a63d2f', note: 'Pharmacy, dentist, gym' },
  { id: 'fun', name: 'Fun and treats', color: '#c9a227', note: 'Films, books, small joys' },
  { id: 'savings', name: 'Savings', color: '#2e7d6b', note: 'Moved to savings on payday' },
  { id: 'misc', name: 'Everything else', color: '#6b7268', note: 'Gifts, repairs, surprises' },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, color: '#6b7268', note: '' };
}

function seed() {
  return {
    household: 'Marlowe household',
    income: [
      { id: 'inc1', source: 'Maya, salary (Nov 1)', amount: 385000, date: '2026-11-01' },
      { id: 'inc2', source: 'Daniel, salary (Nov 1)', amount: 255000, date: '2026-11-01' },
    ],
    plan: {
      housing: 210000, groceries: 102000, transport: 40000, utilities: 32000,
      dining: 28000, kids: 35000, health: 25000, fun: 25000, savings: 120000, misc: 23000,
    },
    transactions: [
      { id: 't01', date: '2026-11-01', desc: 'Rent, November', cat: 'housing', amount: -185000, kind: 'expense' },
      { id: 't02', date: '2026-11-02', desc: 'GreenMart weekly shop', cat: 'groceries', amount: -18420, kind: 'expense' },
      { id: 't03', date: '2026-11-03', desc: 'Electric bill, October usage', cat: 'utilities', amount: -11840, kind: 'expense' },
      { id: 't04', date: '2026-11-04', desc: 'Fuel, Shell station', cat: 'transport', amount: -5230, kind: 'expense' },
      { id: 't05', date: '2026-11-05', desc: 'School lunch money, Nora', cat: 'kids', amount: -4500, kind: 'expense' },
      { id: 't06', date: '2026-11-06', desc: 'Pizza night, family of four', cat: 'dining', amount: -3875, kind: 'expense' },
      { id: 't07', date: '2026-11-07', desc: 'Pharmacy, cold medicine', cat: 'health', amount: -2340, kind: 'expense' },
      { id: 't08', date: '2026-11-08', desc: 'GreenMart weekly shop', cat: 'groceries', amount: -17265, kind: 'expense' },
      { id: 't09', date: '2026-11-09', desc: 'Bus passes, Maya and Daniel', cat: 'transport', amount: -9800, kind: 'expense' },
      { id: 't10', date: '2026-11-10', desc: 'Water bill', cat: 'utilities', amount: -4210, kind: 'expense' },
      { id: 't11', date: '2026-11-11', desc: 'New winter coat, Leo', cat: 'kids', amount: -8900, kind: 'expense' },
      { id: 't12', date: '2026-11-12', desc: 'Cinema, Saturday film', cat: 'fun', amount: -3150, kind: 'expense' },
      { id: 't13', date: '2026-11-13', desc: 'GreenMart weekly shop', cat: 'groceries', amount: -19840, kind: 'expense' },
      { id: 't14', date: '2026-11-14', desc: 'Dentist checkup, Maya', cat: 'health', amount: -6500, kind: 'expense' },
      { id: 't15', date: '2026-11-15', desc: 'Takeaway Thai, Friday treat', cat: 'dining', amount: -4230, kind: 'expense' },
      { id: 't16', date: '2026-11-16', desc: 'Fuel, Shell station', cat: 'transport', amount: -4860, kind: 'expense' },
      { id: 't17', date: '2026-11-17', desc: 'Internet and phone', cat: 'utilities', amount: -8950, kind: 'expense' },
      { id: 't18', date: '2026-11-18', desc: 'School trip fee, Nora', cat: 'kids', amount: -3500, kind: 'expense' },
      { id: 't19', date: '2026-11-19', desc: 'GreenMart weekly shop', cat: 'groceries', amount: -16980, kind: 'expense' },
      { id: 't20', date: '2026-11-20', desc: 'Sold old bike on marketplace', cat: 'misc', amount: 12000, kind: 'income' },
      { id: 't21', date: '2026-11-21', desc: 'Birthday gift for Grandma', cat: 'misc', amount: -5400, kind: 'expense' },
      { id: 't22', date: '2026-11-22', desc: 'Sunday roast ingredients', cat: 'groceries', amount: -6420, kind: 'expense' },
      { id: 't23', date: '2026-11-23', desc: 'Gym membership, Daniel', cat: 'health', amount: -2900, kind: 'expense' },
      { id: 't24', date: '2026-11-24', desc: 'Lunch out, Maya and friend', cat: 'dining', amount: -1845, kind: 'expense' },
      { id: 't25', date: '2026-11-25', desc: 'GreenMart weekly shop', cat: 'groceries', amount: -17610, kind: 'expense' },
      { id: 't26', date: '2026-11-26', desc: 'Fuel, Shell station', cat: 'transport', amount: -5100, kind: 'expense' },
      { id: 't27', date: '2026-11-01', desc: 'Moved to emergency fund', cat: 'savings', amount: -120000, kind: 'expense' },
    ],
    bills: [
      { id: 'b1', name: 'Rent', amount: 185000, due: '2026-11-01', paid: true, repeats: 'Monthly' },
      { id: 'b2', name: 'Electric bill', amount: 11840, due: '2026-11-03', paid: true, repeats: 'Monthly' },
      { id: 'b3', name: 'Water bill', amount: 4210, due: '2026-11-10', paid: true, repeats: 'Monthly' },
      { id: 'b4', name: 'Internet and phone', amount: 8950, due: '2026-11-17', paid: true, repeats: 'Monthly' },
      { id: 'b5', name: 'Car insurance', amount: 14200, due: '2026-11-28', paid: false, repeats: 'Monthly' },
      { id: 'b6', name: 'Home insurance', amount: 9800, due: '2026-11-30', paid: false, repeats: 'Monthly' },
      { id: 'b7', name: 'School fees, term 2', amount: 22000, due: '2026-12-05', paid: false, repeats: 'Quarterly' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 1200000, saved: 742000, note: 'Six months of essentials, kept in a separate account.' },
      { id: 'g2', name: 'Summer holiday 2027', target: 350000, saved: 128500, note: 'A week by the coast for all four of us.' },
      { id: 'g3', name: 'New fridge', target: 95000, saved: 41200, note: 'The old one hums too loud and eats power.' },
      { id: 'g4', name: 'Leo braces fund', target: 180000, saved: 30000, note: 'Dentist says next year, so we save a little each month.' },
    ],
    subscriptions: [
      { id: 's1', name: 'StreamPlay video', amount: 1599, cycle: 'Monthly', next: '2026-12-02', active: true },
      { id: 's2', name: 'MusicWave family', amount: 1699, cycle: 'Monthly', next: '2026-12-05', active: true },
      { id: 's3', name: 'Cloud storage 200 GB', amount: 299, cycle: 'Monthly', next: '2026-12-11', active: true },
      { id: 's4', name: 'Kids reading app', amount: 799, cycle: 'Monthly', next: '2026-12-14', active: true },
      { id: 's5', name: 'Meal kit box', amount: 5900, cycle: 'Monthly', next: '2026-12-01', active: true },
      { id: 's6', name: 'Old fitness app', amount: 1299, cycle: 'Monthly', next: '2026-12-03', active: false },
    ],
    history: [
      { month: 'Jun 2026', income: 640000, spent: 588400 },
      { month: 'Jul 2026', income: 640000, spent: 612300 },
      { month: 'Aug 2026', income: 655000, spent: 601100 },
      { month: 'Sep 2026', income: 640000, spent: 574800 },
      { month: 'Oct 2026', income: 640000, spent: 596200 },
      { month: 'Nov 2026', income: 652000, spent: 0 },
    ],
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    // A damaged save falls back to the seed data.
  }
  const fresh = seed();
  saveStore(fresh);
  return fresh;
}

export function saveStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Private browsing or a full store: the page still works for this visit.
  }
}

export function resetStore() {
  const fresh = seed();
  saveStore(fresh);
  return fresh;
}

export function totalIncome(store) {
  return store.income.reduce((sum, row) => sum + row.amount, 0)
    + store.transactions.filter((t) => t.kind === 'income').reduce((sum, t) => sum + t.amount, 0);
}

export function totalSpent(store) {
  return store.transactions
    .filter((t) => t.kind === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function spentByCategory(store) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of store.transactions) {
    if (t.kind === 'expense' && out[t.cat] !== undefined) out[t.cat] += Math.abs(t.amount);
  }
  return out;
}

export function plannedTotal(store) {
  return Object.values(store.plan).reduce((sum, v) => sum + v, 0);
}

export function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}
