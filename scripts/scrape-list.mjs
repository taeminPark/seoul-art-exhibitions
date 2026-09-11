#!/usr/bin/env node
// art-map.co.kr의 내부 리스트 API(/data/new_exhibition.php)를 호출해
// 서울 지역 전시(진행중 + 예정) 목록을 수집해 data/exhibitions.json으로 저장한다.
// 외부 라이브러리 없이 fetch + 정규식만 사용한다 (Node 18+).

import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const ITEM_RE =
  /<a href='view\.php\?idx=(\d+)'>[\s\S]*?<img src='([^']+)'[\s\S]*?<span id='ttl_\d+'>([\s\S]*?)<\/span><br\/><span>([^<]*)<\/span><br\/><span>([\d.]+)\s*~\s*([\d.]+)<\/span>/g;

function decodeEntities(str) {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function toIsoDate(dotted) {
  const [y, m, d] = dotted.split(".").map((s) => s.trim());
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

async function fetchPage(type, start, wrap) {
  const body = new URLSearchParams({
    start: String(start),
    wrap: String(wrap),
    type,
    area: "1", // 1 = 서울
    cate: "0", // 0 = 전체 카테고리
    od: "0", // 0 = 최신순
    v_cnt: "0",
    online: "0",
  });

  const res = await fetch("https://art-map.co.kr/data/new_exhibition.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body,
  });

  if (!res.ok) throw new Error(`art-map API HTTP ${res.status}`);
  return res.text();
}

async function scrapeType(type, label) {
  const items = [];
  let start = 0;
  let wrap = 0;
  let safety = 0;

  while (safety++ < 200) {
    const html = await fetchPage(type, start, wrap);
    if (!html || html.trim() === "end") break;

    let matched = 0;
    for (const m of html.matchAll(ITEM_RE)) {
      matched++;
      const [, idx, poster, rawTitle, rawVenue, startDot, endDot] = m;
      const venueParts = rawVenue.split("/");
      items.push({
        id: idx,
        title: decodeEntities(rawTitle),
        venue: decodeEntities(rawVenue),
        venueName: decodeEntities(venueParts[0] || rawVenue),
        poster,
        startDate: toIsoDate(startDot),
        endDate: toIsoDate(endDot),
        sourceUrl: `https://art-map.co.kr/exhibition/view.php?idx=${idx}`,
        status: label, // "ing" | "exp"
      });
    }

    if (matched === 0) break;
    start += 4;
    wrap += 1;
  }

  return items;
}

async function main() {
  console.log("서울 진행중 전시 수집 중 (type=ing)...");
  const ongoing = await scrapeType("ing", "ongoing");
  console.log(`  -> ${ongoing.length}건`);

  console.log("서울 예정 전시 수집 중 (type=exp)...");
  const upcoming = await scrapeType("exp", "upcoming");
  console.log(`  -> ${upcoming.length}건`);

  const byId = new Map();
  for (const item of [...ongoing, ...upcoming]) byId.set(item.id, item);

  // 기존 파일에 있던 reviewSummary(리뷰 요약)는 build-reviews.mjs가 채운 데이터이므로 보존한다.
  let previous = [];
  try {
    previous = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 최초 실행 시 파일이 없을 수 있음
  }
  const prevReviews = new Map(previous.map((p) => [p.id, p.reviewSummary]));

  const merged = [...byId.values()]
    .map((item) => ({ ...item, reviewSummary: prevReviews.get(item.id) ?? null }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`\n총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
