#!/usr/bin/env node
// 최근 10년 로또 데이터로 index.html의 TOP10(포함 횟수 포함)과 최근 당첨번호 10회를 갱신한다.
// git 작업은 하지 않음 — 로컬/CI(GitHub Actions) 양쪽에서 파일만 수정. 커밋·푸시는 호출측이 담당.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const HTML = join(ROOT, 'index.html');
const SRC = 'https://raw.githubusercontent.com/smok95/lotto/master/results/all.json';

function log(m){ console.log(`[${new Date().toISOString()}] ${m}`); }

// 1) 데이터 다운로드
log('데이터 다운로드 중…');
const res = await fetch(SRC);
if(!res.ok){ log('다운로드 실패: '+res.status); process.exit(1); }
const data = await res.json();

// 2) 최근 N년 집계 (실행 시점 기준)
const YEARS = 20;
const now = new Date();
const cutoff = new Date(now.getFullYear()-YEARS, now.getMonth(), now.getDate());
const recent = data.filter(d => new Date(d.date) >= cutoff);
const freq = new Map();
for(const d of recent) for(const n of d.numbers) freq.set(n,(freq.get(n)||0)+1);
const top10 = [...freq.entries()]
  .sort((a,b)=> b[1]-a[1] || a[0]-b[0])
  .slice(0,10)
  .map(([n,count])=>({n,count}));
const first = recent[0], last = recent[recent.length-1];
log(`집계: ${recent.length}회차 (${first.draw_no}~${last.draw_no}) → TOP10=${top10.map(t=>`${t.n}(${t.count})`).join(', ')}`);

// 3) 최근 1등 당첨번호 10회
const recent10 = data.slice(-10).reverse();

// 4) HTML 블록 구성
const dateStr = now.toISOString().slice(0,10);
const newComment = `// 최근 ${YEARS}년 최다 출현 TOP10 (${first.draw_no}~${last.draw_no}회 집계, 갱신: ${dateStr})`;
const top10Block = 'const TOP10 = [\n' +
  top10.map(t=>`  { n: ${t.n}, count: ${t.count} },`).join('\n') + '\n];';
const winsBlock = 'const RECENT_WINS = [\n' +
  recent10.map(w=>`  { no: ${w.draw_no}, date: "${w.date.slice(0,10)}", nums: [${w.numbers.join(',')}], bonus: ${w.bonus_no} },`).join('\n') +
  '\n];';

// 5) index.html 갱신
let html = readFileSync(HTML,'utf8');
html = html
  .replace(/\/\/ 최근 \d+년 최다 출현 TOP10[^\n]*/, newComment)
  .replace(/최근 \d+년간 1등에 포함된 횟수/g, `최근 ${YEARS}년간 1등에 포함된 횟수`)
  .replace(/const LAST_UPDATED = "[^"]*";/, `const LAST_UPDATED = "${dateStr}";`)
  .replace(/const TOP10 = \[[\s\S]*?\];/, top10Block)
  .replace(/const RECENT_WINS = \[[\s\S]*?\];/, winsBlock);
writeFileSync(HTML, html);
log('✅ index.html 갱신 완료');
