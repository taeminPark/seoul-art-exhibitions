// node --test scripts/museum-lists.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseNmkList } from "./fetch-nmk.mjs";
import { parsePompidouList } from "./fetch-pompidou.mjs";

const nmkItem = (id, title, dates, place) => `<li>
							<div class="img-box">
								<div class="card report">
									<a href="?menuId=current&schM=view&act=current&exhiSpThemId=${id}&listType=list">
										</div> <img src="/afile/previewThumbnail/fileMng_${id}?siteCode=MUSEUM" onerror="x" alt="${title}">
									</a>
								</div>
							</div>
							<div class="info">
								<a href="?schM=view&menuId=upcomming&exhiSpThemId=${id}&listType=list">
									<strong>${title}</strong>
								</a>
								<ul class="info-list special">
									<li><strong>기간</strong>
									<p>${dates}</p></li>
									<li><strong>장소</strong>
									<p>${place}</p></li>
								</ul>
								</div>
						</li>`;

test("국립중앙박물관 목록: 박물관 안 전시만, 지역 순회전은 뺀다", () => {
  const page = "https://www.museum.go.kr/MUSEUM/contents/M0202020000.do?menuId=upcomming";
  const html = nmkItem(1, "분청사기 주제전시 &lt;대나무&gt;", "2026-06-23~2027-01-31", "상설전시실 3층")
    + nmkItem(2, "[지역 공립박물관 순회전시] 국보순회전", "2026-05-19~2026-11-29", "진천종박물관, 영암도기박물관 등")
    + nmkItem(3, "모던 아트의 탄생", "2026-11-27~2027-04-18", "특별전시실 1");
  const list = parseNmkList(html, page);
  assert.deepEqual(list.map((x) => x.id), ["1", "3"]);
  assert.deepEqual(list[0], {
    id: "1", title: "분청사기 주제전시 <대나무>", startDate: "2026-06-23", endDate: "2027-01-31", place: "상설전시실 3층",
    poster: "https://www.museum.go.kr/afile/previewThumbnail/fileMng_1?siteCode=MUSEUM",
    link: "https://www.museum.go.kr/MUSEUM/contents/M0202020000.do?schM=view&menuId=upcomming&exhiSpThemId=1&listType=list",
  });
});

const pompItem = (seq, label, title, date) => `<a href="/exhibition/detail?seq=${seq}&status=ACTIVE&pageActive=1" class="exhibition-list__item">
      <img src="/upload/exhibition/2026/10/19/${seq}.jpg" alt="${title}" data-fallback />
      <p class="label label--2 exhibition-list__info-label">
            ${label}
      </p>
      <p class="title title--1 exhibition-list__info-title">
            ${title}
      </p>
      <p class="title title--5 title--bold exhibition-list__info-date sp-pt-7">
          ${date}
      </p>
    </a>`;

test("퐁피두센터 한화 목록: 대괄호로 시작하는 표 상품은 뺀다", () => {
  const html = pompItem(174, "1  전시실", "샤갈, 너머의 여정", "2026.11.24\n  -\n  2027.03.28")
    + pompItem(183, "퐁피두센터 한화 1,2 전시실", "[통합전시 얼리버드] 샤갈+레픽 아나돌", "2026.12.12 - 2026.12.31");
  assert.deepEqual(parsePompidouList(html), [{
    seq: "174", title: "샤갈, 너머의 여정", place: "1 전시실",
    poster: "https://www.centrepompidou-hanwha.kr/upload/exhibition/2026/10/19/174.jpg",
    startDate: "2026-11-24", endDate: "2027-03-28",
  }]);
});
