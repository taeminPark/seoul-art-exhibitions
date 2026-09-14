#!/usr/bin/env node
// 일민미술관(ilmin.org, 광화문)의 전시 정보를 가져와 data/exhibitions.json에
// 합친다. art-map/문화포털 API 둘 다 이 사설 미술관은 다루지 않는다.
//
// 워드프레스라 WP REST API(/wp-json/wp/v2/exhibition)로 목록(제목/링크)을
// 가져오지만, 이 API 응답에는 전시 기간 필드가 없어 각 상세페이지의 본문에
// 박혀 있는 "2026.9.17.(Thu) ― 2026.11.13.(Fri)" 형식 날짜 텍스트를 정규식으로
// 뽑아 채운다. Accept-Language 헤더가 없으면 요청이 막히는 것으로 보여
// 브라우저와 유사한 헤더를 붙인다.
//
// 이 custom post type에는 일민미술관이 해외 문화원과 공동 개최해 브뤼셀·런던
// 등에서 열리는 순회전도 같이 올라온다(예: 2022년 서울 전시를 바탕으로 한
// 해외 순회 한국화전). "서울 전시" 앱 취지에 안 맞으므로, 상세페이지의
// "장소" 필드에 "일민미술관"이 포함된 항목만 남긴다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-ilmin.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://ilmin.org";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};
const DATE_RE =
  /(\d{4})\.(\d{1,2})\.(\d{1,2})\.\([A-Za-z]+\)\s*[-–—―]\s*(?:(\d{4})\.)?(\d{1,2})\.(\d{1,2})\.\([A-Za-z]+\)/;
const VENUE_RE = /<p>장소<br\s*\/?>\s*([^<]+)<\/p>/;

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}
function pad(n) {
  return String(n).padStart(2, "0");
}

async function main() {
  console.log("일민미술관 전시 정보 수집 중...");
  const listRes = await fetch(`${BASE}/wp-json/wp/v2/exhibition?per_page=10&orderby=date&order=desc`, {
    headers: HEADERS,
  });
  if (!listRes.ok) throw new Error(`ilmin.org WP REST API HTTP ${listRes.status}`);
  const posts = await listRes.json();

  const today = new Date().toISOString().slice(0, 10);
  const items = [];
  for (const post of posts) {
    const detailRes = await fetch(post.link, { headers: HEADERS });
    if (!detailRes.ok) continue;
    const html = await detailRes.text();

    const venueMatch = html.match(VENUE_RE);
    if (!venueMatch || !venueMatch[1].includes("일민미술관")) continue; // 해외 순회전 등 제외

    const dateMatch = html.match(DATE_RE);
    if (!dateMatch) continue;
    const [, sy, sm, sd, ey, em, ed] = dateMatch;
    const startDate = `${sy}-${pad(sm)}-${pad(sd)}`;
    const endDate = `${ey || sy}-${pad(em)}-${pad(ed)}`;
    if (endDate < today) continue;

    const posterMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!posterMatch) continue; // 카드 포맷(이미지+정보)을 지키기 위해 이미지 없는 항목은 제외

    items.push({
      id: `ilmin-${post.id}`,
      title: post.title.rendered,
      venue: venueMatch[1].trim(),
      venueName: "일민미술관",
      poster: posterMatch[1],
      startDate,
      endDate,
      sourceUrl: post.link,
      status: startDate > today ? "upcoming" : "ongoing",
      source: "ilmin",
      reviewSummary: null,
    });
  }
  console.log(`  -> 현재/예정 전시 ${items.length}건`);

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const withoutOld = existing.filter((e) => e.source !== "ilmin");
  const existingTitles = new Set(withoutOld.map((e) => normalizeTitle(e.title)));
  const newOnes = items.filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`  -> 기존 데이터와 중복 제외 ${items.length - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...withoutOld, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
