// Ordo calendar: one month at a time, one API request per year, cached in localStorage.
const API = 'https://api.ordotools.org';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const COLORS = { white: 'white', red: 'red', green: 'green', purple: 'purple', violet: 'purple', black: 'black', rose: 'rose', pink: 'rose', gold: 'white', yellow: 'white' };

const $ = (id) => document.getElementById(id);
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long' });
const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const fullFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

let current = firstOfMonth(new Date());
let days = {};          // date key -> trimmed day, for the month on screen
let loadToken = 0;
let scrolledToToday = false;
const years = new Map(); // year -> Promise<{date: day}>

function firstOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }

function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// raw_data fields are Python dict strings; best-effort conversion to JSON.
function parsePyDict(str) {
    try {
        return JSON.parse(str.replace(/'/g, '"').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null'));
    } catch {
        return null;
    }
}

function commemorations(day) {
    const names = (day.commemorations || []).map((c) => c && c.name).filter(Boolean);
    if (names.length || !day.raw_data) return names;
    for (const key of ['com_1', 'com_2', 'com_3']) {
        const raw = day.raw_data[key];
        if (typeof raw !== 'string') continue;
        const name = parsePyDict(raw)?.name ?? raw.match(/['"]name['"]:\s*['"]([^'"]+)['"]/)?.[1];
        if (name && name !== 'None') names.push(name);
    }
    return names;
}

// Returns safe HTML: every API value is escaped.
function massHtml(day, comms) {
    const raw = day.raw_data?.mass;
    if (!raw) return '';
    const mass = parsePyDict(raw);
    if (!mass) return escapeHtml(raw.slice(0, 200));
    return Object.values(mass).filter((m) => m && typeof m === 'object').map((m) => [
        m.int && `<em>${escapeHtml(m.int)}</em>,`,
        m.glo && 'Gl,',
        m.cre && 'Cr,',
        comms.length && comms.map((c, i) => `${i + 1} com ${escapeHtml(c)}`).join(', ') + ',',
        m.pre && `Preface <em>${escapeHtml(m.pre)}</em>`,
    ].filter(Boolean).join(' ')).filter(Boolean).join('; ');
}

// Keep only what the page shows, so the cache stays small and fast to parse.
function trim(day) {
    const comms = commemorations(day);
    return {
        name: day.feast_name || day.liturgical_season || '',
        rank: day.feast_rank || '',
        color: COLORS[(day.liturgical_color || '').toLowerCase().trim()] || '',
        comms,
        mass: massHtml(day, comms),
        fast: !!day.raw_data?.fasting,
        abstain: !!day.raw_data?.abstinence,
    };
}

function readCache(year) {
    try {
        const hit = JSON.parse(localStorage.getItem(`ordo:v2:${year}`));
        if (hit && Date.now() - hit.t < CACHE_TTL) return hit.days;
    } catch { /* storage blocked or corrupt: refetch */ }
    return null;
}

function writeCache(year, data) {
    try {
        localStorage.setItem(`ordo:v2:${year}`, JSON.stringify({ t: Date.now(), days: data }));
    } catch { /* quota or blocked storage: memory cache still works */ }
}

function loadYear(year) {
    if (!years.has(year)) {
        const cached = readCache(year);
        const request = cached ? Promise.resolve(cached) : fetch(`${API}/year/${year}`, { signal: AbortSignal.timeout(10000) })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(({ calendar = [] }) => {
                const data = Object.fromEntries(calendar.map((d) => [d.date, trim(d)]));
                writeCache(year, data);
                return data;
            });
        request.catch(() => years.delete(year)); // let a retry refetch
        years.set(year, request);
    }
    return years.get(year);
}

function rankClass(day, date) {
    if (/\bI cl/.test(day.rank)) return 'r1';
    if (/\bII cl/.test(day.rank) || date.getDay() === 0) return 'r2';
    if (/^(feria|v)\b/.test(day.rank)) return 'r4';
    return 'r3';
}

function render() {
    const year = current.getFullYear();
    const month = current.getMonth();
    $('monthName').textContent = monthFmt.format(current);
    $('yearName').textContent = year;
    document.title = `${monthFmt.format(current)} ${year} · Ordo`;

    const today = dateKey(new Date());
    const count = new Date(year, month + 1, 0).getDate();
    let html = '';
    for (let n = 1; n <= count; n++) {
        const date = new Date(year, month, n);
        const key = dateKey(date);
        const day = days[key];
        const start = n === 1 ? ` style="grid-column-start:${date.getDay() + 1}"` : '';
        html += `<li${start} class="day ${day ? `${rankClass(day, date)} c-${day.color}` : ''}${key === today ? ' today' : ''}" data-date="${key}" tabindex="0">`
            + `<div class="top"><span class="num">${n}</span><span class="dow">${weekdayFmt.format(date)}</span><span class="marks"></span></div>`
            + (day ? `<div class="feast">${escapeHtml(day.name)}</div>`
                + (day.rank ? `<div class="rank">${escapeHtml(day.rank)}</div>` : '')
                + (day.comms[0] ? `<div class="com">${escapeHtml(day.comms[0])}</div>` : '') : '')
            + '</li>';
    }
    $('month').innerHTML = html;

    // Phones: land on today the first time the current month is filled in.
    const todayEl = document.querySelector('.day.today');
    if (!scrolledToToday && todayEl && days[today] && matchMedia('(max-width: 700px)').matches) {
        scrolledToToday = true;
        todayEl.scrollIntoView({ block: 'center' });
    }
}

async function show(date) {
    current = firstOfMonth(date);
    const token = ++loadToken;
    const year = current.getFullYear();
    days = {};
    render();
    if (!readCache(year)) $('status').textContent = 'Loading…';
    try {
        const data = await loadYear(year);
        if (token !== loadToken) return;
        days = data;
        $('status').textContent = '';
        render();
    } catch (err) {
        if (token !== loadToken) return;
        console.error(err);
        $('status').innerHTML = 'Could not load the calendar. <button id="retryBtn">Try again</button>';
    }
}

function openDay(key) {
    const day = days[key];
    if (!day) return;
    const [y, m, d] = key.split('-').map(Number);
    $('dayDate').textContent = fullFmt.format(new Date(y, m - 1, d));
    $('dayTitle').textContent = day.name;
    $('dayTitle').className = `c-${day.color}`;
    const row = (label, value) => value ? `<dt>${label}</dt><dd>${value}</dd>` : '';
    $('dayBody').innerHTML = row('Rank', escapeHtml(day.rank))
        + row('Commemorations', day.comms.map(escapeHtml).join(', '))
        + row('Mass', day.mass);
    $('dayDialog').showModal();
}

const shift = (delta) => show(new Date(current.getFullYear(), current.getMonth() + delta, 1));

$('prevBtn').addEventListener('click', () => shift(-1));
$('nextBtn').addEventListener('click', () => shift(1));
$('todayBtn').addEventListener('click', () => { scrolledToToday = false; show(new Date()); });
$('status').addEventListener('click', (e) => { if (e.target.id === 'retryBtn') show(current); });

const picker = $('picker');
if (picker.type !== 'month') picker.type = 'date'; // browsers without a native month picker
picker.addEventListener('change', () => {
    const [y, m] = picker.value.split('-').map(Number);
    if (y && m) show(new Date(y, m - 1, 1));
});
$('title').addEventListener('click', () => {
    picker.value = dateKey(current).slice(0, picker.type === 'month' ? 7 : 10);
    try { picker.showPicker(); } catch { picker.focus(); }
});

const monthEl = $('month');
monthEl.addEventListener('click', (e) => {
    const el = e.target.closest('[data-date]');
    if (el) openDay(el.dataset.date);
});
monthEl.addEventListener('keydown', (e) => {
    const el = e.target.closest('[data-date]');
    if (el && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        openDay(el.dataset.date);
    }
});

// Clicking the backdrop (outside the dialog box) closes it.
$('dayDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || $('dayDialog').open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') shift(-1);
    else if (e.key === 'ArrowRight') shift(1);
    else if (e.key === 't' || e.key === 'T' || e.key === 'Home') { scrolledToToday = false; show(new Date()); }
    else return;
    e.preventDefault();
});

// ponytail: drop the pre-v2 cache; delete this once old visitors have cycled through.
try { Object.keys(localStorage).filter((k) => k.startsWith('liturgical_cache')).forEach((k) => localStorage.removeItem(k)); } catch { /* blocked storage */ }

show(current);
