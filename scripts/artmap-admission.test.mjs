// node --test scripts/artmap-admission.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAdmission } from "./scrape-list.mjs";

const page = (td) => `<tr>
                <th kr_th>관람료<span>|</span></th>
                <td style="word-break: break-all; ">
                    ${td}                </td>
            </tr>`;

test("art-map 상세 페이지의 관람료 칸을 읽는다", () => {
  assert.equal(parseAdmission(page("무료")), "무료");
  assert.equal(parseAdmission(page("성인 15,000원<br/>청소년 10,000원")), "성인 15,000원 청소년 10,000원");
});

test("관람료 칸이 비었거나 없으면 null", () => {
  assert.equal(parseAdmission(page("")), null);
  assert.equal(parseAdmission("<html></html>"), null);
});
