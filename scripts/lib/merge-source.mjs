// 수집 스크립트들이 data/exhibitions.json에 자기 출처의 전시를 합칠 때 쓰는 공통 규칙.
//
// - 자기 출처(sources)의 예전 항목만 지우고 새로 받은 항목으로 바꾼다. 다른 출처 항목은 그대로 둔다.
//   그래서 어떤 출처의 스크립트가 실패해 이번에 안 돌아도, 그 출처 전시는 지난번 데이터로 남는다.
// - 같은 전시(제목 기준)가 여러 출처에 있으면 SOURCE_PRIORITY에서 앞선 출처를 남긴다.
//   (art-map 포스터가 가장 좋고, 리뷰도 art-map id에 붙어 있어서 맨 앞)

export const SOURCE_PRIORITY = [
  "art-map", // art-map 항목에는 source 필드가 없다
  "culture-api",
  "sac",
  "sejong",
  "lotte",
  "leeum",
  "apma",
  "seoulmuseum",
  "daelim",
  "whanki",
  "sungkok",
  "ilmin",
];

export function normalizeTitle(title) {
  return title.replace(/[《》<>〈〉[\]「」『』\s]/g, "").toLowerCase();
}

const sourceOf = (e) => e.source ?? "art-map";
const rank = (source) => {
  const i = SOURCE_PRIORITY.indexOf(source);
  return i === -1 ? SOURCE_PRIORITY.length : i;
};

export function mergeSource(existing, sources, incoming) {
  const myRank = Math.min(...sources.map(rank));
  const others = existing.filter((e) => !sources.includes(sourceOf(e)));

  const higherTitles = new Set(others.filter((e) => rank(sourceOf(e)) < myRank).map((e) => normalizeTitle(e.title)));
  const added = incoming.filter((e) => !higherTitles.has(normalizeTitle(e.title)));

  const addedTitles = new Set(added.map((e) => normalizeTitle(e.title)));
  const kept = others.filter((e) => !(rank(sourceOf(e)) > myRank && addedTitles.has(normalizeTitle(e.title))));

  return [...kept, ...added].sort((a, b) => a.startDate.localeCompare(b.startDate));
}
