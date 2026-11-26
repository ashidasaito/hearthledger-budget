import { money, moneyShort, pct, dayLabel, daysUntil, escapeHtml, parseMoney } from './format.js';
import { CATEGORIES, categoryById, spentByCategory, totalIncome, totalSpent, plannedTotal, newId, TODAY } from './data.js';
import { drawDonut, drawBars } from './charts.js';

function navActive(route) {
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function statCard(label, big, sub, tone) {
  return `<div class="card"><div class="label">${label}</div><div class="big ${tone || ''}">${big}</div><div class="sub">${sub}</div></div>`;
}

function barClass(p, over) {
  if (over) return 'bar-fill over';
  if (p >= 85 && p < 100) return 'bar-fill warm';
  return 'bar-fill';
}

function budgetBars(store, limit) {
  const spent = spentByCategory(store);
  const rows = CATEGORIES.map((c) => ({ ...c, planned: store.plan[c.id] || 0, spent: spent[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit || CATEGORIES.length);
  return rows.map((r) => {
    const p = pct(r.spent, r.planned);
    const over = r.spent > r.planned;
    const cls = barClass(p, over);
    return `<div class="budget-row">
      <div class="cat">${escapeHtml(r.name)}<small>${escapeHtml(r.note)}</small></div>
      <div><div class="bar-track"><div class="${cls}" style="width:${Math.min(100, p)}%"></div></div></div>
      <div class="nums">${money(r.spent)}<br><span style="color:var(--muted)">of ${money(r.planned)}</span></div>
    </div>`;
  }).join('');
}

export function viewDashboard(store) {
  const income = totalIncome(store);
  const spent = totalSpent(store);
  const left = income - spent;
  const daysLeft = 30 - 26 + 1;
  const safePerDay = Math.max(0, Math.round(left / daysLeft / 100) * 100);
  const byCat = spentByCategory(store);
  const slices = CATEGORIES.map((c) => ({ value: byCat[c.id], color: c.color })).filter((s) => s.value > 0);
  const upcoming = store.bills.filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  const recent = [...store.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 5);
  const savingsRate = pct(store.plan.savings, store.income.reduce((sum, row) => sum + row.amount, 0));

  const html = `
  <div class="page-head">
    <h1>November is on track</h1>
    <p>Good morning, Marlowe household. You have ${money(left)} left of ${money(income)} this month, and the bills due this week are covered.</p>
  </div>
  <section class="cards" aria-label="Month summary">
    ${statCard('Money in', money(income), 'Two salaries plus $120.00 from selling the old bike')}
    ${statCard('Spent so far', money(spent), '26 days of November, ' + pct(spent, income) + '% of income')}
    ${statCard('Left to spend', money(left), 'Safe to spend ' + money(safePerDay) + ' a day for the last 5 days', left < 0 ? 'warn' : 'good')}
    ${statCard('Savings rate', savingsRate + '%', money(store.plan.savings) + ' moved to savings on payday')}
  </section>
  <div class="grid2">
    <section class="panel">
      <h2>Where the money went</h2>
      <div class="chart-wrap"><canvas class="chart" id="donutChart" width="360" height="300" role="img" aria-label="Donut chart of spending by category"></canvas></div>
      <div class="legend">${CATEGORIES.map((c) => `<span><span class="swatch" style="background:${c.color}"></span>${escapeHtml(c.name)} ${money(byCat[c.id])}</span>`).join('')}</div>
    </section>
    <section class="panel">
      <h2>Budget vs actual</h2>
      ${budgetBars(store, 6)}
      <p style="margin-top:.8rem"><a class="btn ghost small" href="#/budget">Open the full budget</a></p>
    </section>
  </div>
  <div class="grid2">
    <section class="panel">
      <h2>Bills coming up</h2>
      <ul class="list-plain">
        ${upcoming.map((b) => `<li><span class="rowline"><span><strong>${escapeHtml(b.name)}</strong><br><span style="color:var(--muted);font-size:.9rem">Due ${dayLabel(b.due)}</span></span><span><strong>${money(b.amount)}</strong><br><span class="tag ${daysUntil(b.due, TODAY) <= 3 ? 'red' : 'gold'}">${daysUntil(b.due, TODAY) === 0 ? 'Due today' : 'in ' + daysUntil(b.due, TODAY) + ' days'}</span></span></span></li>`).join('')}
      </ul>
      <p style="margin-top:.8rem"><a class="btn ghost small" href="#/bills">See all bills</a></p>
    </section>
    <section class="panel">
      <h2>Recent spending</h2>
      <ul class="list-plain">
        ${recent.map((t) => `<li><span class="rowline"><span><strong>${escapeHtml(t.desc)}</strong><br><span style="color:var(--muted);font-size:.9rem">${dayLabel(t.date)} &middot; ${escapeHtml(categoryById(t.cat).name)}</span></span><span class="${t.kind === 'income' ? 'positive' : 'negative'}"><strong>${t.kind === 'income' ? '+' : '-'}${money(Math.abs(t.amount))}</strong></span></span></li>`).join('')}
      </ul>
      <p style="margin-top:.8rem"><a class="btn ghost small" href="#/transactions">All transactions</a></p>
    </section>
  </div>
  <section class="panel">
    <h2>Savings goals at a glance</h2>
    <div class="cards">
      ${store.goals.map((g) => `<div class="card"><div class="label">${escapeHtml(g.name)}</div><div class="big">${pct(g.saved, g.target)}%</div><div class="progress"><span style="width:${Math.min(100, pct(g.saved, g.target))}%"></span></div><div class="sub">${money(g.saved)} of ${money(g.target)}</div></div>`).join('')}
    </div>
    <p><a class="btn ghost small" href="#/goals">Manage goals</a></p>
  </section>`;

  return {
    html,
    mount(root) {
      navActive('');
      drawDonut(root.querySelector('#donutChart'), slices);
    },
  };
}

export function viewBudget(store, save) {
  const income = totalIncome(store);
  const planned = plannedTotal(store);
  const toAssign = income - planned;
  const spent = spentByCategory(store);

  const html = `
  <div class="page-head">
    <h1>November budget</h1>
    <p>Give every dollar a job before the month starts. Planned spending is ${money(planned)} of ${money(income)} income, so ${money(toAssign)} is still unassigned. Change any planned amount and save it.</p>
  </div>
  <section class="cards" aria-label="Budget summary">
    ${statCard('Income', money(income), 'November take-home pay plus extras')}
    ${statCard('Planned', money(planned), pct(planned, income) + '% of income is assigned')}
    ${statCard('Left to assign', money(toAssign), toAssign === 0 ? 'Every dollar has a job. Well done.' : toAssign > 0 ? 'Assign it to savings or a goal.' : 'Over budget: trim a category.', toAssign < 0 ? 'warn' : 'good')}
  </section>
  <section class="panel">
    <h2>Categories</h2>
    <form id="planForm">
      ${CATEGORIES.map((c) => {
        const spentAmt = spent[c.id] || 0;
        const plannedAmt = store.plan[c.id] || 0;
        const p = pct(spentAmt, plannedAmt);
        const over = spentAmt > plannedAmt;
        return `<div class="budget-row" style="grid-template-columns: 1fr 150px 110px;">
          <div class="cat">${escapeHtml(c.name)}<small>${escapeHtml(c.note)} &middot; spent ${money(spentAmt)} (${p}%)</small>
            <div class="bar-track" style="margin-top:.35rem"><div class="${barClass(p, over)}" style="width:${Math.min(100, p)}%"></div></div>
          </div>
          <div><label for="plan-${c.id}" style="position:absolute;left:-9999px">Planned for ${escapeHtml(c.name)}</label>
          <input id="plan-${c.id}" name="plan-${c.id}" inputmode="decimal" value="${(plannedAmt / 100).toFixed(2)}" aria-label="Planned dollars for ${escapeHtml(c.name)}"></div>
          <div class="nums">${over ? '<span class="negative"><strong>Over by ' + money(spentAmt - plannedAmt) + '</strong></span>' : '<span class="positive">' + money(plannedAmt - spentAmt) + ' left</span>'}</div>
        </div>`;
      }).join('')}
      <div class="form-actions" style="margin-top:1rem">
        <button class="btn" type="submit">Save budget</button>
        <p class="form-msg" id="planMsg" role="status"></p>
      </div>
    </form>
  </section>
  <div class="callout green"><strong>How this household plans:</strong> rent and bills first, then groceries and transport, then savings on payday before anything fun. Fun money is a real category, not whatever is left over, so nobody has to feel guilty about a film night.</div>`;

  return {
    html,
    mount(root) {
      navActive('budget');
      const form = root.querySelector('#planForm');
      const msg = root.querySelector('#planMsg');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        let bad = null;
        for (const c of CATEGORIES) {
          const value = parseMoney(form.elements['plan-' + c.id].value);
          if (value === null) { bad = c.name; break; }
          store.plan[c.id] = value;
        }
        if (bad) {
          msg.textContent = 'Please enter a positive dollar amount for ' + bad + '.';
          msg.className = 'form-msg error';
          return;
        }
        save();
        msg.textContent = 'Budget saved. Totals updated.';
        msg.className = 'form-msg ok';
      });
    },
  };
}

export function viewTransactions(store, save) {
  const sorted = [...store.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const html = `
  <div class="page-head">
    <h1>Transactions</h1>
    <p>Every dollar in and out in November. Add a new one below, or remove a mistake. The totals on the dashboard update at once.</p>
  </div>
  <section class="panel">
    <h2>Add a transaction</h2>
    <form id="txForm">
      <div class="form-row">
        <div class="field"><label for="txDate">Date</label><input id="txDate" name="date" type="date" value="${TODAY}" required></div>
        <div class="field"><label for="txKind">Type</label>
          <select id="txKind" name="kind"><option value="expense">Spending</option><option value="income">Money in</option></select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="txDesc">What was it?</label><input id="txDesc" name="desc" maxlength="80" placeholder="GreenMart weekly shop" required></div>
        <div class="field"><label for="txCat">Category</label>
          <select id="txCat" name="cat">${CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="txAmount">Amount ($)</label><input id="txAmount" name="amount" inputmode="decimal" placeholder="45.20" required></div>
        <div class="field" style="align-self:end"><button class="btn" type="submit">Add transaction</button></div>
      </div>
      <p class="form-msg" id="txMsg" role="status"></p>
    </form>
  </section>
  <section class="panel">
    <h2>All November transactions <span style="color:var(--muted);font-weight:400">(${sorted.length})</span></h2>
    <p><button class="btn ghost small" id="csvBtn" type="button">Download as spreadsheet (CSV)</button>
    <span class="hint">Opens in any spreadsheet app, for the family records or the tax folder.</span></p>
    <div class="form-row" style="margin-bottom:.8rem">
      <div class="field"><label for="txFilter">Filter by category</label>
        <select id="txFilter"><option value="">All categories</option>${CATEGORIES.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="txSearch">Search</label><input id="txSearch" placeholder="Try &quot;GreenMart&quot; or &quot;fuel&quot;"></div>
    </div>
    <table class="responsive" id="txTable">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
      ${sorted.map((t) => `<tr data-cat="${t.cat}" data-desc="${escapeHtml(t.desc.toLowerCase())}">
        <td data-label="Date">${dayLabel(t.date)}</td>
        <td data-label="What">${escapeHtml(t.desc)}</td>
        <td data-label="Category"><span class="tag">${escapeHtml(categoryById(t.cat).name)}</span></td>
        <td data-label="Amount" class="num ${t.kind === 'income' ? 'positive' : 'negative'}">${t.kind === 'income' ? '+' : '-'}${money(Math.abs(t.amount))}</td>
        <td><button class="btn danger small" data-delete="${t.id}">Remove</button></td>
      </tr>`).join('')}
      </tbody>
    </table>
    <p class="hint" id="txCount"></p>
  </section>`;

  return {
    html,
    mount(root) {
      navActive('transactions');
      const form = root.querySelector('#txForm');
      const msg = root.querySelector('#txMsg');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseMoney(form.elements.amount.value);
        if (amount === null) {
          msg.textContent = 'Enter a positive dollar amount, like 45.20.';
          msg.className = 'form-msg error';
          return;
        }
        const desc = form.elements.desc.value.trim();
        if (!desc) {
          msg.textContent = 'Say what it was, so future you can tell.';
          msg.className = 'form-msg error';
          return;
        }
        store.transactions.push({
          id: newId('t'),
          date: form.elements.date.value || TODAY,
          desc,
          cat: form.elements.cat.value,
          amount: form.elements.kind.value === 'income' ? amount : -amount,
          kind: form.elements.kind.value,
        });
        save();
      });

      const filter = root.querySelector('#txFilter');
      const search = root.querySelector('#txSearch');
      const count = root.querySelector('#txCount');
      const applyFilter = () => {
        const cat = filter.value;
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        root.querySelectorAll('#txTable tbody tr').forEach((row) => {
          const ok = (!cat || row.dataset.cat === cat) && (!q || row.dataset.desc.includes(q));
          row.style.display = ok ? '' : 'none';
          if (ok) shown += 1;
        });
        count.textContent = shown === sorted.length ? '' : 'Showing ' + shown + ' of ' + sorted.length + ' transactions.';
      };
      filter.addEventListener('change', applyFilter);
      search.addEventListener('input', applyFilter);

      root.querySelectorAll('[data-delete]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = store.transactions.findIndex((t) => t.id === btn.dataset.delete);
          if (idx !== -1) {
            store.transactions.splice(idx, 1);
            save();
          }
        });
      });

      root.querySelector('#csvBtn').addEventListener('click', () => {
        const lines = ['Date,Description,Category,Type,Amount ($)'];
        const rows = [...store.transactions].sort((a, b) => a.date.localeCompare(b.date));
        for (const t of rows) {
          const desc = '"' + t.desc.replace(/"/g, '""') + '"';
          lines.push([t.date, desc, categoryById(t.cat).name, t.kind, (t.amount / 100).toFixed(2)].join(','));
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hearthledger-november-2026.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      });
    },
  };
}

export function viewBills(store, save) {
  const sorted = [...store.bills].sort((a, b) => a.due.localeCompare(b.due));
  const unpaid = sorted.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((sum, b) => sum + b.amount, 0);
  const paidTotal = sorted.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);

  const html = `
  <div class="page-head">
    <h1>Bills</h1>
    <p>Every bill the household owes, with its due date. Mark a bill paid the moment the money leaves, and add a new one as soon as it arrives.</p>
  </div>
  <section class="cards" aria-label="Bills summary">
    ${statCard('Still to pay', money(unpaidTotal), unpaid.length + ' bill' + (unpaid.length === 1 ? '' : 's') + ' unpaid')}
    ${statCard('Already paid', money(paidTotal), sorted.length - unpaid.length + ' of ' + sorted.length + ' bills paid')}
    ${statCard('Next due', unpaid.length ? escapeHtml(unpaid[0].name) + ', ' + dayLabel(unpaid[0].due) : 'Nothing due', unpaid.length ? money(unpaid[0].amount) + ' on ' + unpaid[0].due : 'All caught up')}
  </section>
  <section class="panel">
    <h2>All bills</h2>
    <table class="responsive">
      <thead><tr><th>Bill</th><th>Due</th><th>Repeats</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead>
      <tbody>
      ${sorted.map((b) => {
        const d = daysUntil(b.due, TODAY);
        const tag = b.paid ? '<span class="tag">Paid</span>'
          : d < 0 ? '<span class="tag red">Overdue</span>'
          : d === 0 ? '<span class="tag red">Due today</span>'
          : d <= 3 ? '<span class="tag gold">Due in ' + d + ' days</span>'
          : '<span class="tag blue">Due in ' + d + ' days</span>';
        return `<tr>
          <td data-label="Bill"><strong>${escapeHtml(b.name)}</strong></td>
          <td data-label="Due">${dayLabel(b.due)}</td>
          <td data-label="Repeats">${escapeHtml(b.repeats)}</td>
          <td data-label="Amount" class="num">${money(b.amount)}</td>
          <td data-label="Status">${tag}</td>
          <td><button class="btn ${b.paid ? 'ghost' : ''} small" data-bill="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
  </section>
  <section class="panel">
    <h2>Add a bill</h2>
    <form id="billForm">
      <div class="form-row">
        <div class="field"><label for="billName">Bill name</label><input id="billName" name="name" maxlength="60" placeholder="Car insurance" required></div>
        <div class="field"><label for="billAmount">Amount ($)</label><input id="billAmount" name="amount" inputmode="decimal" placeholder="142.00" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="billDue">Due date</label><input id="billDue" name="due" type="date" value="2026-11-30" required></div>
        <div class="field"><label for="billRepeats">Repeats</label>
          <select id="billRepeats" name="repeats"><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-off</option></select></div>
      </div>
      <div class="form-actions"><button class="btn" type="submit">Add bill</button><p class="form-msg" id="billMsg" role="status"></p></div>
    </form>
  </section>
  <div class="callout"><strong>House rule:</strong> a bill is never "probably paid". It is marked paid here the same day the money moves, so the "still to pay" number is always the truth.</div>`;

  return {
    html,
    mount(root) {
      navActive('bills');
      root.querySelectorAll('[data-bill]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bill = store.bills.find((b) => b.id === btn.dataset.bill);
          if (bill) { bill.paid = !bill.paid; save(); }
        });
      });
      const form = root.querySelector('#billForm');
      const msg = root.querySelector('#billMsg');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseMoney(form.elements.amount.value);
        if (amount === null) {
          msg.textContent = 'Enter a positive dollar amount.';
          msg.className = 'form-msg error';
          return;
        }
        store.bills.push({
          id: newId('b'),
          name: form.elements.name.value.trim(),
          amount,
          due: form.elements.due.value || TODAY,
          paid: false,
          repeats: form.elements.repeats.value,
        });
        save();
      });
    },
  };
}

export function viewGoals(store, save) {
  const totalSaved = store.goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = store.goals.reduce((sum, g) => sum + g.target, 0);

  const html = `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p>${money(totalSaved)} saved toward ${money(totalTarget)} of goals. Add money to a goal whenever there is a spare dollar, even a small one.</p>
  </div>
  ${store.goals.map((g) => {
    const p = pct(g.saved, g.target);
    return `<section class="panel">
      <div class="goal-head"><h2>${escapeHtml(g.name)}</h2><span class="amount">${money(g.saved)} of ${money(g.target)}</span></div>
      <div class="progress"><span style="width:${Math.min(100, p)}%"></span></div>
      <p class="hint">${p}% there &middot; ${money(g.target - g.saved)} to go</p>
      <p>${escapeHtml(g.note)}</p>
      <form class="goalForm" data-goal="${g.id}">
        <div class="form-row">
          <div class="field"><label for="add-${g.id}">Add money ($)</label><input id="add-${g.id}" name="amount" inputmode="decimal" placeholder="25.00" required></div>
          <div class="field" style="align-self:end"><button class="btn" type="submit">Add to this goal</button></div>
        </div>
        <p class="form-msg" role="status"></p>
      </form>
    </section>`;
  }).join('')}
  <section class="panel">
    <h2>Start a new goal</h2>
    <form id="goalForm">
      <div class="form-row">
        <div class="field"><label for="goalName">Goal name</label><input id="goalName" name="name" maxlength="60" placeholder="New washing machine" required></div>
        <div class="field"><label for="goalTarget">Target ($)</label><input id="goalTarget" name="target" inputmode="decimal" placeholder="800.00" required></div>
      </div>
      <div class="field"><label for="goalNote">Why does it matter?</label><input id="goalNote" name="note" maxlength="120" placeholder="The old one leaks every wash"></div>
      <div class="form-actions"><button class="btn" type="submit">Create goal</button><p class="form-msg" id="goalMsg" role="status"></p></div>
    </form>
  </section>`;

  return {
    html,
    mount(root) {
      navActive('goals');
      root.querySelectorAll('.goalForm').forEach((form) => {
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const amount = parseMoney(form.elements.amount.value);
          const msg = form.querySelector('.form-msg');
          if (amount === null) {
            msg.textContent = 'Enter a positive dollar amount.';
            msg.className = 'form-msg error';
            return;
          }
          const goal = store.goals.find((g) => g.id === form.dataset.goal);
          if (goal) { goal.saved += amount; save(); }
        });
      });
      const form = root.querySelector('#goalForm');
      const msg = root.querySelector('#goalMsg');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const target = parseMoney(form.elements.target.value);
        if (target === null) {
          msg.textContent = 'Enter a positive dollar target.';
          msg.className = 'form-msg error';
          return;
        }
        store.goals.push({
          id: newId('g'),
          name: form.elements.name.value.trim(),
          target,
          saved: 0,
          note: form.elements.note.value.trim() || 'A new goal for the household.',
        });
        save();
      });
    },
  };
}

export function viewReports(store) {
  const salaryIncome = store.income.reduce((sum, row) => sum + row.amount, 0);
  const spent = totalSpent(store);
  const income = totalIncome(store);
  const byCat = spentByCategory(store);
  const rows = CATEGORIES.map((c) => ({ ...c, spent: byCat[c.id] || 0, planned: store.plan[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent);
  const top = rows[0];
  const historyRows = store.history.map((h, i) => ({
    label: h.month.split(' ')[0],
    value: i === store.history.length - 1 ? spent : h.spent,
    color: i === store.history.length - 1 ? '#c96f3f' : '#234434',
  }));
  const avgSpent = Math.round(store.history.slice(0, 5).reduce((sum, h) => sum + h.spent, 0) / 5);
  const subTotal = store.subscriptions.filter((s) => s.active).reduce((sum, s) => sum + s.amount, 0);
  const overPlan = rows.filter((r) => r.spent > r.planned);

  const html = `
  <div class="page-head">
    <h1>November report</h1>
    <p>Six months of spending, the categories that eat the most, and what the household should do next. November is still open, so its bar keeps growing.</p>
  </div>
  <section class="cards" aria-label="Report summary">
    ${statCard('Spent in November', money(spent), 'Average month: ' + money(avgSpent))}
    ${statCard('Biggest category', escapeHtml(top.name), money(top.spent) + ' so far, ' + pct(top.spent, spent) + '% of all spending')}
    ${statCard('Subscriptions', money(subTotal) + '/mo', store.subscriptions.filter((s) => s.active).length + ' active subscriptions')}
    ${statCard('Savings rate', pct(store.plan.savings, salaryIncome) + '%', money(store.plan.savings) + ' of ' + money(salaryIncome) + ' salary saved')}
  </section>
  <section class="panel">
    <h2>Spending by month</h2>
    <div class="chart-wrap" style="max-width:640px"><canvas class="chart" id="barsChart" width="640" height="260" role="img" aria-label="Bar chart of monthly spending from June to November 2026"></canvas></div>
    <p class="hint">November (orange) is counted to today, 26 November. June to October are finished months.</p>
  </section>
  <section class="panel">
    <h2>Categories, most spent first</h2>
    <table class="responsive">
      <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Share</th><th>Status</th></tr></thead>
      <tbody>
      ${rows.map((r) => `<tr>
        <td data-label="Category"><span class="swatch" style="background:${r.color};display:inline-block;width:.8rem;height:.8rem;border-radius:3px;margin-right:.4rem"></span><strong>${escapeHtml(r.name)}</strong></td>
        <td data-label="Planned" class="num">${money(r.planned)}</td>
        <td data-label="Spent" class="num">${money(r.spent)}</td>
        <td data-label="Share" class="num">${pct(r.spent, spent)}%</td>
        <td data-label="Status">${r.spent > r.planned ? '<span class="tag red">Over plan</span>' : '<span class="tag">On plan</span>'}</td>
      </tr>`).join('')}
      </tbody>
    </table>
  </section>
  <section class="panel">
    <h2>What the numbers say</h2>
    <ul class="list-plain">
      <li><strong>Groceries run the house.</strong> ${escapeHtml(top.name)} is the biggest line at ${money(top.spent)}. A weekly shop list and one no-spend day a week would cut it by about $60 a month.</li>
      <li><strong>${overPlan.length === 0 ? 'Nothing is over plan.' : overPlan.map((r) => escapeHtml(r.name)).join(' and ') + (overPlan.length === 1 ? ' is' : ' are') + ' over plan.'}</strong> ${overPlan.length ? 'Move money from a category with room left, or accept the overspend and raise next month\u2019s plan.' : 'Every category is inside its plan with five days to go.'}</li>
      <li><strong>Subscriptions cost ${money(subTotal)} a month.</strong> That is ${money(subTotal * 12)} a year. Check the list on the subscriptions page and cancel anything nobody opened this month.</li>
      <li><strong>The savings rate is ${pct(store.plan.savings, salaryIncome)}%.</strong> The household moves savings out on payday, before spending starts, which is why the rate holds even in a tight month.</li>
    </ul>
  </section>`;

  return {
    html,
    mount(root) {
      navActive('reports');
      drawBars(root.querySelector('#barsChart'), historyRows);
    },
  };
}

export function viewSubscriptions(store, save) {
  const active = store.subscriptions.filter((s) => s.active);
  const inactive = store.subscriptions.filter((s) => !s.active);
  const monthly = active.reduce((sum, s) => sum + s.amount, 0);

  const html = `
  <div class="page-head">
    <h1>Subscriptions</h1>
    <p>Small monthly charges add up fast. Active subscriptions cost ${money(monthly)} a month, ${money(monthly * 12)} a year. Cancel anything the household stopped using.</p>
  </div>
  <section class="cards" aria-label="Subscriptions summary">
    ${statCard('Monthly cost', money(monthly), active.length + ' active subscriptions')}
    ${statCard('Yearly cost', money(monthly * 12), 'If nothing changes')}
    ${statCard('Cancelled', String(inactive.length), inactive.length ? inactive.map((s) => escapeHtml(s.name)).join(', ') : 'Nothing cancelled yet')}
  </section>
  <section class="panel">
    <h2>Active subscriptions</h2>
    <table class="responsive">
      <thead><tr><th>Service</th><th class="num">Cost</th><th>Next charge</th><th></th></tr></thead>
      <tbody>
      ${active.map((s) => `<tr>
        <td data-label="Service"><strong>${escapeHtml(s.name)}</strong></td>
        <td data-label="Cost" class="num">${money(s.amount)} / ${escapeHtml(s.cycle.toLowerCase())}</td>
        <td data-label="Next charge">${dayLabel(s.next)}</td>
        <td><button class="btn danger small" data-sub="${s.id}">Cancel</button></td>
      </tr>`).join('')}
      </tbody>
    </table>
  </section>
  ${inactive.length ? `<section class="panel">
    <h2>Cancelled</h2>
    <ul class="list-plain">
      ${inactive.map((s) => `<li><span class="rowline"><span><strong>${escapeHtml(s.name)}</strong><br><span style="color:var(--muted);font-size:.9rem">${money(s.amount)} a month, stopped</span></span><button class="btn ghost small" data-sub="${s.id}">Bring back</button></span></li>`).join('')}
    </ul>
  </section>` : ''}
  <section class="panel">
    <h2>Add a subscription</h2>
    <form id="subForm">
      <div class="form-row">
        <div class="field"><label for="subName">Service name</label><input id="subName" name="name" maxlength="60" placeholder="News app" required></div>
        <div class="field"><label for="subAmount">Cost per month ($)</label><input id="subAmount" name="amount" inputmode="decimal" placeholder="9.99" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="subNext">Next charge date</label><input id="subNext" name="next" type="date" value="2026-12-01" required></div>
        <div class="field" style="align-self:end"><button class="btn" type="submit">Add subscription</button></div>
      </div>
      <p class="form-msg" id="subMsg" role="status"></p>
    </form>
  </section>
  <div class="callout"><strong>The one-minute audit:</strong> open each service and check its last use. If nobody used it in the last month, cancel it now. A cancelled subscription can always come back.</div>`;

  return {
    html,
    mount(root) {
      navActive('subscriptions');
      root.querySelectorAll('[data-sub]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sub = store.subscriptions.find((s) => s.id === btn.dataset.sub);
          if (sub) { sub.active = !sub.active; save(); }
        });
      });
      const form = root.querySelector('#subForm');
      const msg = root.querySelector('#subMsg');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseMoney(form.elements.amount.value);
        if (amount === null) {
          msg.textContent = 'Enter a positive dollar amount.';
          msg.className = 'form-msg error';
          return;
        }
        store.subscriptions.push({
          id: newId('s'),
          name: form.elements.name.value.trim(),
          amount,
          cycle: 'Monthly',
          next: form.elements.next.value || '2026-12-01',
          active: true,
        });
        save();
      });
    },
  };
}

export function viewGuide() {
  const html = `
  <div class="page-head">
    <h1>How the Marlowe budget works</h1>
    <p>A household budget is not a punishment. It is a plan that says where the money goes before the month spends it for you.</p>
  </div>
  <section class="panel">
    <h2>The method, in five steps</h2>
    <ol class="steps">
      <li><strong>Count the money in.</strong> Add up take-home pay after tax, every month. For this household that is $6,400: two salaries. Irregular money, like selling the old bike, counts as a bonus, never as planned income.</li>
      <li><strong>Give every dollar a job.</strong> Plan the whole $6,400 before the month starts: rent, bills, food, transport, savings, fun. When planned spending equals income, nothing is left to drift.</li>
      <li><strong>Pay savings first.</strong> $1,200 moves to the emergency fund on payday, before any spending. A goal that waits for leftovers never gets funded.</li>
      <li><strong>Track every spend.</strong> Write each purchase down the same day, in the transactions list. A budget you do not track is a wish, not a plan.</li>
      <li><strong>Meet once a week.</strong> Ten minutes on Sunday: check what is left in each category, move money between categories if life happened, and agree on the week ahead.</li>
    </ol>
  </section>
  <div class="grid2">
    <section class="panel">
      <h2>The 50/30/20 split</h2>
      <p>A quick check that a budget is balanced: about 50% of take-home pay on needs, 30% on wants, 20% on savings and paying down debt.</p>
      <table>
        <thead><tr><th>Slice</th><th class="num">Target</th><th class="num">This household</th></tr></thead>
        <tbody>
          <tr><td>Needs: rent, bills, food, transport</td><td class="num">50%</td><td class="num">69%</td></tr>
          <tr><td>Wants: dining out, fun, treats</td><td class="num">30%</td><td class="num">12%</td></tr>
          <tr><td>Savings and goals</td><td class="num">20%</td><td class="num">19%</td></tr>
        </tbody>
      </table>
      <p class="hint">Rent is high where this family lives, so needs run over 50%. That is fine: the split is a compass, not a law. The household keeps wants small on purpose while the emergency fund grows.</p>
    </section>
    <section class="panel">
      <h2>The envelope trick</h2>
      <p>Give each spending category its own envelope, real or in your head. Groceries get $720 for the month. When the envelope is empty, the category is done until next month.</p>
      <p>It works because the limit is visible before you spend, not after. Digital envelopes work the same way: the budget bars on the dashboard are this household&rsquo;s envelopes.</p>
      <p>One rule makes it stick: never borrow from the savings envelope. Borrow from fun first, then dining out, then everything else.</p>
    </section>
  </div>
  <section class="panel">
    <h2>Five ways this household saves on groceries</h2>
    <ul class="list-plain">
      <li><strong>Shop with a list, once a week.</strong> Four planned shops beat seven unplanned ones. The list is written from the meal plan, not from hunger.</li>
      <li><strong>One no-spend day a week.</strong> Cook from the pantry on Wednesdays. It saves about $15 a week, $60 a month, without anyone feeling deprived.</li>
      <li><strong>Buy the store brand for basics.</strong> Flour, rice, tinned tomatoes and oats taste the same and cost a third less.</li>
      <li><strong>Freeze before it spoils.</strong> Bread, meat and leftovers go in the freezer the day they arrive, not the day they smell off.</li>
      <li><strong>Check the price per kilo.</strong> The big pack is not always the cheap one. The shelf label tells the truth.</li>
    </ul>
  </section>
  <section class="panel">
    <h2>Bills without surprises</h2>
    <p>Every bill lands in the bills list the day it arrives, with its due date. The household keeps a small buffer in the account so a bill that arrives early never bounces.</p>
    <p>Once a year, in January, the family calls each provider and asks for a better price: internet, phone, insurance. One call each, and last year it saved $340.</p>
    <p><a class="btn" href="#/bills">Open the bills list</a></p>
  </section>`;

  return {
    html,
    mount() { navActive('guide'); },
  };
}
