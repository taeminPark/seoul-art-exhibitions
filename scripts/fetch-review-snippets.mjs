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
// 네이버 검색은 관련도순이라도 전시와 무관한 글이 많이 섞인다 (예: 「오프 더 화이트」를
// 찾으면 옷 코디 글, 일민미술관을 넣으면 2015년 경매 장서 목록). 그래서
//   1) 검색어를 여러 개로 넓게 모은 뒤 (제목+전시, 미술관+제목, 제목 최신순)
//   2) 글 제목·요약에 전시 이름이 실제로 들어 있고, 미술관 이름이나 전시 관련 낱말
//      (전시·관람·미술관 …)도 함께 있는 글만 남기고
//   3) 개막 한 달 전보다 오래된 글은 버린 뒤
//   4) 최신 글부터 5개를 저장한다.
// 걸러서 하나도 안 남으면 빈 목록으로 둔다 — 엉뚱한 글보다 "아직 없음"이 낫다.
//
// 수집 대상: 개막한, 아직 안 끝난 전시 중
//   - 이 규칙(FILTER_VERSION)으로 아직 한 번도 거르지 않았거나
//   - 마지막 수집에서 REFRESH_DAYS일이 지난 것 (새 글이 계속 올라오므로)
// 개막 전 전시는 제외한다 — 아직 아무도 다녀오지 않았다.
//
// 사용법: node scripts/fetch-review-snippets.mjs [--force] [--limit N]
//   --force  : 주기와 상관없이 다시 수집한다
//   --limit  : 이번 실행에서 최대 N건만 처리 (기본 80)

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "exhibitions.json");

const NAVER_API_HUB_CLIENT_ID = process.env.NAVER_API_HUB_CLIENT_ID;
const NAVER_API_HUB_CLIENT_SECRET = process.env.NAVER_API_HUB_CLIENT_SECRET;

const POSTS_PER_EXHIBITION = 5;
const FILTER_VERSION = 2; // 거르는 규칙을 바꾸면 올린다 → 모든 전시를 새 규칙으로 다시 수집
const REFRESH_DAYS = 6; // 주 1회 갱신 기준으로 매번 새 글을 반영
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 80;

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const squash = (s) => s.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");

// 미술관 이름 정리표는 앱(venues.js)과 같은 것을 쓴다 — "국립현대미술관서울관" → "국립현대미술관 서울"
const { canonicalVenue } = vm.runInNewContext(
  (await readFile(path.join(__dirname, "..", "venues.js"), "utf8")) + "\n;({ canonicalVenue })"
);

// 겹낫표 안이라도 이런 말은 전시 이름이 아니다 (예: 「영원한 나르시스트, 천경자<상설전>」)
const LABEL_ONLY = /^(상설전|특별전|기획전|개인전|단체전|초대전|展|전)$/;

// 검색과 대조에 쓸 "전시 이름의 핵심".
//   전기숙·정은혜 《날개가 한 번 펄럭일 때》 → 날개가 한 번 펄럭일 때 (겹낫표 안)
//   [하트하트아트앤컬처] 마음의 각도 : 경계를 허무는 시선들 → 마음의 각도 (앞 [..] 떼고 부제 앞까지)
export function coreTitle(title) {
  const quoted = [...title.matchAll(/[《〈「『<]([^》〉」』>]+)[》〉」』>]/g)].map((m) => m[1].trim()).find((q) => !LABEL_ONLY.test(q));
  let core = quoted || title.replace(/^\s*(\[[^\]]*\]\s*)+/, "").replace(/[<〈][^>〉]*[>〉]/g, "");
  core = core.split(/\s*[:：]\s*|\s+-\s+/)[0].trim();
  return squash(core).length >= 2 ? core : title.replace(/[《》<>〈〉「」『』\[\]]/g, "").trim();
}

// 핵심 이름이 이 정도로 짧으면(「군락」 「교차점」 「최종태」) 흔한 낱말이라 미술관 이름까지 맞아야 한다
const SHORT_CORE = 4;
const EXHIBITION_WORDS = /전시|관람|미술관|갤러리|작가|작품|展|도슨트|개인전|기획전|특별전|\d인전|그룹전/;

function venueKeys(exhibition) {
  const names = new Set([exhibition.venueName || "", canonicalVenue(exhibition.venueName, exhibition.venue)]);
  const keys = new Set();
  for (const n of names) {
    if (squash(n).length >= 3) keys.add(squash(n));
    for (const part of n.split(/\s+/)) if (squash(part).length >= 4) keys.add(squash(part));
  }
  return [...keys];
}

// 같은 이름 다른 회차를 다룬 글인가 — 「오프 더 화이트: 무늬와 정보」를 찾는데 글에는
// 「오프 더 화이트: 주름과 망루」(지난 회차)만 있는 경우. 글 속 "이름: 부제"가 모두 우리 부제와 다르면 true.
function otherSeriesSubtitle(text, title) {
  const quoted = title.match(/[《〈「『<]([^》〉」』>]+)[》〉」』>]/);
  const base = (quoted ? quoted[1] : title.replace(/^\s*(\[[^\]]*\]\s*)+/, "")).split(/\s*[:：]\s*/);
  if (base.length < 2) return false;
  const core = squash(base[0]);
  const ours = squash(base[1]).slice(0, 2);
  if (!core || !ours) return false;
  const re = new RegExp(`${[...core].join("\\s*")}\\s*[:：]\\s*([^\\s,)》>」]+)`, "gi");
  const subs = [...text.matchAll(re)].map((m) => squash(m[1]).slice(0, 2)).filter(Boolean);
  return subs.length > 0 && !subs.includes(ours);
}

// 글이 이 전시를 다룬 글인가
export function isAboutExhibition(post, exhibition) {
  const text = `${post.title} ${post.description}`;
  const flat = squash(text);
  const core = squash(coreTitle(exhibition.title));
  if (!flat.includes(core)) return false;
  if (otherSeriesSubtitle(text, exhibition.title)) return false;
  const venueHit = venueKeys(exhibition).some((k) => flat.includes(k));
  if (core.length <= SHORT_CORE) {
    // 짧은 이름은 미술관 이름이 같이 있거나, 부제까지 붙은 전체 이름이 있어야 한다 (「권병준: 내 마음속에 너는」)
    const quoted = exhibition.title.match(/[《〈「『]([^》〉」』]+)[》〉」』]/);
    const full = squash(quoted ? quoted[1] : exhibition.title.replace(/^\s*(\[[^\]]*\]\s*)+/, ""));
    if (!venueHit && !(full.length > core.length && flat.includes(full))) return false;
  } else if (!venueHit && !EXHIBITION_WORDS.test(text)) return false;
  // 개막 한 달 전보다 오래된 글은 같은 이름의 다른 행사이거나 옛 글이다
  const earliest = new Date(new Date(exhibition.startDate).getTime() - 31 * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
  return !post.postdate || post.postdate >= earliest;
}

async function searchBlog(query, sort) {
  const url = `https://naverapihub.apigw.ntruss.com/search/v1/blog?query=${encodeURIComponent(query)}&display=30&sort=${sort}`;
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

async function searchBlogReviews(exhibition) {
  const core = coreTitle(exhibition.title);
  const queries = [
    [`${core} 전시`, "sim"],
    [`${exhibition.venueName} ${core}`, "sim"],
    [`${core} 전시`, "date"],
  ];
  const byLink = new Map();
  for (const [q, sort] of queries) {
    for (const post of await searchBlog(q, sort)) {
      if (!byLink.has(post.link) && isAboutExhibition(post, exhibition)) byLink.set(post.link, post);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  // 글 제목에 전시 이름이 있는 글(관람 후기일 가능성이 높다)을 먼저, 본문 요약에만 있는 글
  // (월간 전시 총정리 등)을 뒤에 두고, 각각 최신 글부터.
  const key = squash(core);
  const inTitle = (p) => (squash(p.title).includes(key) ? 1 : 0);
  return [...byLink.values()]
    .sort((a, b) => inTitle(b) - inTitle(a) || (b.postdate || "").localeCompare(a.postdate || ""))
    .slice(0, POSTS_PER_EXHIBITION);
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
  const refreshBefore = new Date(Date.now() - REFRESH_DAYS * 86400000).toISOString();
  const needsCollection = (e) => {
    if (e.startDate > today) return false; // 개막 전 — 후기가 있을 수 없다
    if (e.endDate < today) return false; // 끝난 전시는 더 볼 사람이 없다
    if (FORCE) return true;
    const r = e.reviewSummary;
    if (!r || r.filterVersion !== FILTER_VERSION) return true; // 새 규칙으로 아직 안 거름
    return (r.updatedAt || "") < refreshBefore; // 새 글 반영 주기
  };
  const targets = exhibitions.filter(needsCollection).slice(0, LIMIT);

  console.log(`${targets.length}건의 후기를 새로 수집합니다. (전체 ${exhibitions.length}건)`);

  for (const exhibition of targets) {
    try {
      console.log(`- ${exhibition.title}`);
      const posts = await searchBlogReviews(exhibition);
      console.log(`  ${posts.length}건`);
      exhibition.reviewSummary = {
        posts,
        updatedAt: new Date().toISOString(),
        filterVersion: FILTER_VERSION,
      };
    } catch (err) {
      console.error(`  실패: ${err.message}`);
    }
  }

  await writeFile(DATA_PATH, JSON.stringify(exhibitions, null, 2) + "\n", "utf8");
  console.log("완료.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
