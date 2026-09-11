"use strict";

/* ---------- icons ---------- */

const ICON_BACK = `<svg width="11" height="19" viewBox="0 0 11 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 1.5L1.5 9.5L9.5 17.5"/></svg>`;
const ICON_EXTERNAL = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const TAB_LIST_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.3"/><rect x="14" y="3" width="7" height="5" rx="1.3"/><rect x="14" y="12" width="7" height="9" rx="1.3"/><rect x="3" y="16" width="7" height="5" rx="1.3"/></svg>`;
const TAB_CAL_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></svg>`;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- state ---------- */

let S = {
  tab: "list", // 'list' | 'calendar'
  screen: "list", // 'list' | 'calendar' | 'detail'
  detailId: null,
  returnTab: "list",
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelected: null,
  exhibitions: [],
  loaded: false,
  loadError: false,
};

const LS_CACHE_KEY = "sa_exhibitions_cache_v1";

/* ---------- data loading ---------- */

async function loadExhibitions() {
  const cached = loadJSON(LS_CACHE_KEY, null);
  if (cached) {
    S.exhibitions = cached;
    S.loaded = true;
    render();
  }

  try {
    const res = await fetch("./data/exhibitions.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    S.exhibitions = data;
    S.loaded = true;
    S.loadError = false;
    saveJSON(LS_CACHE_KEY, data);
    render();
  } catch (err) {
    if (!cached) {
      S.loaded = true;
      S.loadError = true;
      render();
    }
  }
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* 저장 공간이 없으면 조용히 무시 (캐시일 뿐이라 치명적이지 않음) */
  }
}

/* ---------- date helpers ---------- */

function todayISO() {
  const d = new Date();
  return dateKey(d);
}
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function daysBetween(aIso, bIso) {
  const a = parseISO(aIso);
  const b = parseISO(bIso);
  return Math.round((b - a) / 86400000);
}
function formatRangeKR(startIso, endIso) {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  const fmt = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}
function monthLabelKR(startIso) {
  const d = parseISO(startIso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function exhibitionStatus(e, today = todayISO()) {
  const startsIn = daysBetween(today, e.startDate);
  const endsIn = daysBetween(today, e.endDate);
  if (startsIn > 0) return { kind: "upcoming", label: `D-${startsIn}`, days: startsIn };
  if (endsIn <= 7) return { kind: "ending", label: endsIn <= 0 ? "오늘 종료" : `마감 D-${endsIn}`, days: endsIn };
  return { kind: "ongoing", label: `${-startsIn}일째`, days: endsIn };
}

/* ---------- grouping ---------- */

function listForFeed() {
  const today = todayISO();
  return [...S.exhibitions]
    .filter((e) => e.endDate >= today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function groupByMonth(list) {
  const groups = [];
  let currentLabel = null;
  for (const e of list) {
    const label = monthLabelKR(e.startDate);
    if (label !== currentLabel) {
      groups.push({ label, items: [] });
      currentLabel = label;
    }
    groups[groups.length - 1].items.push(e);
  }
  return groups;
}

/* ---------- template helpers ---------- */

function h(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

/* ---------- rendering ---------- */

const app = document.getElementById("app");
let lastScreen = S.screen;
let navDirection = "forward"; // "forward" | "back" | "cross" — 다음 render() 1회에만 적용

function render() {
  const screenChanged = S.screen !== lastScreen;
  const direction = navDirection;
  navDirection = "forward";

  if (!screenChanged || typeof document.startViewTransition !== "function") {
    renderScreen();
    lastScreen = S.screen;
    return;
  }

  document.documentElement.dataset.navDir = direction;
  const transition = document.startViewTransition(() => {
    renderScreen();
    lastScreen = S.screen;
  });
  transition.finished.finally(() => {
    delete document.documentElement.dataset.navDir;
  });
}

function renderScreen() {
  if (!S.loaded) {
    app.innerHTML = h`
      ${renderTopbar()}
      <div class="content"><div class="loading-wrap">불러오는 중…</div></div>
    `;
    return;
  }
  if (S.loadError) {
    app.innerHTML = h`
      ${renderTopbar()}
      <div class="content"><div class="empty-msg">전시 정보를 불러오지 못했습니다.<br/>네트워크 연결을 확인해주세요.</div></div>
    `;
    return;
  }
  if (S.screen === "detail") return renderDetail();
  if (S.screen === "calendar") return renderCalendarScreen();
  return renderListScreen();
}

function renderTopbar(opts = {}) {
  if (opts.onBack) {
    return h`
      <div class="topbar">
        <button class="iconbtn" data-action="back" aria-label="뒤로">${ICON_BACK}</button>
        <div class="topbar-row" style="align-items:center;"></div>
        <div style="width:38px;"></div>
      </div>
    `;
  }
  const title = opts.title || "서울 전시";
  const sub = opts.sub || "";
  return h`
    <div class="topbar">
      <div class="topbar-row">
        <h1>${esc(title)}</h1>
        ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
      </div>
    </div>
  `;
}

function renderTabbar() {
  return h`
    <div class="tabbar">
      <button class="tab-btn ${S.tab === "list" ? "active" : ""}" data-action="tab-list">
        <span class="tab-icon">${TAB_LIST_ICON}</span>전시
      </button>
      <button class="tab-btn ${S.tab === "calendar" ? "active" : ""}" data-action="tab-calendar">
        <span class="tab-icon">${TAB_CAL_ICON}</span>캘린더
      </button>
    </div>
  `;
}

/* ---------- list screen ---------- */

function renderListScreen() {
  const list = listForFeed();
  const groups = groupByMonth(list);

  const body =
    list.length === 0
      ? `<div class="empty-msg">현재 서울에서 진행 중인 전시 정보가 없습니다.</div>`
      : groups
          .map(
            (g) => h`
        <div class="month-heading">${esc(g.label)}</div>
        ${g.items.map((e) => renderExhCard(e)).join("")}
      `
          )
          .join("");

  app.innerHTML = h`
    ${renderTopbar({ title: "서울 전시", sub: `${list.length}개 전시` })}
    <div class="content">${body}</div>
    ${renderTabbar()}
  `;
}

function renderExhCard(e) {
  const status = exhibitionStatus(e);
  const badge =
    status.kind === "upcoming"
      ? `<span class="exh-badge soon">${esc(status.label)} 오픈</span>`
      : status.kind === "ending"
      ? `<span class="exh-badge ending">${esc(status.label)}</span>`
      : "";

  return h`
    <a class="exh-card" data-action="open-detail" data-id="${esc(e.id)}">
      <div class="exh-poster-wrap">
        ${badge}
        <img src="${esc(e.poster)}" alt="${esc(e.title)} 포스터" loading="lazy" />
      </div>
      <div class="exh-info">
        <div class="exh-title">${esc(e.title)}</div>
        <div class="exh-meta">${esc(e.venueName)}</div>
        <div class="exh-dates">${esc(formatRangeKR(e.startDate, e.endDate))}</div>
      </div>
    </a>
  `;
}

/* ---------- detail screen ---------- */

function renderDetail() {
  const e = S.exhibitions.find((x) => x.id === S.detailId);
  if (!e) {
    app.innerHTML = h`${renderTopbar({ onBack: true })}<div class="content"><div class="empty-msg">전시 정보를 찾을 수 없습니다.</div></div>`;
    return;
  }
  const status = exhibitionStatus(e);
  const statusColor = status.kind === "ending" ? "var(--red)" : status.kind === "upcoming" ? "var(--orange)" : "var(--green)";

  const review = e.reviewSummary;
  const reviewBody = !review
    ? `<div class="review-empty">아직 관람 후기 요약이 준비되지 않았습니다.</div>`
    : h`
        <div class="review-summary">${esc(review.summary)}</div>
        ${
          review.sources && review.sources.length
            ? `<div class="review-sources">${review.sources
                .map(
                  (s) => `<a class="review-source" href="${esc(s.url)}" target="_blank" rel="noopener">↗ ${esc(s.title)}</a>`
                )
                .join("")}</div>`
            : ""
        }
        <div class="review-updated">${esc(new Date(review.updatedAt).toLocaleDateString("ko-KR"))} 기준 자동 요약</div>
      `;

  app.innerHTML = h`
    ${renderTopbar({ onBack: true })}
    <div class="detail-hero"><img src="${esc(e.poster)}" alt="${esc(e.title)} 포스터" /></div>
    <div class="detail-body">
      <div class="detail-status" style="color:${statusColor};">
        <span class="dotpulse" style="background:${statusColor};"></span>${esc(status.label)}
      </div>
      <h2 class="detail-title">${esc(e.title)}</h2>
      <div class="detail-row"><span class="icon">📍</span><span>${esc(e.venue)}</span></div>
      <div class="detail-row"><span class="icon">📅</span><span>${esc(formatRangeKR(e.startDate, e.endDate))}</span></div>

      <a class="external-btn" href="${esc(e.sourceUrl)}" target="_blank" rel="noopener">
        art-map에서 예매·상세정보 보기 ${ICON_EXTERNAL}
      </a>

      <div class="section-heading">관람 후기 요약</div>
      <div class="review-card">${reviewBody}</div>
    </div>
  `;
}

/* ---------- calendar screen ---------- */

function renderCalendarScreen() {
  const y = S.calYear;
  const m = S.calMonth;
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = todayISO();

  let cells = "";
  for (let i = 0; i < firstDow; i++) cells += `<div class="cal-cell empty"></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(y, m, day));
    const opensToday = S.exhibitions.some((e) => e.startDate === key);
    const closesToday = S.exhibitions.some((e) => e.endDate === key);
    let cls = "cal-cell";
    if (key === today) cls += " today";
    if (key === S.calSelected) cls += " selected";

    // 매일 열려 있는 장기 전시가 많아 "이 날 관람 가능"을 점으로 표시하면 거의 모든 칸이 똑같아진다.
    // 대신 개막일(초록)·마감일(빨강)만 표시해 캘린더를 훑어봤을 때 의미 있는 날이 눈에 띄게 한다.
    const dots = [];
    if (opensToday) dots.push(`<span class="cal-dot new"></span>`);
    if (closesToday) dots.push(`<span class="cal-dot end"></span>`);
    const dotsHtml = dots.length ? `<div class="cal-dots">${dots.join("")}</div>` : `<div class="cal-dots"></div>`;

    cells += `<div class="${cls}" data-action="cal-pick-day" data-key="${key}">${day}${dotsHtml}</div>`;
  }

  let sheet = "";
  if (S.calSelected) {
    const items = S.exhibitions
      .filter((e) => e.startDate <= S.calSelected && S.calSelected <= e.endDate)
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
    const label = `${parseISO(S.calSelected).getMonth() + 1}월 ${parseISO(S.calSelected).getDate()}일`;

    sheet = h`
      <div class="day-sheet-scrim" data-action="close-day-sheet"></div>
      <div class="day-sheet">
        <div class="day-sheet-handle"></div>
        <h3>${esc(label)} 관람 가능한 전시 ${items.length ? `(${items.length})` : ""}</h3>
        ${
          items.length === 0
            ? `<div class="empty-msg" style="padding:20px 4px;">이 날짜에 열리는 전시가 없습니다</div>`
            : items
                .map(
                  (e) => h`
            <div class="day-exh-row" data-action="open-detail" data-id="${esc(e.id)}">
              <img class="day-exh-thumb" src="${esc(e.poster)}" alt="" loading="lazy" />
              <div class="day-exh-text">
                <div class="day-exh-title">${esc(e.title)}</div>
                <div class="day-exh-venue">${esc(e.venueName)}</div>
              </div>
            </div>
          `
                )
                .join("")
        }
      </div>
    `;
  }

  app.innerHTML = h`
    ${renderTopbar({ title: "캘린더" })}
    <div class="content">
      <div class="cal-nav">
        <button class="iconbtn" data-action="cal-prev">‹</button>
        <span class="cal-month-label">${y}년 ${m + 1}월</span>
        <button class="iconbtn" data-action="cal-next">›</button>
      </div>
      <div class="cal-weekdays">${WEEKDAY_LABELS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend"><span class="cal-dot new"></span>개막일 &nbsp; <span class="cal-dot end"></span>마감일</div>
    </div>
    ${renderTabbar()}
    ${sheet}
  `;
}

function calShiftMonth(delta) {
  let m = S.calMonth + delta;
  let y = S.calYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  S.calMonth = m;
  S.calYear = y;
  S.calSelected = null;
  renderScreen();
}

/* ---------- navigation ---------- */

function openDetail(id) {
  S.detailId = id;
  S.returnTab = S.tab;
  navDirection = "forward";
  S.screen = "detail";
  render();
}
function goBack() {
  S.screen = S.tab;
  navDirection = "back";
  render();
}
function switchTab(tab) {
  if (S.tab === tab) return;
  S.tab = tab;
  S.screen = tab;
  navDirection = "cross";
  render();
}

/* ---------- event delegation ---------- */

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case "back":
      goBack();
      break;
    case "tab-list":
      switchTab("list");
      break;
    case "tab-calendar":
      switchTab("calendar");
      break;
    case "open-detail":
      openDetail(el.dataset.id);
      break;
    case "cal-prev":
      calShiftMonth(-1);
      break;
    case "cal-next":
      calShiftMonth(1);
      break;
    case "cal-pick-day":
      S.calSelected = S.calSelected === el.dataset.key ? null : el.dataset.key;
      renderScreen();
      break;
    case "close-day-sheet":
      S.calSelected = null;
      renderScreen();
      break;
  }
});

/* ---------- boot ---------- */

render();
loadExhibitions();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
