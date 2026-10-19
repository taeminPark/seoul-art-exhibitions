#!/usr/bin/env node
// art-map.co.kr의 내부 리스트 API(/data/new_exhibition.php)를 호출해
// 서울 지역 전시(진행중 + 예정) 목록을 수집해 data/exhibitions.json으로 저장한다.
// 외부 라이브러리 없이 fetch + 정규식만 사용한다 (Node 18+).
//
// 리스트 API에는 관람료가 없어서, 전시마다 상세 페이지(view.php) HTML의 "관람료" 칸을
// 한 번씩 읽어 admission으로 붙인다 ('무료 전시만' 필터용). 상세 페이지를 못 읽으면
// 지난번 값을 그대로 둔다.
//
// 포스터도 이때 한 번씩 열어 본다. art-map 이미지 서버(media.art-map.co.kr)가 죽어 있으면
// art-map 사이트처럼 본 서버(art-map.co.kr)의 같은 경로를 쓴다. 공유 페이지 미리보기와
// 포스터 점검이 저장된 주소를 그대로 쓰기 때문이다.

import { writeFile, readFile } from "node:fs/promises";
import { mergeSource } from "./lib/merge-source.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const ITEM_RE =
  /<a href='view\.php\?idx=(\d+)'>[\s\S]*?<img [^>]*?src='([^']+)'[\s\S]*?<span id='ttl_\d+'>([\s\S]*?)<\/span><br\/><span>([^<]*)<\/span><br\/><span>([\d.]+)\s*~\s*([\d.]+)<\/span>/g;

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

const ADMISSION_RE = /<th[^>]*>\s*관람료\s*<span>\|<\/span>\s*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/;

// 상세 페이지의 관람료 칸 (예: "무료", "성인 15,000원"). 비어 있으면 null.
export function parseAdmission(html) {
  const m = html.match(ADMISSION_RE);
  if (!m) return null;
  const text = decodeEntities(m[1].replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  return text || null;
}

// 모바일 브라우저로 요청하면 관람료 칸이 없는 모바일 페이지가 오므로 데스크톱 브라우저로 요청한다.
const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

async function fetchAdmission(idx) {
  const res = await fetch(`https://art-map.co.kr/exhibition/view.php?idx=${idx}`, { headers: { "User-Agent": DESKTOP_UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseAdmission(await res.text());
}

const ARTMAP_MEDIA = "https://media.art-map.co.kr/";

// 이미지 서버 주소의 본 서버 대체 주소. art-map 이미지가 아니면 null.
export function artMapMirror(url) {
  return url.startsWith(ARTMAP_MEDIA) ? "https://art-map.co.kr/" + url.slice(ARTMAP_MEDIA.length) : null;
}

async function opensAsImage(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": DESKTOP_UA } });
    await res.arrayBuffer();
    return res.ok && /^image\//i.test(res.headers.get("content-type") || "");
  } catch {
    return false;
  }
}

// 원래 주소가 열리면 그대로, 안 열리고 대체 주소가 열리면 대체 주소, 둘 다 안 되면 원래 주소.
async function pickPoster(url) {
  const mirror = artMapMirror(url);
  if (!mirror || (await opensAsImage(url))) return url;
  return (await opensAsImage(mirror)) ? mirror : url;
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

  // 서울 전시가 0건일 리는 없으므로 사이트 구조 변경으로 파싱이 깨진 것으로 본다.
  // 여기서 그대로 저장하면 기존 데이터가 빈 배열로 덮어써지므로, 실패시켜서
  // 워크플로우의 커밋 단계까지 가지 않게 한다 (기존 데이터 보존).
  if (byId.size === 0) {
    throw new Error("art-map에서 0건이 수집됐습니다. 사이트 구조가 바뀌었을 수 있어 저장하지 않고 중단합니다.");
  }

  // 기존 파일에 있던 reviewSummary(리뷰 요약)는 별도 절차로 채운 데이터이므로 보존한다.
  let previous = [];
  try {
    previous = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 최초 실행 시 파일이 없을 수 있음
  }
  const prevReviews = new Map(previous.map((p) => [p.id, p.reviewSummary]));
  const prevAdmission = new Map(previous.filter((p) => p.admission).map((p) => [p.id, p.admission]));

  // 관람료: 상세 페이지를 하나씩 천천히 읽는다 (주 1회, 전시 수만큼).
  console.log(`관람료·포스터 확인 중 (${byId.size}건)...`);
  let admissionFails = 0;
  let mirrored = 0;
  for (const item of byId.values()) {
    const poster = await pickPoster(item.poster);
    if (poster !== item.poster) mirrored++;
    item.poster = poster;
    try {
      const admission = await fetchAdmission(item.id);
      if (admission) item.admission = admission;
    } catch {
      admissionFails++;
      if (prevAdmission.has(item.id)) item.admission = prevAdmission.get(item.id);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  if (admissionFails) console.log(`  관람료를 못 읽은 전시 ${admissionFails}건 (지난 값 유지)`);
  if (mirrored) console.log(`  이미지 서버가 안 열려 본 서버 주소로 바꾼 포스터 ${mirrored}건`);

  // art-map 항목만 새로 바꾸고, 다른 출처(문화포털·예술의전당 등) 항목은 남긴다.
  // 그 출처들은 뒤 단계 스크립트가 각자 갱신하므로, 그 스크립트가 실패해도 지난 데이터가 유지된다.
  const artMapItems = [...byId.values()].map((item) => ({ ...item, reviewSummary: prevReviews.get(item.id) ?? null }));
  const merged = mergeSource(previous, ["art-map"], artMapItems);

  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`\n총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
