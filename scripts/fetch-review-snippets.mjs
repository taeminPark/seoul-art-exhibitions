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
// 수집 대상 = "5건이 다 안 찬" 전시. 개막 전 전시는 제외한다 — 아직 아무도
// 다녀오지 않았으니 "후기"가 존재할 수 없는데, 관련도순(sim) 검색이라 개막 전에
// 돌리면 전시와 무관한 옛 글이나 홍보성 글이 상위에 올라와 후기인 것처럼 저장된다.
//
// 5건을 다 채운 전시는 재수집하지 않는다(원래 "상위 5개면 충분"이라는 전제).
// 반대로 개막 직후처럼 블로그 후기가 아직 적어 5건 미만으로 채워진 전시는,
// 전시가 끝나기 전까지(endDate 지나기 전까지) 매 실행마다 계속 재시도해서
// 새로 올라오는 글로 자연스럽게 채워지도록 한다 — 한 번 적게 잡혔다고 그 상태로
// 영구히 굳어버리는 것을 방지한다. 재시도 대상은 "아직 5건 안 찬, 아직 안 끝난
// 전시"로만 좁혀지므로 스케줄을 얼마나 자주 돌리든 호출량이 무한정 늘지 않는다.
//
// 사용법: node scripts/fetch-review-snippets.mjs [--force] [--limit N]
//   --force  : 5건이 이미 찬 전시도 다시 수집한다 (평소엔 쓰지 않음)
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

  const today = new Date().toISOString().slice(0, 10);
  const needsCollection = (e) => {
    if (e.startDate > today) return false; // 개막 전 — 후기가 있을 수 없다
    if (FORCE) return true;
    if (!e.reviewSummary) return true; // 아직 한 번도 수집 안 함
    if (e.reviewSummary.posts.length >= POSTS_PER_EXHIBITION) return false; // 이미 다 참
    return e.endDate >= today; // 부족하게 채워졌고 아직 안 끝남 — 재시도
  };
  const targets = exhibitions.filter(needsCollection).slice(0, LIMIT);

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
