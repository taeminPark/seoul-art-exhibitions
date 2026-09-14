#!/usr/bin/env node
// 서울미술관(seoulmuseum.org, 석파정, 부암동)의 EXHIBITION 게시판에서 전시 정보를
// 가져와 data/exhibitions.json에 합친다. art-map/문화포털 API 둘 다 이 사설
// 미술관은 다루지 않는다.
//
// 이 사이트는 구조화된 "전시" 데이터 모델이 따로 없고, 게시판(/EXHIBITION)의
// 글 제목에 "전시명 (YY.M.D~YY.M.D)" 형식으로 기간이 섞여 들어가 있다. 종료일에
// 연도가 생략된 경우(예: "25.6.25~10.12")는 시작 연도를 그대로 쓰지만, 시작일
// 자체가 없거나(예: "(~8월 17일)") 연도가 아예 없는 경우(예: "(4월 1일 ~ 8월
// 17일)")는 정확한 연도를 신뢰할 수 없어 건너뛴다 — 잘못된 날짜를 지어내는 것보다
// 누락이 낫다는 이 프로젝트의 기존 원칙(README의 국립중앙박물관 제외 사례 참고).
//
// 인증키 불필요.
// 사용법: node scripts/fetch-seoulmuseum.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.seoulmuseum.org";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const ITEM_RE =
  /<div class="col-xs-12 col-sm-4 col-md-4 item n" data-id="(\d+)">[\s\S]*?<img src="([^"]+)"[\s\S]*?<a href="\/forum\/view\/\d+" class="">([^<]+)<\/a>/g;
const DATE_RE = /(\d{2,4})\.(\d{1,2})\.(\d{1,2})\s*~\s*(?:(\d{2,4})\.)?(\d{1,2})\.(\d{1,2})/;

function toYear(y) {
  return y.length === 2 ? `20${y}` : y;
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

async function main() {
  console.log("서울미술관 전시 정보 수집 중...");
  const res = await fetch(`${BASE}/EXHIBITION`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`seoulmuseum.org HTTP ${res.status}`);
  const html = await res.text();

  const today = new Date().toISOString().slice(0, 10);
  const parsed = [];
  for (const m of html.matchAll(ITEM_RE)) {
    const [, id, poster, rawTitle] = m;
    const dm = rawTitle.match(DATE_RE);
    if (!dm) continue; // 연도 불명확 등으로 기간을 신뢰할 수 없는 항목은 건너뜀
    const [, sy, sm, sd, ey, em, ed] = dm;
    const startDate = `${toYear(sy)}-${pad(sm)}-${pad(sd)}`;
    const endDate = `${ey ? toYear(ey) : toYear(sy)}-${pad(em)}-${pad(ed)}`;
    if (endDate < today) continue;

    const title = rawTitle.replace(/\s*\([^)]*\)\s*$/, "").trim();
    parsed.push({
      id: `seoulmuseum-${id}`,
      title,
      venue: "서울미술관 (석파정)",
      venueName: "서울미술관",
      poster,
      startDate,
      endDate,
      sourceUrl: `${BASE}/forum/view/${id}`,
      status: startDate > today ? "upcoming" : "ongoing",
      source: "seoulmuseum",
      reviewSummary: null,
    });
  }
  console.log(`  -> 기간 파싱 가능하고 현재/예정인 전시 ${parsed.length}건`);

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
