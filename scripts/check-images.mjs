#!/usr/bin/env node
// data/exhibitions.json에 있는 모든 poster URL이 실제로 열리는지 점검한다.
// GitHub Actions의 update-data 워크플로우 마지막 단계로 실행되며, 결과를
// GITHUB_OUTPUT(broken_count)과 REPORT_PATH(이슈 본문용 마크다운)로 넘긴다.
// 로컬에서 그냥 `node scripts/check-images.mjs`로 실행해도 콘솔에 결과가 찍힌다.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "exhibitions.json");
const REPORT_PATH = process.env.REPORT_PATH || path.join(os.tmpdir(), "broken-images-report.md");

const CONCURRENCY = 6;
const TIMEOUT_MS = 10000;
const RETRIES = 2;
// 대림미술관, 예술의전당, 세종문화회관, 리움 등 일부 호스트는 브라우저가 아닌
// 요청을 차단/챌린지하므로, fetch-*.mjs 스크립트들과 동일하게 UA를 스푸핑한다.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function checkOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA },
    });
    const buf = await res.arrayBuffer().catch(() => null);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    // 일부 CDN(대림미술관 등)은 실제 이미지를 image/*가 아닌 application/octet-stream
    // 등으로 내려주므로 content-type만으로는 판단하지 않는다. 대신 에러 페이지가
    // 흔히 쓰는 text/html·application/json 시그니처와, 비정상적으로 작은 응답
    // 크기(placeholder/빈 응답)만 깨진 것으로 취급한다.
    const type = res.headers.get("content-type") || "";
    if (/^(text\/html|application\/json)/i.test(type)) {
      return { ok: false, reason: `content-type이 오류 페이지로 보임 (${type})` };
    }
    if (!buf || buf.byteLength < 200) {
      return { ok: false, reason: `응답 크기가 비정상적으로 작음 (${buf ? buf.byteLength : 0} bytes)` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.name === "AbortError" ? "timeout" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

// 외부 호스트의 일시적 타임아웃/5xx로 인한 오탐(false positive)을 줄이기 위해
// 실패 시 몇 차례 재시도한 뒤에도 실패해야 최종적으로 깨진 것으로 취급한다.
async function checkOne(url) {
  let result = await checkOnce(url);
  for (let attempt = 0; !result.ok && attempt < RETRIES; attempt++) {
    result = await checkOnce(url);
  }
  return result;
}

async function main() {
  const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
  const withPoster = data.filter((e) => e.poster);

  const broken = [];
  let cursor = 0;
  async function worker() {
    while (cursor < withPoster.length) {
      const e = withPoster[cursor++];
      const result = await checkOne(e.poster);
      if (!result.ok) broken.push({ id: e.id, title: e.title, poster: e.poster, reason: result.reason });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  broken.sort((a, b) => a.id.localeCompare(b.id));

  console.log(`검사 대상 ${withPoster.length}건 중 깨진 이미지 ${broken.length}건`);
  for (const b of broken) {
    console.log(`  - [${b.id}] ${b.title}: ${b.reason}`);
    console.log(`    ${b.poster}`);
  }

  const reportLines = broken.length
    ? [
        `전시 데이터 갱신 후 포스터 이미지 점검에서 깨진 이미지 **${broken.length}건**이 발견됐습니다 (검사 대상 ${withPoster.length}건).`,
        "",
        ...broken.map(
          (b) =>
            `- [ ] **[${b.id}] ${b.title}** — ${b.reason}\n  - 이미지: ${b.poster}\n  - 원문: https://art-map.co.kr/exhibition/view.php?idx=${b.id}`
        ),
        "",
        "_이 이슈는 다음 데이터 갱신 때 자동으로 다시 갱신되고, 더 이상 깨진 이미지가 없으면 자동으로 닫힙니다 (scripts/check-images.mjs)._",
      ]
    : [];
  await writeFile(REPORT_PATH, reportLines.join("\n"), "utf8");

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `broken_count=${broken.length}\n`, { flag: "a" });
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = broken.length
      ? `### 포스터 이미지 점검 결과\n검사 대상 ${withPoster.length}건 중 깨진 이미지 ${broken.length}건\n`
      : `### 포스터 이미지 점검 결과\n검사 대상 ${withPoster.length}건 모두 정상\n`;
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: "a" });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
