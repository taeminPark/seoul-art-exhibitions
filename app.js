"use strict";

/* ---------- icons ---------- */

const ICON_BACK = `<svg width="11" height="19" viewBox="0 0 11 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 1.5L1.5 9.5L9.5 17.5"/></svg>`;
const ICON_SEARCH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const ICON_CLEAR = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.35"/><path d="M8.5 8.5l7 7m0-7l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const ICON_EXTERNAL = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const TAB_LIST_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.3"/><rect x="14" y="3" width="7" height="5" rx="1.3"/><rect x="14" y="12" width="7" height="9" rx="1.3"/><rect x="3" y="16" width="7" height="5" rx="1.3"/></svg>`;
const TAB_CAL_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></svg>`;
const HEART_PATH = "M12 20.5s-7.2-4.5-9.8-9C.7 8.2 1.8 4 5.8 4c2.1 0 3.6 1.2 4.6 2.5.5.6.6.9 1.6.9s1.1-.3 1.6-.9C14.6 5.2 16.1 4 18.2 4c4 0 5.1 4.2 3.6 7.5-2.6 4.5-9.8 9-9.8 9z";
const TAB_SAVED_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${HEART_PATH}"/></svg>`;
const TAB_FAV_ICON = `<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 4l9 5.5"/><line x1="4" y1="20" x2="20" y2="20"/><line x1="6.5" y1="11.5" x2="6.5" y2="17"/><line x1="12" y1="11.5" x2="12" y2="17"/><line x1="17.5" y1="11.5" x2="17.5" y2="17"/></svg>`;
// 하트 하나로 빈/찬 상태를 모두 그린다. 찬 상태는 CSS(.heart-btn.on)에서 fill로 채운다.
const ICON_HEART = `<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${HEART_PATH}"/></svg>`;
const ICON_SETTINGS = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const ICON_SHARE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><polyline points="7.5 7.5 12 3 16.5 7.5"/><path d="M8 10.5H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-2"/></svg>`;
const ICON_PIN = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>`;
const ICON_CAL_ADD = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/><line x1="12" y1="13" x2="12" y2="18"/><line x1="9.5" y1="15.5" x2="14.5" y2="15.5"/></svg>`;
const ICON_CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const ICON_SEARCH_LG = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const ICON_VIEW_GRID = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="9" rx="1"/><rect x="13.5" y="3.5" width="7" height="9" rx="1"/><rect x="3.5" y="15.5" width="7" height="5" rx="1"/><rect x="13.5" y="15.5" width="7" height="5" rx="1"/></svg>`;
const ICON_VIEW_LARGE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="1"/><line x1="5" y1="20.5" x2="19" y2="20.5" stroke-linecap="round"/></svg>`;
const ICON_CHECK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- state ---------- */

let S = {
  tab: "list", // 'list' | 'calendar' | 'saved' | 'favorites'
  screen: "list", // 'list' | 'calendar' | 'saved' | 'favorites' | 'detail' | 'venue-picker'
  listFilter: "ongoing", // 'ongoing' | 'upcoming' | 'all' — 처음엔 지금 볼 수 있는 전시부터
  favFilter: "ongoing", // '내 미술관' 탭 전용 (전시 탭 필터와 별개)
  searchQuery: "",
  searchOpen: false,
  regionOpen: false, // 지역 패널 펼침 (시안: 필터 줄 오른쪽 '지역' 버튼 → 아래로 펼침)
  areaFilter: "", // AREAS의 key, ""면 모든 지역
  freeOnly: false,
  viewMode: "large", // 'large' | 'grid' (모아보기)
  detailId: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelected: null,
  exhibitions: [],
  favoriteVenues: [], // 등록한 관심 미술관의 venueName 목록
  savedIds: [], // 하트로 담아둔 관심 전시의 id 목록
  receivedIds: [], // 받은 목록 링크(?list=)로 들어온 전시 id
  updatedAt: null, // data/meta.json — 데이터를 마지막으로 갱신한 시각
  loaded: false,
  loadError: false,
};

const LS_CACHE_KEY = "sa_exhibitions_cache_v1";
const LS_FAVORITES_KEY = "sa_favorite_venues_v1";
const LS_SAVED_KEY = "sa_saved_exhibitions_v1";
const LS_RATIO_KEY = "sa_poster_ratio_v1";
const LS_VIEW_KEY = "sa_view_mode_v1";

/* ---------- data loading ---------- */

async function loadExhibitions() {
  const cached = loadJSON(LS_CACHE_KEY, null);
  if (cached) {
    S.exhibitions = prepareExhibitions(cached);
    S.loaded = true;
    render();
  }

  try {
    const res = await fetch("./data/exhibitions.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    S.exhibitions = prepareExhibitions(data);
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

// 출처마다 다르게 적힌 미술관 이름을 하나로 맞추고(venues.js), 상세 화면에 쓸
// 장소 문구를 만든다. art-map 장소엔 "/서울"이 붙어 오고, 다른 출처는
// "예술의전당 한가람미술관 제7전시실"처럼 전시실까지 적혀 온다.
function prepareExhibitions(list) {
  return list.map((e) => {
    const venueName = canonicalVenue(e.venueName, e.venue);
    const rawVenue = (e.venue || "").replace(/\/서울$/, "").trim();
    const rest = rawVenue.startsWith(e.venueName) ? rawVenue.slice(e.venueName.length).trim() : "";
    const place = e.venueName === "국립현대미술관" ? venueName : rest ? `${venueName} ${rest}` : venueName;
    return { ...e, venueName, place };
  });
}

async function loadMeta() {
  try {
    const res = await fetch("./data/meta.json", { cache: "no-store" });
    if (!res.ok) return;
    S.updatedAt = (await res.json()).updatedAt || null;
    const meta = app.querySelector(".list-foot");
    if (meta) meta.textContent = updatedText();
  } catch {
    /* 날짜를 못 불러와도 목록은 그대로 보여준다 */
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
function monthLabelKR(iso) {
  const d = parseISO(iso);
  return d.getFullYear() === new Date().getFullYear() ? `${d.getMonth() + 1}월` : `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function exhibitionStatus(e, today = todayISO()) {
  const startsIn = daysBetween(today, e.startDate);
  const endsIn = daysBetween(today, e.endDate);
  if (startsIn > 0) {
    const d = parseISO(e.startDate);
    return { kind: "upcoming", label: `${d.getMonth() + 1}월 ${d.getDate()}일 개막 · ${startsIn}일 남음`, days: startsIn };
  }
  if (endsIn <= 7) return { kind: "ending", label: endsIn <= 0 ? "오늘 마감" : `마감까지 ${endsIn}일`, days: endsIn };
  return { kind: "ongoing", label: `마감까지 ${endsIn}일`, days: endsIn };
}

// 전시 기간 전체 중 오늘이 어디쯤인지 보여주는 진행 막대 (예정 전시는 0%)
function renderRunBar(e, status = exhibitionStatus(e)) {
  const total = Math.max(1, daysBetween(e.startDate, e.endDate));
  const elapsed = daysBetween(e.startDate, todayISO());
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return h`
    <div class="run run-${status.kind}">
      <div class="run-track"><span class="run-fill" style="width:${pct.toFixed(1)}%"></span></div>
      <div class="run-note">${esc(status.label)}</div>
    </div>
  `;
}

/* ---------- grouping ---------- */

// 상태 필터('전시중'에는 마감임박도 포함)
function matchesStatus(e, filter, today) {
  if (filter === "all") return true;
  const kind = exhibitionStatus(e, today).kind;
  return filter === "upcoming" ? kind === "upcoming" : kind !== "upcoming";
}

// 지금 볼 수 있는 전시를 마감이 가까운 순서로 먼저, 그 뒤에 개막 예정 전시를 개막이 가까운 순서로.
function sortForFeed(list, today = todayISO()) {
  const open = list.filter((e) => e.startDate <= today).sort((a, b) => a.endDate.localeCompare(b.endDate));
  const soon = list.filter((e) => e.startDate > today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  return [...open, ...soon];
}

function listForFeed() {
  const today = todayISO();
  const q = S.searchQuery.trim().toLowerCase();
  return sortForFeed(
    S.exhibitions
      .filter((e) => e.endDate >= today)
      .filter((e) => matchesStatus(e, S.listFilter, today))
      .filter((e) => !S.areaFilter || VENUE_AREA.get(e.venueName) === S.areaFilter)
      .filter((e) => !S.freeOnly || isFree(e))
      .filter((e) => !q || `${e.title} ${e.venueName} ${e.place}`.toLowerCase().includes(q)),
    today
  );
}

function listSubText(count) {
  return `${count}개 전시`;
}
// 필터 줄 오른쪽 끝에 붙는 데이터 갱신 날짜
function updatedText() {
  if (!S.updatedAt) return "";
  const d = new Date(S.updatedAt);
  return `${d.getMonth() + 1}/${d.getDate()} 업데이트`;
}

// 지금·앞으로 볼 전시가 있는 미술관만 고르게 하되, 이미 등록한 곳은 전시가 끝났어도 남겨서 해제할 수 있게 한다.
function allVenueNames() {
  const today = todayISO();
  const live = S.exhibitions.filter((e) => e.endDate >= today).map((e) => e.venueName);
  const set = new Set([...live, ...S.favoriteVenues].filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b, "ko"));
}

function favoritesForFeed() {
  const today = todayISO();
  return sortForFeed(
    S.exhibitions
      .filter((e) => e.endDate >= today)
      .filter((e) => S.favoriteVenues.includes(e.venueName))
      .filter((e) => matchesStatus(e, S.favFilter, today)),
    today
  );
}

function toggleFavoriteVenue(name) {
  const idx = S.favoriteVenues.indexOf(name);
  if (idx === -1) S.favoriteVenues.push(name);
  else S.favoriteVenues.splice(idx, 1);
  saveJSON(LS_FAVORITES_KEY, S.favoriteVenues);
}

function isSaved(id) {
  return S.savedIds.includes(id);
}
function toggleSaved(id) {
  const idx = S.savedIds.indexOf(id);
  if (idx === -1) S.savedIds.push(id);
  else S.savedIds.splice(idx, 1);
  saveJSON(LS_SAVED_KEY, S.savedIds);
}

// sortForFeed 순서 그대로 묶는다: "곧 마감"(7일 이내) → "10월 마감" … → "11월 개막" …
function feedGroupLabel(e, today) {
  const status = exhibitionStatus(e, today);
  if (status.kind === "upcoming") return `${monthLabelKR(e.startDate)} 개막`;
  if (status.kind === "ending") return "곧 마감";
  return `${monthLabelKR(e.endDate)} 마감`;
}

function groupForFeed(list) {
  const today = todayISO();
  const groups = [];
  let currentLabel = null;
  for (const e of list) {
    const label = feedGroupLabel(e, today);
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
// 포스터가 없거나 불러오지 못하면 숨기지 않고 빈 액자 이미지를 건다 (전시 정보 자체는 그대로 보여준다).
const POSTER_FALLBACK = "./poster-fallback.svg";
function posterSrc(e) {
  return esc(e.poster || POSTER_FALLBACK);
}
const POSTER_ONERROR = `this.onerror=null;this.src='${POSTER_FALLBACK}'`;

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str ?? "";
  return d.innerHTML;
}

/* ---------- rendering ---------- */

const app = document.getElementById("app");
let lastScreen = S.screen;
let navDirection = "forward"; // "forward" | "back" | "cross" — 다음 render() 1회에만 적용

function render(opts = {}) {
  const screenChanged = S.screen !== lastScreen;
  const direction = navDirection;
  navDirection = "forward";

  if (!screenChanged || opts.skipTransition || typeof document.startViewTransition !== "function") {
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
  } else if (S.loadError) {
    app.innerHTML = h`
      ${renderTopbar()}
      <div class="content"><div class="empty-msg">전시 정보를 불러오지 못했습니다.<br/>네트워크 연결을 확인해주세요.</div></div>
    `;
  } else if (S.screen === "detail") {
    renderDetail();
  } else if (S.screen === "venue-picker") {
    renderVenuePickerScreen();
  } else if (S.screen === "received") {
    renderReceivedScreen();
  } else if (S.screen === "calendar") {
    renderCalendarScreen();
  } else if (S.screen === "saved") {
    renderSavedScreen();
  } else if (S.screen === "favorites") {
    renderFavoritesScreen();
  } else {
    renderListScreen();
  }
  syncSheetScrollLock();
}

/* 바텀시트가 떠 있는 동안 뒤 배경이 함께 스크롤되면 iOS에서는 그 드래그가
   "탭"이 아니라 "스크롤"로 처리되어 스크림을 눌러도 닫히지 않는다.
   시트가 열려 있을 때는 body를 고정해 배경 스크롤 자체를 막는다.

   시트를 연 채로 상세 화면에 들어갔다 돌아오면 한 번 풀렸다가 다시 잠기는데,
   이때 스크롤 위치를 다시 읽어버리면(이미 상세 화면 쪽 스크롤 상태라
   보통 0) 시트를 열었던 원래 위치를 잃어버려 화면이 엉뚱한 곳으로 튄다.
   그래서 "시트가 열려있던 세션" 동안엔 sheetScrollY를 한 번만 기록해두고,
   상세를 오가며 다시 잠글 때는 새로 읽지 않고 그대로 재사용한다. */
let sheetScrollY = 0;
let sheetLockActive = false;
function syncSheetScrollLock() {
  const shouldLock = S.screen === "calendar" && !!S.calSelected;
  const isLocked = document.body.style.position === "fixed";

  if (shouldLock && !isLocked) {
    if (!sheetLockActive) {
      sheetScrollY = window.scrollY;
      sheetLockActive = true;
    }
    document.body.style.position = "fixed";
    document.body.style.top = `-${sheetScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  } else if (!shouldLock && isLocked) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    if (!S.calSelected) {
      // 시트를 완전히 닫을 때만 원래 위치로 복원한다. 상세 화면으로
      // 넘어가는 경우는 상세 쪽 스크롤 로직이 따로 처리하므로 여기서는
      // 건드리지 않는다 (건드리면 두 로직이 서로 충돌해 화면이 흔들린다).
      window.scrollTo(0, sheetScrollY);
      sheetLockActive = false;
    }
  }
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
  // 한 줄 헤더(시안 Q1 B): 작은 제목 + 개수 + 오른쪽 아이콘. opts.rows(검색창·필터)는
  // 헤더와 함께 위에 붙어 있어서 스크롤해도 바로 바꿀 수 있다.
  const title = opts.title || "Museum Week";
  const sub = opts.sub || "";
  return h`
    <div class="topbar topbar-compact">
      <div class="topbar-main">
        <h1>${esc(title)}</h1>
        <span class="sub">${esc(sub)}</span>
        <div class="topbar-actions">${opts.action || ""}</div>
      </div>
      ${opts.rows || ""}
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
      <button class="tab-btn ${S.tab === "saved" ? "active" : ""}" data-action="tab-saved">
        <span class="tab-icon">${TAB_SAVED_ICON}</span>관심 전시
      </button>
      <button class="tab-btn ${S.tab === "favorites" ? "active" : ""}" data-action="tab-favorites">
        <span class="tab-icon">${TAB_FAV_ICON}</span>내 미술관
      </button>
    </div>
  `;
}

/* ---------- list screen ---------- */

const LIST_FILTERS = [
  { key: "ongoing", label: "전시중" },
  { key: "upcoming", label: "전시예정" },
  { key: "all", label: "전체" },
];

function renderSearchBox() {
  return h`
    <div class="search-box">
      <span class="search-icon">${ICON_SEARCH}</span>
      <input
        class="search-input"
        type="search"
        inputmode="search"
        enterkeyhint="search"
        placeholder="전시명, 장소 검색"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value="${esc(S.searchQuery)}"
        data-action="search-input"
      />
      <button class="search-clear" data-action="clear-search" aria-label="검색어 지우기" ${S.searchQuery ? "" : "hidden"}>${ICON_CLEAR}</button>
    </div>
  `;
}

function renderSegmented() {
  return h`
    <div class="segmented">
      ${LIST_FILTERS.map(
        (f) => `<button class="segment ${S.listFilter === f.key ? "active" : ""}" data-action="filter" data-filter="${f.key}">${esc(f.label)}</button>`
      ).join("")}
      ${renderRegionButton()}
    </div>
    ${S.regionOpen ? renderRegionPanel() : ""}
  `;
}

// 필터 줄 오른쪽 끝의 지역 버튼. 고른 게 있으면 그 이름을 보여준다 ("종로·광화문 · 무료 ▾").
function renderRegionButton() {
  const area = AREAS.find((a) => a.key === S.areaFilter);
  const label = [area ? area.label : "지역", S.freeOnly ? "무료" : ""].filter(Boolean).join(" · ");
  const active = !!area || S.freeOnly;
  return `<button class="region-btn ${active ? "on" : ""}" data-action="toggle-region" aria-expanded="${S.regionOpen}" aria-controls="region-panel">${esc(label)}<span class="region-caret" aria-hidden="true">▾</span></button>`;
}

function renderResultsBody(list, emptyMsg) {
  const groups = groupForFeed(list);
  return list.length === 0
    ? `<div class="empty-msg">${esc(emptyMsg)}</div>`
    : groups.map((g) => renderSection(g.label, g.items)).join("");
}

// 제목 줄 + 카드들. 모아보기(시안 Q2 A)면 같은 크기 포스터 2열로 깐다.
function renderSection(label, items) {
  const body = S.viewMode === "grid"
    ? `<div class="exh-grid">${items.map((e) => renderGridCard(e)).join("")}</div>`
    : items.map((e) => renderExhCard(e)).join("");
  return `<div class="month-heading">${esc(label)}</div>${body}`;
}

function renderGridCard(e) {
  const status = exhibitionStatus(e);
  const note = status.kind === "upcoming" ? status.label.split(" · ")[0] : status.label;
  return h`
    <a class="grid-card" data-action="open-detail" data-id="${esc(e.id)}">
      <div class="grid-poster"><img src="${posterSrc(e)}" alt="${esc(e.title)} 포스터" loading="lazy" onerror="${POSTER_ONERROR}" /></div>
      <div class="grid-title">${esc(e.title)}</div>
      <div class="grid-venue">${esc(e.venueName)}</div>
      <div class="grid-note grid-note-${status.kind}">${esc(note)}</div>
    </a>
  `;
}

function renderListResultsBody(list) {
  const emptyMsg = S.searchQuery.trim()
    ? `'${S.searchQuery.trim()}'에 대한 검색 결과가 없습니다.`
    : S.freeOnly
    ? "조건에 맞는 무료 전시가 없습니다."
    : S.areaFilter
    ? "이 지역에는 조건에 맞는 전시가 없습니다."
    : S.listFilter === "upcoming"
    ? "예정된 전시가 아직 없습니다."
    : S.listFilter === "ongoing"
    ? "현재 진행 중인 전시가 없습니다."
    : "현재 서울에서 볼 수 있는 전시 정보가 없습니다.";
  return renderResultsBody(list, emptyMsg);
}

function renderFavResultsBody(list) {
  const emptyMsg =
    S.favFilter === "upcoming"
      ? "등록한 미술관에 예정된 전시가 없습니다."
      : S.favFilter === "ongoing"
      ? "등록한 미술관에 현재 진행 중인 전시가 없습니다."
      : "등록한 미술관에 볼 수 있는 전시가 없습니다.";
  return renderResultsBody(list, emptyMsg);
}

function renderViewToggle() {
  const grid = S.viewMode === "grid";
  return `<button class="iconbtn" data-action="toggle-view" aria-label="${grid ? "크게 보기" : "모아보기"}" aria-pressed="${grid}">${grid ? ICON_VIEW_LARGE : ICON_VIEW_GRID}</button>`;
}

function renderListScreen() {
  const list = listForFeed();
  const searching = S.searchOpen || !!S.searchQuery;

  app.innerHTML = h`
    ${renderTopbar({
      title: "Museum Week",
      sub: listSubText(list.length),
      action: `<button class="iconbtn ${searching ? "pressed-on" : ""}" data-action="toggle-search" aria-label="검색" aria-expanded="${searching}">${ICON_SEARCH_LG}</button>${renderViewToggle()}`,
      rows: `${searching ? renderSearchBox() : ""}${renderSegmented()}`,
    })}
    <div class="content">
      <div id="list-results">${renderListResultsBody(list)}</div>
      <div class="list-foot">${esc(updatedText())}</div>
    </div>
    ${renderTabbar()}
  `;
}

/* 지역 패널: 지역 칩은 하나만 고르고(고르면 패널이 접힌다), 무료는 따로 켜고 끄는 스위치.
   지금 상태 필터에 걸리는 전시가 있는 지역만 보여준다. */
function renderRegionPanel() {
  const today = todayISO();
  const base = S.exhibitions.filter((e) => e.endDate >= today && matchesStatus(e, S.listFilter, today));
  const areas = AREAS.filter((a) => S.areaFilter === a.key || base.some((e) => VENUE_AREA.get(e.venueName) === a.key));
  const chip = (action, key, label, on) =>
    `<button class="chip ${on ? "on" : ""}" data-action="${action}" data-key="${key}" aria-pressed="${on}">${esc(label)}</button>`;
  return h`
    <div class="region-panel" id="region-panel">
      <div class="chips" role="group" aria-label="지역">
        ${chip("area", "", "모든 지역", !S.areaFilter)}
        ${areas.map((a) => chip("area", a.key, a.label, S.areaFilter === a.key)).join("")}
      </div>
      <button class="free-row" data-action="free" role="switch" aria-checked="${S.freeOnly}">
        <span>무료 전시만</span><span class="switch ${S.freeOnly ? "on" : ""}" aria-hidden="true"></span>
      </button>
    </div>
  `;
}

// 관람료 정보가 "무료"인 전시만 (관람료 정보가 없는 전시는 무료 필터에서 빠진다)
function isFree(e) {
  return !!e.admission && /무료/.test(e.admission) && !/\d[\d,]*\s*원/.test(e.admission);
}

// 검색창에 한 글자씩 입력할 때마다 화면 전체(app.innerHTML)를 다시 그리면,
// 검색창 <input> 자체가 매번 새 DOM 요소로 교체된다. 포커스는 다시 걸어주면
// 되니 티가 안 나지만, 한글은 음절 하나가 완성될 때마다(compositionend)
// 조합 세션이 그 DOM 요소에 묶여 있어서 — 요소가 통째로 바뀌면 조합 세션이
// 새 요소로 매끄럽게 이어지지 못해 다음 음절의 자모가 씹히는 문제가 있었다.
// 그래서 검색어가 바뀔 때는 화면 전체를 다시 그리지 않고, 검색창 <input>은
// 그대로 둔 채 결과 목록/지우기 버튼/상단 개수만 갱신한다.
function updateListResults() {
  const resultsEl = app.querySelector("#list-results");
  if (S.screen !== "list" || !resultsEl) {
    renderScreen();
    return;
  }
  const list = listForFeed();
  resultsEl.innerHTML = renderListResultsBody(list);
  const sub = app.querySelector(".topbar .sub");
  if (sub) sub.textContent = listSubText(list.length);
  const clearBtn = app.querySelector(".search-clear");
  if (clearBtn) clearBtn.hidden = !S.searchQuery;
}

/* 포스터 틀을 포스터 비율에 맞춘다. 비율은 이미지를 한 번 불러와야 알 수 있어서,
   알아낸 비율을 기기에 기억해 두고 다음 렌더부터는 처음부터 그 높이로 그린다
   (뒤로가기 때 스크롤 위치 복원이 이미지 로딩에 흔들리지 않도록 — scrollToAfterLayout 참고).
   아직 모르는 포스터는 4:5 틀로 시작했다가 불러온 뒤 맞춘다. */
const posterRatios = loadJSON(LS_RATIO_KEY, {});
const POSTER_SIDE_PAD = 0.84; // .exh-poster-wrap 좌우 여백 8%씩을 뺀 폭
function posterWrapStyle(id) {
  const r = posterRatios[id];
  return r ? `style="aspect-ratio:${(Math.max(r, 0.6) / POSTER_SIDE_PAD).toFixed(3)}"` : "";
}
function rememberPosterRatio(img) {
  const card = img.closest("[data-id]");
  if (!card || !img.naturalWidth || img.src.endsWith(POSTER_FALLBACK.slice(1))) return;
  const id = card.dataset.id;
  const r = Math.round((img.naturalWidth / img.naturalHeight) * 1000) / 1000;
  if (posterRatios[id] === r) return;
  posterRatios[id] = r;
  saveJSON(LS_RATIO_KEY, posterRatios);
  const wrap = img.closest(".exh-poster-wrap");
  if (wrap) wrap.style.aspectRatio = (Math.max(r, 0.6) / POSTER_SIDE_PAD).toFixed(3);
}
// load 이벤트는 버블링되지 않아서 캡처 단계에서 받는다.
document.addEventListener("load", (ev) => {
  if (ev.target.matches?.(".exh-poster-wrap img")) rememberPosterRatio(ev.target);
}, true);

function renderExhCard(e) {
  return h`
    <a class="exh-card" data-action="open-detail" data-id="${esc(e.id)}">
      <div class="exh-poster-wrap" ${posterWrapStyle(e.id)}>
        <img src="${posterSrc(e)}" alt="${esc(e.title)} 포스터" loading="lazy" onerror="${POSTER_ONERROR}" />
      </div>
      <div class="exh-info">
        <div class="exh-title-row">
          <div class="exh-title">${esc(e.title)}</div>
          ${renderHeartBtn(e)}
        </div>
        <div class="exh-meta">${esc(e.venueName)}</div>
        <div class="exh-dates">${esc(formatRangeKR(e.startDate, e.endDate))}</div>
        ${renderRunBar(e)}
      </div>
    </a>
  `;
}

function renderHeartBtn(e) {
  const on = isSaved(e.id);
  return h`<button class="heart-btn ${on ? "on" : ""}" data-action="toggle-saved" data-id="${esc(e.id)}" aria-pressed="${on}" aria-label="관심 전시에 담기">${ICON_HEART}</button>`;
}

/* ---------- saved (관심 전시) screen ---------- */

// 관심 전시는 "놓치지 않게" 보는 목록이라 개막월이 아니라 지금 볼 수 있는지로
// 나누고, 전시 중인 것은 마감이 가까운 순서로 둔다. 이미 끝난 전시는 보여주지 않는다.
function renderSavedScreen() {
  const today = todayISO();
  const saved = S.exhibitions.filter((e) => isSaved(e.id) && e.endDate >= today);
  const ongoing = saved.filter((e) => e.startDate <= today).sort((a, b) => a.endDate.localeCompare(b.endDate));
  const upcoming = saved.filter((e) => e.startDate > today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const section = (label, items) => (items.length ? renderSection(label, items) : "");

  app.innerHTML = h`
    ${renderTopbar({
      title: "관심 전시",
      sub: saved.length ? `${saved.length}개 전시` : "",
      action: saved.length
        ? `<button class="text-action" data-action="send-saved">${ICON_SHARE}목록 보내기</button>${renderViewToggle()}`
        : "",
    })}
    <div class="content">
      ${
        saved.length === 0
          ? h`<div class="saved-empty">
              <span class="saved-empty-heart">${ICON_HEART}</span>
              <p>전시 목록에서 하트를 눌러<br/>보고 싶은 전시를 담아 두세요.</p>
              <button class="saved-empty-btn" data-action="tab-list">전시 둘러보기</button>
            </div>`
          : section("지금 볼 수 있는 전시", ongoing) + section("개막 예정", upcoming)
      }
      ${renderFeedbackFooter()}
    </div>
    ${renderTabbar()}
  `;
}

/* ---------- 의견 보내기 (시안 Q7 A) ---------- */
// 베타 기간 의견을 받는 구글폼 주소. 비어 있으면 문구 자체를 숨긴다.
const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfly2YqHnW40PTyPgFghrfScgnXcDplxDsLBJqwvZssPkNgTg/viewform";

function renderFeedbackFooter() {
  if (!FEEDBACK_URL) return "";
  return h`
    <div class="feedback">
      <div class="feedback-lead">Museum Week는 아직 다듬는 중이에요</div>
      <div class="feedback-sub">불편한 점이나 있었으면 하는 기능을 알려주세요</div>
      <a class="feedback-link" href="${esc(FEEDBACK_URL)}" target="_blank" rel="noopener">의견 보내기</a>
    </div>
  `;
}

/* ---------- 받은 전시 목록 (시안 Q6 A) ---------- */
/* 관심 전시 탭의 '목록 보내기'는 ?list=id1,id2 링크를 만든다. 받은 사람이 열면
   이 화면이 상세 화면처럼 목록 위에 쌓여 열리고, 닫으면 평소 첫 화면으로 돌아간다. */
function receivedItems() {
  const today = todayISO();
  return S.receivedIds.map((id) => S.exhibitions.find((e) => e.id === id)).filter((e) => e && e.endDate >= today);
}

function renderReceivedScreen() {
  const items = receivedItems();
  const allSaved = items.length > 0 && items.every((e) => isSaved(e.id));
  app.innerHTML = h`
    ${renderTopbar({ onBack: true })}
    <div class="content">
      <div class="received-head">
        <div class="received-eyebrow">받은 전시 목록</div>
        <h2 class="received-title">${items.length ? `같이 보고 싶은 전시 ${items.length}개` : "받은 전시가 모두 끝났어요"}</h2>
      </div>
      ${
        items.length
          ? h`
        <button class="external-btn" data-action="save-all-received" ${allSaved ? "disabled" : ""}>${allSaved ? "모두 관심 전시에 담겨 있어요" : "내 관심 전시에 모두 담기"}</button>
        <div class="received-note">하나씩 하트로 골라 담아도 돼요</div>
        <div class="received-list">${items.map((e) => renderRowItem(e)).join("")}</div>`
          : `<div class="empty-msg">보낸 목록의 전시가 이미 끝났거나 정보가 바뀌었어요.<br/>지금 열리는 전시를 둘러보세요.</div>`
      }
    </div>
  `;
}

// 작은 포스터 + 제목·장소·마감 한 줄 목록 (캘린더 날짜 시트, 받은 목록에서 쓴다)
function renderRowItem(e) {
  const status = exhibitionStatus(e);
  return h`
    <div class="day-exh-row" data-action="open-detail" data-id="${esc(e.id)}">
      <div class="day-exh-thumb-wrap">
        <img class="day-exh-thumb" src="${posterSrc(e)}" alt="" loading="lazy" onerror="${POSTER_ONERROR}" />
      </div>
      <div class="day-exh-text">
        <div class="day-exh-title">${esc(e.title)}</div>
        <div class="day-exh-venue">${esc(e.venueName)}</div>
        <div class="day-exh-note day-exh-note-${status.kind}">${esc(status.label)}</div>
      </div>
      ${renderHeartBtn(e)}
    </div>
  `;
}

function receivedListUrl(ids) {
  return `${appBaseUrl()}?list=${ids.map(encodeURIComponent).join(",")}`;
}

async function sendSavedList() {
  const today = todayISO();
  const items = sortForFeed(S.exhibitions.filter((e) => isSaved(e.id) && e.endDate >= today));
  if (!items.length) return;
  const url = receivedListUrl(items.map((e) => e.id));
  const text = `같이 보고 싶은 전시 ${items.length}개\n${items.slice(0, 3).map((e) => `· ${e.title}`).join("\n")}${items.length > 3 ? `\n외 ${items.length - 3}개` : ""}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "같이 보고 싶은 전시", text, url });
    } catch {
      /* 공유창을 닫은 경우 */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showToast("목록 링크를 복사했어요");
  } catch {
    showToast("링크를 복사하지 못했어요");
  }
}

/* ---------- favorites screen ---------- */

function renderFavSegmented() {
  return h`
    <div class="segmented">
      ${LIST_FILTERS.map(
        (f) => `<button class="segment ${S.favFilter === f.key ? "active" : ""}" data-action="fav-filter" data-filter="${f.key}">${esc(f.label)}</button>`
      ).join("")}
    </div>
  `;
}

function renderVenueChecklist() {
  const venues = allVenueNames();
  if (venues.length === 0) {
    return `<div class="empty-msg">전시 데이터를 불러오는 중입니다…</div>`;
  }
  return h`
    <div class="venue-list">
      ${venues
        .map((name) => {
          const checked = S.favoriteVenues.includes(name);
          return h`
            <button class="venue-row ${checked ? "checked" : ""}" data-action="toggle-venue" data-venue="${esc(name)}">
              <span class="venue-name">${esc(name)}${VENUE_DISTRICT[name] ? `<span class="venue-district">${esc(VENUE_DISTRICT[name])}</span>` : ""}</span>
              <span class="venue-check">${checked ? ICON_CHECK : ""}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderFavoritesScreen() {
  if (S.favoriteVenues.length === 0) {
    app.innerHTML = h`
      ${renderTopbar({ title: "내 미술관" })}
      <div class="content">
        <div class="fav-intro">자주 가는 미술관을 등록하면 그 미술관 전시만 모아볼 수 있어요.</div>
        ${renderVenueChecklist()}
        ${renderFeedbackFooter()}
      </div>
      ${renderTabbar()}
    `;
    return;
  }

  const list = favoritesForFeed();
  app.innerHTML = h`
    ${renderTopbar({
      title: "내 미술관",
      sub: `${list.length}개 전시`,
      action: `<button class="iconbtn" data-action="open-venue-picker" aria-label="미술관 선택">${ICON_SETTINGS}</button>${renderViewToggle()}`,
      rows: renderFavSegmented(),
    })}
    <div class="content">
      <div id="fav-results">${renderFavResultsBody(list)}</div>
      ${renderFeedbackFooter()}
    </div>
    ${renderTabbar()}
  `;
}

function renderVenuePickerScreen() {
  app.innerHTML = h`
    ${renderTopbar({ onBack: true })}
    <div class="content">
      <div class="section-heading" style="margin-top:14px;">미술관 선택</div>
      ${renderVenueChecklist()}
    </div>
  `;
}

/* ---------- detail screen ---------- */

function renderDetail() {
  const e = S.exhibitions.find((x) => x.id === S.detailId);
  if (!e) {
    app.innerHTML = h`${renderTopbar({ onBack: true })}<div class="content"><div class="empty-msg">전시 정보를 찾을 수 없습니다.</div></div>`;
    return;
  }

  const review = e.reviewSummary;
  const reviewBody = !review || !review.posts || !review.posts.length
    ? `<div class="review-card"><div class="review-empty">아직 이 전시를 다룬 블로그 글이 없습니다.</div></div>`
    : h`
        <div class="review-posts">
          ${review.posts
            .map(
              (p) => h`
                <a class="review-post" href="${esc(p.link)}" target="_blank" rel="noopener">
                  <div class="review-post-title">${esc(p.title)}</div>
                  <div class="review-post-desc">${esc(p.description)}</div>
                  ${p.postdate ? `<div class="review-post-date">${esc(p.postdate.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3"))} 작성</div>` : ""}
                </a>
              `
            )
            .join("")}
        </div>
      `;

  // art-map은 상세정보를 원문 링크로만 연결하지만, 문화포털 API로 들어온 항목은
  // 관람료/운영시간/설명까지 표준 필드로 갖고 있어서 앱 안에서 바로 보여줄 수 있다.
  const extraRows = [
    e.hours ? `<dt>운영</dt><dd>${esc(e.hours)}</dd>` : "",
    e.admission ? `<dt>관람료</dt><dd>${esc(e.admission)}</dd>` : "",
    e.ticketInfo ? `<dt>예매</dt><dd>${esc(e.ticketInfo)}</dd>` : "",
  ].join("");

  const descriptionBlock = e.description
    ? h`<div class="section-heading">전시 소개</div><p class="detail-desc">${esc(e.description)}</p>`
    : "";

  const HOMEPAGE_SOURCES = new Set([
    "culture-api",
    "sac",
    "sejong",
    "lotte",
    "leeum",
    "apma",
    "seoulmuseum",
    "daelim",
    "whanki",
    "sungkok",
    "ilmin",
  ]);
  const externalLabel = HOMEPAGE_SOURCES.has(e.source) ? "홈페이지에서 자세히 보기" : "art-map에서 예매·상세정보 보기";
  const externalBtn = e.sourceUrl
    ? h`<a class="external-btn" href="${esc(e.sourceUrl)}" target="_blank" rel="noopener">${esc(externalLabel)} ${ICON_EXTERNAL}</a>`
    : "";

  // 지도 앱 검색 링크 (API 키가 필요 없는 공개 URL)
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(e.venueName)}`;

  app.innerHTML = h`
    ${renderTopbar({ onBack: true })}
    <div class="detail-hero">
      <button class="detail-hero-btn" data-action="open-viewer" aria-label="포스터 크게 보기">
        <img src="${posterSrc(e)}" alt="${esc(e.title)} 포스터" onerror="${POSTER_ONERROR}" />
      </button>
    </div>
    <div class="detail-body">
      <div class="detail-title-row">
        <h2 class="detail-title">${esc(e.title)}</h2>
        <div class="detail-actions">
          <button class="share-btn" data-action="share" data-id="${esc(e.id)}" aria-label="전시 공유">${ICON_SHARE}</button>
          ${renderHeartBtn(e)}
        </div>
      </div>
      ${renderRunBar(e)}
      <dl class="detail-rows">
        <dt>장소</dt><dd><a class="map-link" href="${esc(mapUrl)}" target="_blank" rel="noopener">${esc(e.place)}${ICON_PIN}</a></dd>
        <dt>기간</dt><dd>${esc(formatRangeKR(e.startDate, e.endDate))}</dd>
        ${extraRows}
      </dl>

      ${externalBtn}
      <button class="calendar-btn" data-action="add-calendar" data-id="${esc(e.id)}">${ICON_CAL_ADD}마감일을 내 캘린더에 추가</button>

      ${descriptionBlock}

      <div class="section-heading">블로그 글</div>
      ${reviewBody}
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

    const aria = [`${m + 1}월 ${day}일`, opensToday ? "개막하는 전시 있음" : "", closesToday ? "마감하는 전시 있음" : ""].filter(Boolean).join(", ");
    cells += `<button class="${cls}" data-action="cal-pick-day" data-key="${key}" aria-label="${aria}" aria-pressed="${key === S.calSelected}">${day}${dotsHtml}</button>`;
  }

  let sheet = "";
  if (S.calSelected) {
    const items = S.exhibitions
      .filter((e) => e.startDate <= S.calSelected && S.calSelected <= e.endDate)
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
    const label = `${parseISO(S.calSelected).getMonth() + 1}월 ${parseISO(S.calSelected).getDate()}일`;
    const animClass = suppressSheetAnim ? "no-anim" : "";
    suppressSheetAnim = false; // 이번 렌더 한 번에만 적용하고 리셋

    sheet = h`
      <div class="day-sheet-scrim ${animClass}" data-action="close-day-sheet"></div>
      <div class="day-sheet ${animClass}">
        <div class="day-sheet-header">
          <div class="day-sheet-handle"></div>
          <h3>${esc(label)} 관람 가능한 전시 ${items.length ? `(${items.length})` : ""}</h3>
        </div>
        <div class="day-sheet-list">
        ${
          items.length === 0
            ? `<div class="empty-msg" style="padding:20px 4px;">이 날짜에 열리는 전시가 없습니다</div>`
            : items.map((e) => renderRowItem(e)).join("")
        }
        </div>
      </div>
    `;
  }

  app.innerHTML = h`
    ${renderTopbar({ title: "캘린더" })}
    <div class="content">
      <div class="cal-nav">
        <button class="iconbtn" data-action="cal-prev" aria-label="이전 달">‹</button>
        <span class="cal-month-label">${y}년 ${m + 1}월</span>
        <button class="iconbtn" data-action="cal-next" aria-label="다음 달">›</button>
      </div>
      <div class="cal-weekdays">${WEEKDAY_LABELS.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend"><span class="cal-dot new"></span>개막일 &nbsp; <span class="cal-dot end"></span>마감일</div>
    </div>
    ${renderTabbar()}
    ${sheet}
  `;

  if (S.calSelected) attachSheetDragHandlers();
}

/* 시트 상단(핸들+제목)을 아래로 끌면 손가락을 따라 1:1로 내려가다가, 일정 거리 이상
   끌었을 때만 닫힌다 (apple-design의 direct-manipulation/interruptibility 원칙). */
function attachSheetDragHandlers() {
  const handle = app.querySelector(".day-sheet-header");
  const sheet = app.querySelector(".day-sheet");
  const list = app.querySelector(".day-sheet-list");
  if (!handle || !sheet) return;

  /* iOS는 스크롤할 게 없는 곳(짧은 목록, 스크롤 끝)에서 끄는 손가락을 페이지
     전체로 넘겨 화면 위쪽까지 고무줄처럼 끌려 내려간다. 시트 안에서는 목록이
     실제로 스크롤될 수 있을 때만 기본 동작을 허용하고 나머지는 막는다. */
  sheet.addEventListener(
    "touchmove",
    (e) => {
      const inList = list && list.contains(e.target);
      if (!inList || list.scrollHeight <= list.clientHeight) e.preventDefault();
    },
    { passive: false }
  );

  let dragStartY = null;
  let dragDy = 0;

  handle.addEventListener("pointerdown", (e) => {
    handle.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    dragDy = 0;
    sheet.style.transition = "none";
  });
  handle.addEventListener("pointermove", (e) => {
    if (dragStartY === null) return;
    dragDy = Math.max(0, e.clientY - dragStartY);
    sheet.style.transform = `translateY(${dragDy}px)`;
  });
  const endDrag = () => {
    if (dragStartY === null) return;
    dragStartY = null;
    if (dragDy > 90) {
      S.calSelected = null;
      renderScreen();
      return;
    }
    sheet.style.transition = "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)";
    sheet.style.transform = "";
  };
  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
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

/* ---------- 내 캘린더에 추가 (.ics) ---------- */
/* 푸시 알림은 서버가 있어야 해서, 대신 마감일 일정을 휴대폰 캘린더에 넣는다.
   마감일 하루 종일 일정 + 일주일 전 오전 9시 알림. 아이폰 Safari는 .ics를 받으면
   "캘린더에 추가" 화면을 띄운다. */
function icsText(s) {
  return String(s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}
function icsDate(iso) {
  return iso.replace(/-/g, "");
}
function buildIcs(e) {
  const dayAfter = new Date(parseISO(e.endDate).getTime() + 86400000);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Museum Week//KO",
    "BEGIN:VEVENT",
    `UID:${icsText(e.id)}-end@museum-week`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(e.endDate)}`,
    `DTEND;VALUE=DATE:${icsDate(dateKey(dayAfter))}`,
    `SUMMARY:${icsText(`마감 · ${e.title}`)}`,
    `LOCATION:${icsText(e.place)}`,
    `URL:${shareUrl(e.id)}`,
    `DESCRIPTION:${icsText(`${formatRangeKR(e.startDate, e.endDate)}\n${shareUrl(e.id)}`)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P6DT15H",
    `DESCRIPTION:${icsText(`「${e.title}」 일주일 뒤 마감`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
function addToCalendar(id) {
  const e = S.exhibitions.find((x) => x.id === id);
  if (!e) return;
  const blob = new Blob([buildIcs(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `museum-week-${String(id).replace(/[^A-Za-z0-9_-]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/* ---------- 포스터 크게 보기 ---------- */
/* 상세 화면 포스터를 누르면 그 자리에서 커져 검은 화면을 채운다 (apple-design의
   spatial consistency — 닫을 때도 원래 포스터 자리로 줄어 돌아간다).
   - 두 손가락 확대/축소, 확대한 상태에서 한 손가락으로 이동 (가장자리에선 고무줄 저항)
   - 두 번 탭: 그 지점을 2.5배로 / 다시 두 번 탭: 원래대로
   - 원래 크기에서 아래로 쓸어내리면 닫힘 (짧게 휙 튕겨도 닫힘)
   - 뒤로가기(스와이프 백 포함)로도 닫히도록 history에 한 칸 쌓는다.
   애니메이션은 늘 "지금 화면에 보이는 위치"에서 시작해서 도중에 다시 잡아도 튀지 않는다. */
const VIEWER_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const VIEWER_MAX_SCALE = 4;
let viewer = null;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function openViewer(srcImg) {
  if (viewer || !srcImg) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const nw = srcImg.naturalWidth || srcImg.width;
  const nh = srcImg.naturalHeight || srcImg.height;
  const fit = Math.min(vw / nw, vh / nh);
  const box = { w: nw * fit, h: nh * fit };
  box.left = (vw - box.w) / 2;
  box.top = (vh - box.h) / 2;

  const root = document.createElement("div");
  root.className = "viewer";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "포스터 크게 보기");
  root.innerHTML = `
    <div class="viewer-bg"></div>
    <img class="viewer-img" src="${esc(srcImg.currentSrc || srcImg.src)}" alt="${esc(srcImg.alt)}" draggable="false" />
    <button class="viewer-close" aria-label="닫기">${ICON_CLOSE}</button>`;
  document.body.appendChild(root);

  const img = root.querySelector(".viewer-img");
  Object.assign(img.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.w}px`, height: `${box.h}px` });

  viewer = { root, img, bg: root.querySelector(".viewer-bg"), srcImg, box, s: 1, tx: 0, ty: 0, closing: false };
  history.pushState({ ...(history.state || {}), viewer: true }, "");

  // 원래 포스터 자리에서 출발한다
  const from = sourceTransform();
  srcImg.style.visibility = "hidden";
  if (prefersReducedMotion() || !from) {
    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
  } else {
    img.animate([{ transform: toCss(from) }, { transform: toCss({ s: 1, tx: 0, ty: 0 }) }], { duration: 340, easing: VIEWER_EASE });
    viewer.bg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, easing: VIEWER_EASE });
  }
  applyTransform();
  bindViewerGestures();
  root.querySelector(".viewer-close").addEventListener("click", () => history.back());
}

function toCss({ s, tx, ty }) {
  return `translate(${tx}px, ${ty}px) scale(${s})`;
}
function applyTransform() {
  viewer.img.style.transform = toCss(viewer);
}

// 확대 화면의 박스를 상세 화면 포스터 위치로 옮기는 변환 (포스터가 화면 밖이면 null)
function sourceTransform() {
  const r = viewer.srcImg.getBoundingClientRect();
  if (!r.width || r.bottom < 0 || r.top > window.innerHeight) return null;
  const s = r.width / viewer.box.w;
  return { s, tx: r.left - viewer.box.left, ty: r.top - viewer.box.top };
}

// 지금 화면에 그려진 변환값 (애니메이션 도중이면 그 순간의 값)
function liveTransform() {
  const m = new DOMMatrixReadOnly(getComputedStyle(viewer.img).transform);
  return { s: m.a, tx: m.e, ty: m.f };
}

function settleTo(target, ms = 300) {
  const from = liveTransform();
  Object.assign(viewer, target);
  applyTransform();
  viewer.img.animate([{ transform: toCss(from) }, { transform: toCss(target) }], { duration: ms, easing: VIEWER_EASE });
}

// 확대 배율에서 이동할 수 있는 범위. 화면보다 작은 축은 가운데 고정.
function panBounds(s) {
  const { box } = viewer;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const axis = (size, start, view) => {
    const scaled = size * s;
    if (scaled <= view) {
      const c = (size - scaled) / 2;
      return [c, c];
    }
    return [view - start - scaled, -start];
  };
  return { x: axis(box.w, box.left, vw), y: axis(box.h, box.top, vh) };
}
function rubber(v, [min, max]) {
  const band = (d) => (d * 0.55 * 400) / (400 + 0.55 * Math.abs(d));
  if (v < min) return min - band(min - v);
  if (v > max) return max + band(v - max);
  return v;
}
const clamp = (v, [min, max]) => Math.min(max, Math.max(min, v));

function bindViewerGestures() {
  const { root } = viewer;
  const pts = new Map();
  let start = null; // 제스처 시작 시점의 변환값과 손가락 위치
  let lastTap = 0;
  let moved = false;
  let mode = null; // 이번 제스처가 무엇이었나: "pinch" | "pan" | "swipe"
  let trail = []; // 쓸어내리기 속도 계산용 최근 위치 [{y, t}]

  const centroid = () => {
    const p = [...pts.values()];
    return { x: p.reduce((a, q) => a + q.x, 0) / p.length, y: p.reduce((a, q) => a + q.y, 0) / p.length };
  };
  const spread = () => {
    const [a, b] = [...pts.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const begin = () => {
    const live = liveTransform();
    viewer.img.getAnimations().forEach((a) => a.cancel());
    Object.assign(viewer, live);
    applyTransform();
    start = { ...live, c: centroid(), d: pts.size === 2 ? spread() : 0 };
  };

  root.addEventListener("pointerdown", (ev) => {
    if (viewer.closing || ev.target.closest(".viewer-close")) return;
    try {
      root.setPointerCapture(ev.pointerId);
    } catch {
      /* 이미 끝난 포인터 */
    }
    pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pts.size > 2) return; // 세 번째 손가락은 무시
    if (pts.size === 1) {
      moved = false;
      mode = null;
      trail = [{ y: ev.clientY, t: ev.timeStamp }];
    } else {
      mode = "pinch";
      viewer.bg.style.opacity = "";
    }
    begin();
  });

  root.addEventListener("pointermove", (ev) => {
    if (!pts.has(ev.pointerId) || !start) return;
    pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const c = centroid();
    const dx = c.x - start.c.x;
    const dy = c.y - start.c.y;
    if (Math.hypot(dx, dy) > 6) moved = true;

    if (pts.size === 2 && start.d) {
      mode = "pinch";
      if (Math.abs(spread() - start.d) > 6) moved = true;
      // 두 손가락 사이 거리 비율만큼 확대하고, 손가락 사이 지점이 이미지의 같은 곳에 머물게 한다
      const s = Math.min(VIEWER_MAX_SCALE * 1.3, Math.max(0.6, start.s * (spread() / start.d)));
      const ox = start.c.x - viewer.box.left;
      const oy = start.c.y - viewer.box.top;
      viewer.s = s;
      viewer.tx = ox - ((ox - start.tx) / start.s) * s + dx;
      viewer.ty = oy - ((oy - start.ty) / start.s) * s + dy;
      applyTransform();
      return;
    }
    if (mode === "pinch" || start.s > 1.01) {
      mode = "pinch" === mode ? mode : "pan";
      const b = panBounds(viewer.s);
      viewer.tx = rubber(start.tx + dx, b.x);
      viewer.ty = rubber(start.ty + dy, b.y);
      applyTransform();
      return;
    }
    // 원래 크기: 아래로 쓸어내려 닫기. 손가락을 그대로 따라가고 배경이 옅어진다.
    mode = "swipe";
    trail.push({ y: c.y, t: ev.timeStamp });
    if (trail.length > 5) trail.shift();
    const pull = Math.max(0, dy);
    viewer.s = 1 - Math.min(pull / 1800, 0.25);
    viewer.tx = dx * 0.6 + (viewer.box.w * (1 - viewer.s)) / 2;
    viewer.ty = dy + (viewer.box.h * (1 - viewer.s)) / 2;
    applyTransform();
    viewer.bg.style.opacity = String(1 - Math.min(pull / 420, 0.85));
  });

  const end = (ev) => {
    if (!pts.has(ev.pointerId)) return;
    pts.delete(ev.pointerId);
    if (pts.size === 1) {
      begin(); // 두 손가락 중 하나를 떼면 남은 손가락으로 이어서 이동
      return;
    }
    if (pts.size > 0 || !start) return;
    start = null;

    // 두 번 탭
    if (!moved) {
      const now = ev.timeStamp;
      if (now - lastTap < 300) {
        lastTap = 0;
        if (viewer.s > 1.01) settleTo({ s: 1, tx: 0, ty: 0 });
        else {
          const s = 2.5;
          const ox = ev.clientX - viewer.box.left;
          const oy = ev.clientY - viewer.box.top;
          const b = panBounds(s);
          settleTo({ s, tx: clamp(ox - ox * s, b.x), ty: clamp(oy - oy * s, b.y) });
        }
      } else lastTap = now;
      return;
    }

    if (mode !== "swipe") {
      // 확대/이동을 마치면 허용 범위 안으로 되돌린다
      const s = clamp(viewer.s, [1, VIEWER_MAX_SCALE]);
      if (s <= 1.01) return settleTo({ s: 1, tx: 0, ty: 0 });
      const b = panBounds(s);
      const ox = window.innerWidth / 2 - viewer.box.left;
      const oy = window.innerHeight / 2 - viewer.box.top;
      // 최대 배율을 넘겼으면 화면 가운데를 기준으로 줄인다
      const tx = viewer.tx + (ox - viewer.tx) * (1 - s / viewer.s);
      const ty = viewer.ty + (oy - viewer.ty) * (1 - s / viewer.s);
      return settleTo({ s, tx: clamp(tx, b.x), ty: clamp(ty, b.y) });
    }

    // 쓸어내리기: 충분히 내렸거나 아래로 빠르게 튕겼으면 닫는다
    const first = trail[0];
    const last = trail[trail.length - 1];
    // 손가락을 멈췄다가 뗐으면(마지막 움직임이 80ms보다 오래 전) 튕긴 것으로 보지 않는다
    const fresh = last && ev.timeStamp - last.t < 80;
    const v = fresh && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0; // px/ms
    const pull = viewer.ty - (viewer.box.h * (1 - viewer.s)) / 2;
    if (pull > 110 || v > 0.6) {
      history.back();
    } else {
      viewer.bg.animate([{ opacity: viewer.bg.style.opacity || 1 }, { opacity: 1 }], { duration: 260, easing: VIEWER_EASE });
      viewer.bg.style.opacity = "";
      settleTo({ s: 1, tx: 0, ty: 0 }, 260);
    }
  };
  root.addEventListener("pointerup", end);
  root.addEventListener("pointercancel", end);
}

// popstate에서 부른다 (닫기 버튼·쓸어내리기·뒤로가기 모두 history.back()을 거친다)
function closeViewer() {
  if (!viewer || viewer.closing) return;
  const v = viewer;
  v.closing = true;
  const from = liveTransform();
  const to = sourceTransform();
  const done = () => {
    v.srcImg.style.visibility = "";
    v.root.remove();
    if (viewer === v) viewer = null;
  };
  const bgFrom = getComputedStyle(v.bg).opacity;
  if (prefersReducedMotion() || !to) {
    v.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out" }).finished.then(done, done);
    return;
  }
  v.bg.animate([{ opacity: bgFrom }, { opacity: 0 }], { duration: 300, easing: VIEWER_EASE, fill: "forwards" });
  v.root.querySelector(".viewer-close").style.opacity = "0";
  v.img.animate([{ transform: toCss(from) }, { transform: toCss(to) }], { duration: 300, easing: VIEWER_EASE, fill: "forwards" }).finished.then(done, done);
}

/* ---------- navigation ---------- */
/* 사파리의 스와이프-백/뒤로가기 버튼이 앱 내 뒤로가기와 똑같이 동작하도록
   History API를 유일한 출처로 둔다: 화면 이동은 pushState/replaceState만 하고,
   실제 화면 전환은 popstate 핸들러 한 곳에서만 수행한다. */

let savedScrollY = 0; // 상세로 들어가기 전 목록/캘린더 스크롤 위치 (뒤로가기 때 복원)
let suppressSheetAnim = false; // true면 다음 캘린더 렌더에서 바텀시트 등장 애니메이션을 생략

// innerHTML을 막 교체한 직후엔 레이아웃이 아직 다 안 잡혀서(특히 이미지가
// 로드되기 전) 그 순간 스크롤 최대값이 실제보다 작다 — 그 상태에서 scrollTo를
// 부르면 브라우저가 값을 눌러 담아버려서 엉뚱한 위치로 복원된다.
// 레이아웃이 한 번 안정된 뒤(rAF 두 번) 복원한다.
function scrollToAfterLayout(y) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
}

function openDetail(id) {
  savedScrollY = window.scrollY;
  history.pushState({ screen: "detail", id }, "");
  navDirection = "forward";
  S.screen = "detail";
  S.detailId = id;
  render();
  window.scrollTo(0, 0); // 상세 화면은 항상 맨 위에서 시작
}
function openVenuePicker() {
  savedScrollY = window.scrollY;
  history.pushState({ screen: "venue-picker" }, "");
  navDirection = "forward";
  S.screen = "venue-picker";
  render();
  window.scrollTo(0, 0);
}
/* ---------- share ---------- */

// 공유 링크는 전시마다 미리 만들어 둔 e/<id>.html이다 (scripts/build-share-pages.mjs).
// 카카오톡 미리보기에 그 전시 포스터가 뜨고, 열면 곧바로 ?e=<id>로 넘어와 상세가 열린다 (boot 참고).
function appBaseUrl() {
  return `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;
}
function shareUrl(id) {
  return `${appBaseUrl()}e/${String(id).replace(/[^A-Za-z0-9_-]/g, "_")}.html`;
}

// 아이폰은 시스템 공유창(카카오톡·메시지·링크 복사 등)을 띄우고,
// 공유창이 없는 브라우저(PC 등)에서는 링크를 클립보드에 복사한다.
async function shareExhibition(id) {
  const e = S.exhibitions.find((x) => x.id === id);
  if (!e) return;
  const url = shareUrl(id);
  const text = `${e.title}\n${e.venueName}, ${formatRangeKR(e.startDate, e.endDate)}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: e.title, text, url });
    } catch {
      /* 공유창을 그냥 닫은 경우(AbortError) — 아무것도 하지 않는다 */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    showToast("링크를 복사했어요");
  } catch {
    showToast("링크를 복사하지 못했어요");
  }
}

let toastTimer = null;
function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

function goBack() {
  history.back();
}
function switchTab(tab) {
  if (S.tab === tab) return;
  S.tab = tab;
  S.screen = tab;
  navDirection = "cross";
  history.replaceState({ screen: tab }, "");
  render();
}

window.addEventListener("popstate", (e) => {
  // 포스터 크게 보기에서 뒤로가기: 확대 화면만 닫고 상세 화면은 그대로 둔다
  if (viewer) {
    if (!e.state?.viewer) closeViewer();
    return;
  }
  const state = e.state || { screen: S.tab };
  const enteringDetail = state.screen === "detail";
  const enteringPicker = state.screen === "venue-picker";
  const enteringReceived = state.screen === "received";
  const wasInDetail = S.screen === "detail";
  // 상세·미술관 선택·받은 목록 화면은 모두 "쌓이는" 화면이라 같은 방향 규칙을 쓴다.
  const wasStacked = wasInDetail || S.screen === "venue-picker" || S.screen === "received";
  const enteringStacked = enteringDetail || enteringPicker || enteringReceived;
  navDirection = wasStacked && !enteringStacked ? "back" : enteringStacked && !wasStacked ? "forward" : "cross";

  if (enteringDetail) {
    S.screen = "detail";
    S.detailId = state.id;
  } else if (enteringPicker) {
    S.screen = "venue-picker";
  } else if (enteringReceived) {
    S.screen = "received";
  } else {
    S.tab = ["calendar", "saved", "favorites"].includes(state.screen) ? state.screen : "list";
    S.screen = S.tab;
    S.detailId = null;
  }
  const goingBackFromDetail = wasInDetail && !enteringDetail;
  const goingBackFromStacked = wasStacked && !enteringStacked;

  // 상세에서 뒤로 나갔을 때 캘린더 바텀시트가 이미 열려있던 상태로 복원되는
  // 경우, 화면 전체가 슬라이드해 들어오는 애니메이션과 시트 자체의 등장
  // 애니메이션이 동시에 겹쳐 화면이 흔들려 보인다. 이 경우엔 둘 다 끄고
  // 원래 있던 자리로 바로 복원한다 (움직인 적 없다는 느낌이 맞다).
  const reopeningSheet = goingBackFromDetail && S.screen === "calendar" && !!S.calSelected;
  if (reopeningSheet) suppressSheetAnim = true;
  render({ skipTransition: reopeningSheet });

  if (enteringStacked) {
    window.scrollTo(0, 0);
  } else if (goingBackFromStacked && !reopeningSheet) {
    // 시트가 다시 열리는 경우는 syncSheetScrollLock이 원래 위치를 이미
    // 복원하므로 여기서 또 스크롤을 건드리면 서로 부딪혀 화면이 흔들린다.
    scrollToAfterLayout(savedScrollY); // 상세/미술관 선택에서 뒤로 나가면 원래 보던 위치로 복원
  }
});

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
    case "tab-saved":
      switchTab("saved");
      break;
    case "tab-favorites":
      switchTab("favorites");
      break;
    case "toggle-saved": {
      // 화면을 다시 그리지 않고 같은 전시의 하트만 바꾼다 — 스크롤 위치와 포스터가
      // 그대로 유지되고, 관심 전시 탭에서 실수로 뺀 전시도 바로 사라지지 않아 다시 담을 수 있다.
      toggleSaved(el.dataset.id);
      const on = isSaved(el.dataset.id);
      for (const btn of app.querySelectorAll(`.heart-btn[data-id="${CSS.escape(el.dataset.id)}"]`)) {
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", on);
      }
      el.classList.remove("pop");
      void el.offsetWidth; // 연속으로 눌러도 애니메이션이 매번 다시 재생되도록
      if (on) el.classList.add("pop");
      break;
    }
    case "open-detail":
      openDetail(el.dataset.id);
      break;
    case "share":
      shareExhibition(el.dataset.id);
      break;
    case "open-viewer":
      openViewer(el.querySelector("img"));
      break;
    case "add-calendar":
      addToCalendar(el.dataset.id);
      break;
    case "toggle-search": {
      const open = !(S.searchOpen || S.searchQuery);
      S.searchOpen = open;
      if (!open) S.searchQuery = "";
      renderScreen();
      if (open) app.querySelector('[data-action="search-input"]')?.focus();
      break;
    }
    case "toggle-view":
      S.viewMode = S.viewMode === "grid" ? "large" : "grid";
      saveJSON(LS_VIEW_KEY, S.viewMode);
      renderScreen();
      window.scrollTo(0, 0);
      break;
    case "toggle-region":
      S.regionOpen = !S.regionOpen;
      renderScreen();
      break;
    case "area":
      S.areaFilter = el.dataset.key;
      S.regionOpen = false; // 고르면 접고 결과를 바로 보여준다
      renderScreen();
      window.scrollTo(0, 0);
      break;
    case "free": {
      // 스위치가 미끄러지는 게 보이도록 화면 전체를 다시 그리지 않고 스위치·버튼·결과만 바꾼다
      S.freeOnly = !S.freeOnly;
      el.setAttribute("aria-checked", S.freeOnly);
      el.querySelector(".switch")?.classList.toggle("on", S.freeOnly);
      const btn = app.querySelector(".region-btn");
      if (btn) btn.outerHTML = renderRegionButton();
      updateListResults();
      break;
    }
    case "send-saved":
      sendSavedList();
      break;
    case "save-all-received": {
      const items = receivedItems().filter((e) => !isSaved(e.id));
      items.forEach((e) => toggleSaved(e.id));
      renderScreen();
      if (items.length) showToast(`관심 전시에 ${items.length}개를 담았어요`);
      break;
    }
    case "open-venue-picker":
      openVenuePicker();
      break;
    case "toggle-venue":
      toggleFavoriteVenue(el.dataset.venue);
      renderScreen();
      break;
    case "filter":
      if (S.listFilter !== el.dataset.filter) {
        S.listFilter = el.dataset.filter;
        renderScreen();
      }
      break;
    case "fav-filter":
      if (S.favFilter !== el.dataset.filter) {
        S.favFilter = el.dataset.filter;
        renderScreen();
      }
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
    case "clear-search": {
      S.searchQuery = "";
      const inputEl = app.querySelector('[data-action="search-input"]');
      if (inputEl) {
        inputEl.value = "";
        inputEl.focus();
      }
      updateListResults();
      break;
    }
  }
});

// 한글 등 조합형 입력(IME)은 글자가 완성되기 전까지 input 이벤트가 여러 번
// 발생한다. 그때마다 결과를 다시 그리면 입력 중이던 조합 상태가 끊겨버려서,
// 조합이 끝날 때(compositionend)만 반영한다.
let isComposing = false;
app.addEventListener("compositionstart", (e) => {
  if (e.target.closest('[data-action="search-input"]')) isComposing = true;
});
app.addEventListener("compositionend", (e) => {
  const el = e.target.closest('[data-action="search-input"]');
  isComposing = false;
  if (!el) return;
  S.searchQuery = el.value;
  updateListResults();
});
app.addEventListener("input", (e) => {
  const el = e.target.closest('[data-action="search-input"]');
  if (!el || isComposing || e.isComposing) return;
  S.searchQuery = el.value;
  updateListResults();
});

/* ---------- boot ---------- */

// 브라우저 자체 스크롤 복원이 우리가 직접 복원하는 위치와 경쟁하면서
// 어중간한 위치로 튀는 문제가 있어 끄고 직접 관리한다.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// 예전에 저장한 이름("국립현대미술관서울관" 등)도 정리된 이름으로 옮긴다.
S.favoriteVenues = [...new Set(loadJSON(LS_FAVORITES_KEY, []).map((n) => canonicalVenue(n)))];
S.savedIds = loadJSON(LS_SAVED_KEY, []);
S.viewMode = loadJSON(LS_VIEW_KEY, "large") === "grid" ? "grid" : "large";

// 공유 링크로 들어온 경우: 주소의 ?e=는 지우고, 목록 위에 상세를 쌓아서 연다
// (그래야 뒤로가기로 앱 목록에 자연스럽게 돌아간다).
const params = new URLSearchParams(location.search);
const sharedId = params.get("e");
const sharedList = (params.get("list") || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 50);
if (sharedList.length) {
  const baseUrl = location.pathname;
  history.replaceState({ screen: S.tab }, "", baseUrl);
  history.pushState({ screen: "received" }, "", baseUrl);
  S.screen = "received";
  S.receivedIds = sharedList;
  lastScreen = "received";
} else if (sharedId) {
  const baseUrl = location.pathname;
  history.replaceState({ screen: S.tab }, "", baseUrl);
  history.pushState({ screen: "detail", id: sharedId }, "", baseUrl);
  S.screen = "detail";
  S.detailId = sharedId;
  lastScreen = "detail";
} else {
  history.replaceState({ screen: S.tab }, "");
}
render();
loadExhibitions();
loadMeta();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
