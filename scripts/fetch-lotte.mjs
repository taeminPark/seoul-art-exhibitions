#!/usr/bin/env node
// 롯데뮤지엄(lottemuseum.com, 잠실 롯데월드타워) 홈페이지에서 현재 전시 정보를
// 가져와 data/exhibitions.json에 합친다.
//
// 롯데뮤지엄은 한 번에 전시를 하나만 운영하고 다음 전시는 개막 임박 전까지
// 공지하지 않아서(전시 예정 페이지가 "준비 중"으로만 뜬다), 홈페이지의 현재
// 전시 섹션 하나만 긁으면 된다. art-map/문화포털 API 둘 다 이 사설 미술관은
// 아예 다루지 않는다.
//
// 인증키 불필요.
// 사용법: node scripts/fetch-lotte.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const BASE = "https://www.lottemuseum.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

// "2026.08.21 FRI" -> "2026-08-21" (앞의 "-"는 종료일 표기에 붙어있어 같이 제거한다)
function toIsoDate(raw) {
  const m = raw.replace(/^-/, "").match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo}-${d}`;
}

async function main() {
  console.log("롯데뮤지엄 현재 전시 정보 수집 중...");
  const res = await fetch(`${BASE}/ko`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`lottemuseum.com HTTP ${res.status}`);
  const html = await res.text();

  const section = html.match(/<section class="sect-main-exhibition mt100[\s\S]*?<\/section>/);
  if (!section) {
    console.log("  -> 현재 전시 섹션을 찾지 못했습니다 (사이트 구조가 바뀌었을 수 있음).");
    return;
  }
  const block = section[0];

  const img = block.match(/<img src="([^"]+)"/);
  const titleBlock = block.match(/<h2 class="tit">([\s\S]*?)<\/h2>/);
  const titleSpans = titleBlock?.[1].match(/<span>([\s\S]*?)<\/span>/g);
  const dateBlock = block.match(/<div class="date">([\s\S]*?)<\/div>/);
  const dateSpans = dateBlock?.[1].match(/<span>([\s\S]*?)<\/span>/g);

  if (!img || !titleSpans || !dateSpans || dateSpans.length < 2) {
    console.log("  -> 전시 정보(이미지/제목/기간)를 완전히 파싱하지 못해 건너뜁니다.");
    return;
  }

  const title = titleSpans
    .map((s) => s.replace(/<\/?span>/g, ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  const startDate = toIsoDate(dateSpans[0].replace(/<\/?span>/g, ""));
  const endDate = toIsoDate(dateSpans[1].replace(/<\/?span>/g, ""));
  if (!startDate || !endDate) {
    console.log("  -> 날짜 파싱 실패로 건너뜁니다.");
    return;
  }

  const detailMatch = html.match(/\/ko\/exhibitions\/exhibitionDetail\/(\d+)/);
  const detailId = detailMatch ? detailMatch[1] : null;

  const hoursMatch = html.match(
    /<h4>OPENING HOURS<\/h4>[\s\S]*?<span>\s*([^<]+)<\/span>\s*<span>\s*([^<]+)<\/span>/
  );
  const hours = hoursMatch ? `${hoursMatch[1].trim()} ${hoursMatch[2].trim()}` : null;

  const today = new Date().toISOString().slice(0, 10);
  const item = {
    id: detailId ? `lotte-${detailId}` : `lotte-${startDate}`,
    title,
    venue: "롯데뮤지엄 (롯데월드타워)",
    venueName: "롯데뮤지엄",
    poster: `${BASE}${img[1]}`,
    startDate,
    endDate,
    sourceUrl: detailId ? `${BASE}/ko/exhibitions/exhibitionDetail/${detailId}` : `${BASE}/ko`,
    status: startDate > today ? "upcoming" : "ongoing",
    hours,
    source: "lotte",
    reviewSummary: null,
  };
  console.log(`  -> "${title}" (${startDate} ~ ${endDate}) 수집`);

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    // 다른 수집 스크립트가 먼저 실행되지 않았으면 이 소스만으로 시작
  }

  const withoutOldLotte = existing.filter((e) => e.source !== "lotte");
  const existingTitles = new Set(withoutOldLotte.map((e) => normalizeTitle(e.title)));
  if (existingTitles.has(normalizeTitle(item.title))) {
    console.log("  -> 기존 데이터와 제목이 겹쳐 건너뜁니다.");
    const merged = withoutOldLotte.sort((a, b) => a.startDate.localeCompare(b.startDate));
    await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
    return;
  }

  const merged = [...withoutOldLotte, item].sort((a, b) => a.startDate.localeCompare(b.startDate));
  await writeFile(OUT_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log(`총 ${merged.length}건을 ${OUT_PATH}에 저장했습니다.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
