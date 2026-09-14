#!/usr/bin/env node
// 아모레퍼시픽미술관 APMA(apma.amorepacific.com, 용산)에서 현재 전시 정보를
// 가져와 data/exhibitions.json에 합친다. art-map/문화포털 API 둘 다 이 사설
// 미술관은 다루지 않는다.
//
// APMA는 롯데뮤지엄처럼 한 번에 대형 기획전 하나만 몇 달씩 운영하고 다음 전시를
// 미리 공지하지 않으므로, "현재 전시" 하나만 긁는다.
//
// /contents/exhibition/index.do 목록 페이지에는 전시 기간이 없고(썸네일+제목뿐),
// 실제로도 이 목록은 "전시" 자체가 아니라 그 전시에 관한 공지/소식(예매 오픈,
// 도록 소개 등)들이 섞인 피드다. 대신 목록 맨 위 항목(현재 전시 관련 공지)의
// 상세페이지 안에 페이지 렌더링용 `let content = {...}` 인라인 JS 객체가 있고,
// 그 안의 `place` 필드에 "2026.09.01(화) ~ 2027.02.28(일) | 미술관 1F 로비, ..."
// 형식으로 실제 전시 기간이 들어있어 그걸 파싱한다. 전시 정식 명칭도 목록의
// title(대괄호+공지 문구가 섞여 있음)보다 description1 본문에 나오는
// 《전시명》(유니코드 이스케이프 《...》) 표기가 더 깨끗해서 그쪽을 쓴다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-apma.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://apma.amorepacific.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

// 상세페이지에 박힌 값들은 페이지를 그린 JS 소스 문자열 그대로라 한글이
// "\uXXXX" 형태로 이스케이프되어 있다 (JSON.parse가 아니라 정규식으로 텍스트
// 일부만 뽑아 쓰기 때문에 자동으로 풀리지 않는다).
function decodeJsUnicode(str) {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  return res.text();
}

async function main() {
  console.log("아모레퍼시픽미술관 현재 전시 정보 수집 중...");
  const listHtml = await fetchText(`${BASE}/contents/exhibition/index.do`);

  const topItem = listHtml.match(
    /<li class="photoLst">\s*<a href="\/contents\/exhibition\/(\d+)\/view\.do">[\s\S]*?data-src="([^"]+)"/
  );
  if (!topItem) {
    console.log("  -> 전시 목록 첫 항목을 찾지 못했습니다 (사이트 구조가 바뀌었을 수 있음).");
    return;
  }
  const [, id, poster] = topItem;

  const detailHtml = await fetchText(`${BASE}/contents/exhibition/${id}/view.do`);

  const titleMatch = detailHtml.match(/\\u300[Aa](.*?)\\u300[Bb]/);
  if (!titleMatch) {
    console.log("  -> 전시 정식 명칭(《》 표기)을 찾지 못해 건너뜁니다.");
    return;
  }
  const title = decodeJsUnicode(titleMatch[1]).trim();

  const placeMatch = detailHtml.match(
    /"place":"(\d{4})\.(\d{2})\.(\d{2})\([^)]*\)\s*~\s*(\d{4})\.(\d{2})\.(\d{2})\([^)]*\)\s*\|?\s*([^"]*)"/
  );
  if (!placeMatch) {
    console.log("  -> 전시 기간(place 필드)을 찾지 못해 건너뜁니다.");
    return;
  }
  const [, sy, sm, sd, ey, em, ed, locationRaw] = placeMatch;
  const startDate = `${sy}-${sm}-${sd}`;
  const endDate = `${ey}-${em}-${ed}`;
  const location = decodeJsUnicode(locationRaw).trim();

  const today = new Date().toISOString().slice(0, 10);
  if (endDate < today) {
    console.log("  -> 이미 종료된 전시라 건너뜁니다.");
    return;
  }

  const item = {
    id: `apma-${id}`,
    title,
    venue: location ? `아모레퍼시픽미술관 ${location}` : "아모레퍼시픽미술관",
    venueName: "아모레퍼시픽미술관",
    poster,
    startDate,
    endDate,
    sourceUrl: `${BASE}/contents/exhibition/${id}/view.do`,
    status: startDate > today ? "upcoming" : "ongoing",
    source: "apma",
    reviewSummary: null,
  };
  console.log(`  -> "${title}" (${startDate} ~ ${endDate}) 수집`);

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const withoutOldApma = existing.filter((e) => e.source !== "apma");
  const existingTitles = new Set(withoutOldApma.map((e) => normalizeTitle(e.title)));
  if (existingTitles.has(normalizeTitle(item.title))) {
    console.log("  -> 기존 데이터와 제목이 겹쳐 건너뜁니다.");
    const merged = withoutOldApma.sort((a, b) => a.startDate.localeCompare(b.startDate));
    await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
    return;
  }

  const merged = [...withoutOldApma, item].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
