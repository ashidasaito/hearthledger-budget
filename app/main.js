import { loadStore, saveStore, resetStore, MONTH } from './data.js';
import { monthName } from './format.js';
import { viewDashboard, viewBudget, viewTransactions, viewBills, viewGoals, viewReports, viewSubscriptions, viewGuide } from './views.js';

const app = document.getElementById('app');
const monthLabel = document.getElementById('monthLabel');
monthLabel.textContent = monthName(MONTH.year, MONTH.month);

let store = loadStore();

function saveAndRender() {
  saveStore(store);
  render();
}

const ROUTES = {
  '': viewDashboard,
  budget: viewBudget,
  transactions: viewTransactions,
  bills: viewBills,
  goals: viewGoals,
  reports: viewReports,
  subscriptions: viewSubscriptions,
  guide: viewGuide,
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES[hash] ? hash : '';
}

function render() {
  const route = currentRoute();
  const view = ROUTES[route](store, saveAndRender);
  app.innerHTML = view.html;
  if (view.mount) view.mount(app);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);

// A fresh start link for testing: ?reset=1 restores the November seed data.
if (new URLSearchParams(window.location.search).get('reset') === '1') {
  store = resetStore();
  history.replaceState(null, '', window.location.pathname + window.location.hash);
}

render();
