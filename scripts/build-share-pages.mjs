#!/usr/bin/env node
// 전시마다 공유용 작은 HTML(e/<id>.html)을 만든다.
//
// 카카오톡·메시지는 링크 미리보기를 그 주소 HTML의 og 태그로 그리는데, 앱은
// 페이지가 하나(index.html)라 어떤 전시를 보내도 앱 아이콘만 떴다. 정적 호스팅
// (GitHub Pages)에서는 주소마다 다른 HTML을 미리 만들어 두는 수밖에 없다.
// 각 페이지는 og 태그만 갖고 곧바로 앱(?e=<id>)으로 넘긴다.
//
// 지난 전시의 페이지는 지우지 않는다 — 이미 보낸 링크가 404가 되지 않도록.
// 사용법: node scripts/build-share-pages.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SITE = "https://taeminpark.github.io/seoul-art-exhibitions";

const escAttr = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// 미술관 이름 정리표는 앱(venues.js, 브라우저용 일반 스크립트)과 같은 것을 쓴다.
const { canonicalVenue } = vm.runInNewContext(
  (await readFile(path.join(ROOT, "venues.js"), "utf8")) + "\n;({ canonicalVenue })"
);
const dot = (iso) => iso.replace(/-/g, ".");

export function sharePageFile(id) {
  return `${String(id).replace(/[^A-Za-z0-9_-]/g, "_")}.html`;
}

export function sharePageHtml(e) {
  const appUrl = `../?e=${encodeURIComponent(e.id)}`;
  const desc = `${canonicalVenue(e.venueName, e.venue)} · ${dot(e.startDate)} ~ ${dot(e.endDate)}`;
  const image = e.poster || `${SITE}/icon-512.png`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${escAttr(e.title)} · Museum Week</title>
<meta name="description" content="${escAttr(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Museum Week" />
<meta property="og:title" content="${escAttr(e.title)}" />
<meta property="og:description" content="${escAttr(desc)}" />
<meta property="og:image" content="${escAttr(image)}" />
<meta property="og:url" content="${SITE}/e/${sharePageFile(e.id)}" />
<meta http-equiv="refresh" content="0; url=${escAttr(appUrl)}" />
<script>location.replace(${JSON.stringify(appUrl)});</script>
</head>
<body style="font-family:sans-serif;background:#e8e9e5;color:#1e1f1d">
<p><a href="${escAttr(appUrl)}">Museum Week에서 「${escAttr(e.title)}」 보기</a></p>
</body>
</html>
`;
}

async function main() {
  const exhibitions = JSON.parse(await readFile(path.join(ROOT, "data", "exhibitions.json"), "utf8"));
  const dir = path.join(ROOT, "e");
  await mkdir(dir, { recursive: true });
  for (const e of exhibitions) {
    await writeFile(path.join(dir, sharePageFile(e.id)), sharePageHtml(e), "utf8");
  }
  console.log(`공유 페이지 ${exhibitions.length}개를 e/에 썼습니다.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
