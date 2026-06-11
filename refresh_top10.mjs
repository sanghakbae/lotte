#!/usr/bin/env node
// 최근 10년 로또 1등 본번호 최다 출현 TOP10을 재집계하여 lotto.html에 반영하고 git push.
// 매주 월요일 launchd로 자동 실행됨.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const REPO = '/Users/mac/Tools/aaa';
const HTML = `${REPO}/lotto.html`;
const SRC = 'https://raw.githubusercontent.com/smok95/lotto/master/results/all.json';

function log(m){ console.log(`[${new Date().toISOString()}] ${m}`); }

// 1) 최신 당첨 데이터 다운로드
log('데이터 다운로드 중…');
const res = await fetch(SRC);
if(!res.ok){ log('다운로드 실패: '+res.status); process.exit(1); }
const data = await res.json();

// 2) 최근 10년 집계 (실행 시점 기준)
const now = new Date();
const cutoff = new Date(now.getFullYear()-10, now.getMonth(), now.getDate());
const recent = data.filter(d => new Date(d.date) >= cutoff);
const freq = new Map();
for(const d of recent) for(const n of d.numbers) freq.set(n,(freq.get(n)||0)+1);
const top10 = [...freq.entries()].sort((a,b)=> b[1]-a[1] || a[0]-b[0]).slice(0,10).map(e=>e[0]);
const top10sorted = [...top10].sort((a,b)=>a-b);

const first = recent[0], last = recent[recent.length-1];
log(`집계: ${recent.length}회차 (${first.draw_no}~${last.draw_no}) → TOP10=[${top10sorted.join(', ')}]`);

// 3) lotto.html 갱신
let html = readFileSync(HTML,'utf8');
const newComment = `// 최근 10년 최다 출현 TOP10 (${first.draw_no}~${last.draw_no}회 집계, 갱신: ${now.toISOString().slice(0,10)})`;
const newLine = `const TOP10 = [${top10sorted.join(', ')}];`;
html = html
  .replace(/\/\/ 최근 10년 최다 출현 TOP10[^\n]*/, newComment)
  .replace(/const TOP10 = \[[^\]]*\];/, newLine);
writeFileSync(HTML, html);

// 4) 변경 시에만 commit & push
const changed = execSync('git status --porcelain lotto.html',{cwd:REPO}).toString().trim();
if(!changed){ log('변경 없음 — 커밋 생략'); process.exit(0); }
execSync('git add lotto.html',{cwd:REPO});
execSync(`git -c user.name="sanghakbae" -c user.email="sanghakbae@users.noreply.github.com" commit -m "Weekly refresh: TOP10 [${top10sorted.join(', ')}]"`,{cwd:REPO});
execSync('git push origin main',{cwd:REPO});
log('✅ 갱신 + 푸시 완료');
