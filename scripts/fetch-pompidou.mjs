#!/usr/bin/env node
// 퐁피두센터 한화(centrepompidou-hanwha.kr, 여의도 63빌딩)의 현재/예정 전시를
// 가져와 data/exhibitions.json에 합친다. 2026년 6월 개관한 사설 미술관이라
// art-map/문화포털 API에 없다.
//
// /exhibition/list 페이지가 서버가 그린 HTML이라 항목(a.exhibition-list__item)마다
// 포스터·장소·제목·"2026.11.24 - 2027.03.28" 기간이 그대로 들어 있다. 이 한 페이지에
// 현재·예정 전시가 같이 나오고, 지난 전시는 종료일로 거른다.
// robots.txt는 /api/ 등을 막고 이 목록 페이지는 허용한다.
//
// "[통합전시 얼리버드] 샤갈+레픽 아나돌"처럼 대괄호로 시작하는 항목은 전시가 아니라
// 표 상품이라 뺀다. 63 아우돌프 가든의 정원 프로젝트는 공식 전시 목록에 있어 넣는다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-pompidou.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mergeSource } from "./lib/merge-source.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.centrepompidou-hanwha.kr";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const text = (s) =>
  (s ?? "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const ymd = (s) => s.replace(/\./g, "-");

export function parsePompidouList(html) {
  return html
    .split(/<a href="\/exhibition\/detail\?seq=/)
    .slice(1)
    .map((a) => {
      const seq = a.match(/^(\d+)/)?.[1];
      const img = a.match(/<img src="(\/upload\/[^"]+)"/)?.[1];
      const place = text(a.match(/exhibition-list__info-label">([\s\S]*?)<\/p>/)?.[1]);
      const title = text(a.match(/exhibition-list__info-title">([\s\S]*?)<\/p>/)?.[1]);
      const d = text(a.match(/exhibition-list__info-date[^>]*>([\s\S]*?)<\/p>/)?.[1]).match(/(\d{4}\.\d{2}\.\d{2}) - (\d{4}\.\d{2}\.\d{2})/);
      if (!seq || !img || !title || !d || title.startsWith("[")) return null;
      return { seq, title, place, poster: BASE + img, startDate: ymd(d[1]), endDate: ymd(d[2]) };
    })
    .filter(Boolean);
}

async function main() {
  console.log("퐁피두센터 한화 전시 정보 수집 중...");
  const res = await fetch(`${BASE}/exhibition/list`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`centrepompidou-hanwha.kr HTTP ${res.status}`);
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const parsed = parsePompidouList(await res.text())
    .filter((x) => x.endDate >= today && !seen.has(x.seq) && seen.add(x.seq))
    .map((x) => ({
      id: `pompidou-${x.seq}`,
      title: x.title,
      venue: x.place ? `퐁피두센터 한화 ${x.place.replace(/^퐁피두센터 한화\s*/, "")}` : "퐁피두센터 한화",
      venueName: "퐁피두센터 한화",
      poster: x.poster,
      startDate: x.startDate,
      endDate: x.endDate,
      sourceUrl: `${BASE}/exhibition/detail?seq=${x.seq}`,
      status: x.startDate > today ? "upcoming" : "ongoing",
      source: "pompidou",
      reviewSummary: null,
    }));
  console.log(`  -> 현재+예정 전시 ${parsed.length}건`);
  if (!parsed.length) throw new Error("퐁피두센터 한화 전시가 0건 — 누리집 구조가 바뀌었는지 확인");

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }
  const merged = mergeSource(existing, ["pompidou"], parsed);
  console.log(`  -> pompidou 항목 ${merged.filter((e) => e.source === "pompidou").length}건 반영`);
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
