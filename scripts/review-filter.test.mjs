// node --test scripts/review-filter.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { coreTitle, isAboutExhibition } from "./fetch-review-snippets.mjs";

test("전시 이름의 핵심만 뽑는다", () => {
  assert.equal(coreTitle("《오프 더 화이트: 무늬와 정보》"), "오프 더 화이트");
  assert.equal(coreTitle("[하트하트아트앤컬처] 마음의 각도 : 경계를 허무는 시선들"), "마음의 각도");
  assert.equal(coreTitle("전기숙·정은혜 《날개가 한 번 펄럭일 때》"), "날개가 한 번 펄럭일 때");
  assert.equal(coreTitle("자비 솔라 특별전"), "자비 솔라 특별전");
});

const offWhite = { title: "《오프 더 화이트: 무늬와 정보》", venueName: "일민미술관", startDate: "2026-08-14" };
const post = (title, postdate = "20260901", description = "") => ({ title, description, postdate, link: title });

test("전시 이름이 없는 글은 버린다 (옛 장서 목록, 다른 전시 후기)", () => {
  assert.equal(isAboutExhibition(post("소장장서목록 (2015.2.19, 7614권)", "20150217", "서울옥션 미술품 경매"), offWhite), false);
  assert.equal(isAboutExhibition(post("일민미술관 기획전 《바이브 에라》 전시 후기"), offWhite), false);
});

test("이름이 같아도 전시와 관계없는 글은 버린다 (옷 코디)", () => {
  assert.equal(isAboutExhibition(post("오프 더 화이트 셔츠 코디", "20260901", "여름 데일리룩"), offWhite), false);
});

test("전시 이름과 미술관/전시 낱말이 함께 있으면 남긴다 (띄어쓰기 달라도)", () => {
  assert.equal(isAboutExhibition(post("[전시] 일민미술관 《오프 더 화이트: 무늬와 정보》 관람후기(8/15)", "20260816"), offWhite), true);
  assert.equal(isAboutExhibition(post("오프더화이트 다녀옴", "20260920", "광화문 일민미술관"), offWhite), true);
});

test("개막 한 달 전보다 오래된 글은 버린다", () => {
  assert.equal(isAboutExhibition(post("일민미술관 오프 더 화이트 전시", "20260601"), offWhite), false);
});

test("겹낫표 안의 '상설전' 같은 꼬리표는 전시 이름으로 보지 않는다", () => {
  assert.equal(coreTitle("영원한 나르시스트, 천경자<상설전>"), "영원한 나르시스트, 천경자");
});

test("핵심 이름이 짧으면 미술관 이름까지 맞아야 남긴다", () => {
  const e = { title: "송파 청년아티스트센터 3기 릴레이 개인전 《교차점》", venueName: "송파청년아티스트센터", startDate: "2026-10-01" };
  assert.equal(isAboutExhibition(post("상하이 샤넬 전시회 교차점", "20261012"), e), false);
  assert.equal(isAboutExhibition(post("송파청년아티스트센터 교차점 전시 후기", "20261012"), e), true);
  const soma = { title: "[소마미술관] 국립현대미술관 미술은행 소장품 기획전 《군락: 여섯 개의 뜰》", venueName: "소마미술관", startDate: "2026-10-01" };
  assert.equal(isAboutExhibition(post("명성산 억새꽃축제", "20261012", "억새 군락 전시"), soma), false);
});

test("art-map식 붙여 쓴 미술관 이름도 정리된 이름으로 맞춘다", () => {
  const e = { title: "《올해의 작가상 2026》", venueName: "국립현대미술관서울관", startDate: "2026-07-24" };
  assert.equal(isAboutExhibition(post("국립현대미술관 서울 올해의 작가상 2026 후기", "20260801"), e), true);
});

test("짧은 이름이라도 부제까지 붙은 전체 이름이 있으면 남긴다", () => {
  const e = { title: "《권병준: 내 마음속에 너는》", venueName: "서울시립미술관 북서울관", startDate: "2026-06-11" };
  assert.equal(isAboutExhibition(post("북서울미술관 권병준 내 마음속에 너는 후기", "20260701"), e), true);
  assert.equal(isAboutExhibition(post("권병준 작가 인터뷰", "20260701"), e), false);
});

test("같은 이름의 다른 회차(부제가 다른) 글은 버린다", () => {
  assert.equal(isAboutExhibition(post("김동희 개인전", "20260828", "그룹전 《오프 더 화이트: 주름과 망루》 (2026, 일민미술관)"), offWhite), false);
  assert.equal(isAboutExhibition(post("노송희 곽이브 2인전 <오프 더 화이트: 무늬와 정보>", "20260912"), offWhite), true);
});
