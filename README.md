# 서울 전시

서울에서 지금 볼 수 있는 미술 전시 정보를 모아 보여주는 앱입니다. [art-map.co.kr](https://art-map.co.kr)(동네 갤러리 위주), [문화포털 전시정보(통합) Open API](https://www.culture.go.kr/data/openapi/openapiView.do?id=598)(국립현대미술관 등 국공립 기관), [예술의전당](https://www.sac.or.kr)·[세종문화회관](https://www.sejongpac.or.kr)·[롯데뮤지엄](https://www.lottemuseum.com)(대형 전시장 자체 기획전 + 대관 특별전), 그리고 [리움미술관](https://www.leeumhoam.org)·[아모레퍼시픽미술관](https://apma.amorepacific.com)·[서울미술관](https://www.seoulmuseum.org)·[대림미술관/디뮤지엄](https://www.daelimmuseum.org)·[환기미술관](http://whankimuseum.org)·[성곡미술관](http://www.sungkokmuseum.org)·[일민미술관](https://ilmin.org)(대형 사립미술관) 소스를 합쳐서 보여줍니다.

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
  "reviewSummary": null // 후기 요약 갱신 절차로 채워짐 (아래 참고)
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

## 예술의전당 전시 갱신 (대관 특별전 포함)

문화포털 API의 "예술의전당" 항목은 예술의전당이 직접 기획한 전시 위주라, 언론사·해외 기관 등 외부 주최측이 한가람미술관/한가람디자인미술관을 대관해서 여는 블록버스터 특별전(예: 피카소·고야·달리 등 해외 거장전)은 거의 잡히지 않습니다. 예술의전당 홈페이지 자체는 대관전이든 자체 기획전이든 그 안에서 열리는 프로그램을 전부 보여주므로, 예술의전당만큼은 이 사이트를 직접 API로 긁는 세 번째 소스를 추가했습니다.

```
npm run fetch-sac
```

인증키가 필요 없는 공개 AJAX 엔드포인트(`/site/main/show/dataList`)를 호출해 "전시장" 분류의 진행/예정 프로그램을 모두 가져옵니다. `source: "sac"`로 표시되며 `admission`(관람료), `hours`(운영시간)가 값이 있을 때 붙습니다. 다른 소스에 같은 제목의 전시가 이미 있으면 그쪽을 우선합니다.

## 세종문화회관 전시 갱신 (대관 특별전 포함)

같은 이유로 세종문화회관(세종미술관 등)도 별도 소스로 추가했습니다.

```
npm run fetch-sejong
```

인증키 없이 `Referer` 헤더만 있으면 되는 공개 검색 API(`/portal/performance/exhibit/performListData.do`)를 호출해 오늘부터 2년 내 진행/예정 전시를 가져옵니다. `source: "sejong"`으로 표시됩니다.

## 롯데뮤지엄 현재 전시 갱신

롯데뮤지엄(잠실 롯데월드타워)은 art-map·문화포털 API 어디에도 없는 사설 미술관이라 세 번째로 추가했습니다. 이 곳은 전시를 한 번에 하나만 운영하고 다음 전시는 개막 임박 전까지 공지하지 않아서, 홈페이지의 "현재 전시" 섹션 하나만 긁습니다.

```
npm run fetch-lotte
```

`source: "lotte"`로 표시되며, 실행할 때마다 이전에 저장된 롯데뮤지엄 항목을 최신 전시로 교체합니다(다른 소스와 달리 항상 누적하지 않고 최신 1건만 유지).

## 대형 사립미술관 전시 갱신

art-map·문화포털 API·예술의전당·세종문화회관·롯데뮤지엄 어디에도 잡히지 않는 대형 사립미술관 6곳을 각 사이트에서 직접 긁습니다. 인증키는 모두 필요 없습니다.

```
npm run fetch-leeum          # 리움미술관 (leeumhoam.org)
npm run fetch-apma           # 아모레퍼시픽미술관 (apma.amorepacific.com)
npm run fetch-seoulmuseum    # 서울미술관·석파정 (seoulmuseum.org)
npm run fetch-daelim         # 대림미술관·디뮤지엄 (daelimmuseum.org)
npm run fetch-whanki-sungkok # 환기미술관 + 성곡미술관
npm run fetch-ilmin          # 일민미술관 (ilmin.org)
```

- **리움미술관**: 페이지 자체는 JS가 렌더링하지만 그 안에서 호출하는 `GET /leeum/exhibition/list` 엔드포인트가 인증 없이 JSON을 그대로 돌려줘서 그걸 직접 호출합니다. 상설전(종료일 `9999-12-31`)과 종료일 미정 전시(`1900-01-01`)는 실제 일정이 없어 제외합니다.
- **아모레퍼시픽미술관(APMA)**: 한 번에 대형 기획전 하나만 몇 달씩 운영하고 다음 전시를 미리 공지하지 않아 롯데뮤지엄처럼 "현재 전시" 하나만 긁습니다. 목록 페이지엔 기간이 없어 상세페이지에 박혀 있는 `place` 필드(예: "2026.09.01(화) ~ 2027.02.28(일)")를 파싱합니다.
- **서울미술관**: 별도 API 없이 게시판 글 제목에 "전시명 (YY.M.D~YY.M.D)" 형식으로 기간이 섞여 있어 정규식으로 뽑습니다. 연도가 아예 없는 제목(예: "쉽게 닳지 않는 사람 (4월 1일 ~ 8월 17일)")은 정확한 연도를 신뢰할 수 없어 건너뜁니다.
- **대림미술관/디뮤지엄**: 홈페이지는 Vue SPA라 직접 스크래핑이 안 되지만, 예매 페이지가 쓰는 공개 AJAX 엔드포인트(`api.daelimmuseum.org/v1/ticket/program/exhibitions`)를 대신 호출합니다. 대림미술관과 디뮤지엄(같은 재단 산하 별도 공간) 전시가 함께 나옵니다.
- **환기미술관/성곡미술관**: 두 사이트 다 HTTPS 인증서가 고장나 있어(자체서명/기본 nginx 플레이스홀더) 평문 HTTP로만 접속됩니다. 환기미술관은 워드프레스 REST API(`/wp-json/wp/v2/exhibitions`)로 목록을, 상세페이지 HTML에서 "전시기간" 필드를 따로 긁습니다. 성곡미술관은 REST API가 없어 목록·상세페이지를 모두 HTML로 긁습니다.
- **일민미술관**: 워드프레스 REST API(`/wp-json/wp/v2/exhibition`)로 목록을 가져오고, 상세페이지 본문에 박힌 "2026.9.17.(Thu) ― 2026.11.13.(Fri)" 형식 날짜를 정규식으로 뽑습니다. `Accept-Language` 헤더가 없는 요청은 차단되는 것으로 보여 브라우저와 유사한 헤더를 붙입니다.

간송미술관도 검토했지만 서버가 중간 인증서를 보내주지 않아 인증서 체인이 불완전했고, 이를 우회하려면 TLS 인증서 검증 자체를 꺼야 해서 제외했습니다(확인 시점 기준 전시 게시판도 비어 있었습니다 — 특별전을 드물게 여는 곳이라 정상적인 상태로 보입니다).

## 관람 후기 갱신 (선택)

art-map에는 방문자 후기가 없어서, 네이버 블로그 검색으로 관련도 상위 게시물 5개를 찾아 링크로 보여줍니다. AI 요약 없이 검색 결과를 그대로 보여주는 방식이라 Claude 개입이 필요 없고, 스크립트 한 번으로 끝납니다(자동 스케줄 실행도 가능 — 아래 "자동 갱신" 참고).

```
cp .env.example .env   # .env는 gitignore 대상 — 키를 코드/커밋에 남기지 않는다
# .env를 열어 NAVER_API_HUB_CLIENT_ID / NAVER_API_HUB_CLIENT_SECRET 값을 채운 뒤:
npm run fetch-review-snippets
```

**네이버 검색 API**가 2026-06-25부로 `developers.naver.com`의 무료 오픈 API에서 네이버클라우드플랫폼(NCP)의 **NAVER API HUB** 상품으로 이전됐습니다. 발급 절차:

1. https://www.ncloud.com/product/applicationService/naverApiHub 에서 NCP 계정 가입(결제수단 등록 필요) 후 API HUB 신청
2. 콘솔에서 "블로그" API를 선택해 Application 생성 → 발급된 Client ID/Secret을 `.env`의 `NAVER_API_HUB_CLIENT_ID` / `NAVER_API_HUB_CLIENT_SECRET`에 채워넣는다 (`npm run fetch-review-snippets`가 Node의 `--env-file=.env`로 자동으로 읽는다)
3. **가입 직후 바로 비용 알림을 걸어두세요** — 콘솔의 Cloud Insight 모니터링에서 `total_cost`(총 청구 비용) 지표를 감시 항목으로 추가하고 임계값을 낮게(예: 100원 이상) 설정해서 알림 대상(이메일)을 지정합니다. 지금은 "한시적 무료"(월 775,000건 한도)이고 유료 전환 시 사전 공지한다고는 하지만, 공지를 놓칠 수도 있으니 이 알림이 실질적인 안전장치입니다.

**개막 전 전시는 수집 대상에서 제외합니다** — 아직 아무도 다녀오지 않아 진짜 후기가 존재할 수 없고, 관련도순 검색 특성상 무관한 옛 글이 후기인 것처럼 저장되기 때문입니다. 개막 후 다음 실행 때 자동으로 수집 대상에 들어갑니다.

**후기가 5건(포스트 수 상한) 다 찬 전시는 재수집하지 않습니다.** 반대로 개막 직후처럼 블로그 후기가 아직 적어 5건 미만으로 채워진 전시는, 전시가 끝나기 전까지 매 실행마다 계속 재시도해서 새로 올라오는 글로 자연스럽게 채워지도록 합니다 — 개막 초기에 우연히 1건만 잡히고 그 상태로 영구히 굳어버리는 것을 방지하기 위함입니다. 재시도 대상은 "아직 5건 안 찬, 아직 안 끝난 전시"로만 좁혀지므로 스케줄을 얼마나 자주 돌리든 호출량이 무한정 늘지 않습니다. (`--force`로 5건이 이미 찬 전시도 강제 재수집 가능, `--limit N`으로 이번 실행 처리 건수 제한.)

검색 결과가 전시와 무관해도(네이버 검색 API 자체의 한계) 걸러내지 않고 그대로 상위 5개를 보여줍니다 — 사람이나 Claude가 매번 검수하지 않는 것을 전제로 한 트레이드오프입니다. `reviewSummary`는 `{ posts: [{title, description, link, postdate}] (최대 5개), updatedAt: (ISO 날짜) }` 형태입니다.

## 자동 갱신 (GitHub Actions)

`.github/workflows/update-data.yml`은 **`workflow_dispatch`로만** 실행됩니다 — GitHub의 `schedule:` 트리거는 부하가 몰리면 실행이 수십 분씩 밀릴 수 있어서 쓰지 않습니다. 정해진 시간에 자동으로 돌리고 싶다면 무료 외부 cron 서비스(예: [cron-job.org](https://cron-job.org))에서 아래 GitHub API를 호출하도록 등록하세요.

```
POST https://api.github.com/repos/<owner>/<repo>/actions/workflows/update-data.yml/dispatches
Authorization: Bearer <personal access token, repo 권한>
Content-Type: application/json

{ "ref": "master" }
```

전시 목록(각 기관 소스)과 관람 후기 갱신이 **같은 워크플로우, 같은 트리거 한 번에 같이 돕니다** — 그래서 두 주기가 항상 일치합니다. `NAVER_API_HUB_CLIENT_ID`/`NAVER_API_HUB_CLIENT_SECRET` 시크릿이 등록돼 있지 않으면 후기 갱신 스텝만 자동으로 건너뜁니다(전시 목록 갱신은 그대로 진행).

후기 쪽은 이미 후기가 있는 전시를 재수집하지 않으므로, 워크플로우를 얼마나 자주 돌리든 네이버 API 호출량은 그 실행에서 새로 추가된 전시 수만큼만 발생합니다.

리포지토리 Settings → Secrets and variables → Actions에 `CULTURE_API_KEY`(국공립 기관 갱신), `NAVER_API_HUB_CLIENT_ID`, `NAVER_API_HUB_CLIENT_SECRET`(후기 갱신)을 등록하세요.

리포지토리 Settings → Secrets and variables → Actions에 `CULTURE_API_KEY`(국공립 기관 갱신)를 등록해야 해당 스텝이 동작합니다.

## 배포 (GitHub Pages)

Settings → Pages → Source를 "Deploy from a branch" → `main` / `/(root)`로 설정하면 별도 빌드 없이 그대로 배포됩니다.

## 아이폰에 앱처럼 설치하기

1. Safari로 배포된 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면 아이콘으로 실행하면 주소창 없이 전체화면 앱처럼 동작합니다.
