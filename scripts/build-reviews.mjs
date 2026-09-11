#!/usr/bin/env node
// 각 전시에 대해 네이버 블로그 검색으로 관람 후기를 모으고,
// Claude로 2~3문장 요약을 만들어 data/exhibitions.json에 채워 넣는다.
//
// 필요한 환경변수:
//   NAVER_CLIENT_ID, NAVER_CLIENT_SECRET  - https://developers.naver.com 에서 무료 발급 (검색 API)
//   ANTHROPIC_API_KEY                     - https://console.anthropic.com 에서 발급
//
// 사용법: node scripts/build-reviews.mjs [--force] [--limit N]
//   --force  : 이미 요약이 있어도 다시 만든다
//   --limit  : 이번 실행에서 최대 N건만 처리 (API 비용/시간 절약용, 기본 30)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

const REFRESH_AFTER_DAYS = 30; // 이미 만든 요약은 이 기간이 지나야 다시 만든다
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 30;

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

function daysSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

async function searchBlogReviews(exhibition) {
  const cleanTitle = exhibition.title.replace(/[《》<>〈〉\[\]]/g, "").trim();
  const query = `${exhibition.venueName} ${cleanTitle} 후기`;
  const url = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(
    query
  )}&display=6&sort=sim`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });
  if (!res.ok) throw new Error(`Naver API HTTP ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((it) => ({
    title: stripTags(it.title),
    description: stripTags(it.description),
    link: it.link,
    postdate: it.postdate,
  }));
}

async function summarizeWithClaude(exhibition, posts) {
  const postsText = posts
    .map((p, i) => `[${i + 1}] ${p.title}\n${p.description}`)
    .join("\n\n");

  const prompt = `다음은 "${exhibition.title}" (${exhibition.venueName}) 전시에 대한 네이버 블로그 검색 결과 스니펫이다. 이 내용만 근거로 실제 관람객들이 남긴 후기의 공통된 인상을 한국어 2~3문장으로 요약해라.

규칙:
- 스니펫에 없는 내용은 지어내지 마라.
- 후기 내용이 거의 없거나 전시와 무관하면 "충분한 후기 정보를 찾지 못했습니다."라고만 답하라.
- 요약 문장 외에 다른 말은 하지 마라 (제목, 머리말, 따옴표 없이 본문만).

검색 결과:
${postsText}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API HTTP ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || "";
}

async function main() {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error(
      "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 없습니다. https://developers.naver.com 에서 검색 API를 무료로 발급받아 설정하세요."
    );
    process.exit(1);
  }
  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY 환경변수가 없습니다.");
    process.exit(1);
  }

  const exhibitions = JSON.parse(await readFile(DATA_PATH, "utf8"));

  const targets = exhibitions
    .filter((e) => FORCE || !e.reviewSummary || daysSince(e.reviewSummary.updatedAt) > REFRESH_AFTER_DAYS)
    .slice(0, LIMIT);

  console.log(`${targets.length}건의 후기 요약을 새로 만듭니다. (전체 ${exhibitions.length}건)`);

  for (const exhibition of targets) {
    try {
      console.log(`- ${exhibition.title}`);
      const posts = await searchBlogReviews(exhibition);

      if (posts.length === 0) {
        exhibition.reviewSummary = {
          summary: "충분한 후기 정보를 찾지 못했습니다.",
          sources: [],
          updatedAt: new Date().toISOString(),
        };
        continue;
      }

      const summary = await summarizeWithClaude(exhibition, posts);
      exhibition.reviewSummary = {
        summary,
        sources: posts.slice(0, 4).map((p) => ({ title: p.title, url: p.link })),
        updatedAt: new Date().toISOString(),
      };

      // 두 API 모두 무료/저비용 티어의 호출량 제한이 있으므로 예의상 텀을 둔다.
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`  실패: ${err.message}`);
    }
  }

  await writeFile(DATA_PATH, JSON.stringify(exhibitions, null, 2) + "\n", "utf8");
  console.log("완료.");
}

main();
