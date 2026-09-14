#!/usr/bin/env node
// 리움미술관(leeumhoam.org, 한남동)의 전시 목록 JSON API에서 현재/예정 전시를
// 가져와 data/exhibitions.json에 합친다. 리움은 art-map/문화포털 API 어디에도
// 없는 사설 미술관이라 롯데뮤지엄/예술의전당과 같은 방식으로 직접 소스를 추가한다.
//
// 페이지 자체는 JS(jQuery)가 렌더링하지만, 렌더링에 쓰이는 GET
// /leeum/exhibition/list?state[]=1|2|3 엔드포인트가 인증 없이 JSON을 그대로
// 돌려주므로 그 엔드포인트를 직접 호출한다.
//
// 상설전(endDate가 "9999-12-31")과 종료일 미정 전시(endDate가 "1900-01-01",
// 개막만 하고 마감일을 아직 공지하지 않은 경우)는 실제 "일정"이 없어 다른
// 소스들과 형식이 안 맞으므로 제외한다 (국립중앙박물관을 기간 데이터 없음으로
// 제외한 것과 같은 이유 — README 참고).
//
// 인증키 불필요.
// 사용법: node scripts/fetch-leeum.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.leeumhoam.org";
const LIST_URL = `${BASE}/leeum/exhibition/list`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// state: 1 = 현재전시, 2 = 예정전시
const STATES = [1, 2];

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

async function fetchState(state) {
  const url = `${LIST_URL}?state[]=${state}&page=1&limit=50&view=list&found=LM&keyword=&mainFlag=`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "X-Requested-With": "XMLHttpRequest" },
  });
  if (!res.ok) throw new Error(`leeumhoam.org exhibition/list HTTP ${res.status}`);
  const data = await res.json();
  return data.list ?? [];
}

async function main() {
  console.log("리움미술관 전시 정보 수집 중...");
  const raw = [];
  for (const state of STATES) raw.push(...(await fetchState(state)));
  console.log(`  -> 현재+예정 ${raw.length}건 수집`);

  const today = new Date().toISOString().slice(0, 10);
  const parsed = [];
  for (const item of raw) {
    if (item.endDate === "9999-12-31" || item.endDate === "1900-01-01") continue;
    if (!item.startDate || !item.endDate) continue;
    if (item.endDate < today) continue;

    parsed.push({
      id: `leeum-${item.exhibitionSeq}`,
      title: item.title,
      venue: item.location ? `리움미술관 ${item.location}` : "리움미술관",
      venueName: "리움미술관",
      poster: `${BASE}/upload/exhibition/${encodeURIComponent(item.image)}`,
      startDate: item.startDate,
      endDate: item.endDate,
      sourceUrl: `${BASE}/leeum/exhibition/${item.exhibitionSeq}`,
      status: item.startDate > today ? "upcoming" : "ongoing",
      source: "leeum",
      reviewSummary: null,
    });
  }
  console.log(`  -> 상설전/종료일 미정 제외, 일정 있는 전시 ${parsed.length}건`);

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const existingTitles = new Set(existing.map((e) => normalizeTitle(e.title)));
  const newOnes = parsed.filter((e) => !existingTitles.has(normalizeTitle(e.title)));
  console.log(`  -> 기존 데이터와 중복 제외 ${parsed.length - newOnes.length}건, 신규 ${newOnes.length}건 추가`);

  const merged = [...existing, ...newOnes].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
