# 서울 전시

서울에서 지금 볼 수 있는 미술 전시 정보를 모아 보여주는 앱입니다. [art-map.co.kr](https://art-map.co.kr)(동네 갤러리 위주)와 [문화포털 전시정보(통합) Open API](https://www.culture.go.kr/data/openapi/openapiView.do?id=598)(국립현대미술관 등 국공립 기관)를 합쳐서 두 가지 방식으로 보여줍니다.

- **전시 탭** — 포스터 카드가 최신순으로 나열되고, 아래에 제목·장소·기간이 표시됩니다. 카드를 누르면 상세 화면에서 art-map 원문(예매) 링크와 관람 후기 요약을 볼 수 있습니다.
- **캘린더 탭** — 월간 캘린더에 전시 개막일(초록 점)·마감일(빨간 점)이 표시되고, 날짜를 누르면 그날 관람 가능한 전시 목록이 바텀시트로 나타납니다.

일반 HTML/CSS/JS로 만든 PWA라서 빌드 없이 그대로 정적 호스팅하면 되고, 아이폰에서 Safari로 열어 "홈 화면에 추가"하면 일반 앱처럼 아이콘이 생기고 전체화면으로 실행됩니다.

## 로컬에서 미리보기

```
npm run serve
```

`http://localhost:8080` 접속.

## 데이터 구조

`data/exhibitions.json`이 앱이 읽는 유일한 데이터 파일입니다. 각 항목:

```jsonc
{
  "id": "32416",
  "title": "국립현대미술관 서울관《올해의 작가상 2026》",
  "venue": "국립현대미술관서울관/서울",
  "venueName": "국립현대미술관서울관",
  "poster": "https://...",
  "startDate": "2026-07-24",
  "endDate": "2026-12-06",
  "sourceUrl": "https://art-map.co.kr/exhibition/view.php?idx=32416",
  "status": "ongoing",
  "reviewSummary": null // build-reviews.mjs가 채워줌 (아래 참고)
}
```

문화포털 API로 들어온 항목은 `source: "culture-api"`와 함께 `admission`(관람료), `hours`(운영시간), `ticketInfo`(예매안내), `description`(전시 소개)이 값이 있을 때만 추가로 붙습니다.

art-map 항목은 상세정보(주소, 관람료, 운영시간)를 앱 안에서 직접 보여주지 않고 art-map 원문 링크로 연결합니다 — art-map 상세 페이지는 자바스크립트로 렌더링되어 있어 서버 없이 안정적으로 긁어오기 어렵기 때문입니다. 반면 문화포털 API로 들어온 항목(`source: "culture-api"`)은 관람료·운영시간·전시 소개까지 표준 필드로 제공돼서 앱 안에 바로 표시합니다.

## 전시 목록 갱신 (art-map)

```
npm run scrape
```

art-map의 내부 API(`/data/new_exhibition.php`)를 호출해 서울 지역의 진행중·예정 전시를 모두 가져와 `data/exhibitions.json`을 다시 씁니다. 외부 라이브러리 없이 Node 내장 `fetch`만 사용합니다.

## 국공립 기관 전시 갱신 (문화포털 API)

art-map은 동네 갤러리는 잘 잡지만 국립현대미술관 같은 국공립 기관은 예정 전시가 거의 안 올라오고, 상세 페이지 자체도 고장나 있어서(위 art-map 상세 페이지 문제 참고) 정부가 직접 표준화해서 제공하는 API를 두 번째 소스로 추가했습니다.

```
CULTURE_API_KEY=... npm run fetch-culture
```

1. [공공데이터포털](https://www.data.go.kr)에 가입 → "전시정보" 검색 → **"문화체육관광부_12개 기관 전시정보"** 데이터셋에서 **"활용신청"** (보통 즉시 자동승인, 무료)
2. 마이페이지 → 활용신청현황에서 발급된 인증키(서비스키)를 `CULTURE_API_KEY`로 사용

국립현대미술관(서울관·덕수궁관만, 과천·청주 제외)·대한민국역사박물관·예술의전당·한국영상자료원의 현재/예정 전시만 걸러서 art-map 데이터와 같은 형식으로 합칩니다. 이미지가 없는 항목은 카드 포맷(이미지+정보)을 지키기 위해 제외하고, art-map에 같은 제목의 전시가 이미 있으면 art-map 쪽을 우선합니다. (국립중앙박물관·국립한글박물관은 서울 소재지만 이 API에서 기간 데이터가 비어 있어 제외했습니다 — API 자체의 데이터 한계입니다.)

## 관람 후기 요약 갱신 (선택)

art-map에는 방문자 후기가 없어서, 네이버 블로그 검색으로 후기를 찾아 Claude로 요약하는 별도 파이프라인을 만들어뒀습니다.

```
NAVER_CLIENT_ID=... NAVER_CLIENT_SECRET=... ANTHROPIC_API_KEY=... npm run reviews
```

필요한 키:

1. **네이버 검색 API** (무료) — https://developers.naver.com/apps/#/register 에서 애플리케이션을 등록하고 "검색" API를 사용 설정하면 Client ID/Secret이 발급됩니다.
2. **Anthropic API 키** — https://console.anthropic.com 에서 발급. 요약은 비용이 저렴한 `claude-haiku-4-5-20251001` 모델을 기본으로 사용합니다.

블로그 검색 스니펫에 없는 내용은 요약에 넣지 않도록 프롬프트에 명시해뒀고, 후기를 찾지 못한 전시는 "충분한 후기 정보를 찾지 못했습니다"로 표시됩니다. 이미 만든 요약은 30일 안에는 다시 만들지 않습니다(`--force`로 강제 가능, `--limit N`으로 이번 실행 처리 건수 제한).

## 자동 갱신 (GitHub Actions)

`.github/workflows/update-data.yml`은 **`workflow_dispatch`로만** 실행됩니다 — GitHub의 `schedule:` 트리거는 부하가 몰리면 실행이 수십 분씩 밀릴 수 있어서 쓰지 않습니다. 정해진 시간에 자동으로 돌리고 싶다면 무료 외부 cron 서비스(예: [cron-job.org](https://cron-job.org))에서 아래 GitHub API를 호출하도록 등록하세요.

```
POST https://api.github.com/repos/<owner>/<repo>/actions/workflows/update-data.yml/dispatches
Authorization: Bearer <personal access token, repo 권한>
Content-Type: application/json

{ "ref": "main", "inputs": { "run_reviews": "true" } }
```

후기 요약까지 매번 갱신하면 API 비용이 발생하므로, 목록만 자주(e.g. 매일) 갱신하고 후기는 `run_reviews: true`로 가끔만 돌리는 걸 권장합니다.

리포지토리 Settings → Secrets and variables → Actions에 `CULTURE_API_KEY`(국공립 기관 갱신), `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `ANTHROPIC_API_KEY`(후기 갱신)를 등록해야 해당 스텝들이 동작합니다.

## 배포 (GitHub Pages)

Settings → Pages → Source를 "Deploy from a branch" → `main` / `/(root)`로 설정하면 별도 빌드 없이 그대로 배포됩니다.

## 아이폰에 앱처럼 설치하기

1. Safari로 배포된 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면 아이콘으로 실행하면 주소창 없이 전체화면 앱처럼 동작합니다.
