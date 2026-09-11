#!/usr/bin/env node
// 문화체육관광부 외_전시정보(통합) Open API (KCISA)에서 서울 소재 국공립 기관의
// 전시 정보를 가져와 art-map 데이터와 같은 스키마로 합친다.
//
// art-map은 개인/소형 갤러리는 잘 잡아주지만 국공립 기관 데이터는 부실하고
// (예정 전시가 거의 없음), 상세페이지 자체가 고장나 있어 원문 링크도 못 쓴다.
// 이 API는 정부가 직접 표준화해서 제공하는 데이터라 훨씬 안정적이고,
// 관람료·운영시간까지 표준 필드로 제공한다.
//
// 발급: https://www.culture.go.kr/data/openapi/openapiView.do?id=598
//       (공공데이터포털 publicDataPk=15105037 "문화체육관광부_12개 기관 전시정보"
//        에서 "활용신청"하면 됨, 보통 즉시 승인)
//
// 필요한 환경변수: CULTURE_API_KEY
// 사용법: CULTURE_API_KEY=... node scripts/fetch-culture-api.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const API_KEY = process.env.CULTURE_API_KEY;
const ENDPOINT = "https://api.kcisa.kr/openapi/API_CCA_145/request";
const PAGE_SIZE = 500;

// 이 API가 통합하는 23개 기관 중 서울 소재 기관.
// 국립중앙박물관/국립한글박물관도 서울 소재이지만, 이 API에서 PERIOD(기간)
// 값이 거의 항상 비어 있어 날짜 기반 화면(캘린더 등)에 쓸 수가 없어 제외했다 —
// API 자체의 데이터 한계라 우리 쪽에서 고칠 방법이 없다.
const SEOUL_INSTITUTIONS = new Set(["대한민국역사박물관", "예술의전당", "한국영상자료원"]);

// 국립현대미술관은 서울관/과천관/덕수궁관/청주관을 한 기관명으로 묶어서 주기 때문에
// EVENT_SITE(장소) 텍스트로 서울 소재 분관(서울관·덕수궁관)만 따로 걸러낸다.
const MULTI_BRANCH_INSTITUTION = "국립현대미술관";
const MULTI_BRANCH_SEOUL_KEYWORDS = ["서울", "덕수궁"];

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}
function stripHtml(str) {
  return decodeEntities(str).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function field(itemXml, name) {
  const m = itemXml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : "";
}

// 기관마다 날짜 형식이 달라서 (2026-04-24~2026-08-30 / 20260828~20261010) 둘 다 받는다.
function parsePeriod(period) {
  if (!period) return null;
  let m = period.match(/^(\d{4})-(\d{2})-(\d{2})\s*~\s*(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) m = period.match(/^(\d{4})(\d{2})(\d{2})\s*~\s*(\d{4})(\d{2})(\d{2})$/);
  if (!m) return null;
  const [, y1, mo1, d1, y2, mo2, d2] = m;
  return { start: `${y1}-${mo1}-${d1}`, end: `${y2}-${mo2}-${d2}` };
}

async function fetchPage(pageNo) {
  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(API_KEY)}&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`KCISA API HTTP ${res.status}`);
  const xml = await res.text();
  const totalCount = Number((xml.match(/<totalCount>(\d+)<\/totalCount>/) || [])[1] || 0);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  return { items, totalCount };
}

async function fetchAllItems() {
  const first = await fetchPage(1);
  const items = [...first.items];
  const pages = Math.ceil(first.totalCount / PAGE_SIZE);
  for (let p = 2; p <= pages; p++) {
    const { items: more } = await fetchPage(p);
    items.push(...more);
  }
  return items;
}

function isSeoulVenue(inst, eventSite) {
  if (inst === MULTI_BRANCH_INSTITUTION) {
    return MULTI_BRANCH_SEOUL_KEYWORDS.some((k) => eventSite.includes(k));
  }
  return SEOUL_INSTITUTIONS.has(inst);
}

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

// CHARGE 필드에 "0", "-", "없음" 같은 사실상 빈 값이 그대로 들어올 때가 있어 정리한다.
function normalizeAdmission(charge) {
  const c = charge.trim();
  if (!c || c === "-") return null;
  if (c === "0" || c === "0원") return "무료";
  return c;
}

async function main() {
  if (!API_KEY) {
    console.error(
      "CULTURE_API_KEY 환경변수가 없습니다. https://www.culture.go.kr/data/openapi/openapiView.do?id=598 에서 인증키를 발급받으세요."
    );
    process.exit(1);
  }

  console.log("문화포털 전시정보(통합) API에서 전체 데이터 수집 중...");
  const rawItems = await fetchAllItems();
  console.log(`  -> 전체 ${rawItems.length}건 수집 (전국, 역대 전체)`);

  const today = new Date().toISOString().slice(0, 10);
  const parsed = [];
  for (const raw of rawItems) {
    const inst = field(raw, "CNTC_INSTT_NM");
    const eventSite = stripHtml(field(raw, "EVENT_SITE"));
    if (!isSeoulVenue(inst, eventSite)) continue;

    const period = parsePeriod(field(raw, "PERIOD"));
    if (!period || period.end < today) continue;

    // 카드 포맷(이미지 + 하단 정보)을 지키기 위해 이미지 없는 항목은 신지 않는다.
    const image = field(raw, "IMAGE_OBJECT").trim();
    if (!image) continue;

    const localId = field(raw, "LOCAL_ID").trim() || field(raw, "URL").trim();
    parsed.push({
      id: `culture-${localId}`,
      title: stripHtml(field(raw, "TITLE")),
      venue: eventSite ? `${inst} ${eventSite}` : inst,
      venueName: inst,
      poster: image,
      startDate: period.start,
      endDate: period.end,
      sourceUrl: field(raw, "URL").trim() || null,
      status: period.start > today ? "upcoming" : "ongoing",
      admission: normalizeAdmission(stripHtml(field(raw, "CHARGE"))),
      hours: stripHtml(field(raw, "DURATION")) || stripHtml(field(raw, "EVENT_PERIOD")) || null,
      ticketInfo: stripHtml(field(raw, "SPATIAL_COVERAGE")) || null,
      description: stripHtml(field(raw, "DESCRIPTION")) || null,
      source: "culture-api",
      reviewSummary: null,
    });
  }
  console.log(`  -> 서울 + 현재/예정 + 이미지 있음 필터 후 ${parsed.length}건`);

  // 같은 전시가 (연계 프로그램 등으로) 이 API 안에서도 여러 번 잡힐 때가 있어
  // 제목 기준으로 한 번 더 정리한다.
  const seenInBatch = new Set();
  const deduped = parsed.filter((e) => {
    const key = normalizeTitle(e.title);
    if (seenInBatch.has(key)) return false;
    seenInBatch.add(key);
    return true;
  });
  if (deduped.length !== parsed.length) {
    console.log(`  -> 같은 API 내 중복 ${parsed.length - deduped.length}건 정리`);
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // art-map 데이터가 아직 없으면 이 소스만으로 시작
  }

  // 같은 전시가 art-map에도 있으면 art-map 쪽(포스터가 더 좋고, 이미 리뷰가
  // 채워졌을 수 있음)을 우선하고 이 API 항목은 건너뛴다.
  const existingTitles = new Set(existing.map((e) => normalizeTitle(e.title)));
  const newOnes = deduped.filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`  -> art-map과 중복 제외 ${deduped.length - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...existing, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
