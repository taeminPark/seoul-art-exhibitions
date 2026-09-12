#!/usr/bin/env node
// 예술의전당(sac.or.kr) 홈페이지의 "진행/예정 프로그램" 목록 AJAX API에서
// 전시장(한가람미술관/한가람디자인미술관/서울서예박물관) 프로그램을 가져와
// data/exhibitions.json에 합친다.
//
// art-map과 문화포털 API는 예술의전당이 대관해주는 상업 특별전(예: 해외
// 블록버스터 미술전)을 자주 놓친다 — art-map은 개인/소형 갤러리 위주라 대형
// 기관이 잘 안 잡히고, 문화포털 API는 기관이 "직접 기획"한 전시 위주라 외부
// 주최측이 대관한 전시는 기관 공식 피드에 안 올라온다. 반면 예술의전당 자체
// 홈페이지는 그 안에서 열리는 프로그램이면 자체 기획이든 대관이든 다 보여주므로
// 예술의전당만큼은 이 사이트를 직접 긁는 게 더 정확하다.
//
// 인증키 불필요 (공개 AJAX 엔드포인트).
// 사용법: node scripts/fetch-sac.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.sac.or.kr";
const LIST_URL = `${BASE}/site/main/show/dataList`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// catePriArr=6 -> "전시장" 분류만, ingStateArr=1 -> "진행/예정 프로그램"만
// (지난 프로그램은 제외).
const CATE_PRI_EXHIBITION = "6";
const ING_STATE_CURRENT = "1";

function toIsoDate(dotted) {
  const [y, m, d] = dotted.split(".").map((s) => s.trim());
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// 다른 소스와 같은 전시가 중복으로 올라오는 걸 막기 위한 제목 정규화
// (fetch-culture-api.mjs와 동일한 규칙).
function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

function normalizeAdmission(price) {
  const p = (price || "").trim();
  if (!p || p === "-") return null;
  if (p === "0") return "무료";
  return p;
}

async function fetchPage(cp) {
  const url = `${LIST_URL}?cp=${cp}&PAGE_SIZE=10&catePriArr=${CATE_PRI_EXHIBITION}&ingStateArr=${ING_STATE_CURRENT}&SEARCH_FLAG=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "X-Requested-With": "XMLHttpRequest" },
  });
  if (!res.ok) throw new Error(`sac.or.kr dataList HTTP ${res.status}`);
  return res.json();
}

async function fetchAllItems() {
  const first = await fetchPage(1);
  const items = [...first.paging.result];
  const totalPage = first.paging.totalPage || 1;
  for (let p = 2; p <= totalPage; p++) {
    const page = await fetchPage(p);
    items.push(...page.paging.result);
  }
  return items;
}

// 이 사이트는 이미지 URL에 HEAD 요청을 보내면 정상 이미지에도 401을 돌려주는
// 경우가 있어서, HEAD 없이 바로 GET으로 확인한다 (문화포털 스크립트의
// 405 한정 재시도보다 넓게 잡아야 한다).
async function isImageReachable(url) {
  try {
    const res = await fetch(url, { method: "GET", headers: { "User-Agent": UA } });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log("예술의전당 전시장 프로그램 목록 수집 중...");
  const rawItems = await fetchAllItems();
  console.log(`  -> 진행/예정 전시장 프로그램 ${rawItems.length}건 수집`);

  const today = new Date().toISOString().slice(0, 10);
  const bySN = new Map();
  for (const item of rawItems) bySN.set(item.SN, item);

  const parsed = [];
  for (const item of bySN.values()) {
    if (!item.BEGIN_DATE || !item.END_DATE) continue;
    const startDate = toIsoDate(item.BEGIN_DATE);
    const endDate = toIsoDate(item.END_DATE);
    if (endDate < today) continue;

    // 카드 포맷(이미지 + 하단 정보)을 지키기 위해 포스터 없는 항목은 싣지 않는다.
    const thumb = item.thumb;
    if (!thumb || !thumb.fileServletUrl) continue;

    const placeName = (item.PLACE_NAME || "").replace(/\s+/g, " ").trim();
    parsed.push({
      id: `sac-${item.SN}`,
      title: item.PROGRAM_SUBJECT,
      venue: placeName ? `예술의전당 ${placeName}` : "예술의전당",
      venueName: "예술의전당",
      poster: `${BASE}${thumb.fileServletUrl}`,
      startDate,
      endDate,
      sourceUrl: `${BASE}/site/main/show/show_view?SN=${item.SN}`,
      status: startDate > today ? "upcoming" : "ongoing",
      admission: normalizeAdmission(item.PRICE_INFO),
      hours: item.PROGRAM_PLAYTIME || null,
      source: "sac",
      reviewSummary: null,
    });
  }
  console.log(`  -> 날짜/이미지 필드 있음 ${parsed.length}건, 이미지 URL 확인 중...`);

  const withValidImage = [];
  for (const item of parsed) {
    if (await isImageReachable(item.poster)) withValidImage.push(item);
  }
  if (withValidImage.length !== parsed.length) {
    console.log(`  -> 이미지 URL이 깨진 항목 ${parsed.length - withValidImage.length}건 제외`);
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  // 같은 전시가 art-map/문화포털 API에도 이미 있으면 그쪽을 우선하고 건너뛴다.
  const existingTitles = new Set(existing.map((e) => normalizeTitle(e.title)));
  const newOnes = withValidImage.filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`  -> 기존 데이터와 중복 제외 ${withValidImage.length - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...existing, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
