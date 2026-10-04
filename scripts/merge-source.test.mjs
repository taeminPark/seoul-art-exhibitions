// node --test scripts/merge-source.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeSource } from "./lib/merge-source.mjs";

const ex = (id, title, source, startDate = "2026-10-01") => ({ id, title, source, startDate });
const ids = (list) => list.map((e) => e.id).sort();

test("자기 출처의 예전 항목은 지우고 새 항목으로 바꾼다", () => {
  const existing = [ex("sac-old", "끝난 전시", "sac"), ex("a1", "아트맵 전시")];
  const out = mergeSource(existing, ["sac"], [ex("sac-new", "새 전시", "sac")]);
  assert.deepEqual(ids(out), ["a1", "sac-new"]);
});

test("다른 출처 항목은 그대로 남긴다 (문화포털이 실패해 이번에 안 돌아도 유지)", () => {
  const existing = [ex("a1", "아트맵 전시"), ex("c1", "국현 전시", "culture-api")];
  const out = mergeSource(existing, ["sac"], [ex("s1", "예당 전시", "sac")]);
  assert.deepEqual(ids(out), ["a1", "c1", "s1"]);
});

test("art-map이 다시 수집해도 다른 출처 항목은 지우지 않는다", () => {
  const existing = [ex("a-old", "지난 아트맵 전시"), ex("c1", "국현 전시", "culture-api")];
  const out = mergeSource(existing, ["art-map"], [ex("a-new", "새 아트맵 전시")]);
  assert.deepEqual(ids(out), ["a-new", "c1"]);
});

test("같은 제목이 우선순위 높은 출처에 이미 있으면 새 항목을 넣지 않는다", () => {
  const existing = [ex("a1", "《달리》")];
  const out = mergeSource(existing, ["culture-api"], [ex("c1", "달리", "culture-api")]);
  assert.deepEqual(ids(out), ["a1"]);
});

test("지난 실행에서 남은 낮은 우선순위 중복은 높은 출처가 들어오면 빠진다", () => {
  const existing = [ex("s1", "스페인 미술 500년", "sac")];
  const out = mergeSource(existing, ["culture-api"], [ex("c1", "스페인 미술 500년", "culture-api")]);
  assert.deepEqual(ids(out), ["c1"]);
});

test("낮은 우선순위 출처는 높은 출처의 같은 제목을 밀어내지 않는다", () => {
  const existing = [ex("c1", "스페인 미술 500년", "culture-api")];
  const out = mergeSource(existing, ["sac"], [ex("s1", "스페인 미술 500년", "sac")]);
  assert.deepEqual(ids(out), ["c1"]);
});

test("시작일 순으로 정렬한다", () => {
  const out = mergeSource([ex("b", "B", "sac", "2026-12-01")], ["leeum"], [ex("a", "A", "leeum", "2026-01-01")]);
  assert.deepEqual(out.map((e) => e.id), ["a", "b"]);
});
