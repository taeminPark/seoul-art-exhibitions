#!/usr/bin/env node
// 각 전시에 대해 네이버 블로그 검색으로 관련도 상위 게시물 5개를 찾아
// data/exhibitions.json의 reviewSummary에 링크로 채워 넣는다.
// AI 요약 없이 검색 API 결과를 그대로 보여주는 방식이라 Claude 개입 없이
// 이 스크립트만으로 완결된다 (자동 스케줄 실행 가능).
//
// 필요한 환경변수 (NAVER API HUB, https://www.ncloud.com/product/applicationService/naverApiHub):
//   NAVER_API_HUB_CLIENT_ID, NAVER_API_HUB_CLIENT_SECRET
//
// 2026-06-25부로 검색 오픈 API가 developers.naver.com의 무료 API에서
// 네이버클라우드플랫폼(NCP)의 "NAVER API HUB" 상품으로 이전됐다. 지금은
// 한시적 무료(월 775,000건 한도)이지만 추후 유료 전환 예정이므로, NCP 콘솔의
// Cloud Insight에서 total_cost 알림을 낮은 임계값(예: 100원)으로 걸어두고
// 쓸 것. README 참고.
//
// 아직 후기(reviewSummary)가 없는 전시, 즉 새로 추가된 전시만 수집 대상으로 삼는다.
// 이미 후기가 있는 전시는 재수집하지 않는다 — 스케줄을 얼마나 자주 돌리든
// 신규 전시 수만큼만 네이버 API를 호출하게 되어 과금 관점에서 가장 안전하다.
//
// 사용법: node scripts/fetch-review-snippets.mjs [--force] [--limit N]
//   --force  : 이미 후기가 있는 전시도 다시 수집한다 (평소엔 쓰지 않음)
//   --limit  : 이번 실행에서 최대 N건만 처리 (기본 30)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const NAVER_API_HUB_CLIENT_ID = process.env.NAVER_API_HUB_CLIENT_ID;
const NAVER_API_HUB_CLIENT_SECRET = process.env.NAVER_API_HUB_CLIENT_SECRET;

const POSTS_PER_EXHIBITION = 5;
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 30;

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function searchBlogReviews(exhibition) {
  const cleanTitle = exhibition.title.replace(/[《》<>〈〉\[\]]/g, "").trim();
  const query = `${exhibition.venueName} ${cleanTitle} 후기`;
  const url = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(
    query
  )}&display=${POSTS_PER_EXHIBITION}&sort=sim`;

  const res = await fetch(url, {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": NAVER_API_HUB_CLIENT_ID,
      "X-NCP-APIGW-API-KEY": NAVER_API_HUB_CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error(`NAVER API HUB HTTP ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((it) => ({
    title: stripTags(it.title),
    description: stripTags(it.description),
    link: it.link,
    postdate: it.postdate,
  }));
}

async function main() {
  if (!NAVER_API_HUB_CLIENT_ID || !NAVER_API_HUB_CLIENT_SECRET) {
    console.error(
      "NAVER_API_HUB_CLIENT_ID / NAVER_API_HUB_CLIENT_SECRET 환경변수가 없습니다. https://www.ncloud.com/product/applicationService/naverApiHub 에서 NAVER API HUB를 신청하고 발급받으세요 (README 참고)."
    );
    process.exit(1);
  }

  const exhibitions = JSON.parse(await readFile(DATA_PATH, "utf8"));

  const targets = exhibitions.filter((e) => FORCE || !e.reviewSummary).slice(0, LIMIT);

  console.log(`${targets.length}건의 후기를 새로 수집합니다. (전체 ${exhibitions.length}건)`);

  for (const exhibition of targets) {
    try {
      console.log(`- ${exhibition.title}`);
      const posts = await searchBlogReviews(exhibition);
      exhibition.reviewSummary = {
        posts,
        updatedAt: new Date().toISOString(),
      };

      // 월 호출량 한도(775,000건)가 있으므로 예의상 텀을 둔다.
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`  실패: ${err.message}`);
    }
  }

  await writeFile(DATA_PATH, JSON.stringify(exhibitions, null, 2) + "\n", "utf8");
  console.log("완료.");
}

main();
