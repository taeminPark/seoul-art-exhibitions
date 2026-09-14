#!/usr/bin/env node
// 대림미술관 재단(daelimmuseum.org, 대림미술관/디뮤지엄) 예매 가능 전시 목록
// API에서 현재/예정 전시를 가져와 data/exhibitions.json에 합친다. art-map/
// 문화포털 API 둘 다 이 사설 미술관은 다루지 않는다.
//
// 홈페이지 자체는 Vue SPA라 서버 렌더링된 HTML이 없어 직접 스크래핑이 안 되지만,
// 예매 페이지가 쓰는 공개 AJAX 엔드포인트(GET api.daelimmuseum.org/v1/ticket/
// program/exhibitions)가 인증 없이 JSON을 그대로 돌려줘서 그걸 호출한다. 이
// 엔드포인트는 "대림미술관"과 "디뮤지엄"(같은 재단 산하 별도 공간) 전시를 모두
// 포함하며, 응답의 prgPlcNm 필드로 어느 공간인지 구분된다.
//
// 개별 전시 상세페이지는 SPA 라우트라 안정적인 딥링크를 구성할 수 없어(클라이언트
// 라우터 이름 기반 네비게이션이라 URL 패턴이 불명확함), sourceUrl은 서버에서
// 확인되는 "현재전시" 목록 페이지로 통일한다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-daelim.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const API_BASE = "https://api.daelimmuseum.org";
const LIST_URL = `${API_BASE}/v1/ticket/program/exhibitions`;
const LIST_PAGE_URL = "https://www.daelimmuseum.org/exhibition/current";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const PAGE_SIZE = 20;

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

async function fetchPage(offset) {
  const url = `${LIST_URL}?offset=${offset}&limit=${PAGE_SIZE}&orderBy=DESC`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`daelimmuseum ticket API HTTP ${res.status}`);
  const json = await res.json();
  if (json.resultCode !== "10") throw new Error(`daelimmuseum ticket API 응답 오류: ${json.resultMessage}`);
  return json.data;
}

async function fetchAllItems() {
  const first = await fetchPage(0);
  const items = [...first.exhibitions];
  const total = first.totCnt || items.length;
  for (let offset = items.length; offset < total; offset += PAGE_SIZE) {
    const page = await fetchPage(offset);
    items.push(...page.exhibitions);
  }
  return items;
}

async function main() {
  console.log("대림미술관/디뮤지엄 예매 가능 전시 정보 수집 중...");
  const raw = await fetchAllItems();
  console.log(`  -> ${raw.length}건 수집`);

  const today = new Date().toISOString().slice(0, 10);
  const parsed = [];
  for (const item of raw) {
    if (!item.prgStartDt || !item.prgEndDt || item.prgEndDt < today) continue;
    if (!item.fileUrl) continue; // 카드 포맷(이미지+정보)을 지키기 위해 이미지 없는 항목은 제외
    const venueName = item.prgPlcNm || "대림미술관";
    parsed.push({
      id: `daelim-${item.prgIdx}`,
      title: item.prgNm,
      venue: venueName,
      venueName,
      poster: item.fileUrl,
      startDate: item.prgStartDt,
      endDate: item.prgEndDt,
      sourceUrl: LIST_PAGE_URL,
      status: item.prgStartDt > today ? "upcoming" : "ongoing",
      source: "daelim",
      reviewSummary: null,
    });
  }
  console.log(`  -> 날짜/이미지 있고 현재/예정인 전시 ${parsed.length}건`);

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
