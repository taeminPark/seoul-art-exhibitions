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

// 이름 붙은 HTML 엔티티. DESCRIPTION 필드에 &ndash;, &lsquo;/&rsquo; 같은
// 문장부호 엔티티가 그대로 남아 화면에 "&ndash;" 텍스트로 보이는 문제가 있어
// (제목전(展) 항목 등) 실제로 나타나는 것들을 모두 채워뒀다.
const NAMED_ENTITIES = {
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  amp: "&",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  middot: "·",
  hellip: "…",
};

function decodeEntities(str) {
  // 한 번의 패스로 처리해야 "&amp;lt;" 같은 이중 인코딩을 잘못 풀어버리지 않는다
  // (lt부터 순서대로 .replace를 체이닝하면 &amp;lt; -> &lt; -> < 로 잘못 풀린다).
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}
function stripHtml(str) {
  // <style>/<script> 블록은 내용까지 통째로 버려야 한다 — 태그만 벗기면
  // CSS/JS 텍스트가 "전시소개"에 그대로 노출된다 (바람의 길목 DMZ 등 일부 항목).
  const withoutBlocks = str
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ");
  // 태그를 먼저 벗기고 엔티티는 그 다음에 디코딩한다. 순서를 바꾸면
  // 원문 텍스트에 있던 &lt;/&gt;(실제로는 문장부호로 보여줄 의도)가
  // 진짜 "<"/">"로 풀린 뒤 다음 단계에서 태그로 오인돼 잘려나간다.
  const withoutTags = withoutBlocks.replace(/<[^>]*>/g, " ");
  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
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

async function isImageReachable(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) return true;
    if (res.status === 405) {
      // 일부 서버가 HEAD를 막아둬서 GET으로 한 번 더 확인한다.
      const res2 = await fetch(url, { method: "GET" });
      return res2.ok;
    }
    return false;
  } catch {
    return false;
  }
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
    // URL은 XML 상에서 &가 &amp;로 이스케이프돼 있어서, 디코딩을 안 하면
    // 링크의 &exhId=... 파라미터가 깨져서 "시스템 오류" 페이지로 연결된다.
    const image = decodeEntities(field(raw, "IMAGE_OBJECT")).trim();
    if (!image) continue;

    const sourceUrl = decodeEntities(field(raw, "URL")).trim() || null;
    const localId = field(raw, "LOCAL_ID").trim() || sourceUrl;
    parsed.push({
      id: `culture-${localId}`,
      title: stripHtml(field(raw, "TITLE")),
      venue: eventSite ? `${inst} ${eventSite}` : inst,
      venueName: inst,
      poster: image,
      startDate: period.start,
      endDate: period.end,
      sourceUrl,
      status: period.start > today ? "upcoming" : "ongoing",
      admission: normalizeAdmission(stripHtml(field(raw, "CHARGE"))),
      hours: stripHtml(field(raw, "DURATION")) || stripHtml(field(raw, "EVENT_PERIOD")) || null,
      ticketInfo: stripHtml(field(raw, "SPATIAL_COVERAGE")) || null,
      description: stripHtml(field(raw, "DESCRIPTION")) || null,
      source: "culture-api",
      reviewSummary: null,
    });
  }
  console.log(`  -> 서울 + 현재/예정 + 이미지 필드 있음 ${parsed.length}건, 이미지 URL 확인 중...`);

  // IMAGE_OBJECT 필드가 있어도 실제로는 죽은 링크(예전 기록이 방치된 경우)인
  // 경우가 있어서, 살아있는 이미지인지 직접 확인한다.
  const withValidImage = [];
  for (const item of parsed) {
    if (await isImageReachable(item.poster)) withValidImage.push(item);
  }
  if (withValidImage.length !== parsed.length) {
    console.log(`  -> 이미지 URL이 깨진 항목 ${parsed.length - withValidImage.length}건 제외`);
  }

  // 같은 전시가 (예전 기록 + 최신 기록 등으로) exhId 자체가 중복되기도 하고,
  // 반대로 exhId는 다른데 제목이 같은 경우도 있어서 두 단계로 정리한다.
  const seenIds = new Set();
  const byId = withValidImage.filter((e) => {
    if (seenIds.has(e.id)) return false;
    seenIds.add(e.id);
    return true;
  });

  const seenInBatch = new Set();
  const deduped = byId.filter((e) => {
    const key = normalizeTitle(e.title);
    if (seenInBatch.has(key)) return false;
    seenInBatch.add(key);
    return true;
  });
  if (deduped.length !== withValidImage.length) {
    console.log(`  -> 같은 API 내 중복(exhId/제목) ${withValidImage.length - deduped.length}건 정리`);
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
