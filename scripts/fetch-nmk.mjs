#!/usr/bin/env node
// 국립중앙박물관(museum.go.kr, 용산)의 특별전·테마전 현재/예정 전시를 가져와
// data/exhibitions.json에 합친다. 문화포털 API에는 국립중앙박물관 전시가 있지만
// 기간(PERIOD)이 비어 있어 못 쓰므로(README 참고), 박물관 누리집의 전시 목록
// 페이지를 직접 읽는다. 목록 페이지는 서버가 그린 HTML이라 항목마다 제목·포스터·
// "기간 2026-10-23~2027-01-24"·장소가 그대로 들어 있다. robots.txt는 /search/만 막는다.
//
// 이 목록에는 박물관이 지역 공립박물관에 보내는 순회전도 같이 올라온다
// (장소가 "진천종박물관, 영암도기박물관 ..."). 서울 전시 앱이라 장소에
// 박물관 안 전시실(상설전시관·기획전시실·기증실 등) 말이 없는 항목은 뺀다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-nmk.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mergeSource } from "./lib/merge-source.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.museum.go.kr";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
// 현재 전시 / 예정 전시 목록 (예정 쪽 menuId 철자는 누리집 그대로 upcomming)
const LISTS = [
  `${BASE}/MUSEUM/contents/M0202010000.do?menuId=current&pageSize=50`,
  `${BASE}/MUSEUM/contents/M0202020000.do?menuId=upcomming&pageSize=50`,
];
const IN_MUSEUM = /국립중앙박물관|상설전시|기획전시|특별전시|기증|전시실|전시관/;

const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").trim();

export function parseNmkList(html, pageUrl = LISTS[0]) {
  return html
    .split(/<li>\s*<div class="img-box">/)
    .slice(1)
    .map((li) => {
      const id = li.match(/exhiSpThemId=(\d+)/)?.[1];
      const href = li.match(/<a href="(\?schM=view[^"]+)"/)?.[1];
      const title = li.match(/<strong>([^<]+)<\/strong>\s*<\/a>/)?.[1];
      const img = li.match(/<img src="(\/afile\/previewThumbnail\/[^"]+)"/)?.[1];
      const dates = li.match(/<strong>기간<\/strong>\s*<p>\s*(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/);
      const place = li.match(/<strong>장소<\/strong>\s*<p>([^<]*)<\/p>/)?.[1] ?? "";
      if (!id || !href || !title || !img || !dates) return null;
      return { id, title: decode(title), poster: BASE + decode(img), startDate: dates[1], endDate: dates[2], place: decode(place), link: new URL(decode(href), pageUrl).href };
    })
    .filter((x) => x && IN_MUSEUM.test(x.place));
}

async function main() {
  console.log("국립중앙박물관 전시 정보 수집 중...");
  const raw = [];
  for (const url of LISTS) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`museum.go.kr HTTP ${res.status}`);
    raw.push(...parseNmkList(await res.text(), url));
  }

  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const parsed = raw
    .filter((x) => x.endDate >= today && !seen.has(x.id) && seen.add(x.id))
    .map((x) => ({
      id: `nmk-${x.id}`,
      title: x.title,
      venue: x.place ? `국립중앙박물관 ${x.place.replace(/^국립중앙박물관\s*/, "")}` : "국립중앙박물관",
      venueName: "국립중앙박물관",
      poster: x.poster,
      startDate: x.startDate,
      endDate: x.endDate,
      sourceUrl: x.link,
      status: x.startDate > today ? "upcoming" : "ongoing",
      source: "nmk",
      reviewSummary: null,
    }));
  console.log(`  -> 박물관 안 현재+예정 전시 ${parsed.length}건`);
  if (!parsed.length) throw new Error("국립중앙박물관 전시가 0건 — 누리집 구조가 바뀌었는지 확인");

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }
  const merged = mergeSource(existing, ["nmk"], parsed);
  console.log(`  -> nmk 항목 ${merged.filter((e) => e.source === "nmk").length}건 반영`);
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
