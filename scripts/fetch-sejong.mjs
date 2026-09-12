#!/usr/bin/env node
// 세종문화회관(sejongpac.or.kr) 홈페이지의 전시 목록 검색 API에서 세종미술관 등
// 전시장 프로그램(진행중 + 예정)을 가져와 data/exhibitions.json에 합친다.
//
// 예술의전당과 같은 이유: 세종문화회관 자체 홈페이지는 자체 기획전이든 대관전이든
// 그 안에서 열리는 전시를 전부 보여주므로, art-map/문화포털 API가 놓치는 대관
// 특별전까지 잡을 수 있다.
//
// 인증키 불필요 (공개 엔드포인트, Referer 헤더만 있으면 됨).
// 사용법: node scripts/fetch-sejong.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.sejongpac.or.kr";
const LIST_DATA_URL = `${BASE}/portal/performance/exhibit/performListData.do?viewType=CONTBODY`;
const LIST_PAGE_URL = `${BASE}/portal/performance/exhibit/performList.do?menuNo=200558`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const ITEM_RE =
  /<a href="\/portal\/performance\/performance\/performTicket\.do\?performIdx=(\d+)[^"]*"\s+class="performInfo"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<li class="tit">([\s\S]*?)<\/li>[\s\S]*?(\d{4}\.\d{2}\.\d{2})\([^)]*\)\s*~\s*(\d{4}\.\d{2}\.\d{2})\([^)]*\)[\s\S]*?<span>\s*([\s\S]*?)\s*<\/span>/g;

const TOTAL_RE = /검색 결과 총 <strong>(\d+)</;

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

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

async function fetchPage(pageIndex, sdate, edate) {
  const body = new URLSearchParams({
    pageIndex: String(pageIndex),
    menuNo: "200558",
    searchSort: "1",
    nowCheck: sdate,
    listType: "1",
    sdate,
    edate,
    searchCnd: "1",
  });

  const res = await fetch(LIST_DATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
      "X-Requested-With": "XMLHttpRequest",
      Referer: LIST_PAGE_URL,
    },
    body,
  });
  if (!res.ok) throw new Error(`sejongpac.or.kr performListData HTTP ${res.status}`);
  return res.text();
}

async function fetchAllItems() {
  const today = new Date();
  const sdate = today.toISOString().slice(0, 10);
  const twoYearsOut = new Date(today);
  twoYearsOut.setFullYear(twoYearsOut.getFullYear() + 2);
  const edate = twoYearsOut.toISOString().slice(0, 10);

  const items = [];
  let pageIndex = 1;
  let total = Infinity;

  while (items.length < total && pageIndex < 50) {
    const html = await fetchPage(pageIndex, sdate, edate);
    const totalMatch = html.match(TOTAL_RE);
    if (totalMatch) total = Number(totalMatch[1]);

    let matched = 0;
    for (const m of html.matchAll(ITEM_RE)) {
      matched++;
      const [, performIdx, imgSrc, rawTitle, startDot, endDot, rawVenue] = m;
      items.push({
        performIdx,
        imgSrc: decodeEntities(imgSrc),
        title: decodeEntities(rawTitle),
        startDate: toIsoDate(startDot),
        endDate: toIsoDate(endDot),
        venue: decodeEntities(rawVenue).replace(/,/g, ", "),
      });
    }
    if (matched === 0) break;
    pageIndex++;
  }

  return items;
}

async function main() {
  console.log("세종문화회관 전시 목록 수집 중...");
  const rawItems = await fetchAllItems();
  console.log(`  -> 진행/예정 전시 ${rawItems.length}건 수집`);

  const byId = new Map();
  for (const item of rawItems) {
    byId.set(item.performIdx, {
      id: `sejong-${item.performIdx}`,
      title: item.title,
      venue: `세종문화회관 ${item.venue}`,
      venueName: "세종문화회관",
      poster: `${BASE}${item.imgSrc}`,
      startDate: item.startDate,
      endDate: item.endDate,
      // menuNo가 없으면 서버가 오류 페이지로 리다이렉트한다 (사이트가 메뉴 컨텍스트로
      // 라우팅하는 구조라 이 파라미터가 필수).
      sourceUrl: `${BASE}/portal/performance/performance/performTicket.do?performIdx=${item.performIdx}&menuNo=200558`,
      status: item.startDate > new Date().toISOString().slice(0, 10) ? "upcoming" : "ongoing",
      source: "sejong",
      reviewSummary: null,
    });
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const existingTitles = new Set(existing.map((e) => normalizeTitle(e.title)));
  const newOnes = [...byId.values()].filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`  -> 기존 데이터와 중복 제외 ${byId.size - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...existing, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
