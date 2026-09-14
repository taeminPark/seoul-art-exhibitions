#!/usr/bin/env node
// 환기미술관(whankimuseum.org), 성곡미술관(sungkokmuseum.org)의 전시 정보를
// 가져와 data/exhibitions.json에 합친다. 둘 다 art-map/문화포털 API에 없는
// 사설 미술관이고, 같은 인프라 문제(HTTPS 인증서 고장)를 겪고 있어 한 파일에
// 묶었다.
//
// 두 사이트 모두 HTTPS 인증서가 고장나 있어(자체서명/기본 nginx 플레이스홀더
// 인증서) 브라우저와 curl 모두 HTTPS로는 접속이 안 되지만, 평문 HTTP(80번
// 포트)로는 정상적으로 실제 사이트가 뜬다. 그래서 http://로만 접속한다
// (인증서 검증을 끄는 우회는 하지 않는다).
//
// - 환기미술관은 워드프레스라 WP REST API(/wp-json/wp/v2/exhibitions)로 목록을
//   가져오고, 각 상세페이지의 "전시기간" 필드(HTML)를 따로 긁어 날짜를 채운다
//   (REST API 응답 자체에는 날짜 필드가 없다).
// - 성곡미술관은 REST API가 없어 현재/예정 전시 목록 페이지와 상세페이지를 모두
//   HTML로 긁는다.
//
// (간송미술관도 검토했지만 서버 인증서 체인이 불완전해 우회하려면 TLS 검증을
// 꺼야 했고, 확인 시점 기준 전시 게시판 자체도 비어 있어 제외했다.)
//
// 인증키 불필요.
// 사용법: node scripts/fetch-whanki-sungkok.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const UA_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}
function decodeEntities(str) {
  return str
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
function pad(n) {
  return String(n).padStart(2, "0");
}

/* ---------- 환기미술관 ---------- */

async function fetchWhanki(today) {
  console.log("환기미술관 전시 정보 수집 중...");
  // lang=ko: Polylang이 번역본을 별도 글로 저장해서, lang 필터가 없으면 같은
  // 전시가 한국어/영어 두 건으로 중복 수집된다.
  const res = await fetch("http://whankimuseum.org/wp-json/wp/v2/exhibitions?per_page=10&orderby=date&order=desc&lang=ko", {
    headers: { "User-Agent": UA_CHROME },
  });
  if (!res.ok) throw new Error(`whankimuseum.org WP REST API HTTP ${res.status}`);
  const posts = await res.json();

  const items = [];
  for (const post of posts) {
    const detailRes = await fetch(post.link, { headers: { "User-Agent": UA_CHROME } });
    if (!detailRes.ok) continue;
    const html = await detailRes.text();
    const periodMatch = html.match(
      /<p class="ep_data_title">전시기간<\/p>\s*<p>(\d{4})\.\s*(\d{2})\.\s*(\d{2})\s*-\s*(\d{4})\.\s*(\d{2})\.\s*(\d{2})<\/p>/
    );
    if (!periodMatch) continue;
    const [, sy, sm, sd, ey, em, ed] = periodMatch;
    const startDate = `${sy}-${sm}-${sd}`;
    const endDate = `${ey}-${em}-${ed}`;
    if (endDate < today) continue;

    const poster = post.yoast_head_json?.og_image?.[0]?.url;
    if (!poster) continue; // 카드 포맷(이미지+정보)을 지키기 위해 이미지 없는 항목은 제외

    items.push({
      id: `whanki-${post.id}`,
      title: decodeEntities(post.title.rendered),
      venue: "환기미술관",
      venueName: "환기미술관",
      poster,
      startDate,
      endDate,
      sourceUrl: post.link,
      status: startDate > today ? "upcoming" : "ongoing",
      source: "whanki",
      reviewSummary: null,
    });
  }
  console.log(`  -> 현재/예정 전시 ${items.length}건`);
  return items;
}

/* ---------- 성곡미술관 ---------- */

async function fetchSungkokList(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA_CHROME } });
  if (!res.ok) throw new Error(`sungkokmuseum.org HTTP ${res.status}`);
  const html = await res.text();
  const boxRe = /<div class="exhibition_box_s">[\s\S]*?<img src="([^"]+)"[\s\S]*?<a href="([^"]+)" class="font20">\s*([^<]+?)\s*<\/a>/g;
  const items = [];
  for (const m of html.matchAll(boxRe)) {
    const [, poster, link, title] = m;
    items.push({ poster, link, title: decodeEntities(title) });
  }
  return items;
}

async function fetchSungkok(today) {
  console.log("성곡미술관 전시 정보 수집 중...");
  const BASE = "http://www.sungkokmuseum.org/main/exhibitions";
  const raw = [
    ...(await fetchSungkokList(`${BASE}/current-exhibition/`)),
    ...(await fetchSungkokList(`${BASE}/upcoming-exhibition/`)),
  ];
  console.log(`  -> 목록 ${raw.length}건 수집, 상세페이지에서 기간 확인 중...`);

  const items = [];
  for (const entry of raw) {
    const res = await fetch(entry.link, { headers: { "User-Agent": UA_CHROME } });
    if (!res.ok) continue;
    const html = await res.text();
    const periodMatch = html.match(
      /<p><strong>(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*-\s*(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일<\/strong><\/p>/
    );
    if (!periodMatch) continue;
    const [, sy, sm, sd, ey, em, ed] = periodMatch;
    const startDate = `${sy}-${pad(sm)}-${pad(sd)}`;
    const endDate = `${ey || sy}-${pad(em)}-${pad(ed)}`;
    if (endDate < today) continue;

    const idSource = Buffer.from(entry.link).toString("base64url").slice(0, 16);
    items.push({
      id: `sungkok-${idSource}`,
      title: entry.title,
      venue: "성곡미술관",
      venueName: "성곡미술관",
      poster: entry.poster,
      startDate,
      endDate,
      sourceUrl: entry.link,
      status: startDate > today ? "upcoming" : "ongoing",
      source: "sungkok",
      reviewSummary: null,
    });
  }
  console.log(`  -> 현재/예정 전시 ${items.length}건`);
  return items;
}

/* ---------- merge ---------- */

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const all = [...(await fetchWhanki(today)), ...(await fetchSungkok(today))];

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const withoutOld = existing.filter((e) => !["whanki", "sungkok"].includes(e.source));
  const existingTitles = new Set(withoutOld.map((e) => normalizeTitle(e.title)));
  const newOnes = all.filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`\n기존 데이터와 중복 제외 ${all.length - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...withoutOld, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
